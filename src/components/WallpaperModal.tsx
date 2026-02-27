import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Heart, ExternalLink } from 'lucide-react';
import { Wallpaper } from '../types';
import { BrutalButton } from './BrutalButton';

interface WallpaperModalProps {
  wallpaper: Wallpaper | null;
  isOpen: boolean;
  onClose: () => void;
  onLike: (id: string) => void;
  onDownload: (id: string) => void;
}

export const WallpaperModal: React.FC<WallpaperModalProps> = ({
  wallpaper,
  isOpen,
  onClose,
  onLike,
  onDownload
}) => {
  if (!wallpaper) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-brutal-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-brutal-white border-6 border-brutal-black shadow-brutal-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-4 border-brutal-black bg-brutal-yellow">
              <h2 className="text-3xl font-brutal font-black text-brutal-black uppercase">
                {wallpaper.title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 bg-brutal-black text-brutal-white hover:bg-brutal-pink hover:text-brutal-black transition-colors border-3 border-brutal-black"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Image */}
            <div className="p-6">
              <img
                src={wallpaper.url}
                alt={wallpaper.title}
                className="w-full h-auto max-h-96 object-cover border-4 border-brutal-black"
              />
            </div>

            {/* Info and Actions */}
            <div className="p-6 border-t-4 border-brutal-black bg-brutal-lime">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-brutal font-black text-brutal-black uppercase mb-4">
                    DETALLES
                  </h3>
                  <div className="space-y-2 font-brutal font-bold text-brutal-black">
                    <div>CATEGORÍA: {wallpaper.category}</div>

                    <div>LIKES: {wallpaper.likes.toLocaleString()}</div>
                    <div>DESCARGAS: {wallpaper.downloads.toLocaleString()}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-brutal font-black text-brutal-black uppercase mb-4">
                    ACCIONES
                  </h3>
                  <div className="space-y-3">
                    <BrutalButton
                      variant="primary"
                      onClick={() => onDownload(wallpaper.id)}
                      className="w-full"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Download className="w-5 h-5" />
                        <span>DESCARGAR</span>
                      </div>
                    </BrutalButton>

                    <BrutalButton
                      variant={wallpaper.isLiked ? "accent" : "secondary"}
                      onClick={() => onLike(wallpaper.id)}
                      className="w-full"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Heart className={`w-5 h-5 ${wallpaper.isLiked ? 'fill-current' : ''}`} />
                        <span>{wallpaper.isLiked ? 'QUITAR LIKE' : 'DAR LIKE'}</span>
                      </div>
                    </BrutalButton>

                    <BrutalButton
                      variant="secondary"
                      onClick={() => window.open(wallpaper.url, '_blank')}
                      className="w-full"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <ExternalLink className="w-5 h-5" />
                        <span>VER ORIGINAL</span>
                      </div>
                    </BrutalButton>

                    <a
                      href={`/${wallpaper.category.toLowerCase()}/${wallpaper.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${wallpaper.id}/`}
                      className="w-full inline-block"
                    >
                      <BrutalButton variant="secondary" className="w-full">
                        <div className="flex items-center justify-center space-x-2">
                          <span>VER PAGINA DETALLE</span>
                        </div>
                      </BrutalButton>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
