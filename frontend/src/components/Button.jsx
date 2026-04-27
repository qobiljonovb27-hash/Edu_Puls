import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-200',
    secondary: 'bg-white text-primary-600 border border-primary-100 hover:bg-primary-50',
    outline: 'bg-transparent border-2 border-white text-white hover:bg-white/10',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    emerald: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-100',
    amber: 'bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-100',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base font-medium',
    lg: 'px-8 py-4 text-lg font-semibold',
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={twMerge(
        'rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
