export const prerender = true;

import type { APIRoute } from 'astro';
import { WallpaperService } from '../services/wallpaperService';

const SITE = 'https://crakingculturewallpaperr.xyz';

export const GET: APIRoute = async () => {
  const wallpapers = await WallpaperService.getAllWallpapers();

  const urls = wallpapers.map((w) => {
    const titleSlug = (w.title || 'unnamed').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const slug = `${titleSlug}-${w.id}`;
    const category = (w.category || 'uncategorized').toLowerCase();
    const pageUrl = `${SITE}/${category}/${slug}/`;
    const lastmod = w.updated_at || w.created_at || new Date().toISOString();

    const title = w.title.replace(/[\r\n]+/g, '').trim();
    const captionParts = [w.alt_text, w.tags?.join(', ')].filter(Boolean);
    const caption = captionParts.join(' — ');

    return `  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${lastmod.split('T')[0]}</lastmod>
    <image:image>
      <image:loc>${w.url}</image:loc>
      <image:title>${escapeXml(title)}</image:title>${caption ? `
      <image:caption>${escapeXml(caption)}</image:caption>` : ''}
    </image:image>
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
