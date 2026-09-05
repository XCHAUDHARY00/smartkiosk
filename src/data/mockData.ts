import { PatientProfile, ClinicalSummary, HospitalServiceOrder } from '../types';
import { PRESET_SAMPLE_DOCUMENTS } from '../services/medicalDocumentService';

export const INITIAL_PATIENTS: PatientProfile[] = [
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
    vitals: {
      bloodPressure: '138/88 mmHg',
      pulse: 78,
      spo2: 98,
      temperature: 98.4,
      weight: 72,
      bloodSugar: 164
    },
    documents: [
      PRESET_SAMPLE_DOCUMENTS[0].createRecord(),
      PRESET_SAMPLE_DOCUMENTS[1].createRecord(),
      PRESET_SAMPLE_DOCUMENTS[2].createRecord()
    ],
    pastVisits: [
      {
        date: '14 May 2026',
        department: 'General Medicine',
        doctorName: 'Dr. Alok Verma',
        diagnosis: 'Type 2 Diabetes Mellitus & Essential Hypertension',
        prescriptions: ['Tab Metformin 500mg BD', 'Tab Telmisartan 40mg OD'],
        testsOrdered: ['HbA1c', 'Lipid Profile', 'Serum Creatinine'],
        notes: 'Advised lifestyle modification, low carbohydrate and low salt diet.'
      },
      {
        date: '10 Feb 2026',
        department: 'General Medicine',
        doctorName: 'Dr. Sneha Roy',
        diagnosis: 'Acute Gastritis & Viral Pharyngitis',
        prescriptions: ['Cap Pantoprazole 40mg OD', 'Tab Paracetamol 650mg SOS'],
        testsOrdered: ['CBC'],
        notes: 'Symptoms resolved in 4 days.'
      }
    ],
    chiefComplaintTranscript: 'पिछले 4 दिनों से सीने में भारीपन और हल्का चक्कर आ रहा है, विशेष रूप से सुबह के समय।',
    chiefComplaintHindi: 'सीने में भारीपन और चक्कर (Chest Heaviness & Dizziness)'
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
    vitals: {
      bloodPressure: '120/78 mmHg',
      pulse: 84,
      spo2: 95,
      temperature: 99.8,
      weight: 58
    },
    pastVisits: [
      {
        date: '22 Jan 2026',
        department: 'Pulmonology',
        doctorName: 'Dr. R. K. Gupta',
        diagnosis: 'Allergic Bronchial Asthma',
        prescriptions: ['Inhaler Budecort 200mcg', 'Tab Montelukast 10mg HS'],
        testsOrdered: ['Spirometry', 'Digital Chest X-Ray'],
        notes: 'Advised avoiding smoke exposure and dust allergens.'
      }
    ],
    chiefComplaintTranscript: '2 हफ्ते से लगातार सूखी खांसी आ रही है और रात को सांस लेने में सीटी जैसी आवाज आती है।',
    chiefComplaintHindi: 'लगातार खांसी और सांस फूलना (Persistent Cough & Wheezing)'
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
    vitals: {
      bloodPressure: '112/74 mmHg',
      pulse: 104,
      spo2: 99,
      temperature: 102.2,
      weight: 65
    },
    pastVisits: [],
    chiefComplaintTranscript: '3 दिनों से तेज बुखार, बदन दर्द और आंखों के पीछे तेज सिरदर्द है। ठंड लगकर बुखार आता है।',
    chiefComplaintHindi: 'तेज बुखार, बदन दर्द और सिरदर्द (High Fever & Body Ache)'
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
    vitals: {
      bloodPressure: '130/84 mmHg',
      pulse: 74,
      spo2: 97,
      temperature: 98.6,
      weight: 76
    },
    pastVisits: [
      {
        date: '05 Dec 2025',
        department: 'Orthopedics',
        doctorName: 'Dr. Vikram Sethi',
        diagnosis: 'Bilateral Knee Osteoarthritis Grade II',
        prescriptions: ['Tab Aceclofenac + Paracetamol BD', 'Calcium + Vitamin D3 OD'],
        testsOrdered: ['X-Ray Both Knees AP/Lateral'],
        notes: 'Advised quadriceps exercises and weight management.'
      }
    ],
    chiefComplaintTranscript: 'दोनों घुटनों में बहुत दर्द रहता है, सीढ़ियां चढ़ने-उतरने में असहनीय परेशानी होती है।',
    chiefComplaintHindi: 'घुटनों में दर्द और अकड़न (Bilateral Knee Joint Pain)'
  }
];

