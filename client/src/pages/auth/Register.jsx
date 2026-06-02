import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, User, Phone, Loader2, Info } from 'lucide-react';
import * as authApi from '../../api/authApi';

// 1. Zod Registration Schema enforcing passwords match and phone structure
const registerSchema = z.zodSchema || z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters').trim(),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Invalid phone number length').trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Premium Patient Self-Registration View.
 * Restricts registration roles to 'patient' and guides clinical staff to contact administrators.
 */
const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Self-registration is strictly for patient role
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'patient',
      };

      const response = await authApi.register(payload);
      if (response.success) {
        toast.success('Registration successful! Please log in.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration submit error:', error);
      toast.error(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Brand Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-white tracking-tight">Patient Portal</h2>
        <p className="text-slate-400 text-sm font-medium">Create your patient profile to book appointments and view prescriptions.</p>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <User size={16} />
            </div>
            <input
              type="text"
              placeholder="Tariq Mahmood"
              {...register('name')}
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-800'
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-xs font-semibold text-red-400 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail size={16} />
            </div>
            <input
              type="email"
              placeholder="tariq@gmail.com"
              {...register('email')}
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-800'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-semibold text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block">Phone Number</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Phone size={16} />
            </div>
            <input
              type="text"
              placeholder="03001234567"
              {...register('phone')}
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-800'
              }`}
            />
          </div>
          {errors.phone && (
            <p className="text-xs font-semibold text-red-400 mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock size={16} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={`w-full pl-10 pr-10 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
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

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock size={16} />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={`w-full pl-10 pr-10 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-800'
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
          {errors.confirmPassword && (
            <p className="text-xs font-semibold text-red-400 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/15 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Registering Account...</span>
            </>
          ) : (
            <span>Create Profile</span>
          )}
        </button>
      </form>

      {/* Redirect to login */}
      <p className="text-slate-400 text-xs text-center font-medium">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
          Log in instead
        </Link>
      </p>

      {/* Corporate staff reminder panel */}
      <div className="flex items-start space-x-2 bg-slate-950 p-3 rounded-2xl border border-slate-850">
        <Info size={14} className="text-indigo-400 min-w-[14px] mt-0.5" />
        <span className="text-[10px] text-slate-500 font-medium leading-relaxed">
          Are you a clinic practitioner or receptionist? Account creation is restricted to system administrators. Please contact your administrator to receive your credentials.
        </span>
      </div>

    </div>
  );
};

export default Register;
