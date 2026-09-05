import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { RoleSelectionScreen } from './components/RoleSelectionScreen';
import { PatientIntakeKiosk } from './components/kiosk/PatientIntakeKiosk';
import { DoctorStation } from './components/doctor/DoctorStation';
import { HospitalNavigatorView } from './components/navigator/HospitalNavigatorView';
import { HospitalNavigatorModal } from './components/navigator/HospitalNavigatorModal';
import { QueueDisplayBoard } from './components/queue/QueueDisplayBoard';
import { HospitalManagementView } from './components/management/HospitalManagementView';
import { TriageDesk } from './components/triage/TriageDesk';
import { 
  PatientProfile, 
  ClinicalSummary, 
  AppViewMode, 
  LanguageCode, 
  UserRole, 
  TriageAlert, 
  PatientFeedback 
} from './types';
import { 
  fetchAllPatients, 
  setActiveRole, 
  ClientRole, 
  saveOrdersToDb, 
  saveDoctorVerificationsToDb 
} from './services/api';
import { 
  fetchAlertsFromDB, 
  updateAlertStatusInDB, 
  fetchFeedbacksFromDB 
} from './services/dbService';
import { AlertCircle } from 'lucide-react';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => {
    try {
      localStorage.removeItem('caresaar_active_role');
      return (sessionStorage.getItem('caresaar_active_role') as UserRole | null) || null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState<AppViewMode>(() => {
    try {
      const savedRole = sessionStorage.getItem('caresaar_active_role');
      if (savedRole === 'doctor') return 'doctor';
      if (savedRole === 'management') return 'crowd';
      return 'kiosk';
    } catch {
      return 'kiosk';
    }
  });

  const [language, setLanguage] = useState<LanguageCode>('hi');
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [activePatient, setActivePatient] = useState<PatientProfile | null>(null);
  const [clinicalSummaries, setClinicalSummaries] = useState<Record<string, ClinicalSummary>>({});
  const [triageAlerts, setTriageAlerts] = useState<TriageAlert[]>([]);
  const [feedbacks, setFeedbacks] = useState<PatientFeedback[]>([]);
  const [isNavigatorModalOpen, setIsNavigatorModalOpen] = useState(false);
  const [serverConnected, setServerConnected] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [easyMode, setEasyMode] = useState<boolean>(false);

  // Sync backend role based on active view and user role
  const getBackendRole = (role: UserRole | null, view: AppViewMode): ClientRole => {
    if (role === 'doctor' || view === 'doctor') return 'DOCTOR';
    if (role === 'management' || view === 'triage' || (view as string) === 'admin') return 'ADMIN';
    return 'KIOSK';
  };

  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    try {
      sessionStorage.setItem('caresaar_active_role', role);
    } catch {}
    if (role === 'patient') {
      setCurrentView('kiosk');
      setActiveRole('KIOSK');
      loadData('KIOSK');
    } else if (role === 'doctor') {
      setCurrentView('doctor');
      setActiveRole('DOCTOR');
      loadData('DOCTOR');
    } else if (role === 'management') {
      setCurrentView('crowd');
      setActiveRole('ADMIN');
      loadData('ADMIN');
    }
  };

  const handleSwitchRole = () => {
    setCurrentRole(null);
    try {
      sessionStorage.removeItem('caresaar_active_role');
      localStorage.removeItem('caresaar_active_role');
    } catch {}
  };

  const handleViewChange = (view: AppViewMode) => {
    setCurrentView(view);
    const backendRole = getBackendRole(currentRole, view);
    setActiveRole(backendRole);
    loadData(backendRole);
  };

  // Load patients and verify server health from real SQLite database
  async function loadData(role?: ClientRole) {
    const targetRole = role || getBackendRole(currentRole, currentView);
    setActiveRole(targetRole);

    try {
      const res = await fetch('/api/health', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        setServerConnected(true);
        setApiError(null);
      } else {
        setServerConnected(false);
        setApiError('Hospital API server responded with error code ' + res.status);
        return;
      }
    } catch (e: any) {
      setServerConnected(false);
      setApiError('Unable to connect to hospital database server.');
      return;
    }

    try {
      const pList = await fetchAllPatients(targetRole);
      if (pList) {
        setPatients(pList);
        if (!activePatient && pList.length > 0) {
          setActivePatient(pList[0]);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch patients from server database:', err);
      setApiError(err.message || 'Error loading patient records from database.');
    }

    if (targetRole === 'ADMIN' || currentRole === 'management') {
      try {
        const [aList, fList] = await Promise.all([fetchAlertsFromDB(), fetchFeedbacksFromDB()]);
        if (aList) setTriageAlerts(aList);
        if (fList) setFeedbacks(fList);
      } catch (err) {
        console.warn('Alert/feedback sync warning:', err);
      }
    }
  }

  useEffect(() => {
    if (currentRole) {
      loadData();
    }
  }, [currentRole, currentView]);

  const handlePatientEnrolled = (newPatient: PatientProfile, summary: ClinicalSummary) => {
    setPatients(prev => [newPatient, ...prev.filter(p => p.id !== newPatient.id)]);
    setActivePatient(newPatient);
    setClinicalSummaries(prev => ({
      ...prev,
      [newPatient.id]: summary
    }));
  };

  const handleUpdateSummary = async (updatedSummary: ClinicalSummary) => {
    if (!activePatient) return;
    setClinicalSummaries(prev => ({
      ...prev,
      [activePatient.id]: updatedSummary
    }));

    // Persist doctor orders and verifications to database
    try {
      if (updatedSummary.doctorOrderedTests && updatedSummary.doctorOrderedTests.length > 0) {
        const orderPayload = updatedSummary.doctorOrderedTests.map(t => ({
          orderType: 'investigation',
          itemName: t
        }));
        await saveOrdersToDb(activePatient.id, orderPayload);
      }
      if (updatedSummary.doctorVerifiedItems && Object.keys(updatedSummary.doctorVerifiedItems).length > 0) {
        await saveDoctorVerificationsToDb(activePatient.id, updatedSummary.doctorVerifiedItems);
      }
    } catch (err) {
      console.warn('Background order/verification sync warning:', err);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await updateAlertStatusInDB(alertId, 'acknowledged');
      setTriageAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a));
    } catch (e) {
      console.warn('Failed to acknowledge alert:', e);
    }
  };

  const handleTriagePatient = async (alertId: string) => {
    try {
      await updateAlertStatusInDB(alertId, 'triaged');
      setTriageAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'triaged' } : a));
    } catch (e) {
      console.warn('Failed to triage alert:', e);
    }
  };

  // If no role is selected, show initial Role Selection Gateway
  if (!currentRole) {
    return (
      <RoleSelectionScreen
        selectedLanguage={language}
        onLanguageChange={setLanguage}
        onSelectRole={handleSelectRole}
      />
    );
  }

  const currentSummary = activePatient ? clinicalSummaries[activePatient.id] : undefined;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Universal Top Header */}
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
        activePatient={activePatient}
        language={language}
        onLanguageChange={setLanguage}
        serverConnected={serverConnected}
        activeRole={getBackendRole(currentRole, currentView)}
        currentRole={currentRole}
        onSwitchRole={handleSwitchRole}
        easyMode={easyMode}
        onToggleEasyMode={() => setEasyMode(v => !v)}
      />

      {/* Error Alert Banner when API fails or Server disconnected */}
      {(!serverConnected || apiError) && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-amber-900 text-xs sm:text-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
              <span>
                <strong className="font-semibold">Database API Notice: </strong>
                {apiError || 'Hospital server connection degraded. Retaining local transactional safety.'}
              </span>
            </div>
            <button
              onClick={() => loadData()}
              className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-md text-xs font-semibold shrink-0 cursor-pointer"
            >
              Retry Sync
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Patient Portal View: ONLY Patient Kiosk */}
        {currentRole === 'patient' && (
          <PatientIntakeKiosk
            onPatientEnrolled={(patient, summary) => {
              handlePatientEnrolled(patient, summary);
            }}
            language={language}
            onLanguageChange={setLanguage}
            onOpenNavigator={() => {
              setIsNavigatorModalOpen(true);
            }}
            easyMode={easyMode}
            onToggleEasyMode={() => setEasyMode(v => !v)}
          />
        )}

        {/* Doctor Portal View: ONLY Doctor Consultation Station */}
        {currentRole === 'doctor' && (
          <DoctorStation
            patients={patients}
            activePatient={activePatient}
            onSelectPatient={setActivePatient}
            clinicalSummary={currentSummary}
            onUpdateSummary={handleUpdateSummary}
            onNavigateToRoute={() => setCurrentView('navigator')}
            language={language}
            onUpdatePatient={(updatedPatient) => {
              setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
              setActivePatient(updatedPatient);
            }}
          />
        )}

        {/* Hospital Management Portal Views: ONLY Management, Triage, Queue & Navigator */}
        {currentRole === 'management' && (
          <>
            {(currentView === 'crowd' || currentView === 'management') && (
              <HospitalManagementView
                alerts={triageAlerts}
                feedbacks={feedbacks}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onTriagePatient={handleTriagePatient}
              />
            )}

            {currentView === 'triage' && (
              <TriageDesk
                alerts={triageAlerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onTriagePatient={handleTriagePatient}
              />
            )}

            {currentView === 'queue_display' && (
              <QueueDisplayBoard
                patients={patients}
                language={language}
              />
            )}

            {currentView === 'navigator' && (
              <HospitalNavigatorView
                activePatient={activePatient}
                clinicalSummary={currentSummary}
                language={language}
                onSelectPatient={setActivePatient}
                allPatients={patients}
                onUpdatePatient={(updatedPatient) => {
                  setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
                  setActivePatient(updatedPatient);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Quick Navigation Pop-up Modal */}
      <HospitalNavigatorModal
        isOpen={isNavigatorModalOpen}
        onClose={() => setIsNavigatorModalOpen(false)}
        activePatient={activePatient}
        clinicalSummary={currentSummary}
        language={language}
        onUpdatePatient={(updatedPatient) => {
          setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
          setActivePatient(updatedPatient);
        }}
      />

      {/* Bottom Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500 font-sans">
        <span>CARESAAR • AI Clinical Intake &amp; Case-Taking Platform • Multilingual &amp; AYUSH OPD • Privacy-Aware Architecture</span>
      </footer>
    </div>
  );
}

export default App;
