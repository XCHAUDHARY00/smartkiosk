import React from 'react';
import { Volume2, Check, ArrowRight, Globe } from 'lucide-react';
import { LanguageCode } from '../../../types';

interface LanguageOption {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  scriptGreeting: string;
  region: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    code: 'hi',
    nativeName: 'हिन्दी',
    englishName: 'Hindi',
    scriptGreeting: 'नमस्ते, स्वास्थ्य सेवा में आपका स्वागत है',
    region: 'National / उत्तर भारत'
  },
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    scriptGreeting: 'Welcome to AIIMS Smart OPD Intake',
    region: 'Official / All India'
  },
  {
    code: 'pa',
    nativeName: 'ਪੰਜਾਬੀ',
    englishName: 'Punjabi',
    scriptGreeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ',
    region: 'Punjab / Chandigarh'
  },
  {
    code: 'bn',
    nativeName: 'বাংলা',
    englishName: 'Bengali',
    scriptGreeting: 'নমস্কার, আপনাকে স্বাগতম',
    region: 'West Bengal / Eastern'
  },
  {
    code: 'mr',
    nativeName: 'मराठी',
    englishName: 'Marathi',
    scriptGreeting: 'नमस्कार, आपले स्वागत आहे',
    region: 'Maharashtra'
  }
];

interface LanguageStepProps {
  selectedLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onNext: () => void;
}

export const LanguageStep: React.FC<LanguageStepProps> = ({
  selectedLanguage,
  onSelectLanguage,
  onNext
}) => {
  const handlePlayVoiceGreeting = (lang: LanguageOption) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(lang.scriptGreeting);
        utterance.lang = lang.code === 'hi' ? 'hi-IN' : lang.code === 'pa' ? 'pa-IN' : lang.code === 'bn' ? 'bn-IN' : lang.code === 'mr' ? 'mr-IN' : 'en-US';
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        // audio speech synthesis fallback
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/80 text-teal-800 text-xs font-bold uppercase tracking-wider">
          <Globe className="w-3.5 h-3.5" />
          Step 1 of 9 • चरण 1
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
          अपनी भाषा चुनें / Select Your Language
        </h2>
        <p className="text-sm text-slate-500">
          Please choose the language you feel most comfortable speaking or reading during OPD consultation.
        </p>
      </div>

      {/* Language Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-w-3xl mx-auto pt-2">
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <div
              key={lang.code}
              onClick={() => onSelectLanguage(lang.code)}
              className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border-2 text-left relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-teal-50/90 border-teal-600 shadow-md ring-2 ring-teal-500/20'
                  : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xl font-extrabold text-slate-900 block font-heading">
                    {lang.nativeName}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {lang.englishName} • {lang.region}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayVoiceGreeting(lang);
                    }}
                    title="Listen to voice greeting"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-100 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 italic">
                "{lang.scriptGreeting}"
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-4">
        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 hover:translate-x-0.5"
        >
          <span>आगे बढ़ें (Continue to Consent)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
