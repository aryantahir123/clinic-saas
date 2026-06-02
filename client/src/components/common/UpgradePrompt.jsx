import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ShieldAlert, X, Sparkles, MessageCircle } from 'lucide-react';
import Modal from './Modal';

/**
 * Modal that shows when free plan user tries to use premium AI features.
 */
const UpgradePrompt = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const handleUpgradeClick = () => {
    onClose();
    if (isAdmin) {
      navigate('/admin/subscriptions');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pro Feature 🔒"
      size="sm"
    >
      <div className="text-center space-y-6 py-2 animate-in zoom-in-95 duration-200">
        
        {/* Glow Icon */}
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner relative group">
          <div className="absolute inset-0 bg-amber-500/10 rounded-2xl blur group-hover:blur-md transition-all duration-300" />
          <Sparkles className="w-8 h-8 stroke-[2] relative z-10 animate-pulse" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Unlock AI Diagnostics
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
            This advanced diagnostic tool is powered by Gemini AI and requires a active **Pro Plan** subscription.
          </p>
        </div>

        {/* Dynamic Context Notice */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs text-slate-500 dark:text-slate-400">
          {isAdmin ? (
            <p className="font-semibold text-indigo-500">
              As an administrator, you can upgrade your plan tier instantly.
            </p>
          ) : (
            <div className="flex items-center gap-2 justify-center">
              <MessageCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Please contact your clinic administrator to upgrade to the Pro plan.</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 justify-center pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-500 dark:text-slate-400 text-sm font-bold rounded-xl transition-all duration-200"
          >
            Maybe Later
          </button>
          
          {isAdmin && (
            <button
              onClick={handleUpgradeClick}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5"
            >
              <span>Upgrade Now</span>
            </button>
          )}
        </div>

      </div>
    </Modal>
  );
};

export default UpgradePrompt;
