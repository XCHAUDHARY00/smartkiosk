import { PatientProfile, ClinicalSummary, PatientEncounter, PatientQueueStatus, MedicationItem } from '../types';

/**
 * Format HH:MM format for reliable timestamping without seconds or locale ambiguity
 */
export function formatHHMM(date: Date = new Date()): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Derive the patient queue status strictly from the encounter and order data
 * State-driven progression:
 * WAITING -> CALLED -> WITH DOCTOR -> INVESTIGATIONS -> REPORT READY -> DOCTOR REVIEW -> PHARMACY -> COMPLETED
 */
export function derivePatientStatus(encounter: PatientEncounter): PatientQueueStatus {
  // 1. If encounter is completed or pharmacy was dispensed
  if (encounter.completedAt || encounter.pharmacyDispensed) {
    return 'Completed';
  }

  // 2. If Doctor Review is done (or consultation was finished with NO tests ordered)
  const isPostDoctor = !!encounter.consultationCompletedAt;
  const hasTests = encounter.orderedTests && encounter.orderedTests.length > 0;

  if (encounter.doctorReviewDone || (isPostDoctor && !hasTests)) {
    // If medications are prescribed, proceed to Pharmacy, else Completed
    if (encounter.medicationsPrescribed && encounter.medicationsPrescribed.length > 0) {
      return 'Pharmacy';
    }
    return 'Completed';
  }

  // 3. If doctor ordered tests
  if (isPostDoctor && hasTests) {
    const allTestsDone = encounter.orderedTests.every(t =>
      encounter.completedTests.some(done => done.toLowerCase() === t.toLowerCase() || t.toLowerCase().includes(done.toLowerCase()))
    );

    if (allTestsDone && encounter.reportCollected) {
      // If doctor is reviewing reports
      if (encounter.status === 'Doctor Review') {
        return 'Doctor Review';
      }
      return 'Report Ready';
    }

    // Still undergoing investigations or awaiting report collection
    return 'Investigations';
  }

  // 4. In consultation with doctor
  if (encounter.consultationStartedAt && !encounter.consultationCompletedAt) {
    return 'With Doctor';
  }

  // 5. Called to cabin
  if (encounter.calledAt) {
    return 'Called';
  }

  // 6. Default: Waiting in queue
  return 'Waiting';
}

/**
 * Get or initialize the encounter object for a patient profile
 */
function normalizeMedications(meds?: Array<MedicationItem | string>): MedicationItem[] {
  if (!meds) return [];
  return meds.map(m => typeof m === 'string' ? {
    name: m,
    dosage: '',
    frequency: '',
    duration: ''
  } : m);
}

export function getOrCreateEncounter(patient: PatientProfile, summary?: ClinicalSummary): PatientEncounter {
  if (patient.encounter) {
    return patient.encounter;
  }

  const initialStatus: PatientQueueStatus = patient.status || 'Waiting';
  const orderedTests = summary?.doctorOrderedTests || [];
  const medications = normalizeMedications(summary?.medications);

  const encounter: PatientEncounter = {
    id: `enc-${patient.id}`,
    patientId: patient.id,
    tokenNumber: patient.tokenNumber,
    status: initialStatus,
    assignedCabin: patient.assignedCabin || 'Cabin 102',
    calledAt: initialStatus === 'Called' ? formatHHMM() : undefined,
    consultationStartedAt: initialStatus === 'With Doctor' ? formatHHMM() : undefined,
    consultationCompletedAt: summary?.isDoctorConsultationDone ? formatHHMM() : undefined,
    orderedTests: [...orderedTests],
    completedTests: [],
    reportCollected: false,
    doctorReviewDone: false,
    medicationsPrescribed: medications,
    pharmacyDispensed: initialStatus === 'Completed',
    completedAt: initialStatus === 'Completed' ? formatHHMM() : undefined,
    lastUpdated: formatHHMM()
  };

  return encounter;
}

/**
 * Transition: WAITING -> CALLED
 */
export function callPatientToCabin(patient: PatientProfile, cabin?: string): PatientProfile {
  const enc = getOrCreateEncounter(patient);
  const now = formatHHMM();
  const updatedEnc: PatientEncounter = {
    ...enc,
    assignedCabin: cabin || enc.assignedCabin,
    calledAt: now,
    status: 'Called',
    lastUpdated: now
  };

  return {
    ...patient,
    assignedCabin: updatedEnc.assignedCabin,
    status: 'Called',
    encounter: updatedEnc
  };
}

/**
 * Transition: CALLED -> WITH DOCTOR
 */
