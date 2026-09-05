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
            {selectedLanguage === 'hi' ? 'स्मार्ट अस्पताल प्रणाली — अपना पोर्टल चुनें' : 'Smart Hospital Operating System — Select Portal'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            {selectedLanguage === 'hi' 
              ? 'मरीज़ों के लिए त्वरित पंजीकरण व मार्ग, डॉक्टरों के लिए एआई क्लिनिकल कंसल्टेशन, और प्रशासन के लिए भीड़ नियंत्रण।'
              : 'Streamlined intake and hospital navigation for patients, clinical decision workspace for doctors, and predictive surge intelligence for hospital management.'}
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
                  Portal 1 • Patient Kiosk
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
                  {selectedLanguage === 'hi' ? 'मरीज़ कियोस्क व मार्ग' : 'Patient Kiosk & Route'}
                </h3>
                <ul className="text-xs text-slate-600 mt-3 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{selectedLanguage === 'hi' ? 'आवाज़ से लक्षण व पर्ची बनाएं' : 'Multilingual Voice AI Intake'}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{selectedLanguage === 'hi' ? 'पुराने पर्चे व जांच स्कैन' : 'Prescription Document OCR'}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{selectedLanguage === 'hi' ? 'अस्पताल में कहाँ जाना है (मार्ग व कतार)' : 'Next-Step Route & Queue Wait Times'}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4 relative z-10 flex items-center justify-between border-t border-slate-100 mt-4">
              <span className="text-xs font-bold text-teal-800 group-hover:text-teal-950 flex items-center gap-1.5">
                <span>{selectedLanguage === 'hi' ? 'कियोस्क शुरू करें' : 'Launch Patient Kiosk'}</span>
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
                  Portal 2 • Doctor Station
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
                  {selectedLanguage === 'hi' ? 'डॉक्टर कंसल्टेशन स्टेशन' : 'Doctor Clinical Station'}
                </h3>
                <ul className="text-xs text-slate-600 mt-3 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-slate-500 font-bold">•</span>
                    <span>{selectedLanguage === 'hi' ? 'एआई क्लिनिकल सारांश व संकेत' : 'AI Clinical Summaries & Red Flags'}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-slate-500 font-bold">•</span>
                    <span>{selectedLanguage === 'hi' ? 'मरीज़ से आवाज़ द्वारा पुष्टि (Verify)' : 'Patient Read-Back Voice Verification'}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-slate-500 font-bold">•</span>
                    <span>{selectedLanguage === 'hi' ? 'ई-पर्चे व जांच आदेश (Rx Order)' : 'E-Prescription & Investigation Orders'}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4 relative z-10 flex items-center justify-between border-t border-slate-100 mt-4">
              <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 flex items-center gap-1.5">
                <span>{selectedLanguage === 'hi' ? 'ओपीडी स्टेशन खोलें' : 'Open Doctor Station'}</span>
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
                  Portal 3 • Hospital Management
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
                  {selectedLanguage === 'hi' ? 'अस्पताल प्रबंधन व भीड़ नियंत्रण' : 'Hospital Operations & Surge'}
                </h3>
                <ul className="text-xs text-slate-600 mt-3 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{selectedLanguage === 'hi' ? 'भीड़ का पूर्वानुमान (Next 2-4 hrs surge)' : 'AI Surge & Crowd Predictor (2-4 hrs)'}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{selectedLanguage === 'hi' ? 'इमरजेंसी ट्राइएज व गंभीर अलर्ट' : 'Emergency Triage & Red-Flag Escalation'}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{selectedLanguage === 'hi' ? 'ओपीडी क्षमता व स्टाफ आवंटन' : 'Departmental Telemetry & Counter Allocation'}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4 relative z-10 flex items-center justify-between border-t border-slate-100 mt-4">
              <span className="text-xs font-bold text-amber-900 group-hover:text-amber-950 flex items-center gap-1.5">
                <span>{selectedLanguage === 'hi' ? 'प्रबंधन कंसोल खोलें' : 'Open Operations Console'}</span>
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

