import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Wallpaper } from '../types';
import { WallpaperGrid } from '../components/WallpaperGrid';
import { CategoryFilter } from '../components/CategoryFilter';

interface WallpapersPageProps {
  wallpapers: Wallpaper[];
  loading: boolean;
  error: string | null;
  onWallpaperClick: (wallpaper: Wallpaper) => void;
  onLike: (id: string) => Promise<void>;
  onDownload: (id: string) => Promise<void>;
}

const WallpapersPage: React.FC<WallpapersPageProps> = ({
  wallpapers,
  loading,
  error,
  onWallpaperClick,
  onLike,
  onDownload
}) => {
  // Get unique categories from wallpapers
  const categories = React.useMemo(() => {
    const categoryMap = new Map<string, number>();
    wallpapers.forEach(wallpaper => {
      if (wallpaper.category) {
        categoryMap.set(wallpaper.category, (categoryMap.get(wallpaper.category) || 0) + 1);
      }
    });

    return Array.from(categoryMap.entries()).map(([name, count]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      count
    }));
  }, [wallpapers]);

  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Filter wallpapers based on selected category and search query
  const filteredWallpapers = React.useMemo(() => {
    return wallpapers.filter(wallpaper => {
      const matchesCategory = !selectedCategory || wallpaper.category === selectedCategory;
      const matchesSearch = !searchQuery ||
        (wallpaper.title && wallpaper.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (wallpaper.category && wallpaper.category.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [wallpapers, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-brutal-white">
      <Helmet>
        <title>Wallpapers | CrakingWall</title>
        <meta name="description" content="Explore our curated collection of professional digital topographies and high-fidelity tech backgrounds." />
      </Helmet>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-brutal-black">Premium Digital Backgrounds</h1>

        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brutal-black"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        ) : filteredWallpapers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-brutal-gray">No wallpapers found. Try a different search or category.</p>
          </div>
        ) : (
          <WallpaperGrid
            wallpapers={filteredWallpapers}
            onView={onWallpaperClick}
            onLike={onLike}
            onDownload={onDownload}
          />
        )}
      </main>
      <footer className="py-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} CrakingWall. All wallpapers are free to download and use.</p>
      </footer>
    </div>
  );
};

export default WallpapersPage;
