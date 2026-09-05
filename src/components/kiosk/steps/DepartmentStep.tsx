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
}

export const DepartmentStep: React.FC<DepartmentStepProps> = ({
  selectedDepartment,
  onSelectDepartment,
  onNext,
  onBack,
  language
}) => {
  const currentDept = DEPARTMENTS.find(d => d.name === selectedDepartment) || DEPARTMENTS[0];

  const renderIcon = (type: DepartmentOption['iconType']) => {
    switch (type) {
      case 'leaf':
        return <Leaf className="w-5 h-5 text-emerald-600" />;
      case 'wind':
        return <Wind className="w-5 h-5 text-sky-600" />;
      case 'bone':
        return <Bone className="w-5 h-5 text-amber-600" />;
      case 'baby':
        return <Baby className="w-5 h-5 text-pink-600" />;
      case 'heart':
        return <Heart className="w-5 h-5 text-rose-600" />;
      case 'droplet':
        return <Droplet className="w-5 h-5 text-indigo-600" />;
      default:
        return <Stethoscope className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/80 text-teal-800 text-xs font-bold uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5" />
          Step 4 of 9 • चरण 4 (विभाग)
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
          {language === 'hi' ? 'ओपीडी / आयुष विभाग का चयन करें' : 'Select OPD or AYUSH Department'}
        </h2>
        <p className="text-sm text-slate-500">
          {language === 'hi'
            ? 'अपनी स्वास्थ्य समस्या के अनुरूप उपयुक्त परामर्श विभाग चुनें।'
            : 'Choose the appropriate clinical specialty for your medical consultation.'}
        </p>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
        {DEPARTMENTS.map((dept) => {
          const isSelected = dept.name === currentDept.name;
          return (
            <div
              key={dept.id}
              onClick={() => onSelectDepartment(dept)}
              className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border-2 text-left relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-teal-50/90 border-teal-600 shadow-md ring-2 ring-teal-500/20'
                  : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100/80">
                      {renderIcon(dept.iconType)}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {language === 'hi' ? dept.hindiName : dept.name}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        {dept.doctorInCharge}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      dept.category === 'AYUSH' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {dept.category}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                  {dept.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
                  {dept.cabin}
                </span>
                <span className="text-slate-400">
                  {dept.floor}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>पहचान पर वापस (Back)</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <span>क्लिनिकल इंटरव्यू शुरू करें (Start Clinical Interview)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
