import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Calendar, Search, Loader2, Sparkles, CheckCircle2, ChevronRight, User } from 'lucide-react';

// APIs
import { bookAppointment } from '../../api/appointmentApi';
import { searchPatients } from '../../api/patientApi';
import { getDoctorsList } from '../../api/userApi';

// Zod validation schema
const bookingFormSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient'),
  doctorId: z.string().min(1, 'Please select a doctor'),
  date: z.string().min(1, 'Please select an appointment date'),
  timeSlot: z.string().min(1, 'Please select a time slot'),
  type: z.enum(['checkup', 'followup', 'emergency'], {
    errorMap: () => ({ message: 'Please select an appointment type' }),
  }),
  notes: z.string().optional(),
});

// Generated time slots: 9:00 AM to 5:00 PM in 30min intervals
const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM'
];

const BookAppointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // States
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [bookedReceipt, setBookedReceipt] = useState(null);

  // Form setup
  const {
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      patientId: '',
      doctorId: '',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '',
      type: 'checkup',
      notes: ''
    }
  });

  const selectedDoctorId = watch('doctorId');

  // Load doctors on mount
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

  // Handle pre-selected patient from registration route
  useEffect(() => {
    if (location.state?.preselectedPatient) {
      const { id, name, phone } = location.state.preselectedPatient;
      setValue('patientId', id);
      setSelectedPatientName(name);
      setSearchQuery(`${name} (${phone})`);
    }
  }, [location.state, setValue]);

  // Handle outside click to close typeahead dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Patient search handler (search-as-you-type)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      // Do not query if search query matches the currently selected patient's display string
      if (!searchQuery.trim() || searchQuery === `${selectedPatientName}`) return;

      try {
        setSearching(true);
        const response = await searchPatients(searchQuery);
        setSearchResults(response.data || []);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error searching patients:', error);
      } finally {
        setSearching(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedPatientName]);

  // Select patient from typeahead list
  const handleSelectPatient = (patient) => {
    setValue('patientId', patient._id);
    setSelectedPatientName(patient.name);
    setSearchQuery(`${patient.name} (${patient.phone})`);
    setShowDropdown(false);
  };

  // Form Submit Handler
  const onSubmit = async (data) => {
    try {
      const response = await bookAppointment(data);
      toast.success('Appointment booked successfully');
      
      // Match objects for receipt display
      const doctorObj = doctors.find(d => d._id === data.doctorId);
      setBookedReceipt({
        ...response.data,
        patientName: selectedPatientName,
        doctorName: doctorObj?.name || 'Physician',
        specialization: doctorObj?.specialization || 'Medicine',
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.error || 'Failed to book appointment slot');
    }
  };

  // Setup date picker to disable past dates
  const todayString = new Date().toISOString().split('T')[0];

  const handleReset = () => {
    reset({
      patientId: '',
      doctorId: '',
      date: todayString,
      timeSlot: '',
      type: 'checkup',
      notes: ''
    });
    setSearchQuery('');
    setSelectedPatientName('');
    setBookedReceipt(null);
  };

  // Successful booking details receipt screen
  if (bookedReceipt) {
    return (
      <div className="max-w-xl mx-auto py-8 animate-in zoom-in-95 duration-200">
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Appointment Scheduled!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              The appointment has been registered and scheduled in the clinical calendar.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-left space-y-4 max-w-md mx-auto text-sm">
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex justify-between items-center">
              <span className="font-bold text-slate-400 text-xs uppercase">Time slot</span>
              <span className="font-extrabold text-indigo-500 text-base">{bookedReceipt.timeSlot}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-slate-400 text-xs uppercase block">Patient</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{bookedReceipt.patientName}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 text-xs uppercase block">Physician</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{bookedReceipt.doctorName}</span>
                <span className="text-xs text-indigo-500 font-semibold">{bookedReceipt.specialization}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-3">
              <div>
                <span className="font-bold text-slate-400 text-xs uppercase block">Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {new Date(bookedReceipt.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 text-xs uppercase block">Consultation</span>
                <span className="capitalize font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{bookedReceipt.type}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all duration-200 text-sm"
            >
              Book Another
            </button>
            <button
              onClick={() => navigate('/receptionist/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 transition-all duration-200 text-sm"
            >
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
          <Calendar className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Book Appointment
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Schedule patient visits, choose slots, and assign general or specialized doctors.
          </p>
        </div>
      </div>

      {/* Main Booking Card Form */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-md rounded-2xl overflow-hidden p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Patient Search Typeahead */}
          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Search Patient <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value.trim()) {
                    setValue('patientId', '');
                    setSelectedPatientName('');
                  }
                }}
                placeholder="Type patient name or phone number..."
                className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                  errors.patientId ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
                } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 text-sm`}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                {searching ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin text-indigo-500" />
                ) : (
                  <Search className="w-4.5 h-4.5" />
                )}
              </div>
            </div>
            {errors.patientId && (
              <p className="text-xs font-semibold text-rose-500 mt-1">{errors.patientId.message}</p>
            )}

            {/* Typeahead Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                {searchResults.map((patient) => (
                  <div
                    key={patient._id}
                    onClick={() => handleSelectPatient(patient)}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer flex items-center justify-between text-sm group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center font-bold text-xs">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{patient.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{patient.phone} | Age: {patient.age}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                ))}
              </div>
            )}

            {showDropdown && searchResults.length === 0 && searchQuery.trim() && !searching && (
              <div className="absolute z-10 w-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl shadow-xl p-4 text-center text-slate-400 text-sm">
                No matching patients found.
                <button
                  type="button"
                  onClick={() => navigate('/receptionist/patients/register')}
                  className="block mx-auto mt-2 text-xs font-bold text-indigo-500 hover:text-indigo-600"
                >
                  Register New Patient &rarr;
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Doctor */}
            <div className="space-y-1.5">
              <label htmlFor="doctorId" className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Assigned Doctor <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="doctorId"
                control={control}
                render={({ field }) => (
                  <select
                    id="doctorId"
                    {...field}
                    disabled={loadingDoctors}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.doctorId ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
                    } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-4 transition-all duration-200 text-sm disabled:opacity-50`}
                  >
                    <option value="">-- Select Active Physician --</option>
                    {doctors.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.name} ({doc.specialization || 'General'})
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.doctorId && (
                <p className="text-xs font-semibold text-rose-500 mt-1">{errors.doctorId.message}</p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label htmlFor="date" className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Appointment Date <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <input
                    id="date"
                    type="date"
                    min={todayString}
                    {...field}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.date ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
                    } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-4 transition-all duration-200 text-sm`}
                  />
                )}
              />
              {errors.date && (
                <p className="text-xs font-semibold text-rose-500 mt-1">{errors.date.message}</p>
              )}
            </div>

            {/* Time Slot */}
            <div className="space-y-1.5">
              <label htmlFor="timeSlot" className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Time Slot <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="timeSlot"
                control={control}
                render={({ field }) => (
                  <select
                    id="timeSlot"
                    {...field}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.timeSlot ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
                    } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-4 transition-all duration-200 text-sm`}
                  >
                    <option value="">-- Select Time Slot --</option>
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.timeSlot && (
                <p className="text-xs font-semibold text-rose-500 mt-1">{errors.timeSlot.message}</p>
              )}
            </div>

            {/* Appointment Type */}
            <div className="space-y-1.5">
              <label htmlFor="type" className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Appointment Type <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <select
                    id="type"
                    {...field}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.type ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
                    } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-4 transition-all duration-200 text-sm`}
                  >
                    <option value="checkup">Checkup</option>
                    <option value="followup">Follow-up</option>
                    <option value="emergency">Emergency</option>
                  </select>
                )}
              />
              {errors.type && (
                <p className="text-xs font-semibold text-rose-500 mt-1">{errors.type.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label htmlFor="notes" className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Notes / Key Complaints
            </label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <textarea
                  id="notes"
                  rows={4}
                  {...field}
                  placeholder="Describe standard medical complaints, symptoms, or instructions..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 text-sm"
                />
              )}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 transition-all duration-200 text-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Scheduling Slot...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4.5 h-4.5" />
                  <span>Book Appointment</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
