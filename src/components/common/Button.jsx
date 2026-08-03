import React from 'react';
import { motion } from 'framer-motion';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon: Icon
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/95 shadow-sm active:scale-98',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 active:scale-98',
    outline: 'border border-slate-350 text-slate-750 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 active:scale-98',
    danger: 'bg-danger text-white hover:bg-danger/90 shadow-sm active:scale-98',
    ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const spinner = (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && spinner}
      {!loading && Icon && <Icon className="mr-2 h-4 w-4 shrink-0" />}
      {children}
    </button>
  );
}
