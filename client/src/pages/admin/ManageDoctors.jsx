import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { 
  Stethoscope, Plus, Pencil, Power, Eye, Copy, Check, ChevronLeft, ChevronRight, RefreshCw, Key
} from 'lucide-react';

// Custom Components
import DataTable from '../../components/common/DataTable';
import SlideOver from '../../components/common/SlideOver';
import Modal from '../../components/common/Modal';

// APIs
import { 
  getUsers, adminCreateUser, updateUserProfile, deactivateUserProfile, updateSubscriptionPlan 
} from '../../api/userApi';

// Schema for Doctor Form
const doctorSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().min(1, 'Email is required').email('Invalid email address').trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(1, 'Phone is required').trim(),
  specialization: z.string().min(1, 'Specialization is required').trim(),
  licenseNumber: z.string().min(1, 'License Number is required').trim(),
  subscriptionPlan: z.enum(['free', 'pro']),
});

const ManageDoctors = () => {
  // List States
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState(false);

  // Modal / SlideOver States
  const [panelOpen, setPanelOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState(null);

  // Form hooks
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      specialization: '',
      licenseNumber: '',
      subscriptionPlan: 'free'
    }
  });

  const formPassword = watch('password');

  // Fetch all active users and filter doctors
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      // Users array holds all users
      const allUsers = response.data || [];
      const doctorsList = allUsers.filter(u => u.role === 'doctor');
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to retrieve physician logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Helper to generate a secure random password
  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let pass = 'Doc@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue('password', pass);
  };

  // Open panel in Create Mode
  const handleOpenCreate = () => {
    setEditingDoctor(null);
    reset({
      name: '',
      email: '',
      password: '',
      phone: '',
      specialization: '',
      licenseNumber: '',
      subscriptionPlan: 'free'
    });
    setPanelOpen(true);
    // Generate initial password with a minor delay so the form field registers the value change
    setTimeout(generatePassword, 50);
  };

  // Open panel in Edit Mode
  const handleOpenEdit = (doc) => {
    setEditingDoctor(doc);
    reset({
      name: doc.name,
      email: doc.email,
      password: '********', // placeholder, password cannot be viewed, only updated
      phone: doc.phone || '',
      specialization: doc.specialization || '',
      licenseNumber: doc.licenseNumber || '',
      subscriptionPlan: doc.subscriptionPlan || 'free'
    });
    setPanelOpen(true);
  };

  // Submit Handler (Create or Edit)
  const onSubmit = async (data) => {
    try {
      if (editingDoctor) {
        // Edit Mode: update profile
        const updatedData = { ...data };
        delete updatedData.password; // do not send password update unless explicitly required
        delete updatedData.subscriptionPlan; // plan updated via subscription endpoint

        await updateUserProfile(editingDoctor._id, updatedData);
        
        // If subscription changed, update subscription
        if (data.subscriptionPlan !== editingDoctor.subscriptionPlan) {
          await updateSubscriptionPlan(editingDoctor._id, data.subscriptionPlan);
        }

        toast.success('Physician details updated successfully');
      } else {
        // Create Mode: Register user
        const createData = {
          ...data,
          role: 'doctor'
        };

        const createResponse = await adminCreateUser(createData);
        const newDoc = createResponse.data;

        // If plan is 'pro', trigger subscription upgrade immediately
        if (data.subscriptionPlan === 'pro' && newDoc?._id) {
          await updateSubscriptionPlan(newDoc._id, 'pro');
        }

        toast.success('Doctor registered successfully');
      }

      setPanelOpen(false);
      fetchDoctors(); // refresh list
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  // Toggle soft deactivation status
  const handleDeactivate = async (docId) => {
    if (window.confirm('Are you sure you want to deactivate this physician profile? They will no longer be able to log in.')) {
      try {
        await deactivateUserProfile(docId);
        toast.success('Physician profile deactivated successfully');
        fetchDoctors();
      } catch (error) {
        console.error('Error deactivating user:', error);
        toast.error('Failed to deactivate physician profile');
      }
    }
  };

  // View profile details modal
  const handleViewProfile = (doc) => {
    setSelectedDoctorDetails(doc);
    setModalOpen(true);
  };

  // Copy auto-generated password
  const copyToClipboard = () => {
    if (formPassword) {
      navigator.clipboard.writeText(formPassword);
      setCopied(true);
      toast.success('Password copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Sliced Doctors for client-side pagination (10 per page)
  const itemsPerPage = 10;
  const totalPages = Math.ceil(doctors.length / itemsPerPage);
  const currentDoctors = doctors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // DataTable columns configuration
  const tableColumns = [
    {
      key: 'avatar',
      label: 'Avatar',
      render: (_, row) => (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/10">
          {row.name.charAt(0).toUpperCase()}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Name',
      render: (name) => (
        <span className="font-bold text-slate-800 dark:text-slate-200">
          {name}
        </span>
      )
    },
    {
      key: 'specialization',
      label: 'Specialization',
      render: (spec) => (
        <span className="font-semibold text-indigo-500 text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40">
          {spec || '-'}
        </span>
      )
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (phone) => phone || '-'
    },
    {
      key: 'subscriptionPlan',
      label: 'Plan',
      render: (plan) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
          plan === 'pro'
            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-400 border border-slate-200/50'
        }`}>
          {plan || 'free'}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (isActive) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
          isActive !== false 
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 border border-emerald-100' 
            : 'bg-rose-50 text-rose-500 dark:bg-rose-950/30 border border-rose-100'
        }`}>
          {isActive !== false ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            title="Edit Physician"
          >
            <Pencil className="w-4 h-4" />
          </button>
          
          {row.isActive !== false && (
            <button
              onClick={() => handleDeactivate(row._id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
              title="Deactivate Profile"
            >
              <Power className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => handleViewProfile(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
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
            <Stethoscope className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Manage Doctors
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Register medical specialists, edit physician credentials, and monitor subscription plans.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="sm:self-center px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/10 flex items-center justify-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <DataTable
          columns={tableColumns}
          data={currentDoctors}
          loading={loading}
          emptyMessage="No doctors registered in the system."
        />

        {/* Client-side Pagination */}
        {!loading && doctors.length > itemsPerPage && (
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 px-6 py-4 rounded-xl shadow-sm">
            <p className="text-xs font-semibold text-slate-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, doctors.length)} of {doctors.length} physicians
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-150 ${
                    currentPage === i + 1
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SlideOver Panel for Create/Edit */}
      <SlideOver
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={editingDoctor ? 'Edit Doctor Profile' : 'Register New Doctor'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Full Name
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="Dr. John Smith"
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.name ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
              } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-4`}
            />
            {errors.name && (
              <p className="text-xs font-semibold text-rose-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Email Address
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="doctor@clinic.com"
              disabled={!!editingDoctor}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.email ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
              } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-4 disabled:opacity-50`}
            />
            {errors.email && (
              <p className="text-xs font-semibold text-rose-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password (Only show auto-generation in create mode) */}
          {!editingDoctor && (
            <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80 rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Key className="w-3.5 h-3.5" />
                  <span>Auto-Generated Password</span>
                </label>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-0.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate</span>
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  readOnly
                  {...register('password')}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 text-sm font-semibold tracking-wide focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  title="Copy password"
                >
                  {copied ? <Check className="w-4.5 h-4.5 text-emerald-500" /> : <Copy className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-semibold text-rose-500 mt-1">{errors.password.message}</p>
              )}
            </div>
          )}

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Phone Number
            </label>
            <input
              type="text"
              {...register('phone')}
              placeholder="+92 300 1234567"
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.phone ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
              } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-4`}
            />
            {errors.phone && (
              <p className="text-xs font-semibold text-rose-500 mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Specialization */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Medical Specialization
            </label>
            <input
              type="text"
              {...register('specialization')}
              placeholder="e.g. Cardiologist, Dermatologist"
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.specialization ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
              } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-4`}
            />
            {errors.specialization && (
              <p className="text-xs font-semibold text-rose-500 mt-1">{errors.specialization.message}</p>
            )}
          </div>

          {/* License Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Medical License Number
            </label>
            <input
              type="text"
              {...register('licenseNumber')}
              placeholder="PMC-12345-D"
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.licenseNumber ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
              } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-4`}
            />
            {errors.licenseNumber && (
              <p className="text-xs font-semibold text-rose-500 mt-1">{errors.licenseNumber.message}</p>
            )}
          </div>

          {/* Subscription Plan (Radio) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              SaaS Subscription Plan
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="free"
                    {...register('subscriptionPlan')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Free Plan</p>
                    <p className="text-[10px] text-slate-400">Basic clinic limits</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="pro"
                    {...register('subscriptionPlan')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Pro Plan</p>
                    <p className="text-[10px] text-indigo-500 font-semibold">AI Features & Analytics</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-500/10 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{editingDoctor ? 'Save Changes' : 'Register Doctor'}</span>
              )}
            </button>
          </div>

        </form>
      </SlideOver>

      {/* Modal for View Profile */}
      {selectedDoctorDetails && (
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedDoctorDetails(null);
          }}
          title="Physician Profile Details"
          size="md"
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-4 border-b border-slate-100 dark:border-slate-700/50 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-extrabold text-xl shadow-lg shadow-indigo-500/20">
                {selectedDoctorDetails.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{selectedDoctorDetails.name}</h3>
                <p className="text-sm text-indigo-500 font-semibold mt-0.5">{selectedDoctorDetails.specialization || 'Medicine Specialist'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">License Number</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200 mt-1">{selectedDoctorDetails.licenseNumber || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Subscription Status</p>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase mt-1 ${
                  selectedDoctorDetails.subscriptionPlan === 'pro'
                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {selectedDoctorDetails.subscriptionPlan || 'free'}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Email Address</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200 mt-1">{selectedDoctorDetails.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Phone Number</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200 mt-1">{selectedDoctorDetails.phone || '-'}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-400 uppercase">Account Status</span>
              <span className={`px-2 py-0.5 rounded-full font-bold ${
                selectedDoctorDetails.isActive !== false
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-rose-50 text-rose-600 border border-rose-100'
              }`}>
                {selectedDoctorDetails.isActive !== false ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default ManageDoctors;
