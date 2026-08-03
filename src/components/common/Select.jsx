import React from 'react';

export default function Select({
  label,
  name,
  options = [],
  error,
  register = () => ({}),
  className = '',
  required = false,
  ...rest
}) {
  return (
    <div className={`flex flex-col w-full text-left ${className}`}>
      {label && (
        <label className="mb-1 text-xs font-semibold text-slate-750 dark:text-slate-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        {...register(name)}
        className={`w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border ${
          error ? 'border-red-500 focus:ring-red-200 dark:border-red-900' : 'border-slate-300 dark:border-slate-800 focus:border-primary/50'
        } rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 dark:text-slate-200 text-slate-800 transition-all cursor-pointer`}
        {...rest}
      >
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const labelText = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val} className="dark:bg-slate-900">
              {labelText}
            </option>
          );
        })}
      </select>
      {error && (
        <span className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium">
          {error.message || error}
        </span>
      )}
    </div>
  );
}
