import { HospitalRoutePlan, HospitalRouteStep, HospitalServiceOrder, PatientProfile, ClinicalSummary } from '../types';
import { BASE_HOSPITAL_SERVICES } from '../data/mockData';

export function buildHospitalRoutePlan(
  patient: PatientProfile,
  summary?: ClinicalSummary
): HospitalRoutePlan {
  const steps: HospitalRouteStep[] = [];
  let stepCounter = 1;

  // STEP 1: Pre-Doctor Stage - Always begins at Assigned OPD Doctor Cabin
  const doctorCabinNumber = patient.assignedCabin || 'Cabin 102';
  const doctorService: HospitalServiceOrder = {
    ...BASE_HOSPITAL_SERVICES.doctor_consultation,
    roomNumber: doctorCabinNumber,
    name: `OPD Doctor Consultation (${doctorCabinNumber})`,
    instructions: `Please proceed to ${doctorCabinNumber}. Your Token is ${patient.tokenNumber}.`,
    landmark: 'Opposite Main Waiting Hall A, Ground Floor'
  };

  const isDoctorDone = summary?.isDoctorConsultationDone || false;

  steps.push({
    stepNumber: stepCounter++,
    service: doctorService,
    status: isDoctorDone ? 'completed' : 'in_progress',
    walkTimeMin: 2,
    directionsText: `Proceed from Intake Kiosk straight to ${doctorCabinNumber} in Block A. Look for Room Signboard above the door.`,
    directionsHindi: `स्मार्ट कियोस्क से सीधे ब्लॉक ए में ${doctorCabinNumber} की ओर जाएं। दरवाजे के ऊपर लगा साइनबोर्ड देखें।`
  });

  // If doctor ordered tests exist, add them dynamically
  const orderedTests = summary?.doctorOrderedTests || [];

  const hasECG = orderedTests.some(t => t.toLowerCase().includes('ecg'));
  const hasBlood = orderedTests.some(t => t.toLowerCase().includes('cbc') || t.toLowerCase().includes('sugar') || t.toLowerCase().includes('lipid') || t.toLowerCase().includes('blood') || t.toLowerCase().includes('troponin') || t.toLowerCase().includes('lft') || t.toLowerCase().includes('kft'));
  const hasXray = orderedTests.some(t => t.toLowerCase().includes('x-ray') || t.toLowerCase().includes('chest'));
  const hasUSG = orderedTests.some(t => t.toLowerCase().includes('usg') || t.toLowerCase().includes('ultrasound') || t.toLowerCase().includes('scan'));

  // Step: ECG (Quickest, Ground floor next to OPD)
  if (hasECG) {
    steps.push({
      stepNumber: stepCounter++,
      service: BASE_HOSPITAL_SERVICES.ecg,
      status: isDoctorDone ? 'pending' : 'pending',
      walkTimeMin: 1,
      directionsText: 'Exit Cabin 102, turn right down the hallway to Room 08 (Cardiology ECG Room).',
      directionsHindi: 'केबिन 102 से बाहर निकलें, दाईं ओर मुड़कर कमरा नंबर 08 (ईसीजी कक्ष) में जाएं।'
    });
  }

  // Step: Blood / Pathology
  if (hasBlood) {
    steps.push({
      stepNumber: stepCounter++,
      service: BASE_HOSPITAL_SERVICES.lab_blood,
      status: 'pending',
      walkTimeMin: 3,
      directionsText: 'Cross corridor to Block B (Diagnostic Wing), Room 12. Show token at Counter 1 for sample tube collection.',
      directionsHindi: 'गलियारा पार कर ब्लॉक बी (जांच विंग) के कमरा नंबर 12 में जाएं। काउंटर 1 पर टोकन दिखाएं।'
    });
  }

  // Step: X-Ray
  if (hasXray) {
    steps.push({
      stepNumber: stepCounter++,
      service: BASE_HOSPITAL_SERVICES.radiology_xray,
      status: 'pending',
      walkTimeMin: 4,
      directionsText: 'Take Lift 2 to 1st Floor. Exit left into Radiology Wing, Room 104.',
      directionsHindi: 'लिफ्ट 2 से पहली मंजिल (1st Floor) पर जाएं। बाईं तरफ मुड़कर कमरा 104 (एक्स-रे) पहुंचें।'
    });
  }

  // Step: USG
  if (hasUSG) {
    steps.push({
      stepNumber: stepCounter++,
      service: BASE_HOSPITAL_SERVICES.usg,
      status: 'pending',
      walkTimeMin: 4,
      directionsText: '1st Floor Radiology Wing, Room 106. Ensure adequate bladder fullness before entering.',
      directionsHindi: 'पहली मंजिल रेडियोलॉजी विंग, कमरा 106। अंदर जाने से पहले पानी पीने का निर्देश याद रखें।'
    });
  }

  // If any tests were ordered, add Report Collection & Doctor Review Step
  if (orderedTests.length > 0) {
    steps.push({
      stepNumber: stepCounter++,
      service: BASE_HOSPITAL_SERVICES.report_collection,
      status: 'pending',
      walkTimeMin: 2,
      directionsText: 'Collect physical printed reports from Counter 4 (or view digitally on your phone via SMS link).',
      directionsHindi: 'काउंटर 4 से डिजिटल प्रिंटेड रिपोर्ट प्राप्त करें अथवा मोबाइल एसएमएस लिंक पर देखें।'
    });

    steps.push({
      stepNumber: stepCounter++,
      service: BASE_HOSPITAL_SERVICES.opd_review,
      status: 'pending',
      walkTimeMin: 2,
      directionsText: `Return to ${doctorCabinNumber} with investigation reports for doctor prescription finalization.`,
      directionsHindi: `अपनी सभी जांच रिपोर्ट के साथ पुनः ${doctorCabinNumber} में डॉक्टर को दिखाएं।`
    });
  }

  // Final Step: Pharmacy for Medicines
  steps.push({
    stepNumber: stepCounter++,
    service: BASE_HOSPITAL_SERVICES.pharmacy,
    status: 'pending',
    walkTimeMin: 3,
    directionsText: 'Proceed to Ground Floor Block A near Main Exit Gate to Jan Aushadhi Dispensary Counter 4 & 5.',
    directionsHindi: 'मुख्य निकास द्वार के पास जन औषधि केंद्र काउंटर 4 एवं 5 से निशुल्क/रियायती दवाएं लें।'
  });

  const totalWait = steps.reduce((sum, s) => sum + s.service.estimatedWaitMin, 0);
  const totalWalk = steps.reduce((sum, s) => sum + s.walkTimeMin, 0);

  return {
    patientId: patient.id,
    steps,
    totalEstimatedWaitMin: totalWait,
    totalEstimatedWalkMin: totalWalk,
    optimized: true
  };
}
