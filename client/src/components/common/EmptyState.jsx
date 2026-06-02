import React from 'react';
import { Users, Calendar, FileText, Plus } from 'lucide-react';

/**
 * High-fidelity Empty State Placeholder Component
 * Types:
 * - 'patients': "No patients yet. Register the first one!"
 * - 'appointments': "No appointments scheduled."
 * - 'prescriptions': "No prescriptions found."
 */
const EmptyState = ({ type = 'patients', actionLabel, onActionClick }) => {
  const configs = {
    patients: {
      icon: Users,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20',
      title: 'No patients yet',
      desc: 'Register the first patient to initialize medical checks and diagnosis logs.',
      defaultLabel: 'Register New Patient'
    },
    appointments: {
      icon: Calendar,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20',
      title: 'No appointments scheduled',
      desc: 'All consult schedules are up to date. Book a new slot to get started.',
      defaultLabel: 'Book Appointment'
    },
    prescriptions: {
      icon: FileText,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
      title: 'No prescriptions found',
      desc: 'No signed pharmaceutical sheets exist under this clinical history file.',
      defaultLabel: 'Create Prescription'
    }
  };

  const current = configs[type] || configs.patients;
  const Icon = current.icon;

  return (
    <div className="w-full text-center py-16 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm select-none animate-in fade-in duration-300">
      
      {/* Decorative SVG Ring */}
      <div className={`w-16 h-16 rounded-2xl ${current.color} flex items-center justify-center mx-auto mb-5 shadow-inner`}>
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>

      <div className="space-y-1.5 max-w-sm mx-auto">
        <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100 tracking-tight">
          {current.title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed font-semibold">
          {current.desc}
        </p>
      </div>

      {/* Optional action key */}
      {onActionClick && (
        <button
          onClick={onActionClick}
          className="mt-6 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-500/10 flex items-center gap-1.5 mx-auto hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel || current.defaultLabel}</span>
        </button>
      )}

    </div>
  );
};

export default EmptyState;
