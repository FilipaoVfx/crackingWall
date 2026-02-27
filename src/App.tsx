import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';


import { Wallpaper } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { WallpaperService } from '@/services/wallpaperService';
import { mockWallpapers } from '@/data/mockData';
import { Layout } from '@/components/layout/Layout';
import WallpapersPage from '@/pages/_WallpapersPage';
import HomePage from '@/pages/_HomePage';
import { AuthModal } from '@/components/AuthModal';
import { WallpaperModal } from '@/components/WallpaperModal';

const App: React.FC = () => {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(mockWallpapers);
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const loadWallpapers = async () => {
      setLoading(true);
      setError(null);

      try {
        let supabaseWallpapers: Wallpaper[];

        if (user) {
          supabaseWallpapers = await WallpaperService.getWallpapersForUser(user.id);
        } else {
          supabaseWallpapers = await WallpaperService.getAllWallpapers();
        }

        if (supabaseWallpapers && supabaseWallpapers.length > 0) {
          setWallpapers(supabaseWallpapers);
        } else {
          console.log('No wallpapers in Supabase, using mock data');
          setWallpapers(mockWallpapers);
        }
      } catch (error) {
        console.error('Error loading wallpapers:', error);
        setError('Error loading wallpapers');
        setWallpapers(mockWallpapers);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadWallpapers();
    }
  }, [user, authLoading]);

  const handleLike = async (id: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const wallpaper = wallpapers.find(w => w.id === id);
      if (!wallpaper) return;

      const newIsLiked = !wallpaper.isLiked;
      const newLikes = newIsLiked ? wallpaper.likes + 1 : wallpaper.likes - 1;

      setWallpapers(prev =>
        prev.map(w =>
          w.id === id
            ? { ...w, isLiked: newIsLiked, likes: newLikes }
            : w
        )
      );

      if (selectedWallpaper?.id === id) {
        setSelectedWallpaper(prev => prev ? { ...prev, isLiked: newIsLiked, likes: newLikes } : null);
      }

      if (user) {
        await WallpaperService.updateWallpaperLike(id, newIsLiked, user.id);
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleWallpaperClick = (wallpaper: Wallpaper) => {
    setSelectedWallpaper(wallpaper);
    setIsWallpaperModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsWallpaperModalOpen(false);
    setSelectedWallpaper(null);
  };

  const handleDownload = async (id: string) => {
    const wallpaper = wallpapers.find(w => w.id === id);
    if (!wallpaper) return;

    try {
      const newDownloads = wallpaper.downloads + 1;
      setWallpapers(prev =>
        prev.map(w =>
          w.id === id ? { ...w, downloads: newDownloads } : w
        )
      );

      if (user) {
        await WallpaperService.incrementWallpaperDownloads(id);
      }

      const response = await fetch(wallpaper.url);
      if (!response.ok) throw new Error('Network response was not ok');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wallpaper-${id}.${wallpaper.format || 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error downloading wallpaper via fetch, trying direct link:', error);
      // Fallback for CORS issues
      const a = document.createElement('a');
      a.href = wallpaper.url;
      a.target = '_blank';
      a.download = `wallpaper-${id}.${wallpaper.format || 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  return (
    <HelmetProvider>
      <Layout
        title="Tech Wallpapers & Cyberpunk Visuals | CrakingWall"
        description="Download and explore high-quality tech wallpapers, cyberpunk art, glitch visuals, and digital culture backgrounds."
        image="/og-image.webp"
        keywords={['tech wallpapers', 'digital systems', 'cyberpunk', 'glitch art']}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/wallpapers"
            element={
              <WallpapersPage
                wallpapers={wallpapers}
                loading={loading}
                error={error}
                onWallpaperClick={handleWallpaperClick}
                onLike={handleLike}
                onDownload={handleDownload}
              />
            }
          />
        </Routes>

        {selectedWallpaper && (
          <WallpaperModal
            wallpaper={selectedWallpaper}
            isOpen={isWallpaperModalOpen}
            onClose={handleCloseModal}
            onLike={handleLike}
            onDownload={handleDownload}
          />
        )}

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </Layout>
    </HelmetProvider>
  );
}

export default App;
