import React, { useState } from 'react';
import { 
  X, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Building2,
  HelpCircle,
  Check,
  RotateCcw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Pill,
  FlaskConical,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { 
  PatientDocumentRecord, 
  ExtractedPrescriptionItem, 
  ExtractedLabItem, 
  ExtractedSummaryItem,
  ExtractionStatus
} from '../../types';

interface DocumentEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: PatientDocumentRecord | null;
  onUpdateDocument?: (updatedDoc: PatientDocumentRecord) => void;
  isDoctorMode?: boolean;
  doctorName?: string;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ConfidenceBadge({ confidence }: { confidence: 'High' | 'Medium' | 'Low' | 'Uncertain' }) {
  const styles: Record<string, string> = {
    High: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Medium: 'bg-amber-100 text-amber-800 border-amber-200',
    Low: 'bg-orange-100 text-orange-800 border-orange-200',
    Uncertain: 'bg-rose-100 text-rose-800 border-rose-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold ${styles[confidence] || styles.Uncertain}`}>
      {confidence === 'Uncertain' && <AlertCircle className="w-2.5 h-2.5" />}
      {confidence}
    </span>
  );
}

function StatusBadge({ status }: { status: ExtractionStatus }) {
  if (status === 'Doctor Verified') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Doctor Verified
    </span>
  );
  if (status === 'Verified by Patient') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
      <Check className="w-3 h-3" /> Patient Confirmed
    </span>
  );
  if (status === 'Edited by User') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
      <Edit3 className="w-3 h-3" /> Edited
    </span>
  );
  if (status === 'Uncertain / Flagged') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
      <AlertTriangle className="w-3 h-3 text-amber-600" /> Uncertain
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
      <Sparkles className="w-3 h-3" /> AI Extracted — Verify
    </span>
  );
}

