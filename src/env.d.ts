/// <reference types="astro/client" />

type CloudflareEnv = {
  OPENROUTER_API_KEY: string;
  PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  [key: string]: string | undefined;
};

type Runtime = import('@astrojs/cloudflare').Runtime<CloudflareEnv>;

declare namespace App {
  interface Locals extends Runtime {}
}
