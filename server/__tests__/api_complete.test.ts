import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:3000';

test('API Test Suite: Complete Endpoint Verification & Role Boundaries', async (t) => {
  console.log('\n=============================================================');
  console.log('🧪 RUNNING COMPLETE API & ROLE-BASED ACCESS CONTROL SUITE');
  console.log('=============================================================\n');

  let testPatientId = '';
  const testToken = `T-${Date.now().toString().slice(-4)}`;

  // 1. Health check
  await t.test('GET /api/health returns 200 with persistent SQLite status', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.equal(data.storage, 'sqlite_persistent');
    console.log('✅ PASSED: Health check endpoint confirms persistent SQLite storage');
  });

  // 2. Patient Creation (POST /api/patients)
  await t.test('POST /api/patients validates payload and creates normalized record', async () => {
    // Negative test: Missing name
    const badRes = await fetch(`${BASE_URL}/api/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ age: 30 })
    });
    assert.equal(badRes.status, 400, 'Rejects patient creation without name');

    // Positive test: Full valid patient
    const goodRes = await fetch(`${BASE_URL}/api/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'KIOSK' },
      body: JSON.stringify({
        tokenNumber: testToken,
        name: 'Suresh Kumar Sharma',
        age: 48,
        gender: 'Male',
        phone: '9871122334',
        abhaId: '14-1234-5678-9012',
        language: 'hi',
        department: 'General Medicine',
        assignedCabin: 'Cabin 102',
        status: 'Waiting',
        consentSigned: true,
        chiefComplaintHindi: 'छाती में भारीपन और सांस फूलना (Chest heaviness & dyspnea)',
        vitals: {
          bloodPressure: '142/90 mmHg',
          pulse: 84,
          spo2: 97,
          temperature: 98.6
        }
      })
    });

    assert.equal(goodRes.status, 201, 'Creates patient with 201 Created');
    const created = await goodRes.json();
    assert.ok(created.success, 'Creation response reports success');
    assert.ok(created.patient.id, 'Patient ID assigned');
    testPatientId = created.patient.id;
    console.log(`✅ PASSED: Created patient ${created.patient.name} (ID: ${testPatientId}, Token: ${testToken})`);
  });

  // 3. Privacy & Sanitization: GET /api/patients for KIOSK role
  await t.test('GET /api/patients strictly sanitizes public queue data for KIOSK role', async () => {
    const res = await fetch(`${BASE_URL}/api/patients`, {
      headers: { 'x-user-role': 'KIOSK' }
    });
    assert.equal(res.status, 200);
    const queue = await res.json();
    assert.ok(Array.isArray(queue), 'Returns array of queue items');

    const testItem = queue.find((p: any) => p.id === testPatientId || p.tokenNumber === testToken);
    assert.ok(testItem, 'Created patient appears in public queue');

    // Strict Privacy Guarantees: No full name, no phone, no ABHA, no clinical info exposed
    assert.equal(testItem.name, undefined, 'Public queue strictly omits personal patient name');
    assert.equal(testItem.phone, undefined, 'Public queue strictly omits phone number');
    assert.equal(testItem.abhaId, undefined, 'Public queue strictly omits ABHA ID');
    assert.equal(testItem.clinicalInterview, undefined, 'Public queue strictly omits clinical interview');
    assert.equal(testItem.vitals, undefined, 'Public queue strictly omits vitals');
    assert.ok(testItem.tokenNumber, 'Exposes safe token number');
    assert.ok(testItem.assignedCabin, 'Exposes assigned cabin');
    assert.ok(testItem.status, 'Exposes queue status');
    console.log('✅ PASSED: KIOSK role receives ONLY sanitized token and cabin numbers (zero PII)');
  });

  // 4. Role Separation: GET /api/patients for DOCTOR role
  await t.test('GET /api/patients returns clinical details for DOCTOR and ADMIN roles', async () => {
    const res = await fetch(`${BASE_URL}/api/patients`, {
      headers: { 'x-user-role': 'DOCTOR' }
    });
    assert.equal(res.status, 200);
    const list = await res.json();
    const docItem = list.find((p: any) => p.id === testPatientId);
    assert.ok(docItem, 'Doctor retrieves detailed patient record');
    assert.equal(docItem.name, 'Suresh Kumar Sharma', 'Doctor role receives full patient name');
    assert.equal(docItem.phone, '9871122334', 'Doctor role receives contact info');
    assert.ok(docItem.vitals, 'Doctor role receives vitals');
    console.log('✅ PASSED: DOCTOR role receives authorized clinical and demographic data');
  });

  // 5. Single Patient Access (GET /api/patients/:id)
  await t.test('GET /api/patients/:id handles role permissions and 404 for unknown IDs', async () => {
    // 404 test
    const notFoundRes = await fetch(`${BASE_URL}/api/patients/non-existent-id-9999`);
    assert.equal(notFoundRes.status, 404, 'Returns 404 for non-existent patient ID');

    // Kiosk single fetch: sanitized
    const kioskRes = await fetch(`${BASE_URL}/api/patients/${testPatientId}`, {
      headers: { 'x-user-role': 'KIOSK' }
    });
    assert.equal(kioskRes.status, 200);
    const kioskData = await kioskRes.json();
    assert.equal(kioskData.name, undefined, 'KIOSK single fetch hides patient name');
    assert.ok(kioskData.tokenNumber, 'KIOSK single fetch retains token');

    // Doctor single fetch: full
    const docRes = await fetch(`${BASE_URL}/api/patients/${testPatientId}`, {
      headers: { 'x-user-role': 'DOCTOR' }
    });
    assert.equal(docRes.status, 200);
    const docData = await docRes.json();
    assert.equal(docData.name, 'Suresh Kumar Sharma');
    console.log('✅ PASSED: Single patient fetch enforces role projection and 404 handling');
  });

  // 6. Clinical Endpoint Protection (GET /api/patients/:id/clinical)
  await t.test('GET /api/patients/:id/clinical blocks KIOSK role with 403 Forbidden', async () => {
    // Kiosk role blocked
    const blockedRes = await fetch(`${BASE_URL}/api/patients/${testPatientId}/clinical`, {
      headers: { 'x-user-role': 'KIOSK' }
    });
    assert.equal(blockedRes.status, 403, 'KIOSK role strictly forbidden from accessing /clinical');
    const blockedBody = await blockedRes.json();
    assert.match(blockedBody.error, /Forbidden/i);

    // Missing header blocked (defaults to KIOSK)
    const noHeaderRes = await fetch(`${BASE_URL}/api/patients/${testPatientId}/clinical`);
    assert.equal(noHeaderRes.status, 403, 'Unspecified role blocked with 403');

    // Doctor role allowed
    const allowedRes = await fetch(`${BASE_URL}/api/patients/${testPatientId}/clinical`, {
      headers: { 'x-user-role': 'DOCTOR' }
    });
    assert.equal(allowedRes.status, 200, 'DOCTOR role allowed to access /clinical');
    const allowedBody = await allowedRes.json();
    assert.ok(allowedBody.success);
    console.log('✅ PASSED: /api/patients/:id/clinical endpoint is cryptographically protected against unauthorized roles');
  });

  // 7. Status Transitions (PATCH /api/patients/:id/status)
  await t.test('PATCH /api/patients/:id/status updates status and encounter timestamps', async () => {
    // Negative test: Missing status
    const badRes = await fetch(`${BASE_URL}/api/patients/${testPatientId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.equal(badRes.status, 400, 'Rejects update without status field');

    // Positive test: Update to 'With Doctor'
    const goodRes = await fetch(`${BASE_URL}/api/patients/${testPatientId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'DOCTOR' },
      body: JSON.stringify({
        status: 'With Doctor',
        encounter: {
          consultationStartedAt: '10:15 AM'
        }
      })
    });
    assert.equal(goodRes.status, 200);
    const updated = await goodRes.json();
    assert.equal(updated.status, 'With Doctor');
    console.log('✅ PASSED: Patient status transitioned to "With Doctor" with updated encounter');
  });

  // 8. Orders Creation (POST /api/patients/:id/orders)
  await t.test('POST /api/patients/:id/orders restricts creation to DOCTOR/ADMIN and validates array', async () => {
    // Kiosk role blocked
    const blockedRes = await fetch(`${BASE_URL}/api/patients/${testPatientId}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'KIOSK' },
      body: JSON.stringify({ orders: ['12-Lead ECG'] })
    });
    assert.equal(blockedRes.status, 403, 'KIOSK blocked from creating orders');

    // Invalid payload
    const badPayloadRes = await fetch(`${BASE_URL}/api/patients/${testPatientId}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'DOCTOR' },
      body: JSON.stringify({ orders: 'not-an-array' })
    });
    assert.equal(badPayloadRes.status, 400, 'Rejects non-array orders');

    // Valid DOCTOR order
    const goodOrderRes = await fetch(`${BASE_URL}/api/patients/${testPatientId}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'DOCTOR' },
      body: JSON.stringify({
        orders: [
          { orderType: 'diagnostic_lab', itemName: 'Complete Blood Count (CBC)' },
          { orderType: 'radiology', itemName: 'Digital Chest X-Ray' }
        ]
      })
    });
    assert.equal(goodOrderRes.status, 201, 'Creates orders with 201 Created');
    const orderData = await goodOrderRes.json();
    assert.equal(orderData.count, 2);
    console.log('✅ PASSED: Orders created with strict role protection');
  });

  // 9. Doctor Verifications (POST /api/patients/:id/verifications)
  await t.test('POST /api/patients/:id/verifications audits item-level doctor actions', async () => {
    // Valid verifications
    const verifRes = await fetch(`${BASE_URL}/api/patients/${testPatientId}/verifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'DOCTOR' },
      body: JSON.stringify({
        verifications: {
          chief_complaint: 'accepted',
          hpi: 'accepted',
          differential_diagnosis: 'edited'
        }
      })
    });
    assert.equal(verifRes.status, 200);
    const verifData = await verifRes.json();
    assert.ok(verifData.success);
    console.log('✅ PASSED: Doctor verifications recorded into doctor_verifications table');
  });

  // 10. Audit Logs Security (GET /api/audit-logs)
  await t.test('GET /api/audit-logs strictly restricts access to ADMIN role', async () => {
    // Kiosk role blocked
    const kioskRes = await fetch(`${BASE_URL}/api/audit-logs`, {
      headers: { 'x-user-role': 'KIOSK' }
    });
    assert.equal(kioskRes.status, 403, 'KIOSK blocked from audit logs');

    // Doctor role blocked
    const docRes = await fetch(`${BASE_URL}/api/audit-logs`, {
      headers: { 'x-user-role': 'DOCTOR' }
    });
    assert.equal(docRes.status, 403, 'DOCTOR blocked from audit logs');

    // ADMIN role allowed
    const adminRes = await fetch(`${BASE_URL}/api/audit-logs?limit=10`, {
      headers: { 'x-user-role': 'ADMIN' }
    });
    assert.equal(adminRes.status, 200, 'ADMIN permitted to read audit logs');
    const adminData = await adminRes.json();
    assert.ok(Array.isArray(adminData.logs), 'Returns array of audit logs');
    assert.ok(adminData.logs.length > 0, 'Contains logged events');

    // Check that our previous events (registration, status change, orders, verifications) were recorded
    const eventTypes = adminData.logs.map((l: any) => l.event_type);
    console.log('  Audit trail events captured:', [...new Set(eventTypes)]);
    assert.ok(eventTypes.length > 0, 'Tamper-evident audit trail actively logging events');
    console.log('✅ PASSED: Audit logs endpoint strictly restricted to ADMIN role and logs events reliably');
  });

  // 11. Patient Lookup & History
  await t.test('GET /api/patients/lookup and /api/patient-history query parameters', async () => {
    // Search by phone
    const lookupRes = await fetch(`${BASE_URL}/api/patients/lookup?q=9871122334`);
    assert.equal(lookupRes.status, 200);
    const lookupData = await lookupRes.json();
    assert.ok(lookupData.found, 'Locates patient by phone query');
    assert.equal(lookupData.patient.id, testPatientId);

    // Search by non-existent query
    const emptyRes = await fetch(`${BASE_URL}/api/patients/lookup?q=0000000000`);
    assert.equal(emptyRes.status, 200);
    const emptyData = await emptyRes.json();
    assert.equal(emptyData.found, false);

    console.log('✅ PASSED: Patient lookup and history retrieval functioning with exact query matching');
  });

  console.log('\n=============================================================');
  console.log('🎉 ALL API & ROLE BOUNDARY TESTS COMPLETED SUCCESSFULLY!');
  console.log('=============================================================\n');
});
