import { faker } from '@faker-js/faker';
import { Wallpaper, Category } from '../types';

// Categorías que coinciden con el diseño de la homepage
const categories = ['Cyberpunk', 'Digital Systems', 'Minimalist', 'Abstract', 'Nature', 'Dark'];

// URLs de wallpapers de ejemplo (usando placeholders diversos)
const getWallpaperUrl = (width: number, height: number, category: string) => {
  const colors = ['FF00FF', '00FF00', 'FFFF00', '00FFFF', 'FF0000', '000000'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return `https://img-wrapper.vercel.app/image?url=https://placehold.co/${width}x${height}/${color}/FFFFFF?text=${category.toUpperCase()}`;
};

// Seed faker for consistent results
faker.seed(123);

export const mockCategories: Category[] = categories.map(cat => ({
  id: cat.toLowerCase(),
  name: cat,
  count: 6 // Each category has 6 wallpapers
}));

// Generate wallpapers ensuring each category gets some
export const mockWallpapers: Wallpaper[] = (() => {
  const wallpapers: Wallpaper[] = [];
  const wallpapersPerCategory = 6; // 6 wallpapers per category

  categories.forEach(category => {
    for (let i = 0; i < wallpapersPerCategory; i++) {
      const width = faker.helpers.arrayElement([1920, 2560, 3840]);
      const height = faker.helpers.arrayElement([1080, 1440, 2160]);

      wallpapers.push({
        id: faker.string.uuid(),
        title: `${category} ${i + 1}`,
        description: `Beautiful ${category.toLowerCase()} wallpaper for your desktop`,
        category,
        url: getWallpaperUrl(width, height, category),
        alt_text: `${category} wallpaper`,
        width,
        height: height.toString(),
        file_size: faker.number.int({ min: 1000000, max: 5000000 }),
        format: 'webp' as const,
        created_at: faker.date.past().toISOString(),
        updated_at: faker.date.recent().toISOString(),
        downloads: faker.number.int({ min: 50, max: 50000 }),
        likes: faker.number.int({ min: 5, max: 5000 }),
        isLiked: false,
        is_featured: i === 0,
        tags: [category.toLowerCase(), 'wallpaper', 'hd']
      });
    }
  });

  return wallpapers;
})();

// Debug: Log categories to verify
console.log('Mock data categories:', [...new Set(mockWallpapers.map(w => w.category))]);
