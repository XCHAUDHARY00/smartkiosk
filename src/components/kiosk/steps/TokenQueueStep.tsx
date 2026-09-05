import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Printer, 
  MapPin, 
  Clock, 
  Users, 
  ArrowRight, 
  Building2, 
  Sparkles, 
  RotateCcw,
  BellRing,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  Phone,
  FileCheck
} from 'lucide-react';
import { PatientProfile, LanguageCode, PatientQueueStatus } from '../../../types';
import { updatePatientStatus } from '../../../services/api';
import { speakText, unlockAudioSystem } from '../../../services/speechService';
import { Volume2 } from 'lucide-react';

interface TokenQueueStepProps {
  patient: PatientProfile;
  onUpdatePatient: (updated: PatientProfile) => void;
  onResetKiosk: () => void;
  onOpenNavigator: () => void;
  language: LanguageCode;
  easyMode?: boolean;
}

const QUEUE_STAGES: Array<{
  status: PatientQueueStatus;
  label: string;
  hindiLabel: string;
  description: string;
}> = [
  {
    status: 'Waiting',
    label: '1. Waiting in Queue',
    hindiLabel: 'प्रतीक्षारत (Waiting)',
    description: 'Patient registered and waiting in OPD Waiting Hall.'
  },
  {
    status: 'Called',
    label: '2. Called to Cabin',
    hindiLabel: 'बुलावा (Now Calling)',
    description: 'Token announced on display. Proceed to doctor cabin.'
  },
  {
    status: 'With Doctor',
    label: '3. In Consultation',
    hindiLabel: 'डॉक्टर के साथ (Consulting)',
    description: 'Active examination with OPD Medical Officer.'
  },
  {
    status: 'Investigations',
    label: '4. Diagnostic Tests',
    hindiLabel: 'जांच (Diagnostics)',
    description: 'Undergoing ordered ECG, Pathology, and Imaging.'
  },
  {
    status: 'Report Ready',
    label: '5. Reports Ready',
    hindiLabel: 'रिपोर्ट तैयार (Reports Ready)',
    description: 'Investigation reports collected from Counter 4.'
  },
  {
    status: 'Doctor Review',
    label: '6. Doctor Review',
    hindiLabel: 'डॉक्टर समीक्षा (Review)',
    description: 'Return to doctor cabin for report review & final Rx.'
  },
  {
    status: 'Pharmacy',
    label: '7. Pharmacy Counter',
    hindiLabel: 'दवा वितरण (Pharmacy)',
    description: 'Collecting prescribed medicines at Jan Aushadhi Kendra.'
  },
  {
    status: 'Completed',
    label: '8. Encounter Done',
    hindiLabel: 'सम्पन्न (Completed)',
    description: 'All hospital steps completed successfully.'
  }
];

