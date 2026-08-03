import React from 'react';
import { motion } from 'framer-motion';

export default function Card({ children, className = '', animate = true, onClick }) {
  const classes = `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden ${className}`;
  
  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={onClick ? { y: -4, shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' } : undefined}
        onClick={onClick}
        className={`${classes} ${onClick ? 'cursor-pointer' : ''}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}
