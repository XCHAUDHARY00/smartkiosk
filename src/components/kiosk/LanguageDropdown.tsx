import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check, Volume2 } from 'lucide-react';
import { LanguageCode } from '../../types';
import { speakText, playDoctorChime, playTouchFeedback, unlockAudioSystem, reloadVoiceSynthesisEngine } from '../../services/speechService';

interface LanguageDropdownProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  audioEnabled?: boolean;
  variant?: 'compact' | 'full';
}

interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  scriptLabel: string;
  welcomeGreeting: string;
}

export const INDIAN_LANGUAGES: LanguageOption[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', scriptLabel: 'हिन्दी', welcomeGreeting: 'नमस्ते! मैं आपका डिजिटल सहायक हूँ।' },
  { code: 'en', name: 'English', nativeName: 'English', scriptLabel: 'English', welcomeGreeting: 'Hello! I am your OPD Doctor Assistant.' },
  { code: 'hinglish', name: 'Hinglish', nativeName: 'Hinglish (Hindi + Eng)', scriptLabel: 'Hinglish', welcomeGreeting: 'Namaste! Main aapka digital OPD assistant hoon.' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', scriptLabel: 'भोजपुरी', welcomeGreeting: 'प्रणाम! हम राउर डिजिटल सहायक बानी।' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', scriptLabel: 'ਪੰਜਾਬੀ', welcomeGreeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਡਿਜੀਟਲ ਸਹਾਇਕ ਹਾਂ।' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', scriptLabel: 'বাংলা', welcomeGreeting: 'নমস্কার! আমি আপনার ডিজিটাল ডাক্তার সহকারী।' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', scriptLabel: 'தமிழ்', welcomeGreeting: 'வணக்கம்! நான் உங்கள் டிஜிட்டல் உதவியாளர்.' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', scriptLabel: 'తెలుగు', welcomeGreeting: 'నమస్కారం! నేను మీ డిజిటల్ అసిస్టెంట్‌ని.' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', scriptLabel: 'मराठी', welcomeGreeting: 'नमस्कार! मी आपला डिजिटल सहाय्यक आहे.' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', scriptLabel: 'ગુજરાતી', welcomeGreeting: 'નમસ્તે! હું તમારો ડિજિટલ સહાયક છું.' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', scriptLabel: 'ಕನ್ನಡ', welcomeGreeting: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಸಹಾಯಕ.' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', scriptLabel: 'മലയാളം', welcomeGreeting: 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ ഡിജിറ്റൽ അസിസ്റ്റന്റ് ആണ്.' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', scriptLabel: 'ଓଡ଼ିଆ', welcomeGreeting: 'ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କ ଡିଜିଟାଲ୍ ସହାୟକ।' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', scriptLabel: 'اردو', welcomeGreeting: 'آداب! میں آپ کا ڈیجیٹل اسسٹنٹ ہوں۔' }
];

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  currentLanguage,
  onLanguageChange,
  audioEnabled = true,
  variant = 'compact'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLang = INDIAN_LANGUAGES.find(l => l.code === currentLanguage) || INDIAN_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang: LanguageOption) => {
    unlockAudioSystem();
    playTouchFeedback();
    onLanguageChange(lang.code);
    setIsOpen(false);

    reloadVoiceSynthesisEngine(lang.code).then(() => {
      if (audioEnabled) {
        speakText(lang.welcomeGreeting, lang.code, undefined, { playChime: true });
      }
    }).catch(() => {
      if (audioEnabled) {
        speakText(lang.welcomeGreeting, lang.code, undefined, { playChime: true });
      }
    });
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50/80 hover:bg-teal-100/90 border border-teal-200 text-teal-900 font-bold text-xs transition-all shadow-2xs cursor-pointer touch-target"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-teal-700 shrink-0" />
        <div className="flex flex-col text-left leading-tight">
          <span className="font-extrabold text-teal-950 text-xs">{selectedLang.nativeName}</span>
          <span className="text-[10px] text-teal-700 font-medium">{selectedLang.name}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-teal-700 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-2 space-y-1 animate-in fade-in zoom-in-95">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
            <span>Select Indian Language / भाषा चुनें</span>
            <Globe className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="grid grid-cols-1 gap-1 pt-1">
            {INDIAN_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLanguage;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-teal-700 text-white font-bold' 
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">{lang.nativeName}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                      {lang.name}
                    </span>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
