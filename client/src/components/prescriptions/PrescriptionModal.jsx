import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, FileText, Download, Check, FileCheck, Eye, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import PDFPreview from './PDFPreview';

// APIs
import { createPrescription } from '../../api/prescriptionApi';

// Schema for form validation
const prescriptionSchema = z.object({
  diagnosis: z.string().min(1, 'Physician diagnosis is required').trim(),
  instructions: z.string().optional(),
  followUpDate: z.string().optional(),
});

const DEFAULT_MEDICINE = {
  name: '',
  dosage: '1 tablet',
  frequency: 'Once daily',
  duration: '5 days',
  route: 'Oral'
};

const PrescriptionModal = ({ isOpen, onClose, patientId, patientName, doctorName, appointmentId, onSuccess }) => {
  // Medicines Dynamic Rows State
  const [medicines, setMedicines] = useState([{ ...DEFAULT_MEDICINE }]);
  const [createdPrescription, setCreatedPrescription] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Form Hooks
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      diagnosis: '',
      instructions: '',
      followUpDate: ''
    }
  });

  // Reset states on modal close or open
  useEffect(() => {
    if (isOpen) {
      setMedicines([{ ...DEFAULT_MEDICINE }]);
      setCreatedPrescription(null);
      reset({
        diagnosis: '',
        instructions: '',
        followUpDate: ''
      });
    }
  }, [isOpen, reset]);

  // Add a medication row
  const handleAddRow = () => {
    setMedicines(prev => [...prev, { ...DEFAULT_MEDICINE }]);
  };

  // Remove a medication row (ensure minimum 1 remains)
  const handleRemoveRow = (index) => {
    if (medicines.length === 1) {
      toast.error('At least one medicine is required in clinical prescription');
      return;
    }
    setMedicines(prev => prev.filter((_, i) => i !== index));
  };

  // Change medication inputs dynamically
  const handleMedicineChange = (index, field, value) => {
    setMedicines(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  // Submit Handler
  const onSubmit = async (data) => {
    // 1. Validate medicines lists
    const invalidMed = medicines.some(med => !med.name.trim());
    if (invalidMed) {
      toast.error('Please enter the name of all prescribed medicines');
      return;
    }

    try {
      const payload = {
        patientId,
        appointmentId: appointmentId || undefined,
        diagnosis: data.diagnosis,
        instructions: data.instructions || '',
        followUpDate: data.followUpDate || undefined,
        medicines
      };

      const response = await createPrescription(payload);
      toast.success('Clinical prescription saved successfully');
      setCreatedPrescription(response.data);

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error(error.response?.data?.error || 'Failed to save clinical prescription');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Electronic Prescription 📝"
      size="lg"
    >
      <div className="space-y-6 py-2 animate-in zoom-in-95 duration-200">
        
        {/* Success Deck Section */}
        {createdPrescription ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-6 rounded-2xl text-center space-y-5 animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-500 rounded-xl flex items-center justify-center mx-auto shadow-inner">
              <FileCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Prescription Registered!</h3>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">The electronic Rx has been successfully saved to the patient health files.</p>
            </div>
            
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/10 flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>View Rx Document</span>
              </button>
              
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Read-only details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase">Patient Name</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 block mt-0.5">{patientName || 'Unknown Patient'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase">Issuing Doctor</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 block mt-0.5">{doctorName || 'Dr. Physician'}</span>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="space-y-1.5">
              <label htmlFor="diag" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Primary Diagnosis <span className="text-rose-500">*</span>
              </label>
              <input
                id="diag"
                type="text"
                {...register('diagnosis')}
                placeholder="e.g. Acute Pharyngitis, Gastritis"
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.diagnosis ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
                } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-4 transition-all duration-200`}
              />
              {errors.diagnosis && (
                <p className="text-xs font-semibold text-rose-500 mt-1">{errors.diagnosis.message}</p>
              )}
            </div>

            {/* Medicines dynamic list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medicines & Prescription</span>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-0.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Medicine</span>
                </button>
              </div>

              {/* Medicine rows */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {medicines.map((med, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl items-center relative group animate-in slide-in-from-left-2 duration-150">
                    
                    {/* Name */}
                    <div className="col-span-12 sm:col-span-4 space-y-1">
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                        placeholder="Medicine name..."
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs rounded-xl focus:outline-none"
                      />
                    </div>

                    {/* Dosage */}
                    <div className="col-span-6 sm:col-span-2">
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                        placeholder="e.g. 1 tab"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs rounded-xl focus:outline-none"
                      />
                    </div>

                    {/* Frequency */}
                    <div className="col-span-6 sm:col-span-2">
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                        placeholder="e.g. 2x daily"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs rounded-xl focus:outline-none"
                      />
                    </div>

                    {/* Duration */}
                    <div className="col-span-5 sm:col-span-2">
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                        placeholder="e.g. 5 days"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs rounded-xl focus:outline-none"
                      />
                    </div>

                    {/* Route */}
                    <div className="col-span-5 sm:col-span-1.5">
                      <select
                        value={med.route}
                        onChange={(e) => handleMedicineChange(index, 'route', e.target.value)}
                        className="w-full px-2 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs rounded-xl focus:outline-none"
                      >
                        <option value="Oral">Oral</option>
                        <option value="IV">IV</option>
                        <option value="IM">IM</option>
                        <option value="Topical">Topical</option>
                        <option value="Inhalation">Inhaler</option>
                      </select>
                    </div>

                    {/* Remove */}
                    <div className="col-span-2 sm:col-span-0.5 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                        title="Remove row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-1.5">
              <label htmlFor="inst" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Dietary / Intake Instructions
              </label>
              <textarea
                id="inst"
                rows={3}
                {...register('instructions')}
                placeholder="e.g. Take after food, avoid cold beverages..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 transition-all duration-200"
              />
            </div>

            {/* Follow-up Date */}
            <div className="space-y-1.5">
              <label htmlFor="follow" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Recommended Follow-up Date <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="follow"
                type="date"
                {...register('followUpDate')}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-500 dark:text-slate-400 text-sm font-bold rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Prescription...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Save Prescription</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>

      {/* Embedded PDF Receipt Preview Modal */}
      <PDFPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        prescription={createdPrescription}
        patientName={patientName}
        doctorName={doctorName}
      />
    </Modal>
  );
};

export default PrescriptionModal;
