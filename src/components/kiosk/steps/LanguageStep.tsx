import React from 'react';
import { Volume2, Check, ArrowRight, Globe } from 'lucide-react';
import { LanguageCode } from '../../../types';
import { speakText, unlockAudioSystem } from '../../../services/speechService';
import { getTranslations } from '../../../utils/translations';

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
    scriptGreeting: 'Welcome to CARESAAR Smart OPD Intake',
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
  },
  {
    code: 'gu',
    nativeName: 'ગુજરાતી',
    englishName: 'Gujarati',
    scriptGreeting: 'નમસ્તે, આપનું સ્વાગત છે',
    region: 'Gujarat'
  },
  {
    code: 'ta',
    nativeName: 'தமிழ்',
    englishName: 'Tamil',
    scriptGreeting: 'வணக்கம், தங்களை அன்புடன் வரவேற்கிறோம்',
    region: 'Tamil Nadu'
  },
  {
    code: 'te',
    nativeName: 'తెలుగు',
    englishName: 'Telugu',
    scriptGreeting: 'నమస్కారం, మీకు స్వాగతం',
    region: 'Andhra / Telangana'
  },
  {
    code: 'kn',
    nativeName: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    scriptGreeting: 'ನಮಸ್ಕಾರ, ತಮಗೆ ಸುಸ್ವಾಗತ',
    region: 'Karnataka'
  },
  {
    code: 'ml',
    nativeName: 'മലയാളം',
    englishName: 'Malayalam',
    scriptGreeting: 'നമസ്കാരം, സ്വാഗതം',
    region: 'Kerala'
  },
  {
    code: 'or',
    nativeName: 'ଓଡ଼ିଆ',
    englishName: 'Odia',
    scriptGreeting: 'ନମସ୍କାର, ଆପଣଙ୍କୁ ସ୍ୱାଗତ',
    region: 'Odisha'
  },
  {
    code: 'ur',
    nativeName: 'اردو',
    englishName: 'Urdu',
    scriptGreeting: 'آداب، آپ کا خیر مقدم ہے',
    region: 'Pan-India'
  },
  {
    code: 'bho',
    nativeName: 'भोजपुरी',
    englishName: 'Bhojpuri',
    scriptGreeting: 'प्रणाम, राउर स्वागत बा',
    region: 'Bihar / Eastern UP'
  },
  {
    code: 'hinglish',
    nativeName: 'Hinglish',
    englishName: 'Hinglish',
    scriptGreeting: 'Namaste, aapka OPD intake me welcome hai',
    region: 'Urban Youth / Mixed'
  }
];

interface LanguageStepProps {
  selectedLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onNext: () => void;
  easyMode?: boolean;
}

export const LanguageStep: React.FC<LanguageStepProps> = ({
  selectedLanguage,
  onSelectLanguage,
  onNext,
  easyMode = false
}) => {
  const t = getTranslations(selectedLanguage);

  const handlePlayVoiceGreeting = (lang: LanguageOption) => {
    unlockAudioSystem();
    speakText(lang.scriptGreeting, lang.code, undefined, { playChime: true });
  };

  const handleSelect = (code: LanguageCode, lang: LanguageOption) => {
    onSelectLanguage(code);
    if (easyMode) {
      handlePlayVoiceGreeting(lang);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider">
          <Globe className="w-4 h-4 text-teal-800" />
          <span>Step 1 • {t.steps?.identity?.subLabel || 'Language Selection'}</span>
        </div>
        <h2 className={`${easyMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'} font-heading font-black text-slate-900`}>
          {t.selectLanguage || 'अपनी भाषा चुनें / Select Language'}
        </h2>
        <p className={`${easyMode ? 'text-base' : 'text-sm'} text-slate-600 font-medium`}>
          Please tap your preferred language for the OPD consultation intake.
        </p>
      </div>

      {/* Language Grid with Generous Touch Targets */}
      <div className={`grid grid-cols-1 ${easyMode ? 'sm:grid-cols-2 gap-5' : 'sm:grid-cols-2 lg:grid-cols-3 gap-3.5'} pt-2`}>
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <div
              key={lang.code}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(lang.code, lang)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelect(lang.code, lang);
                }
              }}
              className={`cursor-pointer rounded-2xl transition-all text-left flex flex-col justify-between border-2 select-none ${
                easyMode ? 'p-5 min-h-[96px]' : 'p-4 min-h-[80px]'
              } ${
                isSelected
                  ? 'bg-teal-50 border-teal-800 ring-2 ring-teal-700/20 shadow-xs'
                  : 'bg-white border-slate-300 hover:border-teal-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`${easyMode ? 'text-xl font-black' : 'text-lg font-extrabold'} text-slate-950 block font-heading`}>
                    {lang.nativeName}
                  </span>
                  <span className={`${easyMode ? 'text-xs' : 'text-[11px]'} text-slate-600 font-semibold block mt-0.5`}>
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
                    title="सुनें (Listen)"
                    className="p-1.5 rounded-xl text-slate-600 hover:text-teal-900 hover:bg-teal-100 bg-slate-100 transition-colors"
                  >
                    <Volume2 className="w-4 h-4 text-teal-800" />
                  </button>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-teal-800 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200 text-[11px] text-slate-700 font-medium italic truncate">
                "{lang.scriptGreeting}"
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Action Button */}
      <div className="flex justify-center pt-4">
        <button
          type="button"
          onClick={onNext}
          className={`bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-3 border border-teal-950 ${
            easyMode ? 'px-12 py-4 text-lg min-h-[64px] w-full max-w-md' : 'px-10 py-3.5 text-base min-h-[52px]'
          }`}
        >
          <span>{t.next || 'आगे बढ़ें'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
