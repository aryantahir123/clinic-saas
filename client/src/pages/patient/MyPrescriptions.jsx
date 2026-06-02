import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FileText, Download, Sparkles, ChevronDown, ChevronUp, Pill, AlertCircle, Info, Stethoscope, Loader2 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// APIs & Components
import { getPrescriptionsByPatient, downloadPDF } from '../../api/prescriptionApi';
import PrescriptionExplainer from '../../components/ai/PrescriptionExplainer';

const MyPrescriptions = () => {
  const { user } = useAuthStore();

  // State Management
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Accordion Expand State: { [prescriptionId]: boolean }
  const [expandedIds, setExpandedIds] = useState({});
  
  // Slide-over Explainer state
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState(null);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await getPrescriptionsByPatient('me').catch(err => {
        console.warn('Silent catch prescriptions:', err);
        return { data: [] };
      });
      setPrescriptions(res?.data || []);
    } catch (error) {
      console.error('Error loading patient prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const toggleExpand = (id) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // PDF Download Trigger
  const handlePdfDownload = async (prescriptionId) => {
    try {
      toast.loading('Preparing prescription file...', { id: 'rx-pdf' });
      const blob = await downloadPDF(prescriptionId);
      
      const fileUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', `prescription_${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      URL.revokeObjectURL(fileUrl);
      toast.success('File downloaded successfully', { id: 'rx-pdf' });
    } catch (error) {
      console.error('Error downloading prescription PDF:', error);
      toast.error('Failed to export PDF file', { id: 'rx-pdf' });
    }
  };

  // Open AI Explainer SlideOver
  const handleExplain = (rx) => {
    setSelectedRx(rx);
    setExplainerOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-44 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="select-none">
        <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">My Prescription Files</h1>
        <p className="text-xs text-slate-400 mt-1">Review pharmaceutical sheets, download PDFs, or request AI translations.</p>
      </div>

      {/* Roster list */}
      {prescriptions.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-3xl space-y-4 shadow-sm select-none">
          <FileText className="w-14 h-14 stroke-[1.2] text-slate-350 dark:text-slate-750 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-700 dark:text-slate-300 text-base">No prescriptions logged</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">Your doctor has not logged any prescriptions under your clinical file yet.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => {
            const isExpanded = expandedIds[rx._id];
            
            return (
              <div 
                key={rx._id}
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-750 rounded-3xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* 1. Collapsed Header Frame */}
                <div 
                  onClick={() => toggleExpand(rx._id)}
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors select-none"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    {/* Collapser Toggle Arrow */}
                    <div className="p-1 hover:bg-slate-150 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-lg transition-colors">
                      {isExpanded ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <h3 className="font-extrabold text-slate-800 dark:text-white text-xs truncate">
                        Dr. {rx.doctorId?.name || 'Physician'}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-450 font-semibold uppercase">
                        <span>Issued: {new Date(rx.createdAt).toLocaleDateString()}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-350 dark:bg-slate-700" />
                        <span>Diagnosis: <strong className="text-indigo-600 dark:text-indigo-400 capitalize">{rx.diagnosis || 'Standard checkup'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Badges and Actions */}
                  <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 rounded-lg text-[9px] font-black uppercase">
                      {(rx.medicines || []).length} Medicines
                    </span>
                    
                    <button
                      onClick={() => handlePdfDownload(rx._id)}
                      className="p-2 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-900 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all border border-slate-150 dark:border-slate-700/80"
                      title="Download Rx PDF file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleExplain(rx)}
                      className="px-3 py-2 bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 text-[10px] font-black rounded-xl shadow-md shadow-indigo-500/10 flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-white stroke-[2.5]" />
                      <span>Get AI Explanation</span>
                    </button>
                  </div>
                </div>

                {/* 2. Expanded Accordion Medicines panel */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-750/80 bg-slate-50/20 dark:bg-slate-900/10 select-text">
                    <div className="space-y-4">
                      
                      {/* Medicine Table list */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-slate-600 dark:text-slate-350">
                          <thead>
                            <tr className="text-[10px] text-slate-400 uppercase font-black tracking-wider border-b border-slate-100 dark:border-slate-750">
                              <th className="py-2.5">Medicine Name</th>
                              <th className="py-2.5">Dosage</th>
                              <th className="py-2.5">Frequency</th>
                              <th className="py-2.5">Duration</th>
                              <th className="py-2.5">Route</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(rx.medicines || []).map((med, idx) => (
                              <tr key={idx} className="border-b border-slate-100/50 dark:border-slate-800/40 last:border-b-0 font-semibold">
                                <td className="py-3 flex items-center gap-2">
                                  <Pill className="w-4 h-4 text-indigo-500 shrink-0" />
                                  <span className="text-slate-850 dark:text-slate-200">{med.name}</span>
                                </td>
                                <td className="py-3">{med.dosage}</td>
                                <td className="py-3">{med.frequency}</td>
                                <td className="py-3">{med.duration}</td>
                                <td className="py-3">{med.route || 'Oral'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Instructions Box */}
                      {rx.instructions && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-2.5 select-text">
                          <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Clinical Instructions</span>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">{rx.instructions}</p>
                          </div>
                        </div>
                      )}

                      {/* Follow-up reminder */}
                      {rx.followUpDate && (
                        <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold select-none">
                          <Stethoscope className="w-4.5 h-4.5" />
                          <span>Follow-up Consultation Scheduled: {new Date(rx.followUpDate).toLocaleDateString()}</span>
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Embedded SlideOver Explainer Drawer */}
      <PrescriptionExplainer
        isOpen={explainerOpen}
        onClose={() => setExplainerOpen(false)}
        prescriptionId={selectedRx?._id}
        existingExplanation={selectedRx?.aiExplanation}
        existingUrduExplanation={selectedRx?.aiExplanationUrdu}
      />

    </div>
  );
};

export default MyPrescriptions;
