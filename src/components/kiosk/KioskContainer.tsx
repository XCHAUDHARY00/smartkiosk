import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Layers, 
  Mic, 
  FileText, 
  CheckCircle2, 
  Sparkles,
  Volume2,
  VolumeX,
  Languages,
  RotateCcw,
  Stethoscope,
  HeartPulse,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { 
  PatientProfile, 
  QuestionAnswer, 
  UploadedDocument, 
  ClinicalSummary, 
  TriageAlert, 
  PatientFeedback, 
  LanguageCode,
  DepartmentCode
} from '../../types';
import { LanguageDropdown } from './LanguageDropdown';
import { StepIdentity } from './StepIdentity';
import { StepConsent } from './StepConsent';
import { StepDepartment } from './StepDepartment';
import { StepVoiceTouchInterview } from './StepVoiceTouchInterview';
import { StepDocumentScanner } from './StepDocumentScanner';
import { StepReviewSubmit } from './StepReviewSubmit';
import { FeedbackModal } from './FeedbackModal';
import { 
  generateClinicalSummary, 
  fetchAdaptiveQuestion, 
  getFallbackAdaptiveQuestion, 
  AdaptiveQuestionResponse 
} from '../../services/aiService';
import { 
  speakText, 
  playDoctorChime, 
  playTouchFeedback, 
  playSuccessChime, 
  playAlertChime, 
  unlockAudioSystem,
  reloadVoiceSynthesisEngine,
  DoctorVoiceGender
} from '../../services/speechService';
import { getTranslations } from '../../utils/translations';

interface KioskContainerProps {
  patient: PatientProfile;
  answers: QuestionAnswer[];
  documents: UploadedDocument[];
  summary: ClinicalSummary | null;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onUpdatePatient: (updated: Partial<PatientProfile>) => void;
  onAddAnswer: (answer: QuestionAnswer) => void;
  onAddDocument: (doc: UploadedDocument) => void;
  onRemoveDocument: (docId: string) => void;
  onUpdateSummary: (summary: ClinicalSummary) => void;
  onTriggerRedFlagAlert: (alert: Partial<TriageAlert>) => void;
  onAddFeedback: (feedback: PatientFeedback) => void;
  onResetKiosk: () => void;
}

