import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { 
  Users, Plus, Pencil, Power, Eye, Copy, Check, ChevronLeft, ChevronRight, RefreshCw, Key
} from 'lucide-react';

// Custom Components
import DataTable from '../../components/common/DataTable';
import SlideOver from '../../components/common/SlideOver';
import Modal from '../../components/common/Modal';

// APIs
import { 
  getUsers, adminCreateUser, updateUserProfile, deactivateUserProfile 
} from '../../api/userApi';

// Schema for Receptionist Form
const receptionistSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().min(1, 'Email is required').email('Invalid email address').trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(1, 'Phone is required').trim(),
});

const ManageReceptionists = () => {
  // List States
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState(false);

  // Modal / SlideOver States
  const [panelOpen, setPanelOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecep, setEditingRecep] = useState(null);
  const [selectedRecepDetails, setSelectedRecepDetails] = useState(null);

  // Form hooks
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(receptionistSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: ''
    }
  });

  const formPassword = watch('password');

  // Fetch all active users and filter receptionists
  const fetchReceptionists = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      const allUsers = response.data || [];
      const receptionistsList = allUsers.filter(u => u.role === 'receptionist');
      setReceptionists(receptionistsList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to retrieve receptionist logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceptionists();
  }, []);

  // Helper to generate a secure random password
  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let pass = 'Recep@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue('password', pass);
  };

  // Open panel in Create Mode
  const handleOpenCreate = () => {
    setEditingRecep(null);
    reset({
      name: '',
      email: '',
      password: '',
      phone: ''
    });
    setPanelOpen(true);
    // Generate initial password
    setTimeout(generatePassword, 50);
  };

  // Open panel in Edit Mode
  const handleOpenEdit = (recep) => {
    setEditingRecep(recep);
    reset({
      name: recep.name,
      email: recep.email,
      password: '********', // placeholder
      phone: recep.phone || ''
    });
    setPanelOpen(true);
  };

  // Submit Handler
  const onSubmit = async (data) => {
    try {
      if (editingRecep) {
        // Edit Mode: update profile
        const updatedData = { ...data };
        delete updatedData.password; // do not send password update unless editing password

        await updateUserProfile(editingRecep._id, updatedData);
        toast.success('Receptionist details updated successfully');
      } else {
        // Create Mode: Register user
        const createData = {
          ...data,
          role: 'receptionist'
        };

        await adminCreateUser(createData);
        toast.success('Receptionist registered successfully');
      }

      setPanelOpen(false);
      fetchReceptionists();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  // Toggle soft deactivation status
  const handleDeactivate = async (recepId) => {
    if (window.confirm('Are you sure you want to deactivate this receptionist profile? They will no longer be able to log in.')) {
      try {
        await deactivateUserProfile(recepId);
        toast.success('Receptionist profile deactivated successfully');
        fetchReceptionists();
      } catch (error) {
        console.error('Error deactivating user:', error);
        toast.error('Failed to deactivate receptionist profile');
      }
    }
  };

  // View profile details modal
  const handleViewProfile = (recep) => {
    setSelectedRecepDetails(recep);
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

  // Client-side pagination (10 per page)
  const itemsPerPage = 10;
  const totalPages = Math.ceil(receptionists.length / itemsPerPage);
  const currentReceptionists = receptionists.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // DataTable columns configuration
  const tableColumns = [
    {
      key: 'avatar',
      label: 'Avatar',
      render: (_, row) => (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-500/10">
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
      key: 'email',
      label: 'Email',
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (phone) => phone || '-'
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (isActive) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
          isActive !== false 
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100/50' 
            : 'bg-rose-50 text-rose-500 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100/50'
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
            title="Edit Profile"
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
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Users className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Manage Receptionists
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Register front desk operators, edit staff profiles, and monitor shift rosters.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="sm:self-center px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add New Receptionist</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <DataTable
          columns={tableColumns}
          data={currentReceptionists}
          loading={loading}
          emptyMessage="No receptionists registered in the system."
        />

        {/* Client-side Pagination */}
        {!loading && receptionists.length > itemsPerPage && (
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 px-6 py-4 rounded-xl shadow-sm">
            <p className="text-xs font-semibold text-slate-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, receptionists.length)} of {receptionists.length} receptionists
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
                      ? 'bg-emerald-600 text-white shadow-sm'
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
        title={editingRecep ? 'Edit Receptionist Profile' : 'Register New Receptionist'}
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
              placeholder="Sara Khan"
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.name ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500/20'
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
              placeholder="receptionist@clinic.com"
              disabled={!!editingRecep}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.email ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500/20'
              } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-4 disabled:opacity-50`}
            />
            {errors.email && (
              <p className="text-xs font-semibold text-rose-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          {!editingRecep && (
            <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80 rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Key className="w-3.5 h-3.5" />
                  <span>Auto-Generated Password</span>
                </label>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-xs font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-0.5"
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
              placeholder="+92 300 9876543"
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.phone ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500/20'
              } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-4`}
            />
            {errors.phone && (
              <p className="text-xs font-semibold text-rose-500 mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{editingRecep ? 'Save Changes' : 'Register Receptionist'}</span>
              )}
            </button>
          </div>

        </form>
      </SlideOver>

      {/* Modal for View Details */}
      {selectedRecepDetails && (
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedRecepDetails(null);
          }}
          title="Receptionist Staff Details"
          size="md"
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-4 border-b border-slate-100 dark:border-slate-700/50 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-extrabold text-xl shadow-lg shadow-emerald-500/20">
                {selectedRecepDetails.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{selectedRecepDetails.name}</h3>
                <p className="text-xs text-emerald-500 font-bold uppercase mt-0.5">Front Desk Administration</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Email Address</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200 mt-1">{selectedRecepDetails.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Phone Number</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200 mt-1">{selectedRecepDetails.phone || '-'}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-400 uppercase">Account Status</span>
              <span className={`px-2 py-0.5 rounded-full font-bold ${
                selectedRecepDetails.isActive !== false
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-rose-50 text-rose-600 border border-rose-100'
              }`}>
                {selectedRecepDetails.isActive !== false ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default ManageReceptionists;
