import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto py-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-450 dark:text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Copyright */}
      <div className="font-medium text-slate-500">
        &copy; {year} Enterprise HRMS Portal. All rights reserved.
      </div>

      {/* Security Info */}
      <div className="flex items-center gap-3 font-semibold text-slate-400 dark:text-slate-550">
        <a href="#privacy" className="hover:text-slate-600 dark:hover:text-slate-300">Privacy Policy</a>
        <span>&bull;</span>
        <a href="#terms" className="hover:text-slate-600 dark:hover:text-slate-300">Terms of Service</a>
        <span>&bull;</span>
        <div className="flex items-center gap-1 text-[10px] text-primary dark:text-accent bg-primary/5 dark:bg-accent/5 px-2.5 py-0.5 rounded-full border border-primary/10">
          <ShieldCheck size={11} />
          <span>ISO 27001 Certified</span>
        </div>
      </div>
    </footer>
  );
}
