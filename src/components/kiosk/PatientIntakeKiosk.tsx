import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';

interface PatientIntakeKioskProps {
  onPatientEnrolled: (patient: PatientProfile, summary: ClinicalSummary) => void;
  language: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  onOpenNavigator?: () => void;
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
  onOpenNavigator
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

  // Reset entire journey for next patient
  const handleResetKiosk = () => {
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
  };

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

  return (
    <div className="space-y-6">
      {/* Dynamic Multi-Stage Breadcrumb / Stepper */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-1 sm:gap-2 text-xs">
          {stepSequence.map((s, idx) => {
            const Icon = s.icon;
            const isCurrent = activeStepKey === s.key;
            const isCompleted = currentStepIndex > idx;
            const isClickable = isCompleted || s.key === 'review';

            return (
              <React.Fragment key={s.key}>
                <button
                  type="button"
                  disabled={!isClickable && !isCurrent}
                  onClick={() => isClickable && setActiveStepKey(s.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap shrink-0 ${
                    isCurrent
                      ? s.key === 'ayush'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs ring-2 ring-emerald-200'
                        : 'bg-teal-600 text-white font-bold shadow-xs'
                      : isCompleted
                      ? 'bg-teal-50 text-teal-800 hover:bg-teal-100 cursor-pointer'
                      : 'text-slate-400 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {kioskLanguage === 'hi' ? s.hindi : s.label}
                  </span>
                </button>

                {idx < stepSequence.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 hidden sm:inline-block" />
                )}
              </React.Fragment>
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
        />
      )}

      {/* STEP: DEPARTMENT */}
      {activeStepKey === 'department' && (
        <DepartmentStep
          selectedDepartment={selectedDept.name}
          onSelectDepartment={(dept) => {
            setSelectedDept(dept);
            // If switched away from AYUSH, reset ayushAssessment
            if (dept.category !== 'AYUSH' && dept.id !== 'ayurveda') {
              setAyushAssessment(null);
            }
          }}
          onNext={() => setActiveStepKey('interview')}
          onBack={() => setActiveStepKey('identity')}
          language={kioskLanguage}
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
        />
      )}
    </div>
  );
};

