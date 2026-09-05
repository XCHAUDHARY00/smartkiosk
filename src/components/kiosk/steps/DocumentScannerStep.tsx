import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  RefreshCw, 
  Check, 
  Eye, 
  Clock, 
  ShieldAlert,
  Info,
  Calendar,
  Layers,
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Pill,
  FlaskConical
} from 'lucide-react';
import { 
  PatientDocumentRecord, 
  LanguageCode, 
  ExtractedPrescriptionItem, 
  ExtractedLabItem,
  ExtractionStatus
} from '../../../types';
import { 
  PRESET_SAMPLE_DOCUMENTS, 
  processUserUploadedDocument,
  groupDocumentsByTimeline
} from '../../../services/medicalDocumentService';
import { DocumentEvidenceModal } from '../../common/DocumentEvidenceModal';

interface DocumentScannerStepProps {
  documents: PatientDocumentRecord[];
  onSaveDocuments: (docs: PatientDocumentRecord[]) => void;
  onNext: () => void;
  onBack: () => void;
  language: LanguageCode;
  easyMode?: boolean;
}

// Confidence badge styling
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
      {confidence} confidence
    </span>
  );
}

// Status badge styling
function StatusBadge({ status }: { status: ExtractionStatus }) {
  const isVerifiedByPatient = status === 'Verified by Patient';
  const isDoctorVerified = status === 'Doctor Verified';
  const isUncertain = status === 'Uncertain / Flagged';
  const isEdited = status === 'Edited by User';

  if (isDoctorVerified) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Doctor Verified
    </span>
  );
  if (isVerifiedByPatient) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
      <Check className="w-3 h-3" /> Patient Confirmed
    </span>
  );
  if (isEdited) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
      <Edit3 className="w-3 h-3" /> Edited by Patient
    </span>
  );
  if (isUncertain) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
      <AlertTriangle className="w-3 h-3 text-amber-600" /> Uncertain — Needs Review
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
      <Sparkles className="w-3 h-3" /> AI Extracted — Verify
    </span>
  );
}

// Unreadable field component
function UnreadableField() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold">
      <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
      Could not confidently read this field.
    </span>
  );
}

