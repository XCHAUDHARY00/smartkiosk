import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const PORT = 3000;

// In-memory persistent database of patients and visits
interface PastVisit {
  date: string;
  department: string;
  doctorName: string;
  diagnosis: string;
  prescriptions: string[];
  testsOrdered: string[];
  notes?: string;
}

interface PatientRecord {
  id: string;
  tokenNumber: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  abhaId?: string;
  language: string;
  department: string;
  assignedCabin: string;
  registeredAt: string;
  status: string;
  vitals?: {
    bloodPressure?: string;
    pulse?: number;
    spo2?: number;
    temperature?: number;
    weight?: number;
    bloodSugar?: number;
  };
  pastVisits?: PastVisit[];
  chiefComplaintTranscript?: string;
}

const PATIENTS_DB: PatientRecord[] = [
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
      bloodSugar: 164
    },
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
    chiefComplaintTranscript: 'पिछले 4 दिनों से सीने में भारीपन और हल्का चक्कर आ रहा है, विशेष रूप से सुबह के समय।'
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
      temperature: 99.8
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
    chiefComplaintTranscript: '2 हफ्ते से लगातार सूखी खांसी आ रही है और रात को सांस लेने में सीटी जैसी आवाज आती है।'
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
      temperature: 102.2
    },
    pastVisits: [],
    chiefComplaintTranscript: '3 दिनों से तेज बुखार, बदन दर्द और आंखों के पीछे तेज सिरदर्द है। ठंड लगकर बुखार आता है।'
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
      temperature: 98.6
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
    chiefComplaintTranscript: 'दोनों घुटनों में बहुत दर्द रहता है, सीढ़ियां चढ़ने-उतरने में असहनीय परेशानी होती है।'
  }
];

