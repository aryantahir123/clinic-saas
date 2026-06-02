import React from 'react';

/**
 * DataTable Component
 * @param {Object} props
 * @param {Array<Object>} props.columns - Columns configuration
 * @param {string} props.columns[].key - The data object key
 * @param {string} props.columns[].label - Column header label
 * @param {Function} [props.columns[].render] - Custom render function: (value, row) => ReactNode
 * @param {Array<Object>} props.data - The data array to display
 * @param {boolean} [props.loading] - Whether data is loading (renders skeleton screen)
 * @param {string} [props.emptyMessage] - Message to display if there's no data
 */
const DataTable = ({ columns, data = [], loading = false, emptyMessage = 'No records found.' }) => {
  return (
    <div className="w-full overflow-hidden border border-slate-100 dark:border-slate-700/80 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700/80 text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={col.key || idx} className="py-4 px-6 font-semibold select-none">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {loading ? (
              // Loading Skeleton - 3 animated pulsing gray rows
              [...Array(3)].map((_, rowIndex) => (
                <tr key={rowIndex} className="animate-pulse">
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="py-5 px-6">
                      <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-4/5 my-1" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="py-12 px-6 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/30 flex items-center justify-center text-slate-400 dark:text-slate-500">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              data.map((row, rowIndex) => (
                <tr
                  key={row._id || row.id || rowIndex}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10 transition-colors duration-150 text-sm text-slate-600 dark:text-slate-300"
                >
                  {columns.map((col, colIndex) => {
                    const value = row[col.key];
                    return (
                      <td key={col.key || colIndex} className="py-4.5 px-6 font-medium whitespace-nowrap">
                        {col.render ? col.render(value, row) : value !== undefined && value !== null ? String(value) : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
