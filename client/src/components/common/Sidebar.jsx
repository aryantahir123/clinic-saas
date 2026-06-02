import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import SubscriptionBadge from './SubscriptionBadge';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2,
  CalendarDays, 
  FileText, 
  LineChart, 
  ShieldAlert, 
  HeartHandshake,
  LogOut,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  CreditCard,
  UserCog
} from 'lucide-react';

/**
 * Premium left sidebar navigation module.
 * Hidden on mobile (which uses bottom nav), fixed and collapsible on desktop/tablet.
 */
const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logoutAction } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutAction();
    navigate('/login');
  };

  // 1. Resolve role-based navigation menus
  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/admin/doctors', label: 'Manage Doctors', icon: Users },
          { to: '/admin/receptionists', label: 'Manage Receptionists', icon: UserCog },
          { to: '/admin/analytics', label: 'Analytics', icon: LineChart },
          { to: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
        ];
      case 'doctor':
        return [
          { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/doctor/appointments', label: 'My Appointments', icon: CalendarDays },
          { to: '/doctor/patients', label: 'Patients', icon: UserSquare2 },
          { to: '/doctor/ai-diagnosis', label: 'AI Diagnosis', icon: BrainCircuit },
        ];
      case 'receptionist':
        return [
          { to: '/receptionist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/receptionist/patients/register', label: 'Register Patient', icon: UserSquare2 },
          { to: '/receptionist/appointments/book', label: 'Book Appointment', icon: CalendarDays },
          { to: '/receptionist/schedule', label: 'Schedule', icon: FileText },
        ];
      case 'patient':
        return [
          { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/patient/appointments', label: 'My Appointments', icon: CalendarDays },
          { to: '/patient/prescriptions', label: 'My Prescriptions', icon: FileText },
          { to: '/patient/history', label: 'Medical History', icon: HeartHandshake },
          { to: '/patient/profile', label: 'My Profile', icon: UserSquare2 },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();
  const showSubBadge = user && (user.role === 'admin' || user.role === 'doctor');

  return (
    <aside 
      className={`flex flex-col h-screen bg-[#0F172A] text-slate-300 border-r border-slate-800 transition-all duration-300 z-50 select-none ${
        isCollapsed 
          ? 'hidden sm:flex w-[60px] relative' 
          : 'fixed sm:relative w-[240px]'
      }`}
    >
      {/* 1. Header Area with Brand logo and collapse button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-8 h-8 min-w-[32px] rounded-lg bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-md shadow-indigo-500/10">
            <span className="text-white font-extrabold text-sm">C</span>
          </div>
          {!isCollapsed && (
            <span className="text-white font-black tracking-tight text-lg">
              Clinic<span className="text-indigo-400">AI</span>
            </span>
          )}
        </div>
        
        {/* Toggle Collapse Trigger */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-6 h-6 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 items-center justify-center absolute right-[-12px] top-5 text-slate-400 hover:text-white transition-all shadow-md z-50"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* 2. Navigation items container */}
      <div className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/10' 
                    : 'hover:bg-slate-800 hover:text-slate-100'
                }`
              }
            >
              <Icon className="w-5 h-5 min-w-[20px]" />
              {!isCollapsed && (
                <span className="ml-3 text-sm tracking-tight whitespace-nowrap opacity-100 transition-opacity duration-300">
                  {link.label}
                </span>
              )}
              
              {/* Tooltip on Collapsed State */}
              {isCollapsed && (
                <div className="absolute left-[64px] bg-slate-900 border border-slate-800 text-white px-2.5 py-1.5 rounded-md text-xs font-semibold shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 whitespace-nowrap">
                  {link.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* 3. Footer Area containing Avatar, sub plan, and logout */}
      {user && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/45 space-y-2">
          {/* Subscription Tier Info */}
          {!isCollapsed && showSubBadge && (
            <div className="flex justify-center py-1">
              <SubscriptionBadge plan={user.subscriptionPlan} />
            </div>
          )}

          {/* User Details and Actions */}
          <div className="flex items-center justify-between p-1 rounded-xl overflow-hidden">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="relative">
                <img 
                  src={user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=doctor'} 
                  alt={user.name} 
                  className="w-9 h-9 min-w-[36px] rounded-lg bg-slate-800 object-cover ring-2 ring-indigo-500/20"
                />
                {/* Active Indicator dots */}
                <div className="absolute bottom-[-2px] right-[-2px] w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0F172A]" />
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <h4 className="text-xs font-black text-white truncate max-w-[120px]">{user.name}</h4>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5">{user.role}</span>
                </div>
              )}
            </div>

            {/* Logout Action Button */}
            {!isCollapsed && (
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg bg-slate-900 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all border border-slate-800 hover:border-red-500/20 shadow-sm"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
          
          {isCollapsed && (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 rounded-xl bg-slate-900 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all border border-slate-800"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
