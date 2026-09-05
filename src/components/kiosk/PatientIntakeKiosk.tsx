import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  PatientProfile, 
  LanguageCode, 
  ClinicalSummary, 
  ConsentRecord, 
  StructuredClinicalInterview, 
  PatientDocumentRecord,
  VitalsData,
  PastVisitRecord,
  AYUSHAssessment
} from '../../types';
import { LanguageStep } from './steps/LanguageStep';
import { ConsentStep } from './steps/ConsentStep';
import { IdentityStep } from './steps/IdentityStep';
import { DepartmentStep, DEPARTMENTS, DepartmentOption } from './steps/DepartmentStep';
import { ClinicalInterviewStep } from './steps/ClinicalInterviewStep';
import { AyushAssessmentStep } from './steps/AyushAssessmentStep';
import { DocumentScannerStep } from './steps/DocumentScannerStep';
import { ReviewStep } from './steps/ReviewStep';
import { TokenQueueStep } from './steps/TokenQueueStep';
import { generateSafeToken, generateSafePatientId } from '../../utils/tokenGenerator';
import { savePatientIntake } from '../../services/api';
import { generateClinicalSummaryAI } from '../../services/geminiService';
import { getTranslations } from '../../utils/translations';
import { 
  Globe, 
  ShieldCheck, 
  User, 
  Building2, 
  Stethoscope, 
  Leaf,
  FileText, 
  CheckCircle2, 
  Ticket,
  ChevronRight,
  RotateCcw,
  Eye
} from 'lucide-react';

interface PatientIntakeKioskProps {
  onPatientEnrolled: (patient: PatientProfile, summary: ClinicalSummary) => void;
  language: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  onOpenNavigator?: () => void;
  easyMode?: boolean;
  onToggleEasyMode?: () => void;
}

export type KioskStepKey = 
  | 'language' 
  | 'consent' 
  | 'identity' 
  | 'department' 
  | 'interview' 
  | 'ayush' 
  | 'documents' 
  | 'review' 
  | 'token';

