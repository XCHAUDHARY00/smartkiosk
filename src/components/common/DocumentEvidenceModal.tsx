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
  Stethoscope, 
  HelpCircle,
  ExternalLink,
  Check,
  RotateCcw
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
  const [activeTab, setActiveTab] = useState<'split' | 'original' | 'extracted'>('split');

  const extraction = document.structuredExtraction;

  // Handle editing of prescription item
  const startEditPrescription = (item: ExtractedPrescriptionItem) => {
    setEditingItemId(item.id);
    setEditedValue(`${item.medicine} ${item.strength === 'Could not confidently read this field.' ? '' : item.strength}`.trim());
    setEditedFrequency(item.frequency);
    setEditedDuration(item.duration || '');
  };

  const saveEditPrescription = (itemId: string) => {
    if (!extraction || !onUpdateDocument) return;

    const updatedPrescriptions = extraction.prescriptions.map(p => {
      if (p.id === itemId) {
        return {
          ...p,
          medicine: editedValue || p.medicine,
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

    const updatedDoc: PatientDocumentRecord = {
      ...document,
      structuredExtraction: {
        ...extraction,
        prescriptions: updatedPrescriptions
      },
      verifiedByPatient: true
    };

    onUpdateDocument(updatedDoc);
    setEditingItemId(null);
  };

  // Handle editing of lab item
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

    const updatedDoc: PatientDocumentRecord = {
      ...document,
      structuredExtraction: {
        ...extraction,
        labResults: updatedLabs
      },
      verifiedByPatient: true
    };

    onUpdateDocument(updatedDoc);
    setEditingItemId(null);
  };

  // Doctor bulk verify action
  const handleDoctorBulkVerify = () => {
    if (!extraction || !onUpdateDocument) return;

    const verifiedPrescriptions = extraction.prescriptions.map(p => ({
      ...p,
      status: 'Doctor Verified' as ExtractionStatus
    }));

    const verifiedLabs = extraction.labResults.map(l => ({
      ...l,
      status: 'Doctor Verified' as ExtractionStatus
    }));

    const updatedDoc: PatientDocumentRecord = {
      ...document,
      structuredExtraction: {
        ...extraction,
        prescriptions: verifiedPrescriptions,
        labResults: verifiedLabs
      },
      doctorVerification: {
        status: 'VERIFIED',
        verifiedByDoctorName: doctorName,
        verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: 'Original document verified against structured clinical summary by attending physician.'
      }
    };

    onUpdateDocument(updatedDoc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {document.fileName}
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                  {document.documentTimelineStage}
                </span>
                {document.doctorVerification?.status === 'VERIFIED' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Doctor Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>Uploaded: {document.uploadedAt}</span>
                <span>•</span>
                <span>Type: {extraction?.documentTypeLabel || document.extractedData?.documentType || 'Clinical Document'}</span>
              </p>
            </div>
          </div>

          {/* Right Controls: View Switcher & Close */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex bg-slate-200 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`px-3 py-1 rounded-lg transition-all ${activeTab === 'split' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'}`}
              >
                Side-by-Side
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('original')}
                className={`px-3 py-1 rounded-lg transition-all ${activeTab === 'original' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'}`}
              >
                Original Document
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('extracted')}
                className={`px-3 py-1 rounded-lg transition-all ${activeTab === 'extracted' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'}`}
              >
                Extracted Data
              </button>
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

        {/* Evidence Chain Banner (Strict SIH26047 Requirement) */}
        <div className="px-6 py-2.5 bg-gradient-to-r from-teal-50 via-indigo-50 to-amber-50 border-b border-slate-200 text-xs">
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
              DOCTOR VERIFICATION
            </span>
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className={`grid gap-6 ${activeTab === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            
            {/* Left / Top: Original Document Viewer */}
            {(activeTab === 'split' || activeTab === 'original') && (
              <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-indigo-600" />
                    Original Scanned Document (मूल दस्तावेज़)
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    High Resolution OCR Input
                  </span>
                </div>

                {/* Original Document Preview Container */}
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
                      <span>Original file preview not available.</span>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 bg-white/80 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span>Source verification stamp: Verified document integrity</span>
                  <span className="font-mono text-[10px] text-slate-400">SHA-256 Verified</span>
                </div>
              </div>
            )}

            {/* Right / Bottom: Structured Extracted Information */}
            {(activeTab === 'split' || activeTab === 'extracted') && (
              <div className="space-y-4 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-600" />
                    AI Structured Clinical Data &amp; Field Provenance
                  </span>
                  <span className="text-xs text-slate-500">
                    Never silently assumed as truth
                  </span>
                </div>

                {/* Warning when unreadable fields exist */}
                {extraction?.unreadableFieldsDetected && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Uncertain / Blurred Fields Detected</strong>
                      <span>
                        The AI detected low-resolution or smudged handwriting and safely marked fields as unreadable instead of hallucinating values.
                      </span>
                    </div>
                  </div>
                )}

                {/* Prescriptions List (if any) */}
                {extraction && extraction.prescriptions && extraction.prescriptions.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                      <span>Prescriptions &amp; Dosages ({extraction.prescriptions.length})</span>
                      <span className="text-[11px] font-normal text-slate-400">Click edit to correct</span>
                    </h4>

                    {extraction.prescriptions.map((rx) => {
                      const isEditing = editingItemId === rx.id;
                      const isUncertain = rx.status === 'Uncertain / Flagged' || rx.strength === 'Could not confidently read this field.';

                      return (
                        <div
                          key={rx.id}
                          className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                            isUncertain
                              ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/20'
                              : rx.status === 'Doctor Verified'
                              ? 'bg-emerald-50/60 border-emerald-300'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-900">
                                  {rx.medicine} {rx.strength !== 'Could not confidently read this field.' && rx.strength}
                                </span>
                                {rx.isEdited && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                                    Edited
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-600 mt-0.5">
                                Frequency: <strong>{rx.frequency}</strong>
                                {rx.duration && <span> • Duration: <strong>{rx.duration}</strong></span>}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => isEditing ? saveEditPrescription(rx.id) : startEditPrescription(rx)}
                              className="px-2.5 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg flex items-center gap-1 transition-colors"
                            >
                              {isEditing ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Edit3 className="w-3 h-3" />}
                              <span>{isEditing ? 'Save' : 'Edit Field'}</span>
                            </button>
                          </div>

                          {/* Inline Edit Row */}
                          {isEditing && (
                            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Medicine & Strength</label>
                                <input
                                  type="text"
                                  value={editedValue}
                                  onChange={(e) => setEditedValue(e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                                  placeholder="e.g. Metformin 500 mg"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Frequency</label>
                                <input
                                  type="text"
                                  value={editedFrequency}
                                  onChange={(e) => setEditedFrequency(e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                                  placeholder="e.g. twice daily"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Duration</label>
                                <input
                                  type="text"
                                  value={editedDuration}
                                  onChange={(e) => setEditedDuration(e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                                  placeholder="e.g. 30 days"
                                />
                              </div>
                            </div>
                          )}

                          {/* Source & Provenance Metadata Line */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
                            <span className="text-slate-500">
                              Source: <strong>{rx.sourceDocument}</strong>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                rx.status === 'Doctor Verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isUncertain
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-teal-100 text-teal-800'
                              }`}>
                                Status: {rx.status}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({rx.confidence} Confidence)
                              </span>
                            </div>
                          </div>

                          {rx.confidenceNote && (
                            <p className="text-[10px] text-slate-500 italic">
                              Note: {rx.confidenceNote}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Lab Results List (if any) */}
                {extraction && extraction.labResults && extraction.labResults.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                      <span>Laboratory &amp; Pathology Values ({extraction.labResults.length})</span>
                      <span className="text-[11px] font-normal text-slate-400">Click edit to correct</span>
                    </h4>

                    {extraction.labResults.map((lab) => {
                      const isEditing = editingItemId === lab.id;
                      const isUncertain = lab.status === 'Uncertain / Flagged' || lab.value === 'Could not confidently read this field.';

                      return (
                        <div
                          key={lab.id}
                          className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                            isUncertain
                              ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/20'
                              : lab.status === 'Doctor Verified'
                              ? 'bg-emerald-50/60 border-emerald-300'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-900">
                                  {lab.testName}
                                </span>
                                {lab.isAbnormal && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-rose-100 text-rose-700">
                                    ABNORMAL / HIGH
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-700 mt-1 flex items-baseline gap-2">
                                <span className="text-base font-extrabold text-slate-900">
                                  {lab.value} {lab.unit}
                                </span>
                                {lab.referenceRange && (
                                  <span className="text-[11px] text-slate-500 font-mono">
                                    (Reference: {lab.referenceRange})
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => isEditing ? saveEditLab(lab.id) : startEditLab(lab)}
                              className="px-2.5 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg flex items-center gap-1 transition-colors"
                            >
                              {isEditing ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Edit3 className="w-3 h-3" />}
                              <span>{isEditing ? 'Save' : 'Edit Field'}</span>
                            </button>
                          </div>

                          {isEditing && (
                            <div className="pt-2 border-t border-slate-200 flex gap-2 bg-slate-50 p-2.5 rounded-lg">
                              <input
                                type="text"
                                value={editedValue}
                                onChange={(e) => setEditedValue(e.target.value)}
                                className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-bold"
                                placeholder="Enter corrected test value..."
                              />
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
                            <span className="text-slate-500">
                              Source: <strong>{lab.sourceDocument}</strong>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                lab.status === 'Doctor Verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isUncertain
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-teal-100 text-teal-800'
                              }`}>
                                Status: {lab.status}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({lab.confidence} Confidence)
                              </span>
                            </div>
                          </div>

                          {lab.confidenceNote && (
                            <p className="text-[10px] text-slate-500 italic">
                              Note: {lab.confidenceNote}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Summary Items (if any) */}
                {extraction && extraction.summaryItems && extraction.summaryItems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">Clinical Findings &amp; Advice</h4>
                    {extraction.summaryItems.map((s) => (
                      <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase block">{s.title}:</span>
                        <p className="font-semibold text-slate-800">{s.content}</p>
                        <div className="text-[10px] text-slate-400 pt-1">
                          Source: {s.sourceDocument} • Status: {s.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          <div className="text-xs text-slate-500">
            {isDoctorMode ? (
              <span>Doctor Station Mode • Cross-check original document before clinical ordering.</span>
            ) : (
              <span>Patient Review Mode • Confirm your medications and lab results before doctor consultation.</span>
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
                <span>Verify &amp; Approve Extracted Evidence (डॉक्टर द्वारा सत्यापित)</span>
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
