import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, Key, Loader2 } from 'lucide-react';
import { forgotPassword, resetPassword } from '../../api/authApi';

const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

const resetSchema = z.object({
  otp: z.string().min(6, 'OTP must be at least 6 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' }
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: '', password: '', confirmPassword: '' }
  });

  const onEmailSubmit = async (data) => {
    setIsLoading(true);
    try {
      await forgotPassword(data.email);
      setEmail(data.email);
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP. User not found.');
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data) => {
    setIsLoading(true);
    try {
      await resetPassword(email, data.otp, data.password);
      toast.success('Password updated successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password. Invalid OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Brand Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-white tracking-tight">
          {step === 1 ? 'Forgot Password' : 'Reset Password'}
        </h2>
        <p className="text-slate-400 text-sm font-medium">
          {step === 1 
            ? 'Enter your email to receive a password reset OTP.' 
            : `Enter the OTP sent to ${email} and your new password.`}
        </p>
      </div>

      {step === 1 && (
        <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail size={16} />
              </div>
              <input
                type="email"
                placeholder="doctor@clinic.com"
                {...registerEmail('email')}
                className={`w-full pl-10 pr-4 py-3 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                  emailErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-800'
                }`}
              />
            </div>
            {emailErrors.email && (
              <p className="text-xs font-semibold text-red-400 mt-1">{emailErrors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/15 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Sending OTP...</span>
              </>
            ) : (
              <span>Send Reset OTP</span>
            )}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-4">
          {/* OTP Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block">Reset OTP</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Key size={16} />
              </div>
              <input
                type="text"
                placeholder="123456"
                {...registerReset('otp')}
                className={`w-full pl-10 pr-4 py-3 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                  resetErrors.otp ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-800'
                }`}
              />
            </div>
            {resetErrors.otp && (
              <p className="text-xs font-semibold text-red-400 mt-1">{resetErrors.otp.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block">New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...registerReset('password')}
                className={`w-full pl-10 pr-10 py-3 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                  resetErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-800'
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
            {resetErrors.password && (
              <p className="text-xs font-semibold text-red-400 mt-1">{resetErrors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock size={16} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...registerReset('confirmPassword')}
                className={`w-full pl-10 pr-10 py-3 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                  resetErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-800'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-all"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {resetErrors.confirmPassword && (
              <p className="text-xs font-semibold text-red-400 mt-1">{resetErrors.confirmPassword.message}</p>
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
                <span>Updating...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </form>
      )}

      {/* Back to Login */}
      <p className="text-slate-400 text-xs text-center font-medium border-t border-slate-800/80 pt-4 mt-2">
        Remember your password?{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
          Back to login
        </Link>
      </p>

    </div>
  );
};

export default ForgotPassword;
