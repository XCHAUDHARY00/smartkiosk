import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  User, 
  Stethoscope, 
  Pill, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  Check, 
  Filter, 
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PatientProfile, PastVisit } from '../../types';
import { fetchPatientHistoryByPhone } from '../../services/dbService';
import { playTouchFeedback, playSuccessChime } from '../../services/speechService';

interface PatientPastRecordsModalProps {
  patient: PatientProfile;
  onClose: () => void;
  onImportMedsToRx?: (meds: string[]) => void;
}

export const PatientPastRecordsModal: React.FC<PatientPastRecordsModalProps> = ({
  patient,
  onClose,
  onImportMedsToRx
}) => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<PastVisit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [copiedMeds, setCopiedMeds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const cleanPhone = (patient.mobile || '').replace(/\D/g, '').slice(-10);
        const res = await fetchPatientHistoryByPhone(cleanPhone);
        if (isMounted) {
          setHistory(res.history || []);
        }
      } catch (err) {
        console.error('Error fetching past records in modal:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [patient.mobile]);

  // Handle importing a single or multiple meds to doctor's current prescription
  const handleCopyMed = (med: string) => {
    playTouchFeedback();
    if (onImportMedsToRx) {
      onImportMedsToRx([med]);
      setCopiedMeds(prev => ({ ...prev, [med]: true }));
      setTimeout(() => {
        setCopiedMeds(prev => ({ ...prev, [med]: false }));
      }, 2000);
    }
  };

  const handleCopyAllMedsFromVisit = (meds: string[]) => {
    playTouchFeedback();
    playSuccessChime();
    if (onImportMedsToRx && meds.length > 0) {
      onImportMedsToRx(meds);
      const update: Record<string, boolean> = {};
      meds.forEach(m => { update[m] = true; });
      setCopiedMeds(prev => ({ ...prev, ...update }));
      setTimeout(() => {
        setCopiedMeds(prev => {
          const next = { ...prev };
          meds.forEach(m => { next[m] = false; });
          return next;
        });
      }, 2500);
    }
  };

  // Filter records
  const filteredHistory = history.filter(visit => {
    const matchesSearch = 
      (visit.doctorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (visit.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (visit.oldProblem || visit.chiefComplaint || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (visit.diagnoses || []).some(d => d.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (visit.treatments || []).some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = 
      selectedTypeFilter === 'all' || 
      (visit.diagnosisType || '').toLowerCase().includes(selectedTypeFilter.toLowerCase());

    return matchesSearch && matchesType;
  });

  // Highlight badge color for diagnosis type
  const getDiagnosisTypeBadge = (type?: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('cardio') || t.includes('heart') || t.includes('hypertension')) {
      return 'bg-rose-100 text-rose-900 border-rose-300';
    }
    if (t.includes('infect') || t.includes('fever') || t.includes('acute')) {
      return 'bg-amber-100 text-amber-950 border-amber-300';
    }
    if (t.includes('metabolic') || t.includes('diabet') || t.includes('endocrine')) {
      return 'bg-purple-100 text-purple-950 border-purple-300';
    }
    if (t.includes('gastro') || t.includes('acid') || t.includes('gerd')) {
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
    if (t.includes('respiratory') || t.includes('chest') || t.includes('cough')) {
      return 'bg-cyan-100 text-cyan-950 border-cyan-300';
    }
    return 'bg-teal-100 text-teal-900 border-teal-300';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-5xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-200 text-[11px] font-extrabold border border-teal-400/30">
                Hospital OPD History System
              </span>
              <span className="text-teal-300 text-xs font-mono">
                Phone: +91 {patient.mobile || 'N/A'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Past Records of Patient: {patient.name}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Auto-detected previous hospital OPD visits, treating doctors, prescribed medications & clinical diagnosis highlights
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by diagnosis, medicine, doctor..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-teal-600 shadow-xs"
              />
            </div>

            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden shadow-xs cursor-pointer"
            >
              <option value="all">All Diagnosis Types</option>
              <option value="cardio">Cardiovascular / Chronic</option>
              <option value="infect">Infectious / Acute</option>
              <option value="gastro">Gastrointestinal</option>
              <option value="metabolic">Metabolic / Endocrine</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-semibold flex items-center gap-2">
            <span>Detected: </span>
            <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 font-bold">
              {filteredHistory.length} Record{filteredHistory.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Content Body: Table Formate Data */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Detecting past records for mobile +91 {patient.mobile}...
              </p>
            </div>
          ) : history.length === 0 ? (
            <div className="py-16 text-center space-y-3 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Past medicine record not available
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                No past hospital consultation or medicine records were located for mobile number <strong className="text-slate-800">+91 {patient.mobile}</strong>.
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No past records matched your search query.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-extrabold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Date (तारीख)</th>
                    <th className="py-3.5 px-4">Doctor & Dept (डॉक्टर व विभाग)</th>
                    <th className="py-3.5 px-4">Old Problem (पुरानी समस्या)</th>
                    <th className="py-3.5 px-4 min-w-[220px]">Diagnosis & Type Highlights (डायग्नोसिस)</th>
                    <th className="py-3.5 px-4 min-w-[240px]">Medicines Taken (दवाईयां)</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredHistory.map((visit, idx) => (
                    <tr 
                      key={visit.id || idx} 
                      className="hover:bg-slate-50/80 transition-colors align-top"
                    >
                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <Clock className="w-3.5 h-3.5 text-teal-700" />
                          <span>{visit.visitDate}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                          {visit.id}
                        </span>
                      </td>

                      {/* Doctor & Department */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{visit.doctorName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {visit.department}
                        </div>
                      </td>

                      {/* Old Problem / Chief Complaint */}
                      <td className="py-4 px-4">
                        <div className="text-slate-800 font-medium leading-relaxed max-w-xs">
                          {visit.oldProblem || visit.chiefComplaint || 'Routine Follow-up'}
                        </div>
                      </td>

                      {/* Diagnosis & Key Point Highlights */}
                      <td className="py-4 px-4 space-y-1.5">
                        {/* Highlight Key Point of What Type Diagnosis */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border shadow-2xs ${getDiagnosisTypeBadge(visit.diagnosisType)}`}>
                            {visit.diagnosisType || 'Clinical OPD'}
                          </span>
                        </div>

                        {/* Diagnoses List */}
                        {visit.diagnoses && visit.diagnoses.length > 0 && (
                          <div className="font-bold text-slate-900 text-xs">
                            {visit.diagnoses.join(', ')}
                          </div>
                        )}

                        {/* Key Highlights */}
                        {visit.keyDiagnosisHighlights && visit.keyDiagnosisHighlights.length > 0 && (
                          <div className="space-y-0.5 pt-1">
                            {visit.keyDiagnosisHighlights.map((hl, hlIdx) => (
                              <div key={hlIdx} className="flex items-center gap-1 text-[11px] text-amber-900 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200">
                                <span className="font-bold text-amber-700">★</span>
                                <span className="font-semibold">{hl}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Medicines Taken (Which medicine he took) */}
                      <td className="py-4 px-4 space-y-1.5">
                        {visit.treatments && visit.treatments.length > 0 ? (
                          <div className="space-y-1">
                            {visit.treatments.map((med, mIdx) => {
                              const isCopied = copiedMeds[med];
                              return (
                                <div 
                                  key={mIdx} 
                                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-teal-50/70 border border-teal-200 text-teal-950 text-[11px] font-medium"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <Pill className="w-3 h-3 text-teal-700 shrink-0" />
                                    <span>{med}</span>
                                  </div>
                                  {onImportMedsToRx && (
                                    <button
                                      type="button"
                                      onClick={() => handleCopyMed(med)}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                        isCopied 
                                          ? 'bg-emerald-600 text-white' 
                                          : 'bg-white hover:bg-teal-100 text-teal-800 border border-teal-300'
                                      }`}
                                      title="Add to Current Prescription"
                                    >
                                      {isCopied ? 'Added ✓' : '+ Add'}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No medicines recorded</span>
                        )}
                      </td>

                      {/* Action Column */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {onImportMedsToRx && visit.treatments && visit.treatments.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleCopyAllMedsFromVisit(visit.treatments)}
                            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1 mx-auto"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add All Meds to Rx</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Records automatically indexed by patient mobile number <strong className="text-slate-800">+91 {patient.mobile}</strong>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs cursor-pointer transition-colors"
          >
            Close Records (बंद करें)
          </button>
        </div>

      </div>
    </div>
  );
};
