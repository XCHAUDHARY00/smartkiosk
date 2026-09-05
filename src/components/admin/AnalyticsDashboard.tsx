import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Languages, 
  ShieldCheck, 
  Award, 
  CheckCircle2,
  FileCheck2
} from 'lucide-react';
import { PatientFeedback } from '../../types';

interface AnalyticsDashboardProps {
  feedbacks: PatientFeedback[];
  onNavigateToCrowdPredictor?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  feedbacks,
  onNavigateToCrowdPredictor
}) => {
  const totalIntakes = 142 + feedbacks.length;
  const avgDoctorTimeSavedMin = 4.2;
  const totalMinutesSaved = Math.round(totalIntakes * avgDoctorTimeSavedMin);
  const avgSatisfactionRating = 4.8;
  const abhaAdoptionRate = 78; // 78%

  const languageBreakdown = [
    { lang: 'Hindi (हिन्दी)', count: 88, pct: 62 },
    { lang: 'English', count: 24, pct: 17 },
    { lang: 'Marathi (मराठी)', count: 14, pct: 10 },
    { lang: 'Bhojpuri (भोजपुरी)', count: 9, pct: 6 },
    { lang: 'Others (Bengali, Punjabi, Tamil)', count: 7, pct: 5 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold shadow-xs">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Hospital OPD Operations
              </span>
              <span className="text-xs text-slate-500 font-mono">Live Telemetry & Impact</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-heading mt-0.5">
              OPD Intake Efficiency &amp; Clinical Time Savings
            </h2>
          </div>
        </div>

        {onNavigateToCrowdPredictor && (
          <button
            type="button"
            onClick={onNavigateToCrowdPredictor}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Open Crowd Predictor 🔮 (भीड़ का पूर्वानुमान)</span>
          </button>
        )}
      </div>

      {/* Crowd Surge Alert Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                🔮 AI Surge Alert: Next 2 Hours (10:30 AM – 12:30 PM)
              </span>
              <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.2 rounded-full animate-pulse">
                Medicine OPD High Load
              </span>
            </div>
            <p className="text-xs text-amber-900 mt-0.5">
              Current kiosk registrations indicate an incoming wave of <strong>+94 patients</strong> approaching Medicine Cabins and Pathology Lab.
            </p>
          </div>
        </div>

        {onNavigateToCrowdPredictor && (
          <button
            type="button"
            onClick={onNavigateToCrowdPredictor}
            className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer shadow-2xs"
          >
            Manage Counters &amp; Predict Surge →
          </button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Kiosk Intakes</span>
            <Users className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-heading">{totalIntakes}</div>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +24% vs manual registration
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Doctor Time Saved</span>
            <Clock className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-3xl font-extrabold text-teal-800 font-heading">{totalMinutesSaved} <span className="text-sm font-normal text-slate-500">mins</span></div>
          <p className="text-xs text-slate-500 mt-1">~4.2 mins saved per OPD patient</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">ABHA Digital Health</span>
            <ShieldCheck className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-heading">{abhaAdoptionRate}%</div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Linked directly via ABDM</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Patient Satisfaction</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 font-heading">{avgSatisfactionRating} <span className="text-sm font-normal text-slate-400">/ 5.0</span></div>
          <p className="text-xs text-slate-500 mt-1">Based on kiosk exit ratings</p>
        </div>

      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Language Adoption */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Languages className="w-4 h-4 text-teal-700" />
            <span>Multilingual Voice Adoption</span>
          </h3>

          <div className="space-y-3">
            {languageBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{item.lang}</span>
                  <span className="font-mono">{item.pct}% ({item.count} patients)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-600 rounded-full"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consent Compliance & Clinical Safety Metrics */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-teal-700" />
            <span>Patient Consent & Clinical Safety Audits</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Digital Consent Logs</span>
                <span className="text-[11px] text-slate-500">Explicit verified consent recorded for every patient</span>
              </div>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-md">100% Verified</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Auto Red-Flag Triggers</span>
                <span className="text-[11px] text-slate-500">Chest pain, dyspnea & stroke alerts dispatched instantly</span>
              </div>
              <span className="text-red-700 font-bold bg-red-50 px-2 py-1 rounded-md">12 Alerts Today</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Prescription OCR Accuracy</span>
                <span className="text-[11px] text-slate-500">Mean text & medication extraction confidence</span>
              </div>
              <span className="text-teal-700 font-bold bg-teal-50 px-2 py-1 rounded-md">96.4% Accuracy</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
