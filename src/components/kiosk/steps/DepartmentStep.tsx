import React from 'react';
import { 
  Building2, 
  Stethoscope, 
  Leaf, 
  Droplet, 
  Heart, 
  Bone, 
  Baby, 
  Wind, 
  ArrowRight, 
  ArrowLeft, 
  Check,
  Sparkles
} from 'lucide-react';
import { LanguageCode } from '../../../types';
import { getTranslations } from '../../../utils/translations';

export interface DepartmentOption {
  id: string;
  name: string;
  hindiName: string;
  category: 'Modern Medicine' | 'AYUSH';
  cabin: string;
  floor: string;
  doctorInCharge: string;
  description: string;
  iconType: 'stethoscope' | 'leaf' | 'droplet' | 'wind' | 'bone' | 'baby' | 'heart';
}

export const DEPARTMENTS: DepartmentOption[] = [
  {
    id: 'gen_med',
    name: 'General OPD (General Medicine)',
    hindiName: 'सामान्य चिकित्सा (General Medicine)',
    category: 'Modern Medicine',
    cabin: 'Cabin 102',
    floor: 'Ground Floor, Main OPD Block',
    doctorInCharge: 'Dr. Alok Verma, MD (Med)',
    description: 'Fever, diabetes, blood pressure, fatigue, general illness & acute ailments.',
    iconType: 'stethoscope'
  },
  {
    id: 'ayurveda',
    name: 'Ayurveda',
    hindiName: 'आयुर्वेद (कायचिकित्सा एवं पंचकर्म)',
    category: 'AYUSH',
    cabin: 'Cabin 105',
    floor: 'Ground Floor, AYUSH Integrated Block',
    doctorInCharge: 'Vaidya R. S. Sharma, BAMS, MD (Ayu)',
    description: 'Chronic metabolic disorders, joint pain, digestive imbalances, Panchakarma.',
    iconType: 'leaf'
  },
  {
    id: 'chest_resp',
    name: 'Chest & Respiratory OPD',
    hindiName: 'श्वसन एवं छाती रोग (Respiratory & Pulmonology)',
    category: 'Modern Medicine',
    cabin: 'Cabin 104',
    floor: 'Ground Floor, Wing B',
    doctorInCharge: 'Dr. R. K. Gupta, MD (Pulm)',
    description: 'Chronic cough, asthma, bronchitis, breathlessness, allergies & chest congestion.',
    iconType: 'wind'
  },
  {
    id: 'ortho',
    name: 'Orthopedics',
    hindiName: 'हड्डी एवं जोड़ रोग (Orthopedics)',
    category: 'Modern Medicine',
    cabin: 'Cabin 108',
    floor: '1st Floor, Ortho Block',
    doctorInCharge: 'Dr. Vikram Sethi, MS (Ortho)',
    description: 'Knee osteoarthritis, back pain, joint stiffness, sprains & spine health.',
    iconType: 'bone'
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    hindiName: 'शिशु एवं बाल रोग (Pediatrics)',
    category: 'Modern Medicine',
    cabin: 'Cabin 103',
    floor: 'Ground Floor, Mother & Child Block',
    doctorInCharge: 'Dr. Neha Kapoor, MD (Pedia)',
    description: 'Childhood infections, immunizations, infant nutrition & growth assessments.',
    iconType: 'baby'
  },
  {
    id: 'cardiology',
    name: 'Cardiology',
    hindiName: 'हृदय रोग (Cardiology)',
    category: 'Modern Medicine',
    cabin: 'Cabin 101',
    floor: 'Ground Floor, Cardio Wing',
    doctorInCharge: 'Dr. S. K. Mahajan, DM (Cardio)',
    description: 'Chest discomfort, hypertension evaluation, ECG review & palpitations.',
    iconType: 'heart'
  },
  {
    id: 'homeopathy',
    name: 'Homeopathy',
    hindiName: 'होम्योपैथी (Homeopathy)',
    category: 'AYUSH',
    cabin: 'Cabin 106',
    floor: 'Ground Floor, AYUSH Integrated Block',
    doctorInCharge: 'Dr. Ananya Roy, BHMS',
    description: 'Skin allergies, recurrent respiratory allergies, migraine & chronic constitutional care.',
    iconType: 'droplet'
  },
  {
    id: 'unani_siddha',
    name: 'Unani & Siddha',
    hindiName: 'यूनानी व सिद्ध (Unani & Siddha)',
    category: 'AYUSH',
    cabin: 'Cabin 107',
    floor: 'Ground Floor, AYUSH Integrated Block',
    doctorInCharge: 'Hakim M. Z. Khan, BUMS',
    description: 'Herbal formulations, humoral balance, musculoskeletal wellness & Ilaj-bit-Tadbeer.',
    iconType: 'leaf'
  }
];

interface DepartmentStepProps {
  selectedDepartment: string;
  onSelectDepartment: (dept: DepartmentOption) => void;
  onNext: () => void;
  onBack: () => void;
  language: LanguageCode;
  easyMode?: boolean;
}

