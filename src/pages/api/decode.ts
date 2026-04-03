import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { PROMPT_IMAGE_ANALYSIS, PROMPT_VERSION } from '../../lib/promptImage';

export const prerender = false;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_RUNS_PER_WINDOW = 3;

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const POST: APIRoute = async ({ request, locals }) => {
  // Cloudflare environment variables are available in locals.runtime.env
  // @ts-ignore
  const runtime = locals.runtime;
  const env = runtime?.env || import.meta.env;

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile || !(imageFile instanceof Blob)) {
      return new Response(JSON.stringify({ error: 'No valid image provided' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      return new Response(JSON.stringify({ error: 'Unsupported file type' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ error: 'File too large (max 5MB)' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const arrayBuffer = await imageFile.arrayBuffer();

    // 1. Calculate Identity Key based on CF proxy IP
    const clientAddress = request.headers.get('cf-connecting-ip') || 'unknown';
    const identityKey = `ip_${clientAddress}`;
    
    const identityHashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(identityKey));
    const finalIdentityKey = Array.from(new Uint8Array(identityHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // 2. Hash Image
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // Supabase initialization
    const supabaseUrl = env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: 'Supabase credentials missing from Cloudflare environment variables' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Check Cache
    const { data: cachedResult } = await supabase
      .from('image_cache')
      .select('result_json')
      .eq('image_hash', hashHex)
      .eq('prompt_version', PROMPT_VERSION)
      .single();

    if (cachedResult && cachedResult.result_json) {
      return new Response(JSON.stringify({
        status: 'cached',
        result: cachedResult.result_json,
        message: 'Returning existing result for this image'
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 4. Check Quota
    const now = new Date();
    const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const { data: quotaRow } = await supabase
      .from('usage_windows')
      .select('successful_runs')
      .eq('identity_key', finalIdentityKey)
      .eq('window_start', windowStart)
      .maybeSingle();

    if (quotaRow && quotaRow.successful_runs >= MAX_RUNS_PER_WINDOW) {
      return new Response(JSON.stringify({
        error: 'You have reached your 3-analysis limit for today',
        status: 'quota_exceeded'
      }), { status: 429, headers: { 'Content-Type': 'application/json' } });
    }

    if (!quotaRow) {
      await supabase.from('usage_windows').insert({
        identity_key: finalIdentityKey,
        window_start: windowStart,
        successful_runs: 0
      });
    }

    const { data: jobData } = await supabase.from('analysis_jobs').insert({
      identity_key: finalIdentityKey,
      image_hash: hashHex,
      prompt_version: PROMPT_VERSION,
      status: 'processing'
    }).select('id').single();

    // 5. Call OpenRouter API
    const base64Image = arrayBufferToBase64(arrayBuffer);
    const openRouterKey = env.OPENROUTER_API_KEY || import.meta.env.OPENROUTER_API_KEY;

    if (!openRouterKey) {
      if (jobData) {
        await supabase.from('analysis_jobs').update({ status: 'failed', error_code: 'NO_AI_KEY' }).eq('id', jobData.id);
      }
      const availableKeys = env ? Object.keys(env).filter(k => !k.startsWith('ASSETS') && !k.startsWith('CF_')) : [];
      return new Response(JSON.stringify({ 
        error: 'OpenRouter credentials missing natively',
        available_env_keys: availableKeys,
        hint: 'If you added secrets in Cloudflare Pages, make sure you redeployed the app. If using Workers, use wrangler secret put OPENROUTER_API_KEY.'
      }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    try {
      const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'https://crackingwall.com',
          'X-Title': 'CrackingWall Analysis'
        },
        body: JSON.stringify({
          model: 'qwen/qwen2.5-vl-32b-instruct',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: PROMPT_IMAGE_ANALYSIS },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${imageFile.type};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          response_format: { type: 'json_object' }
        })
      });

      const responseText = await aiResponse.text();
      let aiData;
      try {
        aiData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        throw new Error(`AI response was not valid JSON: ${responseText.substring(0, 100)}`);
      }

      if (!aiResponse.ok) {
        throw new Error(aiData.error?.message || `AI request failed with status ${aiResponse.status}`);
      }

      if (!aiData.choices || !aiData.choices[0]) {
        throw new Error("AI returned no results. Data: " + JSON.stringify(aiData));
      }

      const generatedText = aiData.choices[0].message.content;
      const parsedJson = JSON.parse(generatedText);

      await supabase.rpc('increment_successful_runs', {
        p_identity_key: finalIdentityKey,
        p_window_start: windowStart
      });

      const runs = (quotaRow ? quotaRow.successful_runs : 0) + 1;
      await supabase.from('usage_windows')
        .update({ successful_runs: runs })
        .eq('identity_key', finalIdentityKey)
        .eq('window_start', windowStart);

      await supabase.from('image_cache').insert({
        image_hash: hashHex,
        prompt_version: PROMPT_VERSION,
        result_json: parsedJson
      });

      if (jobData) {
        await supabase.from('analysis_jobs').update({
          status: 'completed',
          result_json: parsedJson,
          finished_at: new Date().toISOString()
        }).eq('id', jobData.id);
      }

      return new Response(JSON.stringify({
        status: 'completed',
        result: parsedJson
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (err: any) {
      if (jobData) {
        await supabase.from('analysis_jobs').update({
          status: 'failed',
          error_code: err.message || 'AI_ERROR',
          finished_at: new Date().toISOString()
        }).eq('id', jobData.id);
      }
      return new Response(JSON.stringify({ 
        error: 'Analysis failed: ' + err.message,
        diagnostic: {
          step: "ai_fetch_processing",
          timestamp: new Date().toISOString()
        }
      }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

  } catch (err: any) {
    return new Response(JSON.stringify({ 
      error: 'Critical serverless error: ' + err.message,
      diagnostic: {
        step: "initialize_request",
        timestamp: new Date().toISOString()
      }
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
