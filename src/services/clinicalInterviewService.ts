import { 
  LanguageCode, 
  StructuredClinicalInterview, 
  InterviewDialogueEntry, 
  InterviewStepResponse 
} from '../types';

export interface NextQuestionPayload {
  language: LanguageCode;
  stepNumber: number;
  patientInfo?: {
    name?: string;
    age?: number;
    gender?: string;
    department?: string;
    vitals?: any;
  };
  dialogueHistory: InterviewDialogueEntry[];
  latestAnswer: string;
  isFinalRequest?: boolean;
}

/**
 * Communicates with backend /api/clinical-interview/step to fetch next adaptive question
 * or generate structured clinical summary.
 * If backend is offline or network fails, uses a robust heuristic clinical engine.
 */
export async function fetchNextInterviewStep(
  payload: NextQuestionPayload
): Promise<InterviewStepResponse> {
  try {
    const res = await fetch('/api/clinical-interview/step', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(9000)
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.nextQuestion) {
        return data;
      }
    }
  } catch (err) {
    console.warn('API clinical interview fetch fallback to local clinical engine:', err);
  }

  // Fallback to local adaptive clinical logic engine
  return localAdaptiveClinicalEngine(payload);
}

/**
 * Local Deterministic Adaptive Clinical Intake Engine
 * Strictly follows genuine clinical history-taking principles without simulated fake delays.
 */
