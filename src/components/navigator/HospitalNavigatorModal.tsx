import React from 'react';
import { X, Compass } from 'lucide-react';
import { PatientProfile, ClinicalSummary, LanguageCode } from '../../types';
import { HospitalNavigatorView } from './HospitalNavigatorView';

interface HospitalNavigatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePatient: PatientProfile | null;
  clinicalSummary?: ClinicalSummary;
  language: LanguageCode;
}

export const HospitalNavigatorModal: React.FC<HospitalNavigatorModalProps> = ({
  isOpen,
  onClose,
  activePatient,
  clinicalSummary,
  language
}) => {
  if (!isOpen || !activePatient) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            <h2 className="font-heading font-extrabold text-lg text-slate-900">
              Hospital Navigation Slip • अस्पताल मार्गदर्शक
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <HospitalNavigatorView
            activePatient={activePatient}
            clinicalSummary={clinicalSummary}
            language={language}
          />
        </div>
      </div>
    </div>
  );
};
