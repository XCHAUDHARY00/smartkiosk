import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Mic, 
  MicOff, 
  Sparkles, 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertCircle, 
  FileText, 
  Check, 
  Clock, 
  MessageSquare, 
  UserCheck,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Edit3
} from 'lucide-react';
import { 
  PatientProfile, 
  ClinicalSummary, 
  LanguageCode, 
  PatientVerificationRecord, 
  PatientVoiceCorrection 
} from '../../types';
import { 
  speakText, 
  stopSpeech, 
  createSpeechRecognizer, 
  playDoctorChime, 
  playSuccessChime, 
  playTouchFeedback, 
  unlockAudioSystem 
} from '../../services/speechService';
import { DOCTOR_TRANSLATIONS } from '../../utils/doctorTranslations';

interface PatientVerificationModalProps {
  patient: PatientProfile;
  summary: ClinicalSummary | null;
  onClose: () => void;
  onUpdateSummary: (updated: Partial<ClinicalSummary>) => void;
}

interface SummarySection {
  id: string;
  titleEn: string;
  titleHi: string;
  content: string;
  readoutText: string;
}

export const PatientVerificationModal: React.FC<PatientVerificationModalProps> = ({
  patient,
  summary,
  onClose,
  onUpdateSummary
}) => {
  const patientLang = patient.language || 'hi';
  const isHindi = patientLang.startsWith('hi');

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);
  const [readBackCompleted, setReadBackCompleted] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.95);

  // Voice correction state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [manualCorrectionText, setManualCorrectionText] = useState('');
  const [selectedCorrectionField, setSelectedCorrectionField] = useState<string>('general');
  const [isApplyingCorrection, setIsApplyingCorrection] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Active corrections list in local state
  const [correctionsList, setCorrectionsList] = useState<PatientVoiceCorrection[]>(
    summary?.patientVerification?.corrections || []
  );
  const [verificationStatus, setVerificationStatus] = useState<
    'unverified' | 'confirmed_accurate' | 'corrected_by_patient'
  >(summary?.patientVerification?.status || 'unverified');

  const recognizerRef = useRef<any>(null);
  const playQueueIndexRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);

  // Build the review sections from the clinical summary
  const sections: SummarySection[] = React.useMemo(() => {
    if (!summary) return [];

    const chief = summary.chiefComplaint || 'सामान्य स्वास्थ्य जांच (General Health Consultation)';
    const duration = summary.socrates?.timing || summary.socrates?.onset || '3-4 दिन (3-4 days)';
    const severity = summary.socrates?.severity || 'मध्यम (Moderate)';
    const character = summary.socrates?.character || 'लगातार तकलीफ (Continuous)';
    const associated = summary.socrates?.associatedSymptoms || 'अन्य कोई गंभीर लक्षण नहीं (None reported)';
    const pastMeds = summary.pastHistory || (summary.medications && summary.medications.length > 0 
      ? summary.medications.join(', ') 
      : 'कोई पुरानी दवा या गंभीर बीमारी नहीं (None)');

    if (isHindi) {
      return [
        {
          id: 'chief',
          titleHi: 'मुख्य समस्या (Chief Complaint)',
          titleEn: 'Chief Complaint',
          content: chief,
          readoutText: `आपकी मुख्य समस्या है: ${chief}।`
        },
        {
          id: 'duration',
          titleHi: 'लक्षण कब से हैं (Duration & Onset)',
          titleEn: 'Duration & Timing',
          content: duration,
          readoutText: `यह समस्या लगभग ${duration} से बनी हुई है।`
        },
        {
          id: 'severity',
          titleHi: 'दर्द व गंभीरता (Severity & Type)',
          titleEn: 'Severity & Character',
          content: `${severity} • ${character}`,
          readoutText: `लक्षण की गंभीरता: ${severity}, और इसका प्रकार: ${character} है।`
        },
        {
          id: 'associated',
          titleHi: 'अन्य लक्षण (Associated Symptoms)',
          titleEn: 'Associated Symptoms',
          content: associated,
          readoutText: `इसके साथ अन्य लक्षण: ${associated}।`
        },
        {
          id: 'history',
          titleHi: 'पुरानी बीमारी व दवाएं (History & Meds)',
          titleEn: 'Past History & Meds',
          content: pastMeds,
          readoutText: `पिछली बीमारी या दवाओं का विवरण: ${pastMeds}।`
        }
      ];
    }

    return [
      {
        id: 'chief',
        titleHi: 'मुख्य समस्या (Chief Complaint)',
        titleEn: 'Chief Complaint',
        content: chief,
        readoutText: `Your main health complaint is: ${chief}.`
      },
      {
        id: 'duration',
        titleHi: 'लक्षण कब से हैं (Duration & Onset)',
        titleEn: 'Duration & Timing',
        content: duration,
        readoutText: `The duration of this symptom is approximately ${duration}.`
      },
      {
        id: 'severity',
        titleHi: 'दर्द व गंभीरता (Severity & Type)',
        titleEn: 'Severity & Character',
        content: `${severity} • ${character}`,
        readoutText: `Reported severity is ${severity}, described as ${character}.`
      },
      {
        id: 'associated',
        titleHi: 'अन्य लक्षण (Associated Symptoms)',
        titleEn: 'Associated Symptoms',
        content: associated,
        readoutText: `Associated symptoms noted: ${associated}.`
      },
      {
        id: 'history',
        titleHi: 'पुरानी बीमारी व दवाएं (History & Meds)',
        titleEn: 'Past History & Meds',
        content: pastMeds,
        readoutText: `Past medical history and ongoing medications: ${pastMeds}.`
      }
    ];
  }, [summary, isHindi]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Sequential audio player helper
  const playSequentialSection = (index: number) => {
    if (!isPlayingRef.current) return;
    if (index >= sections.length) {
      // Completed reading all sections! Read final confirmation prompt
      setActiveSectionIndex(null);
      playQueueIndexRef.current = 0;
      setIsPlaying(false);
      isPlayingRef.current = false;
      setReadBackCompleted(true);

      const promptPhrase = isHindi
        ? 'क्या ये सभी विवरण पूरी तरह सही हैं, या आप कोई सुधार करना चाहते हैं?'
        : 'Are all these details accurate, or would you like to provide any voice corrections?';

      speakText(promptPhrase, patientLang, undefined, {
        rate: speechRate,
        playChime: true
      });
      return;
    }

    setActiveSectionIndex(index);
    playQueueIndexRef.current = index;

    const section = sections[index];
    speakText(
      section.readoutText,
      patientLang,
      () => {
        if (isPlayingRef.current) {
          // Pause slightly between sections for natural cadence
          setTimeout(() => {
            if (isPlayingRef.current) {
              playSequentialSection(index + 1);
            }
          }, 350);
        }
      },
      {
        rate: speechRate,
        playChime: index === 0
      }
    );
  };

  // Start reading full summary
  const handleStartReadBack = () => {
    unlockAudioSystem();
    playTouchFeedback();

    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    setIsPlaying(true);
    isPlayingRef.current = true;
    playQueueIndexRef.current = 0;

    // Greeting intro
    const greeting = isHindi
      ? `नमस्ते ${patient.name} जी, डॉक्टर साहब द्वारा रिकॉर्ड अंतिम करने से पहले कृपया अपने लक्षणों का सारांश सुनें।`
      : `Hello ${patient.name}, please listen to your clinical intake summary before the doctor finalizes your record.`;

    speakText(
      greeting,
      patientLang,
      () => {
        if (isPlayingRef.current) {
          playSequentialSection(0);
        }
      },
      { rate: speechRate, playChime: true }
    );
  };

  // Play an individual section
  const handlePlaySingleSection = (index: number) => {
    unlockAudioSystem();
    playTouchFeedback();

    stopSpeech();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setActiveSectionIndex(index);

    speakText(
      sections[index].readoutText,
      patientLang,
      () => {
        setActiveSectionIndex(null);
      },
      { rate: speechRate }
    );
  };

  // Stop reading
  const handleStopAudio = () => {
    stopSpeech();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setActiveSectionIndex(null);
  };

  // Confirm All Details as 100% Accurate
  const handleConfirmAccurate = () => {
    stopSpeech();
    unlockAudioSystem();
    playSuccessChime();

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const verificationRecord: PatientVerificationRecord = {
      verified: true,
      verifiedAt: timestamp,
      verifiedVia: 'touch',
      status: 'confirmed_accurate',
      readBackCompleted: true,
      corrections: correctionsList,
      notes: 'Patient confirmed all clinical summary details are 100% accurate.'
    };

    setVerificationStatus('confirmed_accurate');
    setSuccessMessage(
      isHindi 
        ? '✓ मरीज़ द्वारा सारांश पूर्णतः सत्यापित कर लिया गया है!' 
        : '✓ Clinical summary successfully verified and confirmed by patient!'
    );

    onUpdateSummary({
      patientVerification: verificationRecord
    });

    const ackPhrase = isHindi
      ? 'धन्यवाद, आपकी सभी जानकारी सत्यापित कर ली गई है।'
      : 'Thank you. Your details have been confirmed for the doctor.';

    speakText(ackPhrase, patientLang, undefined, { playChime: true });

    setTimeout(() => {
      onClose();
    }, 2000);
  };

  // Start Voice Recognition for Corrections
  const handleStartVoiceCorrection = () => {
    unlockAudioSystem();
    playTouchFeedback();
    handleStopAudio();

    if (isListening) {
      handleStopVoiceCorrection();
      return;
    }

    setSpeechError(null);
    setTranscript('');
    setInterimTranscript('');

    const recognizer = createSpeechRecognizer(patientLang, {
      onResult: (text: string, isFinal: boolean) => {
        if (isFinal) {
          setTranscript(prev => {
            const combined = prev ? `${prev} ${text}` : text;
            setManualCorrectionText(combined);
            return combined;
          });
          setInterimTranscript('');
        } else {
          setInterimTranscript(text);
        }
      },
      onError: (errMsg: string) => {
        setSpeechError(errMsg);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    if (recognizer) {
      recognizerRef.current = recognizer;
      try {
        recognizer.start();
        setIsListening(true);
      } catch (err: any) {
        setSpeechError('Microphone could not be started. You can type the correction below.');
        setIsListening(false);
      }
    } else {
      setSpeechError('Speech recognition is not supported in this browser. Please type the correction.');
    }
  };

  const handleStopVoiceCorrection = () => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  // Apply Quick Correction Chips
  const handleApplyQuickChip = (chipText: string, field: string) => {
    playTouchFeedback();
    setManualCorrectionText(chipText);
    setSelectedCorrectionField(field);
  };

  // Save the Voice Correction to the Summary
  const handleSaveCorrection = () => {
    const finalCorrection = manualCorrectionText.trim() || transcript.trim();
    if (!finalCorrection) return;

    unlockAudioSystem();
    setIsApplyingCorrection(true);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newCorrection: PatientVoiceCorrection = {
      timestamp,
      transcript: finalCorrection,
      fieldUpdated: selectedCorrectionField,
      newValue: finalCorrection
    };

    const updatedCorrections = [newCorrection, ...correctionsList];
    setCorrectionsList(updatedCorrections);
    setVerificationStatus('corrected_by_patient');

    // Intelligently update the clinical summary fields
    const updatedHpi = summary?.historyOfPresentIllness 
      ? `${summary.historyOfPresentIllness}\n\n[Patient Voice Correction at ${timestamp}]: ${finalCorrection}`
      : `[Patient Voice Correction at ${timestamp}]: ${finalCorrection}`;

    const updatedDoctorNotes = summary?.doctorConsultationNotes
      ? `${summary.doctorConsultationNotes}\n[Patient Amendment]: ${finalCorrection}`
      : `[Patient Amendment]: ${finalCorrection}`;

    // Specific slot updating if duration or severity is detected
    let updatedSocrates = { ...(summary?.socrates || {}) };
    if (selectedCorrectionField === 'duration' || finalCorrection.toLowerCase().includes('दिन') || finalCorrection.toLowerCase().includes('day') || finalCorrection.toLowerCase().includes('हफ्ता') || finalCorrection.toLowerCase().includes('week')) {
      updatedSocrates.timing = finalCorrection;
      updatedSocrates.onset = finalCorrection;
    }

    const verificationRecord: PatientVerificationRecord = {
      verified: true,
      verifiedAt: timestamp,
      verifiedVia: 'voice',
      status: 'corrected_by_patient',
      readBackCompleted: true,
      corrections: updatedCorrections,
      notes: `Patient provided correction: "${finalCorrection}"`
    };

    onUpdateSummary({
      historyOfPresentIllness: updatedHpi,
      doctorConsultationNotes: updatedDoctorNotes,
      socrates: updatedSocrates,
      patientVerification: verificationRecord
    });

    playSuccessChime();
    setSuccessMessage(
      isHindi 
        ? `✓ सुधार दर्ज हो गया: "${finalCorrection}"` 
        : `✓ Correction applied: "${finalCorrection}"`
    );

    const confirmSpoken = isHindi
      ? 'आपका सुधार रिकॉर्ड में जोड़ दिया गया है।'
      : 'Your correction has been recorded for the doctor.';

    speakText(confirmSpoken, patientLang);

    setIsApplyingCorrection(false);
    setManualCorrectionText('');
    setTranscript('');
    setInterimTranscript('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-heading">
                  Verify with Patient (मरीज़ से पुष्टि कराएं)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-teal-700/80 text-[10px] font-mono border border-teal-500/40">
                  Token {patient.tokenNumber}
                </span>
              </div>
              <p className="text-xs text-teal-200">
                AI Read-Back &amp; Voice Correction Mode • {patient.name} ({patient.age}Y • {patient.mobile || 'No Mobile'})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-700">

          {/* Success Banner if any */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-950 font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Verification Status Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {verificationStatus === 'confirmed_accurate' ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed 100% Accurate by Patient
                    </span>
                  ) : verificationStatus === 'corrected_by_patient' ? (
                    <span className="text-amber-700 flex items-center gap-1">
                      <Edit3 className="w-3.5 h-3.5" /> Verified with Patient Voice Corrections
                    </span>
                  ) : (
                    <span className="text-slate-700">
                      Record Pending Patient Voice Confirmation (पुष्टि बाकी है)
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-slate-500">
                  Doctor can listen to AI read-back or let patient verify details before finalizing prescription
                </span>
              </div>
            </div>

            {/* Readout Speech Rate Controls */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] font-semibold text-slate-500">Voice Speed:</span>
              <button
                type="button"
                onClick={() => setSpeechRate(0.85)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                  speechRate === 0.85 
                    ? 'bg-teal-700 text-white border-teal-700' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                title="Slower voice for elderly patients"
              >
                0.85x (धीमी)
              </button>
              <button
                type="button"
                onClick={() => setSpeechRate(1.0)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                  speechRate === 1.0 
                    ? 'bg-teal-700 text-white border-teal-700' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                1.0x (सामान्य)
              </button>
            </div>
          </div>

          {/* AI Read-Back Control Card */}
          <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-950">
                  AI Read-Back of Clinical Summary (सारांश बोलकर सुनाएं)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-teal-800 bg-white px-2.5 py-0.5 rounded-full border border-teal-200">
                Language: {patientLang.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-teal-900 leading-relaxed">
              AI मरीज़ के सभी दर्ज लक्षणों, अवधि व इतिहास को उनकी भाषा में एक-एक करके पढ़कर सुनाएगा:
            </p>

            {/* Audio Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleStartReadBack}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95 ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                    : 'bg-teal-700 hover:bg-teal-800 text-white'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-white" />
                    <span>रोकें (Pause Read-Back)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>🔊 पूरा सारांश बोलकर सुनाएं (Read Out All Details)</span>
                  </>
                )}
              </button>

              {isPlaying && (
                <button
                  type="button"
                  onClick={handleStopAudio}
                  className="px-3 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <VolumeX className="w-3.5 h-3.5 text-red-600" />
                  <span>बंद करें (Stop)</span>
                </button>
              )}

              {readBackCompleted && !isPlaying && (
                <span className="text-xs text-emerald-800 font-bold bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Read-back completed</span>
                </span>
              )}
            </div>
          </div>

          {/* Breakdown Sections with Visual Karaoke Highlights */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center justify-between">
              <span>Review Sections (जांचे जाने वाले बिंदु)</span>
              <span className="text-[10px] text-slate-400 font-normal">Click any card to read it individually</span>
            </h4>

            <div className="grid grid-cols-1 gap-2">
              {sections.map((sec, idx) => {
                const isCurrent = activeSectionIndex === idx;
                return (
                  <div
                    key={sec.id}
                    onClick={() => handlePlaySingleSection(idx)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isCurrent
                        ? 'bg-amber-50/90 border-amber-400 shadow-md ring-2 ring-amber-300'
                        : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5 ${
                        isCurrent ? 'bg-amber-500 text-white animate-bounce' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{sec.titleHi}</span>
                          {isCurrent && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 animate-pulse">
                              Now Speaking...
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 mt-0.5 font-medium break-words">
                          {sec.content}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shrink-0 ${
                        isCurrent ? 'bg-amber-200 text-amber-950' : 'text-slate-400 hover:text-teal-700'
                      }`}
                      title="Read this section"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Voice Correction Section */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-amber-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                  Quick Voice Correction (मरीज़ द्वारा बोलकर सुधार)
                </h3>
              </div>
              <span className="text-[10px] text-amber-800 font-medium">
                Live Speech-to-Text
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              यदि मरीज़ कहता है कि कोई जानकारी बदलनी है (जैसे अवधि 3 दिन नहीं 10 दिन है, या हल्का बुखार भी है), तो माइक दबाकर बुलवाएं:
            </p>

            {/* Microphone Button & Waveform Display */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleStartVoiceCorrection}
                className={`w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95 ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 animate-spin" />
                    <span>सुन रहे हैं... (Listening... Tap to Stop)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>🎤 माइक चालू करें (Start Voice Correction)</span>
                  </>
                )}
              </button>

              {/* Quick Correction Suggestion Chips */}
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                <span className="text-[10px] text-slate-500 font-semibold">Quick Chips:</span>
                <button
                  type="button"
                  onClick={() => handleApplyQuickChip('समस्या 1 हफ्ते से ज्यादा समय से है', 'duration')}
                  className="px-2 py-1 bg-white hover:bg-amber-100 text-slate-700 rounded-lg text-[10px] font-semibold border border-amber-200 cursor-pointer"
                >
                  ⏱️ अवधि ज्यादा है (1 week+)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyQuickChip('हल्का बुखार भी है', 'fever')}
                  className="px-2 py-1 bg-white hover:bg-amber-100 text-slate-700 rounded-lg text-[10px] font-semibold border border-amber-200 cursor-pointer"
                >
                  🤒 हल्का बुखार भी है
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyQuickChip('बीपी की नियमित दवा लेता हूँ', 'meds')}
                  className="px-2 py-1 bg-white hover:bg-amber-100 text-slate-700 rounded-lg text-[10px] font-semibold border border-amber-200 cursor-pointer"
                >
                  💊 बीपी की दवा लेता हूँ
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyQuickChip('दर्द बहुत तेज है', 'severity')}
                  className="px-2 py-1 bg-white hover:bg-amber-100 text-slate-700 rounded-lg text-[10px] font-semibold border border-amber-200 cursor-pointer"
                >
                  ⚡ दर्द तेज है
                </button>
              </div>
            </div>

            {/* Error banner if microphone denied */}
            {speechError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{speechError}</span>
              </div>
            )}

            {/* Live Captured Speech / Editable Correction Box */}
            <div className="space-y-2 pt-1">
              <div className="relative">
                <textarea
                  rows={2}
                  value={manualCorrectionText || transcript || interimTranscript}
                  onChange={(e) => setManualCorrectionText(e.target.value)}
                  placeholder="मरीज़ का बोला गया सुधार यहाँ दिखाई देगा या आप खुद भी टाइप कर सकते हैं (Voice transcript or type correction here)..."
                  className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden leading-relaxed text-slate-900"
                />
                {isListening && (
                  <span className="absolute right-2.5 bottom-2.5 flex items-center gap-1 text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full animate-pulse border border-red-200">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    Listening now...
                  </span>
                )}
              </div>

              {(manualCorrectionText || transcript) && (
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setManualCorrectionText('');
                      setTranscript('');
                      setInterimTranscript('');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    रद्द करें (Clear)
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCorrection}
                    disabled={isApplyingCorrection}
                    className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>रिकॉर्ड में जोड़ें (Apply Correction)</span>
                  </button>
                </div>
              )}
            </div>

            {/* List of Applied Voice Corrections */}
            {correctionsList.length > 0 && (
              <div className="pt-2 border-t border-amber-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-700" />
                  <span>दर्ज किए गए सुधार (Recorded Voice Amendments):</span>
                </span>
                <div className="space-y-1">
                  {correctionsList.map((corr, cIdx) => (
                    <div 
                      key={cIdx} 
                      className="p-2 bg-white/90 border border-amber-200 rounded-xl text-xs text-slate-800 flex items-start justify-between gap-2"
                    >
                      <div>
                        <span className="font-semibold text-amber-950">"{corr.transcript}"</span>
                        <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                          At {corr.timestamp} • Field: {corr.fieldUpdated || 'General amendment'}
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-900 rounded text-[10px] font-bold shrink-0">
                        Added to Record
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span>पुष्टि होने पर पर्चे में <strong>Patient Confirmed</strong> बैज जुड़ जाएगा।</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              बाद में करें (Cancel)
            </button>

            <button
              type="button"
              onClick={handleConfirmAccurate}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>✓ हाँ, सब विवरण सही हैं (Confirm All Accurate)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
