import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, Loader2, Key, Info } from 'lucide-react';

// 1. Zod Validation Schema matching backend rules
const loginSchema = z.zodSchema || z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Premium Login Portal.
 * Connects forms with local Zustand store states, and displays collapsible quick-fill demo links.
 */
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoPanel, setShowDemoPanel] = useState(false);
  const loginAction = useAuthStore((state) => state.loginAction);
  const isLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data) => {
    try {
      const response = await loginAction(data.email, data.password);
      if (response && response.success) {
        toast.success(`Welcome back, ${response.data.user.name}!`);
        
        // Bounce user to role landing page
        navigate(`/${response.data.user.role}/dashboard`, { replace: true });
      }
    } catch (error) {
      console.error('Login submit error:', error);
      toast.error(
        error.response?.data?.message || 'Invalid credentials. Please verify and try again.'
      );
    }
  };

  // Helper to click and auto-fill credentials instantly
  const handleQuickFill = (email, password) => {
    setValue('email', email);
    setValue('password', password);
    toast.success('Credentials filled! Ready to login.', { icon: '📝' });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Brand Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-white tracking-tight">Access Portal</h2>
        <p className="text-slate-400 text-sm font-medium">Enter your credentials to enter your medical workspace.</p>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail size={16} />
            </div>
            <input
              type="email"
              placeholder="doctor@clinic.com"
              {...register('email')}
              className={`w-full pl-10 pr-4 py-3 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-800'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-semibold text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block">Password</label>
            <Link to="/forgot-password" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Forgot Password?</Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock size={16} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={`w-full pl-10 pr-10 py-3 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-800'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-all"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-semibold text-red-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/15 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Verifying Session...</span>
            </>
          ) : (
            <span>Log In</span>
          )}
        </button>
      </form>

      {/* Redirect to patient registration */}
      <p className="text-slate-400 text-xs text-center font-medium">
        New patient?{' '}
        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
          Self-register here
        </Link>
      </p>

      {/* 2. Collapsible Demo credentials hint panel */}
      <div className="border-t border-slate-800/80 pt-4">
        <button
          type="button"
          onClick={() => setShowDemoPanel(!showDemoPanel)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
        >
          <div className="flex items-center space-x-2">
            <Key size={14} className="text-indigo-400" />
            <span>Developer Sandbox Credentials</span>
          </div>
          <span className="text-[10px] uppercase font-black bg-slate-850 px-2 py-0.5 rounded text-slate-500">
            {showDemoPanel ? 'Hide' : 'Show'}
          </span>
        </button>

        {showDemoPanel && (
          <div className="mt-3 bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2.5 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-start space-x-2 text-[10px] text-slate-500 font-medium leading-relaxed mb-1">
              <Info size={12} className="text-indigo-400 min-w-[12px] mt-0.5" />
              <span>Click a profile below to automatically fill developer testing credentials:</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@clinic.com', 'Admin@1234')}
                className="p-2 bg-slate-900 hover:bg-indigo-650/10 border border-slate-800 hover:border-indigo-500/20 rounded-xl text-left transition-all"
              >
                <span className="block font-black text-white">Administrator</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Full System Access</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleQuickFill('doctor@clinic.com', 'Doctor@1234')}
                className="p-2 bg-slate-900 hover:bg-indigo-650/10 border border-slate-800 hover:border-indigo-500/20 rounded-xl text-left transition-all"
              >
                <span className="block font-black text-white">Physician</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Gemini Diagnostic Log</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('reception@clinic.com', 'Recept@1234')}
                className="p-2 bg-slate-900 hover:bg-indigo-650/10 border border-slate-800 hover:border-indigo-500/20 rounded-xl text-left transition-all"
              >
                <span className="block font-black text-white">Receptionist</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Booking & Registration</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('patient@clinic.com', 'Patient@1234')}
                className="p-2 bg-slate-900 hover:bg-indigo-650/10 border border-slate-800 hover:border-indigo-500/20 rounded-xl text-left transition-all"
              >
                <span className="block font-black text-white">Patient Profile</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Rx Prescriptions PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Login;