export function startDoctorConsultation(patient: PatientProfile): PatientProfile {
  const enc = getOrCreateEncounter(patient);
  const now = formatHHMM();
  const updatedEnc: PatientEncounter = {
    ...enc,
    consultationStartedAt: now,
    status: 'With Doctor',
    lastUpdated: now
  };

  return {
    ...patient,
    status: 'With Doctor',
    encounter: updatedEnc
  };
}

/**
 * Transition: WITH DOCTOR -> INVESTIGATIONS (if tests ordered) OR PHARMACY / COMPLETED
 */
export function completeConsultationWithOrders(
  patient: PatientProfile,
  summary: ClinicalSummary
): { patient: PatientProfile; summary: ClinicalSummary } {
  const enc = getOrCreateEncounter(patient, summary);
  const now = formatHHMM();
  const orderedTests = summary.doctorOrderedTests || [];
  const medications = normalizeMedications(summary.medications);

  const updatedEnc: PatientEncounter = {
    ...enc,
    consultationCompletedAt: now,
    orderedTests: [...orderedTests],
    medicationsPrescribed: medications,
    lastUpdated: now
  };

  // Derive status strictly from encounter/order data
  const derived = derivePatientStatus(updatedEnc);
  updatedEnc.status = derived;

  const updatedPatient: PatientProfile = {
    ...patient,
    status: derived,
    encounter: updatedEnc
  };

  const updatedSummary: ClinicalSummary = {
    ...summary,
    isDoctorConsultationDone: true
  };

  return { patient: updatedPatient, summary: updatedSummary };
}

/**
 * Transition: Complete an ordered test during INVESTIGATIONS
 */
export function markTestCompleted(patient: PatientProfile, testIdentifier: string): PatientProfile {
  const enc = getOrCreateEncounter(patient);
  const now = formatHHMM();
  const currentCompleted = enc.completedTests || [];

  const isAlreadyDone = currentCompleted.some(t => t.toLowerCase() === testIdentifier.toLowerCase());
  const updatedCompleted = isAlreadyDone ? currentCompleted : [...currentCompleted, testIdentifier];

  const updatedEnc: PatientEncounter = {
    ...enc,
    completedTests: updatedCompleted,
    lastUpdated: now
  };

  updatedEnc.status = derivePatientStatus(updatedEnc);

  return {
    ...patient,
    status: updatedEnc.status,
    encounter: updatedEnc
  };
}

/**
 * Transition: INVESTIGATIONS -> REPORT READY
 */
export function markReportCollected(patient: PatientProfile): PatientProfile {
  const enc = getOrCreateEncounter(patient);
  const now = formatHHMM();
  const updatedEnc: PatientEncounter = {
    ...enc,
    reportCollected: true,
    lastUpdated: now
  };

  // If all tests completed and report collected, status becomes Report Ready
  updatedEnc.status = derivePatientStatus(updatedEnc);

  return {
    ...patient,
    status: updatedEnc.status,
    encounter: updatedEnc
  };
}

/**
 * Transition: REPORT READY -> DOCTOR REVIEW
 */
export function startDoctorReview(patient: PatientProfile): PatientProfile {
  const enc = getOrCreateEncounter(patient);
  const now = formatHHMM();
  const updatedEnc: PatientEncounter = {
    ...enc,
    status: 'Doctor Review',
    lastUpdated: now
  };

  return {
    ...patient,
    status: 'Doctor Review',
    encounter: updatedEnc
  };
}

/**
 * Transition: DOCTOR REVIEW -> PHARMACY (or COMPLETED)
 */
export function completeDoctorReview(patient: PatientProfile, updatedMeds?: Array<MedicationItem | string>): PatientProfile {
  const enc = getOrCreateEncounter(patient);
  const now = formatHHMM();
  const medications = updatedMeds ? normalizeMedications(updatedMeds) : enc.medicationsPrescribed;

  const updatedEnc: PatientEncounter = {
    ...enc,
    doctorReviewDone: true,
    medicationsPrescribed: medications,
    lastUpdated: now
  };

  updatedEnc.status = derivePatientStatus(updatedEnc);

  return {
    ...patient,
    status: updatedEnc.status,
    encounter: updatedEnc
  };
}

/**
 * Transition: PHARMACY -> COMPLETED
 */
export function completePharmacyDispense(patient: PatientProfile): PatientProfile {
  const enc = getOrCreateEncounter(patient);
  const now = formatHHMM();
  const updatedEnc: PatientEncounter = {
    ...enc,
    pharmacyDispensed: true,
    completedAt: now,
    status: 'Completed',
    lastUpdated: now
  };

  return {
    ...patient,
    status: 'Completed',
    encounter: updatedEnc
  };
}
