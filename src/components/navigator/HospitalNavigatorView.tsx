import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle2, 
  Circle, 
  Volume2, 
  Printer, 
  Share2, 
  ArrowRight, 
  Stethoscope, 
  Building, 
  AlertCircle,
  Footprints,
  Info
} from 'lucide-react';
import { PatientProfile, ClinicalSummary, LanguageCode, HospitalRoutePlan } from '../../types';
import { buildHospitalRoutePlan } from '../../services/hospitalNavigatorService';

interface HospitalNavigatorViewProps {
  activePatient: PatientProfile | null;
  clinicalSummary?: ClinicalSummary;
  language: LanguageCode;
  onSelectPatient?: (patient: PatientProfile) => void;
  allPatients?: PatientProfile[];
}

export const HospitalNavigatorView: React.FC<HospitalNavigatorViewProps> = ({
  activePatient,
  clinicalSummary,
  language,
  onSelectPatient,
  allPatients = []
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!activePatient) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-slate-700 text-base">No Active Patient Token</h3>
        <p className="text-slate-400 text-xs mt-1">Please enroll a patient from the Kiosk or select from the queue.</p>
      </div>
    );
  }

  const routePlan: HospitalRoutePlan = buildHospitalRoutePlan(activePatient, clinicalSummary);
  const isDoctorDone = clinicalSummary?.isDoctorConsultationDone || false;

  const toggleStep = (stepNum: number) => {
    if (completedSteps.includes(stepNum)) {
      setCompletedSteps(completedSteps.filter(s => s !== stepNum));
    } else {
      setCompletedSteps([...completedSteps, stepNum]);
    }
  };

  const handleSpeakDirections = () => {
    if (!('speechSynthesis' in window)) return;
    setIsSpeaking(true);

    const firstActiveStep = routePlan.steps.find(s => !completedSteps.includes(s.stepNumber)) || routePlan.steps[0];
    const textToSpeak = language === 'hi' 
      ? `टोकन संख्या ${activePatient.tokenNumber}. अगला चरण: ${firstActiveStep.directionsHindi}`
      : `Token ${activePatient.tokenNumber}. Next step: ${firstActiveStep.directionsText}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigator Top Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/90 text-white flex flex-col items-center justify-center font-extrabold shadow-sm ring-2 ring-indigo-400/20">
              <span className="text-[10px] uppercase font-semibold text-indigo-200">TOKEN</span>
              <span className="text-2xl leading-none">{activePatient.tokenNumber}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
                  {activePatient.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {activePatient.assignedCabin}
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-1 font-hindi flex items-center gap-2">
                <span>अस्पताल मार्गदर्शक एवं कतार समय सारणी</span>
                <span>•</span>
                <span>Est. Total Wait: ~{routePlan.totalEstimatedWaitMin} mins</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSpeakDirections}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSpeaking 
                  ? 'bg-amber-400 text-slate-900 animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeaking ? 'Speaking...' : 'Voice Guide (आवाज)'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>

        {/* Status indicator banner: Pre-Doctor vs Post-Doctor */}
        {!isDoctorDone ? (
          <div className="mt-5 p-3.5 bg-amber-500/20 border border-amber-400/40 rounded-xl flex items-center gap-3">
            <Info className="w-5 h-5 text-amber-300 shrink-0" />
            <div className="text-xs">
              <strong className="text-amber-200 block">Step 1: First visit {activePatient.assignedCabin} (डॉक्टर परामर्श)</strong>
              <span className="text-amber-100/90 font-hindi">
                अभी केवल डॉक्टर परामर्श सक्रिय है। डॉक्टर द्वारा जांच लिखने पर आगे के कमरे व कतार स्वतः जुड़ जाएंगे।
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-5 p-3.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <div className="text-xs">
              <strong className="text-emerald-200 block">Consultation Done: Follow diagnostic route below</strong>
              <span className="text-emerald-100/90 font-hindi">
                डॉक्टर ने {clinicalSummary?.doctorOrderedTests?.length || 0} जांचें निर्धारित की हैं। कृपया नीचे दिए गए क्रम में जाएं।
              </span>
            </div>
          </div>
        )}
      </div>

        {/* Route Steps Timeline */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            <span>Optimal Route & Step-by-Step Wayfinding (मार्ग क्रम)</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {completedSteps.length} of {routePlan.steps.length} Steps Completed
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {routePlan.steps.map((step) => {
            const isCompleted = completedSteps.includes(step.stepNumber);
            return (
              <div key={step.stepNumber} className="relative group">
                {/* Step Circle Indicator */}
                <button
                  type="button"
                  onClick={() => toggleStep(step.stepNumber)}
                  className={`absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all z-10 ${
                    isCompleted 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-white border-2 border-indigo-600 text-indigo-600'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.stepNumber}
                </button>

                {/* Step Details Box */}
                <div className={`p-4 rounded-xl border transition-all ${
                  isCompleted 
                    ? 'bg-emerald-50/50 border-emerald-200 opacity-75' 
                    : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200 shadow-xs'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-sm ${isCompleted ? 'text-emerald-950 line-through' : 'text-slate-900'}`}>
                          {step.service.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {step.service.roomNumber}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {step.service.floor} • {step.service.block}
                        </span>
                        {step.service.landmark && (
                          <span className="text-slate-400">
                            (Landmark: {step.service.landmark})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Wait Time & Queue Status */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1 justify-end">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Avg Wait: ~{step.service.estimatedWaitMin}m</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 justify-end">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{step.service.currentQueueCount} in queue</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleStep(step.stepNumber)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isCompleted ? 'Done ✓' : 'Mark Done'}
                      </button>
                    </div>
                  </div>

                  {/* Directions Text */}
                  <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs">
                    <p className="text-slate-700 font-medium flex items-start gap-1.5">
                      <Footprints className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{step.directionsText}</span>
                    </p>
                    <p className="text-slate-500 font-hindi mt-1 pl-5">
                      {step.directionsHindi}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
