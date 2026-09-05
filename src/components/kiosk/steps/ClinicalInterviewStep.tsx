import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Stethoscope, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Send, 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Keyboard, 
  Sparkles, 
  Loader2,
  FileCheck2,
  Clock,
  Activity,
  HeartPulse,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Radio,
  AudioWaveform,
  Check
} from 'lucide-react';
import { 
  StructuredClinicalInterview, 
  LanguageCode, 
  InterviewDialogueEntry,
  InterviewStepResponse 
} from '../../../types';
import { fetchNextInterviewStep } from '../../../services/clinicalInterviewService';
import { 
  speakText, 
  stopSpeech, 
  unlockAudioSystem, 
  reloadVoiceSynthesisEngine, 
  getBcp47LanguageTag,
  createSpeechRecognizer,
  playDoctorChime,
  playTouchFeedback,
  playSuccessChime
} from '../../../services/speechService';
import { getTranslations } from '../../../utils/translations';

interface ClinicalInterviewStepProps {
  initialInterview?: StructuredClinicalInterview;
  onSaveInterview: (interview: StructuredClinicalInterview) => void;
  onNext: () => void;
  onBack: () => void;
  language: LanguageCode;
  patientDraft?: {
    name?: string;
    age?: number;
    gender?: string;
    department?: string;
    vitals?: any;
  };
  easyMode?: boolean;
}