export const DocumentScannerStep: React.FC<DocumentScannerStepProps> = ({
  documents,
  onSaveDocuments,
  onNext,
  onBack,
  language,
  easyMode = false
}) => {
  const [docList, setDocList] = useState<PatientDocumentRecord[]>(documents || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Selected document for side-by-side evidence inspection modal
  const [inspectingDoc, setInspectingDoc] = useState<PatientDocumentRecord | null>(null);

  // Active inline item edit state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editFrequency, setEditFrequency] = useState<string>('');
  const [editDuration, setEditDuration] = useState<string>('');
  const [editDosage, setEditDosage] = useState<string>('');

  // Collapsed cards
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({});

  // Handle Preset Sample Insertion
  const handleLoadPresetSample = (presetKey: string) => {
    const preset = PRESET_SAMPLE_DOCUMENTS.find(p => p.key === presetKey);
    if (!preset) return;

    setIsProcessing(true);
    setProcessingStage('Reading document image with high-resolution OCR...');

    setTimeout(() => {
      setProcessingStage('Segmenting prescription Rx items and pathology tables with Medical Vision AI...');
    }, 600);

    setTimeout(() => {
      const newDoc = preset.createRecord();
      const updated = [newDoc, ...docList];
      setDocList(updated);
      onSaveDocuments(updated);
      setIsProcessing(false);
      setProcessingStage('');
    }, 1200);
  };

  // Handle Real File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-uploaded
    e.target.value = '';

    setIsProcessing(true);
    setProcessingStage(`Scanning file "${file.name}"...`);

    try {
      setTimeout(() => setProcessingStage('Extracting medical fields using AI OCR pipeline...'), 500);
      const newDoc = await processUserUploadedDocument(file);
      const updated = [newDoc, ...docList];
      setDocList(updated);
      onSaveDocuments(updated);
    } catch (err) {
      console.error('OCR processing error:', err);
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const handleRemoveDoc = (id: string) => {
    const updated = docList.filter(d => d.id !== id);
    setDocList(updated);
    onSaveDocuments(updated);
    if (inspectingDoc?.id === id) {
      setInspectingDoc(null);
    }
  };

  const toggleCollapse = (id: string) => {
    setCollapsedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Per-item: patient marks as reviewed
  const markItemReviewed = (docId: string, itemId: string, itemType: 'rx' | 'lab' | 'summary') => {
    const updated = docList.map(doc => {
      if (doc.id !== docId || !doc.structuredExtraction) return doc;
      const se = doc.structuredExtraction;
      return {
        ...doc,
        structuredExtraction: {
          ...se,
          prescriptions: itemType === 'rx'
            ? se.prescriptions.map(p => p.id === itemId ? { ...p, status: 'Verified by Patient' as ExtractionStatus } : p)
            : se.prescriptions,
          labResults: itemType === 'lab'
            ? se.labResults.map(l => l.id === itemId ? { ...l, status: 'Verified by Patient' as ExtractionStatus } : l)
            : se.labResults,
          summaryItems: itemType === 'summary'
            ? se.summaryItems.map(s => s.id === itemId ? { ...s, status: 'Verified by Patient' as ExtractionStatus } : s)
            : se.summaryItems,
        },
        verifiedByPatient: true
      };
    });
    setDocList(updated);
    onSaveDocuments(updated);
  };

  // Per-document: patient marks ALL items as reviewed
  const markAllReviewedForDoc = (docId: string) => {
    const updated = docList.map(doc => {
      if (doc.id !== docId || !doc.structuredExtraction) return doc;
      const se = doc.structuredExtraction;
      return {
        ...doc,
        structuredExtraction: {
          ...se,
          prescriptions: se.prescriptions.map(p =>
            p.status === 'AI extracted — needs verification'
              ? { ...p, status: 'Verified by Patient' as ExtractionStatus }
              : p
          ),
          labResults: se.labResults.map(l =>
            l.status === 'AI extracted — needs verification'
              ? { ...l, status: 'Verified by Patient' as ExtractionStatus }
              : l
          ),
          summaryItems: se.summaryItems.map(s =>
            s.status === 'AI extracted — needs verification'
              ? { ...s, status: 'Verified by Patient' as ExtractionStatus }
              : s
          ),
        },
        verifiedByPatient: true
      };
    });
    setDocList(updated);
    onSaveDocuments(updated);
  };

  // Inline edit: prescription item
  const startEditPrescription = (item: ExtractedPrescriptionItem) => {
    setEditingItemId(item.id);
    setEditValue(`${item.medicine} ${item.strength === 'Could not confidently read this field.' ? '' : item.strength}`.trim());
    setEditFrequency(item.frequency);
    setEditDuration(item.duration || '');
    setEditDosage(item.dosage === 'Could not confidently read this field.' ? '' : item.dosage);
  };

  const saveEditPrescription = (docId: string, itemId: string) => {
    const updated = docList.map(doc => {
      if (doc.id !== docId || !doc.structuredExtraction) return doc;
      const updatedPrescriptions = doc.structuredExtraction.prescriptions.map(p => {
        if (p.id === itemId) {
          return {
            ...p,
            medicine: editValue.split(' ')[0] || p.medicine,
            strength: editValue.split(' ').slice(1).join(' ') || p.strength,
            dosage: editDosage || p.dosage,
            frequency: editFrequency || p.frequency,
            duration: editDuration || p.duration,
            status: 'Edited by User' as ExtractionStatus,
            confidence: 'High' as const,
            confidenceNote: 'Manually verified & corrected by patient',
            isEdited: true
          };
        }
        return p;
      });
      return {
        ...doc,
        structuredExtraction: { ...doc.structuredExtraction, prescriptions: updatedPrescriptions },
        verifiedByPatient: true
      };
    });
    setDocList(updated);
    onSaveDocuments(updated);
    setEditingItemId(null);
  };

  // Inline edit: lab item
  const startEditLab = (item: ExtractedLabItem) => {
    setEditingItemId(item.id);
    setEditValue(item.value === 'Could not confidently read this field.' ? '' : item.value);
  };

  const saveEditLab = (docId: string, itemId: string) => {
    const updated = docList.map(doc => {
      if (doc.id !== docId || !doc.structuredExtraction) return doc;
      const updatedLabs = doc.structuredExtraction.labResults.map(l => {
        if (l.id === itemId) {
          return {
            ...l,
            value: editValue || l.value,
            status: 'Edited by User' as ExtractionStatus,
            confidence: 'High' as const,
            confidenceNote: 'Manually verified & corrected by patient',
            isEdited: true
          };
        }
        return l;
      });
      return {
        ...doc,
        structuredExtraction: { ...doc.structuredExtraction, labResults: updatedLabs },
        verifiedByPatient: true
      };
    });
    setDocList(updated);
    onSaveDocuments(updated);
    setEditingItemId(null);
  };

  // Modal update sync
  const handleModalDocUpdate = (updatedDoc: PatientDocumentRecord) => {
    const updated = docList.map(d => d.id === updatedDoc.id ? updatedDoc : d);
    setDocList(updated);
    onSaveDocuments(updated);
    setInspectingDoc(updatedDoc);
  };

  const timeline = groupDocumentsByTimeline(docList);

  // Review checklist summary across all docs
  const reviewStats = docList.reduce((acc, doc) => {
    const se = doc.structuredExtraction;
    if (!se) return acc;
    const allItems = [...se.prescriptions, ...se.labResults, ...se.summaryItems];
    allItems.forEach(item => {
      acc.total++;
      if (item.status === 'Verified by Patient' || item.status === 'Doctor Verified' || item.status === 'Edited by User') acc.reviewed++;
      else if (item.status === 'Uncertain / Flagged') acc.flagged++;
      else acc.pending++;
    });
    return acc;
  }, { total: 0, reviewed: 0, pending: 0, flagged: 0 });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileUpload}
        disabled={isProcessing}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        disabled={isProcessing}
        className="hidden"
      />

      {/* Step Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-black uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5" />
          Medical Document Extraction & Review
        </div>
        <h2 className={`font-heading font-black text-slate-900 leading-tight ${
          easyMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
        }`}>
          {language === 'hi' ? 'चिकित्सीय दस्तावेज़ एवं पर्चा सत्यापन' : 'Medical Document Extraction & Patient Review'}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          {language === 'hi'
            ? 'पुराने पर्चे, जांच रिपोर्ट या डिस्चार्ज समरी अपलोड करें। एआई हर फ़ील्ड के लिए मूल स्रोत, स्थिति और विश्वास स्तर दिखाता है।'
            : 'Upload past prescriptions, lab reports, consultation notes, or discharge summaries. Every extracted field shows its source, status, and confidence — never silently assumed as truth.'}
        </p>
      </div>

      {/* Evidence Chain Flow Banner - Clean Hospital Healthcare Palette */}
      <div className="bg-slate-50 border border-slate-300 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-bold text-slate-700 mb-2">
          <span className="flex items-center gap-1.5 text-teal-900">
            <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-black flex items-center justify-center text-[10px]">1</span>
            UPLOAD / CAPTURE
          </span>
          <span className="text-slate-400">→</span>
          <span className="flex items-center gap-1.5 text-teal-900">
            <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-black flex items-center justify-center text-[10px]">2</span>
            OCR & AI EXTRACTION
          </span>
          <span className="text-slate-400">→</span>
          <span className="flex items-center gap-1.5 text-teal-900">
            <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-black flex items-center justify-center text-[10px]">3</span>
            STRUCTURING
          </span>
          <span className="text-slate-400">→</span>
          <span className="flex items-center gap-1.5 text-teal-900">
            <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-black flex items-center justify-center text-[10px]">4</span>
            PATIENT REVIEW
          </span>
          <span className="text-slate-400">→</span>
          <span className="flex items-center gap-1.5 text-teal-900">
            <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-black flex items-center justify-center text-[10px]">5</span>
            DOCTOR VERIFICATION
          </span>
        </div>
        <div className="flex items-start gap-2.5 bg-white rounded-xl p-3.5 mt-2 border border-slate-200">
          <ShieldAlert className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            <strong>Safety Standard:</strong> OCR output is <strong>never silently treated as truth</strong>. Every extracted value shows its <strong>Source Document</strong>, <strong>Extraction Status</strong>, and <strong>Confidence</strong>. When handwriting is blurry or damaged, the system outputs <code className="bg-rose-100 text-rose-900 font-bold px-1.5 py-0.5 rounded text-[10px]">"Could not confidently read this field."</code> — never an invented value.
          </p>
        </div>
      </div>

      {/* Upload & Preset Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Upload & Camera Buttons - Generous Touch Targets */}
        <div className="md:col-span-5 space-y-3">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full bg-white rounded-2xl p-5 border-2 border-dashed border-teal-400 hover:border-teal-700 hover:bg-teal-50/40 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 shadow-xs group active:scale-[0.99] ${
              easyMode ? 'min-h-[120px]' : 'min-h-[100px]'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-100 group-hover:bg-teal-200 text-teal-800 flex items-center justify-center transition-colors shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className={`font-black text-slate-900 block ${easyMode ? 'text-base' : 'text-sm'}`}>
                {language === 'hi' ? 'दस्तावेज़ / पर्चा अपलोड करें' : 'Upload Prescription or Report'}
              </span>
              <span className="text-xs text-slate-500 font-medium mt-0.5 block">PNG, JPG, or PDF</span>
            </div>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => cameraInputRef.current?.click()}
            className={`w-full bg-white rounded-2xl p-4 border-2 border-slate-300 hover:border-teal-600 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-3.5 text-left shadow-xs group active:scale-[0.99] ${
              easyMode ? 'min-h-[76px]' : 'min-h-[64px]'
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-teal-100 text-slate-700 group-hover:text-teal-800 flex items-center justify-center transition-colors shadow-xs shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className={`font-black text-slate-900 block ${easyMode ? 'text-base' : 'text-sm'}`}>
                {language === 'hi' ? 'कैमरे से फोटो लें' : 'Capture with Camera'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {language === 'hi' ? 'कियोस्क या फोन कैमरा' : 'Kiosk / device camera'}
              </span>
            </div>
          </button>
        </div>

        {/* Preset Sample Documents */}
        <div className="md:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Sample Documents — Test All Document Types
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Click any sample to test: prescription, lab report, discharge summary, consultation note, or extraction failure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleLoadPresetSample('opd_prescription_may2026')}
              className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 transition-all group"
            >
              <span className="font-bold text-xs text-slate-900 block group-hover:text-teal-800 flex items-center gap-1">
                <Pill className="w-3 h-3 text-teal-600" /> OPD Prescription (12 May 2026)
              </span>
              <span className="text-[10px] text-slate-500 block truncate">Metformin, Telmisartan + Blurry Atorvastatin</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleLoadPresetSample('lab_report_apr2026')}
              className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 transition-all group"
            >
              <span className="font-bold text-xs text-slate-900 block group-hover:text-teal-800 flex items-center gap-1">
                <FlaskConical className="w-3 h-3 text-blue-600" /> Lab Report (18 Apr 2026)
              </span>
              <span className="text-[10px] text-slate-500 block truncate">FBS 142 (High), HbA1c 7.2%, Triglycerides (?)</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleLoadPresetSample('consultation_summary_oct2025')}
              className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 transition-all group"
            >
              <span className="font-bold text-xs text-slate-900 block group-hover:text-indigo-800 flex items-center gap-1">
                <FileText className="w-3 h-3 text-indigo-600" /> Consultation Note (Oct 2025)
              </span>
              <span className="text-[10px] text-slate-500 block truncate">Neuropathy follow-up, Pregabalin added</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleLoadPresetSample('discharge_summary_jan2026')}
              className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 transition-all group"
            >
              <span className="font-bold text-xs text-slate-900 block group-hover:text-teal-800 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-600" /> Discharge Summary (Jan 2026)
              </span>
              <span className="text-[10px] text-slate-500 block truncate">Acute Bronchitis inpatient memo</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleLoadPresetSample('extraction_failure_test')}
              className="p-2.5 text-left rounded-xl bg-rose-50/60 hover:bg-rose-100/70 border border-rose-200 transition-all group col-span-full sm:col-span-2"
            >
              <span className="font-bold text-xs text-rose-900 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" /> Test Extraction Failure (Damaged Slip)
              </span>
              <span className="text-[10px] text-rose-700 block">Water-damaged prescription — AI safely marks fields unreadable</span>
            </button>
          </div>
        </div>
      </div>

      {/* Processing Loader */}
      {isProcessing && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 text-center space-y-3 shadow-xs">
          <div className="flex items-center justify-center gap-2 text-teal-800 font-bold text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
            <span>{processingStage}</span>
          </div>
          <div className="w-full bg-teal-200/60 rounded-full h-1.5 overflow-hidden max-w-md mx-auto">
            <div className="bg-teal-600 h-full rounded-full animate-pulse w-3/4" />
          </div>
          <p className="text-xs text-teal-700">
            AI is extracting fields — unreadable text will be explicitly flagged, never hallucinated.
          </p>
        </div>
      )}

      {/* Review Checklist Summary (shown when any docs exist) */}
      {docList.length > 0 && reviewStats.total > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Patient Review Checklist</h3>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800 flex items-center gap-1">
              <Check className="w-3 h-3" /> {reviewStats.reviewed} Confirmed
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 flex items-center gap-1">
              <Info className="w-3 h-3" /> {reviewStats.pending} Pending Review
            </span>
            {reviewStats.flagged > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {reviewStats.flagged} Flagged / Unreadable
              </span>
            )}
          </div>

          {/* Document Timeline */}
          <div className="w-full flex flex-wrap items-center gap-2 text-xs font-semibold pt-2 border-t border-slate-100">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
              Previous History: <strong>{timeline.previousHistory.length}</strong>
            </span>
            <span className="text-slate-300">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800">
              Recent Prior Visits: <strong>{timeline.recentVisits.length}</strong>
            </span>
            <span className="text-slate-300">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800">
              Current Encounter: <strong>{timeline.currentEncounter.length}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Document Cards */}
      {docList.length > 0 ? (
        <div className="space-y-5">
          {docList.map((doc) => {
            const extraction = doc.structuredExtraction;
            const hasUncertain = extraction?.unreadableFieldsDetected;
            const isCollapsed = collapsedCards[doc.id];
            const isVerified = doc.doctorVerification?.status === 'VERIFIED';

            // Count reviewed vs total items
            const allItems = extraction
              ? [...extraction.prescriptions, ...extraction.labResults, ...extraction.summaryItems]
              : [];
            const reviewedCount = allItems.filter(
              i => i.status === 'Verified by Patient' || i.status === 'Doctor Verified' || i.status === 'Edited by User'
            ).length;
            const pendingCount = allItems.filter(
              i => i.status === 'AI extracted — needs verification'
            ).length;

            return (
              <div
                key={doc.id}
                className={`bg-white rounded-2xl border shadow-xs transition-all ${
                  isVerified
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : hasUncertain
                    ? 'border-amber-200'
                    : 'border-slate-200'
                }`}
              >
                {/* Card Header */}
                <div className="p-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 ${
                      doc.documentTimelineStage === 'Current encounter'
                        ? 'bg-indigo-50 text-indigo-700'
                        : doc.documentTimelineStage === 'Recent prior visit'
                        ? 'bg-teal-50 text-teal-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <FileText className="w-4 h-4" />
                      <span>OCR</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          {extraction?.documentTypeLabel || doc.extractedData?.documentType || 'Clinical Document'}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                          {doc.documentTimelineStage}
                        </span>
                        {isVerified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Doctor Verified
                          </span>
                        )}
                        {reviewedCount > 0 && !isVerified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                            {reviewedCount}/{allItems.length} reviewed
                          </span>
                        )}
                        {hasUncertain && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> Uncertain Fields
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {doc.fileName} • Uploaded: {extraction?.date || doc.extractedData?.date || doc.uploadedAt}
                        {extraction?.doctorName && ` • ${extraction.doctorName}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mark all reviewed */}
                    {pendingCount > 0 && (
                      <button
                        type="button"
                        onClick={() => markAllReviewedForDoc(doc.id)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark All Reviewed ({pendingCount})</span>
                      </button>
                    )}

                    {/* Inspect Original Button */}
                    <button
                      type="button"
                      onClick={() => setInspectingDoc(doc)}
                      className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs border border-teal-200"
                    >
                      <Eye className="w-3.5 h-3.5 text-teal-600" />
                      <span>Inspect Original</span>
                    </button>

                    {/* Collapse toggle */}
                    <button
                      type="button"
                      onClick={() => toggleCollapse(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                    >
                      {isCollapsed
                        ? <ChevronDown className="w-4 h-4" />
                        : <ChevronUp className="w-4 h-4" />
                      }
                    </button>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Remove Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Body (collapsible) */}
                {!isCollapsed && (
                  <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">

                    {/* OCR Extraction Notes */}
                    {extraction?.extractionNotes && (
                      <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{extraction.extractionNotes}</span>
                      </div>
                    )}

                    {/* Unreadable fields warning */}
                    {hasUncertain && (
                      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">Extraction Notice: Unreadable Field(s) Detected</span>
                          <span>
                            The AI identified blurry or damaged handwriting and safely flagged those fields as unreadable. Click <strong>Edit</strong> to enter the correct value, or <strong>Inspect Original</strong> to compare with the source document.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* ─── Prescriptions ─── */}
                    {extraction?.prescriptions && extraction.prescriptions.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-teal-600" />
                          Prescriptions & Medications ({extraction.prescriptions.length})
                        </h5>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {extraction.prescriptions.map((rx) => {
                            const isEditing = editingItemId === rx.id;
                            const strengthUnreadable = rx.strength === 'Could not confidently read this field.';
                            const dosageUnreadable = rx.dosage === 'Could not confidently read this field.';
                            const isUncertain = rx.status === 'Uncertain / Flagged';
                            const isAlreadyReviewed = rx.status === 'Verified by Patient' || rx.status === 'Doctor Verified' || rx.status === 'Edited by User';

                            return (
                              <div
                                key={rx.id}
                                className={`p-4 rounded-xl border text-xs space-y-3 transition-all ${
                                  isUncertain
                                    ? 'bg-amber-50/60 border-amber-300'
                                    : isAlreadyReviewed
                                    ? 'bg-teal-50/40 border-teal-200'
                                    : 'bg-white border-slate-200'
                                }`}
                              >
                                {/* Medicine name + strength */}
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="font-extrabold text-slate-900 text-sm">{rx.medicine}</span>
                                      {rx.isEdited && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800">Edited</span>
                                      )}
                                    </div>
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1">
                                        <span className="text-slate-500 w-14 shrink-0">Strength:</span>
                                        {strengthUnreadable ? <UnreadableField /> : <span className="font-semibold text-slate-800">{rx.strength}</span>}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-slate-500 w-14 shrink-0">Dosage:</span>
                                        {dosageUnreadable ? <UnreadableField /> : <span className="font-semibold text-slate-800">{rx.dosage}</span>}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-slate-500 w-14 shrink-0">Frequency:</span>
                                        <span className="font-semibold text-slate-800">{rx.frequency}</span>
                                      </div>
                                      {rx.duration && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-slate-500 w-14 shrink-0">Duration:</span>
                                          <span className="font-semibold text-slate-800">{rx.duration}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => isEditing ? saveEditPrescription(doc.id, rx.id) : startEditPrescription(rx)}
                                    className="shrink-0 px-2 py-1 text-[10px] font-bold text-teal-700 bg-white hover:bg-teal-50 border border-teal-200 rounded-lg flex items-center gap-1"
                                  >
                                    {isEditing ? <Check className="w-3 h-3 text-teal-600" /> : <Edit3 className="w-3 h-3" />}
                                    <span>{isEditing ? 'Save' : 'Edit'}</span>
                                  </button>
                                </div>

                                {/* Inline Edit Form */}
                                {isEditing && (
                                  <div className="pt-2 border-t border-slate-200 space-y-2 bg-slate-50 p-2.5 rounded-lg">
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      placeholder="Medicine & Strength (e.g. Metformin 500 mg)"
                                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                                    />
                                    <div className="grid grid-cols-3 gap-2">
                                      <input
                                        type="text"
                                        value={editDosage}
                                        onChange={(e) => setEditDosage(e.target.value)}
                                        placeholder="Dosage (e.g. 1 tablet)"
                                        className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                                      />
                                      <input
                                        type="text"
                                        value={editFrequency}
                                        onChange={(e) => setEditFrequency(e.target.value)}
                                        placeholder="Frequency (e.g. BD)"
                                        className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                                      />
                                      <input
                                        type="text"
                                        value={editDuration}
                                        onChange={(e) => setEditDuration(e.target.value)}
                                        placeholder="Duration (e.g. 30 days)"
                                        className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Provenance & Status Footer */}
                                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-[10px] text-slate-500">
                                      Source: <strong>{rx.sourceDocument}</strong>
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <StatusBadge status={rx.status} />
                                      <ConfidenceBadge confidence={rx.confidence} />
                                    </div>
                                  </div>
                                  {rx.confidenceNote && (
                                    <p className="text-[10px] text-slate-400 italic">{rx.confidenceNote}</p>
                                  )}
                                  {/* Patient Mark Reviewed */}
                                  {!isAlreadyReviewed && !isEditing && (
                                    <button
                                      type="button"
                                      onClick={() => markItemReviewed(doc.id, rx.id, 'rx')}
                                      className="w-full mt-1 py-1 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1"
                                    >
                                      <Check className="w-3 h-3" />
                                      Mark as Reviewed & Confirmed
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ─── Lab Results ─── */}
                    {extraction?.labResults && extraction.labResults.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                          Laboratory Diagnostic Values ({extraction.labResults.length})
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {extraction.labResults.map((lab) => {
                            const isEditing = editingItemId === lab.id;
                            const valueUnreadable = lab.value === 'Could not confidently read this field.';
                            const isUncertain = lab.status === 'Uncertain / Flagged';
                            const isAlreadyReviewed = lab.status === 'Verified by Patient' || lab.status === 'Doctor Verified' || lab.status === 'Edited by User';

                            return (
                              <div
                                key={lab.id}
                                className={`p-4 rounded-xl border text-xs space-y-3 transition-all ${
                                  isUncertain
                                    ? 'bg-amber-50/60 border-amber-300'
                                    : lab.isAbnormal
                                    ? 'bg-rose-50/40 border-rose-200'
                                    : isAlreadyReviewed
                                    ? 'bg-teal-50/40 border-teal-200'
                                    : 'bg-white border-slate-200'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <div>
                                    <span className="font-bold text-slate-900 block text-xs">{lab.testName}</span>
                                    {lab.date && (
                                      <span className="text-[10px] text-slate-400 font-mono">{lab.date}</span>
                                    )}
                                    {lab.isAbnormal && (
                                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 block mt-0.5">
                                        ⚠ ABNORMAL
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => isEditing ? saveEditLab(doc.id, lab.id) : startEditLab(lab)}
                                    className="shrink-0 px-2 py-1 text-[10px] font-bold text-teal-700 bg-white hover:bg-teal-50 border border-teal-200 rounded-lg flex items-center gap-1"
                                  >
                                    {isEditing ? <Check className="w-3 h-3 text-teal-600" /> : <Edit3 className="w-3 h-3" />}
                                    <span>{isEditing ? 'Save' : 'Edit'}</span>
                                  </button>
                                </div>

                                {/* Value */}
                                <div className="space-y-1">
                                  <div className="flex items-baseline gap-2">
                                    {valueUnreadable
                                      ? <UnreadableField />
                                      : <span className="text-base font-extrabold text-slate-900">{lab.value} <span className="text-xs font-normal text-slate-500">{lab.unit}</span></span>
                                    }
                                  </div>
                                  {lab.referenceRange && (
                                    <span className="text-[10px] text-slate-500 font-mono block">
                                      Reference: {lab.referenceRange}
                                    </span>
                                  )}
                                </div>

                                {/* Inline Edit */}
                                {isEditing && (
                                  <div className="pt-1 border-t border-slate-200 flex gap-2">
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      placeholder="Corrected test value (e.g. 140)"
                                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                                    />
                                  </div>
                                )}

                                {/* Provenance Footer */}
                                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                                  <div className="flex flex-wrap items-center justify-between gap-1">
                                    <span className="text-[10px] text-slate-500 truncate max-w-[140px]">{lab.sourceDocument}</span>
                                    <div className="flex items-center gap-1.5">
                                      <StatusBadge status={lab.status} />
                                      <ConfidenceBadge confidence={lab.confidence} />
                                    </div>
                                  </div>
                                  {lab.confidenceNote && (
                                    <p className="text-[10px] text-slate-400 italic">{lab.confidenceNote}</p>
                                  )}
                                  {!isAlreadyReviewed && !isEditing && (
                                    <button
                                      type="button"
                                      onClick={() => markItemReviewed(doc.id, lab.id, 'lab')}
                                      className="w-full mt-1 py-1 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1"
                                    >
                                      <Check className="w-3 h-3" />
                                      Mark as Reviewed & Confirmed
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ─── Summary Items ─── */}
                    {extraction?.summaryItems && extraction.summaryItems.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Clinical Findings & Advice
                        </h5>
                        {extraction.summaryItems.map((s) => {
                          const isAlreadyReviewed = s.status === 'Verified by Patient' || s.status === 'Doctor Verified' || s.status === 'Edited by User';
                          return (
                            <div
                              key={s.id}
                              className={`p-3 rounded-xl border text-xs space-y-2 ${
                                isAlreadyReviewed ? 'bg-teal-50/30 border-teal-200' : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">{s.title}</span>
                                  <p className="font-semibold text-slate-900 leading-relaxed">{s.content}</p>
                                </div>
                                <div className="shrink-0 flex flex-col items-end gap-1">
                                  <StatusBadge status={s.status} />
                                  <ConfidenceBadge confidence={s.confidence} />
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                                <span className="text-[10px] text-slate-400">Source: {s.sourceDocument}</span>
                                {!isAlreadyReviewed && (
                                  <button
                                    type="button"
                                    onClick={() => markItemReviewed(doc.id, s.id, 'summary')}
                                    className="px-2.5 py-0.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-bold text-[10px] rounded-lg transition-all flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" /> Confirm
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-xs space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700 text-base">No Medical Documents Attached Yet</h4>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            Upload a previous prescription, lab report, consultation note, or discharge summary. Or click one of the preset samples above to test the extraction workflow.
          </p>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className={`w-full sm:w-auto min-h-[56px] px-6 py-3.5 rounded-xl border-2 border-slate-300 hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-center gap-2 transition-colors ${
            easyMode ? 'text-base min-h-[64px]' : 'text-sm'
          }`}
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
          <span>{language === 'hi' ? 'पीछे जाएं (Back)' : 'Back'}</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className={`w-full sm:w-auto min-h-[56px] px-8 py-3.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] ${
            easyMode ? 'text-lg min-h-[64px] px-10' : 'text-base'
          }`}
        >
          <span>
            {docList.length > 0
              ? (language === 'hi'
                  ? `समीक्षा पर बढ़ें (${reviewStats.reviewed}/${reviewStats.total} सत्यापित)`
                  : `Proceed to Review (${reviewStats.reviewed}/${reviewStats.total} reviewed)`)
              : (language === 'hi' ? 'आगे बढ़ें (दस्तावेज़ नहीं है)' : 'Skip / Next (No Documents)')}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Side-by-Side Original Document Evidence Modal */}
      <DocumentEvidenceModal
        isOpen={inspectingDoc !== null}
        onClose={() => setInspectingDoc(null)}
        document={inspectingDoc}
        onUpdateDocument={handleModalDocUpdate}
        isDoctorMode={false}
      />
    </div>
  );
};
