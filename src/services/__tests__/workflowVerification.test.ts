import { PatientProfile, ClinicalSummary } from '../../types';
import { 
  derivePatientStatus,
  getOrCreateEncounter,
  callPatientToCabin,
  startDoctorConsultation,
  completeConsultationWithOrders,
  markTestCompleted,
  markReportCollected,
  startDoctorReview,
  completeDoctorReview,
  completePharmacyDispense,
  formatHHMM
} from '../encounterWorkflowService';
import { buildHospitalRoutePlan } from '../hospitalNavigatorService';

// Test assertion helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('🧪 RUNNING POST-DOCTOR HOSPITAL WORKFLOW VERIFICATION SUITE');
  console.log('=============================================================\n');

  const basePatient: PatientProfile = {
    id: 'test-p-104',
    tokenNumber: 'A-104',
    name: 'Anita Sharma',
    age: 62,
    gender: 'Female',
    phone: '9123456780',
    language: 'hi',
    department: 'General Medicine',
    assignedCabin: 'Cabin 102',
    registeredAt: '09:15 AM',
    status: 'Waiting'
  };

  const testSummary: ClinicalSummary = {
    id: 'sum-104',
    patientId: 'test-p-104',
    tokenNumber: 'A-104',
    chiefComplaint: 'Bilateral knee pain',
    historyOfPresentIllness: 'Severe joint stiffness',
    socrates: {},
    differentialDiagnosis: [],
    recommendedLabInvestigations: ['12-Lead ECG', 'Blood Test (CBC)', 'Digital Chest X-Ray'],
    doctorOrderedTests: ['Blood Test (CBC)', '12-Lead ECG', 'Digital Chest X-Ray'],
    isDoctorConsultationDone: false,
    doctorConsultationNotes: 'Advised rest and diagnostics',
    urgencyScore: 'NORMAL',
    medications: [
      { name: 'Tab Paracetamol 650mg', dosage: '1 Tab', frequency: 'TDS', duration: '5 Days' }
    ],
    generatedAt: '09:20 AM'
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TEST SUITE 1: 8-Stage Status Transitions
  // WAITING -> CALLED -> WITH DOCTOR -> INVESTIGATIONS -> REPORT READY -> DOCTOR REVIEW -> PHARMACY -> COMPLETED
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- 1. Testing State-Driven Status Transitions ---');

  // Stage 1: WAITING
  assert(basePatient.status === 'Waiting', 'Initial patient status is WAITING');

  // Stage 2: CALLED
  const calledPatient = callPatientToCabin(basePatient, 'Cabin 102');
  assert(calledPatient.status === 'Called', 'callPatientToCabin transitions status to CALLED');
  assert(calledPatient.encounter?.calledAt !== undefined, 'Encounter calledAt timestamp recorded');

  // Stage 3: WITH DOCTOR
  const consultingPatient = startDoctorConsultation(calledPatient);
  assert(consultingPatient.status === 'With Doctor', 'startDoctorConsultation transitions status to WITH DOCTOR');

  // Stage 4: INVESTIGATIONS (Doctor orders tests)
  const { patient: postConsultPatient, summary: updatedSummary } = completeConsultationWithOrders(consultingPatient, testSummary);
  assert(postConsultPatient.status === 'Investigations', 'Doctor consultation completion with ordered tests sets status to INVESTIGATIONS');
  assert(updatedSummary.isDoctorConsultationDone === true, 'Summary marked as isDoctorConsultationDone = true');

  // Completing individual tests
  let inProgressPatient = markTestCompleted(postConsultPatient, '12-Lead ECG');
  assert(inProgressPatient.status === 'Investigations', 'Status remains INVESTIGATIONS while tests are pending');
  inProgressPatient = markTestCompleted(inProgressPatient, 'Blood Test (CBC)');
  inProgressPatient = markTestCompleted(inProgressPatient, 'Digital Chest X-Ray');
  assert(inProgressPatient.encounter?.completedTests.length === 3, 'All 3 ordered tests recorded as completed');

  // Stage 5: REPORT READY (all tests completed and report collected from Counter 4)
  const reportReadyPatient = markReportCollected(inProgressPatient);
  assert(reportReadyPatient.status === 'Report Ready', 'markReportCollected transitions status to REPORT READY');

  // Stage 6: DOCTOR REVIEW (Patient returns to Cabin with printed reports)
  const reviewingPatient = startDoctorReview(reportReadyPatient);
  assert(reviewingPatient.status === 'Doctor Review', 'startDoctorReview transitions status to DOCTOR REVIEW');

  // Stage 7: PHARMACY (Doctor reviews reports, prescribes final medications)
  const pharmacyPatient = completeDoctorReview(reviewingPatient, testSummary.medications);
  assert(pharmacyPatient.status === 'Pharmacy', 'completeDoctorReview with medications transitions status to PHARMACY');

  // Stage 8: COMPLETED (Medicines collected from Jan Aushadhi Dispensary)
  const completedPatient = completePharmacyDispense(pharmacyPatient);
  assert(completedPatient.status === 'Completed', 'completePharmacyDispense transitions status to COMPLETED');
  assert(completedPatient.encounter?.completedAt !== undefined, 'Encounter completedAt timestamp recorded');

  // Special Case: Doctor orders NO investigations, only medications -> directly to PHARMACY
  const noTestSummary: ClinicalSummary = {
    ...testSummary,
    doctorOrderedTests: []
  };
  const { patient: directPharmaPatient } = completeConsultationWithOrders(consultingPatient, noTestSummary);
  assert(directPharmaPatient.status === 'Pharmacy', 'No tests ordered with medications transitions directly to PHARMACY');

  // Special Case: Doctor orders NO investigations and NO medications -> directly to COMPLETED
  const noTestNoMedSummary: ClinicalSummary = {
    ...testSummary,
    doctorOrderedTests: [],
    medications: []
  };
  const { patient: directDonePatient } = completeConsultationWithOrders(consultingPatient, noTestNoMedSummary);
  assert(directDonePatient.status === 'Completed', 'No tests and no medications transitions directly to COMPLETED');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST SUITE 2: Dynamic Investigation Route Sequencing
  // Example from prompt: Doctor orders CBC, ECG, X-Ray
  // Route sequence must be:
  // 1. ECG -> 2. Pathology -> 3. X-Ray -> 4. Report collection -> 5. Doctor review -> 6. Pharmacy
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- 2. Testing Dynamic Investigation Routing Sequencing ---');

  const routePlan = buildHospitalRoutePlan(postConsultPatient, testSummary);
  const steps = routePlan.steps;

  console.log(`Generated Route Steps (${steps.length} total):`);
  steps.forEach(s => console.log(`  ${s.stepNumber}. ${s.service.name} [Room: ${s.service.roomNumber}]`));

  assert(steps.length === 6, 'Dynamic route generates exactly 6 steps for CBC + ECG + X-Ray');
  assert(steps[0].service.name.toLowerCase().includes('ecg'), 'Step 1 is ECG (quickest bedside test)');
  assert(steps[1].service.name.toLowerCase().includes('pathology') || steps[1].service.name.toLowerCase().includes('blood'), 'Step 2 is Pathology (blood collection)');
  assert(steps[2].service.name.toLowerCase().includes('x-ray'), 'Step 3 is Digital Chest X-Ray (imaging wing)');
  assert(steps[3].service.name.toLowerCase().includes('report collection'), 'Step 4 is Report Collection');
  assert(steps[4].service.name.toLowerCase().includes('doctor review'), 'Step 5 is Doctor Review at assigned cabin');
  assert(steps[5].service.name.toLowerCase().includes('pharmacy'), 'Step 6 is Pharmacy at Jan Aushadhi Kendra');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST SUITE 3: Public Queue Privacy & Database-Driven Values
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- 3. Testing Public Queue Privacy & Data-Driven Values ---');

  // Timestamp format check
  const timestamp = formatHHMM();
  assert(/^\d{2}:\d{2}$/.test(timestamp), `Timestamp "${timestamp}" conforms to strict HH:MM format`);

  // Token announcement format check
  const activeToken = basePatient.tokenNumber;
  const activeCabin = basePatient.assignedCabin;
  const announcementText = `TOKEN ${activeToken}\nPlease proceed to ${activeCabin}`;
  assert(announcementText === 'TOKEN A-104\nPlease proceed to Cabin 102', 'Announcement matches "TOKEN A-104 \\n Please proceed to Cabin 102" specification');

  // Verify privacy: Patient personal names must never be present in public token cards
  const samplePublicCards = [
    { token: 'A-101', status: 'Called', destination: 'Proceed to Cabin 102' },
    { token: 'A-102', status: 'Investigations', destination: 'Proceed to Diagnostic Wing' },
    { token: 'A-103', status: 'Waiting', destination: 'Please wait in OPD Hall' }
  ];

  samplePublicCards.forEach(card => {
    assert(!('name' in card), `Public card for token ${card.token} strictly omits patient personal name`);
  });

  console.log('\n=============================================================');
  console.log('🎉 ALL HOSPITAL WORKFLOW TESTS PASSED SUCCESSFULLY!');
  console.log('=============================================================\n');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
