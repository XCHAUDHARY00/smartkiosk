import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Search, 
  HeartPulse, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  CreditCard,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PatientProfile, LanguageCode, VitalsData, PastVisitRecord } from '../../../types';
import { lookupPatientFromDB, fetchPatientHistoryByPhone } from '../../../services/api';

interface IdentityStepProps {
  initialData: Partial<PatientProfile>;
  onSaveIdentity: (data: {
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    phone: string;
    abhaId?: string;
    vitals?: VitalsData;
    pastVisits?: PastVisitRecord[];
  }) => void;
  onNext: () => void;
  onBack: () => void;
  language: LanguageCode;
}

export const IdentityStep: React.FC<IdentityStepProps> = ({
  initialData,
  onSaveIdentity,
  onNext,
  onBack,
  language
}) => {
  // Search query
  const [searchQuery, setSearchQuery] = useState(initialData.phone || '');
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  // Identity state
  const [name, setName] = useState(initialData.name || '');
  const [age, setAge] = useState<string>(initialData.age ? String(initialData.age) : '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(initialData.gender || 'Male');
  const [phone, setPhone] = useState(initialData.phone || '');
  const [abhaId, setAbhaId] = useState(initialData.abhaId || '');

  // Past visits
  const [pastVisits, setPastVisits] = useState<PastVisitRecord[]>(initialData.pastVisits || []);
  const [showPastHistory, setShowPastHistory] = useState(false);

  // Optional vitals toggle
  const [hasVitals, setHasVitals] = useState<boolean>(!!initialData.vitals);
  const [bpSys, setBpSys] = useState<string>(initialData.vitals?.bloodPressure ? initialData.vitals.bloodPressure.split('/')[0] : '');
  const [bpDia, setBpDia] = useState<string>(initialData.vitals?.bloodPressure ? (initialData.vitals.bloodPressure.split('/')[1] || '').replace(' mmHg', '') : '');
  const [pulse, setPulse] = useState<string>(initialData.vitals?.pulse ? String(initialData.vitals.pulse) : '');
  const [spo2, setSpo2] = useState<string>(initialData.vitals?.spo2 ? String(initialData.vitals.spo2) : '');
  const [temp, setTemp] = useState<string>(initialData.vitals?.temperature ? String(initialData.vitals.temperature) : '');
  const [bloodSugar, setBloodSugar] = useState<string>(initialData.vitals?.bloodSugar ? String(initialData.vitals.bloodSugar) : '');

  // Form errors
  const [error, setError] = useState<string | null>(null);

  // Lookup existing patient
  const handleLookup = async (queryToSearch?: string) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;

    setIsSearching(true);
    setSearchFeedback(null);
    setError(null);

    try {
      const res = await lookupPatientFromDB(q);
      const cleanPhone = q.replace(/\D/g, '');
      const history = await fetchPatientHistoryByPhone(cleanPhone || q);

      if (res.found && res.patient) {
        const p = res.patient;
        setName(p.name);
        setAge(String(p.age));
        setGender(p.gender);
        setPhone(p.phone);
        setAbhaId(p.abhaId || '');
        
        if (p.vitals) {
          setHasVitals(true);
          if (p.vitals.bloodPressure) {
            const parts = p.vitals.bloodPressure.replace(' mmHg', '').split('/');
            setBpSys(parts[0] || '');
            setBpDia(parts[1] || '');
          }
          if (p.vitals.pulse) setPulse(String(p.vitals.pulse));
          if (p.vitals.spo2) setSpo2(String(p.vitals.spo2));
          if (p.vitals.temperature) setTemp(String(p.vitals.temperature));
          if (p.vitals.bloodSugar) setBloodSugar(String(p.vitals.bloodSugar));
        }

        const visits = (p.pastVisits && p.pastVisits.length > 0) ? p.pastVisits : history;
        setPastVisits(visits);
        setShowPastHistory(visits.length > 0);
        setSearchFeedback(`✅ रिकॉर्ड मिला (Record found): ${p.name} • ${visits.length} past visit(s) loaded.`);
      } else {
        if (cleanPhone.length >= 10) {
          setPhone(cleanPhone.slice(-10));
        }
        setPastVisits(history || []);
        setShowPastHistory(history.length > 0);
        setSearchFeedback(`ℹ️ नया पंजीकरण (New Patient): Please enter details below.`);
      }
    } catch (e) {
      setSearchFeedback('Unable to connect to database. Please fill in details manually.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(language === 'hi' ? 'कृपया मरीज का पूरा नाम दर्ज करें।' : 'Please enter patient full name.');
      return;
    }

    const parsedAge = parseInt(age);
    if (!age || isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      setError(language === 'hi' ? 'कृपया वैध उम्र (1 से 120 वर्ष) दर्ज करें।' : 'Please enter a valid age between 1 and 120.');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError(
        language === 'hi'
          ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें (टोकन व सूचना हेतु आवश्यक)।'
          : 'Please enter a valid 10-digit mobile number for token & SMS notification.'
      );
      return;
    }

    // Build vitals safely (DO NOT create fake vitals)
    let vitalsData: VitalsData | undefined = undefined;
    if (hasVitals) {
      const bp = bpSys && bpDia ? `${bpSys.trim()}/${bpDia.trim()} mmHg` : undefined;
      const parsedPulse = pulse ? parseInt(pulse) : undefined;
      const parsedSpo2 = spo2 ? parseInt(spo2) : undefined;
      const parsedTemp = temp ? parseFloat(temp) : undefined;
      const parsedSugar = bloodSugar ? parseInt(bloodSugar) : undefined;

      if (bp || parsedPulse || parsedSpo2 || parsedTemp || parsedSugar) {
        vitalsData = {
          bloodPressure: bp,
          pulse: parsedPulse,
          spo2: parsedSpo2,
          temperature: parsedTemp,
          bloodSugar: parsedSugar
        };
      }
    }

    onSaveIdentity({
      name: name.trim(),
      age: parsedAge,
      gender,
      phone: cleanPhone.slice(-10),
      abhaId: abhaId.trim() || undefined,
      vitals: vitalsData,
      pastVisits
    });

    onNext();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/80 text-teal-800 text-xs font-bold uppercase tracking-wider">
          <User className="w-3.5 h-3.5" />
          Step 3 of 9 • चरण 3 (पहचान)
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
          {language === 'hi' ? 'मरीज की पहचान एवं विवरण' : 'Patient Identity & Demographics'}
        </h2>
        <p className="text-sm text-slate-500">
          {language === 'hi'
            ? 'पुराना रिकॉर्ड खोजने हेतु मोबाइल नंबर दर्ज करें अथवा नया फॉर्म भरें।'
            : 'Enter mobile number to search prior hospital records, or register as a new patient.'}
        </p>
      </div>

      {/* Patient Search Lookup */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-teal-600" />
            <span>Search Existing Hospital Record (पुराना रिकॉर्ड खोजें)</span>
          </label>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400">Quick Test:</span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('9876543210');
                handleLookup('9876543210');
              }}
              className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono font-medium"
            >
              9876543210 (Ram)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('9812345678');
                handleLookup('9812345678');
              }}
              className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono font-medium"
            >
              9812345678 (Sunita)
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              placeholder="Enter 10-digit Mobile Number or 14-digit ABHA"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white font-medium"
            />
          </div>
          <button
            type="button"
            onClick={() => handleLookup()}
            disabled={isSearching || !searchQuery.trim()}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center gap-1.5"
          >
            {isSearching ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>खोजें (Search)</span>
          </button>
        </div>

        {searchFeedback && (
          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-800 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{searchFeedback}</span>
          </div>
        )}

        {/* Previous Consultation Visits */}
        {pastVisits.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowPastHistory(!showPastHistory)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-teal-700"
            >
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                Found {pastVisits.length} previous OPD visit(s) on hospital file
              </span>
              {showPastHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showPastHistory && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2">
                {pastVisits.map((v, i) => (
                  <div key={i} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{v.diagnosis}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{v.date}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">{v.doctorName} • {v.department}</div>
                    {v.prescriptions && v.prescriptions.length > 0 && (
                      <div className="text-teal-800 bg-teal-50/80 mt-1 p-1 rounded font-mono text-[10px]">
                        Rx: {v.prescriptions.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleProceed} className="space-y-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            {language === 'hi' ? 'आवश्यक पहचान जानकारी' : 'Required Demographic Information'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name (पूरा नाम) *
              </label>
              <input
                id="input-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Chandra Sharma"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age (उम्र - वर्ष) *
              </label>
              <input
                id="input-age"
                type="number"
                required
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 45"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender (लिंग) *
              </label>
              <select
                id="input-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white"
              >
                <option value="Male">Male (पुरुष)</option>
                <option value="Female">Female (महिला)</option>
                <option value="Other">Other (अन्य)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number (10-digit mobile) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-semibold">+91</span>
                <input
                  id="input-phone"
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full pl-12 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white font-mono"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Required for OPD Queue token SMS & calling coordination.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ABHA ID / Ayushman Bharat Account (Optional)
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="input-abha"
                  type="text"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  placeholder="14-digit ABHA (e.g. 12-3456-7890-1234)"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white font-mono"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Leave blank if you do not have an ABHA ID yet.
              </span>
            </div>
          </div>

          {/* Vitals Section (Explicitly Optional - No Fake Defaults) */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasVitals}
                  onChange={(e) => setHasVitals(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  <span>Vitals measured at Triage Desk / Kiosk (प्रारंभिक शारीरिक माप)?</span>
                </span>
              </label>
              <span className="text-[11px] text-slate-400 italic">Optional • ऐच्छिक</span>
            </div>

            {hasVitals && (
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3 animate-fadeIn">
                <p className="text-[11px] text-slate-500">
                  Enter only measured values. Leave blank if not measured (do not guess).
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      BP Systolic (mmHg)
                    </label>
                    <input
                      type="number"
                      value={bpSys}
                      onChange={(e) => setBpSys(e.target.value)}
                      placeholder="e.g. 120"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      BP Diastolic (mmHg)
                    </label>
                    <input
                      type="number"
                      value={bpDia}
                      onChange={(e) => setBpDia(e.target.value)}
                      placeholder="e.g. 80"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Pulse (bpm)
                    </label>
                    <input
                      type="number"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      placeholder="e.g. 76"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      SpO2 (%)
                    </label>
                    <input
                      type="number"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      placeholder="e.g. 98"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Temp (°F)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      placeholder="e.g. 98.4"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>सहमति पर वापस (Back)</span>
          </button>

          <button
            type="submit"
            className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <span>विभाग चुनें (Continue to Department)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
