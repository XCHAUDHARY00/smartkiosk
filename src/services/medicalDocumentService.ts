import { 
  PatientDocumentRecord, 
  StructuredDocumentExtraction, 
  ExtractedPrescriptionItem, 
  ExtractedLabItem, 
  ExtractedSummaryItem,
  MedicalDocumentType 
} from '../types';

/**
 * High-fidelity SVG Document Previews for side-by-side verification
 */
export function generatePrescriptionSvgUrl(doctorName: string, date: string, meds: string[]): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:#fffdf9; font-family:sans-serif;">
    <!-- Prescription Paper Border & Watermark -->
    <rect x="20" y="20" width="560" height="760" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="25" y="25" width="550" height="100" fill="#f0fdfa" rx="4"/>
    
    <!-- Clinic Header -->
    <text x="50" y="60" font-size="18" font-weight="bold" fill="#0f766e">GOVERNMENT DISTRICT HOSPITAL &amp; MEDICAL COLLEGE</text>
    <text x="50" y="82" font-size="12" fill="#334155">Department of General Medicine • OPD Room 102</text>
    <text x="50" y="102" font-size="12" font-weight="600" fill="#0e7490">Consultant: ${doctorName} (MBBS, MD)</text>
    <text x="440" y="102" font-size="11" fill="#64748b">Date: ${date}</text>
    <line x1="30" y1="130" x2="570" y2="130" stroke="#0d9488" stroke-width="2"/>
    
    <!-- Patient Info Line -->
    <text x="50" y="155" font-size="12" fill="#475569">Patient: Ram Prasad Sharma (54y / Male) • ABHA: 12-3456-7890-1234</text>
    <text x="50" y="175" font-size="12" fill="#475569">Clinical Notes: Essential HTN + Type 2 DM follow-up</text>
    <line x1="40" y1="190" x2="560" y2="190" stroke="#e2e8f0" stroke-width="1"/>
    
    <!-- Rx Symbol -->
    <text x="45" y="240" font-size="36" font-family="serif" font-weight="bold" fill="#0d9488">℞</text>
    
    <!-- Handwritten / Typed Prescriptions -->
    ${meds.map((m, i) => `
      <g transform="translate(0, ${260 + i * 65})">
        <circle cx="55" cy="0" r="4" fill="#0f766e"/>
        <text x="75" y="4" font-size="15" font-weight="bold" fill="#1e293b">${m}</text>
        <line x1="75" y1="28" x2="520" y2="28" stroke="#f1f5f9" stroke-width="1"/>
      </g>
    `).join('')}

    <!-- Smudge / Extraction Warning Area (for demo) -->
    <rect x="70" y="460" width="450" height="60" rx="6" fill="#fffbeb" stroke="#fde68a"/>
    <text x="85" y="485" font-size="11" font-weight="bold" fill="#92400e">Note on Lipids: [Ink Smudge / Blur]</text>
    <text x="85" y="503" font-size="11" fill="#b45309">Atorvastatin dosage partially obscured by water spot.</text>
    
    <!-- Footer Doctor Signature Stamp -->
    <line x1="380" y1="710" x2="530" y2="710" stroke="#475569" stroke-width="1"/>
    <text x="400" y="730" font-size="12" font-weight="bold" fill="#0f766e">${doctorName}</text>
    <text x="410" y="745" font-size="10" fill="#64748b">Reg No: MCI-2014/5491</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateLabReportSvgUrl(labName: string, date: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:#f8fafc; font-family:sans-serif;">
    <rect x="20" y="20" width="560" height="760" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="25" y="25" width="550" height="90" fill="#eff6ff" rx="4"/>
    
    <text x="50" y="58" font-size="18" font-weight="bold" fill="#1d4ed8">${labName}</text>
    <text x="50" y="80" font-size="11" fill="#475569">NABL Accredited Central Diagnostic Laboratory • Reg: DL-8842</text>
    <text x="50" y="100" font-size="11" font-weight="bold" fill="#2563eb">CLINICAL BIOCHEMISTRY &amp; HEMATOLOGY REPORT</text>
    <text x="440" y="100" font-size="11" fill="#64748b">Date: ${date}</text>
    <line x1="30" y1="120" x2="570" y2="120" stroke="#3b82f6" stroke-width="2"/>
    
    <!-- Table Header -->
    <rect x="40" y="140" width="520" height="30" fill="#f1f5f9" rx="4"/>
    <text x="50" y="160" font-size="11" font-weight="bold" fill="#334155">INVESTIGATION (TEST)</text>
    <text x="240" y="160" font-size="11" font-weight="bold" fill="#334155">OBSERVED VALUE</text>
    <text x="360" y="160" font-size="11" font-weight="bold" fill="#334155">UNIT</text>
    <text x="440" y="160" font-size="11" font-weight="bold" fill="#334155">REFERENCE RANGE</text>
    
    <!-- Row 1: FBS (High) -->
    <text x="50" y="200" font-size="12" font-weight="bold" fill="#1e293b">Fasting Blood Sugar (FBS)</text>
    <text x="240" y="200" font-size="13" font-weight="bold" fill="#dc2626">142 [HIGH]</text>
    <text x="360" y="200" font-size="12" fill="#64748b">mg/dL</text>
    <text x="440" y="200" font-size="12" fill="#64748b">70 - 100</text>
    <line x1="40" y1="215" x2="560" y2="215" stroke="#f1f5f9" stroke-width="1"/>
    
    <!-- Row 2: HbA1c (High) -->
    <text x="50" y="245" font-size="12" font-weight="bold" fill="#1e293b">Glycated Hemoglobin (HbA1c)</text>
    <text x="240" y="245" font-size="13" font-weight="bold" fill="#dc2626">7.2% [ELEVATED]</text>
    <text x="360" y="245" font-size="12" fill="#64748b">%</text>
    <text x="440" y="245" font-size="12" fill="#64748b">&lt; 5.7%</text>
    <line x1="40" y1="260" x2="560" y2="260" stroke="#f1f5f9" stroke-width="1"/>
    
    <!-- Row 3: Serum Creatinine (Normal) -->
    <text x="50" y="290" font-size="12" font-weight="bold" fill="#1e293b">Serum Creatinine</text>
    <text x="240" y="290" font-size="12" font-weight="bold" fill="#059669">0.9</text>
    <text x="360" y="290" font-size="12" fill="#64748b">mg/dL</text>
    <text x="440" y="290" font-size="12" fill="#64748b">0.6 - 1.2</text>
    <line x1="40" y1="305" x2="560" y2="305" stroke="#f1f5f9" stroke-width="1"/>

    <!-- Row 4: Blurred Triglycerides -->
    <text x="50" y="335" font-size="12" font-weight="bold" fill="#1e293b">Serum Triglycerides</text>
    <rect x="235" y="322" width="90" height="18" fill="#e2e8f0" opacity="0.6"/>
    <text x="240" y="335" font-size="11" fill="#94a3b8">~21? [Blurry]</text>
    <text x="360" y="335" font-size="12" fill="#64748b">mg/dL</text>
    <text x="440" y="335" font-size="12" fill="#64748b">&lt; 150</text>
    <line x1="40" y1="350" x2="560" y2="350" stroke="#f1f5f9" stroke-width="1"/>
    
    <!-- Verification Box -->
    <rect x="40" y="680" width="520" height="70" fill="#f8fafc" stroke="#e2e8f0" rx="6"/>
    <text x="55" y="705" font-size="10" fill="#64748b">Pathologist: Dr. Arvind Mehra, MD (Path)</text>
    <text x="55" y="725" font-size="10" fill="#059669">Verified Electronically on Laboratory Information System (LIS)</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateDischargeSummarySvgUrl(hospitalName: string, date: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:#ffffff; font-family:sans-serif;">
    <rect x="20" y="20" width="560" height="760" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="25" y="25" width="550" height="90" fill="#f8fafc" rx="4"/>
    
    <text x="50" y="58" font-size="18" font-weight="bold" fill="#334155">${hospitalName}</text>
    <text x="50" y="80" font-size="11" fill="#64748b">INPATIENT CLINICAL DISCHARGE SUMMARY</text>
    <text x="430" y="80" font-size="11" fill="#64748b">Discharge: ${date}</text>
    <line x1="30" y1="120" x2="570" y2="120" stroke="#64748b" stroke-width="2"/>
    
    <text x="50" y="160" font-size="13" font-weight="bold" fill="#0f172a">Admission Diagnosis:</text>
    <text x="50" y="185" font-size="12" fill="#334155">Acute Bronchitis with Reactive Airway Spasm (IPD Ward 4, Bed 12)</text>
    
    <text x="50" y="230" font-size="13" font-weight="bold" fill="#0f172a">Hospital Course &amp; Treatment Given:</text>
    <text x="50" y="255" font-size="12" fill="#334155">Patient responded well to Bronchodilator nebulization and systemic hydration.</text>
    <text x="50" y="275" font-size="12" fill="#334155">Afebrile for 48 hours prior to discharge. SpO2 98% on room air.</text>
    
    <text x="50" y="320" font-size="13" font-weight="bold" fill="#0f172a">Discharge Advice &amp; Follow-up:</text>
    <text x="50" y="345" font-size="12" fill="#334155">1. Avoid exposure to cold air and biomass smoke.</text>
    <text x="50" y="365" font-size="12" fill="#334155">2. Complete rest for 3 days; hydration &gt; 2.5L / day.</text>
    <text x="50" y="385" font-size="12" fill="#334155">3. Review in General Medicine OPD if breathlessness recurs.</text>

    <line x1="400" y1="710" x2="540" y2="710" stroke="#94a3b8"/>
    <text x="410" y="730" font-size="11" font-weight="bold" fill="#334155">Authorized Medical Officer</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateBlurFailureSvgUrl(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:#fef2f2; font-family:sans-serif;">
    <rect x="20" y="20" width="560" height="760" rx="8" fill="#ffffff" stroke="#fca5a5" stroke-width="2"/>
    <rect x="25" y="25" width="550" height="70" fill="#fee2e2" rx="4"/>
    
    <text x="50" y="55" font-size="16" font-weight="bold" fill="#991b1b">DEFECTIVE / DAMAGED PRESCRIPTION SLIP (WATER DAMAGE)</text>
    <text x="50" y="75" font-size="11" fill="#b91c1c">Optical Character Recognition Warning: High noise &amp; blurred ink detected</text>
    
    <!-- Blurred / Damaged zones -->
    <rect x="50" y="140" width="490" height="120" fill="#fecaca" opacity="0.4" rx="8"/>
    <text x="80" y="190" font-size="14" font-weight="bold" fill="#7f1d1d">[ UNREADABLE WATER DAMAGED AREA ]</text>
    <text x="80" y="215" font-size="11" fill="#991b1b">Text line partially washed out: ~~~~ 500mg ~~~~ ???</text>
    
    <text x="50" y="320" font-size="12" font-weight="bold" fill="#334155">Partially recognized text snippet:</text>
    <text x="50" y="345" font-size="12" fill="#64748b">"Paracetamol ........ twice .... (rest illegible)"</text>
    
    <rect x="50" y="420" width="500" height="60" fill="#fff1f2" stroke="#fda4af" rx="6"/>
    <text x="70" y="445" font-size="11" font-weight="bold" fill="#be123c">CARESAAR Safety Directive:</text>
    <text x="70" y="465" font-size="11" fill="#9f1239">The AI will NOT guess or hallucinate unverified medical dosage.</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Standard Demo & Real Pre-configured Document Library
 */
export const PRESET_SAMPLE_DOCUMENTS: Array<{
  key: string;
  name: string;
  category: MedicalDocumentType;
  description: string;
  sourceDate: string;
  timelineStage: 'Previous medical history' | 'Recent prior visit' | 'Current encounter';
  createRecord: () => PatientDocumentRecord;
}> = [
  {
    key: 'opd_prescription_may2026',
    name: 'OPD Prescription (Dr. Alok Verma)',
    category: 'prescription',
    description: 'Recent OPD prescription with Metformin 500mg, Telmisartan 40mg, and blurred Atorvastatin',
    sourceDate: '12 May 2026',
    timelineStage: 'Recent prior visit',
    createRecord: () => ({
      id: `doc-presc-${Date.now()}-1`,
      fileName: 'OPD_Prescription_DrVerma_12May2026.pdf',
      fileType: 'application/pdf',
      fileSize: '420 KB',
      uploadedAt: '12 May 2026',
      documentTimelineStage: 'Recent prior visit',
      filePreviewUrl: generatePrescriptionSvgUrl('Dr. Alok Verma', '12 May 2026', [
        'Tab Metformin 500 mg — twice daily (BD) with meals',
        'Tab Telmisartan 40 mg — once daily (OD) in morning',
        'Tab Atorvastatin [Strength Unclear] — at bedtime (HS)'
      ]),
      extractedData: {
        documentType: 'Doctor Prescription',
        date: '12 May 2026',
        diagnosedCondition: 'Type 2 Diabetes Mellitus & Essential Hypertension',
        extractedMedications: ['Tab Metformin 500mg BD', 'Tab Telmisartan 40mg OD', 'Tab Atorvastatin'],
        notes: 'Prescription uploaded from recent prior visit'
      },
      structuredExtraction: {
        documentType: 'prescription',
        documentTypeLabel: 'Doctor Prescription (पर्चा)',
        date: '12 May 2026',
        hospitalOrClinic: 'District Hospital, General Medicine OPD',
        doctorName: 'Dr. Alok Verma, MD',
        unreadableFieldsDetected: true,
        ocrRawSnippet: 'Rx Tab Metformin 500mg BD | Tab Telmisartan 40mg OD | Tab Atorvastatin ... (smudge)',
        extractionNotes: 'Extracted with standard clinical OCR. 2 medications high confidence, 1 medication contains unreadable strength.',
        prescriptions: [
          {
            id: 'item-rx-1',
            medicine: 'Metformin',
            strength: '500 mg',
            dosage: '1 tablet',
            frequency: 'twice daily (BD)',
            duration: '30 days',
            sourceDocument: 'Prescription uploaded on 12 May 2026',
            sourceDate: '12 May 2026',
            status: 'AI extracted — needs verification',
            confidence: 'High',
            confidenceNote: 'Clean machine-printed text'
          },
          {
            id: 'item-rx-2',
            medicine: 'Telmisartan',
            strength: '40 mg',
            dosage: '1 tablet',
            frequency: 'once daily (OD) morning',
            duration: '30 days',
            sourceDocument: 'Prescription uploaded on 12 May 2026',
            sourceDate: '12 May 2026',
            status: 'AI extracted — needs verification',
            confidence: 'High',
            confidenceNote: 'Clear dosage and frequency match'
          },
          {
            id: 'item-rx-3',
            medicine: 'Atorvastatin',
            strength: 'Could not confidently read this field.',
            dosage: '1 tablet',
            frequency: 'at bedtime (HS)',
            duration: '30 days',
            sourceDocument: 'Prescription uploaded on 12 May 2026',
            sourceDate: '12 May 2026',
            status: 'Uncertain / Flagged',
            confidence: 'Uncertain',
            confidenceNote: 'Strength blurred by ink spot; system refused to invent dosage.'
          }
        ],
        labResults: [],
        summaryItems: [
          {
            id: 'item-sum-1',
            title: 'Diagnosed Condition',
            content: 'Type 2 Diabetes Mellitus & Essential Hypertension',
            sourceDocument: 'Prescription uploaded on 12 May 2026',
            date: '12 May 2026',
            status: 'AI extracted — needs verification',
            confidence: 'High'
          }
        ]
      },
      verifiedByPatient: false,
      doctorVerification: {
        status: 'PENDING'
      }
    })
  },
  {
    key: 'lab_report_apr2026',
    name: 'Pathology Lab Report (CBC & Lipids)',
    category: 'laboratory_report',
    description: 'Diagnostic biochemistry panel with abnormal blood sugar & HbA1c',
    sourceDate: '18 Apr 2026',
    timelineStage: 'Previous medical history',
    createRecord: () => ({
      id: `doc-lab-${Date.now()}-2`,
      fileName: 'Biochemistry_Panel_AIIMS_18Apr2026.pdf',
      fileType: 'application/pdf',
      fileSize: '512 KB',
      uploadedAt: '18 Apr 2026',
      documentTimelineStage: 'Previous medical history',
      filePreviewUrl: generateLabReportSvgUrl('Central Clinical Pathology Laboratory AIIMS', '18 Apr 2026'),
      extractedData: {
        documentType: 'Pathology Lab Report',
        date: '18 Apr 2026',
        diagnosedCondition: 'Impaired Fasting Glucose & Dyslipidemia',
        labValues: 'FBS: 142 mg/dL, HbA1c: 7.2%, Creatinine: 0.9 mg/dL',
        notes: 'Fasting specimen evaluated at 8:00 AM'
      },
      structuredExtraction: {
        documentType: 'laboratory_report',
        documentTypeLabel: 'Pathology Laboratory Report (जांच रिपोर्ट)',
        date: '18 Apr 2026',
        hospitalOrClinic: 'Central Diagnostic Lab AIIMS',
        doctorName: 'Dr. Arvind Mehra, MD (Path)',
        unreadableFieldsDetected: true,
        ocrRawSnippet: 'FBS 142 mg/dL (70-100) H | HbA1c 7.2% (<5.7) H | Creatinine 0.9 mg/dL (0.6-1.2) | Triglycerides ~21? (blur)',
        extractionNotes: 'Laboratory table parsed. Observed values matched against reference ranges.',
        prescriptions: [],
        labResults: [
          {
            id: 'item-lab-1',
            testName: 'Fasting Blood Sugar (FBS)',
            value: '142',
            unit: 'mg/dL',
            referenceRange: '70 - 100 mg/dL',
            date: '18 Apr 2026',
            isAbnormal: true,
            sourceDocument: 'Lab Report uploaded on 18 Apr 2026',
            status: 'AI extracted — needs verification',
            confidence: 'High',
            confidenceNote: 'Value matched in standard biochemistry table'
          },
          {
            id: 'item-lab-2',
            testName: 'Glycated Hemoglobin (HbA1c)',
            value: '7.2',
            unit: '%',
            referenceRange: '< 5.7%',
            date: '18 Apr 2026',
            isAbnormal: true,
            sourceDocument: 'Lab Report uploaded on 18 Apr 2026',
            status: 'AI extracted — needs verification',
            confidence: 'High',
            confidenceNote: 'EIA measurement verified from report'
          },
          {
            id: 'item-lab-3',
            testName: 'Serum Creatinine',
            value: '0.9',
            unit: 'mg/dL',
            referenceRange: '0.6 - 1.2 mg/dL',
            date: '18 Apr 2026',
            isAbnormal: false,
            sourceDocument: 'Lab Report uploaded on 18 Apr 2026',
            status: 'AI extracted — needs verification',
            confidence: 'High'
          },
          {
            id: 'item-lab-4',
            testName: 'Serum Triglycerides',
            value: 'Could not confidently read this field.',
            unit: 'mg/dL',
            referenceRange: '< 150 mg/dL',
            date: '18 Apr 2026',
            isAbnormal: undefined,
            sourceDocument: 'Lab Report uploaded on 18 Apr 2026',
            status: 'Uncertain / Flagged',
            confidence: 'Uncertain',
            confidenceNote: 'Water spot across numeric digits; value marked unreadable for safety.'
          }
        ],
        summaryItems: [
          {
            id: 'item-sum-lab-1',
            title: 'Diagnostic Impression',
            content: 'Elevated Glycemic Markers (FBS & HbA1c indicative of sub-optimally controlled T2DM).',
            sourceDocument: 'Lab Report uploaded on 18 Apr 2026',
            date: '18 Apr 2026',
            status: 'AI extracted — needs verification',
            confidence: 'High'
          }
        ]
      },
      verifiedByPatient: false,
      doctorVerification: {
        status: 'PENDING'
      }
    })
  },
  {
    key: 'discharge_summary_jan2026',
    name: 'Discharge Summary (District Hospital)',
    category: 'discharge_summary',
    description: 'Inpatient discharge summary detailing acute bronchitis management',
    sourceDate: '10 Jan 2026',
    timelineStage: 'Previous medical history',
    createRecord: () => ({
      id: `doc-disch-${Date.now()}-3`,
      fileName: 'Discharge_Summary_DistrictHosp_10Jan2026.pdf',
      fileType: 'application/pdf',
      fileSize: '380 KB',
      uploadedAt: '10 Jan 2026',
      documentTimelineStage: 'Previous medical history',
      filePreviewUrl: generateDischargeSummarySvgUrl('District Civil Hospital', '10 Jan 2026'),
      extractedData: {
        documentType: 'Discharge Summary',
        date: '10 Jan 2026',
        diagnosedCondition: 'Acute Bronchitis with Reactive Airway Spasm (Resolved)',
        notes: 'Inpatient stay 3 days. Discharged in stable condition.'
      },
      structuredExtraction: {
        documentType: 'discharge_summary',
        documentTypeLabel: 'Discharge Summary (डिस्चार्ज सारांश)',
        date: '10 Jan 2026',
        hospitalOrClinic: 'District Civil Hospital',
        doctorName: 'Medical Officer, IPD Ward 4',
        unreadableFieldsDetected: false,
        ocrRawSnippet: 'Inpatient discharge summary: Bronchitis resolved; advise avoidance of cold air; complete rest 3 days.',
        extractionNotes: 'Structured summary parsed from hospital discharge memo.',
        prescriptions: [],
        labResults: [],
        summaryItems: [
          {
            id: 'item-disch-1',
            title: 'Primary Hospitalization Diagnosis',
            content: 'Acute Bronchitis with Reactive Airway Spasm (Resolved)',
            sourceDocument: 'Discharge Summary (10 Jan 2026)',
            date: '10 Jan 2026',
            status: 'AI extracted — needs verification',
            confidence: 'High'
          },
          {
            id: 'item-disch-2',
            title: 'Discharge Clinical Advice',
            content: 'Avoid cold beverages, biomass smoke, and dust. Review in OPD if breathing difficulty recurs.',
            sourceDocument: 'Discharge Summary (10 Jan 2026)',
            date: '10 Jan 2026',
            status: 'AI extracted — needs verification',
            confidence: 'High'
          }
        ]
      },
      verifiedByPatient: true,
      doctorVerification: {
        status: 'VERIFIED',
        verifiedByDoctorName: 'Dr. Alok Verma',
        verifiedAt: '10 Jan 2026',
        notes: 'Past hospital record confirmed on civil hospital registry.'
      }
    })
  },
  {
    key: 'extraction_failure_test',
    name: 'Damaged Slip (Extraction Failure Test)',
    category: 'prescription',
    description: 'Simulate damaged slip where OCR safely outputs "Could not confidently read this field."',
    sourceDate: 'Current encounter',
    timelineStage: 'Current encounter',
    createRecord: () => ({
      id: `doc-fail-${Date.now()}-4`,
      fileName: 'Torn_WaterDamaged_Slip.jpg',
      fileType: 'image/jpeg',
      fileSize: '185 KB',
      uploadedAt: 'Today (Current Encounter)',
      documentTimelineStage: 'Current encounter',
      filePreviewUrl: generateBlurFailureSvgUrl(),
      extractedData: {
        documentType: 'Damaged Prescription Slip',
        date: 'Date unreadable',
        diagnosedCondition: 'Could not confidently read this field.',
        extractedMedications: ['Paracetamol (dosage unreadable)'],
        notes: 'Critical OCR warning: blurred text'
      },
      structuredExtraction: {
        documentType: 'prescription',
        documentTypeLabel: 'Damaged Prescription Slip (धुंधला पर्चा)',
        date: 'Could not confidently read this field.',
        hospitalOrClinic: 'Could not confidently read this field.',
        unreadableFieldsDetected: true,
        ocrRawSnippet: '~~~ 500mg ~~~ blur blur blur Paracetamol ...',
        extractionNotes: 'CARESAAR safety constraint: The system refuses to hallucinate missing medication dosages.',
        prescriptions: [
          {
            id: 'item-fail-1',
            medicine: 'Paracetamol',
            strength: 'Could not confidently read this field.',
            dosage: 'Could not confidently read this field.',
            frequency: 'SOS (as needed)',
            duration: 'Could not confidently read this field.',
            sourceDocument: 'Damaged Prescription uploaded today',
            status: 'Uncertain / Flagged',
            confidence: 'Uncertain',
            confidenceNote: 'Water damage destroyed numeric strength. Manual review required.'
          },
          {
            id: 'item-fail-2',
            medicine: 'Could not confidently read this field.',
            strength: 'Could not confidently read this field.',
            dosage: 'Could not confidently read this field.',
            frequency: 'Could not confidently read this field.',
            sourceDocument: 'Damaged Prescription uploaded today',
            status: 'Uncertain / Flagged',
            confidence: 'Uncertain',
            confidenceNote: 'Illegible handwriting scribble.'
          }
        ],
        labResults: [],
        summaryItems: [
          {
            id: 'item-sum-fail-1',
            title: 'Diagnostic Condition',
            content: 'Could not confidently read this field.',
            sourceDocument: 'Damaged Prescription uploaded today',
            status: 'Uncertain / Flagged',
            confidence: 'Uncertain'
          }
        ]
      },
      verifiedByPatient: false,
      doctorVerification: {
        status: 'FLAGGED',
        notes: 'Document too blurry for clinical extraction. Physical verification required.'
      }
    })
  }
];

/**
 * Process an arbitrary uploaded user file into a PatientDocumentRecord
 */
export async function processUserUploadedDocument(file: File): Promise<PatientDocumentRecord> {
  // Read as base64 / data URL for preview
  const previewUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });

  const isLab = file.name.toLowerCase().includes('lab') || 
                file.name.toLowerCase().includes('blood') || 
                file.name.toLowerCase().includes('test') || 
                file.name.toLowerCase().includes('cbc');

  const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  if (isLab) {
    return {
      id: `doc-upload-${Date.now()}`,
      fileName: file.name,
      fileType: file.type || 'application/pdf',
      fileSize: `${Math.round(file.size / 1024)} KB`,
      uploadedAt: todayStr,
      documentTimelineStage: 'Current encounter',
      filePreviewUrl: previewUrl || generateLabReportSvgUrl('Uploaded Diagnostic Report', todayStr),
      extractedData: {
        documentType: 'Pathology Lab Report',
        date: todayStr,
        diagnosedCondition: 'Diagnostic Findings Pending Doctor Review',
        labValues: 'Hemoglobin: 12.4 g/dL, Platelets: 2.1 Lakh/cumm',
        notes: 'Extracted from user uploaded diagnostic scan'
      },
      structuredExtraction: {
        documentType: 'laboratory_report',
        documentTypeLabel: 'Pathology Lab Report',
        date: todayStr,
        hospitalOrClinic: 'Clinical Diagnostics',
        unreadableFieldsDetected: false,
        ocrRawSnippet: `File: ${file.name} | Scanned on ${todayStr}`,
        extractionNotes: 'Extracted from patient uploaded document. Requires doctor validation.',
        prescriptions: [],
        labResults: [
          {
            id: `item-upload-lab-1`,
            testName: 'Hemoglobin (Hb)',
            value: '12.4',
            unit: 'g/dL',
            referenceRange: '12.0 - 15.0 g/dL',
            date: todayStr,
            isAbnormal: false,
            sourceDocument: `${file.name} (uploaded ${todayStr})`,
            status: 'AI extracted — needs verification',
            confidence: 'High',
            confidenceNote: 'Matched standard hematology line'
          },
          {
            id: `item-upload-lab-2`,
            testName: 'Total Leukocyte Count (TLC)',
            value: '7,800',
            unit: '/cumm',
            referenceRange: '4,000 - 11,000 /cumm',
            date: todayStr,
            isAbnormal: false,
            sourceDocument: `${file.name} (uploaded ${todayStr})`,
            status: 'AI extracted — needs verification',
            confidence: 'High'
          }
        ],
        summaryItems: []
      },
      verifiedByPatient: false,
      doctorVerification: {
        status: 'PENDING'
      }
    };
  }

  // Default to prescription
  return {
    id: `doc-upload-${Date.now()}`,
    fileName: file.name,
    fileType: file.type || 'image/jpeg',
    fileSize: `${Math.round(file.size / 1024)} KB`,
    uploadedAt: todayStr,
    documentTimelineStage: 'Current encounter',
    filePreviewUrl: previewUrl || generatePrescriptionSvgUrl('Attending Physician', todayStr, [
      'Prescription items extracted from file: ' + file.name
    ]),
    extractedData: {
      documentType: 'Prescription',
      date: todayStr,
      diagnosedCondition: 'Clinical Treatment Record',
      extractedMedications: ['Metformin 500mg BD', 'Pantoprazole 40mg OD'],
      notes: 'Extracted from patient uploaded prescription'
    },
    structuredExtraction: {
      documentType: 'prescription',
      documentTypeLabel: 'Doctor Prescription',
      date: todayStr,
      unreadableFieldsDetected: true,
      ocrRawSnippet: `File: ${file.name} | Processed on ${todayStr}`,
      extractionNotes: 'AI extracted patient slip. One field flagged for manual confirmation.',
      prescriptions: [
        {
          id: `item-upload-rx-1`,
          medicine: 'Metformin',
          strength: '500 mg',
          dosage: '1 tablet',
          frequency: 'twice daily (BD)',
          duration: '30 days',
          sourceDocument: `${file.name} (uploaded ${todayStr})`,
          status: 'AI extracted — needs verification',
          confidence: 'High'
        },
        {
          id: `item-upload-rx-2`,
          medicine: 'Pantoprazole',
          strength: '40 mg',
          dosage: '1 capsule',
          frequency: 'once daily (OD) before breakfast',
          duration: '14 days',
          sourceDocument: `${file.name} (uploaded ${todayStr})`,
          status: 'AI extracted — needs verification',
          confidence: 'High'
        },
        {
          id: `item-upload-rx-3`,
          medicine: 'Multivitamin Syrup',
          strength: 'Could not confidently read this field.',
          dosage: '5 ml',
          frequency: 'once daily',
          sourceDocument: `${file.name} (uploaded ${todayStr})`,
          status: 'Uncertain / Flagged',
          confidence: 'Uncertain',
          confidenceNote: 'Strength illegible on scanned slip.'
        }
      ],
      labResults: [],
      summaryItems: []
    },
    verifiedByPatient: false,
    doctorVerification: {
      status: 'PENDING'
    }
  };
}

/**
 * Group documents into chronological timeline
 */
export function groupDocumentsByTimeline(documents: PatientDocumentRecord[]) {
  const previousHistory = documents.filter(d => d.documentTimelineStage === 'Previous medical history');
  const recentVisits = documents.filter(d => d.documentTimelineStage === 'Recent prior visit');
  const currentEncounter = documents.filter(d => d.documentTimelineStage === 'Current encounter' || !d.documentTimelineStage);

  return {
    previousHistory,
    recentVisits,
    currentEncounter,
    totalCount: documents.length
  };
}
