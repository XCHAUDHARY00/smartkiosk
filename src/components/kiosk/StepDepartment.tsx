import React from 'react';
import { 
  Stethoscope, 
  Heart, 
  Bone, 
  Baby, 
  Sparkles, 
  Activity, 
  Headphones, 
  HeartHandshake,
  ArrowRight,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { DepartmentCode, PatientProfile } from '../../types';
import { DEPARTMENTS } from '../../data/mockData';
import { speakText, playTouchFeedback, playDoctorChime, unlockAudioSystem } from '../../services/speechService';
import { getTranslations } from '../../utils/translations';

interface StepDepartmentProps {
  patient: PatientProfile;
  onUpdatePatient: (updated: Partial<PatientProfile>) => void;
  onNext: () => void;
  onBack: () => void;
  audioEnabled: boolean;
}

export const StepDepartment: React.FC<StepDepartmentProps> = ({
  patient,
  onUpdatePatient,
  onNext,
  onBack,
  audioEnabled
}) => {
  const t = getTranslations(patient.language);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heart': return <Heart className="w-6 h-6 text-red-500" />;
      case 'Bone': return <Bone className="w-6 h-6 text-amber-600" />;
      case 'Baby': return <Baby className="w-6 h-6 text-blue-500" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-purple-600" />;
      case 'Activity': return <Activity className="w-6 h-6 text-teal-600" />;
      case 'Headphones': return <Headphones className="w-6 h-6 text-indigo-500" />;
      case 'HeartHandshake': return <HeartHandshake className="w-6 h-6 text-pink-500" />;
      default: return <Stethoscope className="w-6 h-6 text-teal-700" />;
    }
  };

  const handleSelect = (deptCode: DepartmentCode, deptName: string, deptHindi: string) => {
    unlockAudioSystem();
    playTouchFeedback();
    const isAyush = deptCode === 'ayush_ayurveda';

    onUpdatePatient({
      department: deptCode,
      isAyushPatient: isAyush
    });

    if (audioEnabled) {
      const localizedName = t.department.deptLabels[deptCode] || deptName;
      const phrase = `${localizedName}. ${t.department.audioPhrase}`;
      speakText(phrase, patient.language, undefined, { playChime: true });
    }

    onNext();
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
      
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
          {t.department.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t.department.subtitle}
        </p>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEPARTMENTS.map((dept: any) => {
          const isSelected = patient.department === dept.code;
          const localizedName = t.department.deptLabels[dept.code] || dept.name;

          return (
            <button
              key={dept.code}
              type="button"
              onClick={() => handleSelect(dept.code, dept.name, dept.hindiName)}
              className={`p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer group hover:shadow-md ${
                isSelected
                  ? 'border-teal-600 bg-teal-50/70 shadow-xs'
                  : 'border-slate-200 hover:border-teal-300 bg-white'
              }`}
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  {getIcon(dept.iconName)}
                </div>

                <div className="font-bold text-slate-900 text-sm font-heading">
                  {localizedName}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {dept.name}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-500">{dept.roomNumber}</span>
                <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  {dept.queueCount} {t.department.inQueue}
                </span>
              </div>

              {isSelected && (
                <div className="absolute top-3 right-3 text-teal-700">
                  <CheckCircle2 className="w-5 h-5 fill-teal-100" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            playTouchFeedback();
            onBack();
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer touch-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playTouchFeedback();
            onNext();
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs touch-target cursor-pointer"
        >
          <span>{t.next}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
