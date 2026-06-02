import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CreditCard, Check, Sparkles, AlertCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

// Custom Components
import DataTable from '../../components/common/DataTable';

// APIs
import { getUsers, updateSubscriptionPlan } from '../../api/userApi';

const SubscriptionPlans = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users to display current plan memberships
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load user subscription roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle plan change
  const handlePlanChange = async (userId, currentPlan) => {
    const nextPlan = currentPlan === 'pro' ? 'free' : 'pro';
    const actionText = nextPlan === 'pro' ? 'upgrade to Pro' : 'downgrade to Free';
    
    if (window.confirm(`Are you sure you want to ${actionText} this user's membership?`)) {
      try {
        await updateSubscriptionPlan(userId, nextPlan);
        toast.success(`User plan updated to ${nextPlan.toUpperCase()} successfully`);
        fetchUsers(); // Refresh list
      } catch (error) {
        console.error('Error updating subscription:', error);
        toast.error(error.response?.data?.error || 'Failed to update subscription plan');
      }
    }
  };

  // Subscription Roster Columns
  const tableColumns = [
    {
      key: 'name',
      label: 'Full Name',
      render: (name) => (
        <span className="font-bold text-slate-800 dark:text-slate-200">
          {name}
        </span>
      )
    },
    {
      key: 'email',
      label: 'Email Address',
    },
    {
      key: 'role',
      label: 'Role',
      render: (role) => {
        const roles = {
          admin: 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100/50',
          doctor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100/50',
          receptionist: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100/50',
          patient: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400 border border-slate-200/50'
        };
        const style = roles[role] || roles.patient;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold capitalize ${style}`}>
            {role}
          </span>
        );
      }
    },
    {
      key: 'subscriptionPlan',
      label: 'Current Plan',
      render: (plan) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
          plan === 'pro'
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 border border-slate-200/50'
        }`}>
          {plan || 'free'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Subscription Action',
      render: (_, row) => {
        const currentPlan = row.subscriptionPlan || 'free';
        
        // Admins and patients can't easily toggled subscription plan in typical flow (optional constraint)
        if (row.role === 'admin' || row.role === 'patient') {
          return <span className="text-xs text-slate-400 italic">Not applicable</span>;
        }

        return (
          <div>
            {currentPlan === 'free' ? (
              <button
                onClick={() => handlePlanChange(row._id, currentPlan)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 dark:text-amber-400 transition-colors flex items-center gap-1 border border-amber-200/50"
              >
                <ArrowUpCircle className="w-3.5 h-3.5" />
                <span>Upgrade to Pro</span>
              </button>
            ) : (
              <button
                onClick={() => handlePlanChange(row._id, currentPlan)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1 border border-slate-200/50"
              >
                <ArrowDownCircle className="w-3.5 h-3.5" />
                <span>Downgrade</span>
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <CreditCard className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Subscription Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Control SaaS memberships, audit plan tiers, and manage features limits.
          </p>
        </div>
      </div>

      {/* Side-by-side Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* FREE PLAN */}
        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase rounded-bl-xl">
            Active Tier
          </div>
          
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Standard Mode</span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">FREE PLAN</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Great for small starter clinics</p>
            </div>
            
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">PKR 0</span>
              <span className="text-slate-400 text-sm font-semibold">/ month</span>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700/50 my-6" />

            <ul className="space-y-3.5 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-slate-400 stroke-[2.5] shrink-0" />
                <span>Limited to 50 patients</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-slate-400 stroke-[2.5] shrink-0" />
                <span>Basic appointments roster</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-300 dark:text-slate-600">
                <div className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-extrabold shrink-0">X</div>
                <span className="line-through">No AI-assisted diagnostic features</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-300 dark:text-slate-600">
                <div className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-extrabold shrink-0">X</div>
                <span className="line-through">No operational analytics</span>
              </li>
            </ul>
          </div>
        </div>

        {/* PRO PLAN */}
        <div className="bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 dark:from-slate-800 dark:to-indigo-950/20 border-2 border-indigo-500 rounded-3xl p-6 sm:p-8 shadow-md transition-all duration-300 hover:shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold uppercase rounded-bl-xl flex items-center gap-1 shadow-md shadow-amber-500/10">
            <Sparkles className="w-3 h-3 fill-white" />
            <span>Premium</span>
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Recommended</span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">PRO PLAN</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Unlimited clinical scale & intelligence</p>
            </div>
            
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">PKR 5,000</span>
              <span className="text-slate-400 text-sm font-semibold">/ month</span>
            </div>

            <div className="border-t border-indigo-100 dark:border-slate-700/50 my-6" />

            <ul className="space-y-3.5 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-indigo-500 stroke-[2.5] shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Unlimited patients profiles</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-indigo-500 stroke-[2.5] shrink-0" />
                <span>Advanced appointment management</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-indigo-500 stroke-[2.5] shrink-0" />
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">All Gemini AI diagnostic features</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-indigo-500 stroke-[2.5] shrink-0" />
                <span>Advanced clinic analytics & exports</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* User Subscription Roster Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            User Membership Roster
          </h2>
          <p className="text-xs text-slate-400">Manage doctor plan subscriptions</p>
        </div>

        <DataTable
          columns={tableColumns}
          data={users}
          loading={loading}
          emptyMessage="No clinical users registered in the system."
        />
      </div>

    </div>
  );
};

export default SubscriptionPlans;
