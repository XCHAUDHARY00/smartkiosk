import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  db,
  initDatabase, 
  seedInitialDataIfEmpty, 
  getSanitizedPatientsForQueue, 
  getAllPatientsDetailed, 
  savePatientIntake,
  updatePatientStatusInDb,
  saveOrdersInDb,
  saveDoctorVerificationsInDb,
  recordAuditLog,
  getAuditLogs
} from '../db';

describe('Hardening Verification Test Suite', () => {

  it('1. Verifies that all 11 required tables exist in SQLite database', () => {
    initDatabase();
    seedInitialDataIfEmpty();

    const requiredTables = [
      'patients',
      'encounters',
      'consents',
      'clinical_histories',
      'ayush_assessments',
      'documents',
      'document_extractions',
      'triage_alerts',
      'orders',
      'doctor_verifications',
      'audit_logs'
    ];

    const tablesQuery = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`);
    const tables = (tablesQuery.all() as Array<{ name: string }>).map(t => t.name);

    for (const table of requiredTables) {
      assert.ok(tables.includes(table), `Table '${table}' must exist in SQLite database.`);
    }
  });

  it('2. Verifies role-based data sanitization for KIOSK role', () => {
    const queueData = getSanitizedPatientsForQueue();
    assert.ok(queueData.length > 0, 'Queue data should have seeded records');

    for (const item of queueData) {
      assert.ok(item.tokenNumber, 'Sanitized queue item must have tokenNumber');
      assert.ok(item.assignedCabin, 'Sanitized queue item must have assignedCabin');
      assert.ok(item.department, 'Sanitized queue item must have department');
      assert.ok(item.status, 'Sanitized queue item must have status');

      // Crucial: Ensure NO private phone, clinical history, socrates, or documents are exposed to public/kiosk
      assert.strictEqual((item as any).phone, undefined, 'Public kiosk queue must NOT expose phone numbers');
      assert.strictEqual((item as any).clinicalInterview, undefined, 'Public kiosk queue must NOT expose clinical interview');
      assert.strictEqual((item as any).documents, undefined, 'Public kiosk queue must NOT expose medical documents');
      assert.strictEqual((item as any).ayushAssessment, undefined, 'Public kiosk queue must NOT expose AYUSH assessments');
    }
  });

  it('3. Verifies full clinical profile retrieval for DOCTOR role', () => {
    const doctorData = getAllPatientsDetailed();
    assert.ok(doctorData.length > 0, 'Doctor should receive patient records');

    const first = doctorData[0];
    assert.ok(first.id, 'Patient must have ID');
    assert.ok(first.name, 'Patient must have Name');
    assert.ok(first.department, 'Patient must have Department');
    assert.ok(first.status, 'Patient must have Status');
    assert.ok(first.encounter, 'Patient must have linked encounter record');
  });

  it('4. Verifies intake persistence across tables (patients, encounters, consents, clinical_histories, triage_alerts, ayush_assessments, documents)', () => {
    const testPatientId = `test-p-${Date.now()}`;
    const intakePayload = {
      id: testPatientId,
      tokenNumber: 'T-999',
      name: 'Verification Test Patient',
      age: 42,
      gender: 'Female',
      phone: '9876543210',
      abhaId: '91-1234-5678-9012',
      language: 'hi',
      department: 'Ayurveda & Integrative Medicine',
      assignedCabin: 'Cabin 108',
      status: 'Waiting',
      consent: {
        granted: true,
        timestamp: new Date().toISOString(),
        purposeVersion: 'CARESAAR-OPD-INTAKE-v2026.1'
      },
      vitals: {
        bloodPressure: '120/80',
        pulse: 74,
        spo2: 99,
        temperature: 98.4
      },
      clinicalInterview: {
        chiefComplaint: 'Severe chronic migraine and joint stiffness',
        historyOfPresentIllness: 'Symptoms worsening over the past 3 weeks',
        redFlags: [
          { sign: 'Sudden onset neurological deficit', severity: 'URGENT' }
        ]
      },
      ayushAssessment: {
        prakritiSummary: 'Vata-Pitta dominant',
        doshaTendency: 'Vata aggravation',
        agniAssessment: 'Vishama Agni'
      },
      documents: [
        {
          id: `doc-test-${Date.now()}`,
          fileName: 'past_prescription.jpg',
          fileType: 'image/jpeg',
          documentType: 'prescription',
          extractedPrescriptions: [
            { medicine: 'Ashwagandha Churna', dosage: '3g', frequency: 'Twice daily', confidenceScore: 0.95 }
          ]
        }
      ]
    };

    // Save intake
    const saved = savePatientIntake(intakePayload, 'KIOSK', '127.0.0.1');
    assert.strictEqual(saved.id, testPatientId);

    // Check patients table
    const pRow: any = db.prepare(`SELECT * FROM patients WHERE id = ?`).get(testPatientId);
    assert.ok(pRow, 'Patient record must exist in SQLite patients table');
    assert.strictEqual(pRow.name, 'Verification Test Patient');

    // Check encounters table
    const encRow: any = db.prepare(`SELECT * FROM encounters WHERE patient_id = ?`).get(testPatientId);
    assert.ok(encRow, 'Encounter must exist in SQLite encounters table');
    assert.strictEqual(encRow.token_number, 'T-999');

    // Check consents table
    const cRow: any = db.prepare(`SELECT * FROM consents WHERE patient_id = ?`).get(testPatientId);
    assert.ok(cRow, 'Consent must exist in SQLite consents table');
    assert.strictEqual(cRow.granted, 1);

    // Check clinical_histories table
    const hRow: any = db.prepare(`SELECT * FROM clinical_histories WHERE patient_id = ?`).get(testPatientId);
    assert.ok(hRow, 'Clinical history must exist in SQLite clinical_histories table');
    assert.strictEqual(hRow.chief_complaint, 'Severe chronic migraine and joint stiffness');

    // Check triage_alerts table
    const alertRows: any[] = db.prepare(`SELECT * FROM triage_alerts WHERE patient_id = ?`).all(testPatientId);
    assert.ok(alertRows.length > 0, 'Triage alerts must exist for red flags');
    assert.strictEqual(alertRows[0].severity, 'URGENT');

    // Check ayush_assessments table
    const ayushRow: any = db.prepare(`SELECT * FROM ayush_assessments WHERE patient_id = ?`).get(testPatientId);
    assert.ok(ayushRow, 'AYUSH assessment must exist in SQLite ayush_assessments table');
    assert.strictEqual(ayushRow.prakriti_summary, 'Vata-Pitta dominant');

    // Check documents & document_extractions tables
    const docRow: any = db.prepare(`SELECT * FROM documents WHERE patient_id = ?`).get(testPatientId);
    assert.ok(docRow, 'Document must exist in SQLite documents table');
    const extRows: any[] = db.prepare(`SELECT * FROM document_extractions WHERE document_id = ?`).all(docRow.id);
    assert.ok(extRows.length > 0, 'Document extractions must exist in SQLite document_extractions table');
  });

  it('5. Verifies Orders creation and Doctor Verifications persistence', () => {
    const testPatientId = `test-ord-${Date.now()}`;
    savePatientIntake({ id: testPatientId, name: 'Doctor Order Test', department: 'General Medicine' });

    // Doctor orders investigations
    saveOrdersInDb(testPatientId, [
      { orderType: 'investigation', itemName: 'CBC' },
      { orderType: 'investigation', itemName: '12-Lead ECG' },
      { orderType: 'investigation', itemName: 'Chest X-Ray' }
    ], 'DOCTOR', '127.0.0.1');

    const orders: any[] = db.prepare(`SELECT * FROM orders WHERE patient_id = ?`).all(testPatientId);
    assert.strictEqual(orders.length, 3, 'Must have saved 3 orders in orders table');
    assert.strictEqual(orders[0].status, 'pending');

    // Doctor verifies AI clinical brief
    saveDoctorVerificationsInDb(testPatientId, {
      chiefComplaint: 'accepted',
      hpi: 'edited',
      differentialDiagnosis: 'accepted'
    }, 'DOCTOR', '127.0.0.1');

    const verifications: any[] = db.prepare(`
      SELECT dv.* FROM doctor_verifications dv
      JOIN encounters e ON dv.encounter_id = e.id
      WHERE e.patient_id = ?
    `).all(testPatientId);

    assert.strictEqual(verifications.length, 3, 'Must have saved 3 doctor verifications');
  });

  it('6. Verifies state transitions from WAITING to COMPLETED', () => {
    const testPatientId = `test-flow-${Date.now()}`;
    savePatientIntake({ id: testPatientId, name: 'Workflow Test', department: 'Cardiology' });

    const flowStages = [
      'Waiting',
      'Called',
      'With Doctor',
      'Investigations',
      'Report Ready',
      'Doctor Review',
      'Pharmacy',
      'Completed'
    ];

    for (const status of flowStages) {
      updatePatientStatusInDb(testPatientId, status, { status }, 'DOCTOR', '127.0.0.1');
      const pRow: any = db.prepare(`SELECT status FROM patients WHERE id = ?`).get(testPatientId);
      assert.strictEqual(pRow.status, status, `Patient status must update to ${status}`);
    }
  });

  it('7. Verifies audit trail logs all 8 critical lifecycle events', () => {
    const dummyId = `aud-${Date.now()}`;

    // Log the 8 required events
    recordAuditLog('registration', 'patient', dummyId, 'KIOSK', { test: true });
    recordAuditLog('consent', 'consent', dummyId, 'KIOSK', { granted: true });
    recordAuditLog('interview completed', 'clinical_history', dummyId, 'KIOSK', { redFlags: 0 });
    recordAuditLog('document uploaded', 'document', dummyId, 'KIOSK', { file: 'rx.jpg' });
    recordAuditLog('AI summary generated', 'clinical_summary', dummyId, 'DOCTOR', { model: 'gemini' });
    recordAuditLog('doctor verification', 'doctor_verification', dummyId, 'DOCTOR', { action: 'accepted' });
    recordAuditLog('order created', 'order', dummyId, 'DOCTOR', { item: 'ECG' });
    recordAuditLog('encounter completed', 'encounter', dummyId, 'DOCTOR', { status: 'Completed' });

    const allLogs = getAuditLogs(500);
    const loggedEvents = new Set(allLogs.map(l => l.event_type));

    const expectedEvents = [
      'registration',
      'consent',
      'interview completed',
      'document uploaded',
      'AI summary generated',
      'doctor verification',
      'order created',
      'encounter completed'
    ];

    for (const evt of expectedEvents) {
      assert.ok(loggedEvents.has(evt), `Audit logs must contain event '${evt}'`);
    }
  });
});
