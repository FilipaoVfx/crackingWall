import { createClient } from '@supabase/supabase-js';

// Dedicated client for the image analysis module to avoid mixing with main app logic
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
// the analysis module ideally should use a service role key to manage quota/jobs securely,
// but for an MVP frontend-to-backend flow, edge functions or server-side API endpoints can use the anon key if RLS allows,
// OR we can use SUPABASE_SERVICE_ROLE_KEY from env in the API endpoint.
// In this frontend file, we can also use anon key to create jobs if RLS allows insert.
// Wait, the API endpoint is doing the job creation. The API endpoint runs in Node/Cloudflare and should use the Service Role key.
// Let's create a client builder here.

export const getAnalysisSupabaseAdmin = () => {
    const isNode = typeof process !== 'undefined';
    const url = (import.meta as any).env.PUBLIC_SUPABASE_URL || (isNode ? process.env.PUBLIC_SUPABASE_URL : undefined);
    const key = (import.meta as any).env.SUPABASE_SERVICE_ROLE_KEY || (import.meta as any).env.PUBLIC_SUPABASE_ANON_KEY || (isNode ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY) : undefined);
    
    if (!key) {
        console.warn('Analysis Module: Supabase Keys missing!');
    }
    return createClient(url || '', key || '', {
        auth: {
            persistSession: false
        }
    });
};

export type UsageWindow = {
    id: string;
    identity_key: string;
    window_start: string;
    successful_runs: number;
    failed_runs: number;
    active_jobs: number;
    last_seen_at?: string;
};

export type AnalysisJob = {
    id: string;
    identity_key: string;
    image_hash: string;
    prompt_version: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'rate_limited' | 'quota_exceeded';
    storage_path?: string;
    result_json?: any;
    error_code?: string;
    token_cost_estimate?: number;
    created_at?: string;
};

export type ImageCache = {
    id: string;
    image_hash: string;
    prompt_version: string;
    result_json: any;
    created_at?: string;
};
