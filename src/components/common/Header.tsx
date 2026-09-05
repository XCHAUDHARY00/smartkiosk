import React from 'react';
import { 
  Building2, 
  Stethoscope, 
  Compass, 
  Tv, 
  Monitor, 
  Eye,
  LogOut,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { AppViewMode, LanguageCode, PatientProfile, UserRole } from '../../types';
import { LanguageDropdown } from '../kiosk/LanguageDropdown';

interface HeaderProps {
  currentView: AppViewMode;
  onViewChange: (view: AppViewMode) => void;
  activePatient: PatientProfile | null;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  serverConnected: boolean;
  activeRole?: string;
  currentRole?: UserRole | null;
  onSwitchRole?: () => void;
  easyMode?: boolean;
  onToggleEasyMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  activePatient,
  language,
  onLanguageChange,
  serverConnected,
  activeRole,
  currentRole,
  onSwitchRole,
  easyMode,
  onToggleEasyMode
}) => {
  const isPatientView = currentRole ? currentRole === 'patient' : currentView === 'kiosk';
  const isDoctorView = currentRole ? currentRole === 'doctor' : currentView === 'doctor';
  const isManagementView = currentRole ? currentRole === 'management' : (currentView === 'queue_display' || currentView === 'navigator' || (currentView as string) === 'triage');

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Hospital Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-teal-800 flex items-center justify-center text-white shadow-xs border border-teal-900 shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-xl sm:text-2xl tracking-tight text-slate-900">
                  CARESAAR
                </span>
                
                {/* Role specific header tag */}
                {isPatientView && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    मरीज कियोस्क • Patient Kiosk
                  </span>
                )}
                {isDoctorView && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    डॉक्टर क्लिनिकल स्टेशन • Doctor Cockpit
                  </span>
                )}
                {isManagementView && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    अस्पताल प्रबंधन • Hospital Operations
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                AI Clinical Intake &amp; Case-Taking Platform
              </p>
            </div>
          </div>

          {/* Navigation View Switcher Tabs (Shown ONLY for Hospital Management Role) */}
          {isManagementView && (
            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                id="tab-triage"
                type="button"
                onClick={() => onViewChange('triage' as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  (currentView as string) === 'triage'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Priority Triage</span>
                <span className="text-[10px] opacity-80">ट्राइएज</span>
              </button>

              <button
                id="tab-queue"
                type="button"
                onClick={() => onViewChange('queue_display')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'queue_display'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Waiting Display</span>
                <span className="text-[10px] opacity-80">कतार</span>
              </button>

              <button
                id="tab-navigator"
                type="button"
                onClick={() => onViewChange('navigator')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'navigator'
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Hospital Route</span>
                <span className="text-[10px] opacity-80">मार्ग</span>
              </button>
            </div>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Doctor Cabin Badge for Doctor View */}
            {isDoctorView && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Cabin 102 • General Medicine</span>
              </div>
            )}

            {/* Easy Mode Accessibility Toggle (Shown on Kiosk for patient accessibility) */}
            {isPatientView && onToggleEasyMode && (
              <button
                id="btn-toggle-easy-mode"
                type="button"
                onClick={onToggleEasyMode}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  easyMode
                    ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs ring-2 ring-amber-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
                title={easyMode ? 'Disable Easy Mode' : 'Enable Easy Mode: larger text & buttons'}
                aria-pressed={easyMode}
              >
                <Eye className="w-3.5 h-3.5 shrink-0 text-slate-900" />
                <span>{easyMode ? 'आसान मोड (ON)' : 'आसान मोड (Easy)'}</span>
              </button>
            )}

            {/* Multi-Language Dropdown (Supports all 14 Indic languages) */}
            <LanguageDropdown
              currentLanguage={language}
              onLanguageChange={onLanguageChange}
              audioEnabled={true}
            />

            {/* Switch Portal / Role Button */}
            {onSwitchRole && (
              <button
                type="button"
                onClick={onSwitchRole}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-900 font-bold text-xs transition-all cursor-pointer"
                title="Switch Portal (पोर्टल बदलें)"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">भूमिका बदलें</span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">(Switch)</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile View Switcher for Management role */}
        {isManagementView && (
          <div className="flex md:hidden overflow-x-auto py-2 gap-2 border-t border-slate-100 -mx-4 px-4 scrollbar-none">
            <button
              onClick={() => onViewChange('triage' as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 ${
                (currentView as string) === 'triage' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Triage (ट्राइएज)
            </button>
            <button
              onClick={() => onViewChange('queue_display')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 ${
                currentView === 'queue_display' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Tv className="w-3.5 h-3.5" /> Queue (कतार)
            </button>
            <button
              onClick={() => onViewChange('navigator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 ${
                currentView === 'navigator' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> Navigator (मार्ग)
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
