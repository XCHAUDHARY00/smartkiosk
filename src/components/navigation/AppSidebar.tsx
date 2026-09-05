import React from 'react';
import { 
  Stethoscope, 
  User, 
  Compass, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Navigation2, 
  Users, 
  Clock, 
  FileText,
  ShieldCheck,
  X
} from 'lucide-react';
import { AppViewMode, UserRole, PatientProfile, TriageAlert } from '../../types';
import { AppLogo } from '../common/AppLogo';

interface AppSidebarProps {
  currentView: AppViewMode;
  onViewChange: (view: AppViewMode) => void;
  userRole: UserRole | null;
  onSwitchRole: () => void;
  activePatient: PatientProfile;
  activeAlerts: TriageAlert[];
  patientsCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

interface NavItem {
  id: AppViewMode;
  label: string;
  hindiLabel: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: 'red' | 'teal' | 'amber' | 'blue';
  category: 'clinical' | 'operations' | 'patient';
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentView,
  onViewChange,
  userRole,
  onSwitchRole,
  activePatient,
  activeAlerts,
  patientsCount,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  audioEnabled,
  onToggleAudio
}) => {
  const redAlertsCount = activeAlerts.filter(a => a.severity === 'EMERGENCY_RED' && a.status === 'active').length;

  const navItems: NavItem[] = [
    // Clinical & Intake Group
    {
      id: 'doctor',
      label: 'Doctor Station',
      hindiLabel: 'ओपीडी डॉक्टर कंसोल',
      icon: Stethoscope,
      badge: `${patientsCount} In Line`,
      badgeColor: 'teal',
      category: 'clinical'
    },
    {
      id: 'patient',
      label: 'Intake Kiosk',
      hindiLabel: 'स्मार्ट पंजीकरण',
      icon: User,
      category: 'patient'
    },
    {
      id: 'navigator',
      label: 'Hospital Navigator',
      hindiLabel: 'अस्पताल मार्गदर्शक',
      icon: Compass,
      badge: 'Live Map',
      badgeColor: 'teal',
      category: 'patient'
    },

    // Operations & Intelligence Group
    {
      id: 'crowd',
      label: 'Crowd Predictor',
      hindiLabel: 'भीड़ पूर्वानुमान',
      icon: TrendingUp,
      badge: 'Surge AI',
      badgeColor: 'amber',
      category: 'operations'
    },
    {
      id: 'triage',
      label: 'Emergency Triage',
      hindiLabel: 'आपातकालीन डेस्क',
      icon: AlertTriangle,
      badge: redAlertsCount > 0 ? redAlertsCount : undefined,
      badgeColor: 'red',
      category: 'operations'
    },
    {
      id: 'management',
      label: 'Operations & KPI',
      hindiLabel: 'अस्पताल प्रबंधन',
      icon: Building2,
      category: 'operations'
    }
  ];

  const handleSelectNav = (viewId: AppViewMode) => {
    onViewChange(viewId);
    onCloseMobile();
  };

  // Helper to test if nav item is currently active
  const isItemActive = (id: AppViewMode) => {
    if (id === currentView) return true;
    if (id === 'patient' && currentView === 'kiosk') return true;
    if (id === 'management' && (currentView === 'analytics' || currentView === 'management')) return true;
    return false;
  };

  const renderBadge = (item: NavItem) => {
    if (!item.badge) return null;
    const colorClasses = {
      red: 'bg-red-500 text-white animate-pulse',
      teal: 'bg-teal-800 text-teal-100',
      amber: 'bg-amber-600 text-white',
      blue: 'bg-blue-700 text-blue-100'
    }[item.badgeColor || 'teal'];

    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono shrink-0 ${colorClasses}`}>
        {item.badge}
      </span>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-all duration-250 ease-in-out ${
          // Desktop sizing
          isCollapsed ? 'md:w-18' : 'md:w-64'
        } ${
          // Mobile slide-over drawer
          isMobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* 1. Header / Hospital Branding */}
        <div className="h-16 px-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <AppLogo variant="icon" size="sm" animate={false} />
            {(!isCollapsed || isMobileOpen) && (
              <div className="leading-tight min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-sm tracking-tight truncate font-heading">
                    SMART OPD
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                </div>
                <span className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase block truncate">
                  HIS Clinical Suite
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="hidden md:flex p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* 2. Active Patient Context Ribbon (if not collapsed) */}
        {(!isCollapsed || isMobileOpen) && activePatient && (
          <div className="mx-3 mt-3 p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80 shrink-0">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              <span>Current OPD Queue</span>
              <span className="text-teal-400 font-mono">Cabin 102</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="min-w-0 pr-1">
                <span className="text-xs font-extrabold text-white block truncate">
                  {activePatient.name || 'Active Patient'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {activePatient.age}y / {activePatient.gender}
                </span>
              </div>
              <span className="text-xs font-mono font-black bg-teal-900/90 text-teal-200 border border-teal-700 px-2 py-0.5 rounded-md shrink-0">
                {activePatient.tokenNumber}
              </span>
            </div>
          </div>
        )}

        {/* 3. Navigation Links List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          
          {/* Group 1: Clinical & Care */}
          <div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="px-2.5 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Clinical Care
              </div>
            )}
            <div className="space-y-1">
              {navItems.filter(i => i.category === 'clinical' || i.category === 'patient').map(item => {
                const active = isItemActive(item.id);
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectNav(item.id)}
                    title={isCollapsed ? `${item.label} (${item.hindiLabel})` : undefined}
                    className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative group ${
                      active
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/90'
                    } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-teal-400'}`} />

                    {(!isCollapsed || isMobileOpen) && (
                      <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                        <div className="truncate">
                          <span className="block leading-tight truncate">{item.label}</span>
                          <span className={`text-[10px] block font-normal leading-none mt-0.5 truncate ${
                            active ? 'text-teal-200' : 'text-slate-400'
                          }`}>
                            {item.hindiLabel}
                          </span>
                        </div>
                        {renderBadge(item)}
                      </div>
                    )}

                    {/* Small indicator dot in collapsed mode if badge exists */}
                    {isCollapsed && !isMobileOpen && item.badge && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 2: Operations & Capacity */}
          <div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="px-2.5 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Hospital Intelligence
              </div>
            )}
            <div className="space-y-1">
              {navItems.filter(i => i.category === 'operations').map(item => {
                const active = isItemActive(item.id);
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectNav(item.id)}
                    title={isCollapsed ? `${item.label} (${item.hindiLabel})` : undefined}
                    className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative group ${
                      active
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/90'
                    } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${
                      item.id === 'triage' 
                        ? 'text-red-400' 
                        : item.id === 'crowd' 
                          ? 'text-amber-400' 
                          : active 
                            ? 'text-white' 
                            : 'text-teal-400'
                    }`} />

                    {(!isCollapsed || isMobileOpen) && (
                      <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                        <div className="truncate">
                          <span className="block leading-tight truncate">{item.label}</span>
                          <span className={`text-[10px] block font-normal leading-none mt-0.5 truncate ${
                            active ? 'text-teal-200' : 'text-slate-400'
                          }`}>
                            {item.hindiLabel}
                          </span>
                        </div>
                        {renderBadge(item)}
                      </div>
                    )}

                    {/* Small indicator dot in collapsed mode if red alert */}
                    {isCollapsed && !isMobileOpen && item.id === 'triage' && redAlertsCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* 4. Footer System Tools / Role Controls */}
        <div className="p-3 border-t border-slate-800 space-y-2 shrink-0 bg-slate-950/50">
          
          {/* Quick Voice Guidance Toggle */}
          <button
            onClick={onToggleAudio}
            title={audioEnabled ? 'Voice Guidance Active' : 'Voice Guidance Muted'}
            className={`w-full py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
              audioEnabled
                ? 'bg-slate-800/80 text-teal-300 hover:bg-slate-800'
                : 'text-slate-500 hover:bg-slate-900'
            } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-teal-400 shrink-0" /> : <VolumeX className="w-4 h-4 shrink-0" />}
            {(!isCollapsed || isMobileOpen) && (
              <span className="truncate">{audioEnabled ? 'Voice Guidance On' : 'Voice Guidance Off'}</span>
            )}
          </button>

          {/* Switch Portal Button */}
          <button
            onClick={onSwitchRole}
            title="Return to Main Portal Selection"
            className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-2.5 cursor-pointer ${
              isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''
            }`}
          >
            <LogOut className="w-4 h-4 text-slate-400 shrink-0" />
            {(!isCollapsed || isMobileOpen) && (
              <span className="truncate">Switch Portal</span>
            )}
          </button>

          {/* Active Role Indicator */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="pt-1 text-center">
              <span className="text-[10px] text-slate-500 block truncate">
                Role: <strong className="text-slate-400 capitalize">{userRole || 'Clinical Staff'}</strong>
              </span>
            </div>
          )}

        </div>
      </aside>
    </>
  );
};
