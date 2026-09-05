import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://127.0.0.1:3000';

describe('HTTP Role-Based API Endpoint Security Test Suite', () => {
  it('1. GET /api/patients with X-User-Role: KIOSK returns sanitized queue data without clinical info', async () => {
    const res = await fetch(`${BASE_URL}/api/patients`, {
      headers: { 'x-user-role': 'KIOSK' }
    });
    assert.strictEqual(res.status, 200);
    const data: any[] = await res.json();
    assert.ok(Array.isArray(data), 'Response must be an array');
    assert.ok(data.length > 0, 'Should return records');

    for (const p of data) {
      assert.ok(p.tokenNumber, 'Must include tokenNumber');
      assert.ok(p.assignedCabin, 'Must include assignedCabin');
      assert.ok(p.status, 'Must include status');

      // Crucial security checks:
      assert.strictEqual(p.phone, undefined, 'Kiosk response must NOT expose phone number');
      assert.strictEqual(p.clinicalInterview, undefined, 'Kiosk response must NOT expose clinical interview');
      assert.strictEqual(p.documents, undefined, 'Kiosk response must NOT expose documents');
      assert.strictEqual(p.ayushAssessment, undefined, 'Kiosk response must NOT expose ayush assessment');
      assert.strictEqual(p.vitals, undefined, 'Kiosk response must NOT expose vitals');
    }
  });

  it('2. GET /api/patients with X-User-Role: DOCTOR returns detailed clinical patient profiles', async () => {
    const res = await fetch(`${BASE_URL}/api/patients`, {
      headers: { 'x-user-role': 'DOCTOR' }
    });
    assert.strictEqual(res.status, 200);
    const data: any[] = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.length > 0);

    const first = data[0];
    assert.ok(first.name, 'Doctor response must include patient name');
    assert.ok(first.encounter, 'Doctor response must include encounter');
  });

  it('3. GET /api/patients/:id/clinical blocks KIOSK role with 403 Forbidden', async () => {
    // First get an ID
    const listRes = await fetch(`${BASE_URL}/api/patients`, { headers: { 'x-user-role': 'DOCTOR' } });
    const patients = await listRes.json();
    const patientId = patients[0]?.id;
    assert.ok(patientId, 'Must have a patient ID');

    // Attempt to access clinical record as KIOSK
    const forbiddenRes = await fetch(`${BASE_URL}/api/patients/${patientId}/clinical`, {
      headers: { 'x-user-role': 'KIOSK' }
    });
    assert.strictEqual(forbiddenRes.status, 403, 'KIOSK role must be blocked with 403 Forbidden');
    const errBody = await forbiddenRes.json();
    assert.ok(errBody.error.includes('Forbidden'), 'Error body must state Forbidden');
  });

  it('4. GET /api/patients/:id/clinical allows DOCTOR role with 200 OK', async () => {
    const listRes = await fetch(`${BASE_URL}/api/patients`, { headers: { 'x-user-role': 'DOCTOR' } });
    const patients = await listRes.json();
    const patientId = patients[0]?.id;

    const allowedRes = await fetch(`${BASE_URL}/api/patients/${patientId}/clinical`, {
      headers: { 'x-user-role': 'DOCTOR' }
    });
    assert.strictEqual(allowedRes.status, 200, 'DOCTOR role must be permitted with 200 OK');
    const body = await allowedRes.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.patient, 'Must return patient clinical record');
  });

  it('5. GET /api/audit-logs is restricted: DOCTOR gets 403 Forbidden, ADMIN gets 200 OK', async () => {
    const doctorAuditRes = await fetch(`${BASE_URL}/api/audit-logs`, {
      headers: { 'x-user-role': 'DOCTOR' }
    });
    assert.strictEqual(doctorAuditRes.status, 403, 'DOCTOR role cannot view audit logs');

    const adminAuditRes = await fetch(`${BASE_URL}/api/audit-logs`, {
      headers: { 'x-user-role': 'ADMIN' }
    });
    assert.strictEqual(adminAuditRes.status, 200, 'ADMIN role can view audit logs');
    const logsBody = await adminAuditRes.json();
    assert.strictEqual(logsBody.success, true);
    assert.ok(Array.isArray(logsBody.logs));
    assert.ok(logsBody.count >= 0);
  });

  it('6. POST /api/patients/:id/orders is guarded: KIOSK gets 403 Forbidden, DOCTOR gets 201 Created', async () => {
    const listRes = await fetch(`${BASE_URL}/api/patients`, { headers: { 'x-user-role': 'DOCTOR' } });
    const patients = await listRes.json();
    const patientId = patients[0]?.id;

    // KIOSK attempt
    const kioskOrderRes = await fetch(`${BASE_URL}/api/patients/${patientId}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'KIOSK' },
      body: JSON.stringify({ orders: [{ orderType: 'investigation', itemName: 'CBC' }] })
    });
    assert.strictEqual(kioskOrderRes.status, 403, 'KIOSK cannot create orders');

    // DOCTOR attempt
    const docOrderRes = await fetch(`${BASE_URL}/api/patients/${patientId}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'DOCTOR' },
      body: JSON.stringify({ orders: [{ orderType: 'investigation', itemName: 'CBC' }] })
    });
    assert.strictEqual(docOrderRes.status, 201, 'DOCTOR can create orders');
  });
});
