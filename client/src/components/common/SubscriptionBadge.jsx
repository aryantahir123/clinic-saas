import React from 'react';

/**
 * Subscription plan badge.
 * Displays "Free Plan" in modern silver slate, or "✦ Pro Plan" in striking emerald-teal gradient.
 */
const SubscriptionBadge = ({ plan }) => {
  if (plan === 'pro') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/25 text-emerald-400 shadow-sm animate-pulse-slow">
        ✦ Pro Plan
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-400">
      Free Plan
    </span>
  );
};

export default SubscriptionBadge;
