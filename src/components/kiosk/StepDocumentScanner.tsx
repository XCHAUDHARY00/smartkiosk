import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
  Volume2,
  X,
  RefreshCw,
  Image as ImageIcon,
  ShieldCheck,
  Zap,
  Clock,
  User,
  Stethoscope,
  Pill,
  AlertCircle,
  Plus,
  Check
} from 'lucide-react';
import { PatientProfile, UploadedDocument, PastVisit } from '../../types';
import { processDocumentOCR } from '../../services/aiService';
import { speakText, playTouchFeedback, playSuccessChime, playDoctorChime, unlockAudioSystem } from '../../services/speechService';
import { getTranslations } from '../../utils/translations';
import { fetchPatientHistoryByPhone } from '../../services/dbService';

interface StepDocumentScannerProps {
  patient: PatientProfile;
  documents: UploadedDocument[];
  onAddDocument: (doc: UploadedDocument) => void;
  onRemoveDocument: (docId: string) => void;
  onNext: () => void;
  onBack: () => void;
  audioEnabled: boolean;
}

export const StepDocumentScanner: React.FC<StepDocumentScannerProps> = ({
  patient,
  documents,
  onAddDocument,
  onRemoveDocument,
  onNext,
  onBack,
  audioEnabled
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Phone-based past prescription history states
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [phoneHistory, setPhoneHistory] = useState<PastVisit[]>([]);
  const [hasCheckedHistory, setHasCheckedHistory] = useState(false);
  const [attachedVisitIds, setAttachedVisitIds] = useState<string[]>([]);
  const [showAllPastVisits, setShowAllPastVisits] = useState(false);

  const t = getTranslations(patient.language);

  // Auto-detect past prescription & medicine history on basis of patient mobile number
  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      const cleanPhone = (patient.mobile || '').replace(/\D/g, '').slice(-10);
      if (!cleanPhone || cleanPhone.length < 7) {
        setHasCheckedHistory(true);
        setPhoneHistory([]);
        return;
      }

      setIsLoadingHistory(true);
      try {
        const res = await fetchPatientHistoryByPhone(cleanPhone);
        if (isMounted) {
          setPhoneHistory(res.history || []);
          setHasCheckedHistory(true);
          
          // If history is detected and user hasn't uploaded docs, announce voice guidance
          if (res.hasHistory && res.history.length > 0 && audioEnabled) {
            const prompt = patient.language === 'hi'
              ? `आपके फोन नंबर पर पुराना अस्पताल पर्चा व दवा रिकॉर्ड मिला है। आप चाहें तो इसे सीधे जोड़ सकते हैं।`
              : `Your past hospital prescription and medicine records were found. You can auto-attach them with one tap.`;
            speakText(prompt, patient.language, undefined, { playChime: true });
          }
        }
      } catch (err) {
        console.warn('Error querying past history by phone:', err);
        if (isMounted) {
          setHasCheckedHistory(true);
        }
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false);
        }
      }
    };

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [patient.mobile]);

  // Handle auto-attaching a past visit prescription
  const handleAttachPastPrescription = (visit: PastVisit) => {
    unlockAudioSystem();
    playTouchFeedback();

    const docId = `doc_hist_${visit.id}`;
    // Check if already attached
    if (documents.some(d => d.id === docId || d.fileName.includes(visit.visitDate))) {
      return;
    }

    const pastDoc: UploadedDocument = {
      id: docId,
      patientId: patient.id,
      fileName: visit.prescriptionDoc?.fileName || `Hospital_Past_Prescription_${visit.visitDate}.pdf`,
      fileType: 'prescription',
      extractedText: `[Past Hospital Record Attached]\nDate: ${visit.visitDate}\nTreating Doctor: ${visit.doctorName}\nDepartment: ${visit.department}\nOld Problem: ${visit.oldProblem || visit.chiefComplaint || 'Consultation'}\nDiagnoses: ${(visit.diagnoses || []).join(', ')}\nDiagnosis Type: ${visit.diagnosisType || 'Clinical OPD'}\nMedications Taken: ${(visit.treatments || []).join(', ')}\nClinical Notes: ${visit.clinicalNotes || 'Previous hospital visit record linked.'}`,
      extractedMedications: visit.treatments || [],
      extractedDiagnosis: visit.diagnoses || [],
      confidenceScore: 0.98,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onAddDocument(pastDoc);
    setAttachedVisitIds(prev => [...prev, visit.id]);
    playSuccessChime();

    if (audioEnabled) {
      speakText(
        patient.language === 'hi'
          ? 'आपका पुराना पर्चा और दवाइयों का रिकॉर्ड जोड़ दिया गया है।'
          : 'Your previous prescription and medicine records have been attached.',
        patient.language,
        undefined,
        { playChime: true }
      );
    }
  };

  // Play audio help instructions
  const handlePlayAudioHelp = () => {
    unlockAudioSystem();
    playTouchFeedback();
    const helpPhrase = patient.language === 'hi'
      ? 'कृपया अपनी पुरानी पर्ची, दवा का पर्चा या खून की जांच रिपोर्ट की फोटो खींचें या फोन से अपलोड करें। एआई तुरंत आपकी दवाइयां पढ़ लेगा।'
      : 'Please take a photo of your old prescription or lab test report, or upload from your device. AI will extract medications automatically.';
    speakText(helpPhrase, patient.language, undefined, { playChime: true });
  };

  // Start live webcam / mobile camera modal
  const handleOpenLiveCamera = async () => {
    unlockAudioSystem();
    playTouchFeedback();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      setShowLiveCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.warn('Live camera stream not supported or denied, triggering native camera input:', err);
      // Fallback to native capture input
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

  const handleCloseLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowLiveCamera(false);
  };

  const handleCaptureLivePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    playTouchFeedback();
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      
      handleCloseLiveCamera();
      setIsProcessing(true);

      // Convert dataUrl to a blob/file for OCR
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `Prescription_Camera_${Date.now().toString().slice(-4)}.jpg`, { type: 'image/jpeg' });
      
      const doc = await processDocumentOCR(file);
      onAddDocument({ ...doc, previewUrl: dataUrl });
      setIsProcessing(false);
      playSuccessChime();

      if (audioEnabled) {
        speakText(
          patient.language === 'hi' 
            ? 'पर्चे की फोटो सफलतापूर्वक स्कैन हो गई है।' 
            : 'Prescription photo successfully scanned.', 
          patient.language, 
          undefined, 
          { playChime: true }
        );
      }
    }
  };

  const handleSimulateBenchmark = async (type: 'prescription' | 'lab_report') => {
    unlockAudioSystem();
    playTouchFeedback();
    setIsProcessing(true);

    const fileName = type === 'prescription' 
      ? `Hospital_OPD_Prescription_${Date.now().toString().slice(-4)}.jpg`
      : `Lipid_Profile_Report_${Date.now().toString().slice(-4)}.pdf`;

    const doc = await processDocumentOCR({ name: fileName, type });
    onAddDocument(doc);
    setIsProcessing(false);
    playSuccessChime();

    if (audioEnabled) {
      speakText(t.scanner.audioPhrase, patient.language, undefined, { playChime: true });
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    unlockAudioSystem();
    playTouchFeedback();
    setIsProcessing(true);

    const doc = await processDocumentOCR(file);
    onAddDocument(doc);
    setIsProcessing(false);
    playSuccessChime();

    if (audioEnabled) {
      speakText(t.scanner.audioPhrase, patient.language, undefined, { playChime: true });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
      
      {/* Hidden file inputs for direct camera and gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Header with Voice Help Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading flex items-center gap-2">
            <span>{t.scanner.title}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
              OCR + AI
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.scanner.subtitle}
          </p>
        </div>

        {/* Voice Assistant Help Guide */}
        <button
          type="button"
          onClick={handlePlayAudioHelp}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 touch-target self-start sm:self-auto"
        >
          <Volume2 className="w-4 h-4 text-amber-600 animate-bounce" />
          <span>🔊 बोलकर सहायता (Voice Help)</span>
        </button>
      </div>

      {/* Phone History Auto-Suggestion / Past Record Check */}
      {isLoadingHistory && (
        <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 flex items-center gap-3 text-teal-900 text-xs font-semibold animate-pulse">
          <RefreshCw className="w-4 h-4 text-teal-600 animate-spin" />
          <span>
            {patient.language === 'hi' 
              ? `फोन नंबर +91 ${patient.mobile} का पुराना अस्पताल व दवा रिकॉर्ड खोजा जा रहा है...` 
              : `Searching past hospital & prescription records for +91 ${patient.mobile}...`}
          </span>
        </div>
      )}

      {/* 1. If History Found: Automatically Suggest Past Prescription */}
      {!isLoadingHistory && hasCheckedHistory && phoneHistory.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-teal-500 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                  <span>
                    {patient.language === 'hi' 
                      ? 'आपका पुराना पर्चा व दवा रिकॉर्ड मिला' 
                      : 'Past Prescription & Medicine Record Found'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-200 text-teal-900">
                    {phoneHistory.length} {phoneHistory.length === 1 ? 'Record' : 'Records'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {patient.language === 'hi' 
                    ? `फोन नंबर +91 ${patient.mobile} के आधार पर अस्पताल रिकॉर्ड से सुझाई गई पुरानी पर्ची`
                    : `Automatically retrieved from hospital history for mobile +91 ${patient.mobile}`}
                </p>
              </div>
            </div>

            {phoneHistory.length > 1 && (
              <button
                type="button"
                onClick={() => setShowAllPastVisits(!showAllPastVisits)}
                className="text-xs font-bold text-teal-800 hover:text-teal-950 underline cursor-pointer self-start sm:self-auto"
              >
                {showAllPastVisits ? 'Show Latest Only' : `View All (${phoneHistory.length})`}
              </button>
            )}
          </div>

          {/* Primary / Latest Suggested Record Card */}
          {(showAllPastVisits ? phoneHistory : [phoneHistory[0]]).map((visit, index) => {
            const isAttached = documents.some(
              d => d.id === `doc_hist_${visit.id}` || d.fileName.includes(visit.visitDate)
            ) || attachedVisitIds.includes(visit.id);

            return (
              <div key={visit.id || index} className="p-4 sm:p-5 rounded-2xl bg-white border border-teal-300 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-900 font-bold text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-700" />
                        <span>{visit.visitDate}</span>
                      </span>
                      {visit.diagnosisType && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs border border-amber-200">
                          {visit.diagnosisType}
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-2 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-teal-700" />
                      <span>{visit.doctorName}</span>
                      <span className="text-xs text-slate-500 font-normal">({visit.department})</span>
                    </h4>

                    {/* Old Problem / Chief Complaint */}
                    {(visit.oldProblem || visit.chiefComplaint) && (
                      <p className="text-xs text-slate-700 mt-1">
                        <strong className="text-slate-900 font-semibold">
                          {patient.language === 'hi' ? 'पुरानी समस्या (Old Problem): ' : 'Old Problem: '}
                        </strong>
                        {visit.oldProblem || visit.chiefComplaint}
                      </p>
                    )}

                    {/* Diagnosis */}
                    {visit.diagnoses && visit.diagnoses.length > 0 && (
                      <div className="text-xs text-slate-700 mt-1">
                        <strong className="text-slate-900 font-semibold">
                          {patient.language === 'hi' ? 'डायग्नोसिस (Diagnosis): ' : 'Diagnosis: '}
                        </strong>
                        <span className="font-semibold text-teal-950">{visit.diagnoses.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Auto-suggest Action Button */}
                  <div className="sm:self-center shrink-0">
                    {isAttached ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                        <Check className="w-4 h-4 text-emerald-700" />
                        <span>
                          {patient.language === 'hi' ? 'पर्चा जुड़ा हुआ है (Attached)' : 'Prescription Attached'}
                        </span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAttachPastPrescription(visit)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer touch-target"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>
                          {patient.language === 'hi' 
                            ? '✨ यह पुराना पर्चा जोड़ें (Use Past Prescription)' 
                            : '✨ Auto-Use Past Prescription'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Past Medicines Taken */}
                {visit.treatments && visit.treatments.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5 text-teal-600" />
                      <span>{patient.language === 'hi' ? 'पिछली दवाइयां (Medicines Taken):' : 'Medicines Taken previously:'}</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {visit.treatments.map((med, mIdx) => (
                        <span key={mIdx} className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 flex items-center gap-1">
                          <span className="text-teal-700">💊</span>
                          <span>{med}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Diagnostic Highlights */}
                {visit.keyDiagnosisHighlights && visit.keyDiagnosisHighlights.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mr-1">
                      {patient.language === 'hi' ? 'मुख्य बिंदु (Key Highlights):' : 'Key Highlights:'}
                    </span>
                    {visit.keyDiagnosisHighlights.map((hl, hlIdx) => (
                      <span key={hlIdx} className="text-[11px] font-medium text-slate-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        • {hl}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. If History Not Available: Show Past Medicine Record Not Available */}
      {!isLoadingHistory && hasCheckedHistory && phoneHistory.length === 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-bold font-heading text-amber-900 flex items-center gap-1.5">
              <span>Past medicine record not available</span>
              <span className="text-xs font-semibold text-amber-700">(पिछला दवा रिकॉर्ड उपलब्ध नहीं है)</span>
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              {patient.language === 'hi'
                ? `फोन नंबर +91 ${patient.mobile || 'दर्ज नंबर'} के लिए कोई पूर्व ओपीडी पर्चा या दवा इतिहास उपलब्ध नहीं है। आप नीचे दिए गए कैमरे से नया पर्चा खींच सकते हैं या बिना पर्चे के सीधे आगे बढ़ सकते हैं।`
                : `No previous hospital prescription or medicine history found for mobile +91 ${patient.mobile || 'entered number'}. Please capture a photo of your prescription below, or proceed directly.`}
            </p>
          </div>
        </div>
      )}

      {/* Primary Action Buttons: Phone Camera vs Gallery Upload */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Camera Button */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={handleOpenLiveCamera}
          className="p-6 rounded-3xl border-2 border-teal-500 bg-gradient-to-br from-teal-50 to-emerald-50/60 hover:border-teal-600 transition-all flex flex-col items-center justify-center text-center cursor-pointer group shadow-sm active:scale-98 touch-target"
        >
          <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-md">
            <Camera className="w-7 h-7" />
          </div>
          <span className="font-bold text-teal-950 text-base font-heading">
            {patient.language === 'hi' ? 'कैमरे से फोटो खींचें (Take Photo)' : 'Take Photo with Camera'}
          </span>
          <span className="text-xs text-teal-700 mt-1">
            {patient.language === 'hi' ? 'फोन कैमरे से पुराना पर्चा स्कैन करें' : 'Capture prescription or lab test directly'}
          </span>
        </button>

        {/* Gallery / File Upload */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => fileInputRef.current?.click()}
          className="p-6 rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100/90 transition-all flex flex-col items-center justify-center text-center cursor-pointer group shadow-xs active:scale-98 touch-target"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-md">
            <UploadCloud className="w-7 h-7" />
          </div>
          <span className="font-bold text-slate-900 text-base font-heading">
            {patient.language === 'hi' ? 'गैलरी / फाइल से चुनें (Choose File)' : 'Choose from Gallery / Files'}
          </span>
          <span className="text-xs text-slate-500 mt-1">
            JPG, PNG, PDF supported
          </span>
        </button>

      </div>

      {/* Quick Benchmark Sample Selector for Fast Demos */}
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>{patient.language === 'hi' ? 'डेमो पर्चा लोड करें:' : 'Quick Demo Samples:'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSimulateBenchmark('prescription')}
            disabled={isProcessing}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold shadow-xs cursor-pointer"
          >
            📋 Demo Prescription
          </button>
          <button
            type="button"
            onClick={() => handleSimulateBenchmark('lab_report')}
            disabled={isProcessing}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold shadow-xs cursor-pointer"
          >
            🧪 Demo Blood Report
          </button>
        </div>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="p-5 bg-teal-50 rounded-2xl border border-teal-300 flex items-center justify-center gap-3 text-teal-900 font-bold text-xs sm:text-sm animate-pulse shadow-xs">
          <Sparkles className="w-6 h-6 text-teal-600 animate-spin" />
          <span>AI पर्चे की दवाइयाँ और टेस्ट रिपोर्ट पढ़ रहा है (Extracting Clinical Data)...</span>
        </div>
      )}

      {/* Uploaded Documents List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t.scanner.title} ({documents.length})
          </span>
          {documents.length > 0 && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              ✓ Ready for Doctor
            </span>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">
              {patient.language === 'hi' 
                ? 'यदि आपके पास कोई पुराना पर्चा नहीं है, तो आप नीचे दिए गए बटन से सीधे आगे बढ़ सकते हैं।'
                : 'No documents attached yet. You can scan now or proceed directly.'}
            </p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs sm:text-sm">{doc.fileName}</span>
                    <span className="text-[10px] text-slate-500">{doc.uploadedAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Digitized ({Math.round(doc.confidenceScore * 100)}%)
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveDocument(doc.id)}
                    className="text-slate-400 hover:text-red-600 cursor-pointer p-1.5 rounded-lg hover:bg-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {doc.extractedText && (
                <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 leading-relaxed max-h-24 overflow-y-auto">
                  {doc.extractedText}
                </div>
              )}

              {doc.extractedMedications && doc.extractedMedications.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                    {t.scanner.extractedMeds}:
                  </span>
                  {doc.extractedMedications.map((m, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-teal-100 text-teal-900 rounded-lg font-bold text-[11px] border border-teal-300 flex items-center gap-1">
                      <span>💊</span> {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            playTouchFeedback();
            onBack();
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm cursor-pointer touch-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playTouchFeedback();
            onNext();
          }}
          className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-teal-800 hover:bg-teal-900 text-white transition-all shadow-md active:scale-95 touch-target cursor-pointer"
        >
          <span>{documents.length > 0 ? t.scanner.nextReview : 'Skip / Next (आगे बढ़ें)'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Live Camera Viewfinder Modal */}
      {showLiveCamera && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in">
          
          <div className="w-full max-w-lg flex items-center justify-between text-white py-2">
            <span className="font-bold text-sm flex items-center gap-2">
              <Camera className="w-5 h-5 text-teal-400" />
              <span>Align Prescription in Frame • पर्चा सीधा रखें</span>
            </span>
            <button
              type="button"
              onClick={handleCloseLiveCamera}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Camera Frame */}
          <div className="relative w-full max-w-lg aspect-4/3 rounded-3xl overflow-hidden bg-black border-2 border-teal-400/80 shadow-2xl flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Camera Overlay Guide Box */}
            <div className="absolute inset-6 border-2 border-dashed border-white/60 rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="text-[11px] text-white/80 bg-black/60 px-3 py-1 rounded-full font-bold">
                Prescription / Report Area
              </span>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Bottom Capture Controls */}
          <div className="w-full max-w-lg flex items-center justify-center gap-6 py-4">
            <button
              type="button"
              onClick={handleCaptureLivePhoto}
              className="w-20 h-20 rounded-full bg-white text-teal-900 border-4 border-teal-500 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-teal-600 flex items-center justify-center">
                <Camera className="w-7 h-7 text-white" />
              </div>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
