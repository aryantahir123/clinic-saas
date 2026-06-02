import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an analytics or error tracking service
    console.error("ErrorBoundary caught an unexpected exception:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
          {/* Decorative background glows */}
          <div className="absolute w-80 h-80 rounded-full bg-rose-500/5 blur-[120px] top-1/4 left-1/4" />
          <div className="absolute w-80 h-80 rounded-full bg-amber-500/5 blur-[120px] bottom-1/4 right-1/4" />

          {/* Error viewport card */}
          <div className="relative z-10 max-w-md w-full bg-slate-800/40 border border-slate-800/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
            
            {/* Danger Glow Circle */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/10 mx-auto animate-bounce">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white tracking-tight">Unexpected System Interruption</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                React rendering was interrupted by an unexpected error. Don't worry, your data remains fully secure.
              </p>
            </div>

            {/* Error Detail (only in dev mode) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl text-left text-[10px] font-mono text-rose-400 overflow-x-auto max-h-36">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={handleReload}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-500/10 flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Application</span>
            </button>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
