import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle, Info, Lock } from 'lucide-react';
import { ConsentRecord, LanguageCode } from '../../../types';

interface ConsentStepProps {
  consent: ConsentRecord | null;
  onConsentChange: (record: ConsentRecord) => void;
  onNext: () => void;
  onBack: () => void;
  language: LanguageCode;
}

export const ConsentStep: React.FC<ConsentStepProps> = ({
  consent,
  onConsentChange,
  onNext,
  onBack,
  language
}) => {
  const [agreed, setAgreed] = useState<boolean>(consent?.granted ?? true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const PURPOSE_VERSION = 'CARESAAR-OPD-INTAKE-v2026.1';

  const handleProceed = () => {
    if (!agreed) {
      setErrorMessage(
        language === 'hi'
          ? 'कृपया आगे बढ़ने के लिए सहमति दें। यह जानकारी डॉक्टर तक सुरक्षित रूप से पहुंचाने के लिए आवश्यक है।'
          : 'Please accept the consent terms to proceed with digital intake.'
      );
      return;
    }
    setErrorMessage(null);
    onConsentChange({
      granted: true,
      timestamp: new Date().toISOString(),
      purposeVersion: PURPOSE_VERSION
    });
    onNext();
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/80 text-teal-800 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          Step 2 of 9 • चरण 2 (सहमति)
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
          {language === 'hi' ? 'मरीज डिजिटल सहमति एवं गोपनीयता' : 'Patient Digital Consent & Privacy Notice'}
        </h2>
        <p className="text-sm text-slate-500">
          {language === 'hi'
            ? 'चिकित्सीय जानकारी एकत्र करने से पूर्व आपकी स्पष्ट सहमति आवश्यक है।'
            : 'Consent is required before collecting any clinical or medical history details.'}
        </p>
      </div>

      {/* Consent Details Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 text-sm text-slate-700">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-600" />
            <span className="font-bold text-slate-800">
              Purpose & Version: <span className="font-mono text-xs text-teal-700">{PURPOSE_VERSION}</span>
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-slate-600">
          <p>
            <strong>1. Scope of Data Collection:</strong> This automated kiosk collects your demographics (Name, Age, Gender, Phone, optional ABHA), current symptoms, medical history, and voluntary health documents to assist the duty doctor in OPD triage.
          </p>
          <p>
            <strong>2. Role of AI Assistant:</strong> AI is used strictly for organizing your spoken/written symptoms into structured clinical notes (SOCRATES framework) and calculating queue priority. All diagnoses and prescriptions are made solely by your licensed attending physician.
          </p>
          <p>
            <strong>3. Transparency Notice:</strong> Your data is transmitted over internal hospital network protocols directly to your assigned consultation cabin and stored temporarily in the active OPD queue. It is not shared with commercial third parties or advertisers.
          </p>
        </div>

        {/* Informative Note */}
        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            {language === 'hi'
              ? 'नोट: यदि आप डिजिटल कियोस्क का उपयोग नहीं करना चाहते, तो आप सीधे मुख्य ओपीडी पर्ची काउंटर पर जाकर सामान्य टोकन ले सकते हैं।'
              : 'Note: Digital kiosk intake is voluntary. Patients may opt for manual paper token generation at the main OPD helpdesk at any time.'}
          </span>
        </div>

        {/* Agreement Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer select-none p-3.5 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-50 transition-colors">
            <input
              id="consent-checkbox"
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.value === 'true' || e.target.checked);
                setErrorMessage(null);
              }}
              className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 border-slate-300 mt-0.5 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-800">
              {language === 'hi'
                ? 'हाँ, मैं अपनी स्वास्थ्य जानकारी डॉक्टर के साथ साझा करने और ओपीडी परामर्श हेतु कियोस्क का उपयोग करने की सहमति देता/देती हूँ।'
                : 'I hereby provide informed consent for digital case-intake and sharing my symptoms with the attending OPD medical officer.'}
            </span>
          </label>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>पीछे (Back)</span>
        </button>

        <button
          type="button"
          onClick={handleProceed}
          className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <span>सहमति स्वीकारें और आगे बढ़ें (Agree & Continue)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
