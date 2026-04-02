-- Migration for Image Analysis Feature

-- Table: usage_windows (Quota)
CREATE TABLE IF NOT EXISTS public.usage_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_key text NOT NULL,
  window_start timestamptz NOT NULL,
  successful_runs int DEFAULT 0,
  failed_runs int DEFAULT 0,
  active_jobs int DEFAULT 0,
  last_seen_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT usage_windows_identity_window_unique UNIQUE (identity_key, window_start)
);

-- Table: analysis_jobs
CREATE TABLE IF NOT EXISTS public.analysis_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_key text NOT NULL,
  image_hash text NOT NULL,
  prompt_version text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'rate_limited', 'quota_exceeded')),
  storage_path text,
  result_json jsonb,
  error_code text,
  token_cost_estimate int,
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz
);

-- Table: image_cache
CREATE TABLE IF NOT EXISTS public.image_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_hash text NOT NULL,
  prompt_version text NOT NULL,
  result_json jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz DEFAULT now(),
  CONSTRAINT image_cache_hash_prompt_unique UNIQUE (image_hash, prompt_version)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_windows_identity ON public.usage_windows(identity_key);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_identity ON public.analysis_jobs(identity_key);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_hash ON public.analysis_jobs(image_hash);
CREATE INDEX IF NOT EXISTS idx_image_cache_hash ON public.image_cache(image_hash);

-- Storage bucket for temporary images (if not exist, though usually created via Dashboard or other means)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('image-analysis-temp', 'image-analysis-temp', false) ON CONFLICT DO NOTHING;

-- RLS Policies
ALTER TABLE public.usage_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_cache ENABLE ROW LEVEL SECURITY;

-- Allow anonymous edge functions or service role to manage these completely
CREATE POLICY "Enable all for service roles on usage_windows" ON public.usage_windows FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for service roles on analysis_jobs" ON public.analysis_jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for service roles on image_cache" ON public.image_cache FOR ALL USING (true) WITH CHECK (true);
