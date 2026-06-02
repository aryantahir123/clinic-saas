import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, CheckCircle, PlusCircle, CalendarPlus, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Custom Components
import StatsCard from '../../components/common/StatsCard';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

// APIs
import { getTodaysAppointments, updateStatus } from '../../api/appointmentApi';
import { getPatients } from '../../api/patientApi';

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch today's appointments
      const appointmentsResponse = await getTodaysAppointments();
      setAppointments(appointmentsResponse.data || []);

      // Fetch all patients for total count
      const patientsResponse = await getPatients({ limit: 1 });
      setTotalPatients(patientsResponse.data?.totalCount || 0);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle confirming a pending appointment
  const handleConfirm = async (appointmentId) => {
    try {
      await updateStatus(appointmentId, 'confirmed');
      toast.success('Appointment confirmed successfully');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error(error.response?.data?.error || 'Failed to confirm appointment');
    }
  };

  // Open view details modal
  const handleView = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  // Derive stats from today's schedule
  const todayAppointmentsCount = appointments.length;
  const pendingConfirmationsCount = appointments.filter(a => a.status === 'pending').length;
  const completedTodayCount = appointments.filter(a => a.status === 'completed').length;

  // Table columns definition
  const columns = [
    {
      key: 'timeSlot',
      label: 'Time',
      render: (val) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {val}
        </span>
      )
    },
    {
      key: 'patientId',
      label: 'Patient',
      render: (patient) => (
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{patient?.name || 'Unknown'}</p>
          <p className="text-xs text-slate-400">{patient?.phone || '-'}</p>
        </div>
      )
    },
    {
      key: 'doctorId',
      label: 'Doctor',
      render: (doctor) => (
        <div>
          <p className="font-medium text-slate-700 dark:text-slate-200">{doctor?.name || 'Unassigned'}</p>
          <p className="text-xs text-indigo-500 font-medium">{doctor?.specialization || '-'}</p>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (type) => (
        <span className="capitalize text-slate-600 dark:text-slate-400 font-medium">
          {type}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => {
        const badges = {
          pending: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/30',
          confirmed: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30',
          completed: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30',
          cancelled: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/30',
        };
        const style = badges[status] || badges.pending;
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${style}`}>
            {status}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          {row.status === 'pending' && (
            <button
              onClick={() => handleConfirm(row._id)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:hover:bg-indigo-900 dark:text-indigo-400 transition-all duration-200"
            >
              Confirm
            </button>
          )}
          <button
            onClick={() => handleView(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200"
            title="View Details"
          >
            <Eye className="w-4.5 h-4.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome back!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1.5">
          Here is what is happening at the clinic today.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Today's Appointments"
          value={todayAppointmentsCount}
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          title="Registered Patients"
          value={totalPatients}
          icon={Users}
          color="green"
        />
        <StatsCard
          title="Pending Confirmations"
          value={pendingConfirmationsCount}
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="Completed Today"
          value={completedTodayCount}
          icon={CheckCircle}
          color="purple"
        />
      </div>

      {/* Quick Actions Row */}
      <div className="bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/receptionist/patients/register')}
            className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-0.5 group"
          >
            <div className="flex items-center space-x-4 text-left">
              <div className="p-3 bg-white/10 rounded-xl group-hover:rotate-6 transition-transform">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Register New Patient</h3>
                <p className="text-xs text-indigo-100 mt-0.5">Add basic information & medical history</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/receptionist/appointments/book')}
            className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-0.5 group"
          >
            <div className="flex items-center space-x-4 text-left">
              <div className="p-3 bg-white/10 rounded-xl group-hover:rotate-6 transition-transform">
                <CalendarPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Book Appointment</h3>
                <p className="text-xs text-emerald-100 mt-0.5">Schedule clinic visits and select slots</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Today's Schedule Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Today's Schedule
          </h2>
          <button 
            onClick={() => navigate('/receptionist/schedule')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            View Full Roster &rarr;
          </button>
        </div>
        
        <DataTable
          columns={columns}
          data={appointments}
          loading={loading}
          emptyMessage="No appointments scheduled for today."
        />
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAppointment(null);
          }}
          title="Appointment Details"
          size="md"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-4">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Scheduled Time</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                  {selectedAppointment.timeSlot} ({new Date(selectedAppointment.date).toLocaleDateString()})
                </p>
              </div>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                selectedAppointment.status === 'confirmed' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                selectedAppointment.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                selectedAppointment.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                'bg-amber-50 text-amber-600 border border-amber-100'
              }`}>
                {selectedAppointment.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Patient Information</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedAppointment.patientId?.name || '-'}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{selectedAppointment.patientId?.phone || '-'}</p>
                {selectedAppointment.patientId?.age && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedAppointment.patientId.age} yrs | {selectedAppointment.patientId.gender || '-'}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Assigned Doctor</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedAppointment.doctorId?.name || '-'}</p>
                <p className="text-sm text-indigo-500 font-medium mt-0.5">{selectedAppointment.doctorId?.specialization || '-'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Appointment Type</p>
              <p className="capitalize text-slate-700 dark:text-slate-300 font-medium mt-1">
                {selectedAppointment.type}
              </p>
            </div>

            {selectedAppointment.notes && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase">Notes & Instructions</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {selectedAppointment.notes}
                </p>
              </div>
            )}

            {selectedAppointment.status === 'pending' && (
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <button
                  onClick={() => {
                    handleConfirm(selectedAppointment._id);
                    setIsModalOpen(false);
                    setSelectedAppointment(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Confirm Appointment
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReceptionistDashboard;
