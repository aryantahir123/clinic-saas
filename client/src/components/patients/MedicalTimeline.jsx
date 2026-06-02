import React, { useState } from 'react';
import { 
  Calendar, FileText, Activity, Clock, ChevronDown, ChevronUp, User, Pill, Heart, ShieldAlert 
} from 'lucide-react';

/**
 * Normalizes all event objects into a single chronological array.
 */
const MedicalTimeline = ({ history }) => {
  const [expandedEventId, setExpandedEventId] = useState(null);

  const appointments = history?.appointments || [];
  const prescriptions = history?.prescriptions || [];
  const diagnosisLogs = history?.diagnosisLogs || [];

  // 1. Merge and normalize events
  const timelineEvents = [
    ...appointments.map(app => ({
      _id: app._id,
      type: 'appointment',
      date: new Date(app.date),
      title: 'Clinical Consultation',
      doctor: app.doctorId?.name || 'Physician',
      specialization: app.doctorId?.specialization || 'Medicine',
      raw: app
    })),
    ...prescriptions.map(rx => ({
      _id: rx._id,
      type: 'prescription',
      date: new Date(rx.createdAt),
      title: 'Prescription Issued',
      doctor: rx.doctorId?.name || 'Physician',
      specialization: rx.doctorId?.specialization || 'Medicine',
      raw: rx
    })),
    ...diagnosisLogs.map(log => ({
      _id: log._id,
      type: 'diagnosis',
      date: new Date(log.createdAt),
      title: 'AI Symptom Assessment',
      doctor: log.doctorId?.name || 'Physician',
      raw: log
    }))
  ];

  // 2. Sort descending chronologically
  timelineEvents.sort((a, b) => b.date - a.date);

  const toggleExpand = (id) => {
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  const formatDate = (dateObj) => {
    return dateObj.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (timelineEvents.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm">
        <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto stroke-[1.5]" />
        <p className="text-sm font-semibold text-slate-400 mt-3">No medical events logged in timeline.</p>
      </div>
    );
  }

  // Render detail contents inside expanding panel
  const renderExpandedContent = (event) => {
    const raw = event.raw;

    switch (event.type) {
      case 'appointment':
        return (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-[10px] text-slate-400 uppercase block">Assigned Doctor</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">{event.doctor}</span>
                <span className="text-indigo-500 font-semibold">{event.specialization}</span>
              </div>
              <div>
                <span className="font-bold text-[10px] text-slate-400 uppercase block">Consultation Type</span>
                <span className="capitalize font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">{raw.type}</span>
              </div>
            </div>
            {raw.notes && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-[10px] text-slate-400 uppercase block">Key complaints / Notes</span>
                <p className="mt-1 text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{raw.notes}</p>
              </div>
            )}
          </div>
        );

      case 'prescription':
        return (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div>
              <span className="font-bold text-[10px] text-slate-400 uppercase block">Physician Diagnosis</span>
              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5">{raw.diagnosis}</p>
            </div>

            {/* Medicines List */}
            <div className="space-y-2">
              <span className="font-bold text-[10px] text-slate-400 uppercase block">Prescribed Medicines</span>
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/40 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                      <th className="p-2.5">Medicine</th>
                      <th className="p-2.5">Dosage</th>
                      <th className="p-2.5">Frequency</th>
                      <th className="p-2.5">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(raw.medicines || []).map((med, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 font-semibold text-slate-700 dark:text-slate-300">
                        <td className="p-2.5 capitalize">{med.name}</td>
                        <td className="p-2.5">{med.dosage}</td>
                        <td className="p-2.5">{med.frequency}</td>
                        <td className="p-2.5">{med.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {raw.instructions && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-[10px] text-slate-400 uppercase block">Instructions</span>
                <p className="mt-1 text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{raw.instructions}</p>
              </div>
            )}
          </div>
        );

      case 'diagnosis':
        const aiRes = raw.aiResponse || {};
        return (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Symptoms Tags */}
            <div className="space-y-1">
              <span className="font-bold text-[10px] text-slate-400 uppercase block">Analyzed Symptoms</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {(raw.symptoms || []).map((sym, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-[10px]">
                    {sym}
                  </span>
                ))}
              </div>
            </div>

            {/* Possible Conditions */}
            <div className="space-y-2">
              <span className="font-bold text-[10px] text-slate-400 uppercase block">AI Possible Conditions</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(aiRes.possibleConditions || []).map((cond, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{cond.name}</span>
                    <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 rounded text-[9px] font-bold uppercase">{cond.probability}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            {aiRes.recommendations && (
              <div className="p-3 bg-indigo-50/20 dark:bg-indigo-950/20 rounded-xl border border-indigo-100/50 dark:border-indigo-950/40">
                <span className="font-bold text-[10px] text-indigo-500 uppercase block">Recommendations</span>
                <p className="mt-1 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{aiRes.recommendations}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-100 dark:border-slate-800/80 space-y-6">
      
      {timelineEvents.map((event) => {
        const isExpanded = expandedEventId === event._id;

        // Resolve colors, icons, and titles based on event types
        const types = {
          appointment: {
            dot: 'bg-blue-500 ring-blue-500/20 text-blue-600',
            bg: 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-100/50 dark:border-blue-900/20',
            icon: Calendar
          },
          prescription: {
            dot: 'bg-emerald-500 ring-emerald-500/20 text-emerald-600',
            bg: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100/50 dark:border-emerald-900/20',
            icon: Pill
          },
          diagnosis: {
            dot: 'bg-amber-500 ring-amber-500/20 text-amber-600',
            bg: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100/50 dark:border-amber-900/20',
            icon: Activity
          }
        };

        const style = types[event.type] || types.appointment;
        const Icon = style.icon;

        return (
          <div key={event._id} className="relative group animate-in slide-in-from-left-4 duration-300">
            
            {/* Timeline Dot Anchor */}
            <div className={`absolute left-[-32px] sm:left-[-40px] top-4 w-5 h-5 rounded-full ${event.type === 'appointment' ? 'bg-blue-500' : event.type === 'prescription' ? 'bg-emerald-500' : 'bg-amber-500'} border-4 border-white dark:border-slate-900 ring-4 ring-slate-100 dark:ring-slate-800/40 flex items-center justify-center`} />

            {/* Event Card Wrapper */}
            <div 
              className={`bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                isExpanded ? 'ring-2 ring-indigo-500/10' : ''
              }`}
              onClick={() => toggleExpand(event._id)}
            >
              
              <div className="flex items-center justify-between gap-4 select-none">
                <div className="flex items-center space-x-3.5">
                  <div className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-100 tracking-tight text-sm">
                      {event.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                      {formatDate(event.date)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status badges or counts */}
                  {event.type === 'appointment' && (
                    <span className={`px-2.5 py-0.5 text-[9px] rounded-full uppercase tracking-wider font-extrabold ${
                      event.raw.status === 'completed' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : event.raw.status === 'cancelled'
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {event.raw.status}
                    </span>
                  )}
                  {event.type === 'prescription' && (
                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-lg text-[10px] font-bold">
                      {(event.raw.medicines || []).length} Rx items
                    </span>
                  )}
                  {event.type === 'diagnosis' && (
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                      event.raw.aiResponse?.riskLevel === 'high' || event.raw.aiResponse?.riskLevel === 'critical'
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {event.raw.aiResponse?.riskLevel} risk
                    </span>
                  )}

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </div>
              </div>

              {/* Collapsed/Expanded detailed segment */}
              {isExpanded && renderExpandedContent(event)}

            </div>

          </div>
        );
      })}

    </div>
  );
};

export default MedicalTimeline;
