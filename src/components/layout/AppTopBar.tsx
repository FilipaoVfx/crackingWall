import React, { useState } from 'react';
import { Search, LogIn, LogOut, User } from 'lucide-react';
import { AuthModal } from '../AuthModal';
import { useAuth } from '../../hooks/useAuth';

/**
 * Top bar for the app shell: global search + auth.
 * The former "New Project" CTA is now a Login action (reuses AuthModal).
 */
export const AppTopBar: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wallpaper-search', { detail: e.target.value }));
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b-2 border-white/10 bg-brutal-dark-deeper/95 px-6 py-4 backdrop-blur">
      {/* Search */}
      <div className="relative flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="search"
          onChange={handleSearch}
          placeholder="Search tools, assets, guides..."
          className="w-full rounded-md border-2 border-white/10 bg-black/40 py-2.5 pl-11 pr-4 font-mono text-sm text-white placeholder:text-gray-600 transition-colors focus:border-brutal-neon-cyan focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <>
            <span className="hidden items-center gap-2 font-mono text-xs text-gray-300 sm:flex">
              <span className="grid h-8 w-8 place-items-center border-2 border-black bg-brutal-neon-purple text-black shadow-brutal-sm">
                <User className="h-4 w-4" />
              </span>
              <span className="max-w-[160px] truncate">{user.email}</span>
            </span>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 rounded-md border-2 border-black bg-white px-4 py-2.5 font-brutal text-sm font-black uppercase tracking-wide text-black shadow-brutal-sm transition-transform hover:-translate-y-0.5"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-2 rounded-md border-2 border-black bg-brutal-neon-cyan px-5 py-2.5 font-brutal text-sm font-black uppercase tracking-wide text-black shadow-brutal-sm transition-transform hover:-translate-y-0.5"
          >
            <LogIn className="h-4 w-4" />
            Login
          </button>
        )}
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
};
