import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  Send, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  RefreshCw,
  Heart,
  Bot,
  User,
  HelpCircle,
  Headphones,
  Loader2
} from 'lucide-react';
import { PatientProfile, QuestionAnswer, TriageAlert } from '../../types';
import { WaveformVisualizer } from './WaveformVisualizer';
import { 
  speakText, 
  stopSpeech, 
  createSpeechRecognizer, 
  playDoctorChime, 
  playTouchFeedback, 
  playSuccessChime, 
  playMicPromptSound, 
  playAlertChime, 
  unlockAudioSystem,
  reloadVoiceSynthesisEngine,
  DoctorVoiceGender
} from '../../services/speechService';
import { fetchAdaptiveQuestion, getFallbackAdaptiveQuestion, AdaptiveQuestionResponse } from '../../services/aiService';
import { getTranslations } from '../../utils/translations';

interface StepVoiceTouchInterviewProps {
  patient: PatientProfile;
  answers: QuestionAnswer[];
  currentQuestion?: AdaptiveQuestionResponse;
  isAiLoadingNext?: boolean;
  onAnswerSubmit?: (answerText: string, answeredVia: 'voice' | 'touch' | 'text') => Promise<void> | void;
  onAddAnswer?: (answer: QuestionAnswer) => void;
  onNext: () => void;
  onBack: () => void;
  onTriggerRedFlagAlert: (alert: Partial<TriageAlert>) => void;
  audioEnabled: boolean;
  doctorVoiceGender?: DoctorVoiceGender;
}

