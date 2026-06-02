import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { 
  CalendarDays, FileText, CheckCircle2, UserSquare2, Sparkles, Lock, Brain, ChevronDown, ChevronUp, Search, UserCheck
} from 'lucide-react';

// Custom Components & Shared
import StatsCard from '../../components/common/StatsCard';
import SymptomChecker from '../../components/ai/SymptomChecker';
import UpgradePrompt from '../../components/common/UpgradePrompt';

// APIs
import { getDoctorStats } from '../../api/analyticsApi';
import { getTodaysAppointments } from '../../api/appointmentApi';
import { searchPatients } from '../../api/patientApi';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // State Management
  const [stats, setStats] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick AI Panel States
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isPro = user?.subscriptionPlan === 'pro';

  // Load Dashboard Data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        if (!user?.id) return;

        // Fetch KPI Stats & Daily Appointments Queue in parallel
        const [statsRes, queueRes] = await Promise.all([
          getDoctorStats(user.id),
          getTodaysAppointments()
        ]);

        setStats(statsRes.data);
        setQueue(queueRes.data || []);
      } catch (error) {
        console.error('Error loading doctor dashboard:', error);
        toast.error('Failed to load clinical dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Debounced Patient Search for AI symptom checker
  useEffect(() => {
    if (!patientSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const response = await searchPatients(patientSearchQuery);
        setSearchResults(response.data || []);
      } catch (error) {
        console.error('Error searching patients:', error);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [patientSearchQuery]);

  // Patient Avatar Initials
  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Brand Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
            Welcome, Dr. {user?.name || 'Physician'} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">Here is your clinical consultations overview for today.</p>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Scheduled"
          value={stats?.todayAppointments || 0}
          icon={CalendarDays}
          accent="blue"
          loading={loading}
        />
        <StatsCard
          title="Monthly Consults"
          value={stats?.monthlyAppointments || 0}
          icon={UserSquare2}
          accent="purple"
          loading={loading}
        />
        <StatsCard
          title="Total Signed Rx"
          value={stats?.totalPrescriptions || 0}
          icon={FileText}
          accent="green"
          loading={loading}
        />
        <StatsCard
          title="Completed Today"
          value={stats?.completedToday || 0}
          icon={CheckCircle2}
          accent="amber"
          loading={loading}
        />
      </div>

      {/* Today's Queue Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/50 mb-5">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Today's Appointment Queue</h3>
            <p className="text-xs text-slate-400">Consultations ordered by assigned time-slots.</p>
          </div>
          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-full text-xs font-bold">
            {queue.length} Total
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 w-full bg-slate-50 dark:bg-slate-900 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : queue.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
            <CalendarDays className="w-12 h-12 stroke-[1.5] mx-auto text-slate-300 dark:text-slate-700" />
            <p className="font-semibold text-sm mt-3">Your schedule queue is completely empty today.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map((appt) => {
              const patient = appt.patientId || {};
              const isConfirmed = appt.status === 'confirmed';
              const isCompleted = appt.status === 'completed';

              return (
                <div 
                  key={appt._id}
                  className="bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-200 dark:hover:border-slate-750 transition-all duration-200"
                >
                  {/* Left demographics info */}
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-extrabold flex items-center justify-center shadow-md shadow-indigo-500/10 shrink-0 text-sm">
                      {getInitials(patient.name)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{patient.name || 'Unknown Patient'}</h4>
                      <div className="flex flex-wrap gap-2 items-center text-[11px] text-slate-400 font-semibold mt-1">
                        <span>Age: {patient.age || 'N/A'}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className="capitalize">{patient.gender || 'N/A'}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className="text-indigo-500">{appt.timeSlot}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto self-end sm:self-center justify-between sm:justify-end">
                    <div className="flex gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        appt.type === 'emergency' 
                          ? 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400' 
                          : 'bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400'
                      }`}>
                        {appt.type}
                      </span>
                      
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isCompleted 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : isConfirmed
                          ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400'
                          : 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400'
                      }`}>
                        {appt.status}
                      </span>
                    </div>

                    {/* Action trigger */}
                    {isConfirmed && (
                      <button
                        onClick={() => navigate(`/doctor/patients/${patient._id}`, { state: { appointmentId: appt._id } })}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/10 transition-colors"
                      >
                        Start Consultation
                      </button>
                    )}
                    {isCompleted && (
                      <button
                        onClick={() => navigate(`/doctor/patients/${patient._id}`)}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl transition-colors"
                      >
                        View Profile
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick AI Panel (collapsible section at bottom) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
        
        {/* Toggle Header */}
        <button
          onClick={() => {
            if (!isPro) {
              setShowUpgradeModal(true);
            } else {
              setIsAiExpanded(!isAiExpanded);
            }
          }}
          className="w-full px-6 py-4 flex items-center justify-between bg-slate-55 dark:bg-slate-900/10 hover:bg-slate-100/30 dark:hover:bg-slate-800/40 transition-colors select-none"
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-amber-600 text-white rounded-xl shadow-sm shadow-amber-500/10">
              <Sparkles className="w-4 h-4 fill-white stroke-[2.5]" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm tracking-tight block">AI Symptom Checker</span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Gemini-powered immediate diagnostic recommendations.</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isPro && (
              <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[9px] font-black uppercase flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>PRO FEATURE</span>
              </span>
            )}
            {isPro && (
              isAiExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {/* Free Plan Locked Blur Overlay */}
        {!isPro ? (
          <div className="relative h-24 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-center select-none">
            <div className="absolute inset-0 backdrop-blur-xs flex items-center justify-center bg-slate-50/20 dark:bg-slate-900/10">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 hover:scale-105 transition-transform"
              >
                <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Upgrade to Pro to Unlock AI Features</span>
              </button>
            </div>
          </div>
        ) : (
          /* Pro Content Area */
          isAiExpanded && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-700/50 space-y-6 animate-in slide-in-from-top-4 duration-300">
              
              {/* Select a Patient first */}
              {!selectedPatient ? (
                <div className="space-y-4 max-w-xl mx-auto py-4">
                  <div className="text-center space-y-1.5 mb-2">
                    <Brain className="w-10 h-10 text-indigo-500 mx-auto stroke-[1.5] animate-pulse" />
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Select patient profile to assess</h4>
                    <p className="text-xs text-slate-400">Search by patient name or phone to load demographic context</p>
                  </div>

                  {/* Debounced Search box */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                      placeholder="Type patient name or phone registration..."
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400"
                    />
                  </div>

                  {/* Results List */}
                  {searchResults.length > 0 && (
                    <div className="border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950/50 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 shadow-md">
                      {searchResults.map((p) => (
                        <button
                          key={p._id}
                          onClick={() => {
                            setSelectedPatient(p);
                            setPatientSearchQuery('');
                            setSearchResults([]);
                          }}
                          className="w-full p-3.5 text-left text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 flex justify-between items-center text-slate-700 dark:text-slate-300"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 dark:text-white block text-sm">{p.name}</span>
                            <span className="text-slate-400 block font-normal">Phone: {p.phone}</span>
                          </div>
                          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold uppercase">Select</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Patient selected, render checker */
                <div className="space-y-5">
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <div className="flex items-center space-x-2.5">
                      <UserCheck className="w-5 h-5 text-indigo-500" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Assessing Patient</span>
                        <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{selectedPatient.name}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPatient(null)}
                      className="text-xs font-bold text-rose-500 hover:underline"
                    >
                      Change Patient
                    </button>
                  </div>

                  <SymptomChecker
                    patientId={selectedPatient._id}
                    patientAge={selectedPatient.age}
                    patientGender={selectedPatient.gender}
                  />
                </div>
              )}

            </div>
          )
        )}

      </div>

      {/* Upgrade Pro Plan popup Prompt dialog */}
      <UpgradePrompt
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

    </div>
  );
};

export default DoctorDashboard;
