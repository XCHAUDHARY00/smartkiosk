import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  AlertTriangle,
  Plus,
  Check,
  FileText,
  Pill,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Eye,
  FolderOpen,
  FlaskConical,
  RefreshCw,
  Edit3,
  ThumbsDown,
  User,
  Activity,
  Globe,
  Building2,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Zap,
  Heart,
  Leaf,
  ClipboardList,
  Send,
  BadgeCheck
} from 'lucide-react';
import {
  PatientProfile,
  ClinicalSummary,
  LanguageCode,
  MedicationItem,
  PatientDocumentRecord
} from '../../types';
import { DocumentEvidenceModal } from '../common/DocumentEvidenceModal';
import {
  callPatientToCabin,
  startDoctorConsultation,
  completeConsultationWithOrders,
  startDoctorReview,
  completeDoctorReview
} from '../../services/encounterWorkflowService';
import { updatePatientStatus } from '../../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type VerifyAction = 'accepted' | 'edited' | 'rejected';
type OrderTab = 'investigations' | 'prescription' | 'followup';

interface DoctorStationProps {
  patients: PatientProfile[];
  activePatient: PatientProfile | null;
  onSelectPatient: (patient: PatientProfile) => void;
  clinicalSummary?: ClinicalSummary;
  onUpdateSummary: (summary: ClinicalSummary) => void;
  onNavigateToRoute: () => void;
  language: LanguageCode;
  onUpdatePatient?: (patient: PatientProfile) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COMMON_INVESTIGATIONS = [
  { name: '12-Lead ECG', room: 'Rm 08', floor: 'GF', category: 'Cardiology' },
  { name: 'CBC (Blood Test)', room: 'Rm 12', floor: 'GF', category: 'Path' },
  { name: 'Blood Sugar (FBS)', room: 'Rm 12', floor: 'GF', category: 'Path' },
  { name: 'Chest X-Ray', room: 'Rm 104', floor: '1F', category: 'Radio' },
  { name: 'USG Abdomen', room: 'Rm 106', floor: '1F', category: 'Radio' },
  { name: 'LFT', room: 'Rm 12', floor: 'GF', category: 'Path' },
  { name: 'KFT', room: 'Rm 12', floor: 'GF', category: 'Path' },
  { name: 'Lipid Profile', room: 'Rm 12', floor: 'GF', category: 'Path' },
  { name: 'HbA1c', room: 'Rm 12', floor: 'GF', category: 'Path' },
  { name: 'Troponin I', room: 'Rm 08', floor: 'GF', category: 'Emergency' },
];

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  hi: 'Hindi',
  en: 'English',
  pa: 'Punjabi',
  bn: 'Bengali',
  mr: 'Marathi',
  gu: 'Gujarati',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam',
  or: 'Odia',
  ur: 'Urdu',
  bho: 'Bhojpuri',
  hinglish: 'Hinglish'
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

/** AI label badge — shown on every AI-generated section */
function AILabel({ slim }: { slim?: boolean }) {
  return slim ? (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
      <Sparkles className="w-2.5 h-2.5" /> AI
    </span>
  ) : (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800">
      <Sparkles className="w-3 h-3" />
      AI GENERATED · NOT A FINAL DIAGNOSIS
    </div>
  );
}

/** Doctor Verified badge */
function VerifiedBadge({ action }: { action: VerifyAction }) {
  if (action === 'accepted') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
      <BadgeCheck className="w-3 h-3" /> DOCTOR VERIFIED
    </span>
  );
  if (action === 'edited') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold border border-indigo-200">
      <Edit3 className="w-3 h-3" /> DOCTOR EDITED
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">
      <X className="w-3 h-3" /> REJECTED
    </span>
  );
}

