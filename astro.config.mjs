import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://crakingculturewallpaperr.xyz', // Replace with actual domain
  trailingSlash: 'always',
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false, // We'll import our own base styles
    }),
    sitemap(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
  output: 'server',
  adapter: cloudflare({
    imageService: 'compile',
    mode: 'advanced'
  }),
  build: {
    assets: 'assets',
  }
});
