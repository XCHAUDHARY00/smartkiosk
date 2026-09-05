import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Play, 
  Sparkles, 
  Smartphone, 
  Settings, 
  RefreshCw,
  Info
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { testAndroidAudioAndVoice, playDoctorChime, speakText, unlockAudioSystem } from '../../services/speechService';

interface SoundDiagnosticModalProps {
  currentLanguage: LanguageCode;
  onClose: () => void;
}

export const SoundDiagnosticModal: React.FC<SoundDiagnosticModalProps> = ({
  currentLanguage,
  onClose
}) => {
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [hasWebSpeech, setHasWebSpeech] = useState(false);
  const [voiceCount, setVoiceCount] = useState(0);
  const [androidBridgeName, setAndroidBridgeName] = useState<string | null>(null);

  useEffect(() => {
    // Check system status
    if (typeof window !== 'undefined') {
      const speechAvailable = 'speechSynthesis' in window;
      setHasWebSpeech(speechAvailable);

      if (speechAvailable) {
        const voices = window.speechSynthesis.getVoices();
        setVoiceCount(voices.length);
      }

      // Check native Android bridge
      const w = window as any;
      if (w.AndroidApp && typeof w.AndroidApp.speak === 'function') {
        setAndroidBridgeName('window.AndroidApp (Native Android Interface)');
      } else if (w.Android && typeof w.Android.speak === 'function') {
        setAndroidBridgeName('window.Android (Native Android Interface)');
      } else if (w.android && typeof w.android.speak === 'function') {
        setAndroidBridgeName('window.android (Native Android Interface)');
      } else {
        setAndroidBridgeName(null);
      }
    }
  }, []);

  const handleRunSoundTest = async () => {
    setIsPlayingTest(true);
    setTestResult(null);
    unlockAudioSystem();

    try {
      const res = await testAndroidAudioAndVoice(currentLanguage || 'hi-IN');
      if (res.ok) {
        setTestResult('ध्वनि परीक्षण सफल! क्या आपको आवाज सुनाई दी? (Sound test played successfully)');
      } else {
        setTestResult(`परीक्षण नोट: ${res.message}`);
      }
    } catch (err: any) {
      setTestResult(`त्रुटि: ${err?.message || 'ऑडियो शुरू नहीं हो सका'}`);
    } finally {
      setTimeout(() => {
        setIsPlayingTest(false);
      }, 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-heading">
                Android आवाज़ व साउंड समस्या समाधान
              </h2>
              <p className="text-xs text-teal-200">
                Android Sound &amp; Voice Diagnostics
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

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
          
          {/* Quick Sound Test Box */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-700" />
                <span>तुरंत आवाज़ चेक करें (One-Tap Voice Test)</span>
              </span>
              <span className="text-[11px] font-bold text-teal-700 bg-white px-2 py-0.5 rounded-full border border-teal-200">
                {currentLanguage.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-teal-900 leading-relaxed">
              नीचे दिए बटन पर टैप करने से ब्राउज़र का ऑडियो अनलॉक होता है और डॉक्टर की आवाज़ बोलती है:
            </p>
            <button
              type="button"
              onClick={handleRunSoundTest}
              disabled={isPlayingTest}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                isPlayingTest 
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-teal-700 hover:bg-teal-800 text-white active:scale-98'
              }`}
            >
              {isPlayingTest ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>आवाज़ चल रही है... (Testing Sound...)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>🔊 बोलकर टेस्ट करें (Test Sound &amp; Speech Now)</span>
                </>
              )}
            </button>
            {testResult && (
              <div className="p-2.5 rounded-xl bg-white border border-teal-200 text-teal-900 text-xs font-medium">
                {testResult}
              </div>
            )}
          </div>

          {/* Android Troubleshooting Checklist */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-slate-600" />
              <span>Android फोन में आवाज़ न आने के 4 मुख्य कारण:</span>
            </h3>

            <div className="space-y-2">
              
              {/* 1. Media Volume */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-extrabold shrink-0">1</span>
                  <span>फोन का "मीडिया वॉल्यूम" (Media Volume) चेक करें:</span>
                </div>
                <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                  अक्सर फोन का <strong>Ringtone Volume</strong> चालू होता है परंतु <strong>Media Volume (गानें/वीडियो की आवाज़)</strong> म्यूट या 0% पर होती है। फोन का साइड वॉल्यूम बटन दबाकर <strong>Media Slider</strong> को 100% करें।
                </p>
              </div>

              {/* 2. Chrome Autoplay Lock */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-extrabold shrink-0">2</span>
                  <span>Android Chrome ऑटोप्ले सुरक्षा (User Tap Required):</span>
                </div>
                <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                  Android Chrome बिना स्क्रीन को छुए अपने-आप आवाज़ नहीं बजाता। स्क्रीन पर किसी भी बटन को 1 बार दबाते ही आवाज़ अनलॉक हो जाती है।
                </p>
              </div>

              {/* 3. Google Speech Services Engine */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-extrabold shrink-0">3</span>
                  <span>Google Text-to-Speech इंजन (Google Speech Services):</span>
                </div>
                <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                  कुछ Android फोन (Samsung, Vivo, Xiaomi) में हिंदी व भारतीय भाषाओं की आवाज़ डाउनलोड नहीं होती। अपने फोन की <strong>Settings &gt; Accessibility / System &gt; Text-to-speech output</strong> में जाकर <strong>Speech Services by Google</strong> चुनें व हिंदी/अंग्रेजी वॉइस पैक डाउनलोड करें।
                </p>
              </div>

              {/* 4. Do Not Disturb / Bluetooth */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-extrabold shrink-0">4</span>
                  <span>Silent Mode / Bluetooth Earphone चेक करें:</span>
                </div>
                <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                  जांचें कि फोन Silent/DND मोड पर न हो और कोई ब्लूटूथ ईयरफोन कनेक्टेड न हो जिसमें आवाज़ जा रही हो।
                </p>
              </div>

            </div>
          </div>

          {/* Device Technical Info */}
          <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-teal-700" />
              <span>डिवाइस ऑडियो स्थिति (Device Technical Status):</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
              <div>Web Speech API: <strong>{hasWebSpeech ? 'उपलब्ध (Active)' : 'नहीं'}</strong></div>
              <div>Installed Voices: <strong>{voiceCount > 0 ? `${voiceCount} voices` : 'Loading...'}</strong></div>
              <div className="col-span-2">
                Native Android Bridge: <strong>{androidBridgeName || 'Standard Web TTS Engine'}</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            समझ गया (OK, Close)
          </button>
        </div>
      </div>
    </div>
  );
};