export const PatientIntakeKiosk: React.FC<PatientIntakeKioskProps> = ({
  onPatientEnrolled,
  language: initialLanguage,
  onLanguageChange,
  onOpenNavigator,
  easyMode = false,
  onToggleEasyMode
}) => {
  const [activeStepKey, setActiveStepKey] = useState<KioskStepKey>('language');
  const [kioskLanguage, setKioskLanguage] = useState<LanguageCode>(initialLanguage);

  // Patient Intake State Draft
  const [consent, setConsent] = useState<ConsentRecord | null>(null);
  
  const [identityData, setIdentityData] = useState<{
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    phone: string;
    abhaId?: string;
    vitals?: VitalsData;
    pastVisits?: PastVisitRecord[];
  }>({
    name: '',
    age: 40,
    gender: 'Male',
    phone: '',
    abhaId: undefined,
    vitals: undefined,
    pastVisits: []
  });

  const [selectedDept, setSelectedDept] = useState<DepartmentOption>(DEPARTMENTS[0]);
  const [clinicalInterview, setClinicalInterview] = useState<StructuredClinicalInterview | null>(null);
  const [ayushAssessment, setAyushAssessment] = useState<AYUSHAssessment | null>(null);
  const [documents, setDocuments] = useState<PatientDocumentRecord[]>([]);

  // Final registered patient encounter record
  const [registeredPatient, setRegisteredPatient] = useState<PatientProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Determine if active department is AYUSH
  const isAyushDepartment = 
    selectedDept.category === 'AYUSH' || 
    selectedDept.id === 'ayurveda' || 
    selectedDept.name.toLowerCase().includes('ayush') || 
    selectedDept.name.toLowerCase().includes('ayurveda');

  // Dynamic step sequence based on department category
  const stepSequence: Array<{ key: KioskStepKey; label: string; hindi: string; icon: any }> = isAyushDepartment
    ? [
        { key: 'language', label: 'Language', hindi: 'भाषा', icon: Globe },
        { key: 'consent', label: 'Consent', hindi: 'सहमति', icon: ShieldCheck },
        { key: 'identity', label: 'Identity', hindi: 'पहचान', icon: User },
        { key: 'department', label: 'Department', hindi: 'विभाग', icon: Building2 },
        { key: 'interview', label: 'Interview', hindi: 'लक्षण', icon: Stethoscope },
        { key: 'ayush', label: 'AYUSH Assessment', hindi: 'आयुष मूल्यांकन', icon: Leaf },
        { key: 'documents', label: 'Documents', hindi: 'दस्तावेज़', icon: FileText },
        { key: 'review', label: 'Review', hindi: 'समीक्षा', icon: CheckCircle2 },
        { key: 'token', label: 'Token & Queue', hindi: 'टोकन', icon: Ticket }
      ]
    : [
        { key: 'language', label: 'Language', hindi: 'भाषा', icon: Globe },
        { key: 'consent', label: 'Consent', hindi: 'सहमति', icon: ShieldCheck },
        { key: 'identity', label: 'Identity', hindi: 'पहचान', icon: User },
        { key: 'department', label: 'Department', hindi: 'विभाग', icon: Building2 },
        { key: 'interview', label: 'Interview', hindi: 'लक्षण', icon: Stethoscope },
        { key: 'documents', label: 'Documents', hindi: 'दस्तावेज़', icon: FileText },
        { key: 'review', label: 'Review', hindi: 'समीक्षा', icon: CheckCircle2 },
        { key: 'token', label: 'Token & Queue', hindi: 'टोकन', icon: Ticket }
      ];

  const currentStepIndex = stepSequence.findIndex(s => s.key === activeStepKey);

  // Handle language change
  const handleSelectLanguage = (lang: LanguageCode) => {
    setKioskLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  // Idle Session Management (90-second inactivity auto-cleanup to protect patient privacy)
  const IDLE_TIMEOUT_SECONDS = 90;
  const [secondsUntilReset, setSecondsUntilReset] = useState<number>(IDLE_TIMEOUT_SECONDS);
  const lastActivityRef = useRef<number>(Date.now());

  const resetActivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setSecondsUntilReset(IDLE_TIMEOUT_SECONDS);
  }, []);

  // Reset entire journey for next patient & clear temporary state
  const handleResetKiosk = useCallback(() => {
    setActiveStepKey('language');
    setConsent(null);
    setIdentityData({
      name: '',
      age: 40,
      gender: 'Male',
      phone: '',
      abhaId: undefined,
      vitals: undefined,
      pastVisits: []
    });
    setSelectedDept(DEPARTMENTS[0]);
    setClinicalInterview(null);
    setAyushAssessment(null);
    setDocuments([]);
    setRegisteredPatient(null);
    setIsSubmitting(false);
    resetActivityTimer();
  }, [resetActivityTimer]);

  // Activity listener for 90s idle timeout
  useEffect(() => {
    if (activeStepKey === 'language') return;

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    const handleUserActivity = () => {
      resetActivityTimer();
    };

    events.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, IDLE_TIMEOUT_SECONDS - elapsed);
      setSecondsUntilReset(remaining);

      if (remaining <= 0) {
        console.warn('⏱️ Kiosk session idle timeout reached (90s). Purging temporary draft & resetting kiosk.');
        handleResetKiosk();
      }
    }, 1000);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleUserActivity));
      clearInterval(interval);
    };
  }, [activeStepKey, handleResetKiosk, resetActivityTimer]);

  // Step Navigation Helper
  const handleNavigateStep = (target: KioskStepKey | number | string) => {
    if (typeof target === 'string') {
      if (stepSequence.some(s => s.key === target)) {
        setActiveStepKey(target as KioskStepKey);
        return;
      }
    }
    if (typeof target === 'number') {
      const found = stepSequence[target - 1];
      if (found) {
        setActiveStepKey(found.key);
      }
    }
  };

  // Final Submission & Safe Token Generation
  const handleSubmitEncounter = async () => {
    setIsSubmitting(true);

    try {
      // 1. Generate unique token safely
      const tokenNumber = generateSafeToken(selectedDept.name);
      const patientId = generateSafePatientId();

      // 2. Create ONE encounter record with initial status = 'Waiting'
      const newPatient: PatientProfile = {
        id: patientId,
        tokenNumber,
        name: identityData.name.trim() || 'OPD Patient',
        age: identityData.age,
        gender: identityData.gender,
        phone: identityData.phone,
        abhaId: identityData.abhaId,
        language: kioskLanguage,
        department: selectedDept.name,
        assignedCabin: selectedDept.cabin,
        registeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Waiting',
        consent: consent || {
          granted: true,
          timestamp: new Date().toISOString(),
          purposeVersion: 'CARESAAR-OPD-INTAKE-v2026.1'
        },
        vitals: identityData.vitals,
        pastVisits: identityData.pastVisits || [],
        chiefComplaintTranscript: clinicalInterview?.chiefComplaint || 'General OPD Health Checkup',
        chiefComplaintHindi: clinicalInterview?.chiefComplaint,
        clinicalInterview: clinicalInterview || undefined,
        ayushAssessment: isAyushDepartment ? (ayushAssessment || undefined) : undefined,
        documents: documents.length > 0 ? documents : undefined
      };

      // 3. Save to database / API layer
      await savePatientIntake(newPatient);

      // 4. Generate AI triage summary
      const clinicalSummary = await generateClinicalSummaryAI(
        newPatient,
        clinicalInterview?.chiefComplaint || 'General OPD Examination'
      );

      // 5. Trigger confetti effect
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // silent fallback
      }

      setRegisteredPatient(newPatient);
      setActiveStepKey('token');

      // Notify parent app
      onPatientEnrolled(newPatient, clinicalSummary);
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const t = getTranslations(kioskLanguage);
  const getLocalizedStepName = (key: KioskStepKey): string => {
    switch (key) {
      case 'language': return t.selectLanguage || 'भाषा (Language)';
      case 'consent': return t.steps?.consent?.label || 'सहमति (Consent)';
      case 'identity': return t.steps?.identity?.label || 'पहचान (Identity)';
      case 'department': return t.steps?.department?.label || 'विभाग (Department)';
      case 'interview': return t.steps?.interview?.label || 'लक्षण (Interview)';
      case 'ayush': return 'आयुष मूल्यांकन (AYUSH)';
      case 'documents': return t.steps?.documents?.label || 'दस्तावेज़ (Documents)';
      case 'review': return t.steps?.review?.label || 'समीक्षा (Review)';
      case 'token': return t.assignedToken || 'टोकन (Token)';
      default: return key;
    }
  };

  return (
    <div className="space-y-6">
      {/* Kiosk Session Bar: Clean Privacy & Auto-Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs text-slate-700 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span className="font-bold text-slate-900 text-sm">
            {t.identity?.secureSession || (kioskLanguage === 'hi' ? 'सुरक्षित मरीज सत्र' : 'Secure Patient Session')}
          </span>
          {activeStepKey !== 'language' && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium">
                Auto-reset: <strong className={secondsUntilReset < 20 ? 'text-red-600 font-bold' : 'text-slate-900'}>{secondsUntilReset}s</strong>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeStepKey !== 'language' && (
            <button
              type="button"
              onClick={handleResetKiosk}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 hover:border-red-300 rounded-xl font-bold transition-colors shadow-xs cursor-pointer"
              title="Clear all inputs and reset for next patient"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>{kioskLanguage === 'hi' ? 'नया मरीज (Reset)' : 'Reset Kiosk'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Calm Hospital-Appropriate Stepper & Progress Indicator */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span className="text-teal-900 text-sm">
            {`${currentStepIndex + 1} / ${stepSequence.length}: ${getLocalizedStepName(stepSequence[currentStepIndex]?.key)}`}
          </span>
          <span className="text-slate-500">
            {Math.round(((currentStepIndex + 1) / stepSequence.length) * 100)}% {kioskLanguage === 'hi' ? 'पूर्ण' : 'Complete'}
          </span>
        </div>

        {/* Quiet Hospital Teal Progress Line */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-teal-800 transition-all duration-300 rounded-full"
            style={{ width: `${((currentStepIndex + 1) / stepSequence.length) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 text-xs pt-1">
          {stepSequence.map((s, idx) => {
            const Icon = s.icon;
            const isCurrent = activeStepKey === s.key;
            const isCompleted = currentStepIndex > idx;
            const isClickable = isCompleted || s.key === 'review';

            return (
              <button
                key={s.key}
                type="button"
                disabled={!isClickable && !isCurrent}
                onClick={() => isClickable && setActiveStepKey(s.key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 min-h-[44px] ${
                  isCurrent
                    ? 'bg-teal-800 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-teal-50 text-teal-900 hover:bg-teal-100 border border-teal-200 cursor-pointer'
                    : 'text-slate-400 bg-slate-50 border border-slate-200 opacity-60 cursor-not-allowed'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{getLocalizedStepName(s.key)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP: LANGUAGE */}
      {activeStepKey === 'language' && (
        <LanguageStep
          selectedLanguage={kioskLanguage}
          onSelectLanguage={handleSelectLanguage}
          onNext={() => setActiveStepKey('consent')}
          easyMode={easyMode}
        />
      )}

      {/* STEP: CONSENT (Happens BEFORE collecting clinical info) */}
      {activeStepKey === 'consent' && (
        <ConsentStep
          consent={consent}
          onConsentChange={setConsent}
          onNext={() => setActiveStepKey('identity')}
          onBack={() => setActiveStepKey('language')}
          language={kioskLanguage}
          easyMode={easyMode}
        />
      )}

      {/* STEP: IDENTITY */}
      {activeStepKey === 'identity' && (
        <IdentityStep
          initialData={identityData}
          onSaveIdentity={(data) => setIdentityData(data)}
          onNext={() => setActiveStepKey('department')}
          onBack={() => setActiveStepKey('consent')}
          language={kioskLanguage}
          easyMode={easyMode}
        />
      )}

      {/* STEP: DEPARTMENT */}
      {activeStepKey === 'department' && (
        <DepartmentStep
          selectedDepartment={selectedDept.name}
          onSelectDepartment={(dept) => {
            setSelectedDept(dept);
            if (dept.category !== 'AYUSH' && dept.id !== 'ayurveda') {
              setAyushAssessment(null);
            }
          }}
          onNext={() => setActiveStepKey('interview')}
          onBack={() => setActiveStepKey('identity')}
          language={kioskLanguage}
          easyMode={easyMode}
        />
      )}

      {/* STEP: CLINICAL INTERVIEW */}
      {activeStepKey === 'interview' && (
        <ClinicalInterviewStep
          initialInterview={clinicalInterview || undefined}
          onSaveInterview={setClinicalInterview}
          onNext={() => {
            if (isAyushDepartment) {
              setActiveStepKey('ayush');
            } else {
              setActiveStepKey('documents');
            }
          }}
          onBack={() => setActiveStepKey('department')}
          language={kioskLanguage}
          patientDraft={{
            name: identityData.name,
            age: identityData.age,
            gender: identityData.gender,
            department: selectedDept.name,
            vitals: identityData.vitals
          }}
          easyMode={easyMode}
        />
      )}

      {/* DEDICATED AYUSH ASSESSMENT STEP (Only for AYUSH / Ayurveda Departments) */}
      {activeStepKey === 'ayush' && isAyushDepartment && (
        <AyushAssessmentStep
          initialAssessment={ayushAssessment || undefined}
          clinicalInterview={clinicalInterview}
          onSaveAssessment={setAyushAssessment}
          onNext={() => setActiveStepKey('documents')}
          onBack={() => setActiveStepKey('interview')}
          language={kioskLanguage}
          patientDraft={{
            name: identityData.name,
            age: identityData.age,
            gender: identityData.gender,
            department: selectedDept.name,
            chiefComplaint: clinicalInterview?.chiefComplaint
          }}
          easyMode={easyMode}
        />
      )}

      {/* STEP: DOCUMENTS (OCR scanner & editable extraction) */}
      {activeStepKey === 'documents' && (
        <DocumentScannerStep
          documents={documents}
          onSaveDocuments={setDocuments}
          onNext={() => setActiveStepKey('review')}
          onBack={() => {
            if (isAyushDepartment) {
              setActiveStepKey('ayush');
            } else {
              setActiveStepKey('interview');
            }
          }}
          language={kioskLanguage}
          easyMode={easyMode}
        />
      )}

      {/* STEP: REVIEW */}
      {activeStepKey === 'review' && (
        <ReviewStep
          patientDraft={{
            ...identityData,
            department: selectedDept.name,
            assignedCabin: selectedDept.cabin,
            chiefComplaintTranscript: clinicalInterview?.chiefComplaint
          }}
          consent={consent}
          interview={clinicalInterview}
          ayushAssessment={isAyushDepartment ? ayushAssessment : null}
          documents={documents}
          onNavigateToStep={handleNavigateStep}
          onSubmit={handleSubmitEncounter}
          isSubmitting={isSubmitting}
          language={kioskLanguage}
          easyMode={easyMode}
        />
      )}

      {/* STEP: TOKEN / QUEUE */}
      {activeStepKey === 'token' && registeredPatient && (
        <TokenQueueStep
          patient={registeredPatient}
          onUpdatePatient={setRegisteredPatient}
          onResetKiosk={handleResetKiosk}
          onOpenNavigator={onOpenNavigator || (() => {})}
          language={kioskLanguage}
          easyMode={easyMode}
        />
      )}
    </div>
  );
};

