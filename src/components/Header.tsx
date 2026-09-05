import React, { useState } from 'react';
import { 
  Stethoscope, 
  User, 
  Building2, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  LogOut, 
  HelpCircle,
  Compass,
  TrendingUp,
  Menu,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { AppViewMode, PatientProfile, TriageAlert, LanguageCode, UserRole } from '../types';
import { LanguageDropdown } from './kiosk/LanguageDropdown';
import { AppLogo } from './common/AppLogo';
import { SoundDiagnosticModal } from './common/SoundDiagnosticModal';

interface HeaderProps {
  currentView: AppViewMode;
  onViewChange: (view: AppViewMode) => void;
  userRole: UserRole | null;
  onSwitchRole: () => void;
  activePatient: PatientProfile;
  activeAlerts: TriageAlert[];
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onSelectPresetPatient: (patientId: string) => void;
  onResetKiosk: () => void;
  isAccessibilityMode: boolean;
  onToggleAccessibility: () => void;
  isOfflineMode: boolean;
  onToggleOffline: () => void;
  onLanguageChange?: (lang: LanguageCode) => void;
  onToggleMobileSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  userRole,
  onSwitchRole,
  activePatient,
  activeAlerts,
  audioEnabled,
  onToggleAudio,
  onResetKiosk,
  onLanguageChange,
  onToggleMobileSidebar,
  isSidebarCollapsed,
  onToggleSidebarCollapse
}) => {
  const [showSoundModal, setShowSoundModal] = useState(false);
  const redAlertsCount = activeAlerts.filter(a => a.severity === 'EMERGENCY_RED' && a.status === 'active').length;

  // View tabs configured for top command bar
  const topTabs = [
    {
      id: 'doctor' as AppViewMode,
      label: 'Doctor Station',
      icon: Stethoscope,
      accentColor: 'teal'
    },
    {
      id: 'patient' as AppViewMode,
      label: 'Intake Kiosk',
      icon: User,
      accentColor: 'teal'
    },
    {
      id: 'navigator' as AppViewMode,
      label: 'Hospital Navigator',
      icon: Compass,
      accentColor: 'teal',
      badge: 'Live Map'
    },
    {
      id: 'crowd' as AppViewMode,
      label: 'Crowd Predictor',
      icon: TrendingUp,
      accentColor: 'amber',
      badge: 'Surge AI'
    },
    {
      id: 'management' as AppViewMode,
      label: 'Operations',
      icon: Building2,
      accentColor: 'blue',
      badgeCount: redAlertsCount > 0 ? redAlertsCount : undefined
    }
  ];

  const isTabActive = (tabId: AppViewMode) => {
    if (tabId === currentView) return true;
    if (tabId === 'patient' && currentView === 'kiosk') return true;
    if (tabId === 'management' && (currentView === 'analytics' || currentView === 'triage' || currentView === 'management')) return true;
    return false;
  };

  return (
    <>
      {/* Top Application Command Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="w-full px-3 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            
            {/* Left: Mobile Drawer Toggle & Branding / Breadcrumbs */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Mobile hamburger menu toggle */}
              {onToggleMobileSidebar && (
                <button
                  type="button"
                  onClick={onToggleMobileSidebar}
                  title="Open Navigation Menu"
                  className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              {/* Desktop toggle sidebar button */}
              {onToggleSidebarCollapse && (
                <button
                  type="button"
                  onClick={onToggleSidebarCollapse}
                  title={isSidebarCollapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse Sidebar (Ctrl+B)'}
                  className="hidden md:flex p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                >
                  {isSidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                </button>
              )}

              {/* Hospital Brand & Section Context */}
              <div className="flex items-center gap-2">
                <AppLogo variant="icon" size="sm" animate={true} />
                <div className="hidden lg:block leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 tracking-tight text-sm font-heading">
                      SMART OPD
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-teal-50 text-teal-800 border-teal-200 font-mono">
                      District Civil Hospital
                    </span>
                  </div>
                  <span className="text-[10px] text-teal-700 font-semibold tracking-wider uppercase block">
                    Clinical &amp; Operations Suite
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Highly Visible Top-Level Tabbed Navigation Bar */}
            <nav className="hidden md:flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 text-xs font-semibold overflow-x-auto max-w-full">
              {topTabs.map(tab => {
                const active = isTabActive(tab.id);
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onViewChange(tab.id)}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      active
                        ? 'bg-white text-teal-900 font-extrabold shadow-2xs border border-slate-200/70'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${active ? 'text-teal-700' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="text-[9px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.2 rounded-md">
                        {tab.badge}
                      </span>
                    )}
                    {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                      <span className="bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse">
                        {tab.badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Active Patient Context & Utility Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Active Token Pill */}
              {activePatient && (
                <div 
                  onClick={() => onViewChange('doctor')}
                  className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
                  title="Current Active Patient in OPD Queue"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs font-extrabold text-slate-800">
                    {activePatient.tokenNumber}
                  </span>
                  <span className="text-xs text-slate-500 truncate max-w-[110px]">
                    {activePatient.name || 'Patient'}
                  </span>
                </div>
              )}

              {/* Language Switcher */}
              {onLanguageChange && (
                <LanguageDropdown
                  currentLanguage={activePatient.language}
                  onLanguageChange={onLanguageChange}
                  audioEnabled={audioEnabled}
                />
              )}

              {/* Audio Voice Guidance Toggle */}
              <button
                onClick={onToggleAudio}
                title={audioEnabled ? 'Mute Voice Guidance' : 'Enable Voice Guidance'}
                className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  audioEnabled 
                    ? 'bg-teal-50 border-teal-200 text-teal-800' 
                    : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}
              >
                {audioEnabled ? <Volume2 className="w-4 h-4 text-teal-600" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden 2xl:inline">{audioEnabled ? 'Voice On' : 'Voice Off'}</span>
              </button>

              {/* Sound Diagnostic Modal Button */}
              <button
                type="button"
                onClick={() => setShowSoundModal(true)}
                title="Android आवाज़ समाधान व साउंड टेस्ट (Sound Help & Test)"
                className="p-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Sound Help</span>
              </button>

              {/* Reset Session / New Patient (when in patient/kiosk view) */}
              {(currentView === 'patient' || currentView === 'kiosk') && (
                <button
                  onClick={onResetKiosk}
                  title="Reset Kiosk Session"
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">New Patient</span>
                </button>
              )}

              {/* Switch Portal Button */}
              <button
                onClick={onSwitchRole}
                title="Return to Main Portal Selection Screen"
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] hidden sm:inline">Switch Portal</span>
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Mobile Bottom 5-View Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-lg px-2 py-1.5 pb-safe">
        <div className="grid grid-cols-5 gap-1">
          <button
            onClick={() => onViewChange('doctor')}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all cursor-pointer ${
              currentView === 'doctor'
                ? 'bg-teal-50 text-teal-900 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4 mb-0.5 text-teal-700" />
            <span className="text-[9px] leading-tight truncate">Doctor</span>
          </button>

          <button
            onClick={() => onViewChange('patient')}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all cursor-pointer ${
              currentView === 'patient' || currentView === 'kiosk'
                ? 'bg-teal-50 text-teal-900 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 mb-0.5 text-teal-700" />
            <span className="text-[9px] leading-tight truncate">Intake</span>
          </button>

          <button
            onClick={() => onViewChange('navigator')}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all cursor-pointer ${
              currentView === 'navigator'
                ? 'bg-teal-50 text-teal-900 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 mb-0.5 text-teal-700" />
            <span className="text-[9px] leading-tight truncate">Navigator</span>
          </button>

          <button
            onClick={() => onViewChange('crowd')}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all cursor-pointer ${
              currentView === 'crowd'
                ? 'bg-amber-50 text-amber-950 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 mb-0.5 text-amber-600" />
            <span className="text-[9px] leading-tight truncate">Crowd</span>
          </button>

          <button
            onClick={() => onViewChange('management')}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all cursor-pointer relative ${
              currentView === 'management' || currentView === 'triage' || currentView === 'analytics'
                ? 'bg-slate-100 text-slate-900 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              <Building2 className="w-4 h-4 mb-0.5 text-slate-700" />
              {redAlertsCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[8px] font-extrabold w-3 h-3 rounded-full flex items-center justify-center animate-pulse">
                  {redAlertsCount}
                </span>
              )}
            </div>
            <span className="text-[9px] leading-tight truncate">Ops</span>
          </button>
        </div>
      </nav>

      {/* Android Sound Diagnostic & Help Modal */}
      {showSoundModal && (
        <SoundDiagnosticModal
          currentLanguage={activePatient.language}
          onClose={() => setShowSoundModal(false)}
        />
      )}
    </>
  );
};
