import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { PatientIntakeKiosk } from './components/kiosk/PatientIntakeKiosk';
import { DoctorStation } from './components/doctor/DoctorStation';
import { HospitalNavigatorView } from './components/navigator/HospitalNavigatorView';
import { HospitalNavigatorModal } from './components/navigator/HospitalNavigatorModal';
import { QueueDisplayBoard } from './components/queue/QueueDisplayBoard';
import { PatientProfile, ClinicalSummary, AppViewMode, LanguageCode } from './types';
import { INITIAL_PATIENTS, INITIAL_CLINICAL_SUMMARIES } from './data/mockData';
import { fetchAllPatients } from './services/api';

export function App() {
  const [currentView, setCurrentView] = useState<AppViewMode>('kiosk');
  const [language, setLanguage] = useState<LanguageCode>('hi');
  const [patients, setPatients] = useState<PatientProfile[]>(INITIAL_PATIENTS);
  const [activePatient, setActivePatient] = useState<PatientProfile | null>(INITIAL_PATIENTS[0]);
  const [clinicalSummaries, setClinicalSummaries] = useState<Record<string, ClinicalSummary>>(INITIAL_CLINICAL_SUMMARIES);
  const [isNavigatorModalOpen, setIsNavigatorModalOpen] = useState(false);
  const [serverConnected, setServerConnected] = useState(true);

  // Load patients and verify server health
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/health', { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          setServerConnected(true);
        } else {
          setServerConnected(false);
        }
      } catch (e) {
        setServerConnected(false);
      }

      const pList = await fetchAllPatients();
      if (pList && pList.length > 0) {
        setPatients(pList);
        if (!activePatient) {
          setActivePatient(pList[0]);
        }
      }
    }
    loadData();
  }, []);

  const handlePatientEnrolled = (newPatient: PatientProfile, summary: ClinicalSummary) => {
    setPatients(prev => [newPatient, ...prev.filter(p => p.id !== newPatient.id)]);
    setActivePatient(newPatient);
    setClinicalSummaries(prev => ({
      ...prev,
      [newPatient.id]: summary
    }));
  };

  const handleUpdateSummary = (updatedSummary: ClinicalSummary) => {
    if (!activePatient) return;
    setClinicalSummaries(prev => ({
      ...prev,
      [activePatient.id]: updatedSummary
    }));
  };

  const currentSummary = activePatient ? clinicalSummaries[activePatient.id] : undefined;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Universal Top Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        activePatient={activePatient}
        language={language}
        onLanguageChange={setLanguage}
        serverConnected={serverConnected}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === 'kiosk' && (
          <PatientIntakeKiosk
            onPatientEnrolled={(patient, summary) => {
              handlePatientEnrolled(patient, summary);
            }}
            language={language}
            onLanguageChange={setLanguage}
            onOpenNavigator={() => {
              setIsNavigatorModalOpen(true);
            }}
          />
        )}

        {currentView === 'doctor' && (
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

        {currentView === 'navigator' && (
          <HospitalNavigatorView
            activePatient={activePatient}
            clinicalSummary={currentSummary}
            language={language}
            onSelectPatient={setActivePatient}
            allPatients={patients}
          />
        )}

        {currentView === 'queue_display' && (
          <QueueDisplayBoard
            patients={patients}
            language={language}
          />
        )}
      </main>

      {/* Quick Navigation Pop-up Modal */}
      <HospitalNavigatorModal
        isOpen={isNavigatorModalOpen}
        onClose={() => setIsNavigatorModalOpen(false)}
        activePatient={activePatient}
        clinicalSummary={currentSummary}
        language={language}
      />

      {/* Bottom Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500 font-hindi">
        <span>राष्ट्रीय स्वास्थ्य मिशन (NHM) • आयुष्मान भारत डिजिटल मिशन (ABDM) • ओपीडी स्वचालित प्रणाली</span>
      </footer>
    </div>
  );
}

export default App;
