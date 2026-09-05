import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Download, 
  Printer, 
  Sparkles, 
  ArrowLeft, 
  FileText, 
  RotateCcw, 
  Star,
  ShieldCheck,
  User,
  Heart,
  Send,
  Share2,
  QrCode,
  Check,
  Copy,
  Building2,
  Calendar
} from 'lucide-react';
import { PatientProfile, QuestionAnswer, UploadedDocument, ClinicalSummary } from '../../types';
import { downloadPatientClinicalPDF } from '../../services/pdfExportService';
import { pushSummaryToHIS } from '../../services/aiService';
import { speakText, playDoctorChime, playTouchFeedback, playSuccessChime, unlockAudioSystem } from '../../services/speechService';
import { getTranslations } from '../../utils/translations';
import { AppLogo } from '../common/AppLogo';
import { PrintableConsultationSlip } from '../common/PrintableConsultationSlip';
import { translateSymptomToClinicalEnglish } from '../../utils/medicalTransliterator';

interface StepReviewSubmitProps {
  patient: PatientProfile;
  answers: QuestionAnswer[];
  documents: UploadedDocument[];
  summary: ClinicalSummary | null;
  onOpenFeedback: () => void;
  onResetSession: () => void;
  onBack: () => void;
  audioEnabled: boolean;
}