/** Per-item Accept / Edit / Reject action row */
function ItemActions({
  itemKey,
  current,
  onAction,
  editNode
}: {
  itemKey: string;
  current?: VerifyAction;
  onAction: (key: string, action: VerifyAction) => void;
  editNode?: React.ReactNode;
}) {
  const [showEdit, setShowEdit] = useState(false);

  if (current) {
    return (
      <div className="flex items-center gap-2 mt-1.5">
        <VerifiedBadge action={current} />
        <button
          type="button"
          onClick={() => onAction(itemKey, 'accepted')}
          className="text-[10px] text-slate-400 hover:text-slate-600 underline underline-offset-2"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onAction(itemKey, 'accepted')}
          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1 transition-colors"
        >
          <Check className="w-3 h-3" /> Accept
        </button>
        <button
          type="button"
          onClick={() => setShowEdit(!showEdit)}
          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-[11px] font-bold flex items-center gap-1 transition-colors"
        >
          <Edit3 className="w-3 h-3" /> Edit
        </button>
        <button
          type="button"
          onClick={() => onAction(itemKey, 'rejected')}
          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-1 transition-colors"
        >
          <ThumbsDown className="w-3 h-3" /> Reject
        </button>
      </div>
      {showEdit && editNode && (
        <div className="border-l-2 border-indigo-300 pl-3">{editNode}</div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const DoctorStation: React.FC<DoctorStationProps> = ({
  patients,
  activePatient,
  onSelectPatient,
  clinicalSummary,
  onUpdateSummary,
  onNavigateToRoute,
  language,
  onUpdatePatient
}) => {

  // ── Local state ──────────────────────────────────────────────────────────────
  const [verifiedItems, setVerifiedItems] = useState<Record<string, VerifyAction>>(
    clinicalSummary?.doctorVerifiedItems || {}
  );
  const [consultNotes, setConsultNotes] = useState(clinicalSummary?.doctorConsultationNotes || '');
  const [followUpDate, setFollowUpDate] = useState(clinicalSummary?.followUpDate || '');
  const [followUpInstructions, setFollowUpInstructions] = useState(clinicalSummary?.followUpInstructions || '');
  const [activeOrderTab, setActiveOrderTab] = useState<OrderTab>('investigations');
  const [customTest, setCustomTest] = useState('');
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('1 Tab');
  const [medFreq, setMedFreq] = useState('BD (सुबह-शाम)');
  const [medDuration, setMedDuration] = useState('5 Days');
  const [inspectingDoc, setInspectingDoc] = useState<PatientDocumentRecord | null>(null);
  const [showAyush, setShowAyush] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  // Reset state when patient changes
  useEffect(() => {
    setVerifiedItems(clinicalSummary?.doctorVerifiedItems || {});
    setConsultNotes(clinicalSummary?.doctorConsultationNotes || '');
    setFollowUpDate(clinicalSummary?.followUpDate || '');
    setFollowUpInstructions(clinicalSummary?.followUpInstructions || '');
    setEditedValues({});
  }, [activePatient?.id, clinicalSummary?.id]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleVerifyItem = (key: string, action: VerifyAction) => {
    const updated = { ...verifiedItems, [key]: action };
    setVerifiedItems(updated);
    if (clinicalSummary) {
      onUpdateSummary({ ...clinicalSummary, doctorVerifiedItems: updated });
    }
  };

  const handleEditSave = (key: string, value: string) => {
    if (!value.trim()) return;
    setEditedValues(prev => ({ ...prev, [key]: value }));
    handleVerifyItem(key, 'edited');
  };

  const handleUpdateDocument = (updatedDoc: PatientDocumentRecord) => {
    if (!activePatient || !onUpdatePatient) return;
    const updatedDocs = (activePatient.documents || []).map(d =>
      d.id === updatedDoc.id ? updatedDoc : d
    );
    onUpdatePatient({ ...activePatient, documents: updatedDocs });
    setInspectingDoc(updatedDoc);
  };

  const handleImportPrescription = (medString: string, freq: string) => {
    if (!clinicalSummary) return;
    const newMed: MedicationItem = {
      name: medString,
      dosage: '1 Tab',
      frequency: freq || 'BD',
      duration: '30 Days'
    };
    const currentMeds: MedicationItem[] = (clinicalSummary.medications || []).map(m => typeof m === 'string' ? { name: m, dosage: '1 Tab', frequency: freq || 'BD', duration: '30 Days' } : m);
    onUpdateSummary({
      ...clinicalSummary,
      medications: [...currentMeds, newMed]
    });
  };

  const handleReorderTest = (testName: string) => {
    if (!clinicalSummary) return;
    const current = clinicalSummary.doctorOrderedTests || [];
    if (!current.includes(testName)) {
      onUpdateSummary({ ...clinicalSummary, doctorOrderedTests: [...current, testName] });
    }
  };

  const handleRemoveOrderedTest = (testName: string) => {
    if (!clinicalSummary?.doctorOrderedTests) return;
    onUpdateSummary({
      ...clinicalSummary,
      doctorOrderedTests: clinicalSummary.doctorOrderedTests.filter(t => t !== testName)
    });
  };

  const toggleInvestigation = (name: string) => {
    if (!clinicalSummary) return;
    const current = clinicalSummary.doctorOrderedTests || [];
    const updated = current.includes(name)
      ? current.filter(t => t !== name)
      : [...current, name];
    onUpdateSummary({ ...clinicalSummary, doctorOrderedTests: updated });
  };

  const handleAddCustomTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTest.trim() || !clinicalSummary) return;
    const current = clinicalSummary.doctorOrderedTests || [];
    if (!current.includes(customTest.trim())) {
      onUpdateSummary({ ...clinicalSummary, doctorOrderedTests: [...current, customTest.trim()] });
    }
    setCustomTest('');
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim() || !clinicalSummary) return;
    const newMed: MedicationItem = { name: medName.trim(), dosage: medDose, frequency: medFreq, duration: medDuration };
    const currentMeds: MedicationItem[] = (clinicalSummary.medications || []).map(m => typeof m === 'string' ? { name: m, dosage: '', frequency: '', duration: '' } : m);
    onUpdateSummary({ ...clinicalSummary, medications: [...currentMeds, newMed] });
    setMedName('');
  };

  const handleRemoveMedication = (idx: number) => {
    if (!clinicalSummary?.medications) return;
    const currentMeds: MedicationItem[] = clinicalSummary.medications.map(m => typeof m === 'string' ? { name: m, dosage: '', frequency: '', duration: '' } : m);
    currentMeds.splice(idx, 1);
    onUpdateSummary({ ...clinicalSummary, medications: currentMeds });
  };

  const handleCompleteConsultation = () => {
    if (!clinicalSummary || !activePatient) return;
    const updatedSummary: ClinicalSummary = {
      ...clinicalSummary,
      isDoctorConsultationDone: true,
      doctorConsultationNotes: consultNotes,
      followUpDate,
      followUpInstructions,
      doctorVerifiedItems: verifiedItems
    };
    onUpdateSummary(updatedSummary);

    // Transition encounter status (Waiting/With Doctor -> Investigations or Pharmacy or Completed)
    const { patient: updatedPatient } = completeConsultationWithOrders(activePatient, updatedSummary);
    if (onUpdatePatient) {
      onUpdatePatient(updatedPatient);
    }
    updatePatientStatus(updatedPatient.id, updatedPatient.status);

    onNavigateToRoute();
  };

  const handleCompleteReportReview = () => {
    if (!activePatient || !clinicalSummary) return;
    const updatedSummary: ClinicalSummary = {
      ...clinicalSummary,
      doctorConsultationNotes: consultNotes,
      doctorVerifiedItems: verifiedItems
    };
    onUpdateSummary(updatedSummary);

    const updatedPatient = completeDoctorReview(activePatient, clinicalSummary.medications);
    if (onUpdatePatient) {
      onUpdatePatient(updatedPatient);
    }
    updatePatientStatus(updatedPatient.id, updatedPatient.status);

    onNavigateToRoute();
  };

  const handleCallPatient = () => {
    if (!activePatient) return;
    const updatedPatient = callPatientToCabin(activePatient);
    if (onUpdatePatient) onUpdatePatient(updatedPatient);
    updatePatientStatus(updatedPatient.id, updatedPatient.status);
  };

  const handleStartConsultation = () => {
    if (!activePatient) return;
    const updatedPatient = startDoctorConsultation(activePatient);
    if (onUpdatePatient) onUpdatePatient(updatedPatient);
    updatePatientStatus(updatedPatient.id, updatedPatient.status);
  };

  const handleStartReview = () => {
    if (!activePatient) return;
    const updatedPatient = startDoctorReview(activePatient);
    if (onUpdatePatient) onUpdatePatient(updatedPatient);
    updatePatientStatus(updatedPatient.id, updatedPatient.status);
  };

  // ── Empty state ───────────────────────────────────────────────────────────────

  if (!activePatient) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Queue */}
        <div className="lg:col-span-3">
          <PatientQueuePanel patients={patients} activePatient={null} onSelectPatient={onSelectPatient} />
        </div>
        <div className="lg:col-span-9 bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <Stethoscope className="w-14 h-14 text-slate-200 mx-auto mb-4" />
          <h3 className="font-bold text-slate-600 text-lg">Select a Patient</h3>
          <p className="text-slate-400 text-sm mt-1">Choose a patient from the OPD queue to open their clinical cockpit.</p>
        </div>
      </div>
    );
  }

  const interview = activePatient.clinicalInterview;
  const ayush = activePatient.ayushAssessment;
  const vitals = activePatient.vitals;
  const orderedTests = clinicalSummary?.doctorOrderedTests || [];
  const redFlags = interview?.redFlags?.filter(f => f.trim()) || [];
  const isUrgent = clinicalSummary?.urgencyScore === 'URGENT' || clinicalSummary?.urgencyScore === 'EMERGENCY';
  const docs = activePatient.documents || [];
  const prevDocs = docs.filter(d => d.documentTimelineStage !== 'Current encounter');

  // Verification counters
  const totalVerifiableItems = clinicalSummary
    ? 1 + 1 + clinicalSummary.differentialDiagnosis.length // CC + HPI + Differentials
    : 0;
  const verifiedCount = Object.keys(verifiedItems).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

      {/* ── LEFT: Patient Queue ──────────────────────────────────────────────── */}
      <div className="lg:col-span-3">
        <PatientQueuePanel
          patients={patients}
          activePatient={activePatient}
          onSelectPatient={onSelectPatient}
        />
      </div>

      {/* ── CENTER: Clinical Cockpit ─────────────────────────────────────────── */}
      <div className="lg:col-span-6 space-y-3">

        {/* ══ 1. URGENT RED FLAG ALERT (shown FIRST when urgent) ══ */}
        {(isUrgent || redFlags.length > 0) && (
          <div className={`rounded-2xl border-2 p-4 shadow-sm ${
            clinicalSummary?.urgencyScore === 'EMERGENCY'
              ? 'bg-rose-950 border-rose-600 text-white'
              : 'bg-rose-50 border-rose-400 text-rose-950'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${
                clinicalSummary?.urgencyScore === 'EMERGENCY' ? 'bg-rose-600' : 'bg-rose-500'
              }`}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-sm font-extrabold tracking-wide uppercase ${
                    clinicalSummary?.urgencyScore === 'EMERGENCY' ? 'text-rose-200' : 'text-rose-900'
                  }`}>
                    {clinicalSummary?.urgencyScore === 'EMERGENCY'
                      ? '🚨 EMERGENCY — IMMEDIATE CLINICAL ATTENTION'
                      : '⚠ URGENT CLINICAL ATTENTION REQUIRED'}
                  </span>
                </div>
                {redFlags.length > 0 && (
                  <div className="space-y-1">
                    <p className={`text-xs font-semibold ${
                      clinicalSummary?.urgencyScore === 'EMERGENCY' ? 'text-rose-300' : 'text-rose-700'
                    }`}>
                      Red Flags Detected:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {redFlags.map((flag, i) => (
                        <span
                          key={i}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            clinicalSummary?.urgencyScore === 'EMERGENCY'
                              ? 'bg-rose-800/80 text-rose-100'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <p className={`text-[11px] mt-2 font-semibold ${
                  clinicalSummary?.urgencyScore === 'EMERGENCY' ? 'text-rose-300' : 'text-rose-600'
                }`}>
                  System recommends urgent clinical review. This is NOT a diagnosis — physician assessment required.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ══ 2. PATIENT HEADER ══ */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Name row */}
          <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Token */}
              <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-extrabold shadow-sm shrink-0 ${
                isUrgent
                  ? 'bg-gradient-to-br from-rose-500 to-rose-700 text-white'
                  : 'bg-gradient-to-br from-cyan-600 to-teal-700 text-white'
              }`}>
                <span className="text-[9px] uppercase font-semibold opacity-80">TOKEN</span>
                <span className="text-xl leading-none">{activePatient.tokenNumber}</span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900">{activePatient.name}</h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {activePatient.age}y / {activePatient.gender}
                  </span>
                  {isUrgent && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                      clinicalSummary?.urgencyScore === 'EMERGENCY'
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      <AlertTriangle className="w-3 h-3" />
                      {clinicalSummary?.urgencyScore}
                    </span>
                  )}
                  {clinicalSummary?.isDoctorConsultationDone && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Consultation Done
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold flex items-center gap-1 border ${
                    activePatient.status === 'Called' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                    activePatient.status === 'With Doctor' ? 'bg-cyan-50 text-cyan-800 border-cyan-300' :
                    activePatient.status === 'Investigations' ? 'bg-indigo-50 text-indigo-800 border-indigo-300' :
                    activePatient.status === 'Report Ready' ? 'bg-purple-50 text-purple-800 border-purple-300 animate-pulse' :
                    activePatient.status === 'Doctor Review' ? 'bg-teal-50 text-teal-800 border-teal-300' :
                    activePatient.status === 'Pharmacy' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                    activePatient.status === 'Completed' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                    'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    STATUS: {activePatient.status.toUpperCase()}
                  </span>

                  {/* Contextual Action Button */}
                  {activePatient.status === 'Waiting' && (
                    <button
                      type="button"
                      onClick={handleCallPatient}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <span>🔔 Call Patient (बुलावा)</span>
                    </button>
                  )}
                  {activePatient.status === 'Called' && (
                    <button
                      type="button"
                      onClick={handleStartConsultation}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <span>▶ Enter Cabin & Consult</span>
                    </button>
                  )}
                  {activePatient.status === 'Report Ready' && (
                    <button
                      type="button"
                      onClick={handleStartReview}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <span>📑 Start Report Review</span>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {activePatient.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {LANGUAGE_LABELS[activePatient.language] || activePatient.language}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {activePatient.registeredAt}
                  </span>
                  {activePatient.abhaId && (
                    <span className="font-mono text-[10px] text-cyan-700">ABHA: {activePatient.abhaId}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Verification progress */}
            {clinicalSummary && totalVerifiableItems > 0 && (
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-slate-700">{verifiedCount}/{totalVerifiableItems} items verified</div>
                <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${totalVerifiableItems ? (verifiedCount / totalVerifiableItems) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Vitals strip */}
          {vitals && (
            <div className="px-5 pb-4 flex flex-wrap gap-2">
              {[
                { label: 'BP', value: vitals.bloodPressure || '—', unit: 'mmHg', alert: false },
                { label: 'Pulse', value: vitals.pulse ? `${vitals.pulse}` : '—', unit: 'bpm', alert: vitals.pulse && (vitals.pulse > 100 || vitals.pulse < 50) },
                { label: 'SpO₂', value: vitals.spo2 ? `${vitals.spo2}%` : '—', unit: '', alert: vitals.spo2 && vitals.spo2 < 94 },
                { label: 'Temp', value: vitals.temperature ? `${vitals.temperature}°F` : '—', unit: '', alert: vitals.temperature && vitals.temperature > 100.4 },
                { label: 'Wt', value: vitals.weight ? `${vitals.weight} kg` : '—', unit: '', alert: false },
              ].map(v => (
                <div key={v.label} className={`px-3 py-1.5 rounded-xl border text-xs ${
                  v.alert ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={`block text-[10px] font-semibold ${v.alert ? 'text-rose-500' : 'text-slate-400'}`}>{v.label}</span>
                  <span className={`font-extrabold ${v.alert ? 'text-rose-700' : 'text-slate-900'}`}>{v.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ══ 3. AI CLINICAL BRIEF ══ */}
        {clinicalSummary && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Section header */}
            <div className="px-5 py-3 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">Clinical Brief</h3>
              </div>
              <div className="flex items-center gap-2">
                <AILabel />
                <span className="text-[10px] text-slate-400 font-mono">{clinicalSummary.generatedAt}</span>
              </div>
            </div>

            <div className="p-5 space-y-5">

              {/* Chief Complaint */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" /> Chief Complaint
                  </span>
                  <AILabel slim />
                </div>
                <p className={`text-sm font-semibold text-slate-900 leading-relaxed p-3 rounded-xl border ${
                  verifiedItems['chiefComplaint'] === 'rejected'
                    ? 'line-through text-slate-400 bg-slate-50 border-slate-200'
                    : verifiedItems['chiefComplaint']
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  {editedValues['chiefComplaint'] || clinicalSummary.chiefComplaint}
                </p>
                <ItemActions
                  itemKey="chiefComplaint"
                  current={verifiedItems['chiefComplaint']}
                  onAction={handleVerifyItem}
                  editNode={
                    <EditField
                      initial={clinicalSummary.chiefComplaint}
                      onSave={(v) => handleEditSave('chiefComplaint', v)}
                    />
                  }
                />
              </div>

              {/* HPI */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    History of Present Illness
                  </span>
                  <AILabel slim />
                </div>
                <p className={`text-xs text-slate-700 leading-relaxed p-3 rounded-xl border ${
                  verifiedItems['hpi'] === 'rejected'
                    ? 'line-through text-slate-400 bg-slate-50 border-slate-200'
                    : verifiedItems['hpi']
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  {editedValues['hpi'] || clinicalSummary.historyOfPresentIllness}
                </p>
                <ItemActions
                  itemKey="hpi"
                  current={verifiedItems['hpi']}
                  onAction={handleVerifyItem}
                  editNode={
                    <EditField
                      initial={clinicalSummary.historyOfPresentIllness}
                      onSave={(v) => handleEditSave('hpi', v)}
                    />
                  }
                />
              </div>

              {/* History grid: meds, allergies, family, personal */}
              {interview && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Medications */}
                  {interview.medications?.length > 0 && (
                    <HistoryCard
                      icon={<Pill className="w-3 h-3 text-indigo-500" />}
                      label="Current Medications"
                      items={interview.medications}
                      itemKey="meds"
                      verified={verifiedItems['meds']}
                      onAction={handleVerifyItem}
                    />
                  )}
                  {/* Allergies */}
                  {interview.allergies?.length > 0 && (
                    <HistoryCard
                      icon={<AlertTriangle className="w-3 h-3 text-amber-500" />}
                      label="Allergies"
                      items={interview.allergies}
                      itemKey="allergies"
                      verified={verifiedItems['allergies']}
                      onAction={handleVerifyItem}
                      alertStyle
                    />
                  )}
                  {/* Family History */}
                  {interview.familyHistory && (
                    <HistoryCard
                      icon={<User className="w-3 h-3 text-teal-500" />}
                      label="Family History"
                      text={interview.familyHistory}
                      itemKey="familyHistory"
                      verified={verifiedItems['familyHistory']}
                      onAction={handleVerifyItem}
                    />
                  )}
                  {/* Personal History */}
                  {interview.personalHistory && (
                    <HistoryCard
                      icon={<Activity className="w-3 h-3 text-slate-500" />}
                      label="Personal History"
                      text={[
                        interview.personalHistory.diet && `Diet: ${interview.personalHistory.diet}`,
                        interview.personalHistory.tobacco && `Tobacco: ${interview.personalHistory.tobacco}`,
                        interview.personalHistory.alcohol && `Alcohol: ${interview.personalHistory.alcohol}`,
                        interview.personalHistory.sleep && `Sleep: ${interview.personalHistory.sleep}`,
                      ].filter(Boolean).join(' · ')}
                      itemKey="personalHistory"
                      verified={verifiedItems['personalHistory']}
                      onAction={handleVerifyItem}
                    />
                  )}
                  {/* Relevant History */}
                  {interview.relevantHistory && (
                    <HistoryCard
                      icon={<FileText className="w-3 h-3 text-slate-400" />}
                      label="Relevant History"
                      text={interview.relevantHistory}
                      itemKey="relevantHistory"
                      verified={verifiedItems['relevantHistory']}
                      onAction={handleVerifyItem}
                    />
                  )}
                  {/* Past Medical History */}
                  {interview.pastMedicalHistory?.length > 0 && (
                    <HistoryCard
                      icon={<ClipboardList className="w-3 h-3 text-slate-400" />}
                      label="Past Medical History"
                      items={interview.pastMedicalHistory}
                      itemKey="pastMedical"
                      verified={verifiedItems['pastMedical']}
                      onAction={handleVerifyItem}
                    />
                  )}
                </div>
              )}

              {/* SOCRATES compact */}
              {clinicalSummary.socrates && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SOCRATES Summary</span>
                    <AILabel slim />
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                    {[
                      ['Site', clinicalSummary.socrates.site],
                      ['Onset', clinicalSummary.socrates.onset],
                      ['Character', clinicalSummary.socrates.character],
                      ['Radiation', clinicalSummary.socrates.radiation],
                      ['Associations', clinicalSummary.socrates.associations],
                      ['Severity', clinicalSummary.socrates.severity],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k as string}>
                        <span className="text-slate-400 font-semibold">{k}: </span>
                        <span className="text-slate-800">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AYUSH (collapsible) */}
              {ayush && (
                <div className="border border-teal-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowAyush(!showAyush)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-teal-50 hover:bg-teal-100 transition-colors text-xs font-bold text-teal-800"
                  >
                    <span className="flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5 text-teal-600" />
                      AYUSH Assessment (Dosha / Prakriti / Vikriti)
                    </span>
                    {showAyush ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {showAyush && (
                    <div className="p-3.5 space-y-2 text-xs text-slate-700 bg-white">
                      {ayush.prakriti?.summary && (
                        <div>
                          <span className="font-bold text-teal-700 block">Prakriti:</span>
                          <span>{ayush.prakriti.summary}</span>
                        </div>
                      )}
                      {ayush.prakriti?.dominantDoshaTendency && (
                        <div>
                          <span className="font-bold text-teal-700">Dominant Dosha: </span>
                          <span>{ayush.prakriti.dominantDoshaTendency}</span>
                        </div>
                      )}
                      {(ayush.vikriti?.imbalanceSuspected ?? []).length > 0 && (
                        <div>
                          <span className="font-bold text-teal-700">Vikriti (Imbalance): </span>
                          <span>{(ayush.vikriti?.imbalanceSuspected ?? []).join(', ')}</span>
                        </div>
                      )}
                      {ayush.agni?.agniType && (
                        <div>
                          <span className="font-bold text-teal-700">Agni: </span>
                          <span>{ayush.agni.agniType}</span>
                        </div>
                      )}
                      {ayush.provenance && (
                        <p className="text-[10px] text-teal-600 italic pt-1 border-t border-teal-100">
                          Verification status: {ayush.provenance.doctorVerificationStatus}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ 4. AI DIFFERENTIALS ══ */}
        {clinicalSummary && clinicalSummary.differentialDiagnosis.length > 0 && (
          <div className="bg-white rounded-2xl border border-amber-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-amber-900">AI Suggested Differentials</h3>
              </div>
              <div className="flex items-center gap-2">
                <AILabel slim />
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                  FOR CLINICAL CONSIDERATION ONLY — NOT A DIAGNOSIS
                </span>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {clinicalSummary.differentialDiagnosis.map((d, i) => {
                const key = `diff_${i}`;
                const current = verifiedItems[key];
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      current === 'rejected'
                        ? 'bg-slate-50 border-slate-200 opacity-50'
                        : current === 'accepted'
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : current === 'edited'
                        ? 'bg-indigo-50/60 border-indigo-200'
                        : d.probability === 'High'
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-extrabold text-slate-900 ${current === 'rejected' ? 'line-through' : ''}`}>
                            {editedValues[key] || d.condition}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            d.probability === 'High'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : d.probability === 'Medium'
                              ? 'bg-sky-100 text-sky-800 border border-sky-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {d.probability}
                          </span>
                          {current && <VerifiedBadge action={current} />}
                        </div>
                        {d.reasoning && (
                          <p className="text-slate-500 mt-0.5 text-[11px]">{d.reasoning}</p>
                        )}
                      </div>
                    </div>
                    <ItemActions
                      itemKey={key}
                      current={current}
                      onAction={handleVerifyItem}
                      editNode={
                        <EditField
                          initial={d.condition}
                          onSave={(v) => handleEditSave(key, v)}
                          placeholder="Corrected condition name..."
                        />
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ 5. DOCUMENTS (compact) ══ */}
        {docs.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                Medical Documents ({docs.length})
              </h3>
              <span className="text-[10px] text-slate-400">Click to open original & verify</span>
            </div>
            <div className="space-y-2">
              {docs.map((doc) => {
                const extraction = doc.structuredExtraction;
                const isVerified = doc.doctorVerification?.status === 'VERIFIED';
                const hasUnreadable = extraction?.unreadableFieldsDetected;
                const allItems = extraction
                  ? [...extraction.prescriptions, ...extraction.labResults, ...extraction.summaryItems]
                  : [];
                const dVerified = allItems.filter(i => i.status === 'Doctor Verified').length;
                const abnormalLabs = extraction?.labResults.filter(l => l.isAbnormal) || [];

                return (
                  <div
                    key={doc.id}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-xs ${
                      isVerified
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : hasUnreadable
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        isVerified ? 'bg-emerald-100 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200 text-teal-700'
                      }`}>
                        {extraction?.documentType === 'prescription' ? 'Rx'
                          : extraction?.documentType === 'laboratory_report' ? 'Lab'
                          : extraction?.documentType === 'consultation_summary' ? 'OPD'
                          : 'Doc'}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">
                          {extraction?.documentTypeLabel || doc.extractedData?.documentType || doc.fileName}
                        </div>
                        <div className="text-slate-400 flex items-center gap-2 flex-wrap">
                          <span className="font-mono">{doc.documentTimelineStage}</span>
                          {allItems.length > 0 && (
                            <span>{dVerified}/{allItems.length} verified</span>
                          )}
                          {abnormalLabs.length > 0 && (
                            <span className="text-rose-600 font-bold">⚠ {abnormalLabs.length} abnormal</span>
                          )}
                          {hasUnreadable && (
                            <span className="text-amber-700 font-bold">Unreadable fields</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isVerified && abnormalLabs.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleReorderTest(abnormalLabs[0].testName)}
                          className="px-2 py-1 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-lg text-[10px] font-bold flex items-center gap-1"
                        >
                          <RefreshCw className="w-2.5 h-2.5" /> Re-order
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setInspectingDoc(doc)}
                        className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                          isVerified
                            ? 'bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        {isVerified ? 'Review' : 'Open & Verify'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ 6. DOCTOR NOTES ══ */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-2">
          <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            Doctor Notes & Clinical Observations
          </label>
          <textarea
            value={consultNotes}
            onChange={(e) => setConsultNotes(e.target.value)}
            rows={3}
            placeholder="Add clinical observations, examination findings, management plan notes, patient instructions…"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none leading-relaxed"
          />
        </div>

        {/* ══ COMPLETE CONSULTATION ══ */}
        <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
          <div className="text-xs text-slate-500">
            {activePatient.status === 'Report Ready' || activePatient.status === 'Doctor Review' ? (
              <span className="text-purple-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                Reports Ready — review findings & finalize Rx prescription.
              </span>
            ) : clinicalSummary?.isDoctorConsultationDone ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Consultation completed — patient dispatched to navigator
              </span>
            ) : (
              <span>Completing will dispatch patient to the Hospital Navigator route.</span>
            )}
          </div>
          {activePatient.status === 'Report Ready' || activePatient.status === 'Doctor Review' ? (
            <button
              id="btn-complete-report-review"
              type="button"
              onClick={handleCompleteReportReview}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-extrabold text-sm rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <span>Complete Review & Send to Pharmacy</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-complete-consultation"
              type="button"
              onClick={handleCompleteConsultation}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white font-extrabold text-sm rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <span>Complete & Dispatch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── RIGHT: Orders Panel ──────────────────────────────────────────────── */}
      <div className="lg:col-span-3 space-y-3">

        {/* Orders tab nav */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex border-b border-slate-200">
            {([
              { key: 'investigations', label: 'Investigations', icon: <FlaskConical className="w-3.5 h-3.5" /> },
              { key: 'prescription', label: 'Prescription', icon: <Pill className="w-3.5 h-3.5" /> },
              { key: 'followup', label: 'Follow-Up', icon: <Calendar className="w-3.5 h-3.5" /> },
            ] as { key: OrderTab; label: string; icon: React.ReactNode }[]).map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveOrderTab(tab.key)}
                className={`flex-1 py-2.5 text-[10px] font-bold flex flex-col items-center gap-0.5 transition-colors ${
                  activeOrderTab === tab.key
                    ? 'bg-teal-50 text-teal-800 border-b-2 border-teal-600'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── Investigations ── */}
          {activeOrderTab === 'investigations' && (
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Order Tests</span>
                <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {orderedTests.length} ordered
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {COMMON_INVESTIGATIONS.map((inv) => {
                  const isSelected = orderedTests.includes(inv.name);
                  return (
                    <button
                      key={inv.name}
                      type="button"
                      onClick={() => toggleInvestigation(inv.name)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg border text-[11px] flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span className="font-semibold">{inv.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] ${isSelected ? 'text-teal-200' : 'text-slate-400'}`}>
                          {inv.room}
                        </span>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-white text-teal-700' : 'border border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <form onSubmit={handleAddCustomTest} className="flex gap-1.5">
                <input
                  type="text"
                  value={customTest}
                  onChange={(e) => setCustomTest(e.target.value)}
                  placeholder="Custom test…"
                  className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!customTest.trim()}
                  className="px-2.5 py-1.5 bg-slate-800 disabled:opacity-40 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </form>
            </div>
          )}

          {/* ── Prescription ── */}
          {activeOrderTab === 'prescription' && (
            <div className="p-3 space-y-3">
              {/* Existing meds */}
              {clinicalSummary?.medications && clinicalSummary.medications.length > 0 ? (
                <div className="space-y-1.5">
                  {clinicalSummary.medications.map((rawM, idx) => {
                    const m: MedicationItem = typeof rawM === 'string' ? { name: rawM, dosage: '1 Tab', frequency: 'OD', duration: '30 Days' } : rawM;
                    return (
                    <div key={idx} className="flex items-start justify-between p-2 bg-indigo-50/60 rounded-lg border border-indigo-100 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{m.name}</span>
                        <span className="text-slate-500 text-[10px]">{m.dosage} · {m.frequency} · {m.duration}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(idx)}
                        className="text-slate-400 hover:text-rose-500 p-0.5 mt-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-2">No medications prescribed yet.</p>
              )}

              {/* Import from documents */}
              {docs.some(d => d.structuredExtraction?.prescriptions?.length) && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Import from Documents:</span>
                  {docs.flatMap(d =>
                    (d.structuredExtraction?.prescriptions || [])
                      .filter(p => p.status !== 'Uncertain / Flagged' && p.strength !== 'Could not confidently read this field.')
                      .map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleImportPrescription(`${p.medicine} ${p.strength}`, p.frequency)}
                          className="w-full text-left px-2 py-1.5 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-[11px] flex items-center justify-between transition-colors"
                        >
                          <span className="font-semibold text-slate-800">{p.medicine} {p.strength}</span>
                          <Plus className="w-3 h-3 text-indigo-600" />
                        </button>
                      ))
                  )}
                </div>
              )}

              {/* Add medication form */}
              <form onSubmit={handleAddMedication} className="space-y-1.5 pt-1 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="Medicine name & strength…"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                />
                <div className="grid grid-cols-3 gap-1">
                  <input
                    type="text"
                    placeholder="Dose"
                    value={medDose}
                    onChange={(e) => setMedDose(e.target.value)}
                    className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[10px] focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Freq"
                    value={medFreq}
                    onChange={(e) => setMedFreq(e.target.value)}
                    className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[10px] focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Days"
                    value={medDuration}
                    onChange={(e) => setMedDuration(e.target.value)}
                    className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[10px] focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!medName.trim()}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Medicine
                </button>
              </form>
            </div>
          )}

          {/* ── Follow-Up ── */}
          {activeOrderTab === 'followup' && (
            <div className="p-3 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Follow-Up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instructions</label>
                <textarea
                  rows={4}
                  value={followUpInstructions}
                  onChange={(e) => setFollowUpInstructions(e.target.value)}
                  placeholder="Return if symptoms worsen. Review with reports. Fasting required for next test."
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:bg-white resize-none leading-relaxed"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Follow-up date and instructions will be visible in the patient navigator route.
              </p>
            </div>
          )}
        </div>

        {/* Summary counters */}
        {clinicalSummary && (
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2 text-[11px]">
            <span className="font-bold text-slate-700 block">Consultation Summary</span>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Tests Ordered</span>
                <span className="font-bold text-teal-700">{orderedTests.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Medications</span>
                <span className="font-bold text-indigo-700">{clinicalSummary.medications?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AI Items Verified</span>
                <span className="font-bold text-emerald-700">
                  {Object.values(verifiedItems).filter(v => v === 'accepted' || v === 'edited').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Docs Verified</span>
                <span className="font-bold text-teal-700">
                  {docs.filter(d => d.doctorVerification?.status === 'VERIFIED').length}/{docs.length}
                </span>
              </div>
              {followUpDate && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Follow-Up</span>
                  <span className="font-bold text-slate-700">{followUpDate}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Document Evidence Modal ──────────────────────────────────────────── */}
      <DocumentEvidenceModal
        isOpen={inspectingDoc !== null}
        onClose={() => setInspectingDoc(null)}
        document={inspectingDoc}
        onUpdateDocument={handleUpdateDocument}
        isDoctorMode={true}
        doctorName="Dr. Alok Verma"
      />
    </div>
  );
};

// ─── Patient Queue Panel ──────────────────────────────────────────────────────

const PatientQueuePanel: React.FC<{
  patients: PatientProfile[];
  activePatient: PatientProfile | null;
  onSelectPatient: (p: PatientProfile) => void;
}> = ({ patients, activePatient, onSelectPatient }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5 text-cyan-600" />
          OPD Queue
        </span>
        <span className="text-[11px] font-bold px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-full border border-cyan-200">
          {patients.filter(p => p.status === 'Waiting' || p.status === 'Called').length} Waiting
        </span>
      </div>
      <div className="divide-y divide-slate-100 max-h-[calc(100vh-180px)] overflow-y-auto">
        {patients.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-400">
            <Stethoscope className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            No patients in queue.
          </div>
        )}
        {patients.map((p) => {
          const isActive = activePatient?.id === p.id;
          const redFlagCount = p.clinicalInterview?.redFlags?.filter(f => f.trim()).length || 0;
          const hasUrgency = p.status === 'Called' || redFlagCount > 0;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPatient(p)}
              className={`w-full text-left px-4 py-3 transition-all ${
                isActive
                  ? 'bg-cyan-50/80 border-l-4 border-l-cyan-500'
                  : 'hover:bg-slate-50 border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${
                    hasUrgency
                      ? 'bg-rose-100 text-rose-800'
                      : isActive
                      ? 'bg-cyan-700 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {p.tokenNumber}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-500">{p.age}y · {p.gender} · {p.department}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                    p.status === 'Called' ? 'bg-amber-100 text-amber-800' :
                    p.status === 'With Doctor' ? 'bg-cyan-100 text-cyan-800' :
                    p.status === 'Investigations' ? 'bg-indigo-100 text-indigo-800' :
                    p.status === 'Report Ready' ? 'bg-purple-100 text-purple-800 font-extrabold animate-pulse' :
                    p.status === 'Doctor Review' ? 'bg-teal-100 text-teal-800' :
                    p.status === 'Pharmacy' ? 'bg-emerald-100 text-emerald-800' :
                    p.status === 'Completed' ? 'bg-slate-100 text-slate-600' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {p.status}
                  </span>
                  {redFlagCount > 0 && (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                </div>
              </div>
              {p.chiefComplaintTranscript && (
                <p className="text-[10px] text-slate-500 truncate mt-1.5 italic pl-10">
                  "{p.chiefComplaintTranscript}"
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── HistoryCard sub-component ────────────────────────────────────────────────

const HistoryCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  items?: string[];
  text?: string;
  itemKey: string;
  verified?: VerifyAction;
  onAction: (key: string, action: VerifyAction) => void;
  alertStyle?: boolean;
}> = ({ icon, label, items, text, itemKey, verified, onAction, alertStyle }) => {
  const content = items ? items.join(', ') : (text || '');
  if (!content) return null;
  return (
    <div className={`p-3 rounded-xl border text-xs space-y-2 ${
      verified === 'rejected' ? 'opacity-50 bg-slate-50 border-slate-200'
        : verified ? 'bg-emerald-50/40 border-emerald-200'
        : alertStyle ? 'bg-amber-50/40 border-amber-200'
        : 'bg-slate-50 border-slate-200'
    }`}>
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-600 flex items-center gap-1">
          {icon} {label}
        </span>
        <AILabel slim />
      </div>
      <p className={`text-slate-800 leading-relaxed ${verified === 'rejected' ? 'line-through' : ''}`}>
        {content}
      </p>
      <div className="flex items-center gap-1.5">
        {verified ? (
          <VerifiedBadge action={verified} />
        ) : (
          <>
            <button
              type="button"
              onClick={() => onAction(itemKey, 'accepted')}
              className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-0.5"
            >
              <Check className="w-2.5 h-2.5" /> Accept
            </button>
            <button
              type="button"
              onClick={() => onAction(itemKey, 'rejected')}
              className="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-[10px] font-bold flex items-center gap-0.5"
            >
              <X className="w-2.5 h-2.5" /> Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── EditField sub-component ──────────────────────────────────────────────────

const EditField: React.FC<{
  initial: string;
  onSave: (value: string) => void;
  placeholder?: string;
}> = ({ initial, onSave, placeholder }) => {
  const [value, setValue] = useState(initial);
  return (
    <div className="flex gap-1.5 mt-1">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={2}
        placeholder={placeholder || 'Edit this field…'}
        className="flex-1 px-2.5 py-1.5 bg-white border border-indigo-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 resize-none"
      />
      <button
        type="button"
        onClick={() => onSave(value)}
        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-0.5 self-start"
      >
        <Check className="w-3 h-3" /> Save
      </button>
    </div>
  );
};
