import React from 'react';

/**
 * StatsCard Component
 * @param {Object} props
 * @param {string} props.title - Title of the stats card (e.g. "Total Patients")
 * @param {string|number} props.value - The metric value to display
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string} props.color - Color scheme to apply ('blue', 'green', 'purple', 'amber', 'rose', 'indigo')
 * @param {string|number} [props.trend] - Optional trend value (e.g. "+12%", "-5%")
 */
const StatsCard = ({ title, value, icon: Icon, color = 'blue', trend }) => {
  // Map color names to Tailwind style maps
  const colorMap = {
    blue: {
      border: 'border-l-blue-500',
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      shadow: 'hover:shadow-blue-500/5',
      trendUp: 'text-emerald-600 dark:text-emerald-400',
      trendDown: 'text-rose-600 dark:text-rose-400'
    },
    green: {
      border: 'border-l-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
      shadow: 'hover:shadow-emerald-500/5',
      trendUp: 'text-emerald-600 dark:text-emerald-400',
      trendDown: 'text-rose-600 dark:text-rose-400'
    },
    purple: {
      border: 'border-l-indigo-500',
      iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
      shadow: 'hover:shadow-indigo-500/5',
      trendUp: 'text-emerald-600 dark:text-emerald-400',
      trendDown: 'text-rose-600 dark:text-rose-400'
    },
    amber: {
      border: 'border-l-amber-500',
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
      shadow: 'hover:shadow-amber-500/5',
      trendUp: 'text-emerald-600 dark:text-emerald-400',
      trendDown: 'text-rose-600 dark:text-rose-400'
    },
    rose: {
      border: 'border-l-rose-500',
      iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
      shadow: 'hover:shadow-rose-500/5',
      trendUp: 'text-emerald-600 dark:text-emerald-400',
      trendDown: 'text-rose-600 dark:text-rose-400'
    },
    indigo: {
      border: 'border-l-indigo-600',
      iconBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400',
      shadow: 'hover:shadow-indigo-600/5',
      trendUp: 'text-emerald-600 dark:text-emerald-400',
      trendDown: 'text-rose-600 dark:text-rose-400'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;
  const isTrendPositive = trend ? !trend.toString().includes('-') : true;

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/80 border-l-4 ${scheme.border} ${scheme.shadow} transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 p-5 flex items-center justify-between`}>
      <div className="space-y-1">
        <span className="text-sm font-medium text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
          {title}
        </span>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {value}
          </span>
          {trend && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isTrendPositive 
                ? 'bg-emerald-50 dark:bg-emerald-950/30 ' + scheme.trendUp
                : 'bg-rose-50 dark:bg-rose-950/30 ' + scheme.trendDown
            }`}>
              {trend}
            </span>
          )}
        </div>
      </div>
      <div className={`p-3.5 rounded-xl ${scheme.iconBg} transition-transform duration-300 hover:rotate-6`}>
        {Icon && <Icon className="w-6 h-6 stroke-[2]" />}
      </div>
    </div>
  );
};

export default StatsCard;
