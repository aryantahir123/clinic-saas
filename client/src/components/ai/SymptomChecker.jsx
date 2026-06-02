import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Brain, Sparkles, AlertCircle, FileSpreadsheet, Activity, ChevronRight, HelpCircle } from 'lucide-react';

// Custom Components
import TagInput from '../common/TagInput';
import UpgradePrompt from '../common/UpgradePrompt';
import AIFallbackMessage from './AIFallbackMessage';

// APIs
import { symptomCheck } from '../../api/aiApi';

const SymptomChecker = ({ patientId, patientAge, patientGender }) => {
  // Form State
  const [symptoms, setSymptoms] = useState([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [historyNotes, setHistoryNotes] = useState('');
  const [pendingSymptom, setPendingSymptom] = useState('');

  // UI Control State
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Auto-add any pending text as a symptom
    let finalSymptoms = [...symptoms];
    if (pendingSymptom.trim() && !finalSymptoms.includes(pendingSymptom.trim())) {
      finalSymptoms.push(pendingSymptom.trim());
      setSymptoms(finalSymptoms);
      setPendingSymptom('');
    }

    if (finalSymptoms.length === 0) {
      toast.error('Please add at least one patient symptom to run AI analysis');
      return;
    }

    try {
      setLoading(true);
      setResults(null);
      setFallbackMode(false);

      const payload = {
        patientId,
        symptoms: finalSymptoms,
        age: Number(patientAge),
        gender: patientGender,
        history: historyNotes || 'None',
        additionalNotes
      };

      const response = await symptomCheck(payload);
      
      // Response holds successResponse envelope with { aiResponse: { possibleConditions, riskLevel, suggestedTests, recommendations, fallback }, diagnosisLogId }
      const aiData = response.data?.aiResponse || response.data || {};
      setResults(aiData);
      setFallbackMode(!!aiData.fallback || !!response.data?.fallbackUsed);

      toast.success('AI clinical analysis compiled successfully');
    } catch (error) {
      console.error('Error running AI diagnostics:', error);
      
      // Handle subscription limitation upgrade modal trigger
      if (error.response?.status === 403 && error.response?.data?.upgradeRequired) {
        setShowUpgradeModal(true);
      } else {
        toast.error(error.response?.data?.error || 'Failed to complete AI symptom analysis');
      }
    } finally {
      setLoading(false);
    }
  };

  // Resolve probability tag styling
  const getProbabilityStyle = (prob = '') => {
    const p = prob.toLowerCase();
    if (p.includes('high') || p.includes('90') || p.includes('80')) {
      return 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100';
    }
    if (p.includes('medium') || p.includes('moderate') || p.includes('50') || p.includes('60') || p.includes('70')) {
      return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100';
    }
    return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100';
  };

  // Resolve general risk level banner styling
  const getRiskLevelStyle = (level = '') => {
    const l = level.toLowerCase();
    if (l === 'critical') {
      return 'bg-red-900/10 text-red-700 dark:text-red-400 border border-red-900/30 font-black shadow-sm';
    }
    if (l === 'high') {
      return 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 font-extrabold';
    }
    if (l === 'medium') {
      return 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 font-bold';
    }
    return 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold';
  };

  return (
    <div className="space-y-6">
      
      {/* Symptom Checker Inputs Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">AI Diagnostics Form</h3>
          </div>

          {/* Symptoms TagInput */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Patient Symptoms <span className="text-rose-500">*</span>
            </label>
            <TagInput
              value={symptoms}
              onChange={setSymptoms}
              onInputChange={setPendingSymptom}
              placeholder="Type symptom (e.g. fever, dry cough) and press Enter..."
            />
            <p className="text-[10px] text-slate-400">Add key diagnostic signs reported by the patient during physical checkups.</p>
          </div>

          {/* Additional Notes */}
          <div className="space-y-1.5">
            <label htmlFor="notes" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Active Complaints / Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Symptoms started 3 days ago, gets worse at night..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 transition-all duration-200"
            />
          </div>

          {/* Patient History Notes */}
          <div className="space-y-1.5">
            <label htmlFor="history" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Comorbidities / Clinical History <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="history"
              rows={2}
              value={historyNotes}
              onChange={(e) => setHistoryNotes(e.target.value)}
              placeholder="e.g. Known hypertensive, allergic to penicillin..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 transition-all duration-200"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Brain className="w-4.5 h-4.5" />
              <span>Run AI Diagnostics</span>
            </button>
          </div>

        </form>
      </div>

      {/* Pulsing Loading State */}
      {loading && (
        <div className="bg-slate-50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner relative">
            <Brain className="w-8 h-8 stroke-[2] animate-bounce" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-base">Gemini AI Engine Analyzing...</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Crossing patient demographic metrics, symptoms tags, and comorbidity logs with clinic datasets.</p>
          </div>
        </div>
      )}

      {/* AI Assessed Diagnostics Panel */}
      {results && !loading && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Offline warning banner */}
          {fallbackMode && <AIFallbackMessage />}

          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
            
            {/* Upper Banner Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-700/50">
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-500" />
                  <span>AI Diagnostics Report</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Generated dynamically based on current symptom tags</p>
              </div>

              {/* Risk Level Badge */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Risk Level</span>
                <span className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider ${getRiskLevelStyle(results.riskLevel)}`}>
                  {results.riskLevel || 'low'}
                </span>
              </div>
            </div>

            {/* Possible Conditions list */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Possible Clinical Conditions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(results.possibleConditions || []).map((cond, idx) => (
                  <div 
                    key={idx}
                    className="p-5 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 group"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm tracking-tight group-hover:text-indigo-500 transition-colors">
                          {cond.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getProbabilityStyle(cond.probability)}`}>
                          {cond.probability}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {cond.description || 'Description not logged by offline AI service.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Lab Tests */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Suggested Lab Tests</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
                {(results.suggestedTests || []).map((test, idx) => (
                  <li key={idx} className="flex items-center space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span>{test}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Recommendations */}
            <div className="space-y-2 bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-950/40 p-5 rounded-2xl">
              <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">AI Physician Recommendations</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium mt-1.5">
                {results.recommendations || 'Please refer patient to specialized secondary healthcare facilities for physical audits.'}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Upgrade Pro Tier Locking prompt modal */}
      <UpgradePrompt
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

    </div>
  );
};

export default SymptomChecker;
