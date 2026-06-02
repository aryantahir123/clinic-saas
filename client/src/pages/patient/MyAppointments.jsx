import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  CalendarDays, User, Clock, CheckCircle2, AlertTriangle, ArrowRight, Eye, Calendar, Sparkles, Loader2 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// APIs
import { getPatientAppointments, cancelAppointment } from '../../api/appointmentApi';
import { getPrescriptionsByPatient } from '../../api/prescriptionApi';

const MyAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // State Management
  const [appointments, setAppointments] = useState([]);
  const [rxMap, setRxMap] = useState({}); // Maps appointmentId -> prescriptionId
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all | upcoming | completed | cancelled

  const loadAppointmentsData = async () => {
    try {
      setLoading(true);
      
      const apptsRes = await getPatientAppointments('me').catch(err => {
        console.warn('Silent catch appointments:', err);
        return null;
      });
      
      const prescriptionsRes = await getPrescriptionsByPatient('me').catch(err => {
         console.warn('Silent catch prescriptions:', err);
         return null;
      });

      setAppointments(apptsRes?.data || []);
      
      // Build appointmentId -> prescriptionId mapping for completed lookups
      const mapping = {};
      if (prescriptionsRes?.data && Array.isArray(prescriptionsRes.data)) {
        prescriptionsRes.data.forEach(rx => {
          if (rx.appointmentId) {
            mapping[rx.appointmentId] = rx._id;
          }
        });
      }
      setRxMap(mapping);
    } catch (error) {
      console.error('Error loading patient appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointmentsData();
  }, []);

  // Cancel Appointment Action Handler
  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled appointment?')) {
      return;
    }

    try {
      toast.loading('Cancelling consultation...', { id: 'cancel-appt' });
      await cancelAppointment(id);
      
      // Update local status to cancelled
      setAppointments(prev => 
        prev.map(appt => appt._id === id ? { ...appt, status: 'cancelled' } : appt)
      );

      toast.success('Appointment cancelled successfully', { id: 'cancel-appt' });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(error.response?.data?.error || 'Failed to cancel appointment', { id: 'cancel-appt' });
    }
  };

  // Tab Filtering logic
  const filteredAppointments = appointments.filter(appt => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return appt.status === 'pending' || appt.status === 'confirmed';
    if (activeTab === 'completed') return appt.status === 'completed';
    if (activeTab === 'cancelled') return appt.status === 'cancelled';
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">My Consultations</h1>
          <p className="text-xs text-slate-400 mt-1">Track and manage your scheduled clinical checkups.</p>
        </div>
      </div>

      {/* Filter Tabs Deck */}
      <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-150/60 dark:border-slate-800 p-1 rounded-2xl max-w-lg select-none">
        {['all', 'upcoming', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-black rounded-xl capitalize transition-all ${
              activeTab === tab 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointment Grid Layout */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-3xl space-y-4 shadow-sm select-none">
          <Calendar className="w-14 h-14 stroke-[1.2] text-slate-300 dark:text-slate-750 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-700 dark:text-slate-300 text-base">No appointments found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">No appointments registered under this status. Contact your clinic receptionist to book one.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppointments.map((appt) => {
            const hasPrescription = rxMap[appt._id];
            
            return (
              <div 
                key={appt._id}
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-750 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Doctor Info Row */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h4 className="font-black text-slate-800 dark:text-white text-sm">
                        Dr. {appt.doctorId?.name || 'Physician'}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {appt.doctorId?.specialization || 'General Medicine'}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border select-none ${
                      appt.status === 'confirmed' 
                        ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-950'
                        : appt.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-950'
                        : appt.status === 'cancelled'
                        ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-950'
                        : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-950'
                    }`}>
                      {appt.status}
                    </span>
                  </div>

                  {/* Consultation Time details */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl text-[11px] select-none font-semibold text-slate-600 dark:text-slate-350">
                    <div className="flex items-center space-x-2">
                      <CalendarDays className="w-4 h-4 text-slate-400" />
                      <span>{formatDate(appt.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{appt.timeSlot}</span>
                    </div>
                  </div>
                </div>

                {/* Card footer controls */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center select-none">
                  
                  {/* Consultation Mode Type Badge */}
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                    Mode: <strong className="text-slate-600 dark:text-slate-300">{appt.type || 'Standard'}</strong>
                  </span>

                  {/* Contextual Action key */}
                  <div className="flex gap-2">
                    {appt.status === 'completed' && hasPrescription && (
                      <Link
                        to="/patient/prescriptions"
                        className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Prescription</span>
                      </Link>
                    )}

                    {(appt.status === 'pending' || appt.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancel(appt._id)}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[10px] font-black rounded-xl transition-all"
                      >
                        Cancel Visit
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default MyAppointments;
