// Shared slug/URL helpers for wallpapers so every link and the route itself
// stay in sync. Dedupes the id suffix when the id already equals the title
// slug (our generated art) → clean URLs; keeps the suffix for legacy data
// whose id differs from the title.

type SlugParts = { title?: string; id: string | number; category?: string };

export function wallpaperSlug(w: SlugParts): string {
  const titleSlug = (w.title || 'unnamed')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return titleSlug === String(w.id) ? titleSlug : `${titleSlug}-${w.id}`;
}

export function wallpaperPath(w: SlugParts): string {
  return `/${(w.category || 'uncategorized').toLowerCase()}/${wallpaperSlug(w)}/`;
}