export const INITIAL_CLINICAL_SUMMARIES: Record<string, ClinicalSummary> = {
  'p-101': {
    id: 'sum_p-101',
    patientId: 'p-101',
    tokenNumber: 'A-101',
    chiefComplaint: 'Chest heaviness and morning dizziness for 4 days',
    historyOfPresentIllness: '54-year-old male with established T2D and Hypertension presenting with subacute retrosternal heaviness exacerbated on mild exertion, associated with transient postural lightheadedness.',
    socrates: {
      site: 'Retrosternal chest & central precordium',
      onset: '4 days ago, worsening over past 24 hours',
      character: 'Dull pressure / heaviness without sharp tearing sensation',
      radiation: 'Non-radiating to left arm or jaw',
      associations: 'Postural dizziness, mild diaphoresis',
      timeCourse: 'Intermittent episodes lasting 15-20 minutes',
      exacerbatingRelieving: 'Aggravated by stairs, relieved slightly by rest',
      severity: '6 / 10 intensity'
    },
    differentialDiagnosis: [
      { condition: 'Atypical Angina / Coronary Artery Disease', probability: 'High', reasoning: 'Known diabetic male >50 presenting with exertional chest heaviness.' },
      { condition: 'Uncontrolled Hypertension with End-Organ Stress', probability: 'Medium', reasoning: 'Elevated BP reading 138/88 with postural symptoms.' },
      { condition: 'GERD / Reflux Esophagitis', probability: 'Low', reasoning: 'Can mimic retrosternal fullness but doesn’t explain exertional component.' }
    ],
    recommendedLabInvestigations: [
      '12-Lead ECG',
      'Blood Test (CBC)',
      'Blood Sugar (FBS/PPBS)',
      'Troponin I (Cardio Marker)',
      'Lipid Profile'
    ],
    doctorOrderedTests: [
      '12-Lead ECG',
      'Blood Test (CBC)',
      'Blood Sugar (FBS/PPBS)'
    ],
    isDoctorConsultationDone: false,
    doctorConsultationNotes: '',
    urgencyScore: 'URGENT',
    medications: [
      { name: 'Tab Sorbitrate 5mg', dosage: '5mg', frequency: 'Sublingual SOS', duration: 'SOS' },
      { name: 'Tab Aspirin 75mg', dosage: '75mg', frequency: 'OD Post Lunch', duration: '14 Days' },
      { name: 'Tab Pantoprazole 40mg', dosage: '40mg', frequency: 'OD Empty Stomach', duration: '14 Days' }
    ],
    generatedAt: '08:35 AM'
  }
};

