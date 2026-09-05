import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Sliders, 
  Building2, 
  Sparkles, 
  ShieldAlert, 
  ArrowUpRight, 
  Calendar, 
  Activity, 
  RefreshCw,
  BarChart2,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  DepartmentCrowdSnapshot, 
  HourlySurgeDataPoint, 
  AdminInterventionAction, 
  LoadLevel 
} from '../../types';
import { 
  getInitialDepartmentCrowdSnapshots, 
  getHourlySurgeTimeline, 
  getDefaultAdminInterventions 
} from '../../services/hospitalNavigatorService';

export const HospitalCrowdPredictor: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentCrowdSnapshot[]>(() => 
    getInitialDepartmentCrowdSnapshots()
  );
  const [hourlyTimeline, setHourlyTimeline] = useState<HourlySurgeDataPoint[]>(() => 
    getHourlySurgeTimeline()
  );
  const [interventions, setInterventions] = useState<AdminInterventionAction[]>(() => 
    getDefaultAdminInterventions()
  );
  
  // Interactive surge simulation multiplier: 1.0 (Normal), 1.25 (+25% Peak Monday), 1.50 (+50% Epidemic/Viral Surge)
  const [surgeMultiplier, setSurgeMultiplier] = useState<number>(1.0);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('dep_med_opd');

  // Toggle Admin Intervention
  const handleToggleIntervention = (actionId: string) => {
    setInterventions(prev => prev.map(act => {
      if (act.id !== actionId) return act;
      const willApply = !act.applied;
      return {
        ...act,
        applied: willApply,
        timestamp: willApply ? new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : undefined
      };
    }));

    // Dynamically adjust department load based on applied action
    const targetAction = interventions.find(a => a.id === actionId);
    if (!targetAction) return;

    setDepartments(prev => prev.map(dep => {
      if (dep.departmentName.includes(targetAction.department.split(' ')[0])) {
        const isNowActive = !dep.isInterventionActive;
        const waitDelta = isNowActive ? -targetAction.reductionMinutes : targetAction.reductionMinutes;
        return {
          ...dep,
          isInterventionActive: isNowActive,
          currentWaitMin: Math.max(8, dep.currentWaitMin + waitDelta),
          activeCounters: isNowActive ? Math.min(dep.totalCounters, dep.activeCounters + 1) : Math.max(1, dep.activeCounters - 1),
          predictedPeakLoad: isNowActive ? (dep.predictedPeakLoad === 'CRITICAL' ? 'HIGH' : 'MODERATE') : dep.predictedPeakLoad
        };
      }
      return dep;
    }));
  };

  // Aggregated totals
  const totalWaiting = useMemo(() => {
    return Math.round(departments.reduce((acc, d) => acc + d.currentWaitingPatients, 0) * surgeMultiplier);
  }, [departments, surgeMultiplier]);

  const totalIncomingNext2Hours = useMemo(() => {
    return Math.round(departments.reduce((acc, d) => acc + d.predictedIncomingCount, 0) * surgeMultiplier);
  }, [departments, surgeMultiplier]);

  // Helper for load level color
  const getLoadBadge = (level: LoadLevel) => {
    switch (level) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 border border-red-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
            🔴 CRITICAL SURGE
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            🟠 HIGH LOAD
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            🔵 MODERATE
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            🟢 NORMAL
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                AI Predictive Queue &amp; Surge Management
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                Hospital Administration Console
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 font-heading mt-0.5">
              Hospital Crowd Predictor (भीड़ का पूर्वानुुमान व नियंत्रण)
            </h1>
            <p className="text-xs text-slate-600">
              Correlating intake kiosk telemetry, registration velocity, and consultation duration to predict bottlenecks before they form.
            </p>
          </div>
        </div>

        {/* Live Simulation Controls */}
        <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-teal-700" />
            <span>Simulation:</span>
          </span>
          <div className="flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setSurgeMultiplier(1.0)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                surgeMultiplier === 1.0 
                  ? 'bg-teal-700 text-white font-bold shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Base
            </button>
            <button
              onClick={() => setSurgeMultiplier(1.25)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                surgeMultiplier === 1.25 
                  ? 'bg-amber-600 text-white font-bold shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              +25% Monday Rush
            </button>
            <button
              onClick={() => setSurgeMultiplier(1.50)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                surgeMultiplier === 1.50 
                  ? 'bg-red-700 text-white font-bold shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              +50% Viral Influx
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Current Corridor Load</span>
            <Users className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-heading">
            {totalWaiting} <span className="text-sm font-normal text-slate-500">patients</span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-1">
            Across 5 monitored hospital wings
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">🔮 Next 2 Hours Influx</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-900 font-heading">
            +{totalIncomingNext2Hours} <span className="text-sm font-normal text-slate-500">incoming</span>
          </div>
          <p className="text-xs text-amber-700 font-semibold mt-1">
            Peak wave: 10:30 AM – 12:30 PM
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Primary Bottleneck</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-lg font-bold text-red-950 font-heading leading-tight mt-1">
            Medicine OPD &amp; Pathology
          </div>
          <p className="text-xs text-red-700 font-medium mt-1">
            Wait times approaching ~32 mins
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Applied Counter Actions</span>
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-800 font-heading">
            {interventions.filter(a => a.applied).length} of {interventions.length}
          </div>
          <p className="text-xs text-emerald-700 font-semibold mt-1">
            Capacity interventions live
          </p>
        </div>
      </div>

      {/* Main Section: 🔮 NEXT 2 HOURS PREDICTION CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <span>🔮 NEXT 2 TO 4 HOURS PREDICTIVE FORECAST</span>
              <span className="text-xs font-mono font-normal text-slate-500">
                (Historical OPD Trends + Live Kiosk Registration Telemetry)
              </span>
            </h2>
            <p className="text-xs text-slate-600">
              Department-by-department load surge projections with automated operational recommendations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const isSelected = selectedDeptId === dept.id;
            return (
              <div
                key={dept.id}
                onClick={() => setSelectedDeptId(dept.id)}
                className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs ${
                  isSelected 
                    ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Card Top */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {dept.category} • {dept.building}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                      {dept.departmentName}
                    </h3>
                  </div>
                  <div>
                    {getLoadBadge(dept.predictedPeakLoad)}
                  </div>
                </div>

                {/* Live Stats Row */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl text-center border border-slate-200/80 mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Queue</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {Math.round(dept.currentWaitingPatients * surgeMultiplier)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Wait Time</span>
                    <span className={`text-sm font-extrabold ${
                      dept.currentWaitMin > 25 ? 'text-red-700' : dept.currentWaitMin > 15 ? 'text-amber-700' : 'text-emerald-700'
                    }`}>
                      ~{dept.currentWaitMin}m
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Counters</span>
                    <span className="text-sm font-extrabold text-teal-800">
                      {dept.activeCounters}/{dept.totalCounters}
                    </span>
                  </div>
                </div>

                {/* Next 2-Hour Prediction Detail */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Expected Surge Time:</span>
                    </span>
                    <strong className="font-mono text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {dept.predictedSurgeTime}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-teal-700" />
                      <span>Predicted Wave:</span>
                    </span>
                    <span className="font-bold text-slate-900">
                      +{Math.round(dept.predictedIncomingCount * surgeMultiplier)} patients
                    </span>
                  </div>

                  {/* Root Cause / Bottleneck */}
                  <div className="p-2.5 bg-slate-100/80 rounded-xl text-[11px] text-slate-700 border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-0.5">Root Cause / Telemetry:</span>
                    {dept.bottleneckFactor}
                  </div>

                  {/* Recommendation / Action Button */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[11px] text-teal-950 font-semibold mb-2 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span>Action: {dept.recommendedIntervention}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Find matching intervention
                        const matchingAction = interventions.find(a => a.department.includes(dept.departmentName.split(' ')[0]));
                        if (matchingAction) {
                          handleToggleIntervention(matchingAction.id);
                        }
                      }}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                        dept.isInterventionActive
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-teal-700 hover:bg-teal-800 text-white'
                      }`}
                    >
                      {dept.isInterventionActive ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Intervention Deployed (Counter Active)</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Deploy Recommended Counter Action</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Surge Waveform Chart & Timeline Heatmap */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-teal-700" />
              <span>Hospital Patient Wave: Hourly Department Inflow (08:00 AM – 04:00 PM)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Notice how the 09:00 AM Kiosk registration wave cascades into Doctor OPD at 10:30 AM, then Pathology at 11:30 AM, and Pharmacy at 12:30 PM.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="flex items-center gap-1 text-teal-800">
              <span className="w-3 h-3 rounded bg-teal-600" /> Medicine OPD
            </span>
            <span className="flex items-center gap-1 text-amber-800">
              <span className="w-3 h-3 rounded bg-amber-600" /> Pathology Lab
            </span>
            <span className="flex items-center gap-1 text-purple-800">
              <span className="w-3 h-3 rounded bg-purple-600" /> Radiology X-Ray
            </span>
            <span className="flex items-center gap-1 text-emerald-800">
              <span className="w-3 h-3 rounded bg-emerald-600" /> Pharmacy
            </span>
          </div>
        </div>

        {/* Visual Bar Timeline Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
          {hourlyTimeline.map((slot, sIdx) => {
            const medHeight = Math.min(100, (slot.medicineOpd * surgeMultiplier / 90) * 100);
            const labHeight = Math.min(100, (slot.pathologyLab * surgeMultiplier / 90) * 100);
            const isSurge = slot.isSurgeHour;

            return (
              <div 
                key={sIdx} 
                className={`p-3 rounded-xl border flex flex-col justify-between text-center transition-all ${
                  isSurge 
                    ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400' 
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div className="mb-2">
                  <span className="font-mono text-xs font-bold text-slate-900 block">{slot.hourLabel}</span>
                  {isSurge && (
                    <span className="text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                      Surge
                    </span>
                  )}
                </div>

                {/* Simulated Stacked Bar */}
                <div className="h-28 flex items-end justify-center gap-1.5 px-1 py-1 bg-white rounded-lg border border-slate-200">
                  {/* Medicine OPD */}
                  <div 
                    style={{ height: `${medHeight}%` }}
                    className="w-2.5 bg-teal-600 rounded-t transition-all"
                    title={`Medicine: ${Math.round(slot.medicineOpd * surgeMultiplier)}`}
                  />
                  {/* Pathology */}
                  <div 
                    style={{ height: `${labHeight}%` }}
                    className="w-2.5 bg-amber-600 rounded-t transition-all"
                    title={`Pathology: ${Math.round(slot.pathologyLab * surgeMultiplier)}`}
                  />
                  {/* Pharmacy */}
                  <div 
                    style={{ height: `${Math.min(100, (slot.pharmacy * surgeMultiplier / 90) * 100)}%` }}
                    className="w-2.5 bg-emerald-600 rounded-t transition-all"
                    title={`Pharmacy: ${Math.round(slot.pharmacy * surgeMultiplier)}`}
                  />
                </div>

                <div className="mt-2 text-[10px] font-mono text-slate-600">
                  Total: <strong>{Math.round((slot.medicineOpd + slot.pathologyLab + slot.pharmacy) * surgeMultiplier)}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Staff Interventions Console */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Actionable Hospital Staff Directives (अस्पताल प्रशासनिक कार्यवाही)
              </h3>
              <p className="text-xs text-slate-500">
                One-tap counter activation and resource reallocations to preemptively neutralize upcoming corridor surges.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {interventions.map((action) => (
            <div 
              key={action.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                action.applied 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    {action.department}
                  </span>
                  {action.applied && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      ✓ Active since {action.timestamp}
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-extrabold text-slate-900">
                  {action.title}
                </h4>

                <p className="text-[11px] text-slate-600 leading-tight">
                  {action.impactDescription}
                </p>

                <div className="text-[11px] text-emerald-700 font-bold mt-1">
                  Expected Impact: -{action.reductionMinutes} mins waiting time reduction
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleIntervention(action.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer shadow-2xs ${
                  action.applied 
                    ? 'bg-emerald-700 text-white' 
                    : 'bg-teal-700 hover:bg-teal-800 text-white'
                }`}
              >
                {action.applied ? 'Active ✓' : 'Execute'}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
