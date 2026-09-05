import React, { useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  Building2, 
  ShieldAlert, 
  Users, 
  Clock, 
  Activity, 
  CheckCircle2, 
  Zap, 
  Layers
} from 'lucide-react';
import { TriageAlert, PatientFeedback } from '../../types';
import { HospitalCrowdPredictor } from '../admin/HospitalCrowdPredictor';
import { TriageDesk } from '../triage/TriageDesk';
import { AnalyticsDashboard } from '../admin/AnalyticsDashboard';

export type ManagementSubTab = 'crowd_predictor' | 'triage' | 'analytics' | 'facilities';

interface HospitalManagementViewProps {
  alerts: TriageAlert[];
  feedbacks: PatientFeedback[];
  onAcknowledgeAlert: (alertId: string) => void;
  onTriagePatient: (alertId: string) => void;
}

export const HospitalManagementView: React.FC<HospitalManagementViewProps> = ({
  alerts,
  feedbacks,
  onAcknowledgeAlert,
  onTriagePatient
}) => {
  const [activeTab, setActiveTab] = useState<ManagementSubTab>('crowd_predictor');

  const activeRedAlerts = alerts.filter(a => a.status === 'active').length;

  return (
    <div className="space-y-6">
      
      {/* Enterprise Management Control Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase tracking-wider bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                  Hospital Administration &amp; Operations
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ● ABDM / EMR Live Sync
                </span>
              </div>
              <h1 className="text-xl font-bold font-heading mt-0.5 text-white">
                Hospital Command &amp; Capacity Control (अस्पताल प्रबंधन)
              </h1>
              <p className="text-xs text-slate-400">
                Real-time queue balancing, predictive surge forecasting, and clinical emergency escalation.
              </p>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700/80 overflow-x-auto self-start md:self-auto max-w-full">
            <button
              onClick={() => setActiveTab('crowd_predictor')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'crowd_predictor'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Surge Predictor 🔮</span>
            </button>

            <button
              onClick={() => setActiveTab('triage')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 relative ${
                activeTab === 'triage'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Emergency Triage</span>
              {activeRedAlerts > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse">
                  {activeRedAlerts}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'analytics'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Operations KPI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Active Sub-Tab */}
      <div className="animate-in fade-in duration-150">
        {activeTab === 'crowd_predictor' && (
          <HospitalCrowdPredictor />
        )}

        {activeTab === 'triage' && (
          <TriageDesk
            alerts={alerts}
            onAcknowledgeAlert={onAcknowledgeAlert}
            onTriagePatient={onTriagePatient}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            feedbacks={feedbacks}
            onNavigateToCrowdPredictor={() => setActiveTab('crowd_predictor')}
          />
        )}
      </div>

    </div>
  );
};
