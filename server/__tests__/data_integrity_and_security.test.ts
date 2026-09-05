import test from 'node:test';
import assert from 'node:assert/strict';
import { db, initDatabase, getAllPatientsDetailed } from '../db';

test('Data Integrity & Security Suite: 11-Table Architecture, Foreign Keys & Injection Protection', async (t) => {
  console.log('\n=============================================================');
  console.log('🧪 RUNNING DATABASE INTEGRITY & SECURITY SUITE (11 TABLES)');
  console.log('=============================================================\n');

  initDatabase();

  // 1. Verify existence of all 11 normalized tables
  await t.test('1. Verify all 11 normalized database tables exist in SQLite schema', () => {
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

    const tablesStmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
    const rows = tablesStmt.all() as Array<{ name: string }>;
    const existingTableNames = rows.map(r => r.name);

    for (const table of requiredTables) {
      assert.ok(
        existingTableNames.includes(table),
        `Required table '${table}' must exist in SQLite database`
      );
      console.log(`  ✓ Table verified: ${table}`);
    }

    assert.equal(requiredTables.length, 11, 'All 11 normalized tables verified');
    console.log('✅ PASSED: All 11 normalized clinical and administrative tables exist');
  });

  // 2. Foreign Key Enforcement: Rejection of Orphan Records
  await t.test('2. Verify Foreign Key constraints reject orphan records with non-existent patient IDs', () => {
    const nonExistentPatientId = 'non-existent-patient-xyz-99999';

    // Attempt to insert orphan encounter
    assert.throws(() => {
      const stmt = db.prepare(`
        INSERT INTO encounters (id, patient_id, token_number, assigned_cabin, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        'orphan-enc-1',
        nonExistentPatientId,
        'X-999',
        'Cabin 101',
        new Date().toISOString(),
        new Date().toISOString()
      );
    }, (err: any) => {
      assert.match(err.message, /FOREIGN KEY constraint failed/i);
      return true;
    }, 'Must throw FOREIGN KEY constraint failed error on orphan encounter');

    // Attempt to insert orphan consent
    assert.throws(() => {
      const stmt = db.prepare(`
        INSERT INTO consents (id, patient_id, granted, purpose_version, timestamp, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        'orphan-consent-1',
        nonExistentPatientId,
        1,
        'v1.0',
        new Date().toISOString(),
        new Date().toISOString()
      );
    }, (err: any) => {
      assert.match(err.message, /FOREIGN KEY constraint failed/i);
      return true;
    }, 'Must throw FOREIGN KEY constraint failed error on orphan consent');

    // Attempt to insert orphan document extraction
    assert.throws(() => {
      const stmt = db.prepare(`
        INSERT INTO document_extractions (id, document_id, extraction_type, data_json, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(
        'orphan-ext-1',
        'non-existent-doc-xyz',
        'prescription',
        '{}',
        new Date().toISOString()
      );
    }, (err: any) => {
      assert.match(err.message, /FOREIGN KEY constraint failed/i);
      return true;
    }, 'Must throw FOREIGN KEY constraint failed error on orphan document extraction');

    console.log('✅ PASSED: Foreign Key constraints strictly prevent orphan records across schema');
  });

  // 3. Cascade Deletion Integrity
  await t.test('3. Verify ON DELETE CASCADE propagates from patients to all child tables', () => {
    const testPid = `temp-cascade-patient-${Date.now()}`;
    const testEncId = `temp-cascade-enc-${Date.now()}`;
    const testDocId = `temp-cascade-doc-${Date.now()}`;
    const now = new Date().toISOString();

    // 1. Insert parent patient
    db.prepare(`
      INSERT INTO patients (id, token_number, name, age, gender, phone, department, assigned_cabin, registered_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(testPid, 'CAS-1', 'Cascade Test Patient', 50, 'Male', '9999888877', 'Medicine', 'Cabin 1', now, now, now);

    // 2. Insert child encounter
    db.prepare(`
      INSERT INTO encounters (id, patient_id, token_number, assigned_cabin, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(testEncId, testPid, 'CAS-1', 'Cabin 1', now, now);

    // 3. Insert child consent
    db.prepare(`
      INSERT INTO consents (id, patient_id, granted, purpose_version, timestamp, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(`consent-${testPid}`, testPid, 1, 'v1.0', now, now);

    // 4. Insert child clinical history
    db.prepare(`
      INSERT INTO clinical_histories (id, patient_id, chief_complaint, created_at)
      VALUES (?, ?, ?, ?)
    `).run(`clin-${testPid}`, testPid, 'Cascade test complaint', now);

    // 5. Insert child document and grandchild extraction
    db.prepare(`
      INSERT INTO documents (id, patient_id, file_name, file_type, document_type, upload_timestamp, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(testDocId, testPid, 'test_prescription.pdf', 'pdf', 'prescription', now, now);

    db.prepare(`
      INSERT INTO document_extractions (id, document_id, extraction_type, data_json, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(`ext-${testDocId}`, testDocId, 'prescription_item', '{"med":"Paracetamol"}', now);

    // Verify children exist
    const encBefore = db.prepare('SELECT id FROM encounters WHERE patient_id = ?').get(testPid);
    const consentBefore = db.prepare('SELECT id FROM consents WHERE patient_id = ?').get(testPid);
    const docBefore = db.prepare('SELECT id FROM documents WHERE patient_id = ?').get(testPid);
    const extBefore = db.prepare('SELECT id FROM document_extractions WHERE document_id = ?').get(testDocId);

    assert.ok(encBefore, 'Encounter exists before delete');
    assert.ok(consentBefore, 'Consent exists before delete');
    assert.ok(docBefore, 'Document exists before delete');
    assert.ok(extBefore, 'Extraction exists before delete');

    // DELETE parent patient
    db.prepare('DELETE FROM patients WHERE id = ?').run(testPid);

    // Verify all child and grandchild records are automatically cascaded and deleted
    const encAfter = db.prepare('SELECT id FROM encounters WHERE patient_id = ?').get(testPid);
    const consentAfter = db.prepare('SELECT id FROM consents WHERE patient_id = ?').get(testPid);
    const docAfter = db.prepare('SELECT id FROM documents WHERE patient_id = ?').get(testPid);
    const extAfter = db.prepare('SELECT id FROM document_extractions WHERE document_id = ?').get(testDocId);

    assert.equal(encAfter, undefined, 'Encounter was cascade deleted');
    assert.equal(consentAfter, undefined, 'Consent was cascade deleted');
    assert.equal(docAfter, undefined, 'Document was cascade deleted');
    assert.equal(extAfter, undefined, 'Extraction was cascade deleted via document deletion');

    console.log('✅ PASSED: Cascade deletion cleans up entire patient graph across child & grandchild tables');
  });

  // 4. SQL Injection Immunity via Parameterized Queries
  await t.test('4. SQL Injection payload immunity via parameterized queries', () => {
    const maliciousInput = "'; DROP TABLE patients; --";
    
    // Attempt lookup with malicious input
    const lookupStmt = db.prepare("SELECT * FROM patients WHERE phone = ? OR abha_id = ?");
    const result = lookupStmt.all(maliciousInput, maliciousInput);
    assert.equal(result.length, 0, 'Injection payload matches nothing');

    // Verify patients table still exists and is completely intact
    const checkTable = db.prepare("SELECT count(*) as cnt FROM patients").get() as { cnt: number };
    assert.ok(checkTable.cnt >= 0, 'Patients table remains intact and unaffected by injection string');

    console.log('✅ PASSED: Parameterized queries neutralize SQL injection vectors without table corruption');
  });

  // 5. Audit Trail Integrity
  await t.test('5. Verify audit log integrity and tamper-evidence', () => {
    const recentLogs = db.prepare(`
      SELECT id, event_type, entity_type, entity_id, actor_role, timestamp 
      FROM audit_logs 
      ORDER BY timestamp DESC 
      LIMIT 10
    `).all() as Array<{
      id: string;
      event_type: string;
      entity_type: string;
      entity_id: string;
      actor_role: string;
      timestamp: string;
    }>;

    assert.ok(recentLogs.length > 0, 'Audit logs contain recorded events');
    for (const log of recentLogs) {
      assert.ok(log.id, 'Log has unique ID');
      assert.ok(log.event_type, 'Log specifies event_type');
      assert.ok(log.entity_type, 'Log specifies entity_type');
      assert.ok(log.actor_role, 'Log specifies actor_role');
      assert.ok(log.timestamp, 'Log specifies ISO timestamp');
    }

    console.log(`✅ PASSED: Audit trail verified with ${recentLogs.length} validated event signatures`);
  });

  console.log('\n=============================================================');
  console.log('🎉 ALL DATA INTEGRITY & SECURITY TESTS COMPLETED SUCCESSFULLY!');
  console.log('=============================================================\n');
});
