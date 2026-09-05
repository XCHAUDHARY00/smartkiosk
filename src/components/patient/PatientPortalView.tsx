import React, { useState } from 'react';
import { 
  Compass, 
  FileText, 
  User, 
  CheckCircle2, 
  Building2, 
  Clock, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { 
  PatientProfile, 
  QuestionAnswer, 
  UploadedDocument, 
  ClinicalSummary, 
  TriageAlert, 
  PatientFeedback 
} from '../../types';
import { KioskContainer } from '../kiosk/KioskContainer';
import { HospitalNavigatorView } from '../navigator/HospitalNavigatorView';

interface PatientPortalViewProps {
  patient: PatientProfile;
  answers: QuestionAnswer[];
  documents: UploadedDocument[];
  summary: ClinicalSummary | null;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onUpdatePatient: (updated: Partial<PatientProfile>) => void;
  onAddAnswer: (answer: QuestionAnswer) => void;
  onAddDocument: (doc: UploadedDocument) => void;
  onRemoveDocument: (docId: string) => void;
  onUpdateSummary: (summary: ClinicalSummary) => void;
  onTriggerRedFlagAlert: (alert: Partial<TriageAlert>) => void;
  onAddFeedback: (feedback: PatientFeedback) => void;
  onResetKiosk: () => void;
}

export const PatientPortalView: React.FC<PatientPortalViewProps> = (props) => {
  // Toggle between 'kiosk' (intake / registration) and 'navigator' (post-consultation hospital route)
  const [patientMode, setPatientMode] = useState<'kiosk' | 'navigator'>('kiosk');

  return (
    <div className="space-y-4">
      {/* Patient Top Navigation Bar */}
      <div className="max-w-4xl mx-auto px-4 pt-2">
        <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          
          {/* Active Token info */}
          <div className="flex items-center gap-2.5 px-2">
            <span className="font-mono text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-xl">
              {props.patient.tokenNumber}
            </span>
            <div className="leading-tight">
              <span className="text-xs font-bold text-slate-800 block">
                {props.patient.name || 'OPD Patient (मरीज़)'}
              </span>
              <span className="text-[11px] text-slate-500">
                District Civil Hospital • OPD Cabin 102
              </span>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setPatientMode('kiosk')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                patientMode === 'kiosk'
                  ? 'bg-white text-teal-900 shadow-xs border border-slate-200/60 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Intake Kiosk (पंजीकरण)</span>
            </button>

            <button
              onClick={() => setPatientMode('navigator')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                patientMode === 'navigator'
                  ? 'bg-teal-700 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-teal-300" />
              <span>Hospital Route (कहाँ जाना है?)</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="animate-in fade-in duration-150">
        {patientMode === 'kiosk' ? (
          <KioskContainer {...props} />
        ) : (
          <HospitalNavigatorView
            patient={props.patient}
            summary={props.summary}
            onClose={() => setPatientMode('kiosk')}
          />
        )}
      </div>
    </div>
  );
};
