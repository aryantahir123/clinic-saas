import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  TrendingUp, Calendar, CheckCircle2, XCircle, Users, RefreshCw
} from 'lucide-react';
import { getAdminStats, getMonthlyData } from '../../api/analyticsApi';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const StatBox = ({ title, value, icon: Icon, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
    green: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400',
  };
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color] || colorMap.blue}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, monthlyRes] = await Promise.all([
        getAdminStats(),
        getMonthlyData(),
      ]);
      setStats(statsRes.data);
      setMonthly(monthlyRes.data || []);
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Pie chart: Appointment status breakdown
  const statusData = stats ? [
    { name: 'Completed', value: stats.completedAppointments || 0 },
    { name: 'Cancelled', value: stats.cancelledAppointments || 0 },
    {
      name: 'Pending/Active',
      value: Math.max(0, (stats.totalAppointments || 0) - (stats.completedAppointments || 0) - (stats.cancelledAppointments || 0))
    },
  ].filter(d => d.value > 0) : [];

  // Pie chart: Top diagnoses
  const diagnosesData = (stats?.topDiagnoses || ['General Cold', 'Hypertension', 'Diabetes', 'Bronchitis', 'Allergy'])
    .map((name, i) => ({ name, value: [45, 25, 15, 10, 5][i] || 5 }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Operational Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5">
            Full system-wide statistics, appointment trends, and clinical performance.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-sm font-bold transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatBox title="Total Patients" value={loading ? '...' : stats?.totalPatients ?? 0} icon={Users} color="blue" />
        <StatBox title="Total Appointments" value={loading ? '...' : stats?.totalAppointments ?? 0} icon={Calendar} color="amber" />
        <StatBox title="Completed" value={loading ? '...' : stats?.completedAppointments ?? 0} icon={CheckCircle2} color="green" />
        <StatBox title="Cancelled" value={loading ? '...' : stats?.cancelledAppointments ?? 0} icon={XCircle} color="rose" />
      </div>

      {/* Charts Row 1: 12-month line + status pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 12-Month Trend Line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm h-[360px] flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              12-Month Appointment Trend
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Monthly consultation volume over the past year</p>
          </div>
          <div className="flex-1 min-h-0">
            {loading ? (
              <div className="w-full h-full bg-slate-50 dark:bg-slate-900/30 rounded-xl animate-pulse" />
            ) : monthly.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 italic">
                No trend data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700/30" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#818cf8' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm h-[360px] flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Appointment Status</h3>
            <p className="text-xs text-slate-400 mt-0.5">Breakdown by completion state</p>
          </div>
          <div className="flex-1 min-h-0">
            {loading ? (
              <div className="w-full h-full bg-slate-50 dark:bg-slate-900/30 rounded-xl animate-pulse" />
            ) : statusData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 italic">
                No appointment data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '500' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2: 6-month bar + diagnoses pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 6-Month Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm h-[360px] flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Last 6 Months</h3>
            <p className="text-xs text-slate-400 mt-0.5">Clinical appointment volume comparison</p>
          </div>
          <div className="flex-1 min-h-0">
            {loading ? (
              <div className="w-full h-full bg-slate-50 dark:bg-slate-900/30 rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(stats?.monthlyAppointments || []).slice(-6)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.85} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700/30" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} labelStyle={{ fontWeight: 'bold', color: '#818cf8' }} />
                  <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Diagnoses Pie */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm h-[360px] flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Top Diagnoses</h3>
            <p className="text-xs text-slate-400 mt-0.5">Most frequently recorded conditions</p>
          </div>
          <div className="flex-1 min-h-0">
            {loading ? (
              <div className="w-full h-full bg-slate-50 dark:bg-slate-900/30 rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={diagnosesData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {diagnosesData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '500' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Summary Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 shadow-lg shadow-indigo-500/20 text-white">
        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Simulated Revenue (PKR 500/consult)</p>
        <div className="grid grid-cols-2 gap-6 mt-4">
          <div>
            <p className="text-indigo-300 text-xs font-semibold">This Month</p>
            <p className="text-3xl font-black mt-1">
              {loading ? '...' : `PKR ${(stats?.simulatedRevenue?.monthly || 0).toLocaleString()}`}
            </p>
          </div>
          <div>
            <p className="text-indigo-300 text-xs font-semibold">All Time</p>
            <p className="text-3xl font-black mt-1">
              {loading ? '...' : `PKR ${(stats?.simulatedRevenue?.total || 0).toLocaleString()}`}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsDashboard;
