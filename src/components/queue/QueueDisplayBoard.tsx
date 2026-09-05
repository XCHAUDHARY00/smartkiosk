import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Volume2, 
  Clock, 
  Users, 
  Building2, 
  Activity, 
  CheckCircle2, 
  BellRing 
} from 'lucide-react';
import { PatientProfile, LanguageCode } from '../../types';

interface QueueDisplayBoardProps {
  patients: PatientProfile[];
  language: LanguageCode;
}

export const QueueDisplayBoard: React.FC<QueueDisplayBoardProps> = ({
  patients,
  language
}) => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeToken = patients[0]?.tokenNumber || 'A-101';
  const activeCabin = patients[0]?.assignedCabin || 'Cabin 102';

  const DEPT_STATUSES = [
    { name: 'Cabin 102 (General Medicine)', waitMin: 8, queue: patients.length, room: 'Room 102' },
    { name: 'Central Pathology Lab', waitMin: 14, queue: 7, room: 'Room 12' },
    { name: '12-Lead ECG Station', waitMin: 5, queue: 2, room: 'Room 08' },
    { name: 'Digital Chest X-Ray', waitMin: 9, queue: 4, room: 'Room 104' },
    { name: 'Jan Aushadhi Dispensary', waitMin: 10, queue: 6, room: 'Counter 4-5' }
  ];

  return (
    <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6">
      {/* Top TV Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold shadow-md">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight">
              AIIMS OPD LIVE QUEUE DISPLAY (ओपीडी प्रतीक्षा कक्ष)
            </h1>
            <p className="text-xs text-slate-400 font-hindi">
              सभी मरीज अपने टोकन नंबर पर ध्यान दें व उद्घोषणा की प्रतीक्षा करें।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800">
          <Clock className="w-5 h-5 text-teal-400" />
          <span className="text-lg font-mono font-bold text-teal-300">{currentTime}</span>
        </div>
      </div>

      {/* Main Calling Spotlight Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-6 bg-gradient-to-br from-teal-900/60 to-cyan-950/60 rounded-3xl p-6 border-2 border-teal-500/40 shadow-lg text-center flex flex-col justify-center items-center py-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-widest mb-3 border border-teal-400/30">
            <BellRing className="w-4 h-4 animate-bounce" />
            NOW CALLING • वर्तमान बुलावा
          </span>

          <div className="text-6xl sm:text-7xl font-mono font-black text-white tracking-tight drop-shadow-md">
            {activeToken}
          </div>

          <div className="mt-3 text-lg font-bold text-teal-200">
            {activeCabin} — Dr. Alok Verma
          </div>

          <p className="text-xs text-teal-300/80 mt-2 font-hindi">
            टोकन संख्या {activeToken} कृपया केबिन {activeCabin.replace('Cabin ', '')} में उपस्थित हों।
          </p>
        </div>

        {/* Next Tokens Queue */}
        <div className="md:col-span-6 bg-slate-900/80 rounded-3xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Upcoming Tokens (आगामी टोकन)
            </span>
            <span className="text-xs text-teal-400 font-mono">Real-Time Sync</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {patients.slice(1, 7).map((p, idx) => (
              <div key={p.id} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-mono text-base font-bold text-white block">
                    {p.tokenNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[100px] block">
                    {p.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-teal-300">
                  {p.assignedCabin}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hospital Department Queue Wait times */}
      <div className="pt-4 border-t border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Department Status & Estimated Wait Times (विभागीय प्रतीक्षा समय)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {DEPT_STATUSES.map((dept, i) => (
            <div key={i} className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <span className="font-bold text-slate-200 block truncate">{dept.name}</span>
              <div className="text-[11px] text-slate-400 flex justify-between pt-1">
                <span>Room: {dept.room}</span>
                <span className="text-teal-400 font-semibold">{dept.queue} waiting</span>
              </div>
              <div className="text-[11px] text-amber-400 font-bold">
                Avg Wait: ~{dept.waitMin} mins
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
