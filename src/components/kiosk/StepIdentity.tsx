import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck,
  QrCode,
  Volume2,
  Search,
  History,
  FileCheck2
} from 'lucide-react';
import { PatientProfile } from '../../types';
import { speakText, playDoctorChime, playTouchFeedback, playSuccessChime, unlockAudioSystem } from '../../services/speechService';
import { getTranslations } from '../../utils/translations';
import { lookupPatientFromDB } from '../../services/dbService';

interface StepIdentityProps {
  patient: PatientProfile;
  onUpdatePatient: (updated: Partial<PatientProfile>) => void;
  onNext: () => void;
  audioEnabled: boolean;
}

export const StepIdentity: React.FC<StepIdentityProps> = ({
  patient,
  onUpdatePatient,
  onNext,
  audioEnabled
}) => {
  const [mobileInput, setMobileInput] = useState(patient.mobile || '');
  const [nameInput, setNameInput] = useState(patient.name || '');
  const [ageInput, setAgeInput] = useState(patient.age ? String(patient.age) : '45');
  const [genderInput, setGenderInput] = useState<'M' | 'F' | 'O'>(patient.gender || 'M');
  const [abhaInput, setAbhaInput] = useState(patient.abhaId || '');
  const [isAbhaLinked, setIsAbhaLinked] = useState(patient.abhaLinked);
  const [linkedHistoryCount, setLinkedHistoryCount] = useState<number | null>(null);
  const [isSearchingAbha, setIsSearchingAbha] = useState<boolean>(false);

  const t = getTranslations(patient.language);

  // Auto lookup when ABHA or Mobile is typed or scanned
  const performLookup = async (query: string) => {
    if (!query || query.trim().length < 4) return;
    try {
      setIsSearchingAbha(true);
      const res = await lookupPatientFromDB(query);
      if (res && res.patient) {
        const found = res.patient;
        setNameInput(found.name);
        setAgeInput(String(found.age));
        setGenderInput(found.gender);
        setMobileInput(found.mobile);
        setAbhaInput(found.abhaId || query);
        setIsAbhaLinked(true);
        setLinkedHistoryCount(res.history?.length || 0);

        onUpdatePatient({
          id: found.id,
          name: found.name,
          age: found.age,
          gender: found.gender,
          mobile: found.mobile,
          abhaId: found.abhaId || query,
          abhaLinked: true,
          vitals: found.vitals || patient.vitals
        });

        playSuccessChime();
        if (audioEnabled) {
          speakText(
            `ABHA ID verified for ${found.name}. ${res.history?.length || 0} longitudinal medical records automatically synchronized.`,
            patient.language,
            undefined,
            { playChime: true }
          );
        }
      }
    } catch (err) {
      console.error('Lookup error:', err);
    } finally {
      setIsSearchingAbha(false);
    }
  };

  const handleSimulateAbhaScan = async () => {
    unlockAudioSystem();
    playTouchFeedback();
    const abhaSample = '91-4521-8890-1234';
    setAbhaInput(abhaSample);
    await performLookup(abhaSample);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playTouchFeedback();

    onUpdatePatient({
      name: nameInput || 'Patient',
      age: parseInt(ageInput, 10) || 40,
      gender: genderInput,
      mobile: mobileInput || '9876543210',
      abhaId: abhaInput,
      abhaLinked: isAbhaLinked
    });

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            {t.identity.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.identity.subtitle}
          </p>
        </div>

        {/* Quick ABHA Scan Button */}
        <button
          type="button"
          onClick={handleSimulateAbhaScan}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-all cursor-pointer shadow-2xs touch-target"
        >
          <QrCode className="w-4 h-4 text-teal-700" />
          <span>{t.identity.scanAbha}</span>
        </button>
      </div>

      {/* Auto-Linked ABHA Banner */}
      {isAbhaLinked && linkedHistoryCount !== null && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start justify-between gap-3 text-emerald-900 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider block text-emerald-800">
                ABDM Health Record Synchronized
              </span>
              <p className="text-xs text-emerald-950 font-semibold mt-0.5">
                Linked to {nameInput || 'Patient'} • <span className="font-bold">{linkedHistoryCount} Prior Hospital Visits & Prescriptions</span> Auto-Retrieved
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold bg-emerald-200/70 text-emerald-900 px-2.5 py-1 rounded-full border border-emerald-300">
            ABHA Auto-Track Active
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {t.identity.fullName} *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={t.identity.fullNamePlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {t.identity.mobile} *
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="tel"
              required
              value={mobileInput}
              onChange={(e) => {
                const val = e.target.value;
                setMobileInput(val);
                if (val.length === 10) performLookup(val);
              }}
              placeholder={t.identity.mobilePlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-600 focus:outline-hidden font-mono"
            />
          </div>
        </div>

        {/* Age & Gender */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t.identity.age} *
            </label>
            <input
              type="number"
              min="1"
              max="120"
              required
              value={ageInput}
              onChange={(e) => setAgeInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t.identity.gender}
            </label>
            <select
              value={genderInput}
              onChange={(e) => setGenderInput(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-600 focus:outline-hidden"
            >
              <option value="M">{t.identity.genderMale}</option>
              <option value="F">{t.identity.genderFemale}</option>
              <option value="O">{t.identity.genderOther}</option>
            </select>
          </div>
        </div>

        {/* ABHA Number & Status */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {t.identity.abhaId}
          </label>
          <div className="relative">
            <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={abhaInput}
              onChange={(e) => {
                const val = e.target.value;
                setAbhaInput(val);
                setIsAbhaLinked(!!val);
                if (val.replace(/[-\s]/g, '').length >= 10) {
                  performLookup(val);
                }
              }}
              placeholder={t.identity.abhaPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-600 focus:outline-hidden font-mono"
            />
            {isAbhaLinked && (
              <span className="absolute right-3 top-2.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {t.identity.abhaLinked}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>{t.identity.secureSession}</span>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs touch-target cursor-pointer"
        >
          <span>{t.identity.nextConsent}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