export const BASE_HOSPITAL_SERVICES: Record<string, HospitalServiceOrder> = {
  doctor_consultation: {
    id: 'srv-doc-102',
    name: 'OPD Doctor Consultation (डॉक्टर परामर्श)',
    category: 'doctor_consultation',
    department: 'General Medicine',
    roomNumber: 'Cabin 102',
    floor: 'Ground Floor',
    block: 'Block A (Main OPD)',
    currentQueueCount: 3,
    estimatedWaitMin: 8,
    estimatedProcedureMin: 10,
    instructions: 'Please have your OPD Token ready and report to Cabin 102.',
    landmark: 'Opposite Main OPD Reception Desk'
  },
  lab_blood: {
    id: 'srv-path-01',
    name: 'Pathology & Blood Collection (पैथोलॉजी - रक्त जांच)',
    category: 'lab',
    department: 'Central Pathology Laboratory',
    roomNumber: 'Room 12',
    floor: 'Ground Floor',
    block: 'Block B (Diagnostic Wing)',
    currentQueueCount: 7,
    estimatedWaitMin: 14,
    estimatedProcedureMin: 5,
    instructions: 'Show your investigation prescription at Token Counter 1 before sample collection.',
    landmark: 'Turn left past Hospital Canteen',
    prerequisites: ['Fasting required if FBS ordered']
  },
  radiology_xray: {
    id: 'srv-rad-01',
    name: 'Digital Chest X-Ray (डिजिटल एक्सरे)',
    category: 'radiology',
    department: 'Radiology Department',
    roomNumber: 'Room 104',
    floor: '1st Floor',
    block: 'Block A',
    currentQueueCount: 4,
    estimatedWaitMin: 9,
    estimatedProcedureMin: 6,
    instructions: 'Remove metallic ornaments and wear hospital gown if instructed.',
    landmark: 'Take Lift 2 to 1st Floor, next to Ultrasound Bay'
  },
  ecg: {
    id: 'srv-ecg-01',
    name: '12-Lead ECG Bay (ईसीजी जांच)',
    category: 'lab',
    department: 'Cardiology Diagnostics',
    roomNumber: 'Room 08',
    floor: 'Ground Floor',
    block: 'Block A',
    currentQueueCount: 2,
    estimatedWaitMin: 5,
    estimatedProcedureMin: 7,
    instructions: 'Relax and lie flat quietly on the examination bed.',
    landmark: 'Adjacent to Emergency Triage Counter'
  },
  usg: {
    id: 'srv-usg-01',
    name: 'Ultrasound Scan (सोनोग्राफी / USG)',
    category: 'radiology',
    department: 'Radiology Ultrasound Wing',
    roomNumber: 'Room 106',
    floor: '1st Floor',
    block: 'Block A',
    currentQueueCount: 8,
    estimatedWaitMin: 22,
    estimatedProcedureMin: 15,
    instructions: 'Drink 1 litre water 45 mins prior to scan. Do not void bladder.',
    landmark: 'Opposite Radiology Waiting Hall',
    prerequisites: ['Full bladder required']
  },
  report_collection: {
    id: 'srv-rep-01',
    name: 'Diagnostic Report Counter (जांच रिपोर्ट काउंटर)',
    category: 'billing_token',
    department: 'Central Records & Reports',
    roomNumber: 'Counter 4',
    floor: 'Ground Floor',
    block: 'Block B',
    currentQueueCount: 2,
    estimatedWaitMin: 4,
    estimatedProcedureMin: 2,
    instructions: 'Provide barcode slip or ABHA card to collect printed report copy.',
    landmark: 'Near Exit Gate Block B'
  },
  opd_review: {
    id: 'srv-rev-01',
    name: 'Doctor OPD Report Review (डॉक्टर समीक्षा)',
    category: 'opd_review',
    department: 'General Medicine',
    roomNumber: 'Cabin 102',
    floor: 'Ground Floor',
    block: 'Block A',
    currentQueueCount: 3,
    estimatedWaitMin: 7,
    estimatedProcedureMin: 8,
    instructions: 'Present your completed lab reports to the OPD doctor for final Rx prescription.',
    landmark: 'Cabin 102'
  },
  pharmacy: {
    id: 'srv-pharma-01',
    name: 'Jan Aushadhi Kendra Pharmacy (दवा वितरण काउंटर)',
    category: 'pharmacy',
    department: 'Hospital Central Dispensary',
    roomNumber: 'Counter 4 & 5',
    floor: 'Ground Floor',
    block: 'Block A (Near Main Exit)',
    currentQueueCount: 6,
    estimatedWaitMin: 10,
    estimatedProcedureMin: 4,
    instructions: 'Present doctor prescription for subsidized generic medicine dispensing.',
    landmark: 'Near Hospital Main Exit Gate'
  }
};

export const SAMPLE_PAST_VISITS = INITIAL_PATIENTS[0].pastVisits || [];
export { DEPARTMENTS } from '../components/kiosk/steps/DepartmentStep';
