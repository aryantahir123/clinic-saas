import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  CalendarDays, FileText, CheckCircle2, UserSquare2, ChevronRight, Eye, Download, ShieldAlert, Clock, User 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// APIs & shared
import { getPatientById, getPatientHistory } from '../../api/patientApi';
import { downloadPDF } from '../../api/prescriptionApi';
import StatsCard from '../../components/common/StatsCard';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // State Management
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState({ appointments: [], prescriptions: [], diagnosisLogs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch patient profile — may not exist yet for new registrations
        const patientRes = await getPatientById('me').catch(err => {
          console.warn('Silent catch patient profile:', err);
          return null; // No patient record yet
        });

        if (patientRes) {
          setPatient(patientRes.data);
          // Only fetch history if patient record exists
          const historyRes = await getPatientHistory('me').catch(() => null);
          if (historyRes) {
            setHistory(historyRes.data || { appointments: [], prescriptions: [], diagnosisLogs: [] });
          }
        }
      } catch (error) {
        console.error('Error loading patient dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Compute Upcoming appointments
  const upcomingAppointments = (history.appointments || [])
    .filter(appt => {
      const apptDate = new Date(appt.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return apptDate >= today && appt.status !== 'cancelled' && appt.status !== 'completed';
    })
    .slice(0, 3); // Take next 3

  // Compute Last Visit Date
  const lastVisitAppointment = (history.appointments || [])
    .find(appt => appt.status === 'completed');
  
  const lastVisitDate = lastVisitAppointment
    ? new Date(lastVisitAppointment.date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'No visits yet';

  // Handle PDF Prescription Download
  const handlePdfDownload = async (prescriptionId) => {
    try {
      toast.loading('Compiling medical document...', { id: 'pdf-download' });
      const blob = await downloadPDF(prescriptionId);
      
      const fileUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', `prescription_${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      URL.revokeObjectURL(fileUrl);
      toast.success('Document downloaded successfully', { id: 'pdf-download' });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to export prescription PDF file', { id: 'pdf-download' });
    }
  };

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
        <div className="h-28 w-full bg-slate-100 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Greeting Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
          Welcome back, {patient?.name || user?.name || 'Patient'} 👋
        </h1>
        <p className="text-xs text-slate-400 mt-1">Review your personal health analytics, active appointments, and digital files.</p>
      </div>

      {/* 2. Stats KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Upcoming Consults"
          value={(history.appointments || []).filter(a => a.status === 'confirmed' || a.status === 'pending').length}
          icon={CalendarDays}
          accent="blue"
          loading={loading}
        />
        <StatsCard
          title="Total Prescriptions"
          value={(history.prescriptions || []).length}
          icon={FileText}
          accent="purple"
          loading={loading}
        />
        <StatsCard
          title="Last Visit Record"
          value={lastVisitDate}
          icon={CheckCircle2}
          accent="emerald"
          loading={loading}
        />
      </div>

      {/* 3. Splitted Queue Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Next 3 Upcoming Appointments */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-indigo-500" />
                <h3 className="font-extrabold text-slate-855 dark:text-slate-100 text-sm">Upcoming Consultations</h3>
              </div>
              <Link 
                to="/patient/appointments"
                className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center hover:underline"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                <CalendarDays className="w-10 h-10 mx-auto stroke-[1.5] text-slate-350 dark:text-slate-700" />
                <p className="font-semibold text-xs mt-3">No upcoming clinical checkups scheduled.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appt) => (
                  <div 
                    key={appt._id}
                    className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-xs">
                        Dr. {appt.doctorId?.name || 'Physician'}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
                        <span>{formatDate(appt.date)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-350 dark:bg-slate-700" />
                        <span className="text-indigo-500">{appt.timeSlot}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        appt.status === 'confirmed' 
                          ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400' 
                          : 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Last 2 Prescriptions Row */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h3 className="font-extrabold text-slate-855 dark:text-slate-100 text-sm">Recent Prescription Files</h3>
              </div>
              <Link 
                to="/patient/prescriptions"
                className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center hover:underline"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {(history.prescriptions || []).length === 0 ? (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                <FileText className="w-10 h-10 mx-auto stroke-[1.5] text-slate-350 dark:text-slate-700" />
                <p className="font-semibold text-xs mt-3">No prescriptions logged in your profile yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(history.prescriptions || []).slice(0, 2).map((rx) => (
                  <div 
                    key={rx._id}
                    className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-xs">
                        Dr. {rx.doctorId?.name || 'Physician'}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">
                        Issued: {new Date(rx.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded text-[9px] font-bold uppercase border border-emerald-100">
                        {(rx.medicines || []).length} Medicines
                      </span>
                      
                      <button
                        onClick={() => handlePdfDownload(rx._id)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-500 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default PatientDashboard;