// Lazy Gemini SDK client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Set explicit JSON Content-Type headers for all /api endpoints
  app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Patient lookup endpoint (by query param q: phone, abha, id, name)
  // Directly resolves "Error looking up patient from DB"
  app.get('/api/patients/lookup', (req, res) => {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.json({ found: false, patient: null, message: 'No query provided' });
    }

    const cleanQ = q.replace(/\D/g, '');
    const found = PATIENTS_DB.find(p => {
      if (p.phone === q || (cleanQ.length >= 7 && p.phone.includes(cleanQ))) return true;
      if (p.abhaId && p.abhaId.replace(/\D/g, '').includes(cleanQ)) return true;
      if (p.id.toLowerCase() === q.toLowerCase()) return true;
      if (p.name.toLowerCase().includes(q.toLowerCase())) return true;
      return false;
    });

    if (found) {
      return res.json({ found: true, patient: found, allMatches: [found] });
    }

    return res.json({ found: false, patient: null });
  });

  // Patient history by phone endpoint
  // Directly resolves "Error fetching patient history by phone from server"
  app.get('/api/patient-history', (req, res) => {
    const phone = String(req.query.phone || '').trim();
    const cleanPhone = phone.replace(/\D/g, '');

    if (!cleanPhone && !phone) {
      return res.json({ success: true, history: [] });
    }

    const found = PATIENTS_DB.find(p => 
      p.phone === phone || (cleanPhone.length >= 7 && p.phone.replace(/\D/g, '').includes(cleanPhone))
    );

    if (found && found.pastVisits) {
      return res.json({ success: true, history: found.pastVisits, patientId: found.id });
    }

    return res.json({ success: true, history: [] });
  });

  // Patient history by phone URL param route
  app.get('/api/patients/phone/:phone', (req, res) => {
    const phone = req.params.phone.trim();
    const cleanPhone = phone.replace(/\D/g, '');

    const found = PATIENTS_DB.find(p => 
      p.phone === phone || (cleanPhone.length >= 7 && p.phone.replace(/\D/g, '').includes(cleanPhone))
    );

    if (found) {
      return res.json({ found: true, patient: found, history: found.pastVisits || [] });
    }

    return res.json({ found: false, patient: null, history: [] });
  });

  // Get all patients
  app.get('/api/patients', (req, res) => {
    res.json(PATIENTS_DB);
  });

  // Get single patient by ID
  app.get('/api/patients/:id', (req, res) => {
    const patient = PATIENTS_DB.find(p => p.id === req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  });

  // Create or update patient
  app.post('/api/patients', (req, res) => {
    const body = req.body;
    if (!body || !body.name) {
      return res.status(400).json({ error: 'Invalid patient data' });
    }

    const existingIdx = PATIENTS_DB.findIndex(p => p.id === body.id || (p.phone && p.phone === body.phone));
    if (existingIdx >= 0) {
      PATIENTS_DB[existingIdx] = { ...PATIENTS_DB[existingIdx], ...body };
      return res.json({ success: true, patient: PATIENTS_DB[existingIdx] });
    }

    const newPatient: PatientRecord = {
      id: body.id || `p-${Date.now().toString().slice(-4)}`,
      tokenNumber: body.tokenNumber || `A-${Math.floor(100 + (Math.floor(Date.now() % 890)))}`,
      name: body.name,
      age: body.age || 40,
      gender: body.gender || 'Male',
      phone: body.phone || '',
      abhaId: body.abhaId || undefined,
      language: body.language || 'hi',
      department: body.department || 'General Medicine',
      assignedCabin: body.assignedCabin || 'Cabin 102',
      registeredAt: body.registeredAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: body.status || 'Waiting',
      vitals: body.vitals || undefined,
      pastVisits: body.pastVisits || [],
      chiefComplaintTranscript: body.chiefComplaintTranscript || ''
    };

    // Store any additional structured clinical intake data if provided
    Object.assign(newPatient, {
      consent: body.consent,
      clinicalInterview: body.clinicalInterview,
      documents: body.documents
    });

    PATIENTS_DB.unshift(newPatient);
    res.status(201).json({ success: true, patient: newPatient });
  });

  // Update patient status (WAITING -> CALLED -> WITH DOCTOR -> COMPLETED)
  app.patch('/api/patients/:id/status', (req, res) => {
    const { status } = req.body;
    const patient = PATIENTS_DB.find(p => p.id === req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    patient.status = status;
    res.json({ success: true, patient });
  });

  // AI Gemini Clinical Summarization route
  app.post('/api/gemini/summarize', async (req, res) => {
    const { patient, complaintText } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Graceful fallback if no API key
      return res.json({ summary: null, message: 'Gemini client not initialized' });
    }

    try {
      const prompt = `You are a senior OPD triage clinical doctor at an Indian public hospital.
Evaluate this patient's intake data:
Patient: ${patient?.name || 'Patient'}, ${patient?.age || 45}y ${patient?.gender || 'Male'}
Vitals: BP ${patient?.vitals?.bloodPressure || '120/80'}, Pulse ${patient?.vitals?.pulse || 72}, SpO2 ${patient?.vitals?.spo2 || 98}%, Temp ${patient?.vitals?.temperature || 98.4}°F
Chief Complaint: "${complaintText || patient?.chiefComplaintTranscript || 'Fever and discomfort'}"

Respond in STRICT JSON with format:
{
  "chiefComplaint": "string",
  "historyOfPresentIllness": "string",
  "socrates": {
    "site": "string",
    "onset": "string",
    "character": "string",
    "radiation": "string",
    "associations": "string",
    "timeCourse": "string",
    "exacerbatingRelieving": "string",
    "severity": "string"
  },
  "differentialDiagnosis": [
    {"condition": "string", "probability": "High | Medium | Low", "reasoning": "string"}
  ],
  "recommendedLabInvestigations": ["string"],
  "doctorOrderedTests": ["string"],
  "urgencyScore": "NORMAL | URGENT | EMERGENCY"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      return res.json({
        summary: {
          id: `sum_${patient?.id || 'gen'}`,
          patientId: patient?.id,
          tokenNumber: patient?.tokenNumber,
          isDoctorConsultationDone: false,
          doctorConsultationNotes: '',
          generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ...parsed
        }
      });
    } catch (err: any) {
      console.warn('Gemini triage error:', err?.message || err);
      return res.json({ summary: null, error: err?.message });
    }
  });

  // Adaptive Clinical Interview Step Route
  app.post('/api/clinical-interview/step', async (req, res) => {
    const { language = 'hi', stepNumber = 1, patientInfo = {}, dialogueHistory = [], latestAnswer = '', isFinalRequest = false } = req.body;
    const ai = getGeminiClient();

    const langNameMap: Record<string, string> = {
      hi: 'Hindi (हिंदी)',
      en: 'English',
      pa: 'Punjabi (ਪੰਜਾਬੀ)',
      bn: 'Bengali (বাংলা)',
      mr: 'Marathi (मराठी)'
    };
    const targetLangName = langNameMap[language] || 'Hindi (हिंदी)';

    if (ai) {
      try {
        const systemPrompt = `You are CARESAAR's Clinical Intake AI Assistant for OPD case-taking in an Indian hospital.
Your task is to conduct an empathetic, structured clinical history interview with a patient for the attending doctor.

CRITICAL RULES:
1. DO NOT DIAGNOSE the patient and DO NOT prescribe medications.
2. Ask EXACTLY ONE concise, clear question in ${targetLangName} addressing the patient.
3. Also provide the question in English.
4. ADAPTIVE PROGRESSION:
   - Base your question directly on the patient's previous answers.
   - If step 1: Inquire about the chief symptom/complaint bringing them to the hospital.
   - If chief complaint known: Inquire about onset, duration, or whether it is continuous or intermittent.
   - If cardiac/chest/breathing: Actively assess for radiation (left arm, jaw, neck), shortness of breath, and sweating.
   - If fever: Inquire about chills/rigors, headache, or rashes.
   - If pain: Characterize severity (scale 1 to 10), nature (sharp/dull), or aggravating/relieving factors.
   - Later: Inquire about past conditions (BP, diabetes) and regular medications/allergies.
5. RED FLAGS:
   If the patient reports any emergency red flags (e.g. crushing chest pain with radiation, acute severe dyspnea, hemoptysis, sudden numbness/weakness), immediately include it in "redFlagsDetected".
6. COMPLETION:
   Set "isComplete": true if stepNumber >= 5, or if patient has provided sufficient history, or if isFinalRequest is true. Otherwise set false.
7. Return strictly valid JSON in this format:
{
  "nextQuestion": "string in ${targetLangName}",
  "nextQuestionEnglish": "string in English",
  "isComplete": boolean,
  "quickReplies": ["2-4 short quick tap answers in ${targetLangName}"],
  "redFlagsDetected": ["string"],
  "structuredData": {
    "chiefComplaint": "string",
    "duration": "string",
    "severity": "string or number",
    "associatedSymptoms": ["string"],
    "historyOfPresentIllness": "string",
    "pastMedicalHistory": ["string"],
    "pastSurgicalHistory": ["string"],
    "medications": ["string"],
    "allergies": ["string"],
    "familyHistory": "string",
    "personalHistory": {
      "diet": "string",
      "tobacco": "string",
      "alcohol": "string",
      "sleep": "string"
    },
    "reviewOfSystems": ["string"],
    "redFlags": ["string"]
  }
}

Dialogue History So Far:
${JSON.stringify(dialogueHistory, null, 2)}
Latest Patient Answer: "${latestAnswer || '(Starting interview)'}"
Patient Demographics: ${JSON.stringify(patientInfo)}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: systemPrompt,
          config: { responseMimeType: 'application/json' }
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.nextQuestion) {
          return res.json({
            nextQuestion: parsed.nextQuestion,
            nextQuestionEnglish: parsed.nextQuestionEnglish || parsed.nextQuestion,
            isComplete: Boolean(parsed.isComplete),
            questionNumber: stepNumber,
            totalSuggestedQuestions: 5,
            redFlagsDetected: parsed.redFlagsDetected || [],
            quickReplies: parsed.quickReplies || [],
            structuredData: {
              ...parsed.structuredData,
              dialogueHistory
            }
          });
        }
      } catch (err: any) {
        console.warn('Gemini interview step error, using clinical engine fallback:', err?.message || err);
      }
    }

    // Heuristic Clinical Engine Fallback (Real deterministic medical question generation)
    const isHindi = language === 'hi';
    const allText = dialogueHistory.map((d: any) => `${d.question} -> ${d.answer}`).join(' ') + ' ' + (latestAnswer || '');
    const lowerAll = allText.toLowerCase();

    const redFlags: string[] = [];
    if (
      lowerAll.includes('chest') || lowerAll.includes('सीना') || lowerAll.includes('छाती') ||
      lowerAll.includes('left arm') || lowerAll.includes('बाएं हाथ') ||
      lowerAll.includes('jaw') || lowerAll.includes('जबड़ा')
    ) {
      redFlags.push('Potential Acute Coronary / Cardiac Red Flag (Chest discomfort radiating to left arm/jaw)');
    }
    if (lowerAll.includes('blood') || lowerAll.includes('खून') || lowerAll.includes('hemoptysis')) {
      redFlags.push('Hemoptysis / Acute Bleed Alert');
    }

    const detectedSymptoms: string[] = [];
    if (lowerAll.includes('chest') || lowerAll.includes('सीना')) detectedSymptoms.push('Chest Pain / सीने में दर्द');
    if (lowerAll.includes('fever') || lowerAll.includes('बुखार')) detectedSymptoms.push('Fever / बुखार');
    if (lowerAll.includes('cough') || lowerAll.includes('खांसी')) detectedSymptoms.push('Cough / खांसी');
    if (lowerAll.includes('breath') || lowerAll.includes('सांस')) detectedSymptoms.push('Shortness of Breath / सांस फूलना');
    if (lowerAll.includes('pain') || lowerAll.includes('दर्द')) detectedSymptoms.push('Pain / बदन दर्द');
    if (lowerAll.includes('vomit') || lowerAll.includes('उल्टी')) detectedSymptoms.push('Nausea & Vomiting');

    let duration = '2-3 Days';
    if (lowerAll.includes('today') || lowerAll.includes('आज') || lowerAll.includes('hour') || lowerAll.includes('घंटे')) {
      duration = 'Acute (< 24 hours)';
    } else if (lowerAll.includes('week') || lowerAll.includes('हफ्ते')) {
      duration = '1-2 Weeks';
    } else if (lowerAll.includes('month') || lowerAll.includes('महीने')) {
      duration = 'Chronic (> 1 Month)';
    }

    let nextQ = '';
    let nextQEng = '';
    let quickReplies: string[] = [];
    let isComplete = false;

    if (isFinalRequest || stepNumber >= 5) {
      isComplete = true;
      nextQ = isHindi ? 'केस हिस्ट्री पूर्ण हो चुकी है। अब आप अगले चरण पर बढ़ सकते हैं।' : 'Case history complete. You may proceed to review.';
      nextQEng = 'Case history complete. You may proceed to review.';
    } else if (stepNumber === 1) {
      nextQ = isHindi ? 'नमस्ते! आज आप किस मुख्य परेशानी या बीमारी की जांच कराने आए हैं?' : 'Hello! What primary symptom or health concern brought you to the hospital today?';
      nextQEng = 'Hello! What primary symptom or health concern brought you to the hospital today?';
      quickReplies = isHindi ? ['सीने में दर्द व भारीपन', 'तेज बुखार एवं कंपकंपी', 'खांसी व सांस फूलना', 'पेट में दर्द या उल्टी', 'घुटनों में दर्द'] : ['Chest Pain / Discomfort', 'High Fever & Chills', 'Cough & Breathlessness', 'Stomach Pain / Nausea', 'Joint / Knee Pain'];
    } else if (stepNumber === 2) {
      nextQ = isHindi ? 'यह परेशानी कब से शुरू हुई है और क्या यह लगातार बनी हुई है या आती-जाती है?' : 'When did this symptom start, and is it constant or does it come and go?';
      nextQEng = 'When did this symptom start, and is it constant or does it come and go?';
      quickReplies = isHindi ? ['आज सुबह से (Today)', '2-3 दिनों से', 'लगभग 1 हफ्ते से', '1 महीने से ज्यादा से', 'आता-जाता रहता है'] : ['Since today / few hours', 'Past 2-3 days', 'About 1 week', 'Chronic (> 1 month)', 'Comes and goes'];
    } else if (stepNumber === 3) {
      if (lowerAll.includes('chest') || lowerAll.includes('सीना') || lowerAll.includes('छाती')) {
        nextQ = isHindi ? 'क्या यह दर्द आपके बाएं हाथ, जबड़े या पीठ की तरफ जा रहा है? क्या सांस फूल रही है या पसीना आ रहा है?' : 'Does the pain spread to your left arm, jaw, or back? Are you feeling breathless or sweating?';
        nextQEng = 'Does the pain spread to your left arm, jaw, or back? Are you feeling breathless or sweating?';
        quickReplies = isHindi ? ['हाँ, बाएं हाथ में जा रहा है', 'हाँ, सांस फूल रही है', 'नहीं, केवल सीने में है'] : ['Yes, spreads to left arm', 'Yes, breathless', 'No, only in chest'];
      } else if (lowerAll.includes('fever') || lowerAll.includes('बुखार')) {
        nextQ = isHindi ? 'क्या बुखार के साथ ठंड/कंपकंपी, सिरदर्द या खांसी है?' : 'Do you have chills, severe headache, or cough along with the fever?';
        nextQEng = 'Do you have chills, severe headache, or cough along with the fever?';
        quickReplies = isHindi ? ['हाँ, तेज कंपकंपी व सिरदर्द', 'खांसी और बदन दर्द भी है', 'केवल बुखार है'] : ['Yes, chills and headache', 'Cough and body ache', 'Fever only'];
      } else {
        nextQ = isHindi ? 'दर्द या तकलीफ की तीव्रता 1 से 10 के पैमाने पर कितनी है, और क्या आराम करने से आराम मिलता है?' : 'On a scale of 1 to 10, how severe is the discomfort, and does rest help?';
        nextQEng = 'On a scale of 1 to 10, how severe is the discomfort, and does rest help?';
        quickReplies = isHindi ? ['हल्का (2-4 / 10)', 'मध्यम (5-7 / 10)', 'असहनीय तेज (8-10 / 10)'] : ['Mild (2-4 / 10)', 'Moderate (5-7 / 10)', 'Severe (8-10 / 10)'];
      }
    } else if (stepNumber === 4) {
      nextQ = isHindi ? 'क्या आपको पहले से डायबिटीज (शुगर), हाई बीपी या थायराइड है? क्या आप कोई नियमित दवा लेते हैं?' : 'Do you have prior conditions like Diabetes, High BP, or Thyroid? Do you take regular medicines or have drug allergies?';
      nextQEng = 'Do you have prior conditions like Diabetes, High BP, or Thyroid? Do you take regular medicines or have drug allergies?';
      quickReplies = isHindi ? ['हाई बीपी की दवा लेता हूँ', 'शुगर (Diabetes) है', 'कोई पुरानी बीमारी नहीं', 'दवाइयों से कोई एलर्जी नहीं'] : ['Take BP medication', 'Have Diabetes', 'No prior conditions', 'No known allergies'];
    } else {
      isComplete = true;
      nextQ = isHindi ? 'केस हिस्ट्री पूर्ण हो चुकी है।' : 'Case history complete.';
      nextQEng = 'Case history complete.';
    }

    const chiefComplaint = dialogueHistory[0]?.answer || latestAnswer || 'Health consultation';
    const structuredData = {
      chiefComplaint,
      duration,
      severity: lowerAll.includes('severe') || lowerAll.includes('तेज') ? 'Severe (8/10)' : 'Moderate (5/10)',
      associatedSymptoms: detectedSymptoms,
      symptoms: detectedSymptoms,
      historyOfPresentIllness: `Patient reports ${chiefComplaint} of duration ${duration}. Associated symptoms: ${detectedSymptoms.join(', ') || 'None'}. Red flags: ${redFlags.join('; ') || 'None'}.`,
      pastMedicalHistory: lowerAll.includes('bp') || lowerAll.includes('बीपी') ? ['Hypertension'] : ['None reported'],
      pastSurgicalHistory: ['No major surgeries reported'],
      medications: lowerAll.includes('medicine') || lowerAll.includes('दवा') ? ['Prescribed medication reported'] : ['None reported'],
      allergies: ['No Known Drug Allergies (NKDA)'],
      familyHistory: 'No specific family history reported',
      personalHistory: { diet: 'Vegetarian', tobacco: 'No', alcohol: 'No', sleep: 'Normal' },
      reviewOfSystems: detectedSymptoms,
      redFlags: redFlags,
      dialogueHistory
    };

    return res.json({
      nextQuestion: nextQ,
      nextQuestionEnglish: nextQEng,
      isComplete,
      questionNumber: stepNumber,
      totalSuggestedQuestions: 5,
      redFlagsDetected: redFlags,
      quickReplies,
      structuredData
    });
  });

  // Vite middleware or static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
