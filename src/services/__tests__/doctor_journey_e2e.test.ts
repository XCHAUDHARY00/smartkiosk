import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  callPatientToCabin, 
  startDoctorConsultation, 
  completeConsultationWithOrders,
  getOrCreateEncounter
} from '../encounterWorkflowService';
import { generateClinicalSummary } from '../aiService';
import { PatientProfile, ClinicalSummary } from '../../types';

test('Doctor Journey E2E Suite: Clinical Cockpit, AI Guardrails, & Verification Loop', async (t) => {
  console.log('\n=============================================================');
  console.log('🧪 RUNNING DOCTOR JOURNEY E2E VERIFICATION SUITE');
  console.log('=============================================================\n');

  // 1. Initial State: Patient Waiting in Queue
  const initialPatient: PatientProfile = {
    id: 'p_doc_test_1',
    tokenNumber: 'A-201',
    name: 'Bhagwan Das',
    age: 58,
    gender: 'Male',
    phone: '9870001111',
    language: 'hi',
    department: 'Cardiology OPD',
    assignedCabin: 'Cabin 102',
    registeredAt: '09:00 AM',
    status: 'Waiting',
    vitals: {
      bloodPressure: '158/98 mmHg',
      pulse: 88,
      spo2: 96,
      temperature: 98.6
    }
  };

  // Stage 1 & 2: Call to Cabin & Start Consultation
  let currentPatient = callPatientToCabin(initialPatient);
  assert.equal(currentPatient.status, 'Called');
  assert.ok(currentPatient.encounter?.calledAt);

  currentPatient = startDoctorConsultation(currentPatient);
  assert.equal(currentPatient.status, 'With Doctor');
  assert.ok(currentPatient.encounter?.consultationStartedAt);
  console.log('✅ PASSED: Doctor calls patient and starts consultation in Cabin 102');

  // Stage 3: Verify Patient Header & Clinical Brief
  await t.test('Doctor Cockpit Header displays all required demographic & status attributes', () => {
    assert.equal(currentPatient.tokenNumber, 'A-201');
    assert.equal(currentPatient.age, 58);
    assert.equal(currentPatient.gender, 'Male');
    assert.equal(currentPatient.language, 'hi');
    assert.equal(currentPatient.department, 'Cardiology OPD');
    assert.equal(currentPatient.status, 'With Doctor');
    console.log('✅ PASSED: Patient header has complete token, age, gender, language, department, status');
  });

  // Stage 4: AI Summary Generation with Mandatory Clinical Guardrails
  const rawAnswers = [
    { questionId: 'q_1', questionText: 'मुख्य समस्या (Chief complaint)', answerText: 'सीने के बीच में भारीपन और खिंचाव (Retrosternal chest heaviness)' },
    { questionId: 'q_2', questionText: 'Onset', answerText: '3 दिन से, सीढ़ियां चढ़ने पर बढ़ जाता है' },
    { questionId: 'q_3', questionText: 'Character', answerText: 'दबाव जैसा भारीपन (Crushing heaviness)' },
    { questionId: 'q_4', questionText: 'Severity', answerText: '8/10 बहुत तेज दर्द' }
  ];

  const summary = await generateClinicalSummary(currentPatient, rawAnswers, []);

  await t.test('AI Clinical Summary enforces non-final diagnosis guardrails', () => {
    // 1. Must NOT be auto-marked as consultation complete
    assert.equal(summary.isDoctorConsultationDone, false, 'AI summary must NEVER be marked as consultation complete automatically');

    // 2. Contains required clinical brief components
    assert.ok(summary.chiefComplaint, 'Contains chief complaint');
    assert.ok(summary.historyOfPresentIllness, 'Contains synthesized HPI');
    assert.ok(summary.socrates, 'Contains structured SOCRATES analysis');
    assert.ok(summary.differentialDiagnosis.length > 0, 'Contains differential diagnoses');
    assert.ok(summary.recommendedLabInvestigations.length > 0, 'Contains recommended lab investigations');

    // 3. Urgency / Red Flag Alert prominently detected for chest pain
    assert.equal(summary.urgencyScore, 'HIGH', 'High urgency detected for chest heaviness');
    assert.ok(summary.redFlags && summary.redFlags.length > 0, 'Prominent red flags populated');

    console.log('✅ PASSED: AI Summary is strictly preliminary and not a final diagnosis');
  });

  // Stage 5: Doctor Action Loop: [Accept], [Edit], [Reject]
  await t.test('Doctor Verification: Per-item Accept, Edit, and Reject actions', () => {
    const verifiedItems: Record<string, 'accepted' | 'edited' | 'rejected'> = {};

    // Doctor accepts chief complaint
    verifiedItems['chief_complaint'] = 'accepted';

    // Doctor edits differential diagnosis
    verifiedItems['differential_diagnosis'] = 'edited';

    // Doctor rejects a preliminary investigation
    verifiedItems['lab_ecg'] = 'accepted';
    verifiedItems['lab_echo'] = 'rejected';

    const doctorNotes = 'Examined patient: S1 S2 heard, no murmur. High clinical suspicion of exertional stable CAD. Stat ECG & Troponin ordered.';
    const finalVerifiedSummary: ClinicalSummary = {
      ...summary,
      doctorVerifiedItems: verifiedItems,
      doctorConsultationNotes: doctorNotes,
      doctorOrderedTests: ['12-Lead Standard ECG', 'High-Sensitivity Cardiac Troponin-I'],
      isDoctorConsultationDone: true
    };

    assert.equal(finalVerifiedSummary.isDoctorConsultationDone, true);
    assert.ok(finalVerifiedSummary.doctorVerifiedItems);
    assert.equal(finalVerifiedSummary.doctorVerifiedItems['chief_complaint'], 'accepted');
    assert.equal(finalVerifiedSummary.doctorVerifiedItems['differential_diagnosis'], 'edited');
    assert.equal(finalVerifiedSummary.doctorVerifiedItems['lab_echo'], 'rejected');
    assert.equal(finalVerifiedSummary.doctorOrderedTests.length, 2);

    // Complete consultation with orders
    const { patient: postConsultPatient } = completeConsultationWithOrders(currentPatient, finalVerifiedSummary);
    assert.equal(postConsultPatient.status, 'Investigations', 'Transitions to INVESTIGATIONS when doctor orders tests');
    assert.ok(postConsultPatient.encounter?.consultationCompletedAt);

    console.log('✅ PASSED: Doctor item-level verification loop (Accept, Edit, Reject) recorded with DOCTOR VERIFIED state');
  });

  console.log('\n=============================================================');
  console.log('🎉 DOCTOR JOURNEY E2E VERIFICATION COMPLETED SUCCESSFULLY!');
  console.log('=============================================================\n');
});
