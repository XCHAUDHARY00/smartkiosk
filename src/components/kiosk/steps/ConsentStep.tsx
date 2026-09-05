import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle, Info, Lock } from 'lucide-react';
import { ConsentRecord, LanguageCode } from '../../../types';
import { getTranslations } from '../../../utils/translations';
import { speakText, unlockAudioSystem } from '../../../services/speechService';

interface ConsentStepProps {
  consent: ConsentRecord | null;
  onConsentChange: (record: ConsentRecord) => void;
  onNext: () => void;
  onBack: () => void;
  language: LanguageCode;
  easyMode?: boolean;
}

export const ConsentStep: React.FC<ConsentStepProps> = ({
  consent,
  onConsentChange,
  onNext,
  onBack,
  language,
  easyMode = false
}) => {
  const [agreed, setAgreed] = useState<boolean>(consent?.granted ?? true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const t = getTranslations(language);
  const PURPOSE_VERSION = 'CARESAAR-OPD-INTAKE-v2026.1';

  const audioSummaryText = t.consent?.audioExplanationText || (language === 'hi'
    ? 'डिजिटल सहमति: इस कियोस्क में आपकी स्वास्थ्य जानकारी केवल आपके परामर्श डॉक्टर के लिए सुरक्षित रूप से दर्ज की जाती है। यह जानकारी किसी तीसरे पक्ष के साथ साझा नहीं की जाती।'
    : 'Informed Consent: Your symptom details are securely collected solely for your attending OPD physician and not shared with commercial parties.');

  const handlePlayVoiceTerms = () => {
    unlockAudioSystem();
    if (isPlayingAudio) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    speakText(audioSummaryText, language);
    setTimeout(() => setIsPlayingAudio(false), 8000);
  };

  const handleProceed = () => {
    if (!agreed) {
      setErrorMessage(
        t.consent?.consentCheck || (language === 'hi'
          ? 'आगे बढ़ने के लिए कृपया नीचे दिए गए चेकबॉक्स पर टैप करके सहमति दें।'
          : 'Please tap the consent checkbox below to proceed with digital intake.')
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-teal-800" />
          <span>{t.steps?.consent?.label || 'सहमति (Consent)'}</span>
        </div>
        <h2 className={`${easyMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'} font-heading font-black text-slate-900`}>
          {t.consent?.title || (language === 'hi' ? 'मरीज डिजिटल सहमति एवं गोपनीयता' : 'Patient Consent & Privacy Notice')}
        </h2>
        <p className={`${easyMode ? 'text-base' : 'text-sm'} text-slate-600 font-medium`}>
          {t.consent?.audioExplanation || (language === 'hi'
            ? 'चिकित्सीय जानकारी एकत्र करने से पूर्व आपकी स्पष्ट सहमति आवश्यक है।'
            : 'Informed consent is required before collecting any clinical symptoms or history.')}
        </p>
      </div>

      {/* Consent Details Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5 text-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-800" />
            <span className="font-bold text-slate-900 text-xs sm:text-sm">
              Purpose ID: <span className="font-mono text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{PURPOSE_VERSION}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={handlePlayVoiceTerms}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isPlayingAudio
                ? 'bg-amber-100 text-amber-950 border-amber-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
            }`}
            title="Read summary aloud"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isPlayingAudio ? 'रोकें (Stop)' : '🔊 सुनें (Listen)'}</span>
          </button>
        </div>

        {/* Clear Hospital Plain Points */}
        <div className={`space-y-3.5 leading-relaxed text-slate-700 ${easyMode ? 'text-base' : 'text-xs sm:text-sm'}`}>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <p>
              <strong>1. {t.consent?.clause1Title || 'उद्देश्य (Purpose)'}:</strong> {t.consent?.clause1 || 'आपकी बीमारी के लक्षण केवल ओपीडी डॉक्टर की सहायता एवं प्राथमिकता निर्धारण हेतु संकलित किए जा रहे हैं।'}
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <p>
              <strong>2. {t.consent?.clause2Title || 'AI सहायक (Role of AI)'}:</strong> {t.consent?.clause2 || 'AI केवल आपके बताए लक्षणों को क्रमबद्ध करता है। अंतिम निदान व उपचार केवल डॉक्टर द्वारा किया जाएगा।'}
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <p>
              <strong>3. {t.consent?.clause3Title || 'गोपनीयता (Data Privacy)'}:</strong> {t.consent?.clause3 || 'आपकी जानकारी अस्पताल के आंतरिक सुरक्षित नेटवर्क पर सीधे डॉक्टर के केबिन भेजी जाती है। किसी तीसरे पक्ष से साझा नहीं की जाती।'}
            </p>
          </div>
        </div>

        {/* Informative Note */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-teal-800 shrink-0 mt-0.5" />
          <span>
            {t.consent?.dpdpBadge || (language === 'hi'
              ? 'वैकल्पिक विकल्प: यदि आप कियोस्क का उपयोग नहीं करना चाहते, तो आप सीधे काउंटर से साधारण पर्ची ले सकते हैं।'
              : 'Voluntary intake: Patients may opt for manual paper token generation at the main OPD helpdesk at any time.')}
          </span>
        </div>

        {/* Agreement Checkbox with Large Touch Area */}
        <div className="pt-2">
          <label 
            htmlFor="consent-checkbox"
            className={`flex items-start gap-3.5 cursor-pointer select-none rounded-2xl border-2 transition-all ${
              easyMode ? 'p-5 min-h-[80px]' : 'p-4 min-h-[64px]'
            } ${
              agreed
                ? 'bg-teal-50 border-teal-800 ring-2 ring-teal-700/20'
                : 'bg-white border-slate-300 hover:border-teal-600'
            }`}
          >
            <input
              id="consent-checkbox"
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                setErrorMessage(null);
              }}
              className="w-6 h-6 rounded text-teal-800 focus:ring-teal-700 border-slate-400 mt-0.5 cursor-pointer shrink-0"
            />
            <span className={`${easyMode ? 'text-lg font-black' : 'text-sm font-bold'} text-slate-950 leading-snug`}>
              {t.consent?.consentCheck || (language === 'hi'
                ? 'हाँ, मैं डॉक्टर के परामर्श हेतु अपनी स्वास्थ्य जानकारी दर्ज करने की सहमति देता/देती हूँ।'
                : 'I hereby provide informed consent for digital case-intake and sharing my symptoms with the attending OPD medical officer.')}
            </span>
          </label>
        </div>

        {/* Error State with Retry guidance */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl text-sm text-rose-950 font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setAgreed(true);
                setErrorMessage(null);
              }}
              className="px-3 py-1 bg-rose-200 hover:bg-rose-300 text-rose-950 rounded-lg text-xs font-bold shrink-0 cursor-pointer"
            >
              सहमति दें (Check)
            </button>
          </div>
        )}
      </div>

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
          <span>{t.back || 'पीछे (Back)'}</span>
        </button>

        <button
          type="button"
          onClick={handleProceed}
          className={`bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2.5 border border-teal-950 cursor-pointer ${
            easyMode ? 'px-10 py-4 text-xl min-h-[64px]' : 'px-8 py-3.5 text-base min-h-[52px]'
          }`}
        >
          <span>{t.consent?.agreeButton || 'सहमति स्वीकारें (Agree & Continue)'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