function UnreadableFieldDisplay() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold">
      <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
      Could not confidently read this field.
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const DocumentEvidenceModal: React.FC<DocumentEvidenceModalProps> = ({
  isOpen,
  onClose,
  document,
  onUpdateDocument,
  isDoctorMode = false,
  doctorName = 'Dr. Alok Verma'
}) => {
  if (!isOpen || !document) return null;

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState<string>('');
  const [editedFrequency, setEditedFrequency] = useState<string>('');
  const [editedDuration, setEditedDuration] = useState<string>('');
  const [editedDosage, setEditedDosage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'split' | 'original' | 'extracted'>('split');
  const [showOcrRaw, setShowOcrRaw] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState(document.doctorVerification?.notes || '');
  const [verifySuccessId, setVerifySuccessId] = useState<string | null>(null);

  const extraction = document.structuredExtraction;

  // ── Prescription edit ──
  const startEditPrescription = (item: ExtractedPrescriptionItem) => {
    setEditingItemId(item.id);
    setEditedValue(`${item.medicine} ${item.strength === 'Could not confidently read this field.' ? '' : item.strength}`.trim());
    setEditedFrequency(item.frequency);
    setEditedDuration(item.duration || '');
    setEditedDosage(item.dosage === 'Could not confidently read this field.' ? '' : item.dosage);
  };

  const saveEditPrescription = (itemId: string) => {
    if (!extraction || !onUpdateDocument) return;
    const updatedPrescriptions = extraction.prescriptions.map(p => {
      if (p.id === itemId) {
        return {
          ...p,
          medicine: editedValue.split(' ')[0] || p.medicine,
          strength: editedValue.split(' ').slice(1).join(' ') || p.strength,
          dosage: editedDosage || p.dosage,
          frequency: editedFrequency || p.frequency,
          duration: editedDuration || p.duration,
          status: (isDoctorMode ? 'Doctor Verified' : 'Edited by User') as ExtractionStatus,
          confidence: 'High' as const,
          confidenceNote: isDoctorMode ? `Verified & corrected by ${doctorName}` : 'Manually edited by patient',
          isEdited: true
        };
      }
      return p;
    });
    onUpdateDocument({
      ...document,
      structuredExtraction: { ...extraction, prescriptions: updatedPrescriptions },
      verifiedByPatient: true
    });
    setEditingItemId(null);
  };

  // ── Per-item doctor verify (prescription) ──
  const verifyPrescriptionItem = (itemId: string) => {
    if (!extraction || !onUpdateDocument) return;
    const updatedPrescriptions = extraction.prescriptions.map(p =>
      p.id === itemId
        ? { ...p, status: 'Doctor Verified' as ExtractionStatus, confidence: 'High' as const, confidenceNote: `Individually verified by ${doctorName}` }
        : p
    );
    onUpdateDocument({
      ...document,
      structuredExtraction: { ...extraction, prescriptions: updatedPrescriptions }
    });
    setVerifySuccessId(itemId);
    setTimeout(() => setVerifySuccessId(null), 1800);
  };

  // ── Lab item edit ──
  const startEditLab = (item: ExtractedLabItem) => {
    setEditingItemId(item.id);
    setEditedValue(item.value === 'Could not confidently read this field.' ? '' : item.value);
  };

  const saveEditLab = (itemId: string) => {
    if (!extraction || !onUpdateDocument) return;
    const updatedLabs = extraction.labResults.map(l => {
      if (l.id === itemId) {
        return {
          ...l,
          value: editedValue || l.value,
          status: (isDoctorMode ? 'Doctor Verified' : 'Edited by User') as ExtractionStatus,
          confidence: 'High' as const,
          confidenceNote: isDoctorMode ? `Value validated by ${doctorName}` : 'Manually corrected by patient',
          isEdited: true
        };
      }
      return l;
    });
    onUpdateDocument({
      ...document,
      structuredExtraction: { ...extraction, labResults: updatedLabs },
      verifiedByPatient: true
    });
    setEditingItemId(null);
  };

  // ── Per-item doctor verify (lab) ──
  const verifyLabItem = (itemId: string) => {
    if (!extraction || !onUpdateDocument) return;
    const updatedLabs = extraction.labResults.map(l =>
      l.id === itemId
        ? { ...l, status: 'Doctor Verified' as ExtractionStatus, confidence: 'High' as const, confidenceNote: `Value verified by ${doctorName}` }
        : l
    );
    onUpdateDocument({
      ...document,
      structuredExtraction: { ...extraction, labResults: updatedLabs }
    });
    setVerifySuccessId(itemId);
    setTimeout(() => setVerifySuccessId(null), 1800);
  };

  // ── Doctor bulk verify ──
  const handleDoctorBulkVerify = () => {
    if (!extraction || !onUpdateDocument) return;
    const verifiedPrescriptions = extraction.prescriptions.map(p => ({
      ...p,
      status: 'Doctor Verified' as ExtractionStatus,
      confidence: 'High' as const
    }));
    const verifiedLabs = extraction.labResults.map(l => ({
      ...l,
      status: 'Doctor Verified' as ExtractionStatus,
      confidence: 'High' as const
    }));
    const verifiedSummary = extraction.summaryItems.map(s => ({
      ...s,
      status: 'Doctor Verified' as ExtractionStatus,
    }));
    onUpdateDocument({
      ...document,
      structuredExtraction: {
        ...extraction,
        prescriptions: verifiedPrescriptions,
        labResults: verifiedLabs,
        summaryItems: verifiedSummary
      },
      doctorVerification: {
        status: 'VERIFIED',
        verifiedByDoctorName: doctorName,
        verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: doctorNotes || 'Original document verified against structured clinical summary by attending physician.'
      }
    });
  };

  // ── Count stats ──
  const allItems = extraction
    ? [...extraction.prescriptions, ...extraction.labResults, ...extraction.summaryItems]
    : [];
  const verifiedCount = allItems.filter(i => i.status === 'Doctor Verified').length;
  const uncertainCount = allItems.filter(i => i.status === 'Uncertain / Flagged').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* ── Header Bar ── */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">{document.fileName}</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                  {document.documentTimelineStage}
                </span>
                {document.doctorVerification?.status === 'VERIFIED' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Doctor Verified
                  </span>
                )}
                {isDoctorMode && verifiedCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    {verifiedCount}/{allItems.length} items verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>Uploaded: {document.uploadedAt}</span>
                <span>•</span>
                <span>Type: {extraction?.documentTypeLabel || document.extractedData?.documentType || 'Clinical Document'}</span>
                {extraction?.doctorName && <><span>•</span><span>{extraction.doctorName}</span></>}
              </p>
            </div>
          </div>

          {/* View Switcher & Close */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex bg-slate-200 p-1 rounded-xl text-xs font-semibold text-slate-600">
              {(['split', 'original', 'extracted'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg transition-all capitalize ${activeTab === tab ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'}`}
                >
                  {tab === 'split' ? 'Side-by-Side' : tab === 'original' ? 'Original Doc' : 'Extracted Data'}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Evidence Chain Banner ── */}
        <div className="px-6 py-2.5 bg-gradient-to-r from-teal-50 via-indigo-50 to-amber-50 border-b border-slate-200 text-xs shrink-0">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 font-semibold text-slate-700">
            <span className="flex items-center gap-1.5 text-teal-800">
              <span className="w-5 h-5 rounded-full bg-teal-200 text-teal-900 font-bold flex items-center justify-center text-[10px]">1</span>
              AI EXTRACTED INFORMATION
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="flex items-center gap-1.5 text-indigo-800">
              <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-900 font-bold flex items-center justify-center text-[10px]">2</span>
              SOURCE DOCUMENT
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="flex items-center gap-1.5 text-amber-900">
              <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-[10px]">3</span>
              {isDoctorMode ? 'DOCTOR VERIFICATION' : 'PATIENT REVIEW'}
            </span>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className={`grid gap-6 ${activeTab === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>

            {/* ── Left/Top: Original Document ── */}
            {(activeTab === 'split' || activeTab === 'original') && (
              <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-indigo-600" />
                    Original Scanned Document (मूल दस्तावेज़)
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">High-Resolution OCR Input</span>
                </div>

                <div className="bg-white rounded-xl border border-slate-300 shadow-inner overflow-hidden flex items-center justify-center min-h-[420px] max-h-[560px]">
                  {document.filePreviewUrl ? (
                    <img
                      src={document.filePreviewUrl}
                      alt={document.fileName}
                      className="w-full h-auto max-h-[540px] object-contain select-none"
                    />
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      <span>Original file preview not available for this document.</span>
                    </div>
                  )}
                </div>

                {/* OCR Raw Snippet accordion */}
                {extraction?.ocrRawSnippet && (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowOcrRaw(!showOcrRaw)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        Raw OCR Text Snippet (Compare with Source)
                      </span>
                      {showOcrRaw ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                    {showOcrRaw && (
                      <div className="px-3 pb-3">
                        <pre className="font-mono text-[10px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200 whitespace-pre-wrap break-all">
                          {extraction.ocrRawSnippet}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-[11px] text-slate-500 bg-white/80 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span>Document source chain: Scan → OCR → AI Structuring → Verification</span>
                  <span className="font-mono text-[10px] text-slate-400">Provenance Tracked</span>
                </div>
              </div>
            )}

            {/* ── Right/Bottom: Structured Extracted Data ── */}
            {(activeTab === 'split' || activeTab === 'extracted') && (
              <div className="space-y-4 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-600" />
                    AI Structured Clinical Data — Field Provenance
                  </span>
                  <span className="text-xs text-slate-500 italic">Never silently assumed as truth</span>
                </div>

                {/* Unreadable fields warning */}
                {extraction?.unreadableFieldsDetected && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Uncertain / Blurred Fields Detected</strong>
                      <span>
                        The AI identified low-resolution or smudged handwriting and safely marked those fields as unreadable instead of inventing values. Use edit to enter the correct value after comparing with the original document.
                      </span>
                    </div>
                  </div>
                )}

                {/* ─── Prescriptions ─── */}
                {extraction && extraction.prescriptions.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-teal-600" />
                        Prescriptions & Dosages ({extraction.prescriptions.length})
                      </span>
                      <span className="text-[11px] font-normal text-slate-400">Click edit to correct any field</span>
                    </h4>

                    {extraction.prescriptions.map((rx) => {
                      const isEditing = editingItemId === rx.id;
                      const strengthUnreadable = rx.strength === 'Could not confidently read this field.';
                      const dosageUnreadable = rx.dosage === 'Could not confidently read this field.';
                      const isUncertain = rx.status === 'Uncertain / Flagged';
                      const isDoctorVerifiedItem = rx.status === 'Doctor Verified';
                      const justVerified = verifySuccessId === rx.id;

                      return (
                        <div
                          key={rx.id}
                          className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                            justVerified
                              ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-300/40'
                              : isDoctorVerifiedItem
                              ? 'bg-emerald-50/60 border-emerald-300'
                              : isUncertain
                              ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/20'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-extrabold text-sm text-slate-900">{rx.medicine}</span>
                                {rx.isEdited && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">Edited</span>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                                <div className="flex items-center gap-1 col-span-2">
                                  <span className="text-slate-500 w-16 shrink-0">Strength:</span>
                                  {strengthUnreadable ? <UnreadableFieldDisplay /> : <span className="font-semibold text-slate-800">{rx.strength}</span>}
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-slate-500 w-16 shrink-0">Dosage:</span>
                                  {dosageUnreadable ? <UnreadableFieldDisplay /> : <span className="font-semibold text-slate-800">{rx.dosage}</span>}
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-slate-500 w-16 shrink-0">Frequency:</span>
                                  <span className="font-semibold text-slate-800">{rx.frequency}</span>
                                </div>
                                {rx.duration && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-slate-500 w-16 shrink-0">Duration:</span>
                                    <span className="font-semibold text-slate-800">{rx.duration}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => isEditing ? saveEditPrescription(rx.id) : startEditPrescription(rx)}
                                className="px-2.5 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg flex items-center gap-1 transition-colors border border-teal-200"
                              >
                                {isEditing ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Edit3 className="w-3 h-3" />}
                                <span>{isEditing ? 'Save' : 'Edit'}</span>
                              </button>

                              {isDoctorMode && !isDoctorVerifiedItem && !isEditing && (
                                <button
                                  type="button"
                                  onClick={() => verifyPrescriptionItem(rx.id)}
                                  className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors border border-emerald-200"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Verify</span>
                                </button>
                              )}
                              {justVerified && (
                                <span className="text-[10px] text-emerald-700 font-bold text-center">✓ Verified!</span>
                              )}
                            </div>
                          </div>

                          {/* Inline Edit Form */}
                          {isEditing && (
                            <div className="pt-2 border-t border-slate-200 space-y-2 bg-slate-50 p-2.5 rounded-lg">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Medicine & Strength</label>
                                <input
                                  type="text"
                                  value={editedValue}
                                  onChange={(e) => setEditedValue(e.target.value)}
                                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                                  placeholder="e.g. Metformin 500 mg"
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Dosage</label>
                                  <input
                                    type="text"
                                    value={editedDosage}
                                    onChange={(e) => setEditedDosage(e.target.value)}
                                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                                    placeholder="e.g. 1 tablet"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Frequency</label>
                                  <input
                                    type="text"
                                    value={editedFrequency}
                                    onChange={(e) => setEditedFrequency(e.target.value)}
                                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                                    placeholder="e.g. twice daily"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Duration</label>
                                  <input
                                    type="text"
                                    value={editedDuration}
                                    onChange={(e) => setEditedDuration(e.target.value)}
                                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                                    placeholder="e.g. 30 days"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Provenance Footer */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
                            <span className="text-slate-500">
                              Source: <strong className="text-slate-700">{rx.sourceDocument}</strong>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <StatusBadge status={rx.status} />
                              <ConfidenceBadge confidence={rx.confidence} />
                            </div>
                          </div>
                          {rx.confidenceNote && (
                            <p className="text-[10px] text-slate-400 italic">{rx.confidenceNote}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ─── Lab Results ─── */}
                {extraction && extraction.labResults.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                        Laboratory & Pathology Values ({extraction.labResults.length})
                      </span>
                      <span className="text-[11px] font-normal text-slate-400">Click edit to correct value</span>
                    </h4>

                    {extraction.labResults.map((lab) => {
                      const isEditing = editingItemId === lab.id;
                      const valueUnreadable = lab.value === 'Could not confidently read this field.';
                      const isUncertain = lab.status === 'Uncertain / Flagged';
                      const isDoctorVerifiedItem = lab.status === 'Doctor Verified';
                      const justVerified = verifySuccessId === lab.id;

                      return (
                        <div
                          key={lab.id}
                          className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                            justVerified
                              ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-300/40'
                              : isDoctorVerifiedItem
                              ? 'bg-emerald-50/60 border-emerald-300'
                              : isUncertain
                              ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/20'
                              : lab.isAbnormal
                              ? 'bg-rose-50/40 border-rose-200'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className="font-extrabold text-sm text-slate-900">{lab.testName}</span>
                                {lab.isAbnormal && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-700">
                                    ⚠ ABNORMAL
                                  </span>
                                )}
                                {lab.date && (
                                  <span className="text-[10px] text-slate-400 font-mono">{lab.date}</span>
                                )}
                              </div>

                              <div className="flex items-baseline gap-2">
                                {valueUnreadable
                                  ? <UnreadableFieldDisplay />
                                  : <span className="text-base font-extrabold text-slate-900">{lab.value} <span className="text-xs font-normal text-slate-500">{lab.unit}</span></span>
                                }
                              </div>
                              {lab.referenceRange && (
                                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                                  Reference: {lab.referenceRange}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => isEditing ? saveEditLab(lab.id) : startEditLab(lab)}
                                className="px-2.5 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg flex items-center gap-1 transition-colors border border-teal-200"
                              >
                                {isEditing ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Edit3 className="w-3 h-3" />}
                                <span>{isEditing ? 'Save' : 'Edit'}</span>
                              </button>

                              {isDoctorMode && !isDoctorVerifiedItem && !isEditing && (
                                <button
                                  type="button"
                                  onClick={() => verifyLabItem(lab.id)}
                                  className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors border border-emerald-200"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Verify</span>
                                </button>
                              )}
                              {justVerified && (
                                <span className="text-[10px] text-emerald-700 font-bold text-center">✓ Verified!</span>
                              )}
                            </div>
                          </div>

                          {isEditing && (
                            <div className="pt-2 border-t border-slate-200 flex gap-2 bg-slate-50 p-2.5 rounded-lg">
                              <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Corrected Value</label>
                                <input
                                  type="text"
                                  value={editedValue}
                                  onChange={(e) => setEditedValue(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold"
                                  placeholder="Enter corrected test value..."
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
                            <span className="text-slate-500">
                              Source: <strong className="text-slate-700">{lab.sourceDocument}</strong>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <StatusBadge status={lab.status} />
                              <ConfidenceBadge confidence={lab.confidence} />
                            </div>
                          </div>
                          {lab.confidenceNote && (
                            <p className="text-[10px] text-slate-400 italic">{lab.confidenceNote}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ─── Summary Items ─── */}
                {extraction && extraction.summaryItems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">Clinical Findings & Advice</h4>
                    {extraction.summaryItems.map((s) => (
                      <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase block">{s.title}:</span>
                            <p className="font-semibold text-slate-800 leading-relaxed mt-0.5">{s.content}</p>
                          </div>
                          <div className="shrink-0 flex flex-col gap-1 items-end">
                            <StatusBadge status={s.status} />
                            <ConfidenceBadge confidence={s.confidence} />
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                          Source: {s.sourceDocument}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Doctor Notes field (doctor mode only) */}
                {isDoctorMode && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      Doctor Verification Notes (optional)
                    </label>
                    <textarea
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      rows={2}
                      placeholder="Add any clinical notes about this document — discrepancies found, additional observations, etc."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
                    />
                  </div>
                )}

                {/* No extraction data fallback */}
                {!extraction && (
                  <div className="p-6 text-center text-slate-400 text-xs space-y-2">
                    <HelpCircle className="w-8 h-8 mx-auto text-slate-300" />
                    <p>No structured extraction available for this document. Original file can still be inspected on the left.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer Bar ── */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 shrink-0">
          <div className="text-xs text-slate-500">
            {isDoctorMode ? (
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                Doctor Station — Cross-check the original document before clinical ordering.
                {uncertainCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                    {uncertainCount} uncertain field(s) need attention
                  </span>
                )}
              </span>
            ) : (
              <span>Patient Review Mode — Confirm your medications and lab results. Edit any incorrect value.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isDoctorMode && (
              <button
                type="button"
                onClick={handleDoctorBulkVerify}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify All & Approve (डॉक्टर द्वारा सत्यापित)</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Close Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
