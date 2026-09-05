import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Volume2, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  FileText,
  Sparkles
} from 'lucide-react';
import { PatientProfile } from '../../types';
import { speakText, playTouchFeedback, playSuccessChime, unlockAudioSystem } from '../../services/speechService';
import { getTranslations } from '../../utils/translations';

interface StepConsentProps {
  patient: PatientProfile;
  onUpdatePatient: (updated: Partial<PatientProfile>) => void;
  onNext: () => void;
  onBack: () => void;
  audioEnabled: boolean;
}

export const StepConsent: React.FC<StepConsentProps> = ({
  patient,
  onUpdatePatient,
  onNext,
  onBack,
  audioEnabled
}) => {
  const [agreed, setAgreed] = useState(patient.consentSigned || false);
  const t = getTranslations(patient.language);

  // Sync agreed state if active patient changes
  useEffect(() => {
    setAgreed(Boolean(patient.consentSigned));
  }, [patient.consentSigned, patient.id]);

  const handlePlayAudio = () => {
    unlockAudioSystem();
    playTouchFeedback();
    speakText(t.consent.audioExplanationText, patient.language, undefined, { playChime: true });
  };

  const handleAgreeAndProceed = () => {
    unlockAudioSystem();
    playTouchFeedback();
    playSuccessChime();

    onUpdatePatient({
      consentSigned: true,
      consentTimestamp: new Date().toISOString()
    });

    onNext();
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
      
      {/* Header with Consent Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t.consent.dpdpBadge}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            {t.consent.title}
          </h2>
        </div>

        {/* Listen Audio Button */}
        <button
          type="button"
          onClick={handlePlayAudio}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer touch-target"
        >
          <Volume2 className="w-4 h-4" />
          <span>{t.consent.audioExplanation}</span>
        </button>
      </div>

      {/* Consent Clauses */}
      <div className="space-y-4">
        
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3.5">
          <div className="w-7 h-7 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold text-xs">
            1
          </div>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            <strong className="text-slate-900 block mb-0.5 font-heading">{t.consent.clause1Title}</strong>
            {t.consent.clause1}
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3.5">
          <div className="w-7 h-7 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold text-xs">
            2
          </div>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            <strong className="text-slate-900 block mb-0.5 font-heading">{t.consent.clause2Title}</strong>
            {t.consent.clause2}
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3.5">
          <div className="w-7 h-7 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold text-xs">
            3
          </div>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            <strong className="text-slate-900 block mb-0.5 font-heading">{t.consent.clause3Title}</strong>
            {t.consent.clause3}
          </div>
        </div>

      </div>

      {/* Checkbox agreement */}
      <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 flex items-center gap-3">
        <input
          type="checkbox"
          id="consentCheck"
          checked={agreed}
          onChange={(e) => {
            playTouchFeedback();
            setAgreed(e.target.checked);
          }}
          className="w-5 h-5 accent-teal-700 rounded-md cursor-pointer"
        />
        <label htmlFor="consentCheck" className="text-xs sm:text-sm font-bold text-teal-950 cursor-pointer">
          {t.consent.consentCheck}
        </label>
      </div>

      {/* Action Navigation */}
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
          disabled={!agreed}
          onClick={handleAgreeAndProceed}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white transition-all shadow-xs touch-target cursor-pointer"
        >
          <span>{t.consent.agreeButton}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
