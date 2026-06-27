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
  const overlayBtn =
    'grid h-10 w-10 place-items-center border-2 border-white/20 bg-black/60 text-white shadow-brutal-sm transition-colors cursor-pointer';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden border-2 border-black bg-brutal-dark-bg shadow-brutal-sm transition-shadow hover:shadow-neon-purple"
    >
      <div className="relative overflow-hidden border-b-2 border-black">
        <img
          src={wallpaper.url}
          alt={wallpaper.alt_text || wallpaper.title}
          className="h-60 w-full object-cover transition-transform duration-300 group-hover:scale-105 md:h-48"
          loading="lazy"
          decoding="async"
          width={wallpaper.width || 400}
          height={wallpaper.height || 225}
        />

        {/* Hover action buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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
            className={`${overlayBtn} hover:border-brutal-neon-cyan hover:text-brutal-neon-cyan`}
          >
            <Eye className="h-5 w-5" />
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
            className={
              wallpaper.isLiked
                ? 'grid h-10 w-10 place-items-center border-2 border-black bg-brutal-neon-pink text-black shadow-brutal-sm'
                : `${overlayBtn} hover:border-brutal-neon-pink hover:text-brutal-neon-pink`
            }
          >
            <Heart className={`h-5 w-5 ${wallpaper.isLiked ? 'fill-current' : ''}`} />
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
            className={`${overlayBtn} hover:border-brutal-neon-green hover:text-brutal-neon-green`}
          >
            <Download className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="truncate font-brutal text-base font-black uppercase tracking-wide text-white">
          {wallpaper.title}
        </h3>

        <div className="mt-2 flex items-center justify-between">
          <a
            href={`/${wallpaper.category.toLowerCase()}/`}
            className="border border-brutal-neon-cyan/30 bg-brutal-neon-cyan/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-brutal-neon-cyan transition-colors hover:bg-brutal-neon-cyan/20"
          >
            {wallpaper.category}
          </a>
          <span className="font-mono text-[11px] text-gray-500">
            {wallpaper.width}×{wallpaper.height}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-brutal-neon-pink" />
            <span>{wallpaper.likes.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5 text-brutal-neon-green" />
            <span>{wallpaper.downloads.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
