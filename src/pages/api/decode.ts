import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { PROMPT_IMAGE_ANALYSIS, PROMPT_VERSION } from '../../lib/promptImage';

export const prerender = false;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const QUOTA_ANON = 2;   // anonymous users: 2 per day (by IP)
const QUOTA_AUTH = 6;   // authenticated users: 6 per day (by user_id)

type DecodeEnv = {
  OPENROUTER_API_KEY: string;
  PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

class DecodeApiError extends Error {
  status: number;
  stage: string;
  code: string;
  details?: string;

  constructor(params: {
    message: string;
    status: number;
    stage: string;
    code: string;
    details?: string;
  }) {
    super(params.message);
    this.name = 'DecodeApiError';
    this.status = params.status;
    this.stage = params.stage;
    this.code = params.code;
    this.details = params.details;
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  // Chunked conversion — avoids O(n²) string concat that crashes Cloudflare Workers
  const CHUNK_SIZE = 8192;
  const chunks: string[] = [];

  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    chunks.push(String.fromCharCode(...chunk));
  }

  return btoa(chunks.join(''));
}

function resolveDecodeEnv(
  locals: App.Locals
): { env: DecodeEnv | null; missing: string[]; source: string } {
  // Priority 1: Cloudflare runtime bindings (production on CF Pages/Workers)
  const runtimeEnv = locals?.runtime?.env;

  // Priority 2: Astro env (works in dev via .env / .dev.vars)
  // Priority 3: process.env fallback (Node-based runtimes)
  const safeProcessEnv = typeof process !== 'undefined' ? process.env : {};

  const keys: (keyof DecodeEnv)[] = [
    'OPENROUTER_API_KEY',
    'PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const resolved: Record<string, string | undefined> = {};
  const sources: Record<string, string> = {};

  for (const key of keys) {
    if (runtimeEnv?.[key]) {
      resolved[key] = runtimeEnv[key];
      sources[key] = 'cloudflare_runtime';
    } else if (import.meta.env[key]) {
      resolved[key] = import.meta.env[key];
      sources[key] = 'import_meta';
    } else if (safeProcessEnv[key]) {
      resolved[key] = safeProcessEnv[key];
      sources[key] = 'process_env';
    }
  }

  const missing = keys.filter((k) => !resolved[k]);
  const source = sources['OPENROUTER_API_KEY'] || 'unknown';

  if (missing.length > 0) {
    return { env: null, missing, source };
  }

  return { env: resolved as DecodeEnv, missing: [], source };
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const requestId =
    request.headers.get('cf-ray') ||
    request.headers.get('x-request-id') ||
    crypto.randomUUID();

  let jobId: string | null = null;

  try {
    const { env, missing, source } = resolveDecodeEnv(locals);

    if (!env) {
      throw new DecodeApiError({
        message: `Missing required env variables: ${missing.join(', ')}`,
        status: 500,
        stage: 'resolve_environment',
        code: 'MISSING_ENV',
        details: `source=${source}`,
      });
    }

    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile || !(imageFile instanceof Blob)) {
      throw new DecodeApiError({
        message: 'No valid image provided',
        status: 400,
        stage: 'validate_input',
        code: 'INVALID_IMAGE',
      });
    }

    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      throw new DecodeApiError({
        message: 'Unsupported file type',
        status: 400,
        stage: 'validate_input',
        code: 'UNSUPPORTED_MIME',
        details: `mime=${imageFile.type}`,
      });
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      throw new DecodeApiError({
        message: 'File too large (max 5MB)',
        status: 400,
        stage: 'validate_input',
        code: 'FILE_TOO_LARGE',
      });
    }

    const arrayBuffer = await imageFile.arrayBuffer();

    const supabase = createClient(
      env.PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    // --- Resolve identity: authenticated user_id or hashed IP ---
    let userId: string | null = null;
    let identityType: 'user' | 'ip' = 'ip';
    let maxRuns = QUOTA_ANON;

    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (accessToken) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (!authError && user) {
        userId = user.id;
        identityType = 'user';
        maxRuns = QUOTA_AUTH;
      }
    }

    // For auth users: identity = user_id. For anon: identity = hashed IP.
    let finalIdentityKey: string;
    if (userId) {
      finalIdentityKey = userId;
    } else {
      const clientAddress =
        request.headers.get('cf-connecting-ip') ||
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        'unknown';
      const identityHashBuffer = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(`ip_${clientAddress}`)
      );
      finalIdentityKey = Array.from(new Uint8Array(identityHashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }

    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // --- Cache lookup ---
    const { data: cachedResult, error: cacheError } = await supabase
      .from('image_cache')
      .select('result_json')
      .eq('image_hash', hashHex)
      .eq('prompt_version', PROMPT_VERSION)
      .maybeSingle();

    if (cacheError) {
      throw new DecodeApiError({
        message: 'Failed to read image cache',
        status: 500,
        stage: 'cache_lookup',
        code: 'SUPABASE_CACHE_READ',
        details: cacheError.message,
      });
    }

    if (cachedResult?.result_json) {
      return jsonResponse({
        status: 'cached',
        requestId,
        result: cachedResult.result_json,
        message: 'Returning existing result for this image',
      });
    }

    // --- Quota check ---
    const now = new Date();
    const windowStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).toISOString();

    const { data: quotaRow, error: quotaError } = await supabase
      .from('usage_windows')
      .select('successful_runs')
      .eq('identity_key', finalIdentityKey)
      .eq('window_start', windowStart)
      .maybeSingle();

    if (quotaError) {
      throw new DecodeApiError({
        message: 'Failed to check usage quota',
        status: 500,
        stage: 'quota_check',
        code: 'SUPABASE_QUOTA_READ',
        details: quotaError.message,
      });
    }

    if (quotaRow && quotaRow.successful_runs >= maxRuns) {
      return jsonResponse(
        {
          error: identityType === 'user'
            ? `You have reached your ${QUOTA_AUTH}-analysis limit for today`
            : `You have reached your ${QUOTA_ANON}-analysis limit for today. Sign in for ${QUOTA_AUTH} daily analyses.`,
          status: 'quota_exceeded',
          requestId,
          quota: { limit: maxRuns, used: quotaRow.successful_runs, type: identityType },
        },
        429
      );
    }

    const { data: jobData, error: jobInsertError } = await supabase
      .from('analysis_jobs')
      .insert({
        identity_key: finalIdentityKey,
        image_hash: hashHex,
        prompt_version: PROMPT_VERSION,
        status: 'processing',
      })
      .select('id')
      .single();

    if (jobInsertError || !jobData?.id) {
      throw new DecodeApiError({
        message: 'Failed to create analysis job',
        status: 500,
        stage: 'job_create',
        code: 'SUPABASE_JOB_CREATE',
        details: jobInsertError?.message,
      });
    }

    jobId = jobData.id;

    const base64Image = arrayBufferToBase64(arrayBuffer);

    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://crackingwall.com',
        'X-Title': 'CrackingWall Analysis',
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
                  url: `data:${imageFile.type};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const responseText = await aiResponse.text();

    let aiData: any = {};
    if (responseText) {
      try {
        aiData = JSON.parse(responseText);
      } catch {
        throw new DecodeApiError({
          message: 'OpenRouter did not return valid JSON',
          status: 502,
          stage: 'openrouter_parse',
          code: 'OPENROUTER_BAD_JSON',
          details: responseText.slice(0, 200),
        });
      }
    }

    if (!aiResponse.ok) {
      const upstreamMessage =
        aiData?.error?.message ||
        `OpenRouter request failed with status ${aiResponse.status}`;

      throw new DecodeApiError({
        message:
          aiResponse.status === 401
            ? 'OpenRouter rejected the API key (401). Verify OPENROUTER_API_KEY in Cloudflare secrets.'
            : upstreamMessage,
        status: aiResponse.status === 429 ? 429 : 502,
        stage: 'openrouter_request',
        code:
          aiResponse.status === 401
            ? 'OPENROUTER_UNAUTHORIZED'
            : 'OPENROUTER_HTTP_ERROR',
      });
    }

    const generatedText = aiData?.choices?.[0]?.message?.content;
    if (!generatedText || typeof generatedText !== 'string') {
      throw new DecodeApiError({
        message: 'OpenRouter returned an empty completion payload',
        status: 502,
        stage: 'openrouter_response',
        code: 'OPENROUTER_EMPTY_CHOICE',
      });
    }

    let parsedJson: any;
    try {
      parsedJson = JSON.parse(generatedText);
    } catch {
      throw new DecodeApiError({
        message: 'OpenRouter completion was not valid JSON',
        status: 502,
        stage: 'openrouter_response_parse',
        code: 'OPENROUTER_INVALID_OUTPUT_JSON',
        details: generatedText.slice(0, 200),
      });
    }

    // Atomic upsert: creates row if missing, increments if exists
    const { error: runsRpcError } = await supabase.rpc('increment_successful_runs', {
      p_identity_key: finalIdentityKey,
      p_window_start: windowStart,
      p_user_id: userId,
      p_identity_type: identityType,
    });

    if (runsRpcError) {
      throw new DecodeApiError({
        message: 'Failed to increment successful runs',
        status: 500,
        stage: 'quota_increment',
        code: 'SUPABASE_QUOTA_INCREMENT',
        details: runsRpcError.message,
      });
    }

    const { error: cacheInsertError } = await supabase.from('image_cache').insert({
      image_hash: hashHex,
      prompt_version: PROMPT_VERSION,
      result_json: parsedJson,
    });

    if (cacheInsertError) {
      throw new DecodeApiError({
        message: 'Failed to persist image cache',
        status: 500,
        stage: 'cache_write',
        code: 'SUPABASE_CACHE_WRITE',
        details: cacheInsertError.message,
      });
    }

    const { error: completeJobError } = await supabase
      .from('analysis_jobs')
      .update({
        status: 'completed',
        result_json: parsedJson,
        finished_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (completeJobError) {
      throw new DecodeApiError({
        message: 'Analysis completed but failed to update job status',
        status: 500,
        stage: 'job_complete',
        code: 'SUPABASE_JOB_COMPLETE',
        details: completeJobError.message,
      });
    }

    return jsonResponse({
      status: 'completed',
      requestId,
      result: parsedJson,
    });
  } catch (err: any) {
    const isKnownError = err instanceof DecodeApiError;
    const status = isKnownError ? err.status : 500;

    if (jobId) {
      const { env } = resolveDecodeEnv(locals);
      if (env) {
        const supabase = createClient(
          env.PUBLIC_SUPABASE_URL,
          env.SUPABASE_SERVICE_ROLE_KEY
        );

        await supabase
          .from('analysis_jobs')
          .update({
            status: 'failed',
            error_code: isKnownError ? err.code : 'UNHANDLED_EXCEPTION',
            finished_at: new Date().toISOString(),
          })
          .eq('id', jobId);
      }
    }

    return jsonResponse(
      {
        error: isKnownError ? err.message : 'Critical serverless error',
        requestId,
        diagnostic: {
          stage: isKnownError ? err.stage : 'unhandled_exception',
          code: isKnownError ? err.code : 'UNHANDLED_EXCEPTION',
          details: isKnownError ? err.details : String(err?.message || err),
          stack: !isKnownError ? String(err?.stack || '').slice(0, 300) : undefined,
          runtimeEnvAvailable: !!locals?.runtime?.env,
          runtimeEnvKeys: Object.keys(locals?.runtime?.env || {}),
          timestamp: new Date().toISOString(),
        },
      },
      status
    );
  }
};
