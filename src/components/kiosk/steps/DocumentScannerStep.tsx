import React, { useState } from 'react';
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
  Layers
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
}

export const DocumentScannerStep: React.FC<DocumentScannerStepProps> = ({
  documents,
  onSaveDocuments,
  onNext,
  onBack,
  language
}) => {
  const [docList, setDocList] = useState<PatientDocumentRecord[]>(documents || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');

  // Selected document for side-by-side evidence inspection modal
  const [inspectingDoc, setInspectingDoc] = useState<PatientDocumentRecord | null>(null);

  // Active inline item edit state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editFrequency, setEditFrequency] = useState<string>('');
  const [editDuration, setEditDuration] = useState<string>('');

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

    setIsProcessing(true);
    setProcessingStage(`Scanning file "${file.name}"...`);

    try {
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

  // Inline edit prescription item
  const startEditPrescription = (item: ExtractedPrescriptionItem) => {
    setEditingItemId(item.id);
    setEditValue(`${item.medicine} ${item.strength === 'Could not confidently read this field.' ? '' : item.strength}`.trim());
    setEditFrequency(item.frequency);
    setEditDuration(item.duration || '');
  };

  const saveEditPrescription = (docId: string, itemId: string) => {
    const updated = docList.map(doc => {
      if (doc.id === docId && doc.structuredExtraction) {
        const updatedPrescriptions = doc.structuredExtraction.prescriptions.map(p => {
          if (p.id === itemId) {
            return {
              ...p,
              medicine: editValue || p.medicine,
              frequency: editFrequency || p.frequency,
              duration: editDuration || p.duration,
              status: 'Edited by User' as ExtractionStatus,
              confidence: 'High' as const,
              confidenceNote: 'Manually verified & edited by patient',
              isEdited: true
            };
          }
          return p;
        });

        return {
          ...doc,
          structuredExtraction: {
            ...doc.structuredExtraction,
            prescriptions: updatedPrescriptions
          },
          verifiedByPatient: true
        };
      }
      return doc;
    });

    setDocList(updated);
    onSaveDocuments(updated);
    setEditingItemId(null);
  };

  // Inline edit lab item
  const startEditLab = (item: ExtractedLabItem) => {
    setEditingItemId(item.id);
    setEditValue(item.value === 'Could not confidently read this field.' ? '' : item.value);
  };

  const saveEditLab = (docId: string, itemId: string) => {
    const updated = docList.map(doc => {
      if (doc.id === docId && doc.structuredExtraction) {
        const updatedLabs = doc.structuredExtraction.labResults.map(l => {
          if (l.id === itemId) {
            return {
              ...l,
              value: editValue || l.value,
              status: 'Edited by User' as ExtractionStatus,
              confidence: 'High' as const,
              confidenceNote: 'Manually verified & edited by patient',
              isEdited: true
            };
          }
          return l;
        });

        return {
          ...doc,
          structuredExtraction: {
            ...doc.structuredExtraction,
            labResults: updatedLabs
          },
          verifiedByPatient: true
        };
      }
      return doc;
    });

    setDocList(updated);
    onSaveDocuments(updated);
    setEditingItemId(null);
  };

  // Modal update synchronization
  const handleModalDocUpdate = (updatedDoc: PatientDocumentRecord) => {
    const updated = docList.map(d => d.id === updatedDoc.id ? updatedDoc : d);
    setDocList(updated);
    onSaveDocuments(updated);
    setInspectingDoc(updatedDoc);
  };

  const timeline = groupDocumentsByTimeline(docList);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/80 text-teal-800 text-xs font-bold uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5" />
          Step 6 • चरण 6 (दस्तावेज़ एवं पर्चा निष्कर्षण)
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
          {language === 'hi' ? 'चिकित्सीय दस्तावेज़ व पर्चा सत्यापन' : 'Medical Document Extraction & Verification'}
        </h2>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          {language === 'hi'
            ? 'पुराने पर्चे, खून की जांच रिपोर्ट या डिस्चार्ज समरी अपलोड करें। एआई कभी भी ओसीआर को बिना सत्यापन सच नहीं मानता।'
            : 'Turn past prescriptions, pathology reports, and discharge summaries into structured, reviewable clinical evidence.'}
        </p>
      </div>

      {/* Safety & Evidence Mandate Banner */}
      <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 border border-teal-200 rounded-2xl p-4 text-xs shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-600 text-white shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-teal-950 text-sm">
              Strict SIH26047 Provenance Standard: OCR Output is Never Silently Assumed as Truth
            </h4>
            <p className="text-teal-900 leading-relaxed">
              Every extracted medication, dosage, and lab test displays its <strong>Value</strong>, <strong>Source Document</strong>, <strong>Extraction Status</strong>, and <strong>Confidence</strong>. When handwriting is blurry or damaged, the system safely outputs <code className="bg-teal-200/70 text-teal-950 font-bold px-1.5 py-0.5 rounded">"Could not confidently read this field."</code> rather than inventing values.
            </p>
          </div>
        </div>
      </div>

      {/* Upload & Preset Document Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Real File Upload Card */}
        <label className="md:col-span-5 bg-white rounded-2xl p-6 border-2 border-dashed border-teal-300 hover:border-teal-500 hover:bg-teal-50/20 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 shadow-xs group">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-teal-100 group-hover:bg-teal-200 text-teal-700 flex items-center justify-center transition-colors shadow-xs">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-slate-800 block text-sm">
              Upload Prescription or Lab Report
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Drag &amp; drop or click to upload PNG, JPG, or PDF
            </span>
          </div>
          <div className="text-[11px] text-teal-700 font-bold bg-teal-50 px-2.5 py-1 rounded-lg">
            Kiosk Bed Scanner / Camera
          </div>
        </label>

        {/* Preset Sample Documents for Evaluation */}
        <div className="md:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                SIH Evaluation Sample Documents (परीक्षण हेतु पूर्व-लोड पर्चे)
              </span>
              <span className="text-[11px] text-slate-400">Click to test OCR</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select any standardized medical slip to test prescription extraction, abnormal lab parameters, or low-confidence failure handling:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleLoadPresetSample('opd_prescription_may2026')}
              className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 transition-all group"
            >
              <span className="font-bold text-xs text-slate-900 block group-hover:text-teal-800">
                1. OPD Prescription (12 May 2026)
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                Metformin 500mg, Telmisartan, Blurry Atorvastatin
              </span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleLoadPresetSample('lab_report_apr2026')}
              className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 transition-all group"
            >
              <span className="font-bold text-xs text-slate-900 block group-hover:text-teal-800">
                2. Lab Report (18 Apr 2026)
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                FBS 142 (High), HbA1c 7.2%, Creatinine, Triglycerides
              </span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleLoadPresetSample('discharge_summary_jan2026')}
              className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 transition-all group"
            >
              <span className="font-bold text-xs text-slate-900 block group-hover:text-teal-800">
                3. Discharge Summary (10 Jan 2026)
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                Inpatient Acute Bronchitis resolved memo
              </span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleLoadPresetSample('extraction_failure_test')}
              className="p-2.5 text-left rounded-xl bg-rose-50/60 hover:bg-rose-100/70 border border-rose-200 transition-all group"
            >
              <span className="font-bold text-xs text-rose-900 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                4. Test Extraction Failure
              </span>
              <span className="text-[10px] text-rose-700 block truncate">
                Damaged slip with unreadable field alerts
              </span>
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
        </div>
      )}

      {/* Document Timeline & Structured Evidence Section */}
      {docList.length > 0 ? (
        <div className="space-y-6">
          
          {/* Document Timeline Header */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Medical Document Timeline ({timeline.totalCount} Document{timeline.totalCount !== 1 ? 's' : ''})
              </h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                Previous Medical History: <strong>{timeline.previousHistory.length}</strong>
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

          {/* Document Cards List */}
          <div className="space-y-4">
            {docList.map((doc) => {
              const extraction = doc.structuredExtraction;
              const hasUncertain = extraction?.unreadableFieldsDetected;

              return (
                <div key={doc.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                  
                  {/* Card Header: Meta + Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 ${
                        doc.documentTimelineStage === 'Current encounter'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-teal-50 text-teal-700'
                      }`}>
                        <FileText className="w-4 h-4" />
                        <span>OCR</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {extraction?.documentTypeLabel || doc.extractedData?.documentType || 'Clinical Document'}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                            {doc.documentTimelineStage}
                          </span>
                          {doc.doctorVerification?.status === 'VERIFIED' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Doctor Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {doc.fileName} • Date: {extraction?.date || doc.extractedData?.date || doc.uploadedAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectingDoc(doc)}
                        className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-600" />
                        <span>Inspect Original Document (Side-by-Side)</span>
                      </button>

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

                  {/* Warning banner when unreadable fields are flagged */}
                  {hasUncertain && (
                    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Extraction Notice: Blurred / Unreadable Field Detected</span>
                        <span>
                          The AI refrained from hallucinating values and marked missing handwriting as unreadable. Click edit to provide the true value.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Structured Prescriptions Section */}
                  {extraction && extraction.prescriptions && extraction.prescriptions.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                        Extracted Prescriptions &amp; Medications:
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {extraction.prescriptions.map((rx) => {
                          const isEditing = editingItemId === rx.id;
                          const isUncertain = rx.status === 'Uncertain / Flagged' || rx.strength === 'Could not confidently read this field.';

                          return (
                            <div
                              key={rx.id}
                              className={`p-3 rounded-xl border text-xs space-y-2 transition-all ${
                                isUncertain
                                  ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-400/20'
                                  : rx.status === 'Doctor Verified'
                                  ? 'bg-emerald-50/60 border-emerald-300'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-900 text-xs">
                                      {rx.medicine} {rx.strength !== 'Could not confidently read this field.' && rx.strength}
                                    </span>
                                    {rx.isEdited && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800">
                                        Edited
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-slate-600 text-[11px] mt-0.5">
                                    Frequency: <strong>{rx.frequency}</strong>
                                    {rx.duration && <span> • Duration: <strong>{rx.duration}</strong></span>}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => isEditing ? saveEditPrescription(doc.id, rx.id) : startEditPrescription(rx)}
                                  className="px-2 py-0.5 text-[10px] font-bold text-teal-700 bg-white hover:bg-teal-50 border border-teal-200 rounded flex items-center gap-1"
                                >
                                  {isEditing ? <Check className="w-3 h-3 text-teal-600" /> : <Edit3 className="w-3 h-3" />}
                                  <span>{isEditing ? 'Save' : 'Edit'}</span>
                                </button>
                              </div>

                              {isEditing && (
                                <div className="pt-2 border-t border-slate-200 space-y-1.5 bg-white p-2 rounded">
                                  <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    placeholder="Medicine & Strength (e.g. Metformin 500mg)"
                                    className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs"
                                  />
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <input
                                      type="text"
                                      value={editFrequency}
                                      onChange={(e) => setEditFrequency(e.target.value)}
                                      placeholder="Frequency (e.g. BD)"
                                      className="px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs"
                                    />
                                    <input
                                      type="text"
                                      value={editDuration}
                                      onChange={(e) => setEditDuration(e.target.value)}
                                      placeholder="Duration (e.g. 30 days)"
                                      className="px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs"
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="pt-1.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-500">
                                <span>Source: <strong>{rx.sourceDocument}</strong></span>
                                <span className={`px-1.5 py-0.5 rounded font-bold ${
                                  rx.status === 'Doctor Verified'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isUncertain
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-teal-100 text-teal-800'
                                }`}>
                                  {rx.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Structured Labs Section */}
                  {extraction && extraction.labResults && extraction.labResults.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                        Extracted Laboratory Diagnostic Values:
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {extraction.labResults.map((lab) => {
                          const isEditing = editingItemId === lab.id;
                          const isUncertain = lab.status === 'Uncertain / Flagged' || lab.value === 'Could not confidently read this field.';

                          return (
                            <div
                              key={lab.id}
                              className={`p-3 rounded-xl border text-xs space-y-2 transition-all ${
                                isUncertain
                                  ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-400/20'
                                  : lab.status === 'Doctor Verified'
                                  ? 'bg-emerald-50/60 border-emerald-300'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div>
                                  <span className="font-bold text-slate-900 block text-xs truncate max-w-[160px]">
                                    {lab.testName}
                                  </span>
                                  {lab.isAbnormal && (
                                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                                      ABNORMAL
                                    </span>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => isEditing ? saveEditLab(doc.id, lab.id) : startEditLab(lab)}
                                  className="px-2 py-0.5 text-[10px] font-bold text-teal-700 bg-white hover:bg-teal-50 border border-teal-200 rounded flex items-center gap-1"
                                >
                                  {isEditing ? <Check className="w-3 h-3 text-teal-600" /> : <Edit3 className="w-3 h-3" />}
                                  <span>{isEditing ? 'Save' : 'Edit'}</span>
                                </button>
                              </div>

                              <div className="font-extrabold text-sm text-slate-900">
                                {lab.value} {lab.unit}
                                {lab.referenceRange && (
                                  <span className="text-[10px] text-slate-500 font-normal ml-1">
                                    ({lab.referenceRange})
                                  </span>
                                )}
                              </div>

                              {isEditing && (
                                <div className="pt-1 border-t border-slate-200 flex gap-1">
                                  <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    placeholder="Corrected test value"
                                    className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                                  />
                                </div>
                              )}

                              <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
                                <span className="truncate max-w-[130px]">{lab.sourceDocument}</span>
                                <span className={`px-1.5 py-0.5 rounded font-bold ${
                                  lab.status === 'Doctor Verified'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isUncertain
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-teal-100 text-teal-800'
                                }`}>
                                  {lab.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Summary / Notes items */}
                  {extraction && extraction.summaryItems && extraction.summaryItems.length > 0 && (
                    <div className="space-y-1 text-xs">
                      {extraction.summaryItems.map((s) => (
                        <div key={s.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-700">{s.title}: </span>
                          <span className="text-slate-900">{s.content}</span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-xs space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700 text-base">
            No Past Medical Documents Attached Yet
          </h4>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            You can upload a previous prescription or lab report, or click one of the preset sample documents above to test optical character recognition.
          </p>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>पीछे (Back to Clinical Interview)</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <span>समीक्षा पर बढ़ें (Review Case Details)</span>
          <ArrowRight className="w-4 h-4" />
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
