import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Clock, 
  Users, 
  Building2, 
  Activity, 
  CheckCircle2, 
  BellRing,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { PatientProfile, LanguageCode } from '../../types';
import { formatHHMM } from '../../services/encounterWorkflowService';

interface QueueDisplayBoardProps {
  patients: PatientProfile[];
  language: LanguageCode;
}

export const QueueDisplayBoard: React.FC<QueueDisplayBoardProps> = ({
  patients,
  language
}) => {
  const [lastUpdated, setLastUpdated] = useState<string>(() => formatHHMM());

  // Periodically refresh the "Last updated: HH:MM" timestamp
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(formatHHMM());
    }, 60000); // 1 minute
    return () => clearInterval(timer);
  }, []);

  // Determine active called patient or top waiting/with-doctor patient
  const calledPatient = patients.find(p => p.status === 'Called') 
    || patients.find(p => p.status === 'With Doctor') 
    || patients.find(p => p.status === 'Waiting')
    || patients[0];

  const activeToken = calledPatient ? calledPatient.tokenNumber : 'A-104';
  const activeCabin = calledPatient ? calledPatient.assignedCabin : 'Cabin 102';
  const isCalledNow = calledPatient?.status === 'Called';

  // ── Database-Driven Department Queue Calculations ──────────────────────────
  // Calculate real queue counts from active patient records in database
  const cabin102Queue = patients.filter(
    p => p.assignedCabin.includes('102') && (p.status === 'Waiting' || p.status === 'Called')
  ).length;

  const cabin104Queue = patients.filter(
    p => p.assignedCabin.includes('104') && (p.status === 'Waiting' || p.status === 'Called')
  ).length;

  const pathologyQueue = patients.filter(p => {
    if (p.status !== 'Investigations') return false;
    const completed = p.encounter?.completedTests || [];
    const ordered = p.encounter?.orderedTests || [];
    const hasBlood = ordered.some(t => t.toLowerCase().includes('cbc') || t.toLowerCase().includes('blood') || t.toLowerCase().includes('sugar') || t.toLowerCase().includes('lipid'));
    const isDone = completed.some(t => t.toLowerCase().includes('cbc') || t.toLowerCase().includes('blood') || t.toLowerCase().includes('sugar') || t.toLowerCase().includes('lipid'));
    return hasBlood && !isDone;
  }).length;

  const ecgQueue = patients.filter(p => {
    if (p.status !== 'Investigations') return false;
    const completed = p.encounter?.completedTests || [];
    const ordered = p.encounter?.orderedTests || [];
    const hasEcg = ordered.some(t => t.toLowerCase().includes('ecg'));
    const isDone = completed.some(t => t.toLowerCase().includes('ecg'));
    return hasEcg && !isDone;
  }).length;

  const xrayQueue = patients.filter(p => {
    if (p.status !== 'Investigations') return false;
    const completed = p.encounter?.completedTests || [];
    const ordered = p.encounter?.orderedTests || [];
    const hasXray = ordered.some(t => t.toLowerCase().includes('x-ray') || t.toLowerCase().includes('xray') || t.toLowerCase().includes('chest'));
    const isDone = completed.some(t => t.toLowerCase().includes('x-ray') || t.toLowerCase().includes('xray') || t.toLowerCase().includes('chest'));
    return hasXray && !isDone;
  }).length;

  const pharmacyQueue = patients.filter(p => p.status === 'Pharmacy').length;

  const DEPT_STATUSES = [
    { 
      name: 'Cabin 102 (General Medicine)', 
      room: 'Room 102', 
      queue: cabin102Queue, 
      waitMin: cabin102Queue === 0 ? 0 : cabin102Queue * 8 
    },
    { 
      name: 'Cabin 104 (Chest & Respiratory)', 
      room: 'Room 104', 
      queue: cabin104Queue, 
      waitMin: cabin104Queue === 0 ? 0 : cabin104Queue * 9 
    },
    { 
      name: '12-Lead ECG Station', 
      room: 'Room 08', 
      queue: ecgQueue, 
      waitMin: ecgQueue === 0 ? 0 : ecgQueue * 5 
    },
    { 
      name: 'Central Pathology Lab', 
      room: 'Room 12', 
      queue: pathologyQueue, 
      waitMin: pathologyQueue === 0 ? 0 : pathologyQueue * 6 
    },
    { 
      name: 'Digital Chest X-Ray', 
      room: 'Room 104', 
      queue: xrayQueue, 
      waitMin: xrayQueue === 0 ? 0 : xrayQueue * 7 
    },
    { 
      name: 'Jan Aushadhi Dispensary', 
      room: 'Counter 4-5', 
      queue: pharmacyQueue, 
      waitMin: pharmacyQueue === 0 ? 0 : pharmacyQueue * 4 
    }
  ];

  return (
    <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6">
      {/* Top TV Bar: Privacy Protected, No "Live" Claim, Shows "Last updated: HH:MM" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold shadow-md">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight">
              CARESAAR OPD QUEUE DISPLAY (ओपीडी प्रतीक्षा कक्ष)
            </h1>
            <p className="text-xs text-slate-400 font-hindi">
              सार्वजनिक सूचना: सभी मरीज अपने टोकन नंबर पर ध्यान दें। (Please watch for your token number)
            </p>
          </div>
        </div>

        {/* Timestamp: "Last updated: HH:MM" as required by system policy */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800">
            <Clock className="w-4 h-4 text-teal-400" />
            <span className="text-xs text-slate-400 font-mono">Last updated:</span>
            <span className="text-sm font-mono font-bold text-teal-300">{lastUpdated}</span>
          </div>
          <button
            type="button"
            onClick={() => setLastUpdated(formatHHMM())}
            title="Refresh Display Timestamp"
            className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Calling Spotlight Card: Privacy-Safe ("TOKEN A-104 \n Please proceed to Cabin 102") */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-6 bg-gradient-to-br from-teal-950 via-slate-900 to-cyan-950 rounded-3xl p-6 border-2 border-teal-500/40 shadow-lg text-center flex flex-col justify-center items-center py-10">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3 border ${
            isCalledNow 
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 animate-pulse' 
              : 'bg-teal-500/20 text-teal-300 border-teal-400/30'
          }`}>
            <BellRing className="w-4 h-4" />
            {isCalledNow ? 'NOW CALLING • वर्तमान बुलावा' : 'CURRENT CALL • वर्तमान बुलावा'}
          </span>

          {/* TOKEN DISPLAY */}
          <div className="text-5xl sm:text-7xl font-mono font-black text-white tracking-tight drop-shadow-md">
            TOKEN {activeToken}
          </div>

          {/* INSTRUCTION DIRECTIVE */}
          <div className="mt-4 text-xl sm:text-2xl font-extrabold text-teal-200">
            Please proceed to {activeCabin}
          </div>

          <p className="text-sm text-teal-300/80 mt-2 font-hindi">
            टोकन {activeToken}: कृपया {activeCabin.replace('Cabin ', 'केबिन ')} में उपस्थित हों।
          </p>
        </div>

        {/* Upcoming Tokens Queue: Tokens & Destinations ONLY, No Patient Personal Names */}
        <div className="md:col-span-6 bg-slate-900/80 rounded-3xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Upcoming Tokens (आगामी टोकन)
            </span>
            <span className="text-[11px] text-teal-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Privacy Protected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {patients.slice(0, 6).map((p) => (
              <div 
                key={p.id} 
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  p.tokenNumber === activeToken
                    ? 'bg-teal-950/60 border-teal-500/60 shadow-xs'
                    : 'bg-slate-800/80 border-slate-700/60'
                }`}
              >
                <div>
                  <span className="font-mono text-base font-bold text-white block">
                    TOKEN {p.tokenNumber}
                  </span>
                  <span className="text-[11px] text-slate-300 block truncate max-w-[140px]">
                    {p.status === 'Called' 
                      ? `Proceed to ${p.assignedCabin}` 
                      : p.status === 'With Doctor' 
                      ? `In Cabin (${p.assignedCabin})` 
                      : p.status === 'Investigations' 
                      ? 'Diagnostic Wing' 
                      : p.status === 'Report Ready' 
                      ? 'Reports Ready • OPD' 
                      : p.status === 'Doctor Review' 
                      ? `Doctor Review (${p.assignedCabin})` 
                      : p.status === 'Pharmacy' 
                      ? 'Pharmacy Counter' 
                      : p.status === 'Completed' 
                      ? 'Completed' 
                      : 'OPD Waiting Hall'}
                  </span>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  p.status === 'Called' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  p.status === 'With Doctor' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                  p.status === 'Investigations' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' :
                  p.status === 'Report Ready' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                  p.status === 'Doctor Review' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' :
                  p.status === 'Pharmacy' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Database-Driven Department Queue Wait Times */}
      <div className="pt-4 border-t border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Department Status & Estimated Wait Times (विभागीय प्रतीक्षा समय — वास्तविक गणना)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {DEPT_STATUSES.map((dept, i) => (
            <div key={i} className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <span className="font-bold text-slate-200 block truncate">{dept.name}</span>
              <div className="text-[11px] text-slate-400 flex justify-between pt-1">
                <span>{dept.room}</span>
                <span className="text-teal-400 font-semibold">{dept.queue} waiting</span>
              </div>
              <div className={`text-[11px] font-bold ${dept.queue > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                {dept.queue > 0 ? `Avg Wait: ~${dept.waitMin} mins` : 'No wait'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
