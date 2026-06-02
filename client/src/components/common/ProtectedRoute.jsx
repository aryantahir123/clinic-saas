import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * Access gatekeeper for secured routes.
 * Blocks unauthenticated users, redirects to /login, 
 * and shows a stunning premium loading spinner during session checks.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  // 1. Show high-fidelity animated loader while fetching user credentials
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute w-80 h-80 rounded-full bg-indigo-500/10 blur-[120px] top-1/4 left-1/4 animate-pulse-slow" />
        <div className="absolute w-80 h-80 rounded-full bg-emerald-500/10 blur-[120px] bottom-1/4 right-1/4 animate-pulse-slow" />
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Logo element */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-2xl shadow-indigo-500/25 mb-6 animate-bounce">
            <span className="text-white font-extrabold text-3xl">C</span>
          </div>

          {/* Premium Spinner */}
          <div className="relative w-12 h-12">
            <div className="w-12 h-12 rounded-full border-[3px] border-slate-800" />
            <div className="absolute top-0 w-12 h-12 rounded-full border-[3px] border-t-indigo-500 border-r-indigo-400 border-b-transparent border-l-transparent animate-spin" />
          </div>

          <p className="text-indigo-400 text-sm font-extrabold tracking-widest uppercase mt-4 animate-pulse">
            Verifying Identity
          </p>
        </div>
      </div>
    );
  }

  // 2. Redirect to auth page if not validated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Render authenticated children
  return children;
};

export default ProtectedRoute;
