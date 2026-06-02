import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ShieldAlert, RefreshCw, CheckCircle2 } from 'lucide-react';
import { riskFlag } from '../../api/aiApi';

/**
 * Red banner shown at the top of PatientDetail if the patient is marked as High Risk.
 */
const RiskFlagBanner = ({ isHighRisk, riskNotes, patientId, onCheck }) => {
  const [loading, setLoading] = useState(false);

  const handleRecheck = async () => {
    try {
      setLoading(true);
      const response = await riskFlag(patientId);
      
      // Update local state in parent
      if (onCheck) {
        onCheck(response.data);
      }

      if (response.data?.isHighRisk) {
        toast.error('AI Assessment confirmed: Patient remains classified as High Risk.');
      } else {
        toast.success('AI Assessment: Patient risk score has been lowered successfully.');
      }
    } catch (error) {
      console.error('Error assessing patient risk:', error);
      toast.error('Failed to run AI clinical risk assessment');
    } finally {
      setLoading(false);
    }
  };

  if (!isHighRisk) {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl text-emerald-800 dark:text-emerald-300 text-sm animate-in fade-in duration-200">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div className="flex-1 space-y-0.5">
          <p className="font-bold">Standard Risk Classification</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
            No critical chronic pathologies or dangerous diagnostics logs flagged on patient profile.
          </p>
        </div>
        <button
          onClick={handleRecheck}
          disabled={loading}
          className="px-3.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-assess Profile</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl text-rose-800 dark:text-rose-300 text-sm animate-in slide-in-from-top-4 duration-300">
      <div className="p-2 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
        <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
      </div>
      
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="font-extrabold tracking-tight flex items-center gap-1.5">
          <span>⚠️ High Risk Patient</span>
          <span className="px-2 py-0.5 text-[10px] bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-full font-bold uppercase">Clinical Flag</span>
        </p>
        <p className="text-xs text-rose-700/90 dark:text-rose-400/90 truncate max-w-2xl mt-0.5">
          {riskNotes || 'Special care required. Dangerous comorbidities, allergic overlaps, or chronic conditions reported.'}
        </p>
      </div>

      <button
        onClick={handleRecheck}
        disabled={loading}
        className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 self-end sm:self-center transition-colors disabled:opacity-50 shadow-sm"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        <span>Re-check Risk</span>
      </button>
    </div>
  );
};

export default RiskFlagBanner;
