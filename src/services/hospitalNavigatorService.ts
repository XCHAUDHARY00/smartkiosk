import { HospitalRoutePlan, HospitalRouteStep, HospitalServiceOrder, PatientProfile, ClinicalSummary, DepartmentCrowdSnapshot, HourlySurgeDataPoint, AdminInterventionAction } from '../types';
import { BASE_HOSPITAL_SERVICES } from '../data/mockData';

/**
 * Builds dynamic hospital route steps based on patient encounter and doctor orders.
 *
 * Example:
 * Doctor orders: CBC, ECG, X-Ray
 * Post-consultation patient navigation becomes:
 * 1. ECG
 * 2. Pathology
 * 3. X-Ray
 * 4. Report collection
 * 5. Doctor review
 * 6. Pharmacy
 */
export function buildHospitalRoutePlan(
  patient: PatientProfile,
  summary?: ClinicalSummary
): HospitalRoutePlan {
  const steps: HospitalRouteStep[] = [];
  let stepCounter = 1;

  const doctorCabinNumber = patient.assignedCabin || 'Cabin 102';
  const isDoctorDone = summary?.isDoctorConsultationDone || 
    ['Investigations', 'Report Ready', 'Doctor Review', 'Review', 'Pharmacy', 'Completed'].includes(patient.status);

  const orderedTests = summary?.doctorOrderedTests || patient.encounter?.orderedTests || [];
  const completedTests = patient.encounter?.completedTests || [];
  const reportCollected = !!patient.encounter?.reportCollected;
  const doctorReviewDone = !!patient.encounter?.doctorReviewDone;
  const pharmacyDispensed = !!patient.encounter?.pharmacyDispensed || patient.status === 'Completed';

  // If Doctor Consultation is NOT yet done, Step 1 is the OPD Doctor Consultation
  if (!isDoctorDone) {
    const doctorService: HospitalServiceOrder = {
      ...BASE_HOSPITAL_SERVICES.doctor_consultation,
      roomNumber: doctorCabinNumber,
      name: `OPD Doctor Consultation (${doctorCabinNumber})`,
      instructions: `Please proceed to ${doctorCabinNumber}. Your Token is ${patient.tokenNumber}.`,
      landmark: 'Opposite Main Waiting Hall A, Ground Floor'
    };

    steps.push({
      stepNumber: stepCounter++,
      service: doctorService,
      status: patient.status === 'With Doctor' ? 'in_progress' : 'pending',
      walkTimeMin: 2,
      directionsText: `Proceed from Intake Kiosk straight to ${doctorCabinNumber} in Block A. Look for Room Signboard above the door.`,
      directionsHindi: `स्मार्ट कियोस्क से सीधे ब्लॉक ए में ${doctorCabinNumber} की ओर जाएं। दरवाजे के ऊपर लगा साइनबोर्ड देखें।`
    });
  }

  // Detect ordered test categories
  const hasECG = orderedTests.some(t => t.toLowerCase().includes('ecg'));
  const hasBlood = orderedTests.some(t => 
    t.toLowerCase().includes('cbc') || 
    t.toLowerCase().includes('sugar') || 
    t.toLowerCase().includes('lipid') || 
    t.toLowerCase().includes('blood') || 
    t.toLowerCase().includes('path') ||
    t.toLowerCase().includes('troponin') || 
    t.toLowerCase().includes('lft') || 
    t.toLowerCase().includes('kft') ||
    t.toLowerCase().includes('hba1c') ||
    t.toLowerCase().includes('serum')
  );
  const hasXray = orderedTests.some(t => 
    t.toLowerCase().includes('x-ray') || 
    t.toLowerCase().includes('xray') || 
    t.toLowerCase().includes('chest')
  );
  const hasUSG = orderedTests.some(t => 
    t.toLowerCase().includes('usg') || 
    t.toLowerCase().includes('ultrasound') || 
    t.toLowerCase().includes('scan')
  );

  // Other custom tests not categorized into the above
  const otherTests = orderedTests.filter(t => {
    const lower = t.toLowerCase();
    return !lower.includes('ecg') && 
      !lower.includes('cbc') && 
      !lower.includes('sugar') && 
      !lower.includes('lipid') && 
      !lower.includes('blood') && 
      !lower.includes('path') && 
      !lower.includes('troponin') && 
      !lower.includes('lft') && 
      !lower.includes('kft') && 
      !lower.includes('hba1c') && 
      !lower.includes('serum') && 
      !lower.includes('x-ray') && 
      !lower.includes('xray') && 
      !lower.includes('chest') && 
      !lower.includes('usg') && 
      !lower.includes('ultrasound') && 
      !lower.includes('scan');
  });

  // 1. ECG (Immediate Bedside / Ground floor next to OPD)
  if (hasECG) {
    const isDone = completedTests.some(t => t.toLowerCase().includes('ecg'));
    steps.push({
      stepNumber: stepCounter++,
      service: {
        ...BASE_HOSPITAL_SERVICES.ecg,
        name: '12-Lead ECG (ईसीजी जांच)'
      },
      status: isDone ? 'completed' : 'pending',
      walkTimeMin: 1,
      directionsText: 'Exit Cabin 102, turn right down the hallway to Room 08 (Cardiology ECG Room).',
      directionsHindi: 'केबिन 102 से बाहर निकलें, दाईं ओर मुड़कर कमरा नंबर 08 (ईसीजी कक्ष) में जाएं।'
    });
  }

  // 2. Pathology (Blood / Sample collection)
  if (hasBlood) {
    const isDone = completedTests.some(t => 
      t.toLowerCase().includes('cbc') || 
      t.toLowerCase().includes('sugar') || 
      t.toLowerCase().includes('lipid') || 
      t.toLowerCase().includes('blood') || 
      t.toLowerCase().includes('path')
    );
    steps.push({
      stepNumber: stepCounter++,
      service: {
        ...BASE_HOSPITAL_SERVICES.lab_blood,
        name: 'Pathology & Blood Collection (पैथोलॉजी - रक्त जांच)'
      },
      status: isDone ? 'completed' : 'pending',
      walkTimeMin: 3,
      directionsText: 'Cross corridor to Block B (Diagnostic Wing), Room 12. Show token at Counter 1 for sample tube collection.',
      directionsHindi: 'गलियारा पार कर ब्लॉक बी (जांच विंग) के कमरा नंबर 12 में जाएं। काउंटर 1 पर टोकन दिखाएं।'
    });
  }

  // 3. Radiology: X-Ray
  if (hasXray) {
    const isDone = completedTests.some(t => t.toLowerCase().includes('x-ray') || t.toLowerCase().includes('xray') || t.toLowerCase().includes('chest'));
    steps.push({
      stepNumber: stepCounter++,
      service: {
        ...BASE_HOSPITAL_SERVICES.radiology_xray,
        name: 'Digital Chest X-Ray (डिजिटल एक्सरे)'
      },
      status: isDone ? 'completed' : 'pending',
      walkTimeMin: 4,
      directionsText: 'Take Lift 2 to 1st Floor. Exit left into Radiology Wing, Room 104.',
      directionsHindi: 'लिफ्ट 2 से पहली मंजिल (1st Floor) पर जाएं। बाईं तरफ मुड़कर कमरा 104 (एक्स-रे) पहुंचें।'
    });
  }

  // USG (if ordered)
  if (hasUSG) {
    const isDone = completedTests.some(t => t.toLowerCase().includes('usg') || t.toLowerCase().includes('ultrasound') || t.toLowerCase().includes('scan'));
    steps.push({
      stepNumber: stepCounter++,
      service: BASE_HOSPITAL_SERVICES.usg,
      status: isDone ? 'completed' : 'pending',
      walkTimeMin: 4,
      directionsText: '1st Floor Radiology Wing, Room 106. Ensure adequate bladder fullness before entering.',
      directionsHindi: 'पहली मंजिल रेडियोलॉजी विंग, कमरा 106। अंदर जाने से पहले पानी पीने का निर्देश याद रखें।'
    });
  }

  // Other Custom Tests
  otherTests.forEach(testName => {
    const isDone = completedTests.some(t => t.toLowerCase() === testName.toLowerCase());
    steps.push({
      stepNumber: stepCounter++,
      service: {
        id: `srv-custom-${stepCounter}`,
        name: `${testName} (विशेष जांच)`,
        category: 'lab',
        department: 'Diagnostic Services',
        roomNumber: 'Room 15',
        floor: 'Ground Floor',
        block: 'Block B',
        currentQueueCount: 3,
        estimatedWaitMin: 10,
        estimatedProcedureMin: 8,
        instructions: `Report to Room 15 with Token ${patient.tokenNumber} for ${testName}.`,
        landmark: 'Diagnostic Wing Room 15'
      },
      status: isDone ? 'completed' : 'pending',
      walkTimeMin: 3,
      directionsText: `Proceed to Diagnostic Wing Room 15 for ${testName}.`,
      directionsHindi: `जांच विंग कमरा 15 में जाकर ${testName} करवाएं।`
    });
  });

  // 4. Report Collection & 5. Doctor Review (Only if tests were ordered)
  if (orderedTests.length > 0) {
    steps.push({
      stepNumber: stepCounter++,
      service: {
        ...BASE_HOSPITAL_SERVICES.report_collection,
        name: 'Report Collection (जांच रिपोर्ट काउंटर)'
      },
      status: reportCollected ? 'completed' : 'pending',
      walkTimeMin: 2,
      directionsText: 'Collect physical printed reports from Counter 4 (or view digitally on your phone via SMS link).',
      directionsHindi: 'काउंटर 4 से डिजिटल प्रिंटेड रिपोर्ट प्राप्त करें अथवा मोबाइल एसएमएस लिंक पर देखें।'
    });

    steps.push({
      stepNumber: stepCounter++,
      service: {
        ...BASE_HOSPITAL_SERVICES.opd_review,
        name: `Doctor Review (${doctorCabinNumber})`,
        roomNumber: doctorCabinNumber
      },
      status: doctorReviewDone ? 'completed' : 'pending',
      walkTimeMin: 2,
      directionsText: `Return to ${doctorCabinNumber} with investigation reports for doctor prescription finalization.`,
      directionsHindi: `अपनी सभी जांच रिपोर्ट के साथ पुनः ${doctorCabinNumber} में डॉक्टर को दिखाएं।`
    });
  }

  // 6. Pharmacy (for Jan Aushadhi Dispensary)
  steps.push({
    stepNumber: stepCounter++,
    service: {
      ...BASE_HOSPITAL_SERVICES.pharmacy,
      name: 'Pharmacy (जन औषधि केंद्र)'
    },
    status: pharmacyDispensed ? 'completed' : 'pending',
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

export function getInitialDepartmentCrowdSnapshots(): DepartmentCrowdSnapshot[] {
  return [
    {
      id: 'dep_med_opd',
      departmentName: 'Medicine OPD (ओपीडी चिकित्सा)',
      hindiName: 'सामान्य चिकित्सा ओपीडी',
      category: 'Clinical OPD',
      building: 'Block A, Ground Floor',
      currentWaitingPatients: 42,
      currentWaitMin: 28,
      activeCounters: 4,
      totalCounters: 6,
      predictedIncomingCount: 55,
      predictedPeakLoad: 'CRITICAL',
      predictedSurgeTime: '10:30 AM – 12:00 PM',
      bottleneckFactor: 'Morning kiosk registrations converging simultaneously at doctor consultation cabins.',
      recommendedIntervention: 'Open Cabin 105 & 106; deploy junior resident triage diversion.'
    },
    {
      id: 'dep_pathology',
      departmentName: 'Pathology & Phlebotomy Lab (रक्त जांच)',
      hindiName: 'पैथोलॉजी व रक्त नमूना केंद्र',
      category: 'Diagnostic Lab',
      building: 'Block B, 1st Floor',
      currentWaitingPatients: 29,
      currentWaitMin: 22,
      activeCounters: 3,
      totalCounters: 4,
      predictedIncomingCount: 38,
      predictedPeakLoad: 'HIGH',
      predictedSurgeTime: '11:15 AM – 01:00 PM',
      bottleneckFactor: 'Post-OPD consultation lab orders (CBC, Blood Sugar, LFT) peaking after 11:00 AM.',
      recommendedIntervention: 'Open Counter 4 for Fast-Track Senior Citizens & Diabetics.'
    },
    {
      id: 'dep_radiology',
      departmentName: 'Radiology & X-Ray (एक्स-रे व सीटी)',
      hindiName: 'रेडियोलॉजी व एक्स-रे',
      category: 'Radiology Diagnostic',
      building: 'Block B, Ground Floor',
      currentWaitingPatients: 14,
      currentWaitMin: 15,
      activeCounters: 2,
      totalCounters: 3,
      predictedIncomingCount: 18,
      predictedPeakLoad: 'MODERATE',
      predictedSurgeTime: '11:30 AM – 01:30 PM',
      bottleneckFactor: 'Orthopedic & Chest trauma referrals requiring digital chest & limb radiographs.',
      recommendedIntervention: 'Prepare X-Ray Room 2 digital imaging cassette ready.'
    },
    {
      id: 'dep_pharmacy',
      departmentName: 'Central Dispensary & Jan Aushadhi (दवा काउंटर)',
      hindiName: 'जन औषधि केंद्र व दवा वितरण',
      category: 'Pharmacy Dispensary',
      building: 'Block A, Near Exit Gate',
      currentWaitingPatients: 36,
      currentWaitMin: 20,
      activeCounters: 3,
      totalCounters: 5,
      predictedIncomingCount: 65,
      predictedPeakLoad: 'HIGH',
      predictedSurgeTime: '12:00 PM – 02:30 PM',
      bottleneckFactor: 'Final prescription fulfillment surge as patients finish OPD and lab reviews.',
      recommendedIntervention: 'Activate Counter 5 for pre-packaged chronic hypertension & diabetes refills.'
    },
    {
      id: 'dep_triage',
      departmentName: 'Emergency & Red-Flag Triage (आपातकालीन डेस्क)',
      hindiName: 'आपातकालीन डेस्क',
      category: 'Emergency Care',
      building: 'Main Entrance Casualty',
      currentWaitingPatients: 4,
      currentWaitMin: 3,
      activeCounters: 2,
      totalCounters: 2,
      predictedIncomingCount: 8,
      predictedPeakLoad: 'LOW',
      predictedSurgeTime: 'Ongoing Round-the-Clock',
      bottleneckFactor: 'Automated kiosk red-flag alerts routed immediately to emergency medical officers.',
      recommendedIntervention: 'Maintain dedicated wheel-chair triage corridor open.'
    }
  ];
}

export function getHourlySurgeTimeline(): HourlySurgeDataPoint[] {
  return [
    { hourLabel: '08:00 AM', isSurgeHour: false, medicineOpd: 15, pathologyLab: 8, radiology: 4, pharmacy: 5 },
    { hourLabel: '09:00 AM', isSurgeHour: true, medicineOpd: 55, pathologyLab: 22, radiology: 10, pharmacy: 12 },
    { hourLabel: '10:00 AM', isSurgeHour: true, medicineOpd: 82, pathologyLab: 48, radiology: 20, pharmacy: 28 },
    { hourLabel: '11:00 AM', isSurgeHour: true, medicineOpd: 78, pathologyLab: 68, radiology: 26, pharmacy: 52 },
    { hourLabel: '12:00 PM', isSurgeHour: true, medicineOpd: 60, pathologyLab: 55, radiology: 22, pharmacy: 76 },
    { hourLabel: '01:00 PM', isSurgeHour: false, medicineOpd: 38, pathologyLab: 32, radiology: 15, pharmacy: 58 },
    { hourLabel: '02:00 PM', isSurgeHour: false, medicineOpd: 22, pathologyLab: 18, radiology: 10, pharmacy: 36 },
    { hourLabel: '03:00 PM', isSurgeHour: false, medicineOpd: 12, pathologyLab: 10, radiology: 6, pharmacy: 18 }
  ];
}

export function getDefaultAdminInterventions(): AdminInterventionAction[] {
  return [
    {
      id: 'act_1',
      department: 'Medicine OPD',
      title: 'Deploy Standby Cabin 105 (Medical Officer)',
      impactDescription: 'Directs non-emergency follow-ups to parallel cabin to dissipate corridor crowd.',
      reductionMinutes: 12,
      applied: false
    },
    {
      id: 'act_2',
      department: 'Pathology Lab',
      title: 'Open Dedicated Fast-Track Phlebotomy Bay',
      impactDescription: 'Separates fasting blood sugar & routine CBC samples from complex diagnostic panels.',
      reductionMinutes: 9,
      applied: false
    },
    {
      id: 'act_3',
      department: 'Pharmacy Dispensary',
      title: 'Pre-package Common OPD Kits (HTN & Diab)',
      impactDescription: 'Enables rapid 30-second checkout for standard Telmisartan / Metformin regimens.',
      reductionMinutes: 11,
      applied: false
    },
    {
      id: 'act_4',
      department: 'Intake Kiosks',
      title: 'Voice-Assist Guided Fast Queue Routing',
      impactDescription: 'Kiosks dynamically steer stable patients to lower-load sub-clinics.',
      reductionMinutes: 6,
      applied: false
    }
  ];
}

