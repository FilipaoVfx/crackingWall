# Deployment Instructions

## Cloudflare Pages
This project is configured for Cloudflare Pages (Static).

1. **Connect GitHub/GitLab**: Link your repository to Cloudflare Pages.
2. **Build Settings**:
   - **Framework Preset**: Astro
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables**:
   - Add your Supabase credentials in the Cloudflare Pages dashboard:
     - `PUBLIC_SUPABASE_URL`
     - `PUBLIC_SUPABASE_ANON_KEY`

## Vercel
1. **Import Project**: Select your repository.
2. **Framework Preset**: Astro (Vercel detects it automatically).
3. **Build Command**: `npm run build` (or default).
4. **Output Directory**: `dist` (default).
5. **Environment Variables**:
   - Add `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`.

## Local Development
- Run `npm run dev` to start the Astro dev server.
- Run `npm run build` to generate the production build in `./dist`.
- Run `npm run preview` to preview the built site.
