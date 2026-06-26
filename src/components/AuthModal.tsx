import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const { signIn, signUp } = useAuth();

  // Focus the email field and allow Escape to close
  useEffect(() => {
    if (!isOpen) return;
    emailRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        setError(error.message);
      } else {
        setEmail('');
        setPassword('');
        onClose();
      }
    } catch {
      setError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full border-2 border-white/15 bg-black/40 py-3 pl-11 pr-4 font-mono text-sm text-white placeholder:text-gray-600 transition-colors focus:border-brutal-neon-cyan focus:outline-none disabled:opacity-50';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={isLogin ? 'Iniciar sesión' : 'Registrarse'}
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            className="w-full max-w-md border-2 border-black bg-brutal-dark-bg shadow-brutal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-white/10 px-6 py-5">
              <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-brutal-neon-purple">CrackingWall</p>
                <h2 className="font-brutal text-xl font-black uppercase tracking-tight text-white">
                  {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="grid h-9 w-9 place-items-center border-2 border-white/15 text-gray-400 transition-colors hover:border-brutal-neon-cyan hover:text-brutal-neon-cyan"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 border-b-2 border-brutal-neon-pink/40 bg-brutal-neon-pink/10 px-6 py-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-brutal-neon-pink" />
                <p className="font-mono text-xs text-brutal-neon-pink">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
              <div>
                <label htmlFor="auth-email" className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    id="auth-email"
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className={inputClass}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="auth-password" className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className={inputClass}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 border-2 border-black bg-brutal-neon-cyan py-3 font-brutal text-sm font-black uppercase tracking-wide text-black shadow-brutal-sm transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <span>Procesando…</span>
                ) : (
                  <>
                    {isLogin ? <LogIn className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    <span>{isLogin ? 'Entrar' : 'Crear cuenta'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                disabled={loading}
                className="w-full text-center font-mono text-xs text-gray-400 transition-colors hover:text-brutal-neon-cyan disabled:opacity-50"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
