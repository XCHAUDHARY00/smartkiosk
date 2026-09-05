import React from 'react';
import { 
  Building2, 
  Stethoscope, 
  Compass, 
  Tv, 
  Monitor, 
  Activity, 
  CheckCircle2, 
  Volume2,
  AlertCircle
} from 'lucide-react';
import { AppViewMode, LanguageCode, PatientProfile } from '../../types';

interface HeaderProps {
  currentView: AppViewMode;
  onViewChange: (view: AppViewMode) => void;
  activePatient: PatientProfile | null;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  serverConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  activePatient,
  language,
  onLanguageChange,
  serverConnected
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Hospital Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-700 flex items-center justify-center text-white shadow-sm ring-2 ring-teal-500/20">
              <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                  SMART <span className="text-teal-600">OPD</span> KIOSK
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  ABHA • NHA
                </span>
              </div>
              <p className="text-xs text-slate-500 font-hindi flex items-center gap-1.5">
                <span>डिजिटल ओपीडी एवं अस्पताल मार्गदर्शक प्रणाली</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {serverConnected ? 'Server DB Live' : 'Local Offline Mode'}
                </span>
              </p>
            </div>
          </div>

          {/* Navigation View Switcher Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              id="tab-kiosk"
              onClick={() => onViewChange('kiosk')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'kiosk'
                  ? 'bg-white text-teal-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-4 h-4 text-teal-600" />
              <span>Intake Kiosk</span>
              <span className="text-xs text-slate-400 font-hindi">मरीज कियोस्क</span>
            </button>

            <button
              id="tab-doctor"
              onClick={() => onViewChange('doctor')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'doctor'
                  ? 'bg-white text-teal-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-cyan-600" />
              <span>Doctor Cabin</span>
              <span className="text-xs text-slate-400 font-hindi">डॉक्टर केबिन</span>
            </button>

            <button
              id="tab-navigator"
              onClick={() => onViewChange('navigator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'navigator'
                  ? 'bg-white text-teal-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Hospital Route</span>
              <span className="text-xs text-slate-400 font-hindi">मार्गदर्शक</span>
            </button>

            <button
              id="tab-queue"
              onClick={() => onViewChange('queue_display')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'queue_display'
                  ? 'bg-white text-teal-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tv className="w-4 h-4 text-purple-600" />
              <span>Waiting Display</span>
              <span className="text-xs text-slate-400 font-hindi">कतार डिस्प्ले</span>
            </button>
          </div>

          {/* Patient Badge & Language Switcher */}
          <div className="flex items-center gap-3">
            {activePatient && (
              <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 bg-teal-50/80 border border-teal-200 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                  {activePatient.tokenNumber.split('-')[1] || '01'}
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs font-semibold text-slate-900 truncate max-w-[130px]">
                    {activePatient.name}
                  </div>
                  <div className="text-[10px] text-teal-700 font-medium">
                    {activePatient.assignedCabin} • {activePatient.department}
                  </div>
                </div>
              </div>
            )}

            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                id="btn-lang-hi"
                onClick={() => onLanguageChange('hi')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  language === 'hi'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिंदी
              </button>
              <button
                id="btn-lang-en"
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  language === 'en'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-2 border-t border-slate-100 -mx-4 px-4 scrollbar-none">
          <button
            onClick={() => onViewChange('kiosk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 ${
              currentView === 'kiosk' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Kiosk (कियोस्क)
          </button>
          <button
            onClick={() => onViewChange('doctor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 ${
              currentView === 'doctor' ? 'bg-cyan-700 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" /> Doctor Cabin (डॉक्टर)
          </button>
          <button
            onClick={() => onViewChange('navigator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 ${
              currentView === 'navigator' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Navigator (मार्गदर्शक)
          </button>
          <button
            onClick={() => onViewChange('queue_display')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 ${
              currentView === 'queue_display' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Tv className="w-3.5 h-3.5" /> Queue (कतार)
          </button>
        </div>
      </div>
    </header>
  );
};
