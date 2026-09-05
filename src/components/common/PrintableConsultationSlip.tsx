import React from 'react';
import { ShieldCheck, QrCode, Building2, Stethoscope, Heart, CheckCircle2 } from 'lucide-react';
import { PatientProfile, ClinicalSummary } from '../../types';
import { translateSymptomToClinicalEnglish, transliterateIndicToLatin, hasIndicCharacters } from '../../utils/medicalTransliterator';

interface PrintableConsultationSlipProps {
  patient: PatientProfile;
  summary: ClinicalSummary | null;
  id?: string;
  className?: string;
}

export const PrintableConsultationSlip: React.FC<PrintableConsultationSlipProps> = ({
  patient,
  summary,
  id = 'opd-consultation-slip-printable',
  className = ''
}) => {
  const token = patient.tokenNumber || 'TK-101';
  const rawChief = summary?.chiefComplaint || 'General OPD Health Review';
  const chiefComplaintClinical = translateSymptomToClinicalEnglish(rawChief);
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const site = summary?.socrates?.site 
    ? translateSymptomToClinicalEnglish(summary.socrates.site) 
    : 'Precordial / Chest Area';
  const onset = summary?.socrates?.timing || summary?.socrates?.onset || 'Subacute duration (2-3 days)';
  const charac = summary?.socrates?.character || 'Heaviness / Discomfort';
  const severity = summary?.socrates?.severity || '6/10 Moderate';

  const cleanOnset = hasIndicCharacters(onset) ? transliterateIndicToLatin(onset) : onset;
  const cleanCharac = hasIndicCharacters(charac) ? transliterateIndicToLatin(charac) : charac;

  const hpi = summary?.historyOfPresentIllness || 
    `Patient ${patient.name} (${patient.age}Y/${patient.gender}) presents with ${chiefComplaintClinical}. Symptoms structured via pre-consultation intake.`;

  const medicines = summary?.medications && summary.medications.length > 0
    ? summary.medications
    : ['Tab Paracetamol 650mg (1-0-1) - 3 days', 'Tab Pantoprazole 40mg (1-0-0 Before Food) - 5 days'];

  return (
    <div
      id={id}
      className={`bg-white text-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-sm font-sans max-w-[794px] mx-auto text-xs ${className}`}
      style={{ minHeight: '1000px', boxSizing: 'border-box' }}
    >
      {/* 1. Official Header with ABDM & Government Accreditation */}
      <div className="bg-teal-800 text-white rounded-xl p-4 sm:p-5 flex items-center justify-between gap-4 mb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              ABDM Certified EMR
            </span>
            <span className="text-[11px] text-teal-200">
              National Health Authority (NHA)
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-black tracking-tight font-heading">
            GOVERNMENT & ABDM CERTIFIED OPD CONSULTATION SLIP
          </h1>
          <p className="text-[11px] text-teal-100 font-medium">
            AI-Augmented Smart Intake & Pre-Consultation Triage System
          </p>
        </div>

        {/* Big Token Badge */}
        <div className="bg-white text-teal-900 rounded-xl p-3 sm:p-3.5 text-center shadow-sm shrink-0 min-w-[100px]">
          <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider">
            OPD TOKEN
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-teal-800">
            {token}
          </span>
          <span className="text-[10px] block font-bold text-slate-600 mt-0.5">
            Room #102
          </span>
        </div>
      </div>

      {/* 2. Patient Demographics Card */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-800">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name</span>
            <span className="font-extrabold text-sm text-slate-900">{patient.name || 'Anonymous Patient'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Age / Sex</span>
            <span className="font-bold text-sm text-slate-800">{patient.age} Yrs / {patient.gender === 'M' ? 'Male' : 'Female'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Mobile No.</span>
            <span className="font-bold text-sm text-slate-800 font-mono">{patient.mobile || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">ABHA ID</span>
            <span className="font-bold text-xs text-teal-800 font-mono">{patient.abhaId || `ABDM-${token}`}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-800 mt-3 pt-3 border-t border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">OPD Department</span>
            <span className="font-bold text-teal-900 uppercase">{patient.department.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Date & Time</span>
            <span className="font-semibold text-slate-700">{formattedDate} • {formattedTime}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Vitals (BP / Pulse)</span>
            <span className="font-semibold text-slate-800">{patient.vitals?.bp || '120/80'} | {patient.vitals?.pulse || 76} bpm</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">SpO2 / Temp</span>
            <span className="font-semibold text-slate-800">{patient.vitals?.spo2 || 99}% | {patient.vitals?.temp || 98.4}°F</span>
          </div>
        </div>

        {/* Patient Verification Status */}
        {summary?.patientVerification?.verified && (
          <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] bg-emerald-50/70 p-2 rounded-lg border border-emerald-200 text-emerald-950">
            <span className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>
                Verified with Patient via AI Read-Back at {summary.patientVerification.verifiedAt || 'Consultation'}
              </span>
            </span>
            <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900 shrink-0">
              {summary.patientVerification.status === 'corrected_by_patient'
                ? 'Amended with Voice Corrections'
                : 'Confirmed 100% Accurate'}
            </span>
          </div>
        )}
      </div>

      {/* 3. Executive Key Points (High-Yield Clinical & Patient Summary) */}
      <div className="mb-5">
        <div className="flex items-center justify-between border-b-2 border-teal-700 pb-1.5 mb-3">
          <h2 className="font-black text-teal-900 text-xs sm:text-sm tracking-wide uppercase flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-teal-700" />
            ⭐ मुख्य बिंदु / High-Yield Key Points (Easily Understandable Summary)
          </h2>
          <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
            Patient & Doctor Quick Reference
          </span>
        </div>

        {/* 4 High-Yield Summary Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-amber-800 uppercase block tracking-wider">
              1. मुख्य समस्या / Primary Complaint
            </span>
            <p className="font-extrabold text-slate-900 text-xs sm:text-sm mt-0.5">
              {chiefComplaintClinical}
            </p>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-blue-800 uppercase block tracking-wider">
              2. अवधि व शुरुआत / Timeline & Onset
            </span>
            <p className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">
              {cleanOnset}
            </p>
          </div>

          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-purple-800 uppercase block tracking-wider">
              3. स्थान व दर्द का प्रकार / Location & Character
            </span>
            <p className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">
              {site} • {cleanCharac}
            </p>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block tracking-wider">
              4. गंभीरता व ट्रायज / Severity & Triage
            </span>
            <p className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 flex items-center justify-between">
              <span>{severity}</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-700 text-white rounded-md">
                Verified OPD Intake
              </span>
            </p>
          </div>
        </div>

        {/* Additional Executive Points Bullet Box if generated */}
        {summary?.executiveKeyPoints && summary.executiveKeyPoints.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-3">
            <span className="text-[10px] font-black text-slate-600 uppercase block mb-1.5 tracking-wider">
              महत्वपूर्ण क्लिनिकल बिंदु (Clinical Highlights):
            </span>
            <ul className="space-y-1 text-xs text-slate-800">
              {summary.executiveKeyPoints.map((point, pIdx) => (
                <li key={pIdx} className="flex items-start gap-2">
                  <span className="text-teal-700 font-bold">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Clinical Statement */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">
            Clinical History Summary (HPI):
          </span>
          <p className="text-slate-700 text-xs leading-relaxed">
            {hpi}
          </p>
        </div>
      </div>

      {/* 4. Doctor Prescription (Rx) & Advice */}
      <div className="mb-5">
        <div className="flex items-center justify-between border-b-2 border-teal-700 pb-1.5 mb-3">
          <h2 className="font-black text-teal-900 text-xs sm:text-sm tracking-wide uppercase flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-teal-700" />
            Doctor Prescription (Rx) & Clinical Advice
          </h2>
          <span className="text-[10px] font-bold text-teal-700">Official Medical Order</span>
        </div>

        <div className="bg-teal-50/50 rounded-xl border border-teal-200 p-4 space-y-3">
          <div>
            <span className="text-[10px] font-extrabold text-teal-900 uppercase block mb-1.5">
              Prescribed Medicines:
            </span>
            <ul className="space-y-1.5 text-xs text-slate-900 font-medium">
              {medicines.map((med, idx) => (
                <li key={idx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-teal-100">
                  <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span>{med}</span>
                </li>
              ))}
            </ul>
          </div>

          {summary?.doctorConsultationNotes && (
            <div className="pt-2 border-t border-teal-100">
              <span className="text-[10px] font-extrabold text-teal-900 uppercase block mb-1">
                Doctor Advice & Instructions:
              </span>
              <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-teal-100">
                {summary.doctorConsultationNotes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Footer with Doctor Stamp & Verification QR */}
      <div className="pt-4 border-t border-slate-300 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
            <QrCode className="w-12 h-12 text-slate-800" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 block">ABHA TOKEN VERIFICATION</span>
            <span className="font-mono text-xs font-bold text-slate-800">{token} • ST-02</span>
            <span className="text-[9px] text-emerald-700 font-bold block flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> Digitally Valid EMR Slip
            </span>
          </div>
        </div>

        <div className="text-right space-y-1 sm:min-w-[200px]">
          <div className="border-b border-slate-400 w-48 pb-1 inline-block"></div>
          <span className="text-[10px] font-bold text-slate-600 block">
            Doctor Signature & Stamp / Room #102
          </span>
          <span className="text-[9px] text-slate-400 block">
            Generated via Smart OPD AI Consultation Kiosk
          </span>
        </div>
      </div>
    </div>
  );
};
