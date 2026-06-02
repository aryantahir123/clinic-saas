import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  User, Activity, FileText, Heart, ShieldAlert, Calendar, Plus, RefreshCw, Eye, Download, Phone, BrainCircuit 
} from 'lucide-react';

// Custom Components
import MedicalTimeline from '../../components/patients/MedicalTimeline';
import PrescriptionModal from '../../components/prescriptions/PrescriptionModal';
import PDFPreview from '../../components/prescriptions/PDFPreview';
import SymptomChecker from '../../components/ai/SymptomChecker';
import RiskFlagBanner from '../../components/ai/RiskFlagBanner';

// APIs
import { getPatientById, getPatientHistory } from '../../api/patientApi';
import { useAuthStore } from '../../store/authStore';

const PatientDetail = () => {
  const { patientId } = useParams();
  const location = useLocation();
  const { user } = useAuthStore();
  const appointmentId = location.state?.appointmentId;

  // State Management
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState({ appointments: [], prescriptions: [], diagnosisLogs: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');

  // Modal Control States
  const [isRxOpen, setIsRxOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Load Patient Details & Clinical History Logs
  const loadPatientData = async () => {
    try {
      setLoading(true);
      const [patientRes, historyRes] = await Promise.all([
        getPatientById(patientId),
        getPatientHistory(patientId)
      ]);

      setPatient(patientRes.data);
      setHistory(historyRes.data || { appointments: [], prescriptions: [], diagnosisLogs: [] });
    } catch (error) {
      console.error('Error loading patient details:', error);
      toast.error('Failed to load patient records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  // Callback from RiskFlagBanner or Prescription success
  const handleRiskUpdate = (updatedPatientData) => {
    // If the backend returns the full patient profile object
    if (updatedPatientData?._id) {
      setPatient(updatedPatientData);
    } else {
      // Re-fetch to ensure sync
      loadPatientData();
    }
  };

  const handleRxSuccess = () => {
    setIsRxOpen(false);
    loadPatientData(); // Refresh history logs with newly registered prescription
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 w-full bg-slate-100 dark:bg-slate-800 rounded-3xl" />
        <div className="h-10 w-80 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        <div className="h-80 w-full bg-slate-100 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/80">
        <User className="w-16 h-16 stroke-[1.2] text-slate-300 dark:text-slate-600 mx-auto" />
        <h3 className="font-extrabold text-slate-700 dark:text-slate-350 mt-4 text-lg">Patient file not found</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Risk Alert Flags Banner */}
      <RiskFlagBanner
        isHighRisk={patient.isHighRisk}
        riskNotes={patient.riskNotes}
        patientId={patient._id}
        onCheck={handleRiskUpdate}
      />

      {/* 2. Top Demographics Info Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-start justify-between relative overflow-hidden group">
        
        {/* Decorative circle backdrop */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Avatar frame */}
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-black text-xl flex items-center justify-center rounded-2xl shadow-md shrink-0 select-none">
            {patient.name.split(' ').map(p=>p[0]).join('').substring(0,2).toUpperCase()}
          </div>
          
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{patient.name}</h2>
              {patient.isHighRisk && (
                <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-450 rounded-full text-[9px] font-black uppercase">
                  HIGH RISK FLAG
                </span>
              )}
            </div>
            
            {/* Quick chips info */}
            <div className="flex flex-wrap gap-2 items-center text-xs text-slate-400 font-semibold">
              <span className="capitalize">{patient.gender}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span>Age: {patient.age}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span>Blood Group: <strong className="text-slate-600 dark:text-slate-200">{patient.bloodGroup || 'N/A'}</strong></span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{patient.phone}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic tagging (Allergies and Chronic Conditions) */}
        <div className="w-full md:w-auto grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs shrink-0 self-stretch sm:self-auto border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-700/50 pt-4 md:pt-0 md:pl-6">
          <div className="space-y-1.5">
            <span className="font-bold text-[9px] text-slate-400 uppercase tracking-widest block">Drug / Food Allergies</span>
            <div className="flex flex-wrap gap-1">
              {(patient.allergies || []).length === 0 ? (
                <span className="text-slate-400 italic font-semibold">No known allergies</span>
              ) : (
                (patient.allergies || []).map((all, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 rounded-lg font-bold text-[10px]">
                    {all}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-[9px] text-slate-400 uppercase tracking-widest block">Chronic Pathologies</span>
            <div className="flex flex-wrap gap-1">
              {(patient.chronicConditions || []).length === 0 ? (
                <span className="text-slate-400 italic font-semibold">None reported</span>
              ) : (
                (patient.chronicConditions || []).map((chr, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 rounded-lg font-bold text-[10px]">
                    {chr}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 3. Responsive Three-Tab Console Panel */}
      <div className="space-y-6">
        
        {/* Navigation Tabs Header */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 select-none gap-6">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3.5 text-sm font-extrabold tracking-tight relative transition-colors ${
              activeTab === 'timeline'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-400 hover:text-slate-500'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Activity className="w-4.5 h-4.5" />
              <span>Medical History</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('prescription')}
            className={`pb-3.5 text-sm font-extrabold tracking-tight relative transition-colors ${
              activeTab === 'prescription'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-400 hover:text-slate-500'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-4.5 h-4.5" />
              <span>Write Prescription</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`pb-3.5 text-sm font-extrabold tracking-tight relative transition-colors ${
              activeTab === 'ai'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-400 hover:text-slate-500'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <BrainCircuit className="w-4.5 h-4.5" />
              <span>AI Diagnosis</span>
            </span>
          </button>
        </div>

        {/* Tab Content Canvas */}
        <div className="min-h-96">
          
          {/* TAB 1: MEDICAL TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="animate-in fade-in duration-200">
              <MedicalTimeline history={history} />
            </div>
          )}

          {/* TAB 2: WRITE PRESCRIPTION */}
          {activeTab === 'prescription' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Actions & Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Prescription Audits</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Manage and print active patient pharmaceutical sheets.</p>
                </div>
                
                <button
                  onClick={() => setIsRxOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/10 flex items-center gap-1 hover:-translate-y-0.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write New Prescription</span>
                </button>
              </div>

              {/* Roster list of existing prescriptions */}
              {(history.prescriptions || []).length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-850">
                  <FileText className="w-10 h-10 stroke-[1.5] text-slate-300 dark:text-slate-650 mx-auto" />
                  <p className="text-xs font-semibold text-slate-400 mt-3">No prescriptions logged for this patient profile.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(history.prescriptions || []).map((rx) => (
                    <div 
                      key={rx._id}
                      className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-44 hover:shadow-md transition-shadow group relative overflow-hidden"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-slate-400 font-bold">
                            {new Date(rx.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded text-[9px] font-bold uppercase border border-emerald-100">
                            {(rx.medicines || []).length} items
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-[10px] text-indigo-500 font-bold block uppercase tracking-wider">Diagnosis</span>
                          <h4 className="font-extrabold text-slate-800 dark:text-white text-sm capitalize truncate max-w-xs">{rx.diagnosis}</h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/40">
                        <button
                          onClick={() => {
                            setSelectedPrescription(rx);
                            setShowPdfPreview(true);
                          }}
                          className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 flex-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Doc</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: AI DIAGNOSIS */}
          {activeTab === 'ai' && (
            <div className="animate-in fade-in duration-200">
              <SymptomChecker
                patientId={patient._id}
                patientAge={patient.age}
                patientGender={patient.gender}
              />
            </div>
          )}

        </div>

      </div>

      {/* 4. Write Prescription Form Drawer Modal */}
      <PrescriptionModal
        isOpen={isRxOpen}
        onClose={() => setIsRxOpen(false)}
        patientId={patient._id}
        patientName={patient.name}
        doctorName={user?.name}
        appointmentId={appointmentId}
        onSuccess={handleRxSuccess}
      />

      {/* 5. PDF electronic document viewer and print portal */}
      <PDFPreview
        isOpen={showPdfPreview}
        onClose={() => {
          setSelectedPrescription(null);
          setShowPdfPreview(false);
        }}
        prescription={selectedPrescription}
        patientName={patient.name}
        doctorName={selectedPrescription?.doctorId?.name || user?.name}
      />

    </div>
  );
};

export default PatientDetail;
