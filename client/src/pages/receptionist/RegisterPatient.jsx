import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { UserPlus, Sparkles, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react';

// Custom Components
import TagInput from '../../components/common/TagInput';

// APIs
import { createPatient } from '../../api/patientApi';
import { getDoctorsList } from '../../api/userApi';

// Zod Schema definition
const patientFormSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  age: z.coerce
    .number({ invalid_type_error: 'Age must be a number' })
    .min(0, 'Age cannot be negative')
    .max(120, 'Age cannot exceed 120'),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Please select a gender' }),
  }),
  phone: z.string().min(1, 'Phone number is required').trim(),
  email: z.string().email('Invalid email address').or(z.literal('')),
  address: z.string().optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'], {
    errorMap: () => ({ message: 'Please select a blood group' }),
  }),
  assignedDoctor: z.string().optional().or(z.literal('')),
});

const RegisterPatient = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState(null);

  // React Hook Form hooks
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: '',
      age: '',
      gender: 'male',
      phone: '',
      email: '',
      address: '',
      bloodGroup: 'Unknown',
      assignedDoctor: '',
    },
  });

  // Fetch active doctors roster
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

  // Form Submit Handler
  const onSubmit = async (data) => {
    try {
      // Cleanup optional fields
      const cleanedData = {
        ...data,
        email: data.email || undefined,
        assignedDoctor: data.assignedDoctor || undefined,
      };

      const response = await createPatient(cleanedData);
      
      toast.success('Patient registered successfully');
      setRegisteredPatient(response.data);
    } catch (error) {
      console.error('Error registering patient:', error);
      toast.error(error.response?.data?.error || 'Failed to register patient profile');
    }
  };

  // Reset form to register another
  const handleRegisterAnother = () => {
    reset();
    setRegisteredPatient(null);
  };

  // Book appointment for this registered patient
  const handleBookAppointment = () => {
    if (registeredPatient) {
      navigate('/receptionist/appointments/book', {
        state: { 
          preselectedPatient: {
            id: registeredPatient._id,
            name: registeredPatient.name,
            phone: registeredPatient.phone
          }
        }
      });
    }
  };

  // Post-submit success screen
  if (registeredPatient) {
    return (
      <div className="max-w-xl mx-auto py-12 animate-in zoom-in-95 duration-200">
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Patient Registered!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-sm mx-auto">
              A clinical profile for <span className="font-semibold text-slate-800 dark:text-slate-200">{registeredPatient.name}</span> has been created successfully.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col gap-2.5 max-w-sm mx-auto text-left text-sm text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span className="font-medium text-slate-400 text-xs uppercase">Phone</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{registeredPatient.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-400 text-xs uppercase">Blood Group</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{registeredPatient.bloodGroup}</span>
            </div>
            {registeredPatient.assignedDoctor && (
              <div className="flex justify-between">
                <span className="font-medium text-slate-400 text-xs uppercase">Physician</span>
                <span className="font-semibold text-indigo-500">
                  {doctors.find(d => d._id === registeredPatient.assignedDoctor)?.name || 'Assigned Doctor'}
                </span>
              </div>
            )}
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRegisterAnother}
              className="px-6 py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all duration-200 text-sm"
            >
              Register Another
            </button>
            <button
              onClick={handleBookAppointment}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 transition-all duration-200 text-sm"
            >
              <span>Book Appointment</span>
              <ArrowRight className="w-4.5 h-4.5" />
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
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <UserPlus className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Register New Patient
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Create a medical profile and link patient demographics.
          </p>
        </div>
      </div>

      {/* Main Registration Card Form */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-md rounded-2xl overflow-hidden p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                placeholder="John Doe"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.name ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
                } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 text-sm`}
              />
              {errors.name && (
                <p className="text-xs font-semibold text-rose-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                id="phone"
                type="text"
                {...register('phone')}
                placeholder="+92 300 1234567"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.phone ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
                } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 text-sm`}
              />
              {errors.phone && (
                <p className="text-xs font-semibold text-rose-500 mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <label htmlFor="age" className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Age <span className="text-rose-500">*</span>
              </label>
              <input
                id="age"
                type="number"
                {...register('age')}
                placeholder="32"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.age ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
                } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 text-sm`}
              />
              {errors.age && (
                <p className="text-xs font-semibold text-rose-500 mt-1">{errors.age.message}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label htmlFor="gender" className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                id="gender"
                {...register('gender')}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.gender ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
                } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-4 transition-all duration-200 text-sm`}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-xs font-semibold text-rose-500 mt-1">{errors.gender.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                placeholder="john@example.com"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.email ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
                } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 text-sm`}
              />
              {errors.email && (
                <p className="text-xs font-semibold text-rose-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Blood Group */}
            <div className="space-y-1.5">
              <label htmlFor="bloodGroup" className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Blood Group
              </label>
              <select
                id="bloodGroup"
                {...register('bloodGroup')}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.bloodGroup ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
                } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-4 transition-all duration-200 text-sm`}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="Unknown">Unknown</option>
              </select>
              {errors.bloodGroup && (
                <p className="text-xs font-semibold text-rose-500 mt-1">{errors.bloodGroup.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label htmlFor="address" className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Residential Address
            </label>
            <input
              id="address"
              type="text"
              {...register('address')}
              placeholder="123 Main St, Karachi, Pakistan"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 text-sm"
            />
          </div>

          {/* Assigned Doctor */}
          <div className="space-y-1.5">
            <label htmlFor="assignedDoctor" className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Assigned Doctor
            </label>
            <select
              id="assignedDoctor"
              {...register('assignedDoctor')}
              disabled={loadingDoctors}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">-- Select Assigned Doctor (Optional) --</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.name} - {doc.specialization || 'General Physician'}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700/50 pt-6 my-6" />

          {/* Allergies (TagInput) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Allergies
            </label>
            <Controller
              name="allergies"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Type an allergy (e.g. Penicillin) and press Enter"
                />
              )}
            />
          </div>

          {/* Chronic Conditions (TagInput) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Chronic Conditions
            </label>
            <Controller
              name="chronicConditions"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Type a condition (e.g. Hypertension) and press Enter"
                />
              )}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering Profile...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4.5 h-4.5" />
                  <span>Register Patient</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RegisterPatient;
