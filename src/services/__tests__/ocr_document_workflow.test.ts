import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRESET_SAMPLE_DOCUMENTS,
  groupDocumentsByTimeline
} from '../medicalDocumentService.js';
import { PatientDocumentRecord } from '../../types.js';

describe('OCR & Medical Document Structuring Workflow', () => {
  it('1. Supports all 4 clinical document classes: prescription, lab report, consultation summary, discharge summary', () => {
    const categories = PRESET_SAMPLE_DOCUMENTS.map(d => d.category);
    assert.ok(categories.includes('prescription'), 'Prescriptions must be supported');
    assert.ok(categories.includes('laboratory_report'), 'Laboratory reports must be supported');
    assert.ok(categories.includes('consultation_summary'), 'Consultation summaries must be supported');
    assert.ok(categories.includes('discharge_summary'), 'Discharge summaries must be supported');
  });

  it('2. Prescription Extraction: captures medicine, strength, dosage, frequency, duration, and provenance', () => {
    const prescPreset = PRESET_SAMPLE_DOCUMENTS.find(d => d.key === 'opd_prescription_may2026');
    assert.ok(prescPreset, 'Prescription preset should exist');

    const record = prescPreset.createRecord();
    assert.ok(record.structuredExtraction, 'structuredExtraction must be defined');
    const rxItems = record.structuredExtraction.prescriptions;
    assert.ok(rxItems.length >= 2, 'Should extract at least 2 medication items');

    const metformin = rxItems.find(m => m.medicine.toLowerCase().includes('metformin'));
    assert.ok(metformin, 'Metformin item must be extracted');
    assert.strictEqual(metformin.strength, '500 mg');
    assert.strictEqual(metformin.frequency, 'twice daily (BD)');
    assert.strictEqual(metformin.sourceDocument, 'Prescription uploaded on 12 May 2026');
    assert.strictEqual(metformin.status, 'AI extracted — needs verification');
    assert.strictEqual(metformin.confidence, 'High');

    const telmisartan = rxItems.find(m => m.medicine.toLowerCase().includes('telmisartan'));
    assert.ok(telmisartan, 'Telmisartan item must be extracted');
    assert.strictEqual(telmisartan.strength, '40 mg');
    assert.strictEqual(telmisartan.frequency, 'once daily (OD) morning');
  });

  it('3. Laboratory Report Extraction: captures test name, value, unit, reference range, date, and abnormal flags', () => {
    const labPreset = PRESET_SAMPLE_DOCUMENTS.find(d => d.key === 'lab_report_apr2026');
    assert.ok(labPreset, 'Lab report preset should exist');

    const record = labPreset.createRecord();
    assert.ok(record.structuredExtraction, 'structuredExtraction must be defined');
    const labs = record.structuredExtraction.labResults;
    assert.ok(labs.length >= 3, 'Should extract at least 3 lab tests');

    const fbs = labs.find(l => l.testName.includes('FBS'));
    assert.ok(fbs, 'FBS test must be extracted');
    assert.strictEqual(fbs.value, '142');
    assert.strictEqual(fbs.unit, 'mg/dL');
    assert.strictEqual(fbs.referenceRange, '70 - 100 mg/dL');
    assert.strictEqual(fbs.isAbnormal, true);
    assert.strictEqual(fbs.status, 'AI extracted — needs verification');
    assert.strictEqual(fbs.sourceDocument, 'Lab Report uploaded on 18 Apr 2026');

    const hba1c = labs.find(l => l.testName.includes('HbA1c'));
    assert.ok(hba1c, 'HbA1c test must be extracted');
    assert.strictEqual(hba1c.value, '7.2');
    assert.strictEqual(hba1c.unit, '%');
    assert.strictEqual(hba1c.isAbnormal, true);

    const creatinine = labs.find(l => l.testName.includes('Creatinine'));
    assert.ok(creatinine, 'Creatinine test must be extracted');
    assert.strictEqual(creatinine.value, '0.9');
    assert.strictEqual(creatinine.isAbnormal, false);
  });

  it('4. Anti-Hallucination Guardrail: Unreadable handwriting/damaged field outputs "Could not confidently read this field."', () => {
    const failurePreset = PRESET_SAMPLE_DOCUMENTS.find(d => d.key === 'extraction_failure_test');
    assert.ok(failurePreset, 'Failure test preset should exist');

    const record = failurePreset.createRecord();
    assert.ok(record.structuredExtraction);
    assert.strictEqual(record.structuredExtraction.unreadableFieldsDetected, true);

    const rxItems = record.structuredExtraction.prescriptions;
    const paracetamol = rxItems.find(m => m.medicine === 'Paracetamol');
    assert.ok(paracetamol, 'Paracetamol item present');

    // System MUST NOT invent missing strength
    assert.strictEqual(paracetamol.strength, 'Could not confidently read this field.');
    assert.strictEqual(paracetamol.status, 'Uncertain / Flagged');
    assert.strictEqual(paracetamol.confidence, 'Uncertain');

    // Fully damaged line item
    const damagedItem = rxItems.find(m => m.id === 'item-fail-2');
    assert.ok(damagedItem, 'Damaged item present');
    assert.strictEqual(damagedItem.medicine, 'Could not confidently read this field.');
    assert.strictEqual(damagedItem.strength, 'Could not confidently read this field.');
    assert.strictEqual(damagedItem.dosage, 'Could not confidently read this field.');

    // Partial blur on lab report (Triglycerides in lab report preset)
    const labPreset = PRESET_SAMPLE_DOCUMENTS.find(d => d.key === 'lab_report_apr2026')!;
    const labRecord = labPreset.createRecord();
    assert.ok(labRecord.structuredExtraction);
    const triglycerides = labRecord.structuredExtraction.labResults.find(l => l.testName.includes('Triglycerides'));
    assert.ok(triglycerides);
    assert.strictEqual(triglycerides.value, 'Could not confidently read this field.');
    assert.strictEqual(triglycerides.confidence, 'Uncertain');
  });

  it('5. Chronological Document Timeline: correctly segregates history, prior visits, and current encounter', () => {
    const records: PatientDocumentRecord[] = PRESET_SAMPLE_DOCUMENTS.map(p => p.createRecord());
    const timeline = groupDocumentsByTimeline(records);

    assert.strictEqual(timeline.totalCount, records.length);
    assert.ok(timeline.previousHistory.length > 0, 'Previous history should contain records');
    assert.ok(timeline.recentVisits.length > 0, 'Recent prior visits should contain records');
    assert.ok(timeline.currentEncounter.length > 0, 'Current encounter should contain records');

    timeline.previousHistory.forEach(d => {
      assert.strictEqual(d.documentTimelineStage, 'Previous medical history');
    });
    timeline.recentVisits.forEach(d => {
      assert.strictEqual(d.documentTimelineStage, 'Recent prior visit');
    });
  });

  it('6. Verification Life Cycle: Newly uploaded document starts as PENDING and requires doctor verification', () => {
    const prescPreset = PRESET_SAMPLE_DOCUMENTS.find(d => d.key === 'opd_prescription_may2026')!;
    const record = prescPreset.createRecord();
    assert.ok(record.doctorVerification);

    assert.strictEqual(record.doctorVerification.status, 'PENDING');
    assert.strictEqual(record.verifiedByPatient, false);

    // Simulate doctor verification action
    record.doctorVerification = {
      status: 'VERIFIED',
      verifiedByDoctorName: 'Dr. Vivek Sengupta',
      verifiedAt: new Date().toISOString(),
      notes: 'Reviewed original paper slip. Metformin 500mg and Telmisartan 40mg confirmed.'
    };

    assert.strictEqual(record.doctorVerification.status, 'VERIFIED');
    assert.strictEqual(record.doctorVerification.verifiedByDoctorName, 'Dr. Vivek Sengupta');
  });
});
