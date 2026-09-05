import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Leaf, 
  Sparkles, 
  Utensils, 
  Flame, 
  TrendingDown, 
  Activity, 
  Moon, 
  Sun, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  FileCheck2, 
  ShieldCheck, 
  HelpCircle, 
  Info, 
  Clock, 
  Compass, 
  HeartHandshake,
  Waves,
  RefreshCw,
  Brain,
  Smartphone,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  AYUSHAssessment, 
  LanguageCode, 
  StructuredClinicalInterview 
} from '../../../types';
import { 
  AyushQuestionItem, 
  AyushDialogueEntry, 
  AYUSH_QUESTION_BANK, 
  getNextAyushQuestion, 
  compileAyushAssessment 
} from '../../../services/ayushAssessmentService';

interface AyushAssessmentStepProps {
  initialAssessment?: AYUSHAssessment;
  clinicalInterview?: StructuredClinicalInterview | null;
  onSaveAssessment: (assessment: AYUSHAssessment) => void;
  onNext: () => void;
  onBack: () => void;
  language: LanguageCode;
  patientDraft?: {
    name?: string;
    age?: number;
    gender?: string;
    department?: string;
    chiefComplaint?: string;
  };
}

// Icon resolver helper
const renderOptionIcon = (iconName: string, isSelected: boolean) => {
  const baseClass = `w-7 h-7 sm:w-8 sm:h-8 shrink-0 transition-colors ${
    isSelected ? 'text-amber-600' : 'text-slate-600'
  }`;
  switch (iconName) {
    case 'Utensils': return <Utensils className={baseClass} />;
    case 'TrendingDown': return <TrendingDown className={baseClass} />;
    case 'Flame': return <Flame className={baseClass} />;
    case 'Activity': return <Activity className={baseClass} />;
    case 'Waves': return <Waves className={baseClass} />;
    case 'RefreshCw': return <RefreshCw className={baseClass} />;
    case 'ThermometerSnowflake': return <Compass className={baseClass} />;
    case 'Sun': return <Sun className={baseClass} />;
    case 'Compass': return <Compass className={baseClass} />;
    case 'Moon': return <Moon className={baseClass} />;
    case 'Brain': return <Brain className={baseClass} />;
    case 'Smartphone': return <Smartphone className={baseClass} />;
    case 'HeartHandshake': return <HeartHandshake className={baseClass} />;
    case 'AlertTriangle': return <AlertTriangle className={baseClass} />;
    default: return <Sparkles className={baseClass} />;
  }
};

