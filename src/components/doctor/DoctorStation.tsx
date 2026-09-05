import React, { useState } from 'react';
import { 
  Stethoscope, 
  User, 
  Activity, 
  AlertTriangle, 
  Plus, 
  Check, 
  FileText, 
  Pill, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Sparkles,
  Send,
  X,
  Share2,
  Eye,
  ShieldCheck,
  Building2,
  FolderOpen
} from 'lucide-react';
import { PatientProfile, ClinicalSummary, LanguageCode, MedicationItem, PatientDocumentRecord, ExtractionStatus } from '../../types';
import { DocumentEvidenceModal } from '../common/DocumentEvidenceModal';
import { groupDocumentsByTimeline } from '../../services/medicalDocumentService';

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

const COMMON_INVESTIGATIONS = [
  { name: '12-Lead ECG', category: 'Cardiology', room: 'Room 08', floor: 'Ground Floor' },
  { name: 'Blood Test (CBC)', category: 'Pathology', room: 'Room 12', floor: 'Ground Floor' },
  { name: 'Blood Sugar (FBS/PPBS)', category: 'Pathology', room: 'Room 12', floor: 'Ground Floor' },
  { name: 'Digital Chest X-Ray', category: 'Radiology', room: 'Room 104', floor: '1st Floor' },
  { name: 'Ultrasound Abdomen (USG)', category: 'Radiology', room: 'Room 106', floor: '1st Floor' },
  { name: 'Liver Function Test (LFT)', category: 'Pathology', room: 'Room 12', floor: 'Ground Floor' },
  { name: 'Kidney Function Test (KFT)', category: 'Pathology', room: 'Room 12', floor: 'Ground Floor' },
  { name: 'Urine Routine Examination', category: 'Pathology', room: 'Room 12', floor: 'Ground Floor' },
  { name: 'Lipid Profile', category: 'Pathology', room: 'Room 12', floor: 'Ground Floor' },
  { name: 'Troponin I (Cardio Marker)', category: 'Emergency Lab', room: 'Room 08', floor: 'Ground Floor' }
];

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
  const [customTest, setCustomTest] = useState('');
  const [consultNotes, setConsultNotes] = useState(clinicalSummary?.doctorConsultationNotes || '');
  
  // Inspecting Document for Side-by-Side Evidence
  const [inspectingDoc, setInspectingDoc] = useState<PatientDocumentRecord | null>(null);

  // New medication inputs
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('1 Tab');
  const [medFreq, setMedFreq] = useState('BD (सुबह-शाम)');
  const [medDuration, setMedDuration] = useState('5 Days');

  // Handle document updates (verification, edits)
  const handleUpdateDocument = (updatedDoc: PatientDocumentRecord) => {
    if (!activePatient) return;
    const currentDocs = activePatient.documents || [];
    const updatedDocs = currentDocs.map(d => d.id === updatedDoc.id ? updatedDoc : d);
    const updatedPatient: PatientProfile = {
      ...activePatient,
      documents: updatedDocs
    };
    if (onUpdatePatient) {
      onUpdatePatient(updatedPatient);
    }
    setInspectingDoc(updatedDoc);
  };

  // Quick action: Import verified prescription into active consult
  const handleImportPrescription = (medString: string, freq: string) => {
    if (!clinicalSummary) return;
    const newMed: MedicationItem = {
      name: medString,
      dosage: '1 Tab',
      frequency: freq || 'BD (सुबह-शाम)',
      duration: '30 Days'
    };
    const currentMeds = clinicalSummary.medications || [];
    onUpdateSummary({
      ...clinicalSummary,
      medications: [...currentMeds, newMed]
    });
  };

  // Quick action: Re-order abnormal lab investigation
  const handleReorderTest = (testName: string) => {
    if (!clinicalSummary) return;
    const currentTests = clinicalSummary.doctorOrderedTests || [];
    if (!currentTests.includes(testName)) {
      onUpdateSummary({
        ...clinicalSummary,
        doctorOrderedTests: [...currentTests, testName]
      });
    }
  };

  if (!activePatient) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-slate-700 text-base">No Patient Selected</h3>
        <p className="text-slate-400 text-xs mt-1">Please select an OPD patient from the queue.</p>
      </div>
    );
  }

  const orderedTests = clinicalSummary?.doctorOrderedTests || [];

  const toggleTest = (testName: string) => {
    if (!clinicalSummary) return;
    const isOrdered = orderedTests.includes(testName);
    const updated = isOrdered 
      ? orderedTests.filter(t => t !== testName)
      : [...orderedTests, testName];

    onUpdateSummary({
      ...clinicalSummary,
      doctorOrderedTests: updated
    });
  };

  const handleAddCustomTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTest.trim() || !clinicalSummary) return;
    if (!orderedTests.includes(customTest.trim())) {
      onUpdateSummary({
        ...clinicalSummary,
        doctorOrderedTests: [...orderedTests, customTest.trim()]
      });
    }
    setCustomTest('');
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim() || !clinicalSummary) return;

    const newMed: MedicationItem = {
      name: medName.trim(),
      dosage: medDose,
      frequency: medFreq,
      duration: medDuration
    };

    const currentMeds = clinicalSummary.medications || [];
    onUpdateSummary({
      ...clinicalSummary,
      medications: [...currentMeds, newMed]
    });

    setMedName('');
  };

  const handleRemoveMedication = (idx: number) => {
    if (!clinicalSummary || !clinicalSummary.medications) return;
    const updated = [...clinicalSummary.medications];
    updated.splice(idx, 1);
    onUpdateSummary({
      ...clinicalSummary,
      medications: updated
    });
  };

  const handleCompleteConsultation = () => {
    if (!clinicalSummary) return;
    onUpdateSummary({
      ...clinicalSummary,
      isDoctorConsultationDone: true,
      doctorConsultationNotes: consultNotes
    });
    onNavigateToRoute();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Waiting Queue list */}
      <div className="lg:col-span-3 space-y-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-cyan-600" />
              Cabin 102 OPD Queue
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-full border border-cyan-200">
              {patients.length} Waiting
            </span>
          </div>

          <div className="space-y-2">
            {patients.map((p) => {
              const isActive = p.id === activePatient.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPatient(p)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    isActive 
                      ? 'bg-cyan-50/80 border-cyan-300 ring-1 ring-cyan-400/20' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {p.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-cyan-700 text-white">
                      {p.tokenNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{p.age}y • {p.gender}</span>
                    <span className="font-mono text-[10px] text-slate-400">{p.registeredAt}</span>
                  </div>
                  {p.chiefComplaintTranscript && (
                    <p className="text-[10px] text-slate-600 truncate mt-1 italic">
                      "{p.chiefComplaintTranscript}"
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Center / Right Column: Active Patient Consultation Workspace */}
      <div className="lg:col-span-9 space-y-5">
        {/* Active Patient Header Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-700 text-white flex flex-col items-center justify-center font-extrabold shadow-sm">
              <span className="text-[9px] uppercase font-semibold">TOKEN</span>
              <span className="text-lg leading-none">{activePatient.tokenNumber}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-heading font-extrabold text-slate-900">
                  {activePatient.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  {activePatient.age}y / {activePatient.gender}
                </span>
                {clinicalSummary?.urgencyScore === 'URGENT' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Urgent Triage
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                <span>📱 {activePatient.phone}</span>
                {activePatient.abhaId && <span>• ABHA: {activePatient.abhaId}</span>}
                <span>• Dept: {activePatient.department}</span>
              </div>
            </div>
          </div>

          {/* Vitals pill badges */}
          {activePatient.vitals && (
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">BP</span>
                <span className="font-bold text-slate-800">{activePatient.vitals.bloodPressure || '120/80'}</span>
              </div>
              <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">PULSE</span>
                <span className="font-bold text-slate-800">{activePatient.vitals.pulse || 72} bpm</span>
              </div>
              <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">SPO2</span>
                <span className="font-bold text-slate-800">{activePatient.vitals.spo2 || 98}%</span>
              </div>
              <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">TEMP</span>
                <span className="font-bold text-slate-800">{activePatient.vitals.temperature || 98.4}°F</span>
              </div>
            </div>
          )}
        </div>

        {/* AI Clinical Summary & Socrates Evaluation */}
        {clinicalSummary && (
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm tracking-wide uppercase text-amber-300">
                  AI Clinical Pre-Consultation Summary & Socrates Breakdown
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Generated: {clinicalSummary.generatedAt}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold mb-1">Chief Complaint (मरीज की मुख्य समस्या):</span>
                <p className="text-slate-200 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 leading-relaxed font-hindi">
                  {clinicalSummary.chiefComplaint}
                </p>

                {clinicalSummary.socrates && (
                  <div className="mt-3 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40 space-y-1">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                      SOCRATES Analysis
                    </span>
                    <div className="text-[11px] text-slate-300">
                      <strong>Site & Character:</strong> {clinicalSummary.socrates.site} — {clinicalSummary.socrates.character}
                    </div>
                    <div className="text-[11px] text-slate-300">
                      <strong>Onset & Associations:</strong> {clinicalSummary.socrates.onset} ({clinicalSummary.socrates.associations})
                    </div>
                  </div>
                )}
              </div>

              <div>
                <span className="text-slate-400 block font-semibold mb-1">Differential Diagnosis (संभावित निदान):</span>
                <div className="space-y-1.5">
                  {clinicalSummary.differentialDiagnosis.map((d, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-200">{d.condition}</span>
                        {d.reasoning && <p className="text-[10px] text-slate-400 mt-0.5">{d.reasoning}</p>}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.probability === 'High' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {d.probability}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section: Medical Document Evidence & Timeline (पुराने दस्तावेज़, पर्चे व जांच साक्ष्य) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Medical Document Evidence &amp; Timeline (चिकित्सीय दस्तावेज़ साक्ष्य)
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {activePatient.documents?.length || 0} Documents
                </span>
              </div>
              <p className="text-xs text-slate-500 font-hindi mt-0.5">
                एआई निष्कर्षण को कभी बिना सत्यापन सच न मानें। मूल पर्चा खोलें व तुलना करें।
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold">Evidence Chain:</span>
              <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold text-[10px]">AI Extracted</span>
              <span className="text-slate-300">→</span>
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-bold text-[10px]">Original Scan</span>
              <span className="text-slate-300">→</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px]">Doctor Verified</span>
            </div>
          </div>

          {/* Documents List & Timeline */}
          {activePatient.documents && activePatient.documents.length > 0 ? (
            <div className="space-y-3">
              {activePatient.documents.map((doc) => {
                const extraction = doc.structuredExtraction;
                const isVerified = doc.doctorVerification?.status === 'VERIFIED';
                const hasUnreadable = extraction?.unreadableFieldsDetected;

                return (
                  <div
                    key={doc.id}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      isVerified
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : hasUnreadable
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {/* Document Header Line */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-teal-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                          {doc.structuredExtraction?.documentType === 'prescription' ? 'Rx' : 'Lab'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">
                              {extraction?.documentTypeLabel || doc.extractedData?.documentType || doc.fileName}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                              {doc.documentTimelineStage}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {doc.fileName} • Date: {extraction?.date || doc.uploadedAt}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isVerified ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Doctor Verified
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                            AI Extracted — Needs Verification
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setInspectingDoc(doc)}
                          className="px-3 py-1.5 bg-white hover:bg-teal-50 text-teal-700 font-bold text-xs rounded-lg border border-teal-200 shadow-2xs flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Original &amp; Compare</span>
                        </button>
                      </div>
                    </div>

                    {/* Unreadable Field Alert */}
                    {hasUnreadable && (
                      <div className="p-2.5 bg-amber-100/70 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>
                          <strong>OCR Safety Alert:</strong> One or more blurry fields detected ("Could not confidently read this field.").
                        </span>
                      </div>
                    )}

                    {/* Extracted Prescriptions (with 1-click import) */}
                    {extraction && extraction.prescriptions && extraction.prescriptions.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Extracted Prescriptions:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {extraction.prescriptions.map((p) => {
                            const isBlur = p.strength === 'Could not confidently read this field.';
                            return (
                              <div
                                key={p.id}
                                className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-2 ${
                                  isBlur ? 'bg-amber-100/80 border-amber-300 text-amber-900' : 'bg-white border-slate-200 text-slate-800'
                                }`}
                              >
                                <div>
                                  <strong>{p.medicine}</strong> {p.strength !== 'Could not confidently read this field.' && p.strength} ({p.frequency})
                                </div>
                                {!isBlur && (
                                  <button
                                    type="button"
                                    onClick={() => handleImportPrescription(`${p.medicine} ${p.strength}`, p.frequency)}
                                    className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200"
                                    title="Import into Current Consultation Prescription"
                                  >
                                    + Add to Rx
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Extracted Lab Tests (with 1-click reorder) */}
                    {extraction && extraction.labResults && extraction.labResults.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Extracted Laboratory Parameters:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {extraction.labResults.map((l) => (
                            <div
                              key={l.id}
                              className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-2 ${
                                l.isAbnormal
                                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                                  : 'bg-white border-slate-200 text-slate-800'
                              }`}
                            >
                              <div>
                                <span>{l.testName}: </span>
                                <strong>{l.value} {l.unit}</strong>
                                {l.isAbnormal && <span className="text-[10px] font-extrabold text-rose-600 ml-1">[ELEVATED]</span>}
                              </div>
                              {l.isAbnormal && (
                                <button
                                  type="button"
                                  onClick={() => handleReorderTest(l.testName)}
                                  className="text-[10px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200"
                                  title="Re-order this test for current visit"
                                >
                                  + Re-order
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-xl text-center border border-dashed border-slate-300 text-xs text-slate-500">
              <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
              <span>No past medical documents attached for this patient yet.</span>
            </div>
          )}
        </div>

        {/* Section: Prescribe Investigations (आवश्यक जांच आदेश) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                <span>Prescribe Investigations (आवश्यक जांच आदेश)</span>
              </h3>
              <p className="text-xs text-slate-500 font-hindi">
                जांच का चयन करें — यह मरीज के स्मार्ट नेविगेशन मैप व कतार पर्ची को तुरंत अपडेट कर देगा।
              </p>
            </div>
            <div className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
              {orderedTests.length} Tests Ordered (जांच चयनित)
            </div>
          </div>

          {/* Test Presets Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {COMMON_INVESTIGATIONS.map((inv) => {
              const isSelected = orderedTests.includes(inv.name);
              return (
                <button
                  key={inv.name}
                  type="button"
                  onClick={() => toggleTest(inv.name)}
                  className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-xs leading-snug">{inv.name}</span>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-white text-teal-700' : 'border border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <div className={`text-[10px] mt-2 ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                    {inv.room} • {inv.floor}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Test Adder */}
          <form onSubmit={handleAddCustomTest} className="flex gap-2 pt-2">
            <input
              type="text"
              value={customTest}
              onChange={(e) => setCustomTest(e.target.value)}
              placeholder="Add other custom test (e.g. Serum Electrolytes, Thyroid TSH)..."
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!customTest.trim()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Test
            </button>
          </form>
        </div>

        {/* Section: Prescription & Medications */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-indigo-600" />
            <span>Prescription & Medicines (दवा परामर्श)</span>
          </h3>

          {/* Existing prescribed meds list */}
          {clinicalSummary?.medications && clinicalSummary.medications.length > 0 && (
            <div className="space-y-1.5">
              {clinicalSummary.medications.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900">{m.name}</span>
                      <span className="text-slate-500 ml-2 font-mono">({m.dosage})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-800 font-medium">{m.frequency}</span>
                    <span className="text-slate-500">{m.duration}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Medication Row */}
          <form onSubmit={handleAddMedication} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
            <input
              type="text"
              placeholder="Medicine Name (e.g. Paracetamol 650mg)"
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              className="sm:col-span-2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            <input
              type="text"
              placeholder="Frequency (e.g. TDS / सुबह दोपहर शाम)"
              value={medFreq}
              onChange={(e) => setMedFreq(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!medName.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Medicine
            </button>
          </form>

          {/* Clinical Advice Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Doctor Clinical Advice & Instructions (डॉक्टर की सलाह):
            </label>
            <textarea
              rows={2}
              value={consultNotes}
              onChange={(e) => setConsultNotes(e.target.value)}
              placeholder="Advise plenty of fluids, review with ECG & CBC reports in 2 hours..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Action Buttons: Finalize & Dispatch */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500">
            {clinicalSummary?.isDoctorConsultationDone ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Consultation Completed & Route Generated
              </span>
            ) : (
              <span>Clicking complete will dispatch patient to Diagnostic Wing and Jan Aushadhi Pharmacy.</span>
            )}
          </div>

          <button
            id="btn-complete-consultation"
            type="button"
            onClick={handleCompleteConsultation}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Complete & Open Patient Navigator (मार्गदर्शक देखें)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Side-by-Side Original Document Evidence Modal (Doctor Mode) */}
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
