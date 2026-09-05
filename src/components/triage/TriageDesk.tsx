import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  Activity, 
  CheckCircle2, 
  ArrowUpRight, 
  BellRing,
  User,
  HeartPulse
} from 'lucide-react';
import { TriageAlert } from '../../types';
import { playTouchFeedback, playSuccessChime } from '../../services/speechService';

interface TriageDeskProps {
  alerts: TriageAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onTriagePatient: (alertId: string) => void;
}

export const TriageDesk: React.FC<TriageDeskProps> = ({
  alerts,
  onAcknowledgeAlert,
  onTriagePatient
}) => {
  const activeAlerts = alerts.filter(a => a.status === 'active');
  const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shadow-xs">
            <BellRing className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-red-800 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                Red-Flag Clinical Watch
              </span>
              <span className="text-xs text-slate-500 font-mono">OPD Triage Station</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-heading mt-0.5">
              Live Priority Intake & Emergency Triaging
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <span>{activeAlerts.length} Active Red Flags</span>
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Active Emergency Alerts Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-red-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Immediate Attention Required ({activeAlerts.length})</span>
            </h3>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              No unacknowledged emergency alerts. All waiting patients stable.
            </div>
          ) : (
            activeAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className="bg-white rounded-2xl p-5 border-2 border-red-400 shadow-md space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white uppercase tracking-wider">
                      Red Flag High Priority
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-800">
                      Token {alert.tokenNumber}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{alert.createdAt}</span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-teal-700" />
                    <span>{alert.patientName}</span>
                  </h4>
                  <p className="text-xs font-bold text-red-900 mt-1 bg-red-50 p-2.5 rounded-xl border border-red-100">
                    {alert.reason}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Triggers:</span>
                  {alert.symptomsTriggered.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-bold rounded-md">
                      {s}
                    </span>
                  ))}
                </div>

                {alert.vitals && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">BP</span>
                      <span className="font-mono font-bold text-red-700">{alert.vitals.bp || '160/100'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">Pulse</span>
                      <span className="font-mono font-bold">{alert.vitals.pulse || 98} bpm</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">SpO2</span>
                      <span className="font-mono font-bold">{alert.vitals.spo2 || 96}%</span>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      playTouchFeedback();
                      onAcknowledgeAlert(alert.id);
                    }}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Acknowledge Alert
                  </button>
                  <button
                    onClick={() => {
                      playTouchFeedback();
                      onTriagePatient(alert.id);
                    }}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Fast-Track to ER
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Monitored / Triaged Patient Stream */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Acknowledged & Triaged ({acknowledgedAlerts.length})</span>
          </h3>

          <div className="space-y-3">
            {acknowledgedAlerts.map((alert) => (
              <div key={alert.id} className="bg-white rounded-2xl p-4 border border-slate-200 text-xs space-y-2 opacity-80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{alert.patientName} ({alert.tokenNumber})</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    Triaged to Doctor Station
                  </span>
                </div>
                <p className="text-slate-600">{alert.reason}</p>
                <div className="text-[10px] text-slate-400">Acknowledged at {alert.createdAt}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
