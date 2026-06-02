import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Brain, Search, UserCheck, Activity, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Custom Components
import SymptomChecker from '../../components/ai/SymptomChecker';

// APIs
import { searchPatients } from '../../api/patientApi';

const AddDiagnosis = () => {
  const navigate = useNavigate();

  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Debounced Patient Lookup
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const response = await searchPatients(searchQuery);
        setSearchResults(response.data || []);
      } catch (error) {
        console.error('Error searching patients:', error);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-500 fill-indigo-500/10" />
            <span>AI Symptom Checker Console</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Select a patient to assess symptoms and compile Gemini diagnostic recommendations.</p>
        </div>
      </div>

      {/* Patient Autocomplete Selector Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-6 rounded-2xl shadow-sm space-y-4">
        
        {!selectedPatient ? (
          <div className="space-y-3 max-w-xl mx-auto py-2">
            <div className="text-center space-y-1 mb-2">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-650 mx-auto stroke-[1.5]" />
              <h4 className="font-extrabold text-slate-850 dark:text-slate-100 text-sm">Find Patient Profile</h4>
              <p className="text-xs text-slate-400">Locate a registered patient to initialize the diagnostic environment.</p>
            </div>

            {/* Typeahead Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type patient name or registered contact number..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 transition-all"
              />
            </div>

            {/* Results Autocomplete Box */}
            {searchResults.length > 0 && (
              <div className="border border-slate-100 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-950/60 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 shadow-lg">
                {searchResults.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => {
                      setSelectedPatient(p);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-900 flex justify-between items-center text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white block text-sm">{p.name}</span>
                      <span className="text-[11px] text-slate-400 font-semibold block">Phone: {p.phone}</span>
                    </div>
                    <span className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold uppercase text-[10px]">
                      Select Patient
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Selection Status Card */
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl animate-in fade-in duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl font-black text-sm flex items-center justify-center">
                {selectedPatient.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
              </div>
              
              <div>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">Active Target Patient</span>
                <span className="font-extrabold text-slate-850 dark:text-white text-base block">{selectedPatient.name}</span>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                  <span>Age: {selectedPatient.age}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span>{selectedPatient.gender}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span>Phone: {selectedPatient.phone}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedPatient(null)}
              className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl transition-colors"
            >
              Change Patient
            </button>
          </div>
        )}

      </div>

      {/* 2. Form Canvas */}
      {selectedPatient && (
        <div className="animate-in slide-in-from-bottom-4 duration-300">
          <SymptomChecker
            patientId={selectedPatient._id}
            patientAge={selectedPatient.age}
            patientGender={selectedPatient.gender}
          />
        </div>
      )}

    </div>
  );
};

export default AddDiagnosis;
