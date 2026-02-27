import React, { useState } from 'react';
import { Header } from './Header';
import { AuthModal } from './AuthModal';

export const HeaderContainer: React.FC = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Simple search redirection for now, or we can implement client-side filtering logic later
    // If we are on /wallpapers, we might want to filter the grid.
    // But since Header is isolated here, communicating with another island (WallpaperGrid) needs signals or context.
    // For SSG SEO focus, let's treat search as "navigation" or just ignore for MVP if not critical.
    // The original app filtered locally. 
    // Let's print to console or simple redirect for now to avoid breaking.
    const handleSearchChange = (query: string) => {
        // Dispatch a custom event so other components can listen
        if (typeof window !== 'undefined') {
            const event = new CustomEvent('wallpaper-search', { detail: query });
            window.dispatchEvent(event);
        }
    };

    return (
        <>
            <Header
                onSearchChange={handleSearchChange}
                onAuthClick={() => setIsAuthModalOpen(true)}
            />
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </>
    );
};
