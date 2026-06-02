import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Reusable yellow warning box component shown when Gemini AI is in offline fallback mode.
 */
const AIFallbackMessage = () => {
  return (
    <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-amber-800 dark:text-amber-300 text-sm animate-in fade-in duration-200">
      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
        <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
      </div>
      <div className="space-y-0.5">
        <p className="font-bold">AI Diagnostics Fallback Mode</p>
        <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
          The Gemini AI service is temporarily unavailable. Results are loaded from local database models.
        </p>
      </div>
    </div>
  );
};

export default AIFallbackMessage;
