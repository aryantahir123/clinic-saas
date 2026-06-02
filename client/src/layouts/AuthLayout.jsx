import React from 'react';

/**
 * Premium Layout wrapper for auth portals (Login, Register).
 * Employs a stunning dual-pane layout: modern ambient dark-indigo gradient 
 * branding on the left, and a responsive crisp workspace cards on the right.
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans">
      {/* 1. Left Side: Graphic and Branding showcase */}
      <div className="relative flex-1 hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500/15 blur-[120px]" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-extrabold text-xl">C</span>
          </div>
          <span className="text-white text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-200">
            Clinic<span className="text-indigo-400">AI</span>
          </span>
        </div>

        {/* Tagline Middle Section */}
        <div className="relative z-10 my-auto max-w-md space-y-6">
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
            Smarter clinics,{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-indigo-200 to-emerald-300">
              healthier patients.
            </span>
          </h1>
          <p className="text-slate-300 text-lg font-medium leading-relaxed">
            Welcome to the future of healthcare. Experience AI-assisted symptom diagnosis, automated prescriptions, and optimized appointment workflows.
          </p>

          {/* Interactive Feature Grid */}
          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="block text-emerald-400 font-extrabold text-lg">✦ AI Engines</span>
              <span className="text-slate-400 text-xs mt-1 block">Powered by Gemini AI</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="block text-indigo-400 font-extrabold text-lg">✦ Analytics</span>
              <span className="text-slate-400 text-xs mt-1 block">Live Operations KPIs</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} ClinicAI Corp. All clinical data encrypted in transit.
        </div>
      </div>

      {/* 2. Right Side: Workspaces container */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 lg:p-24 relative overflow-hidden bg-slate-900 lg:bg-slate-50">
        {/* Decorative elements for mobile screens */}
        <div className="absolute top-[-30%] right-[-30%] w-[100%] h-[100%] rounded-full bg-indigo-500/10 blur-[80px] lg:hidden" />
        
        {/* Brand header for mobile only */}
        <div className="flex items-center space-x-3 mb-8 lg:hidden z-10">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center">
            <span className="text-white font-extrabold text-lg">C</span>
          </div>
          <span className="text-white text-xl font-black tracking-tight">
            Clinic<span className="text-indigo-400">AI</span>
          </span>
        </div>

        <div className="w-full max-w-md z-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
