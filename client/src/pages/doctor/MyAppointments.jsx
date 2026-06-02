import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { 
  CalendarDays, Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Eye, Calendar, Clock, UserCheck, ArrowRight
} from 'lucide-react';

// Custom components
import { getDoctorAppointments, updateStatus } from '../../api/appointmentApi';

const MyAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // State Management
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Load appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;

      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;

      const response = await getDoctorAppointments(user.id, params);
      setAppointments(response.data || []);
      setCurrentPage(1); // Reset to page 1 on new load
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      toast.error('Failed to load appointments calendar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user, statusFilter, dateFilter]);

  // Client-side search filtering for patient name
  useEffect(() => {
    let result = appointments;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(appt => 
        appt.patientId?.name?.toLowerCase().includes(q)
      );
    }

    setFilteredAppointments(result);
  }, [appointments, searchQuery]);

  // Handle status update dropdown change
  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await updateStatus(appointmentId, newStatus);
      toast.success(`Appointment status updated to ${newStatus}`);
      fetchAppointments(); // Reload list
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error(error.response?.data?.error || 'Failed to update appointment status');
    }
  };

  // Pagination Math
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Allowed transitions validator for rendering select dropdown options
  const renderStatusOptions = (currentStatus) => {
    if (currentStatus === 'pending') {
      return (
        <>
          <option value="pending" disabled>Pending</option>
          <option value="confirmed">Confirm</option>
          <option value="cancelled">Cancel</option>
        </>
      );
    }
    if (currentStatus === 'confirmed') {
      return (
        <>
          <option value="confirmed" disabled>Confirmed</option>
          <option value="completed">Complete</option>
          <option value="cancelled">Cancel</option>
        </>
      );
    }
    // Completed or Cancelled - locked
    return (
      <option value={currentStatus} disabled className="capitalize">
        {currentStatus}
      </option>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
          My Consultations Calendar 📅
        </h1>
        <p className="text-xs text-slate-400 mt-1">Review your appointments backlog, filter dates, and register consults.</p>
      </div>

      {/* Dynamic Multi-Filter Console */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-4">
        
        {/* Patient Name Search */}
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 transition-all duration-200"
          />
        </div>

        {/* Filters Deck */}
        <div className="flex flex-wrap items-center gap-3.5 w-full md:w-auto">
          
          {/* Status Dropdown */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
            />
          </div>

          {/* Reset Action */}
          <button
            onClick={() => {
              setStatusFilter('');
              setDateFilter('');
              setSearchQuery('');
            }}
            className="p-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-500 rounded-xl transition-all"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Appointments Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-56 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl border border-slate-100" />
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-3xl">
          <CalendarDays className="w-14 h-14 stroke-[1.2] text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="font-extrabold text-slate-700 dark:text-slate-300 mt-4 text-base">No appointments found</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the status/date filters or search query.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentItems.map((appt) => {
              const patient = appt.patientId || {};
              const isCompleted = appt.status === 'completed';
              const isCancelled = appt.status === 'cancelled';
              const isConfirmed = appt.status === 'confirmed';

              return (
                <div 
                  key={appt._id}
                  className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-250 flex flex-col justify-between h-64 group relative overflow-hidden"
                >
                  {/* Decorative background glow on hover */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-indigo-600/0 rounded-full blur group-hover:scale-125 transition-transform duration-500" />

                  {/* Header info */}
                  <div className="space-y-2 relative z-10">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        appt.type === 'emergency' 
                          ? 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400' 
                          : 'bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400'
                      }`}>
                        {appt.type}
                      </span>
                      
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                        isCompleted 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : isConfirmed
                          ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400'
                          : isCancelled
                          ? 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-450'
                          : 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400'
                      }`}>
                        {appt.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-base tracking-tight truncate">
                        {patient.name || 'Unknown Patient'}
                      </h4>
                      {/* Age & Gender chip */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-750 text-slate-400 rounded text-[10px] font-bold uppercase">
                          Age: {patient.age || 'N/A'}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-750 text-slate-400 rounded text-[10px] font-bold uppercase">
                          {patient.gender || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mid Segment - Date & Time */}
                  <div className="text-xs text-slate-400 space-y-1 mt-4 relative z-10">
                    <div className="flex items-center space-x-1.5 font-semibold text-slate-500 dark:text-slate-350">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(appt.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 font-bold text-indigo-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{appt.timeSlot}</span>
                    </div>
                  </div>

                  {/* Actions segment */}
                  <div className="flex items-center gap-2 mt-5 border-t border-slate-100 dark:border-slate-700/50 pt-3 relative z-10">
                    
                    {/* View Patient Button */}
                    <button
                      onClick={() => navigate(`/doctor/patients/${patient._id}`, { state: { appointmentId: appt._id } })}
                      className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1 flex-1 transition-colors"
                      title="View Patient Record"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    {/* Status Dropdown selector */}
                    <select
                      value={appt.status}
                      disabled={isCompleted || isCancelled}
                      onChange={(e) => handleStatusChange(appt._id, e.target.value)}
                      className={`px-2 py-2 border ${
                        isCompleted || isCancelled 
                          ? 'bg-slate-100 border-slate-200 text-slate-400' 
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 dark:border-slate-700 text-slate-750 dark:text-slate-200'
                      } text-xs font-bold rounded-xl focus:outline-none cursor-pointer flex-1 transition-colors`}
                    >
                      {renderStatusOptions(appt.status)}
                    </select>

                  </div>

                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50 pt-5 select-none">
              <span className="text-xs text-slate-400 font-semibold">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAppointments.length)} of {filteredAppointments.length} appointments
              </span>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-500 rounded-xl transition-all disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350 px-2">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-500 rounded-xl transition-all disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default MyAppointments;