export const StepReviewSubmit: React.FC<StepReviewSubmitProps> = ({
  patient,
  answers,
  documents,
  summary,
  onOpenFeedback,
  onResetSession,
  onBack,
  audioEnabled
}) => {
  const [isSubmittedToHIS, setIsSubmittedToHIS] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDigitalPassModal, setShowDigitalPassModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  const [showSlipPreview, setShowSlipPreview] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const t = getTranslations(patient.language);

  // Translate chief complaint to clinical English for consistent display
  const rawChiefComplaint = summary?.chiefComplaint || answers[0]?.answerText || 'General Health Intake';
  const displayChiefComplaint = translateSymptomToClinicalEnglish(rawChiefComplaint);

  const handleConfirmSubmit = async () => {
    unlockAudioSystem();
    playTouchFeedback();
    setIsSubmitting(true);

    await pushSummaryToHIS(summary?.id || 'sum_1', patient.id, patient.tokenNumber);
    setIsSubmitting(false);
    setIsSubmittedToHIS(true);
    playSuccessChime();

    if (audioEnabled) {
      const phrase = `${t.review.audioPhrase} ${patient.tokenNumber}.`;
      speakText(phrase, patient.language, undefined, { playChime: true });
    }
  };

  // Robust Mobile PDF / Slip Download & Web Share
  const handleDownloadPDF = async () => {
    unlockAudioSystem();
    playTouchFeedback();
    setIsDownloadingPdf(true);
    try {
      await downloadPatientClinicalPDF({ patient, summary, documents });
      setDownloadSuccessMessage(
        patient.language === 'hi' 
          ? 'पर्ची (OPD Slip) डाउनलोड हो गई है!' 
          : 'OPD Slip Downloaded successfully!'
      );
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    } catch (err) {
      console.warn('PDF download fallback to digital pass:', err);
      setShowDigitalPassModal(true);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Web Share API: Works great on Android APK to share directly to WhatsApp or Files
  const handleShareSlip = async () => {
    unlockAudioSystem();
    playTouchFeedback();
    
    const slipText = `🏥 *SMART OPD INTAKE SLIP*\n` +
      `👤 *Patient:* ${patient.name} (${patient.age}Y/${patient.gender})\n` +
      `🎫 *Token:* ${patient.tokenNumber}\n` +
      `🏢 *Dept:* ${patient.department.replace('_', ' ').toUpperCase()}\n` +
      `🩺 *Room:* OPD Counter #102\n` +
      `📋 *Chief Complaint:* ${summary?.chiefComplaint || answers[0]?.answerText || 'General Health Intake'}\n` +
      `📅 *Date:* ${new Date().toLocaleDateString()}`;

    if ((window as any).AndroidApp && typeof (window as any).AndroidApp.shareTokenSlip === 'function') {
      try {
        (window as any).AndroidApp.shareTokenSlip(slipText);
        return;
      } catch (err) {
        console.warn('Native AndroidApp share failed, falling back:', err);
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `OPD Token Slip - ${patient.tokenNumber}`,
          text: slipText,
        });
      } catch (err) {
        console.warn('Share cancelled or failed, opening pass modal:', err);
        setShowDigitalPassModal(true);
      }
    } else {
      setShowDigitalPassModal(true);
    }
  };

  const handleCopySlipText = () => {
    const slipText = `🏥 SMART OPD INTAKE SLIP\nPatient: ${patient.name} (${patient.age}Y/${patient.gender})\nToken: ${patient.tokenNumber}\nDept: ${patient.department.toUpperCase()}\nDate: ${new Date().toLocaleDateString()}`;
    navigator.clipboard.writeText(slipText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
      
      {/* Header with Token Confirmation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              {t.review.submittedSuccess}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            {t.review.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.review.subtitle}
          </p>
        </div>

        {/* Big Digital Token Badge */}
        <div className="bg-gradient-to-tr from-teal-800 to-emerald-700 text-white rounded-3xl p-5 text-center shadow-lg min-w-[160px] flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-200 block mb-0.5">
            {t.assignedToken}
          </span>
          <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight">
            {patient.tokenNumber}
          </span>
          <span className="text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full mt-2 font-medium">
            Room #102 • OPD
          </span>
        </div>
      </div>

      {/* Success Download Alert */}
      {downloadSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 font-bold text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{downloadSuccessMessage}</span>
        </div>
      )}

      {/* Slip Details Card */}
      <div className="bg-slate-50 rounded-3xl p-5 sm:p-6 border border-slate-200 space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-slate-200">
          <div>
            <span className="text-slate-400 font-bold uppercase block text-[10px]">{t.identity.fullName}</span>
            <span className="font-bold text-slate-900 text-sm sm:text-base">{patient.name} ({patient.age}Y / {patient.gender})</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block text-[10px]">{t.department.title}</span>
            <span className="font-bold text-teal-800 text-sm sm:text-base">{t.department.deptLabels[patient.department] || patient.department}</span>
          </div>
        </div>

        <div>
          <span className="text-slate-400 font-bold uppercase block text-[10px] mb-1">{t.review.chiefComplaint}</span>
          <p className="font-semibold text-slate-800 bg-white p-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm">
            {displayChiefComplaint}
          </p>
        </div>

        <div>
          <span className="text-slate-400 font-bold uppercase block text-[10px] mb-1">{t.review.doctorBrief}</span>
          <p className="text-slate-700 leading-relaxed bg-white p-3.5 rounded-2xl border border-slate-200 text-xs">
            {summary?.historyOfPresentIllness || 'Patient symptoms recorded and structured via AI kiosk interview.'}
          </p>
        </div>
      </div>

      {/* Slip Preview Toggle */}
      <div className="flex items-center justify-between bg-teal-50/70 p-3.5 rounded-2xl border border-teal-200">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-700" />
          <span className="text-xs font-bold text-teal-900">
            Official ABDM Consultation Slip
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowSlipPreview(!showSlipPreview)}
          className="text-xs font-extrabold text-teal-700 hover:text-teal-900 underline cursor-pointer"
        >
          {showSlipPreview ? 'Hide Preview' : 'Show Full Slip Preview'}
        </button>
      </div>

      {/* Expandable Live Slip Preview for Kiosk Attendant / Patient */}
      {showSlipPreview && (
        <div className="p-3 sm:p-5 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto animate-in fade-in">
          <PrintableConsultationSlip
            patient={patient}
            summary={summary}
            className="shadow-sm"
          />
        </div>
      )}

      {/* Hidden container always mounted for html2canvas & browser window.print() */}
      {!showSlipPreview && (
        <div className="hidden print:block">
          <PrintableConsultationSlip
            patient={patient}
            summary={summary}
            id="opd-consultation-slip-printable"
          />
        </div>
      )}

      {/* Action Buttons: Download PDF, Print, Share to WhatsApp, Digital Pass, Push to HIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* Transmit to HIS */}
        <button
          type="button"
          onClick={handleConfirmSubmit}
          disabled={isSubmittedToHIS || isSubmitting}
          className="p-4 rounded-2xl bg-teal-700 hover:bg-teal-800 disabled:bg-emerald-600 text-white font-bold text-xs flex flex-col items-center justify-center gap-2 shadow-sm transition-all cursor-pointer touch-target active:scale-95"
        >
          {isSubmittedToHIS ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Transmitted to HIS</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>{isSubmitting ? t.loading : t.review.confirmSubmit}</span>
            </>
          )}
        </button>

        {/* Download PDF / Slip */}
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={isDownloadingPdf}
          className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-2 shadow-sm transition-all cursor-pointer touch-target active:scale-95"
        >
          <Download className="w-5 h-5 text-teal-400" />
          <span>{isDownloadingPdf ? 'Generating PDF...' : t.review.downloadPdf}</span>
        </button>

        {/* Direct Print Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex flex-col items-center justify-center gap-2 shadow-sm transition-all cursor-pointer touch-target active:scale-95"
        >
          <Printer className="w-5 h-5 text-slate-700" />
          <span>Print Slip</span>
        </button>

        {/* Share Slip / WhatsApp (Mobile Friendly) */}
        <button
          type="button"
          onClick={handleShareSlip}
          className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-2 shadow-sm transition-all cursor-pointer touch-target active:scale-95"
        >
          <Share2 className="w-5 h-5 text-emerald-200" />
          <span>WhatsApp / Share</span>
        </button>

        {/* Digital Pass / QR View */}
        <button
          type="button"
          onClick={() => setShowDigitalPassModal(true)}
          className="p-4 rounded-2xl bg-teal-50 hover:bg-teal-100 border border-teal-300 text-teal-950 font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all cursor-pointer touch-target active:scale-95"
        >
          <QrCode className="w-5 h-5 text-teal-700" />
          <span>View Digital Pass</span>
        </button>

      </div>

      {/* Feedback Card Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onOpenFeedback}
          className="w-full p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer touch-target"
        >
          <Star className="w-5 h-5 text-amber-500 fill-current" />
          <span>{t.review.feedbackButton}</span>
        </button>
      </div>

      {/* Navigation / Next Patient Reset */}
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
          onClick={onResetSession}
          className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all cursor-pointer touch-target active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Next Patient (New Session)</span>
        </button>
      </div>

      {/* Digital OPD Pass Modal (Works on all mobile devices & APKs flawlessly) */}
      {showDigitalPassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 border border-slate-200 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="text-center border-b border-slate-100 pb-3 flex flex-col items-center">
              <AppLogo variant="icon" size="lg" animate={true} className="mb-1" />
              <h3 className="font-extrabold text-slate-900 text-base font-heading mt-1">
                SMART OPD Digital Token Pass
              </h3>
              <p className="text-[11px] text-slate-500">
                Show this digital card at Room #102 or OPD Counter
              </p>
            </div>

            {/* Token Highlight */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Assigned Token Number
              </span>
              <div className="text-4xl font-extrabold text-teal-800 font-mono">
                {patient.tokenNumber}
              </div>
              <div className="text-xs font-semibold text-slate-700 pt-1">
                {patient.name} • {patient.age}Y / {patient.gender}
              </div>
              <div className="text-[11px] text-teal-700 font-bold">
                Dept: {patient.department.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            {/* Simulated QR Code Graphic */}
            <div className="flex flex-col items-center justify-center p-3 bg-white border border-dashed border-slate-300 rounded-2xl">
              <QrCode className="w-24 h-24 text-slate-800" />
              <span className="text-[10px] text-slate-400 mt-1 font-mono">
                ABHA / OPD ID: {patient.abhaId || `ABDM-${patient.tokenNumber}`}
              </span>
            </div>

            {/* Action Buttons inside Modal */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopySlipText}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Copied!' : 'Copy Slip'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowDigitalPassModal(false)}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Close (बंद करें)
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
