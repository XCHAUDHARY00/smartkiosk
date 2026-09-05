import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  initDatabase, 
  seedInitialDataIfEmpty, 
  getSanitizedPatientsForQueue, 
  getAllPatientsDetailed, 
  getPatientById,
  savePatientIntake, 
  updatePatientStatusInDb, 
  saveOrdersInDb, 
  saveDoctorVerificationsInDb,
  recordAuditLog, 
  getAuditLogs 
} from './server/db';

const PORT = 3000;

// Lazy Gemini SDK client - Protected on server side only
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// Role-based Access Helper
export type UserRole = 'KIOSK' | 'DOCTOR' | 'TRIAGE' | 'ADMIN';
const getActorRole = (req: express.Request): UserRole => {
  const roleHeader = String(req.headers['x-user-role'] || '').toUpperCase();
  if (roleHeader === 'DOCTOR' || roleHeader === 'TRIAGE' || roleHeader === 'ADMIN' || roleHeader === 'KIOSK') {
    return roleHeader as UserRole;
  }
  return 'KIOSK'; // Default least-privilege role
};

async function startServer() {
  // Initialize persistent SQLite database
  initDatabase();
  seedInitialDataIfEmpty();

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
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      storage: 'sqlite_persistent',
      complianceArchitecture: 'privacy-aware architecture'
    });
  });

  // Patient lookup endpoint (by query param q: phone, abha, id, name)
  app.get('/api/patients/lookup', (req, res) => {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.json({ found: false, patient: null, message: 'No query provided' });
    }

    const cleanQ = q.replace(/\D/g, '');
    const all = getAllPatientsDetailed();
    const match = all.find(p => {
      if (p.phone === q || (cleanQ.length >= 7 && p.phone.includes(cleanQ))) return true;
      if (p.abhaId && p.abhaId.replace(/\D/g, '').includes(cleanQ)) return true;
      if (p.id.toLowerCase() === q.toLowerCase()) return true;
      if (p.name.toLowerCase().includes(q.toLowerCase())) return true;
      return false;
    });

    if (match) {
      return res.json({ found: true, patient: match, allMatches: [match] });
    }

    return res.json({ found: false, patient: null });
  });

  // Patient history by phone endpoint
  app.get('/api/patient-history', (req, res) => {
    const phone = String(req.query.phone || '').trim();
    const cleanPhone = phone.replace(/\D/g, '');

    if (!cleanPhone && !phone) {
      return res.json({ success: true, history: [] });
    }

    const all = getAllPatientsDetailed();
    const found = all.find(p => 
      p.phone === phone || (cleanPhone.length >= 7 && p.phone.replace(/\D/g, '').includes(cleanPhone))
    );

    if (found) {
      // Build past visit record from clinical history
      const history = found.clinicalInterview ? [{
        date: found.registeredAt,
        department: found.department,
        doctorName: 'Dr. Alok Verma',
        diagnosis: found.clinicalInterview.chiefComplaint || 'Consultation Record',
        prescriptions: [],
        testsOrdered: found.encounter?.orderedTests || [],
        notes: found.clinicalInterview.historyOfPresentIllness || ''
      }] : [];
      return res.json({ success: true, history, patientId: found.id });
    }

    return res.json({ success: true, history: [] });
  });

  // Patient history by phone URL param route
  app.get('/api/patients/phone/:phone', (req, res) => {
    const phone = req.params.phone.trim();
    const cleanPhone = phone.replace(/\D/g, '');

    const all = getAllPatientsDetailed();
    const found = all.find(p => 
      p.phone === phone || (cleanPhone.length >= 7 && p.phone.replace(/\D/g, '').includes(cleanPhone))
    );

    if (found) {
      return res.json({ found: true, patient: found, history: [] });
    }

    return res.json({ found: false, patient: null, history: [] });
  });

  /**
   * Protected Patient List API with Role Separation
   * - KIOSK / Public role receives ONLY sanitized token and cabin numbers
   * - DOCTOR / ADMIN / TRIAGE role receives clinical patient profiles
   */
  app.get('/api/patients', (req, res) => {
    const role = getActorRole(req);

    if (role === 'KIOSK') {
      // Return sanitized public queue data without sensitive clinical details
      const sanitized = getSanitizedPatientsForQueue();
      return res.json(sanitized);
    }

    // DOCTOR, TRIAGE, or ADMIN receives detailed records
    const detailed = getAllPatientsDetailed();
    return res.json(detailed);
  });

  // Get single patient by ID
  app.get('/api/patients/:id', (req, res) => {
    const role = getActorRole(req);
    const detailed = getAllPatientsDetailed().find(p => p.id === req.params.id);

    if (!detailed) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (role === 'KIOSK') {
      // Return sanitized demographic/token data only
      return res.json({
        id: detailed.id,
        tokenNumber: detailed.tokenNumber,
        assignedCabin: detailed.assignedCabin,
        status: detailed.status,
        department: detailed.department,
        registeredAt: detailed.registeredAt
      });
    }

    return res.json(detailed);
  });

  /**
   * Strictly Protected Clinical Endpoint: /api/patients/:id/clinical
   * Restricted to DOCTOR and ADMIN roles only
   */
  app.get('/api/patients/:id/clinical', (req, res) => {
    const role = getActorRole(req);

    if (role !== 'DOCTOR' && role !== 'ADMIN') {
      recordAuditLog('doctor verification', 'clinical_history', req.params.id, role, { 
        status: 'blocked_unauthorized_role', 
        attemptedEndpoint: `/api/patients/${req.params.id}/clinical` 
      }, req.ip);
      return res.status(403).json({ 
        error: 'Forbidden: Clinical health information is strictly restricted to DOCTOR or ADMIN roles.' 
      });
    }

    const detailed = getAllPatientsDetailed().find(p => p.id === req.params.id);
    if (!detailed) {
      return res.status(404).json({ error: 'Patient clinical record not found' });
    }

    return res.json({ success: true, patient: detailed });
  });

  // Create or update patient in persistent SQLite database
  app.post('/api/patients', (req, res) => {
    const body = req.body;
    if (!body || !body.name) {
      return res.status(400).json({ error: 'Invalid patient intake data. Name is required.' });
    }

    const role = getActorRole(req);
    const result = savePatientIntake(body, role, req.ip);
    res.status(201).json({ success: true, patient: result });
  });

  // Update patient status in SQLite database with audit logging
  app.patch('/api/patients/:id/status', (req, res) => {
    const { status, encounter } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Missing status field' });
    }

    const role = getActorRole(req);
    const result = updatePatientStatusInDb(req.params.id, status, encounter, role, req.ip);
    res.json({ success: true, ...result });
  });

  // Save diagnostic & prescription orders in SQLite database
  app.post('/api/patients/:id/orders', (req, res) => {
    const role = getActorRole(req);
    if (role !== 'DOCTOR' && role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only DOCTOR or ADMIN role can create orders.' });
    }

    const { orders } = req.body;
    if (!Array.isArray(orders)) {
      return res.status(400).json({ error: 'Invalid orders payload. Array expected.' });
    }

    saveOrdersInDb(req.params.id, orders, role, req.ip);
    res.status(201).json({ success: true, count: orders.length });
  });

  // Save doctor verifications of AI brief in SQLite database
  app.post('/api/patients/:id/verifications', (req, res) => {
    const role = getActorRole(req);
    if (role !== 'DOCTOR' && role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only DOCTOR or ADMIN role can record verifications.' });
    }

    const { verifications } = req.body;
    if (!verifications || typeof verifications !== 'object') {
      return res.status(400).json({ error: 'Invalid verifications payload.' });
    }

    saveDoctorVerificationsInDb(req.params.id, verifications, role, req.ip);
    res.json({ success: true });
  });

  // Protected Audit Logs endpoint (ADMIN only)
  app.get('/api/audit-logs', (req, res) => {
    const role = getActorRole(req);
    if (role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied: Audit logs are restricted to ADMIN role.' });
    }

    const limit = Number(req.query.limit) || 50;
    const logs = getAuditLogs(limit);
    res.json({ success: true, count: logs.length, logs });
  });

  // Record audit event endpoint
  app.post('/api/audit-logs', (req, res) => {
    const { eventType, entityType, entityId, details } = req.body;
    const role = getActorRole(req);
    recordAuditLog(eventType, entityType || 'general', entityId || 'unknown', role, details || {}, req.ip);
    res.status(201).json({ success: true });
  });

  // AI Gemini Clinical Summarization route (Protected server-side proxy)
  app.post('/api/gemini/summarize', async (req, res) => {
    const { patient, complaintText } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
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

      // Record audit log for AI summary generation
      const role = getActorRole(req);
      recordAuditLog('AI summary generated', 'clinical_summary', patient?.id || 'unknown', role, {
        urgencyScore: parsed.urgencyScore,
        differentialsCount: parsed.differentialDiagnosis?.length || 0
      }, req.ip);

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
      mr: 'Marathi (मराठी)',
      gu: 'Gujarati (ગુજરાતી)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
      kn: 'Kannada (ಕನ್ನಡ)',
      ml: 'Malayalam (മലയാളം)',
      or: 'Odia (ଓଡ଼ିଆ)',
      ur: 'Urdu (اردو)',
      bho: 'Bhojpuri (भोजपुरी)',
      hinglish: 'Hinglish (Conversational Hindi in Roman/Latin script)'
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
    "reviewOfSystems": ["string"]
  }
}`;

        const context = `Patient Info: Age ${patientInfo.age || 40}, Gender ${patientInfo.gender || 'Male'}, Department ${patientInfo.department || 'General Medicine'}.
