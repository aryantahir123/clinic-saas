import React from 'react';
import { useAuthStore } from '../store/authStore';
import { BriefcaseMedical, CheckCircle, RefreshCw } from 'lucide-react';

/**
 * Premium placeholder card rendered inside route targets to visualize
 * functional workspaces before the complete dashboard widgets are loaded.
 */
const DashboardPlaceholder = ({ title }) => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-250/60 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
        
        <div className="space-y-1">
          <span className="text-xs font-black text-indigo-500 uppercase tracking-widest block">Clinical Portal</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
          <p className="text-slate-500 text-sm font-medium">
            Welcome back, <strong className="text-slate-700 font-bold">{user?.name || 'Practitioner'}</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-emerald-600 text-xs font-bold shadow-sm">
          <CheckCircle size={14} className="animate-pulse" />
          <span>Active Session Synced</span>
        </div>
      </div>

      {/* Grid segments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Records</span>
          <div className="text-3xl font-black text-slate-800 mt-2">124</div>
          <span className="text-[10px] text-slate-400 mt-2 block">Updated 3 mins ago</span>
        </div>
        
        {/* KPI Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Consultations Today</span>
          <div className="text-3xl font-black text-slate-800 mt-2">18</div>
          <span className="text-[10px] text-indigo-500 font-semibold mt-2 block">✦ Peak clinic load</span>
        </div>

        {/* KPI Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operational Health</span>
          <div className="text-3xl font-black text-emerald-500 mt-2">99.8%</div>
          <span className="text-[10px] text-slate-400 mt-2 block">Latency: 24ms</span>
        </div>
      </div>

      {/* Primary Work area placeholder */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px] flex flex-col items-center justify-center p-8 text-center relative">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4 animate-bounce-slow">
          <BriefcaseMedical size={28} />
        </div>
        <h3 className="text-lg font-black text-slate-800 mb-1">Clinical Module Sandbox</h3>
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6 font-medium">
          Our real-time APIs are fully functional. The complete UI panels for this workspace will register in subsequent setup phases.
        </p>

        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
          <RefreshCw size={12} className="animate-spin text-indigo-400" />
          <span>Real-time DB synchronization active</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardPlaceholder;
