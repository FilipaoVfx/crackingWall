import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Menu, X, LogOut, ChevronDown, FlaskConical } from 'lucide-react';
import { BrutalButton } from './BrutalButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onSearchChange: (query: string) => void;
  onAuthClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchChange, onAuthClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLabsOpen, setIsLabsOpen] = useState(false);
  const labsRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (labsRef.current && !labsRef.current.contains(e.target as Node)) {
        setIsLabsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange(query);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-brutal-dark-deeper border-b-[5px] border-brutal-neon-cyan shadow-neon-cyan relative z-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="group block">
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-3xl md:text-6xl font-brutal font-black text-white drop-shadow-[3px_3px_0_#00fff9] animate-glitch group-hover:scale-105 transition-transform"
            >
              CrakingWall
            </motion.h1>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-6 font-brutal font-bold text-white uppercase text-sm mr-4">
              <a href="/blog/" className="hover:text-brutal-neon-cyan hover:underline decoration-2 underline-offset-4 transition-all">Blog</a>
              <div ref={labsRef} className="relative">
                <button
                  onClick={() => setIsLabsOpen(!isLabsOpen)}
                  className="flex items-center gap-1.5 hover:text-brutal-neon-green transition-all uppercase"
                >
                  <FlaskConical className="w-4 h-4" />
                  Labs
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isLabsOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isLabsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-3 w-56 bg-[#0d0f14] border-2 border-brutal-neon-green/40 shadow-[0_0_20px_rgba(0,255,156,0.15)] z-50"
                    >
                      <a
                        href="/ascii-lab/"
                        className="block px-5 py-3 text-xs hover:bg-brutal-neon-green/10 hover:text-brutal-neon-green transition-all border-b border-white/5"
                      >
                        <span className="block text-white font-black">ASCII Lab</span>
                        <span className="block text-gray-500 font-normal normal-case mt-0.5" style={{ fontSize: '10px' }}>Video → ASCII art converter</span>
                      </a>
                      <a
                        href="/visual-protocol/"
                        className="block px-5 py-3 text-xs hover:bg-[#ff003c]/10 hover:text-[#ff003c] transition-all"
                      >
                        <span className="block text-white font-black">Visual Protocol</span>
                        <span className="block text-gray-500 font-normal normal-case mt-0.5" style={{ fontSize: '10px' }}>AI image analysis tool</span>
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <a href="/about/" className="hover:text-brutal-neon-pink hover:underline decoration-2 underline-offset-4 transition-all">About</a>
              <a href="/contact/" className="hover:text-brutal-neon-yellow hover:underline decoration-2 underline-offset-4 transition-all">Contact</a>
            </nav>
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="BUSCAR WALLPAPERS..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-80 px-4 py-3 text-lg font-brutal font-bold bg-brutal-dark-bg text-brutal-neon-yellow border-4 border-brutal-neon-yellow shadow-neon-cyan hover:shadow-neon-cyan-hover focus:outline-none placeholder-brutal-neon-yellow/70 transition-all"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-brutal-neon-yellow" />
            </div>

            {/* Auth Button */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="px-4 py-2 bg-brutal-neon-green text-brutal-dark-deeper border-4 border-brutal-dark-deeper shadow-neon-green">
                  <span className="font-brutal font-bold uppercase text-sm">
                    {user.email}
                  </span>
                </div>
                <BrutalButton
                  variant="secondary"
                  onClick={handleSignOut}
                >
                  <div className="flex items-center space-x-2">
                    <LogOut className="w-5 h-5" />
                    <span>SALIR</span>
                  </div>
                </BrutalButton>
              </div>
            ) : (
              <BrutalButton
                variant="accent"
                onClick={onAuthClick}
              >
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>LOGIN</span>
                </div>
              </BrutalButton>
            )}
          </div>

          {/* Mobile Menu Button */}
          <BrutalButton
            variant="secondary"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </BrutalButton>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden mt-6 overflow-hidden"
            >
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="BUSCAR..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-3 text-lg font-brutal font-bold bg-brutal-yellow border-4 border-brutal-black shadow-brutal focus:outline-none placeholder-brutal-black"
                />

                {user ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-brutal-lime border-4 border-brutal-black shadow-brutal text-center">
                      <span className="font-brutal font-bold text-brutal-black uppercase text-sm">
                        {user.email}
                      </span>
                    </div>
                    <BrutalButton
                      variant="secondary"
                      onClick={handleSignOut}
                      className="w-full"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <LogOut className="w-5 h-5" />
                        <span>SALIR</span>
                      </div>
                    </BrutalButton>
                  </div>
                ) : (
                  <BrutalButton
                    variant="accent"
                    onClick={onAuthClick}
                    className="w-full"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>LOGIN</span>
                    </div>
                  </BrutalButton>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