export const KioskContainer: React.FC<KioskContainerProps> = ({
  patient,
  answers,
  documents,
  summary,
  audioEnabled,
  onToggleAudio,
  onUpdatePatient,
  onAddAnswer,
  onAddDocument,
  onRemoveDocument,
  onUpdateSummary,
  onTriggerRedFlagAlert,
  onAddFeedback,
  onResetKiosk
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [doctorVoiceGender, setDoctorVoiceGender] = useState<DoctorVoiceGender>('female');
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  const t = getTranslations(patient.language);

  // SOCRATES Sequence & Adaptive Question State in KioskContainer
  const [currentInterviewQuestion, setCurrentInterviewQuestion] = useState<AdaptiveQuestionResponse>(() => {
    if (answers.length === 0) {
      return {
        questionText: t.interview.initialQuestion,
        audioPromptText: t.interview.initialAudioPrompt,
        hindiText: t.interview.initialQuestion,
        category: 'chief_complaint',
        quickOptions: t.interview.initialOptions,
        allowVoice: true,
        isComplete: false
      };
    }
    return getFallbackAdaptiveQuestion(answers, patient.isAyushPatient, patient.language);
  });
  const [isAiLoadingInterviewQuestion, setIsAiLoadingInterviewQuestion] = useState<boolean>(false);

  // Synchronize current interview question & voice engine when patient language or profile changes
  useEffect(() => {
    reloadVoiceSynthesisEngine(patient.language).catch(() => {});

    if (answers.length === 0) {
      const currentTrans = getTranslations(patient.language);
      setCurrentInterviewQuestion({
        questionText: currentTrans.interview.initialQuestion,
        audioPromptText: currentTrans.interview.initialAudioPrompt,
        hindiText: currentTrans.interview.initialQuestion,
        category: 'chief_complaint',
        quickOptions: currentTrans.interview.initialOptions,
        allowVoice: true,
        isComplete: false
      });
    } else {
      const localized = getFallbackAdaptiveQuestion(answers, patient.isAyushPatient, patient.language);
      setCurrentInterviewQuestion({
        ...localized,
        isComplete: false
      });
    }
  }, [patient.language, patient.isAyushPatient]);

  // Reset interview question state if answers are cleared (e.g. on new patient session)
  useEffect(() => {
    if (answers.length === 0) {
      const currentTrans = getTranslations(patient.language);
      setCurrentInterviewQuestion({
        questionText: currentTrans.interview.initialQuestion,
        audioPromptText: currentTrans.interview.initialAudioPrompt,
        hindiText: currentTrans.interview.initialQuestion,
        category: 'chief_complaint',
        quickOptions: currentTrans.interview.initialOptions,
        allowVoice: true,
        isComplete: false
      });
    }
  }, [answers.length]);

  const STEPS = [
    { key: 'identity', label: t.steps.identity.label, icon: User },
    { key: 'consent', label: t.steps.consent.label, icon: ShieldCheck },
    { key: 'department', label: t.steps.department.label, icon: Layers },
    { key: 'interview', label: t.steps.interview.label, icon: Mic },
    { key: 'documents', label: t.steps.documents.label, icon: FileText },
    { key: 'review', label: t.steps.review.label, icon: CheckCircle2 }
  ];

  // Helper function to check whether a step is unlocked and accessible
  const isStepAccessible = (targetIndex: number): { allowed: boolean; reason?: string } => {
    // Step 0: Always accessible
    if (targetIndex === 0) return { allowed: true };

    // Step 1 (Consent): Requires basic identity
    const hasIdentity = Boolean(patient.name && patient.name.trim().length > 0);
    if (targetIndex === 1) {
      if (!hasIdentity) {
        return { 
          allowed: false, 
          reason: patient.language === 'hi'
            ? 'कृपया पहले मरीज पहचान (नाम) दर्ज करें।' 
            : 'Please enter patient name first.'
        };
      }
      return { allowed: true };
    }

    // Steps 2, 3, 4, 5: STRICTLY REQUIRE CONSENT SIGNED (सहमति पत्र)
    if (!patient.consentSigned) {
      return { 
        allowed: false, 
        reason: patient.language === 'hi' 
          ? '⚠️ सहमति पत्र (Consent) अनिवार्य है। जब तक मरीज सहमति स्वीकार नहीं करता, आगे के चरण और ओपीडी पर्ची अनलॉक नहीं होंगे।' 
          : '⚠️ Digital Health Consent is mandatory. Please accept the consent form before proceeding or generating the slip.'
      };
    }

    // Step 2 (Department): Allowed since consent is signed
    if (targetIndex === 2) return { allowed: true };

    // Step 3 (Interview): Requires Department
    if (targetIndex === 3) {
      if (!patient.department) {
        return { 
          allowed: false, 
          reason: patient.language === 'hi' 
            ? 'कृपया पहले ओपीडी विभाग चुनें।' 
            : 'Please select an OPD Department first.'
        };
      }
      return { allowed: true };
    }

    // Step 4 (Documents): Requires Department
    if (targetIndex === 4) {
      if (!patient.department) {
        return { 
          allowed: false, 
          reason: patient.language === 'hi' 
            ? 'कृपया पहले ओपीडी विभाग चुनें।' 
            : 'Please select an OPD Department first.'
        };
      }
      return { allowed: true };
    }

    // Step 5 (Review & Slip): Requires Department and Consent
    if (targetIndex === 5) {
      if (!patient.department) {
        return { 
          allowed: false, 
          reason: patient.language === 'hi' 
            ? 'कृपया पहले ओपीडी विभाग चुनें।' 
            : 'Please select an OPD Department first.'
        };
      }
      return { allowed: true };
    }

    return { allowed: true };
  };

  // Step transition with strict pre-validation & feedback
  const handleStepTransition = async (nextIndex: number) => {
    unlockAudioSystem();
    const accessCheck = isStepAccessible(nextIndex);

    if (!accessCheck.allowed) {
      playAlertChime();
      const reasonMsg = accessCheck.reason || 'कृपया पहले पिछले अनिवार्य चरण पूरे करें।';
      setValidationWarning(reasonMsg);

      if (audioEnabled) {
        speakText(
          reasonMsg, 
          patient.language, 
          undefined, 
          { playChime: false, gender: doctorVoiceGender }
        );
      }

      // Auto-dismiss warning after 4.5 seconds
      setTimeout(() => {
        setValidationWarning(null);
      }, 4500);

      // If consent is missing and tried to skip, route to Step 1 (Consent) or Step 0
      if (!patient.consentSigned) {
        if (!patient.name || patient.name.trim().length === 0) {
          setCurrentStepIndex(0);
        } else {
          setCurrentStepIndex(1);
        }
      }
      return;
    }

    setValidationWarning(null);

    // Auto-synthesize summary when moving to review step
    if (nextIndex === 5 && !summary) {
      const generated = await generateClinicalSummary(patient, answers, documents);
      onUpdateSummary(generated);
    }
    
    setCurrentStepIndex(nextIndex);
  };

  // Emergency red flag trigger detector for interview responses
  const checkInterviewRedFlags = (text: string) => {
    const lower = text.toLowerCase();
    const isChestPain = lower.includes('chest') || lower.includes('seene') || lower.includes('chhati') || lower.includes('heart') || lower.includes('radiation') || lower.includes('arm');
    const isBreathless = lower.includes('breath') || lower.includes('saans') || lower.includes('dum');

    if (isChestPain || isBreathless) {
      const alertMsg = 'Acute Retrosternal Chest Discomfort radiating with exertional dyspnea';
      playAlertChime();
      onTriggerRedFlagAlert({
        patientId: patient.id,
        patientName: patient.name,
        tokenNumber: patient.tokenNumber,
        severity: 'EMERGENCY_RED',
        ruleId: 'RULE_EMERGENCY_CHEST_TRIAGE',
        reason: alertMsg,
        symptomsTriggered: ['Chest pain / heaviness', 'Dyspnea', 'Radiation']
      });
    }
  };

  // Automatically triggers the AI service for the next SOCRATES question without needing user intervention
  const handleInterviewAnswerSubmit = async (answerText: string, answeredVia: 'voice' | 'touch' | 'text') => {
    if (!answerText.trim() || isAiLoadingInterviewQuestion) return;

    unlockAudioSystem();
    playTouchFeedback();
    playSuccessChime();

    const currentQText = currentInterviewQuestion.questionText || t.interview.initialQuestion;
    const newAnswer: QuestionAnswer = {
      questionId: `q_${answers.length + 1}`,
      questionText: currentQText,
      answerText: answerText.trim(),
      answeredVia,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // 1. Immediately append to database & state
    onAddAnswer(newAnswer);

    // 2. Perform emergency triage detection
    checkInterviewRedFlags(answerText.trim());

    const updatedAnswers = [...answers, newAnswer];
    const totalCount = updatedAnswers.length;

    // 3. If SOCRATES interview sequence is completed (>= 4 questions)
    if (totalCount >= 4) {
      setIsAiLoadingInterviewQuestion(true);
      try {
        // Pre-generate clinical summary with Gemini in the background
        const generatedSummary = await generateClinicalSummary(patient, updatedAnswers, documents);
        onUpdateSummary(generatedSummary);
      } catch (err) {
        console.warn('Clinical summary auto-generation error:', err);
      } finally {
        setIsAiLoadingInterviewQuestion(false);
        // Automatically advance to Step 4 (Document Scanner) without needing user intervention
        handleStepTransition(4);
      }
      return;
    }

    // 4. Automatically trigger AI service for the next question in SOCRATES sequence
    setIsAiLoadingInterviewQuestion(true);
    try {
      const chiefComplaintText = updatedAnswers[0]?.answerText || answerText;
      const nextQ = await fetchAdaptiveQuestion(
        chiefComplaintText,
        updatedAnswers,
        patient.language,
        patient.department,
        patient.isAyushPatient,
        totalCount,
        {
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          latestAnswer: answerText
        }
      );

      if (nextQ && !nextQ.isComplete) {
        setCurrentInterviewQuestion(nextQ);
      } else if (totalCount < 4) {
        // Fallback SOCRATES sequence ensures clinical continuity
        const fallbackQ = getFallbackAdaptiveQuestion(updatedAnswers, patient.isAyushPatient, patient.language);
        setCurrentInterviewQuestion({
          ...fallbackQ,
          isComplete: false
        });
      } else {
        handleStepTransition(4);
      }
    } catch (err) {
      console.warn('AI adaptive question trigger error, adopting SOCRATES fallback:', err);
      const fallbackQ = getFallbackAdaptiveQuestion(updatedAnswers, patient.isAyushPatient, patient.language);
      setCurrentInterviewQuestion({
        ...fallbackQ,
        isComplete: false
      });
    } finally {
      setIsAiLoadingInterviewQuestion(false);
    }
  };

  const handleTestVoice = () => {
    unlockAudioSystem();
    playTouchFeedback();
    const testPhrase = t.interview.initialAudioPrompt || 'Doctor AI Voice Test';
    speakText(testPhrase, patient.language, undefined, { 
      playChime: true,
      gender: doctorVoiceGender
    });
  };

  const handlePlayDoctorChimeOnly = () => {
    unlockAudioSystem();
    playDoctorChime();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Kiosk Header Bar with Language Picker & Audio Diagnostics */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Token & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm font-heading">
                {t.kioskTag}
              </span>
              <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.2 rounded-full font-mono">
                {patient.tokenNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500">{t.kioskSubTag}</p>
          </div>
        </div>

        {/* Audio Voice Diagnostics & Language Selector */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Test Doctor Voice Button */}
          <button
            type="button"
            onClick={handleTestVoice}
            title="Test Doctor Audio Voice"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer touch-target shadow-2xs"
          >
            <Volume2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Test Doctor Voice</span>
          </button>

          {/* Voice Gender Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
            <button
              onClick={() => {
                playTouchFeedback();
                setDoctorVoiceGender('female');
              }}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                doctorVoiceGender === 'female' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Female
            </button>
            <button
              onClick={() => {
                playTouchFeedback();
                setDoctorVoiceGender('male');
              }}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                doctorVoiceGender === 'male' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Male
            </button>
          </div>

          {/* 14-Language Dropdown */}
          <LanguageDropdown
            currentLanguage={patient.language}
            onLanguageChange={(lang) => onUpdatePatient({ language: lang })}
            audioEnabled={audioEnabled}
          />
        </div>

      </div>

      {/* Stepper Progress Bar - Responsive for Phone & Desktop */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs space-y-2">
        
        {/* Mobile View: Compact Progress Bar & Quick Step Switcher */}
        <div className="sm:hidden space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
                {currentStepIndex + 1}
              </span>
              <span className="text-xs font-bold text-slate-800">
                {STEPS[currentStepIndex].label}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 font-semibold">
              Step {currentStepIndex + 1} / {STEPS.length}
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-teal-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          {/* Mini step dots */}
          <div className="flex items-center justify-between pt-1">
            {STEPS.map((step, idx) => {
              const access = isStepAccessible(idx);
              const isLocked = !access.allowed;
              return (
                <button
                  key={step.key}
                  onClick={() => {
                    playTouchFeedback();
                    handleStepTransition(idx);
                  }}
                  className={`h-2.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                    idx === currentStepIndex
                      ? 'w-6 bg-teal-700'
                      : isLocked
                      ? 'w-3 bg-slate-200 opacity-60'
                      : idx < currentStepIndex
                      ? 'w-3 bg-emerald-500'
                      : 'w-3 bg-teal-200'
                  }`}
                  title={`${step.label} ${isLocked ? '(Locked - Consent Required)' : ''}`}
                />
              );
            })}
          </div>
        </div>

        {/* Desktop / Tablet View: Full Step Buttons */}
        <div className="hidden sm:flex items-center justify-between gap-2">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const access = isStepAccessible(idx);
            const isLocked = !access.allowed && idx > currentStepIndex;
            const isCompleted = idx < currentStepIndex && (idx === 1 ? patient.consentSigned : true);
            const isCurrent = idx === currentStepIndex;

            return (
              <button
                key={step.key}
                type="button"
                onClick={() => {
                  playTouchFeedback();
                  handleStepTransition(idx);
                }}
                className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-xl text-center transition-all cursor-pointer relative ${
                  isCurrent 
                    ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200' 
                    : isLocked
                    ? 'text-slate-400 opacity-60 hover:opacity-90 hover:bg-rose-50/50'
                    : isCompleted
                    ? 'text-slate-700 hover:bg-slate-50'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all relative ${
                  isCurrent 
                    ? 'bg-teal-700 text-white shadow-xs' 
                    : isLocked
                    ? 'bg-slate-100 text-slate-400 border border-slate-200'
                    : isCompleted
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  ) : isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-[11px] truncate max-w-[95px]">{step.label}</span>
                  {isLocked && <Lock className="w-2.5 h-2.5 text-slate-400 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Validation Warning Alert Toast/Banner */}
      {validationWarning && (
        <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-4 flex items-start gap-3 shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-extrabold text-rose-900 uppercase tracking-wide">
              {patient.language === 'hi' ? 'चरण अवरोधक चेतावनी (Step Validation)' : 'Workflow Validation Notice'}
            </h4>
            <p className="text-xs font-bold text-rose-800 mt-0.5">
              {validationWarning}
            </p>
          </div>
          <button
            onClick={() => setValidationWarning(null)}
            className="text-xs text-rose-600 hover:text-rose-900 font-bold px-2 py-1 bg-rose-100 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Step View Switcher */}
      {currentStepIndex === 0 && (
        <StepIdentity
          patient={patient}
          onUpdatePatient={onUpdatePatient}
          onNext={() => handleStepTransition(1)}
          audioEnabled={audioEnabled}
        />
      )}

      {currentStepIndex === 1 && (
        <StepConsent
          patient={patient}
          onUpdatePatient={onUpdatePatient}
          onNext={() => handleStepTransition(2)}
          onBack={() => handleStepTransition(0)}
          audioEnabled={audioEnabled}
        />
      )}

      {currentStepIndex === 2 && (
        <StepDepartment
          patient={patient}
          onUpdatePatient={onUpdatePatient}
          onNext={() => handleStepTransition(3)}
          onBack={() => handleStepTransition(1)}
          audioEnabled={audioEnabled}
        />
      )}

      {currentStepIndex === 3 && (
        <StepVoiceTouchInterview
          patient={patient}
          answers={answers}
          currentQuestion={currentInterviewQuestion}
          isAiLoadingNext={isAiLoadingInterviewQuestion}
          onAnswerSubmit={handleInterviewAnswerSubmit}
          onAddAnswer={onAddAnswer}
          onNext={() => handleStepTransition(4)}
          onBack={() => handleStepTransition(2)}
          onTriggerRedFlagAlert={onTriggerRedFlagAlert}
          audioEnabled={audioEnabled}
          doctorVoiceGender={doctorVoiceGender}
        />
      )}

      {currentStepIndex === 4 && (
        <StepDocumentScanner
          patient={patient}
          documents={documents}
          onAddDocument={onAddDocument}
          onRemoveDocument={onRemoveDocument}
          onNext={() => handleStepTransition(5)}
          onBack={() => handleStepTransition(3)}
          audioEnabled={audioEnabled}
        />
      )}

      {currentStepIndex === 5 && (
        <StepReviewSubmit
          patient={patient}
          answers={answers}
          documents={documents}
          summary={summary}
          onOpenFeedback={() => setShowFeedbackModal(true)}
          onResetSession={onResetKiosk}
          onBack={() => handleStepTransition(4)}
          audioEnabled={audioEnabled}
        />
      )}

      {/* Patient Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal
          tokenNumber={patient.tokenNumber}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={(fb) => onAddFeedback(fb)}
        />
      )}

    </div>
  );
};
