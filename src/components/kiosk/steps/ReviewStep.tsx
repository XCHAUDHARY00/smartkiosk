import React from 'react';
import { 
  CheckCircle2, 
  Edit3, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Building2, 
  Stethoscope, 
  FileText, 
  ShieldCheck, 
  Clock, 
  HeartPulse, 
  Pill, 
  AlertTriangle,
  Send,
  Leaf,
  Sparkles,
  Flame,
  Waves,
  Compass,
  Moon
} from 'lucide-react';
import { 
  PatientProfile, 
  LanguageCode, 
  ConsentRecord, 
  StructuredClinicalInterview, 
  PatientDocumentRecord,
  AYUSHAssessment
} from '../../../types';

interface ReviewStepProps {
  patientDraft: Partial<PatientProfile>;
  consent: ConsentRecord | null;
  interview: StructuredClinicalInterview | null;
  ayushAssessment?: AYUSHAssessment | null;
  documents: PatientDocumentRecord[];
  onNavigateToStep: (step: any) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  language: LanguageCode;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  patientDraft,
  consent,
  interview,
  ayushAssessment,
  documents,
  onNavigateToStep,
  onSubmit,
  isSubmitting,
  language
}) => {

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/80 text-teal-800 text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Step 7 of 9 • चरण 7 (समीक्षा)
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
          {language === 'hi' ? 'विवरण की अंतिम समीक्षा (Review Before Submission)' : 'Review Case Details Before Submission'}
        </h2>
        <p className="text-sm text-slate-500">
          {language === 'hi'
            ? 'कृपया सभी जानकारियों की जांच कर लें। किसी भी विवरण को बदलने हेतु "बदलें (Edit)" बटन दबाएं।'
            : 'Please confirm all information before token generation. You can make corrections anytime.'}
        </p>
      </div>

      <div className="space-y-4">
        {/* 1. Identity & Vitals Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              <span>1. Patient Identity & Contact (पहचान विवरण)</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateToStep('identity')}
              className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              <span>बदलें (Edit)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Full Name:</span>
              <span className="font-extrabold text-slate-900 text-sm">{patientDraft.name || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Age & Gender:</span>
              <span className="font-bold text-slate-800">{patientDraft.age} yrs • {patientDraft.gender}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Mobile Number:</span>
              <span className="font-bold text-slate-800 font-mono">+91 {patientDraft.phone || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">ABHA ID:</span>
              <span className="font-bold text-slate-800 font-mono">
                {patientDraft.abhaId ? patientDraft.abhaId : <span className="text-slate-400 font-sans italic">Not provided</span>}
              </span>
            </div>
          </div>

          {/* Vitals Summary */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 block mb-1">
              Triage Vitals Check:
            </span>
            {patientDraft.vitals ? (
              <div className="flex flex-wrap gap-2 text-xs">
                {patientDraft.vitals.bloodPressure && (
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-mono">
                    BP: <strong>{patientDraft.vitals.bloodPressure}</strong>
                  </span>
                )}
                {patientDraft.vitals.pulse && (
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-mono">
                    Pulse: <strong>{patientDraft.vitals.pulse} bpm</strong>
                  </span>
                )}
                {patientDraft.vitals.spo2 && (
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-mono">
                    SpO2: <strong>{patientDraft.vitals.spo2}%</strong>
                  </span>
                )}
                {patientDraft.vitals.temperature && (
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-mono">
                    Temp: <strong>{patientDraft.vitals.temperature}°F</strong>
                  </span>
                )}
                {patientDraft.vitals.bloodSugar && (
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-mono">
                    Sugar: <strong>{patientDraft.vitals.bloodSugar} mg/dL</strong>
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">
                No vitals measured at intake kiosk (will be checked during consultation).
              </span>
            )}
          </div>
        </div>

        {/* 2. Department Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>2. Selected Department & OPD Cabin (चयनित विभाग)</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateToStep('department')}
              className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              <span>बदलें (Edit)</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-extrabold text-slate-900 text-sm block">
                {patientDraft.department || 'General Medicine'}
              </span>
              <span className="text-slate-500">
                Assigned Consultation Room: <strong>{patientDraft.assignedCabin || 'Cabin 102'}</strong>
              </span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-bold self-start sm:self-auto">
              Queue Token Prefix: {patientDraft.department?.toUpperCase().slice(0, 3) || 'GEN'}
            </div>
          </div>
        </div>

        {/* 3. Clinical Interview Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>3. Clinical Interview & Case Findings (लक्षण एवं केस हिस्ट्री)</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateToStep('interview')}
              className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              <span>बदलें (Edit)</span>
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Chief Complaint:</span>
              <p className="font-bold text-slate-900 text-sm leading-snug">
                "{interview?.chiefComplaint || patientDraft.chiefComplaintTranscript || 'General OPD Health Checkup'}"
              </p>
              {interview?.historyOfPresentIllness && (
                <p className="text-slate-600 text-xs italic pt-1 border-t border-slate-200/60">
                  {interview.historyOfPresentIllness}
                </p>
              )}
              <div className="flex gap-4 mt-2 pt-2 border-t border-slate-200/60 text-slate-600">
                <span>Duration: <strong>{interview?.duration || 'Recent'}</strong></span>
                <span>Severity: <strong>{interview?.severity || 5} / 10</strong></span>
              </div>
            </div>

            {/* Red Flags Banner if detected */}
            {interview?.redFlags && interview.redFlags.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl space-y-1">
                <span className="text-[11px] font-extrabold text-rose-900 uppercase tracking-wider block">
                  ⚠️ Priority Clinical Red Flags Detected:
                </span>
                <div className="flex flex-wrap gap-1">
                  {interview.redFlags.map((rf, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-rose-100 text-rose-900 font-bold rounded text-[11px]">
                      {rf}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {((interview?.associatedSymptoms && interview.associatedSymptoms.length > 0) || (interview?.symptoms && interview.symptoms.length > 0)) && (
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1">Reported Symptoms:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(interview?.associatedSymptoms || interview?.symptoms || []).map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-teal-50 text-teal-900 border border-teal-200 rounded font-medium text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Current Medications:</span>
                <span className="text-slate-800 font-medium">
                  {Array.isArray(interview?.medications) ? interview.medications.join(', ') : (interview?.medications || 'None reported')}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Allergies:</span>
                <span className="text-rose-700 font-bold">
                  {Array.isArray(interview?.allergies) ? interview.allergies.join(', ') : (interview?.allergies || 'No Known Drug Allergies (NKDA)')}
                </span>
              </div>
            </div>

            {interview?.pastMedicalHistory && interview.pastMedicalHistory.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Past Medical History:</span>
                <span className="text-slate-700 font-medium">
                  {Array.isArray(interview.pastMedicalHistory) ? interview.pastMedicalHistory.join(', ') : interview.pastMedicalHistory}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dedicated AYUSH Assessment Card (Displayed for AYUSH encounters) */}
        {ayushAssessment && (
          <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <span>AYUSH Constitutional &amp; Lifestyle Intake (आयुष मूल्यांकन)</span>
                  </h3>
                  <span className="text-[11px] text-emerald-800 font-semibold block">
                    दशविध परीक्षा व प्रकृति घटक • Vaidya OPD Cabin 105
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToStep('ayush')}
                className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>बदलें (Edit)</span>
              </button>
            </div>

            {/* 3-Way Provenance Badges (Strict User Requirement) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200">
                <span className="px-1.5 py-0.5 rounded bg-teal-200 text-teal-900 font-extrabold text-[9px] uppercase tracking-wider block mb-1">
                  1. PATIENT PROVIDED
                </span>
                <p className="text-slate-700">
                  {ayushAssessment.additionalParameters?.patientProvidedResponses?.length || 0} self-reported responses recorded via adaptive intake.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
                <span className="px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900 font-extrabold text-[9px] uppercase tracking-wider block mb-1">
                  2. AI STRUCTURED
                </span>
                <p className="text-slate-700">
                  Agni ({ayushAssessment.agni?.agniType?.split('(')[0].trim() || 'Sama'}), Koshtha ({ayushAssessment.koshtha?.koshthaType?.split('(')[0].trim() || 'Madhyama'}), Nidra.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-extrabold text-[9px] uppercase tracking-wider block mb-1">
                  3. DOCTOR VERIFIED
                </span>
                <p className="text-amber-900 font-semibold">
                  Pending Nadi Pariksha &amp; Vaidya physical validation in Cabin 105.
                </p>
              </div>
            </div>

            {/* Parameter Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-600" />
                  <span>अग्नि (Agni)</span>
                </span>
                <strong className="text-slate-900 block truncate">{ayushAssessment.agni?.agniType?.split('(')[0] || 'Sama'}</strong>
                <span className="text-[11px] text-slate-600 block truncate">{ayushAssessment.agni?.postMealComfort || 'Normal'}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Waves className="w-3 h-3 text-teal-600" />
                  <span>कोष्ठ (Koshtha)</span>
                </span>
                <strong className="text-slate-900 block truncate">{ayushAssessment.koshtha?.koshthaType?.split('(')[0] || 'Madhyama'}</strong>
                <span className="text-[11px] text-slate-600 block truncate">{ayushAssessment.koshtha?.bowelHabits || 'Regular'}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Compass className="w-3 h-3 text-indigo-600" />
                  <span>तापमान अनुकूलता</span>
                </span>
                <strong className="text-slate-900 block truncate">{ayushAssessment.prakriti?.thermalTolerance?.split('(')[0] || 'Balanced'}</strong>
                <span className="text-[11px] text-slate-600 block truncate">{ayushAssessment.prakriti?.dominantDoshaTendency || 'Sama'}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Moon className="w-3 h-3 text-violet-600" />
                  <span>निद्रा (Nidra)</span>
                </span>
                <strong className="text-slate-900 block truncate">{ayushAssessment.nidra?.quality?.split('(')[0] || 'Sound'}</strong>
                <span className="text-[11px] text-slate-600 block truncate">{ayushAssessment.nidra?.wakingFeeling || 'Fresh'}</span>
              </div>
            </div>

            {/* Non-Diagnostic Disclaimer */}
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {ayushAssessment.additionalParameters?.disclaimer ||
                  'AI Structured Patient History - Not a Medical Diagnosis. Treatment & Nadi examination will be conducted by Vaidya.'}
              </span>
            </div>
          </div>
        )}

        {/* 4. Documents & Consent Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>4. Medical Documents ({documents.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigateToStep('documents')}
                className="px-2 py-0.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded"
              >
                Inspect / Edit
              </button>
            </div>
            {documents.length > 0 ? (
              <div className="space-y-2 text-xs">
                {documents.map((d, i) => {
                  const prescCount = d.structuredExtraction?.prescriptions?.length || 0;
                  const labCount = d.structuredExtraction?.labResults?.length || 0;
                  const hasUnreadable = d.structuredExtraction?.unreadableFieldsDetected;

                  return (
                    <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 truncate max-w-[200px]">
                          {d.structuredExtraction?.documentTypeLabel || d.extractedData?.documentType || d.fileName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {d.documentTimelineStage}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500">
                        <span>
                          {prescCount > 0 && `${prescCount} Meds`}
                          {prescCount > 0 && labCount > 0 && ' • '}
                          {labCount > 0 && `${labCount} Lab Tests`}
                          {prescCount === 0 && labCount === 0 && 'Clinical Summary'}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                          d.doctorVerification?.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : hasUnreadable
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}>
                          {d.doctorVerification?.status === 'VERIFIED' ? 'Doctor Verified' : 'AI Extracted — Review Ready'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic block py-2">
                No past medical documents attached.
              </span>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>5. Consent Status</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigateToStep('consent')}
                className="px-2 py-0.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded"
              >
                Edit
              </button>
            </div>
            <div className="text-xs space-y-1 text-slate-700">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Consent Granted by Patient</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Version: {consent?.purposeVersion || 'CARESAAR-OPD-INTAKE-v2026.1'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Timestamp: {consent?.timestamp ? new Date(consent.timestamp).toLocaleString() : 'Just now'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => onNavigateToStep('documents')}
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>पीछे (Back to Documents)</span>
        </button>

        <button
          id="btn-confirm-submit-encounter"
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-base rounded-xl shadow-lg transition-all flex items-center gap-3 hover:scale-[1.02]"
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>पंजीकरण एवं टोकन जनरेट हो रहा है...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>केस सबमिट करें एवं ओपीडी टोकन प्राप्त करें (Submit &amp; Get Token)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
