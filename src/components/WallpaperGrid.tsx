import React from 'react';
import { motion } from 'framer-motion';
import { WallpaperCard } from './WallpaperCard';
import { Wallpaper } from '../types';

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  onLike: (id: string) => void;
  onDownload: (id: string) => void;
  onView: (wallpaper: Wallpaper) => void;
}

export const WallpaperGrid: React.FC<WallpaperGridProps> = ({
  wallpapers,
  onLike,
  onDownload,
  onView
}) => {
  if (wallpapers.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-brutal-yellow border-4 border-brutal-black p-8 inline-block shadow-brutal">
          <h3 className="text-3xl font-brutal font-black text-brutal-black uppercase">
            NO SE ENCONTRARON WALLPAPERS
          </h3>
          <p className="mt-2 font-brutal font-bold text-brutal-black">
            Prueba con otro término de búsqueda o categoría
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-6"
    >
      {wallpapers.map((wallpaper, index) => (
        <motion.div
          key={wallpaper.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <WallpaperCard
            wallpaper={wallpaper}
            onLike={onLike}
            onDownload={onDownload}
            onView={onView}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
