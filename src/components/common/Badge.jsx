import React from 'react';

const BADGE_STYLES = {
  Draft: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  Pending: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50',
  Approved: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50',
  Rejected: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50',
  Cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50',
  Processed: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/50',
  Paid: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900/50',
  Active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900/50',
  Inactive: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  Late: 'bg-red-50 text-red-700 border-red-150 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30',
  Present: 'bg-emerald-50 text-emerald-700 border-emerald-150 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
  Absent: 'bg-rose-50 text-rose-700 border-rose-150 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30',
};

export default function Badge({ status, children }) {
  const normalizedStatus = status || children || 'Draft';
  const styleClass = BADGE_STYLES[normalizedStatus] || BADGE_STYLES.Draft;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styleClass}`}>
      {children || normalizedStatus}
    </span>
  );
}
