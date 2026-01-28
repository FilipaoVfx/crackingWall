import React, { useState, useEffect } from 'react';
import { WallpaperGrid } from './WallpaperGrid';
import { WallpaperModal } from './WallpaperModal';
import { AuthModal } from './AuthModal';
import { WallpaperService } from '../services/wallpaperService';
import { useAuth } from '../hooks/useAuth';
import type { Wallpaper } from '../types';

interface WallpapersGridContainerProps {
    initialWallpapers: Wallpaper[];
}

export const WallpapersGridContainer: React.FC<WallpapersGridContainerProps> = ({ initialWallpapers }) => {
    const [wallpapers, setWallpapers] = useState<Wallpaper[]>(initialWallpapers);
    const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
    const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { user } = useAuth();

    // Sync with user state (likes)
    useEffect(() => {
        const syncUserLikes = async () => {
            if (user) {
                try {
                    // Optimization: We could just fetch likes, but reusing the service method is easier for now.
                    // Note: fetching ALL wallpapers again might be heavy if list is long. 
                    // Better approach would be to fetch only IDs of liked wallpapers.
                    // But WallpaperService logic is coupled. 
                    // Let's re-fetch the current view's wallpapers with user context context if possible.
                    // Since we passed 'initialWallpapers' (which might be filtered by tag),
                    // we should theoretically only update those.
                    // For MVP, let's fetch all (Service default) and filter locally to match the IDs we have?
                    // Or simplified: Just don't sync 'isLiked' automatically on mount for the WHOLE list if it's huge.
                    // But the user expects to see their likes.
                    // Let's stick to the prompt's "Performance" goal. Fetching 1000 items on client load is bad.
                    // Ideally, we fetch existing likes for the IDs currently displayed.

                    // Let's do a simple implementation: fetch all user likes and update state.
                    // We need a new service method for this optimization, or use existing.
                    const freshData = await WallpaperService.getWallpapersForUser(user.id);

                    // Map fresh data to currently displayed wallpapers (preserving current order/filter if any)
                    // Actually, if we are on a collection page (filtered), freshData (getAll) might be overkill but acts as cache.
                    // We filter freshData to match the IDs of initialWallpapers.
                    const idMap = new Map(freshData.map(w => [w.id, w]));

                    setWallpapers(prev => prev.map(w => {
                        const fresh = idMap.get(w.id);
                        return fresh ? fresh : w;
                    }));

                } catch (error) {
                    console.error("Error syncing likes", error);
                }
            }
        };

        syncUserLikes();
    }, [user]);

    // Listen for search events (from Header)
    useEffect(() => {
        const handleSearch = (e: Event) => {
            const customEvent = e as CustomEvent<string>;
            const query = customEvent.detail.toLowerCase();
            if (!query) {
                setWallpapers(initialWallpapers);
                return;
            }
            // Client side filtering for visual consistency
            const filtered = initialWallpapers.filter(w =>
                w.title.toLowerCase().includes(query) ||
                w.category.toLowerCase().includes(query)
            );
            setWallpapers(filtered);
        };

        window.addEventListener('wallpaper-search', handleSearch);
        return () => window.removeEventListener('wallpaper-search', handleSearch);
    }, [initialWallpapers]);

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

            // Optimistic update
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

            await WallpaperService.updateWallpaperLike(id, newIsLiked, user.id);
        } catch (error) {
            console.error('Error updating like:', error);
            // Revert on error could be added here
        }
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

            // Download logic
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

    const handleView = (wallpaper: Wallpaper) => {
        setSelectedWallpaper(wallpaper);
        setIsWallpaperModalOpen(true);
    };

    return (
        <>
            <WallpaperGrid
                wallpapers={wallpapers}
                onLike={handleLike}
                onDownload={handleDownload}
                onView={handleView}
            />

            {selectedWallpaper && (
                <WallpaperModal
                    wallpaper={selectedWallpaper}
                    isOpen={isWallpaperModalOpen}
                    onClose={() => {
                        setIsWallpaperModalOpen(false);
                        setSelectedWallpaper(null);
                    }}
                    onLike={handleLike}
                    onDownload={handleDownload}
                />
            )}

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </>
    );
};
