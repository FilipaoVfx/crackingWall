import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Download, Eye } from 'lucide-react';
import { Wallpaper } from '../types';

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  onLike: (id: string) => void;
  onDownload: (id: string) => void;
  onView: (wallpaper: Wallpaper) => void;
}

export const WallpaperCard: React.FC<WallpaperCardProps> = ({
  wallpaper,
  onLike,
  onDownload,
  onView
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, x: -4 }}
      className="bg-brutal-white border-4 border-brutal-black shadow-brutal group relative"
    >
      <div className="relative overflow-hidden">
        <img
          src={wallpaper.url}
          alt={wallpaper.title}
          className="w-full h-60 md:h-48 object-cover"
          loading="lazy"
        />

        {/* Overlay con botones */}
        <div className="absolute inset-0 bg-brutal-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onView(wallpaper);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label={`Ver imagen completa de ${wallpaper.title}`}
              title={`Ver ${wallpaper.title} en tamaño completo`}
              className="p-3 bg-brutal-white border-3 border-brutal-black shadow-brutal-sm hover:bg-brutal-yellow transition-colors cursor-pointer"
            >
              <Eye className="w-5 h-5 text-brutal-black" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onLike(wallpaper.id);
              }}
              aria-label={wallpaper.isLiked ? `Quitar me gusta de ${wallpaper.title}` : `Dar me gusta a ${wallpaper.title}`}
              title={wallpaper.isLiked ? 'Quitar me gusta' : 'Dar me gusta'}
              className={`p-3 border-3 border-brutal-black shadow-brutal-sm transition-colors ${wallpaper.isLiked
                ? 'bg-brutal-pink text-brutal-black'
                : 'bg-brutal-white text-brutal-black hover:bg-brutal-pink'
                }`}
            >
              <Heart className={`w-5 h-5 ${wallpaper.isLiked ? 'fill-current' : ''}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDownload(wallpaper.id);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label={`Descargar imagen: ${wallpaper.title} (${wallpaper.width}×${wallpaper.height})`}
              title={`Descargar ${wallpaper.title}`}
              className="p-3 bg-brutal-white border-3 border-brutal-black shadow-brutal-sm hover:bg-brutal-yellow transition-colors cursor-pointer"
            >
              <Download className="w-5 h-5 text-brutal-black" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Info del wallpaper */}
      <div className="p-4">
        <h3 className="font-brutal font-black text-lg text-brutal-black uppercase truncate">
          {wallpaper.title}
        </h3>

        <div className="flex items-center justify-between mt-2">
          <a href={`/${wallpaper.category.toLowerCase()}/`} className="px-2 py-1 bg-brutal-black text-brutal-white text-xs font-brutal font-bold uppercase hover:bg-brutal-accent transition-colors">
            {wallpaper.category}
          </a>
          <span className="text-sm font-brutal font-bold text-brutal-black">
            {wallpaper.width}×{wallpaper.height}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3 text-sm font-brutal font-bold text-brutal-black">
          <div className="flex items-center space-x-1">
            <Heart className="w-4 h-4" />
            <span>{wallpaper.likes.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Download className="w-4 h-4" />
            <span>{wallpaper.downloads.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
