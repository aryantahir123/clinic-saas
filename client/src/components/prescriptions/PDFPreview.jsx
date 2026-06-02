import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, Download, Printer, ShieldCheck, Mail, Phone, Heart } from 'lucide-react';
import Modal from '../common/Modal';

// APIs
import { downloadPDF } from '../../api/prescriptionApi';

const PDFPreview = ({ isOpen, onClose, prescription, patientName, doctorName }) => {
  const [downloading, setDownloading] = useState(false);

  if (!prescription) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const blob = await downloadPDF(prescription._id);
      
      // Standard browser download trigger
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rx_Prescription_${prescription._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Prescription PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to trigger PDF document download');
    } finally {
      setDownloading(false);
    }
  };

  const formattedDate = new Date(prescription.createdAt || Date.now()).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Electronic Prescription Receipt 📄"
      size="md"
    >
      <div className="space-y-6 py-2 animate-in zoom-in-95 duration-200">
        
        {/* Printable Simulated prescription card layout */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 font-sans space-y-6 text-slate-800 dark:text-slate-200 shadow-inner">
          
          {/* Header row */}
          <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center">
                  <span className="text-white font-extrabold text-xs">C</span>
                </div>
                <span className="font-black text-slate-950 dark:text-white tracking-tight">
                  Clinic<span className="text-indigo-500">AI</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Digital Health SaaS Platform</p>
            </div>
            
            <div className="text-right text-[10px] text-slate-400 space-y-0.5">
              <p className="font-bold text-slate-600 dark:text-slate-300">Date: {formattedDate}</p>
              <p>Rx ID: {prescription._id.substring(12).toUpperCase()}</p>
            </div>
          </div>

          {/* Demographics details side by side */}
          <div className="grid grid-cols-2 gap-6 text-xs pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-1.5">
              <span className="font-bold text-[9px] text-indigo-500 uppercase tracking-wider block">Doctor / Clinic</span>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white">{doctorName || 'Dr. Assigned physician'}</p>
              <p className="text-[10px] text-slate-400">Consultant Specialist</p>
            </div>
            
            <div className="space-y-1.5">
              <span className="font-bold text-[9px] text-indigo-500 uppercase tracking-wider block">Patient Profile</span>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white">{patientName || 'Unknown Patient'}</p>
              <p className="text-[10px] text-slate-400">General Registration</p>
            </div>
          </div>

          {/* Diagnosis segment */}
          <div className="space-y-1">
            <span className="font-bold text-[9px] text-indigo-500 uppercase tracking-wider block">Diagnosis</span>
            <p className="font-bold text-slate-900 dark:text-white text-base capitalize">{prescription.diagnosis}</p>
          </div>

          {/* Medicines Table */}
          <div className="space-y-2">
            <span className="font-bold text-[9px] text-indigo-500 uppercase tracking-wider block">Prescribed Medicines</span>
            <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 text-[9px] font-bold text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Medicine</th>
                    <th className="p-3">Dosage</th>
                    <th className="p-3">Frequency</th>
                    <th className="p-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                  {(prescription.medicines || []).map((med, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="p-3 capitalize">{med.name}</td>
                      <td className="p-3">{med.dosage}</td>
                      <td className="p-3">{med.frequency}</td>
                      <td className="p-3">{med.duration} <span className="text-[9px] text-slate-400 font-normal">({med.route || 'Oral'})</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Instructions Box */}
          {prescription.instructions && (
            <div className="space-y-1.5 p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="font-bold text-[9px] text-indigo-500 uppercase tracking-wider block">Special Instructions / Diet</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">{prescription.instructions}</p>
            </div>
          )}

          {/* Bottom Stamp Area */}
          <div className="pt-6 flex justify-between items-end">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Cryptographically Certified Profile</span>
            </div>
            
            <div className="text-center w-36 border-t border-slate-300 dark:border-slate-700 pt-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Doctor Signature</p>
            </div>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-500 dark:text-slate-400 text-sm font-bold rounded-xl transition-all duration-200"
          >
            Close Preview
          </button>
          
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
          >
            {downloading ? (
              <Printer className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
          </button>
        </div>

      </div>
    </Modal>
  );
};

export default PDFPreview;