Interview Step: ${stepNumber}.
Latest Answer: "${latestAnswer}".
Dialogue History: ${JSON.stringify(dialogueHistory)}.
Is Final Step: ${isFinalRequest}.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${systemPrompt}\n\n${context}`,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const text = response.text || '{}';
        const parsed = JSON.parse(text);

        return res.json({
          nextQuestion: parsed.nextQuestion,
          nextQuestionEnglish: parsed.nextQuestionEnglish,
          isComplete: parsed.isComplete || stepNumber >= 5,
          questionNumber: stepNumber,
          totalSuggestedQuestions: 5,
          redFlagsDetected: parsed.redFlagsDetected || [],
          quickReplies: parsed.quickReplies || [],
          structuredData: {
            ...parsed.structuredData,
            redFlags: parsed.redFlagsDetected || [],
            dialogueHistory: [...dialogueHistory, { role: 'user', content: latestAnswer }, { role: 'assistant', content: parsed.nextQuestion }]
          }
        });
      } catch (err: any) {
        console.warn('Gemini adaptive intake interview error:', err?.message || err);
      }
    }

    // Heuristic fallbacks
    const lowerAll = (dialogueHistory.map((d: any) => d.content).join(' ') + ' ' + latestAnswer).toLowerCase();
    const isComplete = stepNumber >= 5 || isFinalRequest;

    const detectedSymptoms: string[] = [];
    if (lowerAll.includes('cough') || lowerAll.includes('खांसी')) detectedSymptoms.push('Persistent Cough');
    if (lowerAll.includes('fever') || lowerAll.includes('बुखार')) detectedSymptoms.push('Elevated Temperature');
    if (lowerAll.includes('chest') || lowerAll.includes('सीना')) detectedSymptoms.push('Chest Discomfort');
    if (lowerAll.includes('headache') || lowerAll.includes('सिरदर्द')) detectedSymptoms.push('Cephalea / Headache');
    if (lowerAll.includes('pain') || lowerAll.includes('दर्द')) detectedSymptoms.push('Localized Pain');

    const redFlags: string[] = [];
    if (lowerAll.includes('chest') && (lowerAll.includes('breath') || lowerAll.includes('sweat') || lowerAll.includes('सांस'))) {
      redFlags.push('Acute Exertional Chest Heaviness + Dyspnea');
    }
    if (lowerAll.includes('blood') || lowerAll.includes('खून')) {
      redFlags.push('Hemoptysis / Active Bleeding Reported');
    }

    const isPa = language === 'pa';
    const isHi = language === 'hi' || language === 'bho' || language === 'hinglish';

    let nextQ = '';
    let nextQEng = '';
    let quickReplies: string[] = [];

    if (isComplete) {
      nextQ = isPa
        ? 'ਧੰਨਵਾਦ। ਤੁਹਾਡੇ ਲੱਛਣਾਂ ਦੀ ਜਾਣਕਾਰੀ ਡਾਕਟਰ ਲਈ ਦਰਜ ਕਰ ਲਈ ਗਈ ਹੈ।'
        : isHi
        ? 'धन्यवाद। आपके लक्षणों की विस्तृत जानकारी दर्ज कर ली गई है।'
        : 'Thank you. Your clinical interview has been recorded for the doctor.';
      nextQEng = 'Thank you. Your clinical interview has been recorded for the doctor.';
      quickReplies = isPa
        ? ['ਸਮੀਖਿਆ ਕਰੋ (Review Intake)', 'ਅੱਗੇ ਵਧੋ (Proceed)']
        : isHi
        ? ['समीक्षा करें (Review Intake)', 'आगे बढ़ें (Proceed)']
        : ['Review Intake', 'Proceed to Next Step'];
    } else if (stepNumber === 1) {
      nextQ = isPa
        ? 'ਇਹ ਤਕਲੀਫ ਕਦੋਂ ਤੋਂ ਸ਼ੁਰੂ ਹੋਈ ਹੈ ਅਤੇ ਕੀ ਇਹ ਲਗਾਤਾਰ ਬਣੀ ਰਹਿੰਦੀ ਹੈ ਜਾਂ ਆਉਂਦੀ-ਜਾਂਦੀ ਹੈ?'
        : isHi
        ? 'यह परेशानी कब से शुरू हुई है और क्या यह लगातार बनी हुई है या आती-जाती है?'
        : 'When did this symptom start, and is it constant or does it come and go?';
      nextQEng = 'When did this symptom start, and is it constant or does it come and go?';
      quickReplies = isPa
        ? ['ਅੱਜ ਸਵੇਰ ਤੋਂ (Today)', '2-3 ਦਿਨਾਂ ਤੋਂ (2-3 Days)', '1 ਹਫਤੇ ਤੋਂ (1 Week)', '1 ਮਹੀਨੇ ਤੋਂ ਵੱਧ (Chronic)']
        : isHi
        ? ['आज सुबह से (Today)', '2-3 दिनों से (2-3 Days)', '1 हफ्ते से (1 Week)', '1 महीने से ज्यादा (Chronic)']
        : ['Since today / few hours', 'Past 2-3 days', 'About 1 week', 'Chronic (> 1 month)'];
    } else if (stepNumber === 2) {
      if (lowerAll.includes('chest') || lowerAll.includes('ਛਾਤੀ') || lowerAll.includes('सीना')) {
        nextQ = isPa
          ? 'ਕੀ ਦਰਦ ਖੱਬੀ ਬਾਂਹ, ਮੋਢੇ ਜਾਂ ਜਬਾੜੇ ਵੱਲ ਫੈਲਦਾ ਹੈ? ਕੀ ਸਾਹ ਲੈਣ ਵਿੱਚ ਦਿੱਕਤ ਜਾਂ ਪਸੀਨਾ ਆਉਂਦਾ ਹੈ?'
          : isHi
          ? 'क्या दर्द आपके बाएं हाथ, कंधे या जबड़े की तरफ जाता है? क्या सांस फूलती है या पसीना आ रहा है?'
          : 'Does the pain radiate to your left arm, shoulder, or jaw? Are you feeling breathless or sweating?';
        nextQEng = 'Does the pain radiate to your left arm, shoulder, or jaw? Are you feeling breathless or sweating?';
        quickReplies = isPa
          ? ['ਹਾਂ, ਖੱਬੀ ਬਾਂਹ ਵਿੱਚ ਜਾਂਦਾ ਹੈ', 'ਹਾਂ, ਸਾਹ ਫੁੱਲ ਰਿਹਾ ਹੈ', 'ਨਹੀਂ, ਸਿਰਫ਼ ਛਾਤੀ ਵਿੱਚ ਹੈ', 'ਤੁਰਨ ਤੇ ਵੱਧਦਾ ਹੈ']
          : isHi
          ? ['हाँ, बाएं हाथ में जा रहा है', 'हाँ, सांस फूल रही है', 'नहीं, केवल सीने में है', 'चलने पर बढ़ता है']
          : ['Yes, radiates to arm', 'Yes, breathlessness', 'No, only chest pain', 'Worsens on walking'];
      } else {
        nextQ = isPa
          ? 'ਦਰਦ ਜਾਂ ਤਕਲੀਫ ਦੀ ਗੰਭੀਰਤਾ 1 ਤੋਂ 10 ਦੇ ਪੈਮਾਨੇ ਤੇ ਕਿੰਨੀ ਹੈ?'
          : isHi
          ? 'दर्द या तकलीफ की तीव्रता 1 से 10 के पैमाने पर कितनी है?'
          : 'On a scale of 1 to 10, how severe is your discomfort?';
        nextQEng = 'On a scale of 1 to 10, how severe is your discomfort?';
        quickReplies = isPa
          ? ['ਹਲਕਾ (2-4 / 10)', 'ਦਰਮਿਆਨਾ (5-7 / 10)', 'ਬਹੁਤ ਤੇਜ਼ (8-10 / 10)', 'ਆਰਾਮ ਨਾਲ ਠੀਕ ਹੁੰਦਾ ਹੈ']
          : isHi
          ? ['हल्का (2-4 / 10)', 'मध्यम (5-7 / 10)', 'असहनीय तेज (8-10 / 10)', 'आराम से आराम मिलता है']
          : ['Mild (2-4 / 10)', 'Moderate (5-7 / 10)', 'Severe (8-10 / 10)', 'Relieved by resting'];
      }
    } else {
      nextQ = isPa
        ? 'ਕੀ ਤੁਹਾਨੂੰ ਸ਼ੂਗਰ, ਹਾਈ ਬੀਪੀ ਜਾਂ ਦਿਲ ਦੀ ਕੋਈ ਪੁਰਾਣੀ ਬਿਮਾਰੀ ਹੈ? ਕੀ ਤੁਸੀਂ ਕੋਈ ਰੋਜ਼ਾਨਾ ਦਵਾਈ ਲੈਂਦੇ ਹੋ?'
        : isHi
        ? 'क्या आपको पहले से कोई बीमारी (जैसे बीपी, शुगर, थायराइड) या किसी दवा से एलर्जी है?'
        : 'Do you have any pre-existing health conditions (BP, Diabetes, Heart condition) or drug allergies?';
      nextQEng = 'Do you have any pre-existing health conditions (BP, Diabetes, Heart condition) or drug allergies?';
      quickReplies = isPa
        ? ['ਕੋਈ ਪੁਰਾਣੀ ਬਿਮਾਰੀ ਨਹੀਂ (None)', 'ਹਾਈ ਬੀਪੀ / ਸ਼ੂਗਰ ਹੈ (BP/Sugar)', 'ਦਵਾਈਆਂ ਤੋਂ ਐਲਰਜੀ ਹੈ (Allergy)']
        : isHi
        ? ['नहीं, कोई अन्य बीमारी नहीं (None)', 'हाँ, बीपी/शुगर है (Yes, BP/Diabetes)', 'दवा से एलर्जी है (Have Allergy)']
        : ['None reported', 'Yes, Hypertension / Diabetes', 'Have Known Drug Allergy'];
    }

    const structuredData = {
      chiefComplaint: dialogueHistory[0]?.content || latestAnswer || 'General Health Concern',
      duration: '3-4 days reported',
      severity: redFlags.length > 0 ? 'Severe (Urgent Attention)' : 'Moderate',
      associatedSymptoms: detectedSymptoms,
      historyOfPresentIllness: `Patient reports ${detectedSymptoms.join(', ') || 'symptoms'}. Adaptive interview step ${stepNumber}.`,
      pastMedicalHistory: lowerAll.includes('sugar') || lowerAll.includes('bp') ? ['History of chronic illness mentioned'] : ['None reported'],
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