export const ClinicalInterviewStep: React.FC<ClinicalInterviewStepProps> = ({
  initialInterview,
  onSaveInterview,
  onNext,
  onBack,
  language,
  patientDraft,
  easyMode = false
}) => {
  const t = getTranslations(language);
  const isHindi = language === 'hi';
  const isPunjabi = language === 'pa';

  // Localized defaults
  const localizedInitialQuestion = t.interview?.initialQuestion || (
    isPunjabi
      ? 'ਅੱਜ ਤੁਹਾਨੂੰ ਕਿਹੜੀ ਮੁੱਖ ਤਕਲੀਫ ਹੈ ਜਿਸ ਲਈ ਤੁਸੀਂ ਡਾਕਟਰ ਕੋਲ ਆਏ ਹੋ?'
      : isHindi 
      ? 'नमस्ते! आज आप किस मुख्य परेशानी या बीमारी की जांच कराने अस्पताल आए हैं?'
      : 'Hello! What primary symptom or health concern brought you to the hospital today?'
  );

  const localizedInitialOptions = t.interview?.initialOptions || (
    isPunjabi
      ? ['ਛਾਤੀ ਵਿੱਚ ਭਾਰੀਪਣ ਤੇ ਦਰਦ (Chest Pain)', 'ਤੇਜ਼ ਬੁਖਾਰ ਤੇ ਸਰੀਰ ਦਰਦ (Fever)', 'ਪੇਟ ਵਿੱਚ ਤੇਜ਼ ਦਰਦ ਤੇ ਗੈਸ (Stomach Pain)', 'ਗੋਡਿਆਂ ਤੇ ਜੋੜਾਂ ਦਾ ਦਰਦ (Joint Pain)', 'ਖੰਘ ਅਤੇ ਸਾਹ ਚੜ੍ਹਨਾ (Cough / Breathless)']
      : isHindi
      ? ['सीने में दर्द व भारीपन', 'तेज बुखार एवं कंपकंपी', 'खांसी व सांस की तकलीफ', 'पेट में दर्द या उल्टी', 'घुटनों व जोड़ों में दर्द']
      : ['Chest Pain / Heaviness', 'High Fever & Chills', 'Cough & Shortness of Breath', 'Stomach Pain / Nausea', 'Joint / Knee Pain']
  );

  // Interview state
  const [currentStepNumber, setCurrentStepNumber] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<string>(localizedInitialQuestion);
  const [currentQuestionEnglish, setCurrentQuestionEnglish] = useState<string>(
    'Hello! What primary symptom or health concern brought you to the hospital today?'
  );
  const [quickReplies, setQuickReplies] = useState<string[]>(localizedInitialOptions);
  const [dialogueHistory, setDialogueHistory] = useState<InterviewDialogueEntry[]>(
    initialInterview?.dialogueHistory || []
  );
  const [redFlags, setRedFlags] = useState<string[]>(initialInterview?.redFlags || []);
  const [isInterviewCompleted, setIsInterviewCompleted] = useState<boolean>(false);
  const [compiledSummary, setCompiledSummary] = useState<StructuredClinicalInterview | null>(
    initialInterview || null
  );

  // Input state
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [isEvaluatingNextStep, setIsEvaluatingNextStep] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);

  // Live Hands-Free Gemini Conversation Mode state
  const [isHandsFreeActive, setIsHandsFreeActive] = useState<boolean>(true);
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState<number | null>(null);

  // Voice recognition & synthesis state
  const isVoiceSupported = typeof window !== 'undefined' && (
    'webkitSpeechRecognition' in window || 
    'SpeechRecognition' in window || 
    Boolean((window as any).AndroidApp?.startSpeechRecognition)
  );
  const isTtsSupported = typeof window !== 'undefined' && (
    'speechSynthesis' in window || 
    Boolean((window as any).AndroidApp?.speak)
  );

  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const autoSubmitTimerRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const isListeningRef = useRef<boolean>(false);
  const isHandsFreeRef = useRef<boolean>(true);
  const isInterviewCompletedRef = useRef<boolean>(false);
  const currentStepRef = useRef<number>(1);
  const hasSpokenInitialRef = useRef<boolean>(false);

  // Keep refs in sync for asynchronous callbacks
  useEffect(() => {
    isHandsFreeRef.current = isHandsFreeActive;
  }, [isHandsFreeActive]);

  useEffect(() => {
    isInterviewCompletedRef.current = isInterviewCompleted;
  }, [isInterviewCompleted]);

  useEffect(() => {
    currentStepRef.current = currentStepNumber;
  }, [currentStepNumber]);

  // Stop Speaking
  const stopSpeaking = useCallback(() => {
    stopSpeech();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
  }, []);

  // Stop Listening
  const stopListening = useCallback(() => {
    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = null;
    }
    setAutoSubmitCountdown(null);
    setIsListening(false);
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        if (typeof recognitionRef.current.stop === 'function') {
          recognitionRef.current.stop();
        } else if (typeof recognitionRef.current.abort === 'function') {
          recognitionRef.current.abort();
        }
      } catch (e) {}
    }
  }, []);

  // Speak Doctor's question and optionally auto-listen when speech ends
  const speakDoctorQuestion = useCallback((textToSpeak: string, autoListenAfter: boolean = true) => {
    if (!textToSpeak) return;
    unlockAudioSystem();
    stopListening();

    setIsSpeaking(true);
    isSpeakingRef.current = true;

    speakText(textToSpeak, language, () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      if (autoListenAfter && isHandsFreeRef.current && !isInterviewCompletedRef.current) {
        setTimeout(() => {
          if (!isSpeakingRef.current && !isInterviewCompletedRef.current) {
            startListening();
          }
        }, 400);
      }
    }, {
      playChime: true,
      lang: language,
      onStart: () => {
        setIsSpeaking(true);
        isSpeakingRef.current = true;
      },
      onEnd: () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        if (autoListenAfter && isHandsFreeRef.current && !isInterviewCompletedRef.current) {
          setTimeout(() => {
            if (!isSpeakingRef.current && !isInterviewCompletedRef.current) {
              startListening();
            }
          }, 400);
        }
      },
      onError: () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
      }
    });
  }, [language, stopListening]);

  // Start Voice Recognition
  const startListening = useCallback(() => {
    stopSpeaking();
    setVoiceError(null);
    setVoiceTranscript('');
    setAutoSubmitCountdown(null);
    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = null;
    }

    setIsListening(true);
    isListeningRef.current = true;

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognizer = createSpeechRecognizer(language, {
        onResult: (spokenText: string, isFinal: boolean) => {
          const cleaned = spokenText.trim();
          setVoiceTranscript(cleaned);
          setCurrentAnswer(cleaned);

          if (cleaned.length > 1 && isHandsFreeRef.current) {
            if (autoSubmitTimerRef.current) {
              clearTimeout(autoSubmitTimerRef.current);
            }
            if (isFinal) {
              // Final sentence: quick submit after 600ms
              setAutoSubmitCountdown(1);
              autoSubmitTimerRef.current = setTimeout(() => {
                setAutoSubmitCountdown(null);
                stopListening();
                handleAnswerSubmit(cleaned);
              }, 600);
            } else {
              // Interim sentence: submit after 1.3s of silence
              setAutoSubmitCountdown(1);
              autoSubmitTimerRef.current = setTimeout(() => {
                setAutoSubmitCountdown(null);
                stopListening();
                handleAnswerSubmit(cleaned);
              }, 1300);
            }
          }
        },
        onError: (err: any) => {
          console.warn('Speech recognition warning/error:', err);
          setIsListening(false);
          isListeningRef.current = false;
          setAutoSubmitCountdown(null);
          if (err === 'not-allowed') {
            setVoiceError(
              isPunjabi ? 'ਮਾਈਕ੍ਰੋਫੋਨ ਦੀ ਇਜਾਜ਼ਤ ਨਹੀਂ ਦਿੱਤੀ ਗਈ। ਕਿਰਪਾ ਕਰਕੇ ਹੇਠਾਂ ਟਾਈਪ ਕਰੋ।' :
              isHindi ? 'माइक्रोफ़ोन अनुमति अस्वीकार कर दी गई है। कृपया नीचे टाइप करें।' :
              'Microphone permission denied. Please type below.'
            );
          }
        },
        onEnd: () => {
          setIsListening(false);
          isListeningRef.current = false;
        }
      });

      recognitionRef.current = recognizer;
      if (recognizer && typeof recognizer.start === 'function') {
        recognizer.start();
      } else {
        setIsListening(false);
        isListeningRef.current = false;
      }
    } catch (err) {
      console.warn('Speech recognizer init error:', err);
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [language, stopSpeaking, stopListening]);

  // Read question aloud on manual replay button tap
  const handleReplayQuestion = () => {
    playTouchFeedback();
    speakDoctorQuestion(currentQuestion, isHandsFreeActive);
  };

  const resetVoiceTranscript = () => {
    playTouchFeedback();
    stopListening();
    setVoiceTranscript('');
    setCurrentAnswer('');
    setVoiceError(null);
  };

  // Auto-speak initial question on component mount in selected language
  useEffect(() => {
    unlockAudioSystem();
    reloadVoiceSynthesisEngine(language).catch(() => {});

    if (!hasSpokenInitialRef.current && currentStepRef.current === 1 && !isInterviewCompletedRef.current) {
      hasSpokenInitialRef.current = true;
      const timer = setTimeout(() => {
        speakDoctorQuestion(currentQuestion, isHandsFreeActive);
      }, 500);
      return () => clearTimeout(timer);
    }

    return () => {
      stopSpeaking();
      stopListening();
    };
  }, []);

  // Update initial question & voice engine when language prop changes
  useEffect(() => {
    reloadVoiceSynthesisEngine(language).catch(() => {});
    if (dialogueHistory.length === 0) {
      const localizedQ = t.interview?.initialQuestion || (
        language === 'pa'
          ? 'ਅੱਜ ਤੁਹਾਨੂੰ ਕਿਹੜੀ ਮੁੱਖ ਤਕਲੀਫ ਹੈ ਜਿਸ ਲਈ ਤੁਸੀਂ ਡਾਕਟਰ ਕੋਲ ਆਏ ਹੋ?'
          : language === 'hi'
          ? 'नमस्ते! आज आप किस मुख्य परेशानी या बीमारी की जांच कराने अस्पताल आए हैं?'
          : 'Hello! What primary symptom or health concern brought you to the hospital today?'
      );
      const localizedOpts = t.interview?.initialOptions || (
        language === 'pa'
          ? ['ਛਾਤੀ ਵਿੱਚ ਭਾਰੀਪਣ ਤੇ ਦਰਦ (Chest Pain)', 'ਤੇਜ਼ ਬੁਖਾਰ ਤੇ ਸਰੀਰ ਦਰਦ (Fever)', 'ਪੇਟ ਵਿੱਚ ਤੇਜ਼ ਦਰਦ ਤੇ ਗੈਸ (Stomach Pain)', 'ਗੋਡਿਆਂ ਤੇ ਜੋੜਾਂ ਦਾ ਦਰਦ (Joint Pain)', 'ਖੰਘ ਅਤੇ ਸਾਹ ਚੜ੍ਹਨਾ (Cough / Breathless)']
          : language === 'hi'
          ? ['सीने में दर्द व भारीपन', 'तेज बुखार एवं कंपकंपी', 'खांसी व सांस की तकलीफ', 'पेट में दर्द या उल्टी', 'घुटनों व जोड़ों में दर्द']
          : ['Chest Pain / Heaviness', 'High Fever & Chills', 'Cough & Shortness of Breath', 'Stomach Pain / Nausea', 'Joint / Knee Pain']
      );
      setCurrentQuestion(localizedQ);
      setQuickReplies(localizedOpts);
    }
  }, [language]);

  // Submit Answer & Determine Next Adaptive Question
  const handleAnswerSubmit = async (answerTextToSubmit?: string, isFinalOverride?: boolean) => {
    const textToSubmit = (answerTextToSubmit !== undefined ? answerTextToSubmit : currentAnswer).trim();
    if (!textToSubmit && !isFinalOverride) {
      setErrorMessage(
        isPunjabi ? 'ਕਿਰਪਾ ਕਰਕੇ ਬੋਲ ਕੇ ਜਾਂ ਲਿਖ ਕੇ ਆਪਣਾ ਜਵਾਬ ਦਿਓ।' :
        isHindi ? 'कृपया अपना उत्तर बोलकर या लिखकर दर्ज करें।' : 'Please speak or type your answer.'
      );
      return;
    }

    setErrorMessage(null);
    stopListening();
    stopSpeaking();
    setIsEvaluatingNextStep(true);

    const newDialogueEntry: InterviewDialogueEntry = {
      questionNumber: currentStepNumber,
      question: currentQuestion,
      questionEnglish: currentQuestionEnglish,
      answer: textToSubmit || 'Skipped by patient',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...dialogueHistory, newDialogueEntry];
    setDialogueHistory(updatedHistory);

    try {
      const response: InterviewStepResponse = await fetchNextInterviewStep({
        language,
        stepNumber: currentStepNumber + 1,
        patientInfo: patientDraft,
        dialogueHistory: updatedHistory,
        latestAnswer: textToSubmit,
        isFinalRequest: isFinalOverride || currentStepNumber >= 5
      });

      // Update red flags if any newly detected
      if (response.redFlagsDetected && response.redFlagsDetected.length > 0) {
        setRedFlags(prev => Array.from(new Set([...prev, ...response.redFlagsDetected])));
      }

      if (response.isComplete || isFinalOverride || currentStepNumber >= 5) {
        // Complete interview flow
        setIsInterviewCompleted(true);
        setCompiledSummary(response.structuredData);
        onSaveInterview(response.structuredData);
        playSuccessChime();

        const completionMsg = isPunjabi
          ? 'ਧੰਨਵਾਦ, ਤੁਹਾਡੀ ਕਲੀਨਿਕਲ ਹਿਸਟਰੀ ਡਾਕਟਰ ਲਈ ਦਰਜ ਕਰ ਲਈ ਗਈ ਹੈ।'
          : isHindi
          ? 'धन्यवाद, आपकी क्लिनिकल हिस्ट्री तैयार कर ली गई है।'
          : 'Thank you, your clinical history has been compiled for the doctor.';
        speakDoctorQuestion(completionMsg, false);
      } else {
        // Advance to next adaptive question
        setCurrentStepNumber(prev => prev + 1);
        setCurrentQuestion(response.nextQuestion);
        setCurrentQuestionEnglish(response.nextQuestionEnglish);
        setQuickReplies(response.quickReplies || []);
        setCurrentAnswer('');
        setVoiceTranscript('');

        // AUTOMATICALLY READ NEXT QUESTION ALOUD IN SELECTED LANGUAGE!
        speakDoctorQuestion(response.nextQuestion, isHandsFreeActive);
      }
    } catch (err) {
      console.error('Error advancing interview step:', err);
      setErrorMessage(
        isPunjabi ? 'ਨੈੱਟਵਰਕ ਸਮੱਸਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।' :
        isHindi ? 'नेटवर्क समस्या। कृपया पुनः प्रयास करें।' : 
        'Network issue while determining next clinical question. Please retry.'
      );
    } finally {
      setIsEvaluatingNextStep(false);
    }
  };

  // Quick choice selection - auto submits and triggers voice
  const handleSelectQuickReply = (reply: string) => {
    playTouchFeedback();
    setCurrentAnswer(reply);
    handleAnswerSubmit(reply);
  };

  // Skip / "I don't know"
  const handleIDontKnow = () => {
    playTouchFeedback();
    const text = isPunjabi ? 'ਮੈਨੂੰ ਠੀਕ ਤਰ੍ਹਾਂ ਨਹੀਂ ਪਤਾ / ਅਨਿਸ਼ਚਿਤ' :
      isHindi ? 'मुझे ठीक से नहीं पता / अनिश्चित' : "I don't know / Not sure";
    setCurrentAnswer(text);
    handleAnswerSubmit(text);
  };

  // Early finish request
  const handleFinishEarly = () => {
    playTouchFeedback();
    handleAnswerSubmit(currentAnswer.trim() || 'Skipped remainder of questions', true);
  };

  // Final confirmation to proceed to Step 6
  const handleConfirmAndProceed = () => {
    playTouchFeedback();
    if (compiledSummary) {
      onSaveInterview(compiledSummary);
      onNext();
    } else {
      handleFinishEarly();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/90 text-teal-900 text-xs font-bold uppercase tracking-wider">
          <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
          <span>
            {isPunjabi ? 'ਕਦਮ 5 • ਏਆਈ ਕਲੀਨਿਕਲ ਗੱਲਬਾਤ (Voice & Touch Intake)' :
             isHindi ? 'चरण 5 • अनुकूली क्लिनिकल केस-टेकिंग (Voice & Touch Intake)' :
             'Step 5 • Adaptive AI-Assisted Clinical Interview'}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
          {isPunjabi ? 'ਏਆਈ-ਸਹਾਇਤਾ ਪ੍ਰਾਪਤ ਕਲੀਨਿਕਲ ਗੱਲਬਾਤ' :
           isHindi ? 'एआई-सहायता प्राप्त क्लिनिकल साक्षात्कार' :
           'Adaptive AI-Assisted Clinical Interview'}
        </h2>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          {isPunjabi
            ? 'ਡਾਕਟਰ ਦੀ ਜਾਂਚ ਲਈ ਤੁਹਾਡੇ ਲੱਛਣ ਇਕੱਠੇ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ। ਤੁਸੀਂ ਮਾਈਕ ਨਾਲ ਬੋਲ ਸਕਦੇ ਹੋ ਜਾਂ ਹੇਠਾਂ ਦਿੱਤੇ ਵਿਕਲਪ ਚੁਣ ਸਕਦੇ ਹੋ।'
            : isHindi
            ? 'डॉक्टर के परामर्श हेतु आपके लक्षणों एवं केस हिस्ट्री को संकलित किया जा रहा है। आप माइक द्वारा बोलकर या लिखकर उत्तर दे सकते हैं।'
            : 'Gathering your clinical symptoms and structured medical history for the doctor. Speak using the microphone or type below.'}
        </p>
      </div>

      {/* Red Flag Emergency Alert Banner (if identified) */}
      {redFlags.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm animate-in fade-in duration-300">
          <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1 text-sm">
            <h4 className="font-extrabold text-rose-950 text-base flex items-center gap-2">
              <span>
                {isPunjabi ? 'ਜ਼ਰੂਰੀ ਲੱਛਣ ਚੇਤਾਵਨੀ (Triage Alert Flag)' :
                 isHindi ? 'महत्वपूर्ण लक्षण चेतावनी (Triage Alert Flag)' :
                 'High Priority Clinical Alert Detected'}
              </span>
            </h4>
            <p className="text-rose-800 text-xs leading-relaxed">
              {isPunjabi
                ? 'ਤੁਹਾਡੇ ਦੱਸੇ ਲੱਛਣਾਂ ਵਿੱਚ ਜ਼ਰੂਰੀ ਐਮਰਜੈਂਸੀ ਸੰਕੇਤ ਮਿਲੇ ਹਨ। ਇਹ ਵੇਰਵਾ ਡਾਕਟਰ ਨੂੰ ਤੁਰੰਤ ਪਹਿਲ ਦੇ ਆਧਾਰ ਤੇ ਭੇਜਿਆ ਜਾਵੇਗਾ।'
                : isHindi
                ? 'आपके बताए गए लक्षणों में प्राथमिक आपातकालीन संकेत (Red Flags) पाए गए हैं। केस विवरण डॉक्टर को तुरंत प्राथमिकता के साथ अग्रेषित किया जाएगा।'
                : 'Reported symptoms indicate high clinical priority. These red flags will be highlighted directly to the attending doctor for priority review.'}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {redFlags.map((flag, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-white/90 border border-rose-200 text-rose-900 font-bold text-xs rounded-lg shadow-2xs">
                  ⚠️ {flag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Question Interview View vs Final Structured Review View */}
      {!isInterviewCompleted ? (
        <div className="space-y-6">
          {/* Hands-Free Live Voice Mode Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-teal-900 via-teal-800 to-cyan-900 text-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-3.5 h-3.5 rounded-full ${isHandsFreeActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'} shrink-0`} />
              <div>
                <span className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                  <span>
                    {isPunjabi ? 'ਲਾਈਵ ਏਆਈ ਗੱਲਬਾਤ ਮੋਡ (Gemini Live)' :
                     isHindi ? 'लाइव जेमिनी एआई बातचीत (Gemini Live)' :
                     'Live Gemini AI Voice Conversation'}
                  </span>
                  {isHandsFreeActive && (
                    <span className="px-2 py-0.5 bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-[11px] font-bold rounded-full">
                      {isPunjabi ? 'ਆਟੋਮੈਟਿਕ ਚਾਲੂ' : isHindi ? 'ऑटो-स्पीक सक्रिय' : 'Auto Active'}
                    </span>
                  )}
                </span>
                <p className="text-xs text-teal-100/80">
                  {isHandsFreeActive
                    ? (isPunjabi 
                        ? 'ਏਆਈ ਆਪਣੇ ਆਪ ਸਵਾਲ ਬੋਲੇਗਾ ਅਤੇ ਤੁਹਾਡੀ ਆਵਾਜ਼ ਸੁਣ ਕੇ ਅਗਲਾ ਸਵਾਲ ਪੁੱਛੇਗਾ (ਬਿਨਾਂ ਕਲਿੱਕ ਕੀਤੇ)'
                        : isHindi
                        ? 'एआई स्वतः प्रश्न बोलेगा और आपकी आवाज सुनकर उत्तर विश्लेषित करेगा (बिना क्लिक किए)'
                        : 'AI speaks automatically and analyzes your voice seamlessly without button clicks')
                    : (isPunjabi
                        ? 'ਮੈਨੂਅਲ ਮੋਡ: ਬਟਨ ਦਬਾ ਕੇ ਜਵਾਬ ਭੇਜੋ'
                        : isHindi
                        ? 'मैन्युअल मोड: बटन दबाकर उत्तर सबमिट करें'
                        : 'Manual Mode: Click button to submit answers')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playTouchFeedback();
                setIsHandsFreeActive(v => !v);
                if (isHandsFreeActive) {
                  stopListening();
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 self-start sm:self-auto ${
                isHandsFreeActive
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-sm'
                  : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
              }`}
            >
              {isHandsFreeActive
                ? (isPunjabi ? 'ਆਟੋਮੈਟਿਕ ਮੋਡ ਚਾਲੂ ਹੈ' : isHindi ? 'ऑटो-मोड चालू' : 'Hands-Free ON')
                : (isPunjabi ? 'ਆਟੋਮੈਟਿਕ ਮੋਡ ਚਾਲੂ ਕਰੋ' : isHindi ? 'ऑटो-मोड चालू करें' : 'Turn Hands-Free ON')}
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5 text-teal-800 font-bold">
                <Activity className="w-4 h-4 text-teal-600" />
                {isPunjabi ? `ਸਵਾਲ ${currentStepNumber} (ਕੁੱਲ 5)` :
                 isHindi ? `प्रश्न ${currentStepNumber} (अधिकतम 5)` :
                 `Question ${currentStepNumber} of 5`}
              </span>
              <span className="text-slate-400 font-mono">
                {Math.round((currentStepNumber / 5) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-teal-600 h-full transition-all duration-500 ease-out rounded-full"
                style={{ width: `${Math.min(100, (currentStepNumber / 5) * 100)}%` }}
              />
            </div>
          </div>

          {/* AI Question Card */}
          <div className={`bg-white rounded-3xl p-6 sm:p-8 border-2 border-teal-600/30 shadow-sm space-y-6 ${easyMode ? 'p-8 sm:p-10' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                  <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-teal-800 block">
                    {isPunjabi ? 'ਡਾਕਟਰ ਕਲੀਨਿਕਲ ਸਵਾਲ' :
                     isHindi ? 'डॉक्टर केस-टेकिंग प्रश्न' :
                     'Clinical Intake Question'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {isSpeaking 
                      ? (isPunjabi ? '🔊 ਏਆਈ ਬੋਲ ਰਿਹਾ ਹੈ...' : isHindi ? '🔊 डॉक्टर बोल रहे हैं...' : '🔊 AI Speaking...')
                      : (isPunjabi ? 'ਕਿਰਪਾ ਕਰਕੇ ਧਿਆਨ ਨਾਲ ਸੁਣੋ ਜਾਂ ਪੜ੍ਹੋ' : isHindi ? 'कृपया सटीक जानकारी दें' : 'Please provide accurate details')}
                  </span>
                </div>
              </div>

              {/* TTS Audio Button */}
              {isTtsSupported && (
                <button
                  type="button"
                  onClick={isSpeaking ? stopSpeaking : handleReplayQuestion}
                  className={`min-h-[48px] px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                    easyMode ? 'text-base min-h-[54px] px-5' : 'text-xs'
                  } ${
                    isSpeaking 
                      ? 'bg-amber-100 text-amber-950 border-2 border-amber-400 animate-pulse'
                      : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300'
                  }`}
                  title={isSpeaking ? 'Stop speaking' : 'Play question aloud'}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-5 h-5 text-amber-800" />
                      <span>{isPunjabi ? 'ਰੋਕੋ (Stop)' : isHindi ? 'रोकें (Stop)' : 'Stop Audio'}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5 text-teal-800" />
                      <span>{isPunjabi ? '🔊 ਦੁਬਾਰਾ ਸੁਣੋ (Listen)' : isHindi ? '🔊 प्रश्न सुनें (Listen)' : '🔊 Hear Question'}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Question Text - Large, High Contrast, One at a Time */}
            <div className="space-y-2 pt-1">
              <h3 className={`font-heading font-black text-slate-900 leading-snug ${
                easyMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
              }`}>
                "{currentQuestion}"
              </h3>
              {language !== 'en' && currentQuestionEnglish && (
                <p className="text-sm sm:text-base font-medium text-slate-600 italic">
                  English: "{currentQuestionEnglish}"
                </p>
              )}
            </div>

            {/* Quick-Tap Options - Curated & Generous Touch Targets */}
            {quickReplies && quickReplies.length > 0 && (
              <div className="pt-3 border-t border-slate-200 space-y-2.5">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                  {isPunjabi ? 'ਜਾਂ ਇਹਨਾਂ ਵਿਕਲਪਾਂ ਵਿੱਚੋਂ ਚੁਣੋ (ਟੈਪ ਕਰੋ):' :
                   isHindi ? 'त्वरित विकल्प (टैप करें):' :
                   'Quick Options (Tap to Select):'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(easyMode ? quickReplies.slice(0, 4) : quickReplies).map((reply, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isEvaluatingNextStep}
                      onClick={() => handleSelectQuickReply(reply)}
                      className={`min-h-[52px] px-4 py-3 rounded-xl bg-slate-50 hover:bg-teal-50 hover:border-teal-600 hover:text-teal-950 text-slate-900 font-bold border border-slate-300 transition-all text-left flex items-center justify-between shadow-2xs active:scale-[0.99] cursor-pointer ${
                        easyMode ? 'text-base min-h-[60px] p-4' : 'text-sm'
                      }`}
                    >
                      <span>{reply}</span>
                      <ArrowRight className="w-4 h-4 text-teal-700 opacity-60 shrink-0 ml-2" />
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={isEvaluatingNextStep}
                    onClick={handleIDontKnow}
                    className={`min-h-[52px] px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 transition-all flex items-center gap-2 active:scale-[0.99] cursor-pointer ${
                      easyMode ? 'text-base min-h-[60px]' : 'text-sm'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{isPunjabi ? 'ਮੈਨੂੰ ਨਹੀਂ ਪਤਾ (Skip)' : isHindi ? 'मुझे नहीं पता (छोड़ें)' : "I don't know / Skip"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Patient Input Area */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-teal-800" />
                <span>
                  {isPunjabi ? 'ਤੁਹਾਡਾ ਜਵਾਬ (Your Answer):' :
                   isHindi ? 'आपका उत्तर (Your Answer):' :
                   'Your Answer:'}
                </span>
              </label>

              {/* Voice Support Status */}
              <div className="text-xs font-bold">
                {isVoiceSupported ? (
                  <span className="text-emerald-900 bg-emerald-100 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    {isPunjabi ? 'ਮਾਈਕ ਤਿਆਰ ਹੈ' : isHindi ? 'माइक तैयार है' : 'Voice Ready'}
                  </span>
                ) : (
                  <span className="text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-300 font-medium">
                    {isPunjabi ? 'ਟਾਈਪ ਮੋਡ' : isHindi ? 'टाइप मोड' : 'Keyboard Mode'}
                  </span>
                )}
              </div>
            </div>

            {/* Voice Input Section with Real Speech Recognition & Canonical States */}
            {isVoiceSupported && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-300 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Microphone State Trigger Button */}
                    <button
                      type="button"
                      onClick={isListening ? stopListening : startListening}
                      disabled={isEvaluatingNextStep}
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-md shrink-0 active:scale-95 cursor-pointer ${
                        isListening
                          ? 'bg-rose-700 hover:bg-rose-800 text-white ring-4 ring-rose-200 animate-pulse'
                          : isSpeaking
                          ? 'bg-amber-600 text-white animate-bounce'
                          : 'bg-teal-800 hover:bg-teal-900 text-white'
                      }`}
                      title={isListening ? 'Stop listening' : 'Start speaking'}
                    >
                      {isListening ? (
                        <MicOff className="w-8 h-8" />
                      ) : (
                        <Mic className="w-8 h-8" />
                      )}
                    </button>

                    <div>
                      <span className={`font-black text-slate-900 block ${easyMode ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}>
                        {isSpeaking
                          ? (isPunjabi ? '🔊 ਏਆਈ ਬੋਲ ਰਿਹਾ ਹੈ... ਕਿਰਪਾ ਕਰਕੇ ਸੁਣੋ' : isHindi ? '🔊 डॉक्टर बोल रहे हैं... कृपया सुनें' : '🔊 AI is speaking...')
                          : isListening 
                          ? (isPunjabi ? '🎙️ ਸੁਣ ਰਹੇ ਹਾਂ... ਆਪਣਾ ਜਵਾਬ ਬੋਲੋ' : isHindi ? '🎙️ सुन रहे हैं... अपना उत्तर बोलें' : '🎙️ Listening... Speak naturally')
                          : (isPunjabi ? 'ਮਾਈਕ ਦਬਾ ਕੇ ਬੋਲੋ (Tap Mic to Speak)' : isHindi ? 'माइक दबाकर बोलें (Tap Mic to Speak)' : 'Tap Microphone to Speak')}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-600 font-medium">
                        {isSpeaking
                          ? (isPunjabi ? 'ਸਵਾਲ ਖਤਮ ਹੋਣ ਤੋਂ ਬਾਅਦ ਮਾਈਕ ਆਪਣੇ ਆਪ ਚਾਲੂ ਹੋਵੇਗਾ' : isHindi ? 'प्रश्न पूरा होने पर माइक स्वतः चालू हो जाएगा' : 'Mic will auto-start when AI finishes speaking')
                          : isListening
                          ? (isPunjabi ? 'ਬੋਲਣਾ ਬੰਦ ਕਰਨ ਤੇ ਜਵਾਬ ਆਪਣੇ ਆਪ ਦਰਜ ਹੋ ਜਾਵੇਗਾ' : isHindi ? 'बोलने के बाद उत्तर स्वतः सबमिट हो जाएगा' : 'Answer auto-submits when you finish speaking')
                          : (isPunjabi ? 'ਪੰਜਾਬੀ ਜਾਂ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਬੋਲ ਸਕਦੇ ਹੋ' : isHindi ? 'हिंदी अथवा अंग्रेजी में उत्तर दे सकते हैं' : 'Supports regional voice in selected language')}
                      </span>
                    </div>
                  </div>

                  {voiceTranscript && (
                    <button
                      type="button"
                      onClick={resetVoiceTranscript}
                      className="min-h-[44px] px-4 py-2 text-xs sm:text-sm font-bold text-slate-800 hover:text-slate-950 bg-white hover:bg-slate-100 rounded-xl border border-slate-300 flex items-center gap-2 self-start sm:self-auto transition-colors active:scale-95 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-600" />
                      <span>{isPunjabi ? 'ਦੁਬਾਰਾ ਬੋਲੋ (Retry)' : isHindi ? 'पुनः बोलें (Retry Mic)' : 'Clear & Retry Mic'}</span>
                    </button>
                  )}
                </div>

                {/* Live Speech Recognition Transcript Feedback */}
                {isListening && (
                  <div className="bg-teal-50 p-4 rounded-xl border border-teal-300 text-teal-950 text-sm sm:text-base flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-teal-600 animate-ping shrink-0" />
                      <span className="font-semibold italic">
                        {voiceTranscript || (isPunjabi ? 'ਬੋਲਣਾ ਸ਼ੁਰੂ ਕਰੋ, ਆਵਾਜ਼ ਦਰਜ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...' : isHindi ? 'बोलना शुरू करें, आवाज़ दर्ज की जा रही है...' : 'Listening for your voice...')}
                      </span>
                    </div>

                    {/* Auto Submit Countdown Indicator */}
                    {autoSubmitCountdown !== null && voiceTranscript.trim().length > 1 && (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-lg">
                          {isPunjabi ? 'ਆਟੋ-ਸਬਮਿਟ ਹੋ ਰਿਹਾ ਹੈ...' : isHindi ? 'ऑटो-सबमिट...' : 'Auto-submitting...'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            stopListening();
                            handleAnswerSubmit(voiceTranscript);
                          }}
                          className="px-3 py-1 bg-teal-800 text-white rounded-lg text-xs font-bold hover:bg-teal-900 cursor-pointer"
                        >
                          {isPunjabi ? 'ਹੁਣੇ ਭੇਜੋ' : isHindi ? 'तुरंत भेजें' : 'Send Now'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Real Voice Error Notice if encountered with direct RETRY action */}
            {voiceError && (
              <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-sm text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0" />
                  <span className="font-bold">{voiceError}</span>
                </div>
                <button
                  type="button"
                  onClick={startListening}
                  className="min-h-[44px] px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isPunjabi ? 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ (Retry)' : isHindi ? 'पुनः प्रयास करें (Retry)' : 'Retry Microphone'}</span>
                </button>
              </div>
            )}

            {/* Textarea for Manual Text Input or Transcript Verification */}
            <div className="space-y-2">
              <textarea
                value={currentAnswer}
                onChange={(e) => {
                  setCurrentAnswer(e.target.value);
                  setErrorMessage(null);
                }}
                rows={easyMode ? 4 : 3}
                disabled={isEvaluatingNextStep}
                placeholder={
                  isPunjabi
                    ? 'ਇੱਥੇ ਆਪਣਾ ਜਵਾਬ ਲਿਖੋ ਜਾਂ ਉੱਪਰ ਮਾਈਕ ਨਾਲ ਬੋਲੋ (ਉਦਾ: 2 ਦਿਨਾਂ ਤੋਂ ਛਾਤੀ ਵਿੱਚ ਦਰਦ ਹੈ)...'
                    : isHindi
                    ? 'यहाँ अपना उत्तर लिखें या ऊपर माइक से बोलें (उदा: 3 दिन से लगातार बुखार है, बदन दर्द है)...'
                    : 'Type your answer here or speak using the microphone above...'
                }
                className={`w-full px-5 py-4 rounded-2xl border-2 border-slate-300 focus:border-teal-700 focus:ring-4 focus:ring-teal-100 outline-none text-slate-900 transition-all resize-none shadow-2xs font-medium ${
                  easyMode ? 'text-lg sm:text-xl' : 'text-base'
                }`}
              />
              <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 font-medium px-1">
                <span>
                  {isPunjabi ? 'ਬੋਲੇ ਗਏ ਸ਼ਬਦ ਇੱਥੇ ਦਿਖਣਗੇ, ਤੁਸੀਂ ਬਦਲ ਵੀ ਸਕਦੇ ਹੋ।' :
                   isHindi ? 'बोले गए शब्द यहाँ दिखेंगे, आप उन्हें बदल भी सकते हैं।' :
                   'Transcribed words can be edited before submitting.'}
                </span>
                <span>{currentAnswer.length} chars</span>
              </div>
            </div>

            {/* Validation Error Message */}
            {errorMessage && (
              <div className="text-sm text-rose-900 font-bold bg-rose-50 p-3.5 rounded-xl border border-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons - Generous Touch Targets */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onBack}
                disabled={isEvaluatingNextStep}
                className={`w-full sm:w-auto min-h-[56px] px-6 py-3.5 rounded-xl border-2 border-slate-300 hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  easyMode ? 'text-base min-h-[64px]' : 'text-sm'
                }`}
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
                <span>{isPunjabi ? 'ਪਿੱਛੇ ਜਾਓ (Back)' : isHindi ? 'पीछे जाएं (Back)' : 'Previous Step'}</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                {/* Early Finish / Skip remainder */}
                {currentStepNumber >= 2 && (
                  <button
                    type="button"
                    onClick={handleFinishEarly}
                    disabled={isEvaluatingNextStep}
                    className={`w-full sm:w-auto min-h-[56px] px-5 py-3.5 rounded-xl border-2 border-slate-300 hover:bg-slate-100 text-slate-800 font-bold transition-colors cursor-pointer ${
                      easyMode ? 'text-base min-h-[64px]' : 'text-sm'
                    }`}
                  >
                    {isPunjabi ? 'ਗੱਲਬਾਤ ਸਮਾਪਤ ਕਰੋ' : isHindi ? 'साक्षात्कार समाप्त करें' : 'Finish Interview Early'}
                  </button>
                )}

                {/* Submit & Next Question - Primary Action Button */}
                <button
                  type="button"
                  onClick={() => handleAnswerSubmit()}
                  disabled={isEvaluatingNextStep || !currentAnswer.trim()}
                  className={`w-full sm:w-auto min-h-[56px] px-8 py-3.5 rounded-xl bg-teal-800 hover:bg-teal-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer ${
                    easyMode ? 'text-lg min-h-[64px] px-10' : 'text-base'
                  }`}
                >
                  {isEvaluatingNextStep ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{isPunjabi ? 'ਜਵਾਬ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ...' : isHindi ? 'विश्लेषण जारी...' : 'Structuring Answer...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isPunjabi ? 'ਜਵਾਬ ਭੇਜੋ ਤੇ ਅੱਗੇ ਵਧੋ' : isHindi ? 'उत्तर भेजें व आगे बढ़ें' : 'Submit & Next Question'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible Dialogue History (Shows patient previous questions & answers) */}
          {dialogueHistory.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <button
                type="button"
                onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-teal-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>
                    {isHindi 
                      ? `पूर्व पूछे गए प्रश्न एवं उत्तर (${dialogueHistory.length})`
                      : `Interview Dialogue Transcript (${dialogueHistory.length} Q&A)`}
                  </span>
                </div>
                {showHistoryDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showHistoryDrawer && (
                <div className="space-y-3 pt-2 border-t border-slate-100 max-h-60 overflow-y-auto pr-1">
                  {dialogueHistory.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span>Q{item.questionNumber}</span>
                        <span>{item.timestamp}</span>
                      </div>
                      <p className="font-bold text-slate-800">
                        Dr/AI: {item.question}
                      </p>
                      <p className="text-teal-900 font-medium bg-teal-50/80 p-2 rounded-lg border border-teal-100">
                        Patient: "{item.answer}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Final Structured History Summary View (Before Step 6) */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {isHindi ? 'संरचित क्लिनिकल केस हिस्ट्री तैयार है' : 'Structured Clinical History Generated'}
                </h3>
                <span className="text-xs text-slate-500">
                  {isHindi 
                    ? 'सभी उत्तरों को डॉक्टर के लिए संरचित कर दिया गया है'
                    : 'Clinical intake facts organized for OPD physician review'}
                </span>
              </div>
            </div>

            <span className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full font-bold text-xs self-start sm:self-auto">
              Completed • पूर्ण
            </span>
          </div>

          {/* Structured Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Chief Complaint & HPI */}
            <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                Chief Complaint & History of Present Illness (HPI):
              </span>
              <p className="text-sm font-extrabold text-slate-900">
                "{compiledSummary?.chiefComplaint || 'Consultation Request'}"
              </p>
              <p className="text-slate-700 text-xs leading-relaxed">
                {compiledSummary?.historyOfPresentIllness}
              </p>
              <div className="flex flex-wrap gap-4 pt-1 text-slate-600 font-medium">
                <span>Duration: <strong>{compiledSummary?.duration || 'Recent'}</strong></span>
                <span>Severity: <strong>{compiledSummary?.severity || '5/10'}</strong></span>
              </div>
            </div>

            {/* Associated Symptoms */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                Associated Symptoms:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {compiledSummary?.associatedSymptoms && compiledSummary.associatedSymptoms.length > 0 ? (
                  compiledSummary.associatedSymptoms.map((sym, i) => (
                    <span key={i} className="px-2.5 py-1 bg-teal-50 text-teal-900 border border-teal-200 rounded-lg font-bold">
                      {sym}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 italic">None reported</span>
                )}
              </div>
            </div>

            {/* Red Flags Status */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                Red Flags / Emergency Indicators:
              </span>
              {compiledSummary?.redFlags && compiledSummary.redFlags.length > 0 ? (
                <div className="space-y-1">
                  {compiledSummary.redFlags.map((rf, i) => (
                    <div key={i} className="px-2.5 py-1 bg-rose-100 text-rose-950 font-bold rounded-lg border border-rose-200">
                      ⚠️ {rf}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-emerald-800 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>No acute red flags identified</span>
                </div>
              )}
            </div>

            {/* Medical & Surgical History */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                Past Medical & Surgical History:
              </span>
              <p className="text-slate-800 font-semibold">
                Medical: {Array.isArray(compiledSummary?.pastMedicalHistory) ? compiledSummary?.pastMedicalHistory.join(', ') : 'None'}
              </p>
              <p className="text-slate-600">
                Surgical: {Array.isArray(compiledSummary?.pastSurgicalHistory) ? compiledSummary?.pastSurgicalHistory.join(', ') : 'None'}
              </p>
            </div>

            {/* Medications & Allergies */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                Medications & Drug Allergies:
              </span>
              <p className="text-slate-800 font-semibold">
                Medications: {Array.isArray(compiledSummary?.medications) ? compiledSummary.medications.join(', ') : String(compiledSummary?.medications || 'None')}
              </p>
              <p className="text-rose-700 font-bold">
                Allergies: {Array.isArray(compiledSummary?.allergies) ? compiledSummary.allergies.join(', ') : String(compiledSummary?.allergies || 'No Known Drug Allergies')}
              </p>
            </div>
          </div>

          {/* Final Step Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsInterviewCompleted(false)}
              className={`w-full sm:w-auto min-h-[56px] px-6 py-3 rounded-xl border-2 border-slate-300 hover:bg-slate-100 text-slate-800 font-bold transition-colors ${
                easyMode ? 'text-base min-h-[64px]' : 'text-sm'
              }`}
            >
              {isHindi ? 'प्रश्न दोबारा देखें (Review Questions)' : 'Review Questions'}
            </button>

            <button
              type="button"
              onClick={handleConfirmAndProceed}
              className={`w-full sm:w-auto min-h-[56px] px-8 py-3.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] ${
                easyMode ? 'text-lg min-h-[64px] px-10' : 'text-base'
              }`}
            >
              <span>{isHindi ? 'पुष्टि करें और दस्तावेज़ अपलोड पर जाएं' : 'Confirm & Proceed to Documents'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
