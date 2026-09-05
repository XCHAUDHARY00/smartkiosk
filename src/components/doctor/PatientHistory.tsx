import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Calendar, 
  Stethoscope, 
  Pill, 
  Activity, 
  FileText, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  TrendingDown, 
  TrendingUp, 
  Sparkles,
  Layers,
  HeartPulse,
  Filter,
  X
} from 'lucide-react';
import { PatientProfile, PastVisit } from '../../types';
import { fetchPatientHistoryFromDB, savePatientPastVisitToDB } from '../../services/dbService';

interface PatientHistoryProps {
  patient: PatientProfile;
  onAddTreatmentToPrescription?: (treatment: string) => void;
  className?: string;
  refreshTrigger?: number;
  attendingDoctor?: string;
}

export const PatientHistory: React.FC<PatientHistoryProps> = ({
  patient,
  onAddTreatmentToPrescription,
  className = '',
  refreshTrigger = 0,
  attendingDoctor = 'Dr. Rajiv Mehta, MD'
}) => {
  const [historyList, setHistoryList] = useState<PastVisit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [expandedVisitIds, setExpandedVisitIds] = useState<Record<string, boolean>>({});
  const [copiedMedIndex, setCopiedMedIndex] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New Visit Form State
  const [newVisitDate, setNewVisitDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newDepartment, setNewDepartment] = useState<string>('General Medicine');
  const [newDoctorName, setNewDoctorName] = useState<string>(attendingDoctor);
  const [newDiagnoses, setNewDiagnoses] = useState<string>('');
  const [newTreatments, setNewTreatments] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [newBp, setNewBp] = useState<string>('');
  const [newPulse, setNewPulse] = useState<string>('');

  // Fetch patient past visits on patient change or refreshTrigger
  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const visits = await fetchPatientHistoryFromDB(patient.id);
      // Sort newest first
      const sorted = [...visits].sort((a, b) => new Date(b.visitDate || b.date || 0).getTime() - new Date(a.visitDate || a.date || 0).getTime());
      setHistoryList(sorted);
      
      // Auto-expand the most recent visit
      if (sorted.length > 0) {
        const firstId = sorted[0].id || 'v_0';
        setExpandedVisitIds({ [firstId]: true });
      }
    } catch (err) {
      console.error('Failed to load patient history:', err);
      setError('Unable to fetch past medical records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patient?.id) {
      loadHistory();
    }
  }, [patient?.id, refreshTrigger]);

  const toggleExpand = (id: string) => {
    setExpandedVisitIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyTreatment = (treatmentText: string, copyKey: string) => {
    if (onAddTreatmentToPrescription) {
      onAddTreatmentToPrescription(treatmentText);
    }
    setCopiedMedIndex(copyKey);
    setTimeout(() => {
      setCopiedMedIndex(null);
    }, 2000);
  };

  const handleAddVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiagnoses.trim() || !newTreatments.trim()) return;

    try {
      setIsSubmitting(true);
      const diagnosesArray = newDiagnoses.split(',').map(d => d.trim()).filter(Boolean);
      const treatmentsArray = newTreatments.split('\n').map(t => t.trim()).filter(Boolean);

      const newRecord: Partial<PastVisit> = {
        patientId: patient.id,
        visitDate: newVisitDate,
        department: newDepartment,
        doctorName: newDoctorName,
        diagnoses: diagnosesArray,
        treatments: treatmentsArray,
        clinicalNotes: newNotes.trim() || undefined,
        vitals: {
          bp: newBp.trim() || undefined,
          pulse: newPulse ? Number(newPulse) : undefined
        }
      };

      const saved = await savePatientPastVisitToDB(newRecord);
      setHistoryList(prev => [saved, ...prev]);
      setShowAddModal(false);
      // Reset form
      setNewDiagnoses('');
      setNewTreatments('');
      setNewNotes('');
      setNewBp('');
      setNewPulse('');
      if (saved.id) {
        setExpandedVisitIds(prev => ({ ...prev, [saved.id!]: true }));
      }
    } catch (err) {
      console.error('Error adding past visit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered visits
  const filteredVisits = useMemo(() => {
    return historyList.filter(visit => {
      const matchesSearch = 
        searchQuery.trim() === '' ||
        (visit.diagnoses || [visit.diagnosis] || []).filter(Boolean).some(d => String(d || '').toLowerCase().includes(searchQuery.toLowerCase())) ||
        (visit.treatments || visit.prescriptions || []).some((t: any) => String(t).toLowerCase().includes(searchQuery.toLowerCase())) ||
        (visit.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (visit.doctorName || visit.doctor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (visit.visitDate || visit.date || '').includes(searchQuery);

      const matchesDept = 
        selectedDeptFilter === 'all' || 
        (visit.department || '').toLowerCase().includes(selectedDeptFilter.toLowerCase());

      return matchesSearch && matchesDept;
    });
  }, [historyList, searchQuery, selectedDeptFilter]);

  // Unique departments for filter tabs
  const departments = useMemo(() => {
    const set = new Set<string>();
    historyList.forEach(v => {
      if (v.department) set.add(v.department);
    });
    return Array.from(set);
  }, [historyList]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getRelativeTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      const now = new Date();
      const diffMonths = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 30));
      if (diffMonths <= 0) return 'Recent / This Month';
      if (diffMonths === 1) return '1 month ago';
      if (diffMonths < 12) return `${diffMonths} months ago`;
      const diffYears = (diffMonths / 12).toFixed(1);
      return `${diffYears} years ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Patient Longitudinal Medical History
              </h3>
              <span className="text-[10px] font-extrabold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {historyList.length} {historyList.length === 1 ? 'Record' : 'Records'}
              </span>
              {patient.abhaId && (
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  ABDM Auto-Linked: {patient.abhaId}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Auto-maintained longitudinal health ledger • Every completed OPD consultation automatically appends to <span className="font-semibold text-slate-800">{patient.name}'s</span> health timeline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadHistory}
            disabled={loading}
            title="Refresh history records"
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Past Record</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by past diagnosis (e.g. Hypertension), medication, doctor..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-700 focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {departments.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedDeptFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                selectedDeptFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Departments
            </button>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDeptFilter(dept)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                  selectedDeptFilter === dept
                    ? 'bg-teal-800 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && historyList.length === 0 && (
        <div className="py-8 text-center space-y-2">
          <RefreshCw className="w-6 h-6 text-teal-700 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">
            Querying longitudinal health history & past visits...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredVisits.length === 0 && (
        <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
          <History className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-xs font-bold text-slate-800">
            {searchQuery || selectedDeptFilter !== 'all' 
              ? 'No matching past visits found' 
              : 'No previous hospital visits recorded'}
          </h4>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            {searchQuery 
              ? `No records match "${searchQuery}". Try clearing filters.`
              : 'This patient has no recorded past visits in this facility EMR. Click "Add Past Record" to log prior hospital history.'}
          </p>
          {(searchQuery || selectedDeptFilter !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedDeptFilter('all'); }}
              className="mt-2 text-xs font-bold text-teal-700 hover:underline cursor-pointer"
            >
              Reset Search & Filters
            </button>
          )}
        </div>
      )}

      {/* Past Visits Timeline */}
      <div className="space-y-4">
        {filteredVisits.map((visit, index) => {
          const visitId = visit.id || `v_${index}`;
          const visitDateStr = visit.visitDate || visit.date || '';
          const isExpanded = !!expandedVisitIds[visitId];
          const relativeTime = visitDateStr ? getRelativeTime(visitDateStr) : '';

          return (
            <div 
              key={visitId}
              className={`rounded-2xl border transition-all ${
                isExpanded 
                  ? 'border-teal-300 bg-gradient-to-br from-white via-teal-50/20 to-white shadow-xs' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Visit Summary Card Header */}
              <div 
                onClick={() => toggleExpand(visitId)}
                className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
              >
                <div className="flex items-start gap-3">
                  {/* Date badge */}
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 text-teal-700 mb-0.5" />
                    <span className="text-[11px] font-black leading-none">
                      {visitDateStr && !isNaN(new Date(visitDateStr).getTime()) ? new Date(visitDateStr).getDate() : '—'}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-teal-700 leading-tight">
                      {visitDateStr && !isNaN(new Date(visitDateStr).getTime()) ? new Date(visitDateStr).toLocaleString('default', { month: 'short' }) : ''}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-slate-900">
                        {visitDateStr ? formatDate(visitDateStr) : 'Past Record'}
                      </span>
                      {relativeTime && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.2 rounded-md">
                          {relativeTime}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-teal-900 bg-teal-100/80 px-2 py-0.2 rounded-md">
                        {visit.department || 'General Medicine'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                      <Stethoscope className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{visit.doctorName || visit.doctor || 'OPD Physician'}</span>
                    </p>

                    {/* Quick Diagnoses preview */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {(visit.diagnoses || [visit.diagnosis] || []).filter(Boolean).map((dx, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-50 text-amber-900 border border-amber-200"
                        >
                          {dx}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right text-[11px]">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Treatments Given</span>
                    <span className="font-bold text-slate-800">
                      {(visit.treatments || visit.prescriptions || []).length} {(visit.treatments || visit.prescriptions || []).length === 1 ? 'Medication' : 'Medications'}
                    </span>
                  </div>

                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Detailed Visit Record */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 space-y-4 border-t border-slate-100 text-xs">
                  
                  {/* Diagnoses & Historical Vitals Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    
                    {/* Confirmed Diagnoses */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                        <HeartPulse className="w-3 h-3 text-red-500" />
                        <span>Confirmed Diagnoses (उस समय का निदान)</span>
                      </span>
                      <ul className="space-y-1 text-xs">
                        {(visit.diagnoses || [visit.diagnosis] || []).filter(Boolean).map((d, i) => (
                          <li key={i} className="flex items-start gap-1.5 font-bold text-slate-900">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Vitals at that visit vs Today */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Activity className="w-3 h-3 text-teal-700" />
                          <span>Historical Vitals vs Today</span>
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">Visit: {visitDateStr ? formatDate(visitDateStr) : ''}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Blood Pressure</span>
                          <span className="font-bold text-slate-900 font-mono">
                            {visit.vitals?.bp || '140/90'}
                          </span>
                          {patient.vitals?.bp && (
                            <span className="text-[10px] text-teal-700 font-semibold block mt-0.5">
                              Today: {patient.vitals.bp}
                            </span>
                          )}
                        </div>

                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Pulse / Heart Rate</span>
                          <span className="font-bold text-slate-900 font-mono">
                            {visit.vitals?.pulse || 78} bpm
                          </span>
                          {patient.vitals?.pulse && (
                            <span className="text-[10px] text-teal-700 font-semibold block mt-0.5">
                              Today: {patient.vitals.pulse} bpm
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Prescribed Treatments with Copy-to-Rx Action */}
                  <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-950 flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-teal-800" />
                        <span>Prescribed Treatments & Medications (उपचार व दवाइयां)</span>
                      </span>
                      <span className="text-[10px] text-teal-800 font-medium">
                        Click "+ Copy to Rx" to add to current prescription
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {(visit.treatments || visit.prescriptions || []).map((treatment, tIdx) => {
                        const copyKey = `${visitId}_${tIdx}`;
                        const isCopied = copiedMedIndex === copyKey;

                        return (
                          <div 
                            key={tIdx}
                            className="p-2 bg-white rounded-lg border border-teal-200/80 flex items-center justify-between gap-3 hover:border-teal-400 transition-colors"
                          >
                            <div className="flex items-start gap-2 flex-1">
                              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-mono shrink-0">
                                Rx #{tIdx + 1}
                              </span>
                              <span className="text-xs font-semibold text-slate-900">
                                {treatment}
                              </span>
                            </div>

                            <button
                              onClick={() => handleCopyTreatment(treatment, copyKey)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                                isCopied 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-teal-800 hover:bg-teal-900 text-white shadow-2xs'
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Added to Rx!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>+ Copy to Rx</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Doctor Clinical Notes & Follow-up Plan */}
                  {visit.clinicalNotes && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Doctor's Clinical Notes at Consultation
                      </span>
                      <p className="text-slate-700 leading-relaxed text-xs">
                        {visit.clinicalNotes}
                      </p>
                    </div>
                  )}

                  {/* Lab investigations & Follow up */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
                    {visit.labInvestigations && visit.labInvestigations.length > 0 && (
                      <div className="flex items-center gap-1 text-slate-600">
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span className="font-bold text-slate-500">Ordered Labs:</span>
                        <span className="font-medium text-slate-800">{visit.labInvestigations.join(', ')}</span>
                      </div>
                    )}

                    {visit.followUpPlan && (
                      <div className="flex items-center gap-1 text-teal-800 font-medium">
                        <Clock className="w-3 h-3 text-teal-700" />
                        <span className="font-bold">Follow-up:</span>
                        <span>{visit.followUpPlan}</span>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Manual Add Past Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    Add Historical Medical Encounter
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Patient: {patient.name} ({patient.tokenNumber})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVisitSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newVisitDate}
                    onChange={(e) => setNewVisitDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:border-teal-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">
                    Department
                  </label>
                  <input
                    type="text"
                    required
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="e.g. Cardiology OPD"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-teal-700 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">
                  Attending Doctor
                </label>
                <input
                  type="text"
                  required
                  value={newDoctorName}
                  onChange={(e) => setNewDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Sunita Rao, DM"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-teal-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">
                  Diagnoses (Comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={newDiagnoses}
                  onChange={(e) => setNewDiagnoses(e.target.value)}
                  placeholder="e.g. Essential Hypertension, Dyslipidemia"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-teal-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">
                  Treatments & Prescriptions (One per line)
                </label>
                <textarea
                  rows={3}
                  required
                  value={newTreatments}
                  onChange={(e) => setNewTreatments(e.target.value)}
                  placeholder="Tab Telmisartan 40mg (1-0-0) OD&#10;Tab Atorvastatin 10mg (0-0-1) HS"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-teal-700 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">
                    Blood Pressure at Visit
                  </label>
                  <input
                    type="text"
                    value={newBp}
                    onChange={(e) => setNewBp(e.target.value)}
                    placeholder="e.g. 138/88"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">
                    Pulse Rate (bpm)
                  </label>
                  <input
                    type="number"
                    value={newPulse}
                    onChange={(e) => setNewPulse(e.target.value)}
                    placeholder="e.g. 76"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">
                  Clinical Findings / Notes
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Notes from physical examination or previous discharge summary..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-teal-700 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Record...' : 'Save to History'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
