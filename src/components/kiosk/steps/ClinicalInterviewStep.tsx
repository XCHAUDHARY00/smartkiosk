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
  ChevronUp
} from 'lucide-react';
import { 
  StructuredClinicalInterview, 
  LanguageCode, 
  InterviewDialogueEntry,
  InterviewStepResponse 
} from '../../../types';
import { fetchNextInterviewStep } from '../../../services/clinicalInterviewService';

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
}

// Check speech recognition API support
const getSpeechRecognitionClass = () => {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
};

// Map LanguageCode to BCP-47 for speech recognition and synthesis
const getBcp47Locale = (lang: LanguageCode): string => {
  switch (lang) {
    case 'hi': return 'hi-IN';
    case 'pa': return 'pa-IN';
    case 'bn': return 'bn-IN';
    case 'mr': return 'mr-IN';
    case 'en':
    default:
      return 'en-IN';
  }
};

export const ClinicalInterviewStep: React.FC<ClinicalInterviewStepProps> = ({
  initialInterview,
  onSaveInterview,
  onNext,
  onBack,
  language,
  patientDraft
}) => {
  const isHindi = language === 'hi';

  // Interview state
  const [currentStepNumber, setCurrentStepNumber] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<string>(
    isHindi 
      ? 'नमस्ते! आज आप किस मुख्य परेशानी या बीमारी की जांच कराने अस्पताल आए हैं?'
      : 'Hello! What primary symptom or health concern brought you to the hospital today?'
  );
  const [currentQuestionEnglish, setCurrentQuestionEnglish] = useState<string>(
    'Hello! What primary symptom or health concern brought you to the hospital today?'
  );
  const [quickReplies, setQuickReplies] = useState<string[]>(
    isHindi
      ? ['सीने में दर्द व भारीपन', 'तेज बुखार एवं कंपकंपी', 'खांसी व सांस की तकलीफ', 'पेट में दर्द या उल्टी', 'घुटनों व जोड़ों में दर्द']
      : ['Chest Pain / Heaviness', 'High Fever & Chills', 'Cough & Shortness of Breath', 'Stomach Pain / Nausea', 'Joint / Knee Pain']
  );
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

  // Real Speech Recognition state
  const SpeechRecognitionClass = getSpeechRecognitionClass();
  const isVoiceSupported = Boolean(SpeechRecognitionClass);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Real Text-to-Speech state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const isTtsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Speak question function
  const speakText = useCallback((text: string) => {
    if (!isTtsSupported) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getBcp47Locale(language);
      utterance.rate = 0.92; // Slightly slower, clear pace for OPD patients
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

  // Read question aloud on step change if patient clicked or on prompt
  const handleReplayQuestion = () => {
    speakText(currentQuestion);
  };

  // Safe Browser Speech Recognition lifecycle
  const startListening = () => {
    setVoiceError(null);
    if (!SpeechRecognitionClass) {
      setVoiceError(
        isHindi 
          ? 'इस ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है। कृपया नीचे टाइप करें।'
          : 'Voice input unavailable in this browser environment. Please type your answer.'
      );
      return;
    }

    try {
      stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognitionClass();
      recognition.lang = getBcp47Locale(language);
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        const text = finalTranscript || interimTranscript;
        setVoiceTranscript(text);
        setCurrentAnswer(text);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceError(
            isHindi 
              ? 'माइक्रोफ़ोन अनुमति अस्वीकार कर दी गई है। कृपया टेक्स्ट इनपुट का उपयोग करें।'
              : 'Microphone permission denied. Please allow microphone in browser or type below.'
          );
        } else if (event.error === 'no-speech') {
          setVoiceError(
            isHindi 
              ? 'कोई आवाज़ सुनाई नहीं दी। कृपया माइक दबाकर पुनः बोलें या टाइप करें।'
              : 'No speech detected. Please tap mic and speak clearly, or type below.'
          );
        } else if (event.error === 'network') {
          setVoiceError(
            isHindi 
              ? 'वॉइस सेवा नेटवर्क त्रुटि। कृपया टाइप करके उत्तर दें।'
              : 'Voice recognition network error. Please type your answer below.'
          );
        } else {
          setVoiceError(
            isHindi 
              ? `वॉइस इनपुट त्रुटि (${event.error})। कृपया टाइप करें।`
              : `Voice input error (${event.error}). Please type your answer.`
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
      setVoiceError(
        isHindi 
          ? 'माइक्रोफ़ोन शुरू नहीं हो सका। कृपया नीचे टाइप करें।'
          : 'Could not initialize microphone. Please type your answer below.'
      );
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const resetVoiceTranscript = () => {
    stopListening();
    setVoiceTranscript('');
    setCurrentAnswer('');
    setVoiceError(null);
  };

  // Submit Answer & Determine Next Adaptive Question
  const handleAnswerSubmit = async (answerTextToSubmit?: string, isFinalOverride?: boolean) => {
    const textToSubmit = (answerTextToSubmit !== undefined ? answerTextToSubmit : currentAnswer).trim();
    if (!textToSubmit && !isFinalOverride) {
      setErrorMessage(
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
      } else {
        // Advance to next adaptive question
        setCurrentStepNumber(prev => prev + 1);
        setCurrentQuestion(response.nextQuestion);
        setCurrentQuestionEnglish(response.nextQuestionEnglish);
        setQuickReplies(response.quickReplies || []);
        setCurrentAnswer('');
        setVoiceTranscript('');
      }
    } catch (err) {
      console.error('Error advancing interview step:', err);
      setErrorMessage(
        isHindi 
          ? 'नेटवर्क समस्या। कृपया पुनः प्रयास करें।' 
          : 'Network issue while determining next clinical question. Please retry.'
      );
    } finally {
      setIsEvaluatingNextStep(false);
    }
  };

  // Quick choice selection
  const handleSelectQuickReply = (reply: string) => {
    setCurrentAnswer(reply);
    handleAnswerSubmit(reply);
  };

  // Skip / "I don't know"
  const handleIDontKnow = () => {
    const text = isHindi ? 'मुझे ठीक से नहीं पता / अनिश्चित' : "I don't know / Not sure";
    setCurrentAnswer(text);
    handleAnswerSubmit(text);
  };

  // Early finish request
  const handleFinishEarly = () => {
    handleAnswerSubmit(currentAnswer.trim() || 'Skipped remainder of questions', true);
  };

  // Final confirmation to proceed to Step 6
  const handleConfirmAndProceed = () => {
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
          <span>Step 5 of 8 • चरण 5 (अनुकूली क्लिनिकल केस-टेकिंग)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
          {isHindi ? 'एआई-सहायता प्राप्त क्लिनिकल साक्षात्कार' : 'Adaptive AI-Assisted Clinical Interview'}
        </h2>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          {isHindi
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
              <span>{isHindi ? 'महत्वपूर्ण लक्षण चेतावनी (Triage Alert Flag)' : 'High Priority Clinical Alert Detected'}</span>
            </h4>
            <p className="text-rose-800 text-xs leading-relaxed">
              {isHindi
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
          {/* Progress Indicator */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5 text-teal-800 font-bold">
                <Activity className="w-4 h-4 text-teal-600" />
                {isHindi ? `प्रश्न ${currentStepNumber} (अधिकतम 5)` : `Question ${currentStepNumber} of 5`}
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-teal-500/30 shadow-md space-y-5 relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 block">
                    {isHindi ? 'डॉक्टर हेतु केस-टेकिंग प्रश्न' : 'Clinical Intake Question'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {isHindi ? 'कृपया स्पष्ट उत्तर दें' : 'Please provide accurate details'}
                  </span>
                </div>
              </div>

              {/* TTS Audio Button */}
              {isTtsSupported && (
                <button
                  type="button"
                  onClick={isSpeaking ? stopSpeaking : handleReplayQuestion}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                    isSpeaking 
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                  title={isSpeaking ? 'Stop speaking' : 'Play question aloud'}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4 text-amber-700" />
                      <span>{isHindi ? 'रोकें (Stop)' : 'Stop'}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-teal-700" />
                      <span>{isHindi ? 'प्रश्न सुनें (Listen)' : 'Hear Question'}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Question Text */}
            <div className="space-y-1.5 pt-2">
              <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 leading-snug">
                "{currentQuestion}"
              </h3>
              {language !== 'en' && currentQuestionEnglish && (
                <p className="text-sm font-medium text-slate-500 italic">
                  English translation: "{currentQuestionEnglish}"
                </p>
              )}
            </div>

            {/* Quick-Tap Options */}
            {quickReplies && quickReplies.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {isHindi ? 'त्वरित विकल्प (Tap to Select):' : 'Quick Options:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isEvaluatingNextStep}
                      onClick={() => handleSelectQuickReply(reply)}
                      className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-900 text-slate-800 text-xs sm:text-sm font-bold border border-slate-200 transition-all text-left shadow-2xs"
                    >
                      {reply}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={isEvaluatingNextStep}
                    onClick={handleIDontKnow}
                    className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs sm:text-sm font-medium border border-slate-200 transition-all flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isHindi ? 'मुझे नहीं पता (Skip)' : "I don't know / Skip"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Patient Input Area */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-teal-600" />
                <span>{isHindi ? 'आपका उत्तर (Your Answer):' : 'Your Answer:'}</span>
              </label>

              {/* Voice Support Status */}
              <div className="text-xs font-medium">
                {isVoiceSupported ? (
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Speech API Ready
                  </span>
                ) : (
                  <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg font-semibold border border-amber-200">
                    Type Mode Active
                  </span>
                )}
              </div>
            </div>

            {/* Voice Input Section with Real Speech Recognition */}
            {isVoiceSupported && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={isListening ? stopListening : startListening}
                      disabled={isEvaluatingNextStep}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-md shrink-0 ${
                        isListening
                          ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-200 animate-pulse'
                          : 'bg-teal-600 hover:bg-teal-700 text-white'
                      }`}
                      title={isListening ? 'Stop listening' : 'Start speaking'}
                    >
                      {isListening ? (
                        <MicOff className="w-7 h-7" />
                      ) : (
                        <Mic className="w-7 h-7" />
                      )}
                    </button>

                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block">
                        {isListening 
                          ? (isHindi ? '🎙️ सुन रहे हैं... कृपया स्पष्ट बोलें' : '🎙️ Listening... Speak your answer')
                          : (isHindi ? 'माइक दबाकर बोलें (Tap Mic to Speak)' : 'Tap Microphone to Speak')}
                      </span>
                      <span className="text-xs text-slate-500">
                        {isListening
                          ? (isHindi ? 'समाप्त करने हेतु पुनः माइक दबाएं' : 'Tap again when finished speaking')
                          : (isHindi ? 'हिंदी अथवा अंग्रेजी में उत्तर दे सकते हैं' : 'Supports Hindi and English speech')}
                      </span>
                    </div>
                  </div>

                  {voiceTranscript && (
                    <button
                      type="button"
                      onClick={resetVoiceTranscript}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isHindi ? 'पुनः बोलें (Retry)' : 'Clear & Retry'}</span>
                    </button>
                  )}
                </div>

                {/* Live Speech Recognition Transcript Feedback */}
                {isListening && (
                  <div className="bg-white p-3.5 rounded-xl border border-teal-200 text-teal-950 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping shrink-0" />
                    <span className="italic">
                      {voiceTranscript || (isHindi ? 'बोलना प्रारंभ करें...' : 'Listening for your voice...')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Fallback Notice if voice is unsupported */}
            {!isVoiceSupported && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {isHindi 
                    ? 'वॉइस इनपुट इस डिवाइस/ब्राउज़र पर उपलब्ध नहीं है — कृपया नीचे अपना उत्तर टाइप करें।'
                    : 'Voice input unavailable on this browser/device — please type your answer below.'}
                </span>
              </div>
            )}

            {/* Real Voice Error Notice if encountered */}
            {voiceError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{voiceError}</span>
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
                rows={3}
                disabled={isEvaluatingNextStep}
                placeholder={
                  isHindi
                    ? 'यहाँ अपना उत्तर लिखें या ऊपर माइक से बोलें (उदा: 3 दिन से लगातार बुखार है, बदन दर्द है)...'
                    : 'Type your answer here or speak above (e.g., Having chest pain since 2 hours radiating to left arm)...'
                }
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none text-slate-900 text-base transition-all resize-none shadow-2xs"
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{isHindi ? 'आप जो बोल रहे हैं वह यहाँ दिखाई देगा जिसे आप संपादित भी कर सकते हैं।' : 'Spoken words can be edited directly before sending.'}</span>
                <span>{currentAnswer.length} chars</span>
              </div>
            </div>

            {/* Validation Error Message */}
            {errorMessage && (
              <div className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {errorMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onBack}
                disabled={isEvaluatingNextStep}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isHindi ? 'पीछे जाएं (Back)' : 'Previous Step'}</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Early Finish / Skip remainder */}
                {currentStepNumber >= 2 && (
                  <button
                    type="button"
                    onClick={handleFinishEarly}
                    disabled={isEvaluatingNextStep}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-colors"
                  >
                    {isHindi ? 'साक्षात्कार समाप्त करें' : 'Finish Interview'}
                  </button>
                )}

                {/* Submit & Next Question */}
                <button
                  type="button"
                  onClick={() => handleAnswerSubmit()}
                  disabled={isEvaluatingNextStep || !currentAnswer.trim()}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  {isEvaluatingNextStep ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isHindi ? 'विश्लेषण जारी...' : 'Structuring Answer...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isHindi ? 'उत्तर भेजें व आगे बढ़ें' : 'Submit & Next Question'}</span>
                      <ArrowRight className="w-4 h-4" />
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsInterviewCompleted(false)}
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-colors"
            >
              {isHindi ? 'प्रश्न दोबारा देखें' : 'Review Questions'}
            </button>

            <button
              type="button"
              onClick={handleConfirmAndProceed}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all"
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
