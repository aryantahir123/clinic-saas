import React from 'react';

/**
 * High-fidelity Skeleton Loading Placeholders
 * Variants:
 * - 'table-row': Simulates standard 3-cell wide structured lists
 * - 'card': Simulates multi-column grid cards containing an avatar circle + 2 lines
 * - 'stat': Simulates stats KPIs containing a circle icon + large value line
 */
const SkeletonCard = ({ variant = 'card', count = 3 }) => {
  const items = Array.from({ length: count });

  const renderSkeleton = (key) => {
    switch (variant) {
      case 'table-row':
        return (
          <div 
            key={key} 
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-850 rounded-2xl animate-pulse space-x-4"
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              <div className="space-y-1.5 flex-1 max-w-[150px]">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-lg w-full" />
                <div className="h-2.5 bg-slate-100 dark:bg-slate-850 rounded-lg w-2/3" />
              </div>
            </div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-20 hidden sm:block" />
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-16" />
          </div>
        );

      case 'stat':
        return (
          <div 
            key={key} 
            className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-850 p-5 rounded-3xl animate-pulse flex items-center justify-between shadow-sm"
          >
            <div className="space-y-2 flex-1">
              <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3" />
              <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/2" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-850" />
          </div>
        );

      case 'card':
      default:
        return (
          <div 
            key={key} 
            className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-850 p-5 rounded-3xl animate-pulse shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="space-y-1.5">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-28" />
                  <div className="h-2 bg-slate-100 dark:bg-slate-850 rounded-lg w-20" />
                </div>
              </div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-12" />
            </div>
            <div className="space-y-2">
              <div className="h-6.5 bg-slate-100 dark:bg-slate-850 rounded-xl w-full" />
              <div className="h-2.5 bg-slate-100 dark:bg-slate-850 rounded-lg w-1/3" />
            </div>
            <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-xl w-full" />
          </div>
        );
    }
  };

  return (
    <div className={`
      ${variant === 'stat' ? 'grid grid-cols-1 md:grid-cols-3 gap-4' : ''}
      ${variant === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : ''}
      ${variant === 'table-row' ? 'space-y-3' : ''}
    `}>
      {items.map((_, idx) => renderSkeleton(idx))}
    </div>
  );
};

export default SkeletonCard;
