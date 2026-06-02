import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  CalendarDays, 
  UserSquare2, 
  BriefcaseMedical, 
  Users, 
  FileText,
  LineChart,
  UserCog
} from 'lucide-react';

/**
 * Premium Dashboard Layout with responsive elements:
 * - Collapsible desktop sidebar (240px wide ➜ 60px icon-only on tablet).
 * - Fixed 60px top header bar.
 * - Sticky bottom navigation for mobile screen layouts.
 */
const DashboardLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // 1. Resolve mobile-specific quick links based on active role
  const getMobileLinks = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'admin':
        return [
          { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/admin/doctors', label: 'Doctors', icon: Users },
          { to: '/admin/analytics', label: 'Analytics', icon: LineChart },
          { to: '/admin/receptionists', label: 'Reception', icon: UserCog },
        ];
      case 'doctor':
        return [
          { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/doctor/appointments', label: 'Appointments', icon: CalendarDays },
          { to: '/doctor/patients', label: 'Patients', icon: UserSquare2 },
          { to: '/doctor/ai-diagnosis', label: 'AI Check', icon: BriefcaseMedical },
        ];
      case 'receptionist':
        return [
          { to: '/receptionist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/receptionist/patients/register', label: 'Register', icon: UserSquare2 },
          { to: '/receptionist/appointments/book', label: 'Book', icon: CalendarDays },
          { to: '/receptionist/schedule', label: 'Schedule', icon: FileText },
        ];
      case 'patient':
        return [
          { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/patient/appointments', label: 'Appointments', icon: CalendarDays },
          { to: '/patient/prescriptions', label: 'Rx Logs', icon: FileText },
          { to: '/patient/profile', label: 'Profile', icon: UserSquare2 },
        ];
      default:
        return [];
    }
  };

  const mobileLinks = getMobileLinks();

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 antialiased overflow-hidden">
      {/* 1. Desktop & Tablet Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* 2. Content viewport wrapper */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <Header isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* 3. Mobile Bottom Navigation (Visible on screen < sm) */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#0F172A] border-t border-slate-800 flex items-center justify-around px-2 z-40 sm:hidden">
          {mobileLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                    isActive 
                      ? 'text-indigo-400 font-bold scale-105' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default DashboardLayout;
