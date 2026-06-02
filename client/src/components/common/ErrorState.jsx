import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Structured API Error Placeholder Component
 * Displays a clean error block with a fallback "Try Again" button
 */
const ErrorState = ({ message = 'Something went wrong. Try again.', onRetry }) => {
  return (
    <div className="w-full text-center py-16 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm select-none animate-in fade-in duration-300">
      
      {/* Danger Circle Indicator */}
      <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center mx-auto mb-5">
        <AlertCircle className="w-7 h-7 stroke-[1.5]" />
      </div>

      <div className="space-y-1 max-w-xs mx-auto">
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Connection Interrupted</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-semibold">
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-750 text-slate-650 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 mx-auto transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}

    </div>
  );
};

export default ErrorState;
