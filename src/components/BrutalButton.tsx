import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BrutalButtonProps extends Omit<HTMLMotionProps<'button'>, 'onClick'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const BrutalButton: React.FC<BrutalButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) => {
  const baseClasses = "font-brutal font-black uppercase tracking-wide border-4 border-brutal-black transition-all duration-100";
  
  const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-brutal-white text-brutal-black hover:bg-brutal-yellow",
    secondary: "bg-brutal-black text-brutal-white hover:bg-brutal-pink hover:text-brutal-black",
    accent: "bg-brutal-lime text-brutal-black hover:bg-brutal-cyan"
  };
  
  const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-4 py-2 text-sm shadow-brutal-sm",
    md: "px-6 py-3 text-base shadow-brutal",
    lg: "px-8 py-4 text-lg shadow-brutal-lg"
  };
  
  return (
    <motion.button
      type={type}
      whileHover={!disabled ? { y: -2, x: -2 } : undefined}
      whileTap={!disabled ? { y: 0, x: 0, boxShadow: "4px 4px 0px #000000" } : undefined}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
