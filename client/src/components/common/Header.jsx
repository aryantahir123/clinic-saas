import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  Bell, 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  LayoutDashboard,
  CalendarCheck
} from 'lucide-react';

/**
 * Premium top Header component.
 * Features dynamic breadcrumb page titles, notification panels, 
 * responsive sidebar triggers, and a stylized user credentials dropdown.
 */
const Header = ({ setIsCollapsed, isCollapsed }) => {
  const { user, logoutAction } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutAction();
    navigate('/login');
  };

  // 1. Clean dropdown close events on outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 2. Resolve Breadcrumb Titles dynamically based on location paths
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/doctors')) return 'Manage Doctors';
    if (path.includes('/receptionists')) return 'Manage Receptionists';
    if (path.includes('/patients/register')) return 'Register Patient';
    if (path.includes('/patients')) return 'Patient Records';
    if (path.includes('/appointments/book')) return 'Book Appointment';
    if (path.includes('/appointments')) return 'Appointments';
    if (path.includes('/prescriptions')) return 'Digital Prescriptions';
    if (path.includes('/ai-diagnosis')) return 'Gemini AI Assistant';
    if (path.includes('/analytics')) return 'Performance Analytics';
    if (path.includes('/subscriptions')) return 'SaaS Subscription';
    if (path.includes('/profile')) return 'Profile Settings';
    if (path.includes('/schedule')) return 'Clinic Schedule';
    
    return 'Overview';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 shadow-sm flex items-center justify-between px-4 sm:px-6 relative z-20">
      
      {/* Left Pane: Sidebar trigger and Dynamic breadcrumb title */}
      <div className="flex items-center space-x-4">
        {/* Toggle burger menu */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all border border-slate-200 cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        {/* Dynamic Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
          <span className="hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => navigate('/')}>ClinicAI</span>
          <span>/</span>
          <span className="text-slate-800 font-extrabold text-sm tracking-tight">{getPageTitle()}</span>
        </div>
      </div>

      {/* Right Pane: Notifications and Profile Menu */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        
        {/* Notification Bell with indicator */}
        <button className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-all border border-slate-200/60 relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white animate-pulse" />
        </button>

        {/* Vertical divider line */}
        <div className="w-px h-6 bg-slate-200" />

        {/* User Account Dropdown Selector */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 p-1 pr-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all"
            >
              <img 
                src={user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=doctor'} 
                alt={user.name} 
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/10 bg-slate-100"
              />
              <span className="hidden sm:inline text-sm font-bold text-slate-700 truncate max-w-[100px]">{user.name}</span>
              <ChevronDown size={14} className="text-slate-400 hidden sm:inline" />
            </button>

            {/* Dropdown Items list */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-150">
                {/* User summary */}
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Signed In As</p>
                  <p className="text-sm font-extrabold text-slate-800 truncate mt-0.5">{user.email}</p>
                </div>

                {/* Navigation links */}
                <div className="p-1 space-y-0.5">
                  <Link 
                    to={`/${user.role}/profile`} 
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-3 py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <User size={16} className="mr-2.5 text-slate-400" />
                    My Profile
                  </Link>
                  <Link 
                    to={`/${user.role}/dashboard`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-3 py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <LayoutDashboard size={16} className="mr-2.5 text-slate-400" />
                    Dashboard
                  </Link>
                </div>

                <div className="border-t border-slate-100 my-1" />

                {/* Logout trigger */}
                <div className="p-1">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all font-semibold"
                  >
                    <LogOut size={16} className="mr-2.5 text-red-400" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
};

export default Header;
