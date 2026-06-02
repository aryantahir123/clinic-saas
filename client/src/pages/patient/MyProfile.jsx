import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  User, Mail, Phone, MapPin, ShieldAlert, Heart, Activity, Edit3, X, Save, Sparkles 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// APIs
import { getPatientById, updatePatient } from '../../api/patientApi';

const MyProfile = () => {
  const { user } = useAuthStore();

  // State Management
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Edit Form Fields State
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await getPatientById('me').catch(err => {
        console.warn('Silent catch profile:', err);
        return null;
      });
      setPatient(res?.data || null);
      
      // Initialize edit fields
      setPhone(res?.data?.phone || '');
      setEmail(res?.data?.email || '');
      setAddress(res?.data?.address || '');
    } catch (error) {
      console.error('Error loading patient profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Update Profile Submission handler
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!phone.trim() || !email.trim()) {
      toast.error('Phone and email contact details are required');
      return;
    }

    try {
      setUpdating(true);
      const res = await updatePatient('me', { phone, email, address });
      setPatient(res.data);
      setIsEditOpen(false);
      toast.success('Contact profile updated successfully');
    } catch (error) {
      console.error('Error updating patient profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update contact profile');
    } finally {
      setUpdating(false);
    }
  };

  // Profile Avatar Initials
  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 w-full bg-slate-100 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/80">
        <User className="w-16 h-16 stroke-[1.2] text-slate-350 dark:text-slate-650 mx-auto" />
        <h3 className="font-extrabold text-slate-700 dark:text-slate-300 mt-4 text-lg">Failed to retrieve profile record</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Upper Brand Header Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
        
        {/* Background glow bubble on hover */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
        
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          {/* Initials Circle Frame */}
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-black text-2xl flex items-center justify-center rounded-2xl shadow-lg shrink-0 select-none">
            {getInitials(patient.name)}
          </div>
          
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{patient.name}</h2>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 items-center text-xs text-slate-400 font-semibold mt-1">
              <span className="capitalize">{patient.gender}</span>
              <span className="w-1 h-1 rounded-full bg-slate-350 dark:bg-slate-750" />
              <span>Age: {patient.age}</span>
              <span className="w-1 h-1 rounded-full bg-slate-350 dark:bg-slate-750" />
              <span>Blood Group: <strong className="text-indigo-500">{patient.bloodGroup || 'N/A'}</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsEditOpen(true)}
          className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-500/10 flex items-center gap-1.5 hover:-translate-y-0.5 transition-all select-none"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>

      </div>

      {/* 2. Side-By-Side Contact & Medical Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Contact Information card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-700/50">
            <User className="w-5 h-5 text-indigo-500" />
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Contact Information</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-start space-x-3">
              <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Phone Number</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 block">{patient.phone}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email Address</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 block truncate max-w-xs">{patient.email || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Address</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200 block leading-relaxed">{patient.address || 'No address logged'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Health Information card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-700/50">
            <Heart className="w-5 h-5 text-indigo-500" />
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Medical Summary</h3>
          </div>

          <div className="space-y-4.5">
            <div className="space-y-2">
              <span className="font-bold text-[9px] text-slate-400 uppercase tracking-widest block">Allergies & Reactions</span>
              <div className="flex flex-wrap gap-1.5">
                {(patient.allergies || []).length === 0 ? (
                  <span className="text-xs text-slate-400 italic font-semibold">No known allergies logged</span>
                ) : (
                  (patient.allergies || []).map((all, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100 rounded-lg font-bold text-[10px]">
                      {all}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[9px] text-slate-400 uppercase tracking-widest block">Chronic Pathology Conditions</span>
              <div className="flex flex-wrap gap-1.5">
                {(patient.chronicConditions || []).length === 0 ? (
                  <span className="text-xs text-slate-400 italic font-semibold">None reported</span>
                ) : (
                  (patient.chronicConditions || []).map((chr, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 rounded-lg font-bold text-[10px]">
                      {chr}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Backdrop blurred Center Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 select-none">
          {/* Overlay backdrop */}
          <div 
            onClick={() => setIsEditOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Form container */}
          <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4.5 h-4.5 text-indigo-500 fill-indigo-500/10" />
                <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Edit Contact Profile</h3>
              </div>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleUpdate} className="space-y-4 mt-5">
              
              {/* Telephone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter contact number..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-150 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-semibold"
                />
              </div>

              {/* Email address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-150 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-semibold"
                />
              </div>

              {/* Postal Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Home Address</label>
                <textarea
                  rows="3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Type home address details..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-150 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-semibold resize-none"
                />
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-150 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-500/10 flex items-center gap-1.5 disabled:opacity-50 transition-all"
                >
                  {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default MyProfile;
