import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { BrutalButton } from './BrutalButton';
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
  
  const { signIn, signUp } = useAuth();

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
    } catch (err) {
      setError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

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
            className="bg-brutal-white border-6 border-brutal-black shadow-brutal-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-4 border-brutal-black bg-brutal-pink">
              <h2 className="text-2xl font-brutal font-black text-brutal-black uppercase">
                {isLogin ? 'INICIAR SESIÓN' : 'REGISTRARSE'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 bg-brutal-black text-brutal-white hover:bg-brutal-yellow hover:text-brutal-black transition-colors border-3 border-brutal-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-brutal-red border-b-4 border-brutal-black">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-brutal-white" />
                  <p className="font-brutal font-bold text-brutal-white uppercase text-sm">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-brutal font-black text-brutal-black uppercase mb-2">
                  EMAIL
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 pl-12 font-brutal font-bold bg-brutal-yellow border-4 border-brutal-black shadow-brutal-sm focus:outline-none focus:shadow-brutal disabled:opacity-50"
                    placeholder="tu@email.com"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brutal-black" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-brutal font-black text-brutal-black uppercase mb-2">
                  CONTRASEÑA
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 pl-12 font-brutal font-bold bg-brutal-yellow border-4 border-brutal-black shadow-brutal-sm focus:outline-none focus:shadow-brutal disabled:opacity-50"
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brutal-black" />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <BrutalButton
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>{loading ? 'PROCESANDO...' : (isLogin ? 'ENTRAR' : 'CREAR CUENTA')}</span>
                  </div>
                </BrutalButton>

                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  disabled={loading}
                  className="w-full text-center font-brutal font-bold text-brutal-black hover:text-brutal-pink transition-colors uppercase disabled:opacity-50"
                >
                  {isLogin ? '¿NO TIENES CUENTA? REGÍSTRATE' : '¿YA TIENES CUENTA? INICIA SESIÓN'}
                </button>
              </div>
            </form>

            {/* Notice */}
            <div className="p-6 border-t-4 border-brutal-black bg-brutal-cyan">
              <p className="text-sm font-brutal font-bold text-brutal-black text-center">
                ⚡ FUNCIONALIDAD COMPLETA CON SUPABASE ⚡
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