export function localAdaptiveClinicalEngine(
  payload: NextQuestionPayload
): InterviewStepResponse {
  const { language, stepNumber, dialogueHistory, latestAnswer, isFinalRequest } = payload;
  const isHindi = language === 'hi';

  const historyText = dialogueHistory.map(d => `${d.question} -> ${d.answer}`).join(' ') + ' ' + (latestAnswer || '');
  const lowerAll = historyText.toLowerCase();
  const lowerAnswer = (latestAnswer || '').toLowerCase();

  // Red Flag Detection
  const redFlags: string[] = [];
  if (
    lowerAll.includes('chest pain') || lowerAll.includes('सीने में दर्द') || 
    lowerAll.includes('left arm') || lowerAll.includes('बाएं हाथ') ||
    lowerAll.includes('jaw') || lowerAll.includes('जबड़ा') ||
    (lowerAll.includes('breathless') && lowerAll.includes('chest'))
  ) {
    redFlags.push('Potential Acute Coronary / Cardiac Risk (Chest Discomfort with Associated Radiation/Dyspnea)');
  }
  if (
    lowerAll.includes('blood in sputum') || lowerAll.includes('खून') || lowerAll.includes('hemoptysis') ||
    lowerAll.includes('vomiting blood')
  ) {
    redFlags.push('Hemoptysis / Acute GI Bleed Risk');
  }
  if (lowerAll.includes('fainting') || lowerAll.includes('unconscious') || lowerAll.includes('बेहोश') || lowerAll.includes('syncope')) {
    redFlags.push('Syncope / Transient Loss of Consciousness');
  }
  if (lowerAll.includes('stiff neck') || (lowerAll.includes('high fever') && lowerAll.includes('headache') && lowerAll.includes('vomit'))) {
    redFlags.push('Possible Meningeal Irritation / Neuro-Infection Alert');
  }

  // Detect Symptoms
  const detectedSymptoms: string[] = [];
  if (lowerAll.includes('pain') || lowerAll.includes('दर्द')) detectedSymptoms.push('Pain / दर्द');
  if (lowerAll.includes('chest') || lowerAll.includes('सीना') || lowerAll.includes('छाती')) detectedSymptoms.push('Chest Heaviness / सीने में भारीपन');
  if (lowerAll.includes('fever') || lowerAll.includes('बुखार')) detectedSymptoms.push('Fever / बुखार');
  if (lowerAll.includes('cough') || lowerAll.includes('खांसी')) detectedSymptoms.push('Cough / खांसी');
  if (lowerAll.includes('breath') || lowerAll.includes('सांस')) detectedSymptoms.push('Shortness of Breath / सांस की तकलीफ');
  if (lowerAll.includes('vomit') || lowerAll.includes('उल्टी') || lowerAll.includes('nausea')) detectedSymptoms.push('Nausea / Vomiting');
  if (lowerAll.includes('knee') || lowerAll.includes('घुटना') || lowerAll.includes('joint')) detectedSymptoms.push('Joint / Knee Pain');
  if (lowerAll.includes('headache') || lowerAll.includes('सिरदर्द')) detectedSymptoms.push('Headache / सिरदर्द');
  if (lowerAll.includes('dizziness') || lowerAll.includes('चक्कर')) detectedSymptoms.push('Dizziness / चक्कर');

  // Detect Duration
  let duration = '2-3 Days';
  if (lowerAll.includes('hour') || lowerAll.includes('घंटे') || lowerAll.includes('today') || lowerAll.includes('आज')) {
    duration = 'Acute (< 24 hours / आज से)';
  } else if (lowerAll.includes('week') || lowerAll.includes('हफ्ते') || lowerAll.includes('सप्ताह')) {
    duration = 'Subacute (~1-2 Weeks)';
  } else if (lowerAll.includes('month') || lowerAll.includes('महीने') || lowerAll.includes('साल') || lowerAll.includes('year')) {
    duration = 'Chronic (> 1 Month)';
  } else if (lowerAll.includes('3 days') || lowerAll.includes('दिन') || lowerAll.includes('days')) {
    duration = 'Recent (2-4 Days)';
  }

  // Detect Severity
  let severity: number | string = 6;
  if (lowerAll.includes('severe') || lowerAll.includes('असहनीय') || lowerAll.includes('बहुत तेज') || lowerAll.includes('8') || lowerAll.includes('9') || lowerAll.includes('10')) {
    severity = 'Severe (8-9/10)';
  } else if (lowerAll.includes('mild') || lowerAll.includes('हल्का') || lowerAll.includes('1') || lowerAll.includes('2') || lowerAll.includes('3')) {
    severity = 'Mild (2-3/10)';
  } else {
    severity = 'Moderate (5-6/10)';
  }

  // Primary chief complaint detection
  let chiefComplaint = dialogueHistory[0]?.answer || latestAnswer || 'Health consultation';
  if (chiefComplaint.toLowerCase().includes('hello') || chiefComplaint.toLowerCase().includes('नमस्ते')) {
    chiefComplaint = dialogueHistory[1]?.answer || latestAnswer;
  }

  // Determine Next Adaptive Question
  let nextQuestion = '';
  let nextQuestionEnglish = '';
  let quickReplies: string[] = [];
  let isComplete = false;

  const totalQuestionsTarget = 5;

  if (isFinalRequest || stepNumber >= totalQuestionsTarget) {
    isComplete = true;
    nextQuestion = isHindi 
      ? 'धन्यवाद, आपकी सभी प्राथमिक जानकारियों को डॉक्टर के लिए संकलित कर लिया गया है।' 
      : 'Thank you, your clinical history has been compiled for the doctor.';
    nextQuestionEnglish = 'Thank you, your clinical history has been compiled for the doctor.';
  } else if (stepNumber === 1) {
    // Question 1: Chief Complaint
    nextQuestion = isHindi
      ? 'नमस्ते! आज आप किस मुख्य परेशानी या बीमारी की जांच कराने अस्पताल आए हैं?'
      : 'Hello! What primary symptom or health concern brought you to the hospital today?';
    nextQuestionEnglish = 'Hello! What primary symptom or health concern brought you to the hospital today?';
    quickReplies = isHindi
      ? ['सीने में दर्द व भारीपन', 'तेज बुखार एवं कंपकंपी', 'खांसी व सांस फूलना', 'पेट में दर्द या उल्टी', 'घुटनों में दर्द']
      : ['Chest Pain / Discomfort', 'High Fever & Chills', 'Cough & Breathlessness', 'Stomach Pain / Nausea', 'Joint / Knee Pain'];
  } else if (stepNumber === 2) {
    // Question 2: Onset & Duration
    nextQuestion = isHindi
      ? 'यह परेशानी कब से शुरू हुई है और क्या यह लगातार बनी हुई है या आती-जाती है?'
      : 'When did this symptom start, and is it constant or does it come and go?';
    nextQuestionEnglish = 'When did this symptom start, and is it constant or does it come and go?';
    quickReplies = isHindi
      ? ['आज सुबह से (Today)', '2-3 दिनों से', 'लगभग 1 हफ्ते से', '1 महीने से ज्यादा से', 'आता-जाता रहता है']
      : ['Since today / few hours', 'Past 2-3 days', 'About 1 week', 'Chronic (> 1 month)', 'Comes and goes'];
  } else if (stepNumber === 3) {
    // Question 3: Adaptive based on complaint (Cardiac / Pulmonary / Abdominal / General)
    if (lowerAll.includes('chest') || lowerAll.includes('सीना') || lowerAll.includes('छाती')) {
      nextQuestion = isHindi
        ? 'क्या यह दर्द आपके बाएं हाथ, कंधे, जबड़े या पीठ की तरफ जा रहा है? क्या सांस लेने में दिक्कत या पसीना आ रहा है?'
        : 'Does the pain radiate to your left arm, shoulder, jaw, or back? Are you feeling breathless or sweating?';
      nextQuestionEnglish = 'Does the pain radiate to your left arm, shoulder, jaw, or back? Are you feeling breathless or sweating?';
      quickReplies = isHindi
        ? ['हाँ, बाएं हाथ में जा रहा है', 'हाँ, सांस फूल रही है', 'नहीं, केवल सीने में है', 'चलने पर बढ़ता है']
        : ['Yes, spreads to left arm', 'Yes, breathlessness present', 'No, only localized chest pain', 'Worsens on walking'];
    } else if (lowerAll.includes('fever') || lowerAll.includes('बुखार')) {
      nextQuestion = isHindi
        ? 'क्या बुखार के साथ ठंड/कंपकंपी, बदन दर्द, सिरदर्द या त्वचा पर कोई लाल दाने हैं?'
        : 'Are you experiencing chills, severe body ache, headache, or any skin rashes with the fever?';
      nextQuestionEnglish = 'Are you experiencing chills, severe body ache, headache, or any skin rashes with the fever?';
      quickReplies = isHindi
        ? ['हाँ, तेज कंपकंपी व सिरदर्द', 'खांसी और गले में दर्द भी है', 'उल्टी और जी मिचलाना', 'केवल हल्का बुखार']
        : ['Yes, chills & severe headache', 'Cough and sore throat', 'Nausea and vomiting', 'Mild fever only'];
    } else if (lowerAll.includes('pain') || lowerAll.includes('दर्द')) {
      nextQuestion = isHindi
        ? 'दर्द की तीव्रता 1 से 10 के पैमाने पर कितनी है? और क्या किसी खास काम या आराम करने से दर्द में फर्क पड़ता है?'
        : 'On a scale of 1 to 10, how severe is the pain, and does anything relieve or worsen it?';
      nextQuestionEnglish = 'On a scale of 1 to 10, how severe is the pain, and does anything relieve or worsen it?';
      quickReplies = isHindi
        ? ['हल्का (2-4 / 10)', 'मध्यम (5-7 / 10)', 'असहनीय तेज (8-10 / 10)', 'आराम से आराम मिलता है']
        : ['Mild (2-4 / 10)', 'Moderate (5-7 / 10)', 'Severe (8-10 / 10)', 'Relieved by resting'];
    } else {
      nextQuestion = isHindi
        ? 'इस परेशानी के साथ क्या आपको कोई अन्य लक्षण जैसे कमजोरी, चक्कर आना, या भूख न लगना महसूस हो रहा है?'
        : 'Along with this, are you experiencing any other symptoms such as dizziness, weakness, or loss of appetite?';
      nextQuestionEnglish = 'Along with this, are you experiencing any other symptoms such as dizziness, weakness, or loss of appetite?';
      quickReplies = isHindi
        ? ['हाँ, बहुत कमजोरी लग रही है', 'चक्कर और जी मिचलाना', 'कोई अन्य लक्षण नहीं', 'मुझे नहीं पता']
        : ['Yes, weakness & fatigue', 'Dizziness & nausea', 'No other symptoms', "I don't know"];
    }
  } else if (stepNumber === 4) {
    // Question 4: Medical History, Medications & Allergies
    nextQuestion = isHindi
      ? 'क्या आपको पहले से डायबिटीज (शुगर), हाई बीपी, थायराइड या हृदय रोग की समस्या है? क्या आप कोई नियमित दवा लेते हैं?'
      : 'Do you have any existing medical conditions (Diabetes, High BP, Heart condition)? Do you take daily medicines or have allergies?';
    nextQuestionEnglish = 'Do you have any existing medical conditions (Diabetes, High BP, Heart condition)? Do you take daily medicines or have allergies?';
    quickReplies = isHindi
      ? ['हाई बीपी की दवा लेता हूँ', 'शुगर (Diabetes) है', 'कोई पुरानी बीमारी नहीं', 'दवाइयों से कोई एलर्जी नहीं']
      : ['Hypertension (Take BP pills)', 'Diabetes Mellitus', 'No past medical conditions', 'No known drug allergies'];
  } else {
    // Finalization step
    isComplete = true;
    nextQuestion = isHindi
      ? 'केस हिस्ट्री पूर्ण हो चुकी है। अब आप अगले चरण (दस्तावेज़ एवं समीक्षा) पर बढ़ सकते हैं।'
      : 'Case history completed. You may now proceed to document upload and final review.';
    nextQuestionEnglish = 'Case history completed. You may now proceed to document upload and final review.';
  }

  // Compile full structured clinical intake history
  const historyOfPresentIllness = `Patient presents with chief complaint of "${chiefComplaint}". Duration reported as ${duration}. Severity rated as ${severity}. Associated symptoms reported include: ${detectedSymptoms.join(', ') || 'None stated'}. ${redFlags.length > 0 ? 'ALERT: Red flag findings detected: ' + redFlags.join('; ') + '.' : 'No acute systemic red flags reported by patient.'}`;

  const structuredData: StructuredClinicalInterview = {
    chiefComplaint: chiefComplaint,
    duration: duration,
    severity: severity,
    associatedSymptoms: detectedSymptoms,
    symptoms: detectedSymptoms,
    historyOfPresentIllness: historyOfPresentIllness,
    pastMedicalHistory: lowerAll.includes('bp') || lowerAll.includes('hypertension') || lowerAll.includes('बीपी')
      ? ['Essential Hypertension']
      : lowerAll.includes('sugar') || lowerAll.includes('diabetes') || lowerAll.includes('मधुमेह')
      ? ['Type 2 Diabetes Mellitus']
      : ['None reported'],
    pastSurgicalHistory: lowerAll.includes('surgery') || lowerAll.includes('ऑपरेशन')
      ? ['Reported past surgery']
      : ['No prior major surgeries reported'],
    medications: lowerAll.includes('medicine') || lowerAll.includes('दवा')
      ? ['Patient reports taking regular medication']
      : ['None reported'],
    allergies: lowerAll.includes('allergy') || lowerAll.includes('एलर्जी')
      ? ['Patient reported sensitivity']
      : ['No Known Drug Allergies (NKDA)'],
    familyHistory: 'No specific hereditary diseases reported',
    personalHistory: {
      diet: 'Vegetarian',
      tobacco: lowerAll.includes('tobacco') || lowerAll.includes('बीड़ी') || lowerAll.includes('सिगरेट') ? 'Yes' : 'No',
      alcohol: 'No',
      sleep: 'Normal'
    },
    reviewOfSystems: detectedSymptoms,
    redFlags: redFlags,
    dialogueHistory: dialogueHistory
  };

  return {
    nextQuestion,
    nextQuestionEnglish,
    isComplete,
    questionNumber: stepNumber,
    totalSuggestedQuestions: totalQuestionsTarget,
    redFlagsDetected: redFlags,
    quickReplies,
    structuredData
  };
}
