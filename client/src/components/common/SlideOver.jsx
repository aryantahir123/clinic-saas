import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * SlideOver Component (Slides in from the right, 480px wide)
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the slideover is visible
 * @param {Function} props.onClose - Close callback function
 * @param {string} props.title - Title header
 * @param {React.ReactNode} props.children - Panel contents
 */
const SlideOver = ({ isOpen, onClose, title, children }) => {
  // Prevent body scrolling when active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
          onClick={onClose}
        />

        {/* Panel wrapper */}
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-md transform transition-all duration-300 ease-in-out animate-in slide-in-from-right sm:max-w-[480px]">
            <div className="flex h-full flex-col border-l border-slate-100 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-2xl">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 px-6 py-5 bg-slate-50/50 dark:bg-slate-900/20">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5 stroke-[2]" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 text-slate-600 dark:text-slate-300">
                {children}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideOver;