export const DepartmentStep: React.FC<DepartmentStepProps> = ({
  selectedDepartment,
  onSelectDepartment,
  onNext,
  onBack,
  language,
  easyMode = false
}) => {
  const t = getTranslations(language);
  const [showAllDepartments, setShowAllDepartments] = React.useState<boolean>(!easyMode);
  const currentDept = DEPARTMENTS.find(d => d.name === selectedDepartment) || DEPARTMENTS[0];

  const primaryDeptIds = ['gen_med', 'ayurveda', 'ortho', 'pediatrics'];
  const displayedDepartments = easyMode && !showAllDepartments
    ? DEPARTMENTS.filter(d => primaryDeptIds.includes(d.id))
    : DEPARTMENTS;

  const renderIcon = (type: DepartmentOption['iconType']) => {
    switch (type) {
      case 'leaf':
        return <Leaf className="w-6 h-6 text-emerald-700" />;
      case 'wind':
        return <Wind className="w-6 h-6 text-sky-700" />;
      case 'bone':
        return <Bone className="w-6 h-6 text-amber-700" />;
      case 'baby':
        return <Baby className="w-6 h-6 text-pink-700" />;
      case 'heart':
        return <Heart className="w-6 h-6 text-rose-700" />;
      case 'droplet':
        return <Droplet className="w-6 h-6 text-indigo-700" />;
      default:
        return <Stethoscope className="w-6 h-6 text-teal-800" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider">
          <Building2 className="w-4 h-4 text-teal-800" />
          <span>{t.steps?.department?.label || 'विभाग (Department)'}</span>
        </div>
        <h2 className={`${easyMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'} font-heading font-black text-slate-900`}>
          {t.department?.title || (language === 'hi' ? 'ओपीडी / आयुष विभाग का चयन करें' : 'Select OPD or AYUSH Department')}
        </h2>
        <p className={`${easyMode ? 'text-base' : 'text-sm'} text-slate-600 font-medium`}>
          {t.department?.subtitle || (language === 'hi'
            ? 'अपनी स्वास्थ्य समस्या के अनुरूप उपयुक्त परामर्श विभाग चुनें।'
            : 'Choose the appropriate clinical specialty for your medical consultation.')}
        </p>
      </div>

      {/* Departments Grid with Generous Touch Targets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {displayedDepartments.map((dept) => {
          const isSelected = dept.name === currentDept.name;
          return (
            <div
              key={dept.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectDepartment(dept)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectDepartment(dept);
                }
              }}
              className={`cursor-pointer rounded-2xl transition-all border-2 text-left relative flex flex-col justify-between select-none ${
                easyMode ? 'p-6 min-h-[110px]' : 'p-5 min-h-[90px]'
              } ${
                isSelected
                  ? 'bg-teal-50 border-teal-800 ring-2 ring-teal-700/20 shadow-xs'
                  : 'bg-white border-slate-300 hover:border-teal-600 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                      {renderIcon(dept.iconType)}
                    </div>
                    <div>
                      <h4 className={`${easyMode ? 'text-lg font-black' : 'text-base font-extrabold'} text-slate-950 leading-snug`}>
                        {t.department?.deptLabels?.[dept.id] || (language === 'hi' ? dept.hindiName : dept.name)}
                      </h4>
                      <span className="text-xs font-semibold text-slate-600 block mt-0.5">
                        {dept.doctorInCharge}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                      dept.category === 'AYUSH' 
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                        : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}>
                      {dept.category}
                    </span>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-teal-800 text-white flex items-center justify-center">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>

                <p className={`${easyMode ? 'text-sm' : 'text-xs'} text-slate-700 font-medium line-clamp-2 mt-2`}>
                  {dept.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="font-extrabold text-teal-900 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                  {dept.cabin}
                </span>
                <span className="text-slate-600 font-medium">
                  {dept.floor}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Easy Mode "View All Departments" Toggle */}
      {easyMode && !showAllDepartments && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setShowAllDepartments(true)}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-sm border border-slate-300 transition-colors"
          >
            + अन्य सभी विभाग देखें (View All {DEPARTMENTS.length} Departments)
          </button>
        </div>
      )}

      {/* Navigation Buttons with Large Touch Area */}
      <div className="flex items-center justify-between pt-4 gap-4">
        <button
          type="button"
          onClick={onBack}
          className={`bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 font-bold rounded-2xl transition-all flex items-center gap-2 cursor-pointer ${
            easyMode ? 'px-8 py-4 text-lg min-h-[64px]' : 'px-6 py-3.5 text-sm min-h-[52px]'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.back || 'पहचान पर वापस (Back)'}</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className={`bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2.5 border border-teal-950 cursor-pointer ${
            easyMode ? 'px-10 py-4 text-xl min-h-[64px]' : 'px-8 py-3.5 text-base min-h-[52px]'
          }`}
        >
          <span>{t.next || 'इंटरव्यू शुरू करें (Continue)'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
