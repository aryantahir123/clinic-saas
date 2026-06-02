import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Printer, Calendar, Clock, Loader2, Sparkles, Filter } from 'lucide-react';

// APIs & Components
import { getPatientHistory } from '../../api/patientApi';
import MedicalTimeline from '../../components/patients/MedicalTimeline';

const MedicalHistory = () => {
  // State Management
  const [history, setHistory] = useState({ appointments: [], prescriptions: [], diagnosisLogs: [] });
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('all');

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await getPatientHistory('me').catch(err => {
        console.warn('Silent catch history:', err);
        return { data: null };
      });
      setHistory(res?.data || { appointments: [], prescriptions: [], diagnosisLogs: [] });
    } catch (error) {
      console.error('Error loading patient medical history timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Compute available years for filtering
  const getAvailableYears = () => {
    const years = new Set();
    
    (history.appointments || []).forEach(a => {
      if (a.date) years.add(new Date(a.date).getFullYear());
    });
    (history.prescriptions || []).forEach(p => {
      if (p.createdAt) years.add(new Date(p.createdAt).getFullYear());
    });
    (history.diagnosisLogs || []).forEach(d => {
      if (d.createdAt) years.add(new Date(d.createdAt).getFullYear());
    });

    return Array.from(years).sort((a, b) => b - a); // Descending years
  };

  // Filter history items by selected year
  const getFilteredHistory = () => {
    if (selectedYear === 'all') return history;

    const targetYear = parseInt(selectedYear);
    
    const appointments = (history.appointments || []).filter(a => 
      a.date && new Date(a.date).getFullYear() === targetYear
    );
    
    const prescriptions = (history.prescriptions || []).filter(p => 
      p.createdAt && new Date(p.createdAt).getFullYear() === targetYear
    );
    
    const diagnosisLogs = (history.diagnosisLogs || []).filter(d => 
      d.createdAt && new Date(d.createdAt).getFullYear() === targetYear
    );

    return { appointments, prescriptions, diagnosisLogs };
  };

  // Print Page Handler
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-10 w-44 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 w-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="h-96 w-full bg-slate-100 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  const filteredHistory = getFilteredHistory();
  const availableYears = getAvailableYears();

  return (
    <div className="space-y-6">
      
      {/* Print custom stylesheet to hide dashboard shell when calling printing layout */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide sidebar, dashboard navbar, actions, filters and floating indicators */
          aside, nav, header, button, select, footer, .select-none {
            display: none !important;
          }
          /* Reset margins, paddings, and background colors to clean white layouts */
          body {
            background-color: white !important;
            color: black !important;
          }
          main, .print\\:w-full {
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Print expanded timelines instead of collapsers */
          .relative {
            border-left-color: #CBD5E1 !important;
          }
        }
      `}} />

      {/* Header controls panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Medical Timeline</h1>
          <p className="text-xs text-slate-400 mt-1">Review your comprehensive chronological visit history, prescriptions, and symptom records.</p>
        </div>

        <div className="flex items-center gap-3">
          
          {/* Year Filter Dropdown */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-150/60 dark:border-slate-800 px-3 py-2 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-900">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year} className="bg-white dark:bg-slate-900">{year}</option>
              ))}
            </select>
          </div>

          {/* Print History Trigger button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-500/10 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print History</span>
          </button>

        </div>
      </div>

      {/* Unified Timeline Container Canvas */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-6 sm:p-8 rounded-3xl shadow-sm">
        <MedicalTimeline history={filteredHistory} />
      </div>

    </div>
  );
};

export default MedicalHistory;
