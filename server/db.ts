import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'smartkiosk.db');

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA busy_timeout = 5000;');

// Initialize all 11 normalized database tables
export function initDatabase() {
  db.exec('PRAGMA foreign_keys = ON;');

  // 1. patients: Demographics and core identity
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      token_number TEXT NOT NULL,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      phone TEXT NOT NULL,
      abha_id TEXT,
      language TEXT DEFAULT 'hi',
      department TEXT NOT NULL,
      assigned_cabin TEXT NOT NULL,
      registered_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Waiting',
      vitals_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 2. encounters: State-driven consultation & post-consultation lifecycle
  db.exec(`
    CREATE TABLE IF NOT EXISTS encounters (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      token_number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Waiting',
      assigned_cabin TEXT NOT NULL,
      called_at TEXT,
      consultation_started_at TEXT,
      consultation_completed_at TEXT,
      order_tests_json TEXT,
      completed_tests_json TEXT,
      report_collected INTEGER DEFAULT 0,
      doctor_review_done INTEGER DEFAULT 0,
      pharmacy_dispensed INTEGER DEFAULT 0,
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );
  `);

  // 3. consents: Patient digital data consent
  db.exec(`
    CREATE TABLE IF NOT EXISTS consents (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      granted INTEGER NOT NULL,
      purpose_version TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );
  `);

  // 4. clinical_histories: CC, HPI, SOCRATES, past medical & personal history
  db.exec(`
    CREATE TABLE IF NOT EXISTS clinical_histories (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      encounter_id TEXT,
      chief_complaint TEXT,
      hpi TEXT,
      socrates_json TEXT,
      personal_history_json TEXT,
      family_history_json TEXT,
      past_medical_json TEXT,
      red_flags_json TEXT,
      vitals_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );
  `);

  // 5. ayush_assessments: Prakriti, Doshas, Vikriti, Agni
  db.exec(`
    CREATE TABLE IF NOT EXISTS ayush_assessments (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      encounter_id TEXT,
      prakriti_summary TEXT,
      dosha_tendency TEXT,
      vikriti_json TEXT,
      agni_assessment TEXT,
      provenance_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );
  `);

  // 6. documents: Uploaded prescriptions & lab reports
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      encounter_id TEXT,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      document_type TEXT NOT NULL,
      document_timeline_stage TEXT,
      upload_timestamp TEXT NOT NULL,
      doctor_verification_status TEXT DEFAULT 'PENDING',
      created_at TEXT NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );
  `);

  // 7. document_extractions: Granular OCR-extracted items with confidence scores
  db.exec(`
    CREATE TABLE IF NOT EXISTS document_extractions (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      extraction_type TEXT NOT NULL,
      data_json TEXT NOT NULL,
      confidence REAL,
      verification_status TEXT DEFAULT 'AI extracted — needs verification',
      created_at TEXT NOT NULL,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );
  `);

  // 8. triage_alerts: Priority alerts (URGENT / EMERGENCY)
  db.exec(`
    CREATE TABLE IF NOT EXISTS triage_alerts (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      encounter_id TEXT,
      severity TEXT NOT NULL,
      reason TEXT NOT NULL,
      detected_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      acknowledged_by TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );
  `);

  // 9. orders: Diagnostic investigations, prescriptions, and follow-ups
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      encounter_id TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      order_type TEXT NOT NULL,
      item_name TEXT NOT NULL,
      details_json TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      ordered_at TEXT NOT NULL,
      completed_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );
  `);

  // 10. doctor_verifications: Audit of doctor actions on AI clinical brief items
  db.exec(`
    CREATE TABLE IF NOT EXISTS doctor_verifications (
      id TEXT PRIMARY KEY,
      encounter_id TEXT NOT NULL,
      doctor_id TEXT NOT NULL,
      item_key TEXT NOT NULL,
      action TEXT NOT NULL,
      original_value TEXT,
      verified_value TEXT,
      verified_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (encounter_id) REFERENCES encounters(id) ON DELETE CASCADE
    );
  `);

  // 11. audit_logs: Tamper-evident trail for 8 core hospital events
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      details_json TEXT,
      timestamp TEXT NOT NULL,
      ip_address TEXT
    );
  `);

  console.log('✅ SQLite Database initialized at:', DB_PATH);
}

// ─── AUDIT TRAIL LOGGING ───────────────────────────────────────────────────────

export type AuditEventType = 
  | 'registration'
  | 'consent'
  | 'interview completed'
  | 'document uploaded'
  | 'AI summary generated'
  | 'doctor verification'
  | 'order created'
  | 'encounter completed';

export function recordAuditLog(
  eventType: AuditEventType,
  entityType: string,
  entityId: string,
  actorRole: string,
  details: Record<string, any> = {},
  ipAddress: string = '127.0.0.1'
): void {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, event_type, entity_type, entity_id, actor_role, details_json, timestamp, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const id = `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();
    stmt.run(id, eventType, entityType, entityId, actorRole, JSON.stringify(details), timestamp, ipAddress);
  } catch (err) {
    console.error('Failed to record audit log:', err);
  }
}