export const TokenQueueStep: React.FC<TokenQueueStepProps> = ({
  patient,
  onUpdatePatient,
  onResetKiosk,
  onOpenNavigator,
  language,
  easyMode = false
}) => {
  const [currentStatus, setCurrentStatus] = useState<PatientQueueStatus>(patient.status || 'Waiting');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Audio announcement helper
  const handleAnnounceToken = () => {
    unlockAudioSystem();
    const text = language === 'hi'
      ? `टोकन नंबर ${patient.tokenNumber}। कृपया केबिन नंबर ${patient.assignedCabin} पर जाएं।`
      : `Token number ${patient.tokenNumber}. Please proceed to cabin ${patient.assignedCabin}.`;
    speakText(text, language);
  };

  // Status progression through the 8 stages
  const handleAdvanceStatus = async (nextStatus: PatientQueueStatus) => {
    setIsUpdatingStatus(true);
    setCurrentStatus(nextStatus);
    const updated = { ...patient, status: nextStatus };
    onUpdatePatient(updated);
    await updatePatientStatus(patient.id, nextStatus);
    setIsUpdatingStatus(false);
  };

  const currentStageIndex = QUEUE_STAGES.findIndex(s => s.status === currentStatus || (s.status === 'Doctor Review' && currentStatus === 'Review'));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Success Banner - Serious Healthcare Hospital Palette */}
      <div className="bg-teal-900 border-2 border-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-800 border border-teal-700 text-xs font-black uppercase tracking-wider text-teal-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              Registration Completed • पंजीकरण सफल
            </div>
            <h1 className={`font-heading font-black tracking-tight ${
              easyMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
            }`}>
              {patient.name}
            </h1>
            <p className="text-teal-100 text-sm sm:text-base font-medium">
              {language === 'hi' 
                ? 'आपका डिजिटल ओपीडी पंजीकरण सफलतापूर्वक दर्ज कर लिया गया है।'
                : 'Digital OPD intake recorded successfully.'}
            </p>
          </div>

          {/* Token Spotlight Card */}
          <div className="bg-teal-800/90 rounded-2xl p-5 border border-teal-700 text-center min-w-[200px] shadow-sm space-y-2">
            <span className="text-xs font-black text-teal-200 uppercase tracking-widest block">
              OPD TOKEN NO.
            </span>
            <span className="text-5xl sm:text-6xl font-mono font-black text-white tracking-wider block py-1">
              {patient.tokenNumber}
            </span>
            <span className="text-sm font-black text-emerald-300 block">
              {patient.assignedCabin}
            </span>
            <button
              type="button"
              onClick={handleAnnounceToken}
              className="mt-1 w-full min-h-[40px] px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>{language === 'hi' ? '🔊 टोकन सुनें' : '🔊 Hear Token'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Queue State Progression Tracker */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <span>Realistic State-Driven Workflow (प्रतीक्षा क्रम स्थिति)</span>
            </h3>
            <span className="text-xs text-slate-500">
              WAITING → CALLED → WITH DOCTOR → INVESTIGATIONS → REPORT READY → DOCTOR REVIEW → PHARMACY → COMPLETED
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">Simulate Stage:</span>
            {currentStatus === 'Waiting' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleAdvanceStatus('Called')}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Call to Cabin</span>
              </button>
            )}
            {currentStatus === 'Called' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleAdvanceStatus('With Doctor')}
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Enter Cabin</span>
              </button>
            )}
            {currentStatus === 'With Doctor' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleAdvanceStatus('Investigations')}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1"
              >
                <span>Order Tests</span>
              </button>
            )}
            {currentStatus === 'Investigations' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleAdvanceStatus('Report Ready')}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1"
              >
                <span>Reports Ready</span>
              </button>
            )}
            {currentStatus === 'Report Ready' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleAdvanceStatus('Doctor Review')}
                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1"
              >
                <span>Doctor Review</span>
              </button>
            )}
            {currentStatus === 'Doctor Review' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleAdvanceStatus('Pharmacy')}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1"
              >
                <span>To Pharmacy</span>
              </button>
            )}
            {currentStatus === 'Pharmacy' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleAdvanceStatus('Completed')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1"
              >
                <span>Complete Visit</span>
              </button>
            )}
          </div>
        </div>

        {/* 8-Stage Visual Pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {QUEUE_STAGES.map((stage, idx) => {
            const isCompleted = currentStageIndex > idx;
            const isCurrent = currentStageIndex === idx;
            return (
              <div
                key={stage.status}
                className={`p-2.5 rounded-xl border-2 transition-all text-left ${
                  isCurrent
                    ? 'bg-teal-50 border-teal-500 shadow-xs ring-1 ring-teal-400/30'
                    : isCompleted
                    ? 'bg-emerald-50/60 border-emerald-300 text-slate-700'
                    : 'bg-slate-50/70 border-slate-200 opacity-60 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-teal-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isCompleted ? '✓' : idx + 1}
                  </span>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                  )}
                </div>
                <div className="font-bold text-xs text-slate-900 truncate">
                  {stage.label.replace(/^\d+\.\s*/, '')}
                </div>
                <div className="text-[10px] text-slate-500 font-hindi truncate mt-0.5">
                  {stage.hindiLabel.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Encounter Token Summary Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-teal-600" />
          <span>Registered Encounter Slip Details</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Patient ID:</span>
            <span className="font-mono font-bold text-slate-800">{patient.id}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Department:</span>
            <span className="font-bold text-teal-800">{patient.department}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Assigned Cabin:</span>
            <span className="font-bold text-slate-800">{patient.assignedCabin}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Registration Time:</span>
            <span className="font-bold text-slate-800 font-mono">{patient.registeredAt}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 block">Triage Chief Complaint:</span>
          <p className="text-slate-900 font-semibold">
            "{patient.chiefComplaintTranscript || 'General OPD Health Checkup'}"
          </p>
          {patient.clinicalInterview?.duration && (
            <div className="text-[11px] text-slate-500 pt-1">
              Duration: {patient.clinicalInterview.duration} • Severity: {patient.clinicalInterview.severity}/10
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Generous Touch Targets */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onResetKiosk}
          className={`w-full sm:w-auto min-h-[56px] px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2 ${
            easyMode ? 'text-base min-h-[64px]' : 'text-sm'
          }`}
        >
          <RotateCcw className="w-5 h-5 text-slate-600" />
          <span>{language === 'hi' ? 'नया मरीज पंजीकरण' : 'Register Another Patient'}</span>
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => window.print()}
            className={`w-full sm:w-auto min-h-[56px] px-5 py-3.5 bg-white border-2 border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.99] ${
              easyMode ? 'text-base min-h-[64px]' : 'text-sm'
            }`}
          >
            <Printer className="w-5 h-5 text-slate-600" />
            <span>{language === 'hi' ? 'टोकन पर्ची प्रिंट करें' : 'Print Slip'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenNavigator}
            className={`w-full sm:w-auto min-h-[56px] px-8 py-3.5 bg-teal-800 hover:bg-teal-900 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99] ${
              easyMode ? 'text-lg min-h-[64px] px-10' : 'text-base'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span>{language === 'hi' ? 'केबिन का रास्ता देखें' : 'View Wayfinding Route'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
