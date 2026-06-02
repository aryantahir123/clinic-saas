import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, User, Filter, Check, Ban, CheckSquare, Clock } from 'lucide-react';

// Custom Components
import DataTable from '../../components/common/DataTable';

// APIs
import { getAppointments, updateStatus } from '../../api/appointmentApi';
import { getDoctorsList } from '../../api/userApi';

const DailySchedule = () => {
  // Filter States
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  
  // Data States
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const response = await getDoctorsList();
        setDoctors(response.data || []);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast.error('Failed to load active physician directory');
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch appointments based on filters
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        date: selectedDate,
      };
      if (selectedDoctor) {
        params.doctorId = selectedDoctor;
      }
      
      const response = await getAppointments(params);
      // Backend returns pagination structure: { appointments, totalCount, page, limit }
      setAppointments(response.data?.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, selectedDoctor]);

  // Handle status update
  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await updateStatus(appointmentId, newStatus);
      toast.success(`Appointment marked as ${newStatus}`);
      fetchAppointments(); // Refresh roster
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.error || 'Failed to update appointment status');
    }
  };

  // Roster Columns Definition
  const columns = [
    {
      key: 'timeSlot',
      label: 'Time',
      render: (val) => (
        <span className="font-bold text-slate-800 dark:text-slate-200">
          {val}
        </span>
      )
    },
    {
      key: 'patientId',
      label: 'Patient Name',
      render: (patient) => (
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-100">{patient?.name || 'Unknown'}</p>
          <p className="text-xs text-slate-400">{patient?.phone || '-'}</p>
        </div>
      )
    },
    {
      key: 'doctorId',
      label: 'Doctor',
      render: (doctor) => (
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-200">{doctor?.name || 'Unassigned'}</p>
          <p className="text-xs text-indigo-500 font-medium">{doctor?.specialization || '-'}</p>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (type) => (
        <span className="capitalize text-slate-600 dark:text-slate-400 font-medium text-xs">
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
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${style}`}>
            {status}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Action Buttons',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.status === 'pending' && (
            <button
              onClick={() => handleStatusChange(row._id, 'confirmed')}
              className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold transition-colors flex items-center gap-1 border border-blue-100/50 dark:border-blue-900/30"
              title="Confirm Appointment"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm</span>
            </button>
          )}

          {row.status === 'confirmed' && (
            <button
              onClick={() => handleStatusChange(row._id, 'completed')}
              className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors flex items-center gap-1 border border-emerald-100/50 dark:border-emerald-900/30"
              title="Mark Completed"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Complete</span>
            </button>
          )}

          {row.status !== 'completed' && row.status !== 'cancelled' && (
            <button
              onClick={() => handleStatusChange(row._id, 'cancelled')}
              className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors flex items-center gap-1 border border-rose-100/50 dark:border-rose-900/30"
              title="Cancel Appointment"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}

          {(row.status === 'completed' || row.status === 'cancelled') && (
            <span className="text-xs text-slate-400 font-medium italic">No actions available</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Clock className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Daily Schedule
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Review and manage today's consults, confirm arrivals, and control status queues.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center">
        
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm font-semibold uppercase tracking-wider shrink-0 mr-2">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {/* Date Picker */}
          <div className="space-y-1">
            <label htmlFor="scheduleDate" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Consultation Date
            </label>
            <input
              id="scheduleDate"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 text-sm"
            />
          </div>

          {/* Doctor Filter Dropdown */}
          <div className="space-y-1">
            <label htmlFor="doctorFilter" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Filter by Physician
            </label>
            <select
              id="doctorFilter"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              disabled={loadingDoctors}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 text-sm disabled:opacity-50"
            >
              <option value="">-- All Doctors --</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.name} - {doc.specialization}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Roster Table Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Active Appointments roster ({appointments.length})
          </p>
        </div>

        <DataTable
          columns={columns}
          data={appointments}
          loading={loading}
          emptyMessage="No appointments scheduled for this selection."
        />
      </div>

    </div>
  );
};

export default DailySchedule;
