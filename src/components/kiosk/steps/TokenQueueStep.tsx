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

interface TokenQueueStepProps {
  patient: PatientProfile;
  onUpdatePatient: (updated: PatientProfile) => void;
  onResetKiosk: () => void;
  onOpenNavigator: () => void;
  language: LanguageCode;
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
    description: 'Token announced on TV display. Proceed to cabin.'
  },
  {
    status: 'With Doctor',
    label: '3. In Consultation',
    hindiLabel: 'डॉक्टर के साथ (Consulting)',
    description: 'Active case examination with medical officer.'
  },
  {
    status: 'Completed',
    label: '4. Consultation Completed',
    hindiLabel: 'सम्पन्न (Completed)',
    description: 'Prescription & lab advice finalized.'
  }
];

export const TokenQueueStep: React.FC<TokenQueueStepProps> = ({
  patient,
  onUpdatePatient,
  onResetKiosk,
  onOpenNavigator,
  language
}) => {
  const [currentStatus, setCurrentStatus] = useState<PatientQueueStatus>(patient.status || 'Waiting');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Status progression: Waiting -> Called -> With Doctor -> Completed
  const handleAdvanceStatus = async (nextStatus: PatientQueueStatus) => {
    setIsUpdatingStatus(true);
    setCurrentStatus(nextStatus);
    const updated = { ...patient, status: nextStatus };
    onUpdatePatient(updated);
    await updatePatientStatus(patient.id, nextStatus);
    setIsUpdatingStatus(false);
  };

  const currentStageIndex = QUEUE_STAGES.findIndex(s => s.status === currentStatus);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-cyan-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-xs font-bold uppercase tracking-wider text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              Registration Completed • पंजीकरण सफल
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight">
              {patient.name}
            </h1>
            <p className="text-emerald-100 text-sm font-hindi">
              आपका डिजिटल ओपीडी पंजीकरण सफलतापूर्वक दर्ज कर लिया गया है।
            </p>
          </div>

          {/* Token Spotlight */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[180px] shadow-inner">
            <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-widest block">
              OPD TOKEN NO.
            </span>
            <span className="text-4xl sm:text-5xl font-mono font-black text-white tracking-wider block py-1">
              {patient.tokenNumber}
            </span>
            <span className="text-xs font-bold text-emerald-300">
              {patient.assignedCabin}
            </span>
          </div>
        </div>
      </div>

      {/* Queue State Progression Tracker */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <span>Live Queue Status Progression (प्रतीक्षा क्रम स्थिति)</span>
            </h3>
            <span className="text-xs text-slate-500">
              State Progression: WAITING → CALLED → WITH DOCTOR → COMPLETED
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Simulate OPD Event:</span>
            {currentStatus === 'Waiting' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleAdvanceStatus('Called')}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Call to Cabin (बुलावा)</span>
              </button>
            )}
            {currentStatus === 'Called' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleAdvanceStatus('With Doctor')}
                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Start Consultation</span>
              </button>
            )}
            {currentStatus === 'With Doctor' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleAdvanceStatus('Completed')}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Completed</span>
              </button>
            )}
          </div>
        </div>

        {/* 4-Stage Visual Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {QUEUE_STAGES.map((stage, idx) => {
            const isCompleted = currentStageIndex > idx;
            const isCurrent = currentStageIndex === idx;
            return (
              <div
                key={stage.status}
                className={`p-3.5 rounded-xl border-2 transition-all text-left ${
                  isCurrent
                    ? 'bg-teal-50 border-teal-500 shadow-xs ring-1 ring-teal-400/30'
                    : isCompleted
                    ? 'bg-emerald-50/60 border-emerald-300 text-slate-700'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    isCurrent
                      ? 'bg-teal-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {stage.status.toUpperCase()}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="font-bold text-slate-900 text-xs">
                  {stage.hindiLabel}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {stage.description}
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

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onResetKiosk}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>नया मरीज पंजीकरण (Register Another Patient)</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>टोकन पर्ची प्रिंट करें (Print Slip)</span>
          </button>

          <button
            type="button"
            onClick={onOpenNavigator}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            <span>केबिन का रास्ता देखें (View Wayfinding Route)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
