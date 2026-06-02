import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modal Component
 * @param {Object} props
 * @param {boolean} props.isOpen - Is modal visible
 * @param {Function} props.onClose - Close callback function
 * @param {string} props.title - Modal title header
 * @param {React.ReactNode} props.children - Modal content
 * @param {'sm'|'md'|'lg'} [props.size] - Width size of modal
 */
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // Prevent scrolling on background when modal is open
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

  // Handle escape key press
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

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`relative w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700/80 ${sizeClasses[size]} overflow-hidden transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/20">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-600 dark:text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