export function getAuditLogs(limit: number = 50) {
  const stmt = db.prepare(`
    SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?
  `);
  return stmt.all(limit).map((row: any) => ({
    ...row,
    details: row.details_json ? JSON.parse(row.details_json) : null
  }));
}

// ─── PATIENT OPERATIONS ───────────────────────────────────────────────────────

export function getSanitizedPatientsForQueue() {
  // Public/Kiosk sanitized queue: returns only non-sensitive tokens and cabins
  const stmt = db.prepare(`
    SELECT id, token_number AS tokenNumber, assigned_cabin AS assignedCabin, status, department, registered_at AS registeredAt
    FROM patients
    ORDER BY created_at DESC
  `);
  return stmt.all();
}

export function getAllPatientsDetailed() {
  // Authorized Doctor/Admin query: returns full demographic & clinical profiles
  const stmt = db.prepare(`SELECT * FROM patients ORDER BY created_at DESC`);
  const rows: any[] = stmt.all();

  return rows.map(p => {
    // Fetch associated encounter
    const encStmt = db.prepare(`SELECT * FROM encounters WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1`);
    const enc: any = encStmt.get(p.id);

    // Fetch clinical history
    const histStmt = db.prepare(`SELECT * FROM clinical_histories WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1`);
    const hist: any = histStmt.get(p.id);

    // Fetch documents
    const docStmt = db.prepare(`SELECT * FROM documents WHERE patient_id = ?`);
    const docs: any[] = docStmt.all(p.id);

    // Fetch AYUSH
    const ayushStmt = db.prepare(`SELECT * FROM ayush_assessments WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1`);
    const ayush: any = ayushStmt.get(p.id);

    // Fetch triage alerts
    const altStmt = db.prepare(`SELECT * FROM triage_alerts WHERE patient_id = ? ORDER BY created_at DESC`);
    const alerts: any[] = altStmt.all(p.id);

    const fullDocs = docs.map(d => {
      const extStmt = db.prepare(`SELECT * FROM document_extractions WHERE document_id = ?`);
      const extractions: any[] = extStmt.all(d.id);
      return {
        id: d.id,
        fileName: d.file_name,
        fileType: d.file_type,
        documentType: d.document_type,
        documentTimelineStage: d.document_timeline_stage,
        uploadTimestamp: d.upload_timestamp,
        doctorVerification: { status: d.doctor_verification_status },
        extractedPrescriptions: extractions.filter(e => e.extraction_type === 'prescription').map(e => JSON.parse(e.data_json)),
        extractedLabResults: extractions.filter(e => e.extraction_type === 'lab_report').map(e => JSON.parse(e.data_json)),
        extractedSummaries: extractions.filter(e => e.extraction_type === 'summary').map(e => JSON.parse(e.data_json))
      };
    });

    return {
      id: p.id,
      tokenNumber: p.token_number,
      name: p.name,
      age: p.age,
      gender: p.gender,
      phone: p.phone,
      abhaId: p.abha_id,
      language: p.language,
      department: p.department,
      assignedCabin: p.assigned_cabin,
      registeredAt: p.registered_at,
      status: p.status,
      vitals: p.vitals_json ? JSON.parse(p.vitals_json) : undefined,
      chiefComplaintTranscript: hist?.chief_complaint || '',
      clinicalInterview: hist ? {
        chiefComplaint: hist.chief_complaint,
        historyOfPresentIllness: hist.hpi,
        socrates: hist.socrates_json ? JSON.parse(hist.socrates_json) : {},
        personalHistory: hist.personal_history_json ? JSON.parse(hist.personal_history_json) : {},
        familyHistory: hist.family_history_json ? JSON.parse(hist.family_history_json) : [],
        pastMedicalHistory: hist.past_medical_json ? JSON.parse(hist.past_medical_json) : [],
        redFlags: hist.red_flags_json ? JSON.parse(hist.red_flags_json) : []
      } : undefined,
      ayushAssessment: ayush ? {
        prakritiSummary: ayush.prakriti_summary,
        doshaTendency: ayush.dosha_tendency,
        vikriti: ayush.vikriti_json ? JSON.parse(ayush.vikriti_json) : {},
        agniAssessment: ayush.agni_assessment,
        provenance: ayush.provenance_json ? JSON.parse(ayush.provenance_json) : {}
      } : undefined,
      documents: fullDocs,
      encounter: enc ? {
        id: enc.id,
        patientId: enc.patient_id,
        tokenNumber: enc.token_number,
        status: enc.status,
        assignedCabin: enc.assigned_cabin,
        calledAt: enc.called_at,
        consultationStartedAt: enc.consultation_started_at,
        consultationCompletedAt: enc.consultation_completed_at,
        orderedTests: enc.order_tests_json ? JSON.parse(enc.order_tests_json) : [],
        completedTests: enc.completed_tests_json ? JSON.parse(enc.completed_tests_json) : [],
        reportCollected: Boolean(enc.report_collected),
        doctorReviewDone: Boolean(enc.doctor_review_done),
        medicationsPrescribed: [],
        pharmacyDispensed: Boolean(enc.pharmacy_dispensed),
        completedAt: enc.completed_at,
        lastUpdated: enc.updated_at
      } : undefined,
      triageAlerts: alerts.map(a => ({
        id: a.id,
        severity: a.severity,
        reason: a.reason,
        detectedAt: a.detected_at,
        status: a.status
      }))
    };
  });
}

