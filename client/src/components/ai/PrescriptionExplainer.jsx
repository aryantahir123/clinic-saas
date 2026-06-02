import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { X, Sparkles, Loader2, Brain, Languages, AlertCircle } from 'lucide-react';
import { explainPrescription } from '../../api/aiApi';

const PrescriptionExplainer = ({ 
  isOpen, 
  onClose, 
  prescriptionId, 
  existingExplanation, 
  existingUrduExplanation 
}) => {
  const [lang, setLang] = useState('en'); // 'en' or 'ur'
  const [loading, setLoading] = useState(false);
  const [localEnExplanation, setLocalEnExplanation] = useState(existingExplanation || '');
  const [localUrExplanation, setLocalUrExplanation] = useState(existingUrduExplanation || '');

  // Synchronize prop updates when the active prescription changes
  useEffect(() => {
    setLocalEnExplanation(existingExplanation || '');
    setLocalUrExplanation(existingUrduExplanation || '');
    setLang('en'); // Reset to English on new prescription
  }, [prescriptionId, existingExplanation, existingUrduExplanation]);

  if (!isOpen) return null;

  const currentExplanation = lang === 'en' ? localEnExplanation : localUrExplanation;

  // Fire Gemini Explainer API
  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await explainPrescription({ prescriptionId, language: lang });
      
      const generatedText = res.data?.explanation || '';
      
      if (lang === 'en') {
        setLocalEnExplanation(generatedText);
      } else {
        setLocalUrExplanation(generatedText);
      }
      
      toast.success(`Explanation successfully compiled in ${lang === 'en' ? 'English' : 'Urdu'}`);
    } catch (error) {
      console.error('Error generating prescription explanation:', error);
      toast.error(error.response?.data?.error || 'Failed to compile AI explanation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      
      {/* Background overlay backdrop blur */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Slide-over Drawer Frame */}
      <div className="absolute inset-y-0 right-0 max-w-lg w-full flex">
        <div className="h-full w-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
          
          {/* Header Panel */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/10">
                <Sparkles className="w-4 h-4 fill-white stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white text-base tracking-tight">AI Prescription Explainer</h3>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Gemini-powered personalized pharmaceutical breakdowns.</span>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Core Panel Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            
            {/* Language Toggle bar */}
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/60 p-2.5 border border-slate-100 dark:border-slate-800 rounded-2xl select-none">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-bold uppercase">
                <Languages className="w-4 h-4 text-slate-400" />
                <span>Explanation Language</span>
              </div>
              
              <div className="flex bg-slate-200/50 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-150 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                    lang === 'en' 
                      ? 'bg-white dark:bg-slate-750 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLang('ur')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                    lang === 'ur' 
                      ? 'bg-white dark:bg-slate-750 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  اردو (Urdu)
                </button>
              </div>
            </div>

            {/* Explanation Display Canvas */}
            <div className="min-h-56 flex flex-col justify-center select-text">
              
              {loading ? (
                <div className="text-center py-12 space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">Translating Clinical Terminology...</p>
                </div>
              ) : currentExplanation ? (
                /* Pastel blue premium explanation layout card */
                <div 
                  className={`p-5 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-950/40 rounded-2xl space-y-4 shadow-xs ${
                    lang === 'ur' ? 'text-right' : 'text-left'
                  }`}
                  dir={lang === 'ur' ? 'rtl' : 'ltr'}
                >
                  <div className={`flex items-center gap-2 ${lang === 'ur' ? 'justify-end' : 'justify-start'}`}>
                    <Brain className="w-5 h-5 text-indigo-500" />
                    <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Clinical Explanation</span>
                  </div>
                  
                  <p 
                    className={`text-slate-700 dark:text-slate-350 leading-relaxed font-semibold ${
                      lang === 'ur' ? 'text-base font-medium' : 'text-xs'
                    }`}
                  >
                    {currentExplanation}
                  </p>
                </div>
              ) : (
                /* Generation Required State */
                <div className="text-center py-10 space-y-4">
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-100/50 dark:border-amber-900/20">
                    <Brain className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No explanation generated yet</h4>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">Get an simplified and personalized explanation of this prescription and instructions using Gemini AI.</p>
                  </div>
                  
                  <button
                    onClick={handleGenerate}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/10 transition-colors"
                  >
                    Generate AI Explanation
                  </button>
                </div>
              )}

            </div>

          </div>

          {/* Footer Panel */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 flex items-start gap-2.5 select-none">
            <AlertCircle className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              This explanation is AI-generated for educational purposes. Always follow your doctor's instructions.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default PrescriptionExplainer;
