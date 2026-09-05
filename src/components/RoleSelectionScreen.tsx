import React from 'react';
import { 
  User, 
  Stethoscope, 
  ShieldCheck, 
  Sparkles, 
  Volume2, 
  ArrowRight,
  HeartPulse,
  QrCode,
  Languages,
  Building2,
  TrendingUp,
  Compass
} from 'lucide-react';
import { LanguageCode, UserRole } from '../types';
import { LanguageDropdown } from './kiosk/LanguageDropdown';
import { speakText, playDoctorChime, playTouchFeedback, unlockAudioSystem } from '../services/speechService';
import { ROLE_SCREEN_TRANSLATIONS } from '../utils/roleTranslations';
import { AppLogo } from './common/AppLogo';

interface RoleSelectionScreenProps {
  onSelectRole: (role: UserRole) => void;
  selectedLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

const managementDefaults: Record<string, { title: string; badge: string; bullets: string[]; action: string }> = {
  hi: {
    title: 'अस्पताल प्रबंधन व भीड़ नियंत्रण',
    badge: 'Portal 3 • Hospital Management',
    bullets: [
      'भीड़ का पूर्वानुमान (Next 2-4 hrs surge)',
      'इमरजेंसी ट्राइएज व गंभीर अलर्ट',
      'ओपीडी क्षमता व स्टाफ आवंटन'
    ],
    action: 'प्रबंधन कंसोल खोलें'
  },
  mr: {
    title: 'रुग्णालय व्यवस्थापन व गर्दी नियंत्रण',
    badge: 'Portal 3 • रुग्णालय व्यवस्थापन',
    bullets: [
      'गर्दीचा अंदाज (Next 2-4 hrs surge)',
      'तातडीच्या रुग्णांचे ट्रायज अलर्ट',
      'ओपीडी क्षमता व कर्मचारी नियोजन'
    ],
    action: 'व्यवस्थापन कन्सोल उघडा'
  },
  bn: {
    title: 'হাসপাতাল ব্যবস্থাপনা ও ভিড় নিয়ন্ত্রণ',
    badge: 'Portal 3 • হাসপাতাল ব্যবস্থাপনা',
    bullets: [
      'ভিড়ের পূর্বাভাস (Next 2-4 hrs surge)',
      'জরুরি ট্রায়াজ ও রেড ফ্ল্যাগ সতর্কতা',
      'ওপিডি ক্ষমতা ও কর্মী বণ্টন'
    ],
    action: 'ব্যবস্থাপনা কনসোল খুলুন'
  },
  gu: {
    title: 'હોસ્પિટલ મેનેજમેન્ટ અને ભીડ નિયંત્રણ',
    badge: 'Portal 3 • હોસ્પિટલ સંચાલન',
    bullets: [
      'ભીડની આગાહી (Next 2-4 hrs surge)',
      'ઇમરજન્સી ટ્રાયેજ અને રેડ એલર્ટ',
      'ઓપીડી ક્ષમતા અને સ્ટાફ ફાળવણી'
    ],
    action: 'મેનેજમેન્ટ કન્સોલ ખોલો'
  },
  ta: {
    title: 'மருத்துவமனை மேலாண்மை & கூட்டம் கட்டுப்பாடு',
    badge: 'Portal 3 • மருத்துவமனை மேலாண்மை',
    bullets: [
      'கூட்டம் முன்னறிவிப்பு (Next 2-4 hrs surge)',
      'அவசர நிலை மற்றும் எச்சரிக்கைகள்',
      'ஓபிடி திறன் & பணியாளர் ஒதுக்கீடு'
    ],
    action: 'மேலாண்மை பக்கம் திறக்கவும்'
  },
  te: {
    title: 'ఆసుపత్రి నిర్వహణ & రద్దీ నియంత్రణ',
    badge: 'Portal 3 • ఆసుపత్రి నిర్వహణ',
    bullets: [
      'రద్దీ అంచనా (Next 2-4 hrs surge)',
      'అత్యవసర ట్రయాజ్ & హెచ్చరికలు',
      'ఓపీడీ సామర్థ్యం & సిబ్బంది కేటాయింపు'
    ],
    action: 'నిర్వహణ కన్సోల్ తెరవండి'
  },
  kn: {
    title: 'ಆಸ್ಪತ್ರೆ ನಿರ್ವಹಣೆ ಮತ್ತು ಜನಸಂದಣಿ ನಿಯಂತ್ರಣ',
    badge: 'Portal 3 • ಆಸ್ಪತ್ರೆ ನಿರ್ವಹಣೆ',
    bullets: [
      'ಜನಸಂದಣಿ ಮುನ್ಸೂಚನೆ (Next 2-4 hrs surge)',
      'ತುರ್ತು ಟ್ರಯಾಜ್ ಮತ್ತು ಎಚ್ಚರಿಕೆಗಳು',
      'ಒಪಿಡಿ ಸಾಮರ್ಥ್ಯ & ಸಿಬ್ಬಂದಿ ಹಂಚಿಕೆ'
    ],
    action: 'ನಿರ್ವಹಣಾ ಕನ್ಸೋಲ್ ತೆರೆಯಿರಿ'
  },
  pa: {
    title: 'ਹਸਪਤਾਲ ਪ੍ਰਬੰਧਨ ਅਤੇ ਭੀੜ ਕੰਟਰੋਲ',
    badge: 'Portal 3 • ਹਸਪਤਾਲ ਪ੍ਰਬੰਧਨ',
    bullets: [
      'ਭੀੜ ਦਾ ਅੰਦਾਜ਼ਾ (Next 2-4 hrs surge)',
      'ਐਮਰਜੈਂਸੀ ਟ੍ਰਾਈਏਜ ਅਤੇ ਚੇਤਾਵਨੀਆਂ',
      'ਓਪੀਡੀ ਸਮਰੱਥਾ ਤੇ ਸਟਾਫ਼ ਵੰਡ'
    ],
    action: 'ਪ੍ਰਬੰਧਨ ਕੰਸੋਲ ਖੋਲ੍ਹੋ'
  },
  ml: {
    title: 'ആശുപത്രി മാനേജ്മെന്റും തിരക്ക് നിയന്ത്രണവും',
    badge: 'Portal 3 • ആശുപത്രി മാനേജ്മെന്റ്',
    bullets: [
      'തിരക്ക് പ്രവചനം (Next 2-4 hrs surge)',
      'അടിയന്തര ട്രയാജ് & അലേർട്ടുകൾ',
      'ഒപിഡി കപ്പാസിറ്റിയും സ്റ്റാഫ് അലോക്കേഷനും'
    ],
    action: 'മാനേജ്മെന്റ് കൺസോൾ തുറക്കുക'
  },
  or: {
    title: 'ଡାକ୍ତରଖାନା ପରିଚାଳନା ଏବଂ ଭିଡ଼ ନିୟନ୍ତ୍ରଣ',
    badge: 'Portal 3 • ଡାକ୍ତରଖାନା ପରିଚାଳନା',
    bullets: [
      'ଭିଡ଼ ପୂର୍ବାନୁମାନ (Next 2-4 hrs surge)',
      'ଜରୁରୀକାଳୀନ ଟ୍ରାଇଏଜ୍ ଏବଂ ଚେତାବନୀ',
      'ଓପିଡି କ୍ଷମତା ଓ କର୍ମଚାରୀ ବଣ୍ଟନ'
    ],
    action: 'ପରିଚାଳନା କନସୋଲ୍ ଖୋଲନ୍ତୁ'
  },
  ur: {
    title: 'ہسپتال کا انتظام اور ہجوم کا کنٹرول',
    badge: 'Portal 3 • ہسپتال مینجمنٹ',
    bullets: [
      'ہجوم کی پیشگوئی (Next 2-4 hrs surge)',
      'ایمرجنسی ٹرائیج اور الرٹس',
      'او پی ڈی گنجائش اور عملے کی تقسیم'
    ],
    action: 'مینجمنٹ کنسول کھولیں'
  },
  bho: {
    title: 'अस्पताल प्रबंधन आ भीड़ नियंत्रण',
    badge: 'Portal 3 • अस्पताल प्रबंधन',
    bullets: [
      'भीड़ के अनुमान (Next 2-4 hrs surge)',
      'इमरजेंसी ट्राइएज आ गंभीर अलर्ट',
      'ओपीडी क्षमता आ स्टाफ आवंटन'
    ],
    action: 'प्रबंधन कंसोल खोलीं'
  },
  hinglish: {
    title: 'Hospital Management & Surge Control',
    badge: 'Portal 3 • Hospital Management',
    bullets: [
      'AI Crowd Predictor (Next 2-4 hrs surge)',
      'Emergency Triage & Red-Flag Escalation',
      'OPD Capacity & Staff Counter Allocation'
    ],
    action: 'Open Operations Console'
  },
  en: {
    title: 'Hospital Operations & Surge Intelligence',
    badge: 'Portal 3 • Hospital Management',
    bullets: [
      'AI Surge & Crowd Predictor (2-4 hrs)',
      'Emergency Triage & Red-Flag Escalation',
      'Departmental Telemetry & Counter Allocation'
    ],
    action: 'Open Operations Console'
  }
};

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({
  onSelectRole,
  selectedLanguage,
  onLanguageChange
}) => {
  const currentText = ROLE_SCREEN_TRANSLATIONS[selectedLanguage] || ROLE_SCREEN_TRANSLATIONS['hi'];

  const handleChoosePatient = () => {
    unlockAudioSystem();
    playTouchFeedback();
    playDoctorChime();
    speakText(
      selectedLanguage === 'hi' 
        ? 'मरीज़ कियोस्क में आपका स्वागत है। कृपया अपनी भाषा चुनें या आगे बढ़ें।' 
        : `Patient Kiosk. Welcome.`,
      selectedLanguage
    );
    onSelectRole('patient');
  };

  const handleChooseDoctor = () => {
    unlockAudioSystem();
    playTouchFeedback();
    playDoctorChime();
    onSelectRole('doctor');
  };

  const handleChooseManagement = () => {
    unlockAudioSystem();
    playTouchFeedback();
    playDoctorChime();
    onSelectRole('management');
  };

  const managementInfo = managementDefaults[selectedLanguage] || managementDefaults['hi'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 animate-in fade-in duration-300">
      
      {/* Top Bar with Language Selector */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between py-2 pt-safe">
        <AppLogo variant="horizontal" size="md" animate={true} />

        <div className="flex items-center gap-2">
          <LanguageDropdown
            currentLanguage={selectedLanguage}
            onLanguageChange={onLanguageChange}
            audioEnabled={true}
          />
        </div>
      </div>

      {/* Main Welcome Hero */}
      <div className="max-w-5xl w-full mx-auto my-auto py-6 sm:py-8 text-center space-y-6">
        
        {/* Welcome Banner */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/80 text-teal-900 text-xs font-bold border border-teal-200">
            <span>District Civil Hospital OPD Enterprise Suite</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
            {currentText.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            {currentText.subtitle}
          </p>
        </div>

        {/* 3 Real-World Core Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          
          {/* 1. Patient Portal (Kiosk + Next-Step Route) */}
          <button
            type="button"
            onClick={handleChoosePatient}
            className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-teal-500 hover:border-teal-600 shadow-md hover:shadow-xl hover:shadow-teal-600/10 text-left transition-all duration-150 group cursor-pointer flex flex-col justify-between relative overflow-hidden active:scale-[0.98] touch-target"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-teal-50 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md group-hover:bg-teal-700 transition-colors">
                <User className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[11px] font-extrabold text-teal-700 uppercase tracking-wider block mb-1">
                  {currentText.patientBadge}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
                  {currentText.patientTitle}
                </h3>
                <ul className="text-xs text-slate-600 mt-3 space-y-1.5 leading-relaxed">
                  {currentText.patientBullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 relative z-10 flex items-center justify-between border-t border-slate-100 mt-4">
              <span className="text-xs font-bold text-teal-800 group-hover:text-teal-950 flex items-center gap-1.5">
                <span>{currentText.patientAction}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold">
                1
              </span>
            </div>
          </button>

          {/* 2. Doctor Consultation Station */}
          <button
            type="button"
            onClick={handleChooseDoctor}
            className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-slate-400 shadow-md hover:shadow-lg text-left transition-all duration-150 group cursor-pointer flex flex-col justify-between relative overflow-hidden active:scale-[0.98] touch-target"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-slate-50 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform"></div>

            <div className="space-y-4 relative z-10">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-md group-hover:bg-slate-900 transition-colors">
                <Stethoscope className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  {currentText.doctorBadge}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
                  {currentText.doctorTitle}
                </h3>
                <ul className="text-xs text-slate-600 mt-3 space-y-1.5 leading-relaxed">
                  {currentText.doctorBullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-slate-500 font-bold">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 relative z-10 flex items-center justify-between border-t border-slate-100 mt-4">
              <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 flex items-center gap-1.5">
                <span>{currentText.doctorAction}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                2
              </span>
            </div>
          </button>

          {/* 3. Hospital Management & Operations */}
          <button
            type="button"
            onClick={handleChooseManagement}
            className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-amber-300 hover:border-amber-500 shadow-md hover:shadow-lg text-left transition-all duration-150 group cursor-pointer flex flex-col justify-between relative overflow-hidden active:scale-[0.98] touch-target"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-50 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform"></div>

            <div className="space-y-4 relative z-10">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md group-hover:bg-amber-700 transition-colors">
                <Building2 className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider block mb-1">
                  {currentText.managementBadge || managementInfo.badge}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
                  {currentText.managementTitle || managementInfo.title}
                </h3>
                <ul className="text-xs text-slate-600 mt-3 space-y-1.5 leading-relaxed">
                  {(currentText.managementBullets || managementInfo.bullets).map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 relative z-10 flex items-center justify-between border-t border-slate-100 mt-4">
              <span className="text-xs font-bold text-amber-900 group-hover:text-amber-950 flex items-center gap-1.5">
                <span>{currentText.managementAction || managementInfo.action}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-bold">
                3
              </span>
            </div>
          </button>

        </div>

        {/* ABDM & Standards Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2 px-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-[11px] sm:text-xs">
            ABDM Certified • Ayushman Bharat Digital Mission Standards • ISO 27001 Data Privacy
          </span>
        </div>

      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 py-2 pb-safe">
        District Civil Hospital Healthcare Information System • Integrated Clinical &amp; Operations Suite
      </div>

    </div>
  );
};