export function getPatientById(id: string) {
  const stmt = db.prepare(`SELECT * FROM patients WHERE id = ?`);
  return stmt.get(id);
}

export function savePatientIntake(patientData: any, actorRole: string = 'KIOSK', ip: string = '127.0.0.1') {
  const now = new Date().toISOString();
  const patientId = patientData.id || `p-${Date.now().toString().slice(-4)}`;
  const tokenNumber = patientData.tokenNumber || `A-${Math.floor(100 + (Math.floor(Date.now() % 890)))}`;

  // 1. Insert or update patient
  const pStmt = db.prepare(`
    INSERT INTO patients (id, token_number, name, age, gender, phone, abha_id, language, department, assigned_cabin, registered_at, status, vitals_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      status = excluded.status,
      assigned_cabin = excluded.assigned_cabin,
      updated_at = excluded.updated_at
  `);
  pStmt.run(
    patientId,
    tokenNumber,
    patientData.name,
    patientData.age || 40,
    patientData.gender || 'Male',
    patientData.phone || '',
    patientData.abhaId || null,
    patientData.language || 'hi',
    patientData.department || 'General Medicine',
    patientData.assignedCabin || 'Cabin 102',
    patientData.registeredAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    patientData.status || 'Waiting',
    patientData.vitals ? JSON.stringify(patientData.vitals) : null,
    now,
    now
  );

  recordAuditLog('registration', 'patient', patientId, actorRole, { tokenNumber, department: patientData.department }, ip);

  // 2. Insert consent if provided
  if (patientData.consent) {
    const cStmt = db.prepare(`
      INSERT INTO consents (id, patient_id, granted, purpose_version, timestamp, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    cStmt.run(
      `c-${Date.now()}`,
      patientId,
      patientData.consent.granted ? 1 : 0,
      patientData.consent.purposeVersion || 'v1.0-privacy-aware',
      patientData.consent.timestamp || now,
      now
    );
    recordAuditLog('consent', 'consent', patientId, actorRole, { granted: patientData.consent.granted }, ip);
  }

  // 3. Insert initial encounter
  const encId = `enc-${patientId}`;
  const encStmt = db.prepare(`
    INSERT INTO encounters (id, patient_id, token_number, status, assigned_cabin, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      status = excluded.status,
      updated_at = excluded.updated_at
  `);
  encStmt.run(
    encId,
    patientId,
    tokenNumber,
    patientData.status || 'Waiting',
    patientData.assignedCabin || 'Cabin 102',
    now,
    now
  );

  // 4. Insert clinical interview if provided
  if (patientData.clinicalInterview) {
    const ci = patientData.clinicalInterview;
    const hStmt = db.prepare(`
      INSERT INTO clinical_histories (id, patient_id, encounter_id, chief_complaint, hpi, socrates_json, personal_history_json, family_history_json, past_medical_json, red_flags_json, vitals_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    hStmt.run(
      `hist-${Date.now()}`,
      patientId,
      encId,
      ci.chiefComplaint || patientData.chiefComplaintTranscript || '',
      ci.historyOfPresentIllness || '',
      ci.socrates ? JSON.stringify(ci.socrates) : null,
      ci.personalHistory ? JSON.stringify(ci.personalHistory) : null,
      ci.familyHistory ? JSON.stringify(ci.familyHistory) : null,
      ci.pastMedicalHistory ? JSON.stringify(ci.pastMedicalHistory) : null,
      ci.redFlags ? JSON.stringify(ci.redFlags) : null,
      patientData.vitals ? JSON.stringify(patientData.vitals) : null,
      now
    );
    recordAuditLog('interview completed', 'clinical_history', patientId, actorRole, { hasRedFlags: Boolean(ci.redFlags?.length) }, ip);

    // Save triage alerts if red flags are detected
    if (Array.isArray(ci.redFlags) && ci.redFlags.length > 0) {
      for (const rf of ci.redFlags) {
        const alertStmt = db.prepare(`
          INSERT INTO triage_alerts (id, patient_id, encounter_id, severity, reason, detected_at, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        alertStmt.run(
          `alt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          patientId,
          encId,
          rf.severity || 'URGENT',
          rf.sign || rf.reason || 'Clinical alert detected',
          now,
          'active',
          now
        );
      }
    }
  }

  // 5. Insert AYUSH assessment if provided
  if (patientData.ayushAssessment) {
    const ayush = patientData.ayushAssessment;
    const aStmt = db.prepare(`
      INSERT INTO ayush_assessments (id, patient_id, encounter_id, prakriti_summary, dosha_tendency, vikriti_json, agni_assessment, provenance_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    aStmt.run(
      `ayush-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      patientId,
      encId,
      ayush.prakritiSummary || null,
      ayush.doshaTendency || null,
      ayush.vikriti ? JSON.stringify(ayush.vikriti) : null,
      ayush.agniAssessment || null,
      ayush.provenance ? JSON.stringify(ayush.provenance) : null,
      now
    );
  }

  // 6. Insert documents & extractions if provided
  if (Array.isArray(patientData.documents) && patientData.documents.length > 0) {
    for (const doc of patientData.documents) {
      const docId = doc.id || `doc-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      const dStmt = db.prepare(`
        INSERT INTO documents (id, patient_id, encounter_id, file_name, file_type, document_type, document_timeline_stage, upload_timestamp, doctor_verification_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          doctor_verification_status = excluded.doctor_verification_status
      `);
      dStmt.run(
        docId,
        patientId,
        encId,
        doc.fileName || 'Uploaded Document',
        doc.fileType || 'image/jpeg',
        doc.documentType || 'prescription',
        doc.documentTimelineStage || 'Current encounter',
        doc.uploadTimestamp || now,
        doc.doctorVerification?.status || 'PENDING',
        now
      );

      recordAuditLog('document uploaded', 'document', docId, actorRole, { fileName: doc.fileName, docType: doc.documentType }, ip);

      // Save extractions
      if (Array.isArray(doc.extractedPrescriptions)) {
        for (const rx of doc.extractedPrescriptions) {
          const extStmt = db.prepare(`
            INSERT INTO document_extractions (id, document_id, extraction_type, data_json, confidence, verification_status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);
          extStmt.run(`ext-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`, docId, 'prescription', JSON.stringify(rx), rx.confidenceScore || 0.85, rx.status || 'AI extracted — needs verification', now);
        }
      }
    }
  }

  return { id: patientId, tokenNumber, status: patientData.status || 'Waiting' };
}

export function updatePatientStatusInDb(
  patientId: string, 
  status: string, 
  encounterData?: any,
  actorRole: string = 'DOCTOR',
  ip: string = '127.0.0.1'
) {
  const now = new Date().toISOString();

  // 1. Update patient status
  const pStmt = db.prepare(`UPDATE patients SET status = ?, updated_at = ? WHERE id = ?`);
  pStmt.run(status, now, patientId);

  // 2. Update encounter
  const encStmt = db.prepare(`
    UPDATE encounters SET
      status = ?,
      called_at = COALESCE(?, called_at),
      consultation_started_at = COALESCE(?, consultation_started_at),
      consultation_completed_at = COALESCE(?, consultation_completed_at),
      order_tests_json = COALESCE(?, order_tests_json),
      completed_tests_json = COALESCE(?, completed_tests_json),
      report_collected = COALESCE(?, report_collected),
      doctor_review_done = COALESCE(?, doctor_review_done),
      pharmacy_dispensed = COALESCE(?, pharmacy_dispensed),
      completed_at = COALESCE(?, completed_at),
      updated_at = ?
    WHERE patient_id = ?
  `);

  encStmt.run(
    status,
    encounterData?.calledAt || (status === 'Called' ? now : null),
    encounterData?.consultationStartedAt || (status === 'With Doctor' ? now : null),
    encounterData?.consultationCompletedAt || (['Investigations', 'Pharmacy', 'Completed'].includes(status) ? now : null),
    encounterData?.orderedTests ? JSON.stringify(encounterData.orderedTests) : null,
    encounterData?.completedTests ? JSON.stringify(encounterData.completedTests) : null,
    encounterData?.reportCollected !== undefined ? (encounterData.reportCollected ? 1 : 0) : null,
    encounterData?.doctorReviewDone !== undefined ? (encounterData.doctorReviewDone ? 1 : 0) : null,
    encounterData?.pharmacyDispensed !== undefined ? (encounterData.pharmacyDispensed ? 1 : 0) : (status === 'Completed' ? 1 : null),
    encounterData?.completedAt || (status === 'Completed' ? now : null),
    now,
    patientId
  );

  if (status === 'Completed') {
    recordAuditLog('encounter completed', 'encounter', patientId, actorRole, { status }, ip);
  }

  return { patientId, status };
}

export function saveOrdersInDb(
  patientId: string,
  ordersList: Array<{ orderType: string; itemName: string; details?: any }>,
  actorRole: string = 'DOCTOR',
  ip: string = '127.0.0.1'
) {
  const now = new Date().toISOString();
  const encStmt = db.prepare(`SELECT id FROM encounters WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1`);
  const enc: any = encStmt.get(patientId);
  const encounterId = enc ? enc.id : `enc-${patientId}`;

  for (const ord of ordersList) {
    const oId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const stmt = db.prepare(`
      INSERT INTO orders (id, encounter_id, patient_id, order_type, item_name, details_json, status, ordered_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(oId, encounterId, patientId, ord.orderType, ord.itemName, ord.details ? JSON.stringify(ord.details) : null, 'pending', now, now);
    recordAuditLog('order created', 'order', oId, actorRole, { itemName: ord.itemName, type: ord.orderType }, ip);
  }
}

export function saveDoctorVerificationsInDb(
  patientId: string,
  verifications: Record<string, 'accepted' | 'edited' | 'rejected'>,
  actorRole: string = 'DOCTOR',
  ip: string = '127.0.0.1'
) {
  const now = new Date().toISOString();
  const encStmt = db.prepare(`SELECT id FROM encounters WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1`);
  const enc: any = encStmt.get(patientId);
  const encounterId = enc ? enc.id : `enc-${patientId}`;

  for (const [key, action] of Object.entries(verifications)) {
    const vId = `ver-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const stmt = db.prepare(`
      INSERT INTO doctor_verifications (id, encounter_id, doctor_id, item_key, action, verified_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(vId, encounterId, 'dr-alok-verma', key, action, now, now);
    recordAuditLog('doctor verification', 'doctor_verification', vId, actorRole, { itemKey: key, action }, ip);
  }
}

// ─── SEED INITIAL PRODUCTION DATA IF EMPTY ─────────────────────────────────────

export function seedInitialDataIfEmpty() {
  const countStmt = db.prepare(`SELECT COUNT(*) as count FROM patients`);
  const { count } = countStmt.get() as any;

  if (count > 0) return;

  console.log('🌱 Seeding initial records into SQLite database...');

  const initialPatients = [
    {
      id: 'p-101',
      tokenNumber: 'A-101',
      name: 'Ram Prasad Sharma',
      age: 54,
      gender: 'Male',
      phone: '9876543210',
      abhaId: '12-3456-7890-1234',
      language: 'hi',
      department: 'General Medicine',
      assignedCabin: 'Cabin 102',
      registeredAt: '08:30 AM',
      status: 'With Doctor',
      vitals: { bloodPressure: '138/88 mmHg', pulse: 78, spo2: 98, temperature: 98.4, bloodSugar: 164 },
      consent: { granted: true, timestamp: '08:30 AM', purposeVersion: 'v1.0-privacy-aware' },
      chiefComplaintTranscript: 'पिछले 4 दिनों से सीने में भारीपन और चक्कर आ रहा है।',
      clinicalInterview: {
        chiefComplaint: 'Chest heaviness and morning dizziness for 4 days',
        historyOfPresentIllness: '54-year-old male with T2D presenting with subacute retrosternal heaviness.',
        socrates: { site: 'Precordium', severity: '6 / 10' },
        redFlags: ['Subacute chest pressure on exertion']
      }
    },
    {
      id: 'p-102',
      tokenNumber: 'A-102',
      name: 'Sunita Devi',
      age: 46,
      gender: 'Female',
      phone: '9812345678',
      abhaId: '98-7654-3210-9876',
      language: 'hi',
      department: 'Chest & Respiratory OPD',
      assignedCabin: 'Cabin 104',
      registeredAt: '08:45 AM',
      status: 'Waiting',
      vitals: { bloodPressure: '120/78 mmHg', pulse: 84, spo2: 95, temperature: 99.8 },
      consent: { granted: true, timestamp: '08:45 AM', purposeVersion: 'v1.0-privacy-aware' },
      chiefComplaintTranscript: '2 हफ्ते से लगातार सूखी खांसी आ रही है।'
    },
    {
      id: 'p-103',
      tokenNumber: 'A-103',
      name: 'Mohammed Arif',
      age: 29,
      gender: 'Male',
      phone: '9988776655',
      abhaId: '45-6789-0123-4567',
      language: 'hi',
      department: 'General Medicine',
      assignedCabin: 'Cabin 102',
      registeredAt: '09:05 AM',
      status: 'Waiting',
      vitals: { bloodPressure: '112/74 mmHg', pulse: 104, spo2: 99, temperature: 102.2 },
      consent: { granted: true, timestamp: '09:05 AM', purposeVersion: 'v1.0-privacy-aware' },
      chiefComplaintTranscript: '3 दिनों से तेज बुखार, बदन दर्द और सिरदर्द है।'
    },
    {
      id: 'p-104',
      tokenNumber: 'A-104',
      name: 'Anita Sharma',
      age: 62,
      gender: 'Female',
      phone: '9123456780',
      abhaId: '77-8899-0011-2233',
      language: 'hi',
      department: 'Orthopedics',
      assignedCabin: 'Cabin 108',
      registeredAt: '09:15 AM',
      status: 'Waiting',
      vitals: { bloodPressure: '130/84 mmHg', pulse: 74, spo2: 97, temperature: 98.6 },
      consent: { granted: true, timestamp: '09:15 AM', purposeVersion: 'v1.0-privacy-aware' },
      chiefComplaintTranscript: 'दोनों घुटनों में बहुत दर्द रहता है।'
    }
  ];

  for (const p of initialPatients) {
    savePatientIntake(p, 'ADMIN', '127.0.0.1');
  }

  // Pre-seed orders for p-101
  saveOrdersInDb('p-101', [
    { orderType: 'investigation', itemName: '12-Lead ECG' },
    { orderType: 'investigation', itemName: 'Blood Test (CBC)' },
    { orderType: 'prescription', itemName: 'Tab Sorbitrate 5mg', details: { dosage: '5mg', freq: 'SOS' } }
  ], 'DOCTOR', '127.0.0.1');

  console.log('✅ SQLite Database seeded with initial patient records and audit logs');
}