export const StepVoiceTouchInterview: React.FC<StepVoiceTouchInterviewProps> = ({
  patient,
  answers,
  currentQuestion: propCurrentQuestion,
  isAiLoadingNext: propIsAiLoadingNext,
  onAnswerSubmit,
  onAddAnswer,
  onNext,
  onBack,
  onTriggerRedFlagAlert,
  audioEnabled,
  doctorVoiceGender = 'female'
}) => {
  const t = getTranslations(patient.language);

  const [localQuestion, setLocalQuestion] = useState<AdaptiveQuestionResponse>({
    questionText: t.interview.initialQuestion,
    audioPromptText: t.interview.initialAudioPrompt,
    hindiText: t.interview.initialQuestion,
    category: 'chief_complaint',
    quickOptions: t.interview.initialOptions,
    allowVoice: true,
    isComplete: false
  });

  // Use props from KioskContainer if provided, otherwise fallback to local state
  const activeQuestion = propCurrentQuestion || localQuestion;
  const isLoading = propIsAiLoadingNext !== undefined ? propIsAiLoadingNext : false;

  const [isDoctorSpeaking, setIsDoctorSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [customText, setCustomText] = useState('');
  const [localIsLoadingNext, setLocalIsLoadingNext] = useState(false);
  const [redFlagAlertActive, setRedFlagAlertActive] = useState<string | null>(null);
  const [autoVoiceListen, setAutoVoiceListen] = useState(true);

  const isAnyLoading = isLoading || localIsLoadingNext;
  const recognizerRef = useRef<any>(null);

  // SOCRATES Sequence Stage Definitions
  const SOCRATES_STAGES = [
    { id: 1, key: 'site', label: patient.language === 'pa' ? 'ਲੱਛਣ (Site)' : patient.language === 'hi' ? 'मुख्य लक्षण (Site)' : 'Site / Chief Complaint' },
    { id: 2, key: 'onset', label: patient.language === 'pa' ? 'ਸ਼ੁਰੂਆਤ (Onset)' : patient.language === 'hi' ? 'शुरुआत (Onset)' : 'Onset & Duration' },
    { id: 3, key: 'character', label: patient.language === 'pa' ? 'ਕਿਸਮ/ਫੈਲਾਅ (Character)' : patient.language === 'hi' ? 'प्रकृति/फैलाव (Character)' : 'Character & Radiation' },
    { id: 4, key: 'severity', label: patient.language === 'pa' ? 'ਗੰਭੀਰਤਾ (Severity)' : patient.language === 'hi' ? 'गंभीरता (Severity)' : 'Severity & Associated' },
  ];
  const activeStageIdx = Math.min(answers.length, 3);

  // Sync question and reload speech synthesis voice engine on language switch
  useEffect(() => {
    reloadVoiceSynthesisEngine(patient.language).catch(() => {});

    if (answers.length === 0) {
      setLocalQuestion({
        questionText: t.interview.initialQuestion,
        audioPromptText: t.interview.initialAudioPrompt,
        hindiText: t.interview.initialQuestion,
        category: 'chief_complaint',
        quickOptions: t.interview.initialOptions,
        allowVoice: true,
        isComplete: false
      });
    } else {
      const localizedQ = getFallbackAdaptiveQuestion(answers, patient.isAyushPatient, patient.language);
      setLocalQuestion({
        ...localizedQ,
        isComplete: false
      });
    }
  }, [patient.language]);

  // Play doctor voice prompt whenever question changes or language changes
  // After doctor completes speaking, automatically triggers voice listening if enabled!
  useEffect(() => {
    if (audioEnabled && activeQuestion && !activeQuestion.isComplete && !isAnyLoading) {
      const speechText = activeQuestion.audioPromptText || activeQuestion.questionText;
      setIsDoctorSpeaking(true);
      
      speakText(speechText, patient.language, () => {
        setIsDoctorSpeaking(false);
        // Automatically activate microphone when doctor completes speaking without requiring user button tap
        if (autoVoiceListen && activeQuestion.allowVoice) {
          handleStartListening();
        }
      }, {
        playChime: true,
        lang: patient.language,
        gender: doctorVoiceGender,
        onStart: () => setIsDoctorSpeaking(true),
        onEnd: () => {
          setIsDoctorSpeaking(false);
          // Automatically trigger listening on prompt completion
          if (autoVoiceListen && activeQuestion.allowVoice) {
            handleStartListening();
          }
        }
      });
    }

    return () => {
      stopSpeech();
    };
  }, [activeQuestion, audioEnabled, patient.language, doctorVoiceGender, isAnyLoading, autoVoiceListen]);

  // Voice Help Mode: Explains clearly what to say
  const handleVoiceHelpGuide = () => {
    unlockAudioSystem();
    playTouchFeedback();
    setIsDoctorSpeaking(true);
    const helpGuide = patient.language === 'pa'
      ? `ਸਹਾਇਤਾ ਗਾਈਡ: ਤੁਸੀਂ ਮਾਈਕ ਬਟਨ ਦਬਾ ਕੇ ਬੋਲ ਸਕਦੇ ਹੋ। ਉਦਾਹਰਣ ਲਈ ਕਹੋ: ਮੈਨੂੰ ਦੋ ਦਿਨਾਂ ਤੋਂ ਛਾਤੀ ਵਿੱਚ ਦਰਦ ਹੈ, ਜਾਂ ਮੈਨੂੰ ਬੁਖਾਰ ਅਤੇ ਖੰਘ ਹੈ। ਜਾਂ ਫਿਰ ਹੇਠਾਂ ਦਿੱਤੇ ਵਿਕਲਪਾਂ ਨੂੰ ਛੂਹ ਕੇ ਚੁਣ ਸਕਦੇ ਹੋ।`
      : patient.language === 'hi'
      ? `सहायता गाइड: आप माइक बटन दबाकर बोल सकते हैं। उदाहरण के लिए कहिए: मुझे दो दिन से सीने में दर्द है, या मुझे बुखार और खांसी है। या फिर नीचे दिए गए विकल्पों में से किसी एक को छूकर चुन सकते हैं।`
      : `Voice Guide: Tap the microphone button and speak your symptoms. For example, say: I have chest pain since 2 days, or fever and cough. Or simply tap any of the quick suggestion buttons below.`;

    speakText(helpGuide, patient.language, () => {
      setIsDoctorSpeaking(false);
    }, {
      playChime: true,
      lang: patient.language,
      gender: doctorVoiceGender,
      onStart: () => setIsDoctorSpeaking(true),
      onEnd: () => setIsDoctorSpeaking(false)
    });
  };

  const checkRedFlagTriggers = (text: string) => {
    const lower = text.toLowerCase();
    const isChestPain = lower.includes('chest') || lower.includes('seene') || lower.includes('chhati') || lower.includes('heart') || lower.includes('radiation') || lower.includes('arm');
    const isBreathless = lower.includes('breath') || lower.includes('saans') || lower.includes('dum');

    if (isChestPain || isBreathless) {
      const alertMsg = 'Acute Retrosternal Chest Discomfort radiating with exertional dyspnea';
      setRedFlagAlertActive(alertMsg);
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

  const handleStartListening = () => {
    unlockAudioSystem();
    playMicPromptSound();
    setTranscript('');
    setIsListening(true);

    if (isDoctorSpeaking) {
      stopSpeech();
      setIsDoctorSpeaking(false);
    }

    const recognizer = createSpeechRecognizer(patient.language, {
      onResult: (spokenText, isFinal) => {
        setTranscript(spokenText);
        if (isFinal && spokenText.trim()) {
          setTimeout(() => {
            handleAnswerSubmit(spokenText.trim(), 'voice');
          }, 800);
        }
      },
      onError: () => {
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    recognizerRef.current = recognizer;
    if (recognizer) {
      try {
        recognizer.start();
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const handleStopListening = () => {
    playTouchFeedback();
    setIsListening(false);
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch (e) {}
    }

    if (transcript.trim()) {
      handleAnswerSubmit(transcript.trim(), 'voice');
    }
  };

  const handleAnswerSubmit = async (answerText: string, answeredVia: 'voice' | 'touch' | 'text') => {
    if (!answerText.trim() || isAnyLoading) return;

    // Immediately stop listening and speaking before moving to next question
    if (isListening) {
      setIsListening(false);
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch (e) {}
      }
    }
    stopSpeech();
    setIsDoctorSpeaking(false);

    setTranscript('');
    setCustomText('');

    // If KioskContainer provides central state management, delegate directly to it
    if (onAnswerSubmit) {
      await onAnswerSubmit(answerText, answeredVia);
      return;
    }

    // Fallback local state management if rendered independently
    unlockAudioSystem();
    playTouchFeedback();
    playSuccessChime();

    const newAnswer: QuestionAnswer = {
      questionId: `q_${answers.length + 1}`,
      questionText: activeQuestion.questionText,
      answerText,
      answeredVia,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (onAddAnswer) {
      onAddAnswer(newAnswer);
    }
    checkRedFlagTriggers(answerText);

    const updatedAnswers = [...answers, newAnswer];
    const totalCount = updatedAnswers.length;

    // After 4 questions are completed, proceed to next step
    if (totalCount >= 4) {
      onNext();
      return;
    }

    // Fetch next adaptive question in real-time SOCRATES sequence
    setLocalIsLoadingNext(true);
    try {
      const nextQ = await fetchAdaptiveQuestion(
        updatedAnswers[0]?.answerText || answerText,
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

      if (totalCount >= 4 || (nextQ.isComplete && totalCount >= 4)) {
        onNext();
      } else {
        setLocalQuestion({
          ...nextQ,
          isComplete: false
        });
      }
    } catch (err) {
      console.warn('Error fetching next question, falling back to clinical questions:', err);
      const fallback = getFallbackAdaptiveQuestion(updatedAnswers, patient.isAyushPatient, patient.language);
      setLocalQuestion({
        ...fallback,
        isComplete: false
      });
    } finally {
      setLocalIsLoadingNext(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
      
      {/* Autonomous SOCRATES Sequence Progress Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-800 text-white rounded-lg text-[11px] font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>SOCRATES Protocol</span>
            </span>
            <span className="text-xs font-semibold text-slate-700">
              Step {Math.min(answers.length + 1, 4)} of 4 • {SOCRATES_STAGES[activeStageIdx].label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-Listen Toggle Pill */}
            <button
              type="button"
              onClick={() => {
                playTouchFeedback();
                setAutoVoiceListen(!autoVoiceListen);
              }}
              title="Toggle automatic microphone listening when the doctor finishes speaking"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                autoVoiceListen
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                  : 'bg-slate-100 border-slate-300 text-slate-600'
              }`}
            >
              <Mic className={`w-3 h-3 ${autoVoiceListen ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
              <span>{autoVoiceListen ? 'Auto-Listen: Active' : 'Auto-Listen: Off'}</span>
            </button>
          </div>
        </div>

        {/* 4 SOCRATES Steps Visual Progress Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {SOCRATES_STAGES.map((stage, sIdx) => {
            const isCompleted = sIdx < answers.length;
            const isCurrent = sIdx === activeStageIdx && !isCompleted;
            return (
              <div
                key={stage.id}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center justify-between transition-all ${
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : isCurrent
                    ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                    isCompleted ? 'bg-emerald-200 text-emerald-900' : isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {stage.id}
                  </span>
                  <span className="truncate">{stage.label}</span>
                </div>
                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Question Header & Voice Assistant Status */}
      <div className="space-y-4 pb-4 border-b border-slate-100">
        
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              Q{answers.length + 1}
            </span>
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full shadow-2xs">
              <span className={`w-2.5 h-2.5 rounded-full ${isDoctorSpeaking ? 'bg-emerald-600 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span>
              <span className="text-xs font-bold text-emerald-950">
                {isDoctorSpeaking 
                  ? 'AI डॉक्टर बोल रहे हैं (Speaking...)' 
                  : '🟢 Real-Time AI Doctor • प्रत्यक्ष AI डॉक्टर संवाद'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Help Mode Button */}
            <button
              type="button"
              onClick={handleVoiceHelpGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Headphones className="w-3.5 h-3.5 text-amber-700 animate-bounce" />
              <span>क्या बोलें? (Help Guide)</span>
            </button>

            {/* Replay Question Button */}
            <button
              type="button"
              onClick={() => {
                unlockAudioSystem();
                playTouchFeedback();
                setIsDoctorSpeaking(true);
                speakText(
                  activeQuestion.audioPromptText || activeQuestion.questionText, 
                  patient.language, 
                  () => setIsDoctorSpeaking(false), 
                  { 
                    playChime: true,
                    onStart: () => setIsDoctorSpeaking(true),
                    onEnd: () => setIsDoctorSpeaking(false)
                  }
                );
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                isDoctorSpeaking
                  ? 'bg-teal-700 text-white animate-pulse'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isDoctorSpeaking ? 'बोल रहे हैं...' : '🔊 दोबारा सुनें'}</span>
            </button>
          </div>
        </div>

        {/* Primary Question Box */}
        <div className={`p-5 rounded-3xl border transition-all ${
          isAnyLoading
            ? 'bg-teal-50/90 border-teal-400 ring-2 ring-teal-300 shadow-md animate-pulse'
            : isDoctorSpeaking 
            ? 'bg-teal-50/70 border-teal-400 ring-2 ring-teal-200/60 shadow-md' 
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md">
              {isAnyLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-teal-200" />
              ) : (
                <Bot className="w-6 h-6" />
              )}
            </div>
            <div className="space-y-1.5 flex-1">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                {isAnyLoading 
                  ? 'AI Analysis • ਕਲੀਨਿਕਲ ਵਿਸ਼ਲੇਸ਼ਣ / विश्लेषण (Autonomous Sequence)' 
                  : `Doctor Question • सवाल #${answers.length + 1}`}
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 font-heading leading-snug">
                {isAnyLoading 
                  ? (patient.language === 'pa' 
                      ? 'ਤੁਹਾਡੇ ਜਵਾਬ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ ਅਤੇ ਅਗਲਾ ਡਾਕਟਰੀ ਸਵਾਲ ਤਿਆਰ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...' 
                      : patient.language === 'en'
                      ? 'Analyzing your response and formulating the next SOCRATES question...'
                      : 'आपके उत्तर का क्लिनिकल विश्लेषण हो रहा है और अगला सवाल तैयार किया जा रहा है...')
                  : activeQuestion.questionText}
              </h2>
              {!isAnyLoading && activeQuestion.audioPromptText && activeQuestion.audioPromptText !== activeQuestion.questionText && (
                <p className="text-xs sm:text-sm text-slate-600 italic">
                  "{activeQuestion.audioPromptText}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Red Flag Alert Banner */}
      {redFlagAlertActive && (
        <div className="p-4 bg-red-50 border-2 border-red-500 rounded-3xl flex items-center gap-3 text-red-950 shadow-md animate-pulse">
          <AlertTriangle className="w-7 h-7 text-red-600 shrink-0" />
          <div className="text-xs sm:text-sm">
            <strong className="block font-bold">{t.interview.emergencyAlertTitle}</strong>
            <span>{t.interview.emergencyAlertDesc} ({redFlagAlertActive})</span>
          </div>
        </div>
      )}

      {/* Waveform & Voice Interaction Area */}
      <WaveformVisualizer
        state={isListening ? 'listening' : isAnyLoading ? 'processing' : isDoctorSpeaking ? 'processing' : 'idle'}
        transcript={transcript}
        languageLabel={patient.language.toUpperCase()}
        onTapMic={isListening ? handleStopListening : handleStartListening}
      />

      {/* Voice Action Mic Button */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {!isListening ? (
          <button
            type="button"
            disabled={isAnyLoading}
            onClick={handleStartListening}
            className="w-full sm:w-auto px-8 py-4 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95 touch-target"
          >
            <Mic className="w-6 h-6 text-teal-200 animate-pulse" />
            <span>{isAnyLoading ? 'ਅਗਲਾ ਸਵਾਲ ਆ ਰਿਹਾ ਹੈ...' : t.interview.tapToSpeak}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStopListening}
            className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-lg animate-pulse cursor-pointer active:scale-95 touch-target"
          >
            <MicOff className="w-6 h-6" />
            <span>{t.interview.tapToStop}</span>
          </button>
        )}
      </div>

      {/* Quick Touch Answer Pills (Large Touch Targets) */}
      {!isAnyLoading && activeQuestion.quickOptions && activeQuestion.quickOptions.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {t.interview.chooseQuickAnswer}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeQuestion.quickOptions.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isAnyLoading}
                onClick={() => handleAnswerSubmit(opt, 'touch')}
                className="p-4 rounded-2xl border border-slate-200 hover:border-teal-500 bg-slate-50 hover:bg-teal-50/80 text-slate-800 hover:text-teal-950 font-semibold text-xs sm:text-sm text-left transition-all shadow-2xs cursor-pointer flex items-center justify-between group active:scale-98 touch-target disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{opt}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Optional Custom Text Input */}
      <div className="pt-2 border-t border-slate-100">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (customText.trim() && !isAnyLoading) handleAnswerSubmit(customText.trim(), 'text');
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            disabled={isAnyLoading}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={t.interview.typeAnswerPlaceholder}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:bg-white focus:border-teal-600 focus:outline-hidden disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!customText.trim() || isAnyLoading}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* Answered Thread */}
      {answers.length > 0 && (
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Previous Responses • दर्ज किए गए उत्तर ({answers.length})
          </span>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {answers.map((ans, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 font-semibold text-[10px]">
                  <span>Q{idx + 1}: {ans.questionText}</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{ans.answeredVia}</span>
                </div>
                <div className="font-bold text-teal-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{ans.answerText}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
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
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-teal-800 hover:bg-teal-900 text-white transition-all shadow-md active:scale-95 touch-target cursor-pointer"
        >
          <span>{t.interview.proceedToScanner}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