export const AyushAssessmentStep: React.FC<AyushAssessmentStepProps> = ({
  initialAssessment,
  clinicalInterview,
  onSaveAssessment,
  onNext,
  onBack,
  language,
  patientDraft
}) => {
  const isHindi = language === 'hi';

  // Dialogue History of answered AYUSH questions
  const [history, setHistory] = useState<AyushDialogueEntry[]>([]);
  // Current active question
  const [currentQuestion, setCurrentQuestion] = useState<AyushQuestionItem>(AYUSH_QUESTION_BANK.agni_baseline);
  // Selected option for active question
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  // Completed assessment
  const [compiledAssessment, setCompiledAssessment] = useState<AYUSHAssessment | null>(initialAssessment || null);
  const [isCompleted, setIsCompleted] = useState<boolean>(Boolean(initialAssessment));

  // Active view tab in completed view: 'ai_structured' | 'patient_provided' | 'doctor_verification'
  const [activeProvenanceTab, setActiveProvenanceTab] = useState<'ai_structured' | 'patient_provided' | 'doctor_verification'>('ai_structured');

  // Text-To-Speech for elderly / low-literacy users
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const isTtsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speakText = useCallback((text: string) => {
    if (!isTtsSupported) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.90; // Slightly measured, distinct pace for elderly patients
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsSpeaking(false);
    }
  }, [isTtsSupported, language]);

  const stopSpeaking = useCallback(() => {
    if (isTtsSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isTtsSupported]);

  // Read aloud active question on change if desired
  const handleHearQuestion = () => {
    const textToSpeak = isHindi ? currentQuestion.questionHindi : currentQuestion.questionEnglish;
    speakText(textToSpeak);
  };

  // Submit Answer & Dynamically branch to next relevant question
  const handleSelectAndAdvance = (optionId: string) => {
    setSelectedOptionId(optionId);
    stopSpeaking();

    const selectedOption = currentQuestion.options.find(o => o.id === optionId);
    if (!selectedOption) return;

    const newEntry: AyushDialogueEntry = {
      questionNumber: history.length + 1,
      category: currentQuestion.category,
      questionText: isHindi ? currentQuestion.questionHindi : currentQuestion.questionEnglish,
      questionEnglish: currentQuestion.questionEnglish,
      selectedOptionId: optionId,
      answerText: isHindi ? selectedOption.labelHindi : selectedOption.labelEnglish,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      parameterTag: selectedOption.mappedParameter
    };

    const updatedHistory = [...history, newEntry];
    setHistory(updatedHistory);

    // Evaluate next adaptive question
    const nextQuestion = getNextAyushQuestion(updatedHistory, currentQuestion.id);

    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
      setSelectedOptionId(null);
    } else {
      // Completed all relevant questions
      const compiled = compileAyushAssessment(updatedHistory, {
        name: patientDraft?.name,
        age: patientDraft?.age,
        gender: patientDraft?.gender,
        department: patientDraft?.department,
        chiefComplaint: clinicalInterview?.chiefComplaint || patientDraft?.chiefComplaint
      });
      setCompiledAssessment(compiled);
      setIsCompleted(true);
      onSaveAssessment(compiled);
    }
  };

  // Skip / "I don't know" handling
  const handleSkipQuestion = () => {
    stopSpeaking();
    const newEntry: AyushDialogueEntry = {
      questionNumber: history.length + 1,
      category: currentQuestion.category,
      questionText: isHindi ? currentQuestion.questionHindi : currentQuestion.questionEnglish,
      questionEnglish: currentQuestion.questionEnglish,
      selectedOptionId: 'skipped',
      answerText: isHindi ? 'अनिश्चित / नहीं पता (Skipped)' : 'Unsure / Skipped',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      parameterTag: 'Skipped'
    };

    const updatedHistory = [...history, newEntry];
    setHistory(updatedHistory);

    const nextQuestion = getNextAyushQuestion(updatedHistory, currentQuestion.id);
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
      setSelectedOptionId(null);
    } else {
      const compiled = compileAyushAssessment(updatedHistory, patientDraft);
      setCompiledAssessment(compiled);
      setIsCompleted(true);
      onSaveAssessment(compiled);
    }
  };

  // Allow patient to finish early
  const handleFinishEarly = () => {
    stopSpeaking();
    const compiled = compileAyushAssessment(history, patientDraft);
    setCompiledAssessment(compiled);
    setIsCompleted(true);
    onSaveAssessment(compiled);
  };

  const handleRestartAssessment = () => {
    stopSpeaking();
    setHistory([]);
    setCurrentQuestion(AYUSH_QUESTION_BANK.agni_baseline);
    setSelectedOptionId(null);
    setIsCompleted(false);
  };

  const handleConfirmAndProceed = () => {
    stopSpeaking();
    if (compiledAssessment) {
      onSaveAssessment(compiledAssessment);
      onNext();
    }
  };

  // Step indicator count: typically 3 to 5 adaptive questions
  const totalSuggestedSteps = 4;
  const progressPercent = Math.min(100, Math.round(((history.length + 1) / totalSuggestedSteps) * 100));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-900 text-xs font-bold uppercase tracking-wider">
          <Leaf className="w-3.5 h-3.5 text-emerald-700" />
          <span>AYUSH OPD Intake • आयुष क्लिनिकल मूल्यांकन (प्रकृति, अग्नि व कोष्ठ)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
          {isHindi ? 'आयुर्वेद क्लिनिकल एवं प्रकृति मूल्यांकन' : 'Ayurvedic Constitutional & Lifestyle Intake'}
        </h2>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          {isHindi
            ? 'आपकी अग्नि (पाचन), कोष्ठ (पेट साफ होना), निद्रा एवं दिनचर्या का संक्षिप्त विवरण। बड़े बटनों पर टैप कर आसानी से उत्तर दें।'
            : 'Evaluating digestive metabolic fire (Agni), bowel tendencies (Koshtha), sleep, and daily routine for the attending Vaidya.'}
        </p>
      </div>

      {/* Non-Diagnostic Disclaimer Box */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 shadow-2xs">
        <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs text-amber-900 space-y-0.5 leading-relaxed">
          <span className="font-extrabold block">
            {isHindi ? 'महत्वपूर्ण सूचना (क्लिनिकल सीमाएं):' : 'Clinical Intake Protocol (Non-Diagnostic):'}
          </span>
          <p>
            {isHindi
              ? 'यह प्रणाली केवल आपके द्वारा दी गई जानकारी को व्यवस्थित (Structure) करती है। यह कोई अंतिम आयुर्वेदिक निदान या नुस्खा नहीं है। अंतिम नाड़ी परीक्षा एवं निदान ओपीडी केबिन 105 में उपस्थित वैद्य द्वारा किया जाएगा।'
              : 'This digital intake strictly structures patient-reported constitutional observations. It does not provide a definitive Ayurvedic medical diagnosis or prescription. Final diagnosis and Nadi Pariksha will be performed by the consulting Vaidya.'}
          </p>
        </div>
      </div>

      {/* ACTIVE QUESTION VIEW */}
      {!isCompleted ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Progress Indicator */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <Clock className="w-4 h-4 text-emerald-600" />
                {isHindi 
                  ? `प्रश्न ${history.length + 1} (अनुकूली आयुष मूल्यांकन)` 
                  : `Question ${history.length + 1} (Adaptive AYUSH Intake)`}
              </span>
              <span className="text-slate-400 font-mono">
                {progressPercent}% Complete
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Single Question Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/30 shadow-md space-y-6 relative overflow-hidden">
            {/* Question Header & Audio Button */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 block">
                  {isHindi ? 'दशविध परीक्षा संबंधित प्रश्न' : 'Constitutional Parameter Inquiry'}
                </span>
                <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 leading-snug">
                  "{isHindi ? currentQuestion.questionHindi : currentQuestion.questionEnglish}"
                </h3>
                {language !== 'en' && (
                  <p className="text-sm font-medium text-slate-500 italic">
                    English: "{currentQuestion.questionEnglish}"
                  </p>
                )}
                <p className="text-xs text-slate-500 pt-1">
                  {isHindi ? currentQuestion.helperTextHindi : currentQuestion.helperTextEnglish}
                </p>
              </div>

              {/* TTS Listen Button */}
              {isTtsSupported && (
                <button
                  type="button"
                  onClick={isSpeaking ? stopSpeaking : handleHearQuestion}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-2xs transition-all ${
                    isSpeaking 
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                  title={isSpeaking ? 'Stop speaking' : 'Hear question aloud'}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4 text-amber-700" />
                      <span>{isHindi ? 'रोकें (Stop)' : 'Stop'}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-emerald-700" />
                      <span>{isHindi ? 'प्रश्न सुनें (Listen)' : 'Hear Question'}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Large Accessible Touch Buttons (Specially crafted for elderly/low-literacy users) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectAndAdvance(option.id)}
                    className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-4 shadow-xs group ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/90 ring-4 ring-emerald-100'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-emerald-50/40 hover:border-emerald-300'
                    }`}
                  >
                    <div className={`p-3 rounded-xl transition-colors ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-700 group-hover:bg-emerald-100'
                    }`}>
                      {renderOptionIcon(option.icon, isSelected)}
                    </div>

                    <div className="space-y-1 flex-1">
                      <span className="font-extrabold text-base sm:text-lg text-slate-900 block leading-snug">
                        {isHindi ? option.labelHindi : option.labelEnglish}
                      </span>
                      {option.sublabelHindi && (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {isHindi ? option.sublabelHindi : option.sublabelEnglish}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions: Skip / Don't Know & Early Finish */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSkipQuestion}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>{isHindi ? 'मुझे ठीक से नहीं पता / छोड़ें (Skip)' : "I don't know / Skip"}</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {history.length >= 2 && (
                  <button
                    type="button"
                    onClick={handleFinishEarly}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-colors"
                  >
                    {isHindi ? 'मूल्यांकन पूर्ण करें (Finish)' : 'Complete Assessment'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={onBack}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'लक्षण चरण पर वापस जाएं' : 'Back to Clinical Interview'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* COMPLETED REVIEW VIEW WITH PROVENANCE DISTINCTION */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 shadow-lg space-y-6 animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {isHindi ? 'आयुष मूल्यांकन संकलित (AYUSH Assessment Ready)' : 'Structured AYUSH Assessment Compiled'}
                </h3>
                <span className="text-xs text-slate-500">
                  {isHindi 
                    ? 'दशविध परीक्षा व जीवनशैली पैरामीटर्स चिकित्सक के लिए व्यवस्थित'
                    : 'Dashavidha Pariksha constitutional parameters ready for doctor review'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRestartAssessment}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>{isHindi ? 'पुनः उत्तर दें' : 'Retake Assessment'}</span>
            </button>
          </div>

          {/* THREE-WAY PROVENANCE DISTINCTION TABS (STRICT REQUIREMENT) */}
          <div className="space-y-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              {isHindi ? 'डेटा स्रोत एवं सत्यापन वर्गीकरण:' : 'Data Provenance & Verification Classification:'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Tab 1: PATIENT PROVIDED */}
              <button
                type="button"
                onClick={() => setActiveProvenanceTab('patient_provided')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  activeProvenanceTab === 'patient_provided'
                    ? 'border-teal-600 bg-teal-50/80 shadow-xs ring-2 ring-teal-200'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-teal-200 text-teal-900 font-extrabold text-[10px] tracking-wider uppercase">
                    1. PATIENT PROVIDED
                  </span>
                  <Check className="w-3.5 h-3.5 text-teal-700" />
                </div>
                <p className="text-xs font-bold text-slate-900">
                  {isHindi ? 'रोगी द्वारा दर्ज उत्तर' : 'Raw Patient Responses'}
                </p>
                <span className="text-[11px] text-slate-500">
                  {compiledAssessment?.provenance?.patientProvided.length || 0} inputs recorded
                </span>
              </button>

              {/* Tab 2: AI STRUCTURED */}
              <button
                type="button"
                onClick={() => setActiveProvenanceTab('ai_structured')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  activeProvenanceTab === 'ai_structured'
                    ? 'border-indigo-600 bg-indigo-50/80 shadow-xs ring-2 ring-indigo-200'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-200 text-indigo-900 font-extrabold text-[10px] tracking-wider uppercase">
                    2. AI STRUCTURED
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
                </div>
                <p className="text-xs font-bold text-slate-900">
                  {isHindi ? 'एआई द्वारा संरचित' : 'Constitutional Classification'}
                </p>
                <span className="text-[11px] text-slate-500">
                  Agni, Koshtha, Nidra, Vihara
                </span>
              </button>

              {/* Tab 3: DOCTOR VERIFIED */}
              <button
                type="button"
                onClick={() => setActiveProvenanceTab('doctor_verification')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  activeProvenanceTab === 'doctor_verification'
                    ? 'border-amber-600 bg-amber-50/80 shadow-xs ring-2 ring-amber-200'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 font-extrabold text-[10px] tracking-wider uppercase">
                    3. DOCTOR VERIFIED
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                </div>
                <p className="text-xs font-bold text-slate-900">
                  {isHindi ? 'वैद्य सत्यापन लंबित' : 'Pending Vaidya Review'}
                </p>
                <span className="text-[11px] text-amber-800 font-semibold">
                  OPD Cabin 105 Consultation
                </span>
              </button>
            </div>
          </div>

          {/* TAB 1 CONTENT: PATIENT PROVIDED */}
          {activeProvenanceTab === 'patient_provided' && (
            <div className="bg-teal-50/50 rounded-2xl p-4 sm:p-5 border border-teal-200 space-y-3">
              <div className="flex items-center gap-2 text-teal-900 font-extrabold text-xs">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                <span>Exact Patient-Reported Intake Transcript (रोगी के मूल उत्तर)</span>
              </div>
              <div className="space-y-2.5">
                {compiledAssessment?.additionalParameters?.patientProvidedResponses?.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-teal-100 space-y-1 text-xs">
                    <p className="font-semibold text-slate-500">Q{idx + 1}: {item.question}</p>
                    <p className="font-extrabold text-teal-950 text-sm">"{item.answer}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2 CONTENT: AI STRUCTURED PARAMETERS */}
          {activeProvenanceTab === 'ai_structured' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Agni & Digestion */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    <span>अग्नि (Agni / Digestive Power)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px]">
                    {compiledAssessment?.agni?.agniType?.split('(')[0] || 'Sama'}
                  </span>
                </div>
                <p className="font-bold text-slate-900 text-sm">
                  {compiledAssessment?.agni?.agniType}
                </p>
                <div className="text-slate-600 space-y-0.5">
                  <p>Appetite state: <strong>{compiledAssessment?.agni?.appetite}</strong></p>
                  <p>Post-meal comfort: <strong>{compiledAssessment?.agni?.postMealComfort}</strong></p>
                </div>
              </div>

              {/* Koshtha & Bowels */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Waves className="w-3.5 h-3.5 text-teal-600" />
                    <span>कोष्ठ (Koshtha / Bowel Habits)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 font-bold text-[11px]">
                    {compiledAssessment?.koshtha?.koshthaType?.split('(')[0] || 'Madhyama'}
                  </span>
                </div>
                <p className="font-bold text-slate-900 text-sm">
                  {compiledAssessment?.koshtha?.koshthaType}
                </p>
                <div className="text-slate-600 space-y-0.5">
                  <p>Bowel frequency: <strong>{compiledAssessment?.koshtha?.bowelHabits}</strong></p>
                  <p>Stool consistency: <strong>{compiledAssessment?.koshtha?.stoolConsistency}</strong></p>
                </div>
              </div>

              {/* Prakriti & Thermal Tolerance */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-600" />
                    <span>प्रकृति प्रवृत्तियाँ (Prakriti / Thermal Tolerance)</span>
                  </span>
                </div>
                <p className="font-bold text-slate-900 text-sm">
                  {compiledAssessment?.prakriti?.dominantDoshaTendency}
                </p>
                <p className="text-slate-600">
                  Thermal Reaction: <strong>{compiledAssessment?.prakriti?.thermalTolerance}</strong>
                </p>
              </div>

              {/* Nidra / Sleep */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-violet-600" />
                    <span>निद्रा (Nidra / Sleep Quality)</span>
                  </span>
                </div>
                <p className="font-bold text-slate-900 text-sm">
                  {compiledAssessment?.nidra?.quality}
                </p>
                <p className="text-slate-600">
                  Morning State: <strong>{compiledAssessment?.nidra?.wakingFeeling}</strong>
                </p>
              </div>

              {/* Ahara & Vihara Routine */}
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
                  <span>आहार एवं विहार (Ahara & Vihara / Lifestyle & Routine)</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-500 block">Diet Pattern (आहार):</span>
                    <strong className="text-slate-900">{compiledAssessment?.ahara?.dietaryPattern}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Physical Routine (विहार):</span>
                    <strong className="text-slate-900">{compiledAssessment?.vihara?.physicalActivity}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3 CONTENT: DOCTOR VERIFIED STATUS */}
          {activeProvenanceTab === 'doctor_verification' && (
            <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-amber-950 font-extrabold text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>Doctor / Vaidya Verification Protocol (वैद्य द्वारा सत्यापन)</span>
              </div>
              <p className="text-amber-900 leading-relaxed">
                This case will be reviewed by <strong>Vaidya R. S. Sharma (BAMS, MD Ayu)</strong> in <strong>Cabin 105</strong>. The Vaidya will perform Nadi Pariksha (pulse examination), verify your Agni and Koshtha responses, and confirm the treatment protocol.
              </p>
              <div className="bg-white p-3 rounded-xl border border-amber-200 text-slate-700 flex items-center justify-between">
                <span>Verification Status:</span>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[11px]">
                  PENDING_DOCTOR_VERIFICATION
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isHindi ? 'पीछे जाएं' : 'Back'}</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmAndProceed}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>{isHindi ? 'पुष्टि करें और दस्तावेज़ अपलोड पर जाएं' : 'Confirm & Proceed to Documents'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
