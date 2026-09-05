import { LanguageCode } from '../types';

export interface Translations {
  appTitle: string;
  kioskTag: string;
  kioskSubTag: string;
  assignedToken: string;
  doctorVoiceActive: string;
  emergencyAlert: string;
  next: string;
  back: string;
  submit: string;
  save: string;
  cancel: string;
  loading: string;
  selectLanguage: string;
  steps: {
    identity: { label: string; subLabel: string };
    consent: { label: string; subLabel: string };
    department: { label: string; subLabel: string };
    interview: { label: string; subLabel: string };
    documents: { label: string; subLabel: string };
    review: { label: string; subLabel: string };
  };
  identity: {
    title: string;
    subtitle: string;
    scanAbha: string;
    fullName: string;
    fullNamePlaceholder: string;
    mobile: string;
    mobilePlaceholder: string;
    age: string;
    gender: string;
    genderMale: string;
    genderFemale: string;
    genderOther: string;
    abhaId: string;
    abhaPlaceholder: string;
    abhaLinked: string;
    secureSession: string;
    nextConsent: string;
    abhaSuccessPhrase: string;
  };
  consent: {
    title: string;
    audioExplanation: string;
    dpdpBadge: string;
    clause1Title: string;
    clause1: string;
    clause2Title: string;
    clause2: string;
    clause3Title: string;
    clause3: string;
    consentCheck: string;
    agreeButton: string;
    audioExplanationText: string;
  };
  department: {
    title: string;
    subtitle: string;
    inQueue: string;
    audioPhrase: string;
    deptLabels: Record<string, string>;
  };
  interview: {
    title: string;
    questionPrefix: string;
    doctorSpeaking: string;
    repeatAudio: string;
    tapToSpeak: string;
    tapToStop: string;
    chooseQuickAnswer: string;
    yourSpokenResponse: string;
    typeAnswerPlaceholder: string;
    proceedToScanner: string;
    emergencyAlertTitle: string;
    emergencyAlertDesc: string;
    initialQuestion: string;
    initialAudioPrompt: string;
    initialOptions: string[];
  };
  scanner: {
    title: string;
    subtitle: string;
    scanButton: string;
    uploadButton: string;
    analyzingText: string;
    extractedMeds: string;
    extractedDx: string;
    audioPhrase: string;
    nextReview: string;
  };
  review: {
    title: string;
    subtitle: string;
    confirmSubmit: string;
    downloadPdf: string;
    printSlip: string;
    feedbackButton: string;
    audioPhrase: string;
    doctorBrief: string;
    chiefComplaint: string;
    patientDetails: string;
    vitals: string;
    submittedSuccess: string;
  };
}

export const baseHindi: Translations = {
  appTitle: 'स्मार्ट ओपीडी कियोस्क व डॉक्टर परामर्श सहायक',
  kioskTag: 'ओपीडी स्मार्ट कियोस्क',
  kioskSubTag: 'सुरक्षित क्लिनिकल सहायक',
  assignedToken: 'आपका टोकन नंबर',
  doctorVoiceActive: 'डॉक्टर की आवाज़ सक्रिय है',
  emergencyAlert: 'आपातकालीन ट्राइएज चेतावनी',
  next: 'आगे बढ़ें',
  back: 'पीछे जाएं',
  submit: 'दर्ज करें',
  save: 'सुरक्षित करें',
  cancel: 'रद्द करें',
  loading: 'प्रतीक्षा करें...',
  selectLanguage: 'भाषा चुनें',
  steps: {
    identity: { label: 'पहचान व विवरण', subLabel: 'Patient Profile' },
    consent: { label: 'सहमति पत्र', subLabel: 'Digital Consent' },
    department: { label: 'विभाग चयन', subLabel: 'OPD Department' },
    interview: { label: 'लक्षण व बातचीत', subLabel: 'Voice & Touch Q&A' },
    documents: { label: 'पर्चे व रिपोर्ट', subLabel: 'Document Scan' },
    review: { label: 'समीक्षा व पर्ची', subLabel: 'Summary & Token Slip' }
  },
  identity: {
    title: 'मरीज पहचान व विवरण (ABHA Verification)',
    subtitle: 'मोबाइल नंबर दर्ज करें या तुरंत विवरण भरने के लिए आभा क्यूआर कोड स्कैन करें।',
    scanAbha: 'आभा स्कैन (ABHA QR)',
    fullName: 'मरीज का पूरा नाम',
    fullNamePlaceholder: 'उदा. रामेश्वर प्रसाद',
    mobile: 'मोबाइल नंबर',
    mobilePlaceholder: '10 अंकों का मोबाइल नंबर',
    age: 'उम्र (वर्ष)',
    gender: 'लिंग',
    genderMale: 'पुरुष (Male)',
    genderFemale: 'महिला (Female)',
    genderOther: 'अन्य (Other)',
    abhaId: 'आभा आईडी / स्वास्थ्य कार्ड (वैकल्पिक)',
    abhaPlaceholder: 'उदा. 91-4521-8890-1234',
    abhaLinked: 'आभा लिंक',
    secureSession: 'सुरक्षित एन्क्रिप्टेड सत्र',
    nextConsent: 'आगे बढ़ें: डिजिटल सहमति पत्र',
    abhaSuccessPhrase: 'आभा आईडी सफलतापूर्वक सत्यापित व लिंक हो गई है।'
  },
  consent: {
    title: 'मरीज डेटा सुरक्षा एवं डिजिटल सहमति पत्र',
    audioExplanation: 'सहमति विवरण ऑडियो में सुनें',
    dpdpBadge: 'सुरक्षित डेटा सहमति',
    clause1Title: 'क्लिनिकल उपयोग मात्र',
    clause1: 'मेरी स्वास्थ्य जानकारी केवल डॉक्टर के परामर्श और पर्चे के लिए उपयोग की जाएगी।',
    clause2Title: 'दस्तावेज़ सुरक्षा',
    clause2: 'मेरी पूर्व मेडिकल रिपोर्ट और पर्चे डिजिटल रूप से स्कैन होकर डॉक्टर के सिस्टम में सुरक्षित रहेंगे।',
    clause3Title: 'सत्र स्वतः रीसेट',
    clause3: 'यह कियोस्क सत्र समाप्त होते ही स्क्रीन रीसेट हो जाएगी और मेरी गोपनीयता सुरक्षित रहेगी।',
    consentCheck: 'मैं अपने स्वास्थ्य परामर्श व पर्चे के विश्लेषण के लिए पूर्ण सहमति प्रदान करता/करती हूँ।',
    agreeButton: 'मैं सहमत हूँ और आगे बढ़ना चाहता हूँ',
    audioExplanationText: 'यह ओपीडी कियोस्क आपके परामर्श को आसान बनाता है। आपकी बीमारी के लक्षण और पुराने पर्चे केवल आपके ओपीडी डॉक्टर के परामर्श के लिए सुरक्षित रखे जाएंगे।'
  },
  department: {
    title: 'ओपीडी विभाग एवं विशेषज्ञता चुनें',
    subtitle: 'जिस विभाग के डॉक्टर से परामर्श लेना है, उस पर टच करें।',
    inQueue: 'प्रतीक्षा में',
    audioPhrase: 'विभाग चुना गया। आइए अब आपकी तकलीफ के बारे में बात करते हैं।',
    deptLabels: {
      general_medicine: 'सामान्य चिकित्सा (General Medicine)',
      cardiology: 'हृदय रोग विभाग (Cardiology)',
      orthopedics: 'हड्डी एवं जोड़ रोग (Orthopedics)',
      pediatrics: 'बाल रोग विशेषज्ञ (Pediatrics)',
      gynecology: 'स्त्री एवं प्रसूति रोग (Gynecology)',
      ayush_ayurveda: 'आयुष एवं समग्र स्वास्थ्य (AYUSH)',
      pulmonology: 'श्वसन एवं फेफड़ा रोग (Pulmonology)',
      ent: 'कान, नाक एवं गला (ENT)'
    }
  },
  interview: {
    title: 'लक्षण व बातचीत',
    questionPrefix: 'प्रश्न',
    doctorSpeaking: 'डॉक्टर बोल रहे हैं...',
    repeatAudio: 'डॉक्टर की आवाज़ दोबारा सुनें',
    tapToSpeak: 'बोलकर उत्तर दें (माइक्रोफ़ोन)',
    tapToStop: 'बोलना समाप्त करें',
    chooseQuickAnswer: 'या नीचे दिए गए विकल्पों में से चुनें:',
    yourSpokenResponse: 'आपकी आवाज़ से रिकॉर्ड किया गया उत्तर:',
    typeAnswerPlaceholder: 'यहाँ अपना उत्तर टाइप करें (वैकल्पिक)...',
    proceedToScanner: 'अगला चरण: पुराने पर्चे व रिपोर्ट स्कैन करें',
    emergencyAlertTitle: 'प्राथमिकता ट्राइएज चेतावनी',
    emergencyAlertDesc: 'गंभीर लक्षण पाए गए हैं। तुरंत ओपीडी ट्राइएज डेस्क को अलर्ट भेजा गया है।',
    initialQuestion: 'आज आपको अस्पताल में किस मुख्य तकलीफ या परेशानी के लिए डॉक्टर को दिखाना है? (Chief Complaint)',
    initialAudioPrompt: 'नमस्ते। कृपया बताएं कि आज आपको क्या मुख्य शारीरिक या स्वास्थ्य तकलीफ हो रही है?',
    initialOptions: [
      'सीने में भारीपन व दर्द (Chest Pain)',
      'तेज बुखार, कंपकंपी व बदन दर्द (Fever)',
      'पेट में तेज दर्द व खट्टी डकारें (Stomach Pain)',
      'चलने पर घुटनों व जोड़ों में दर्द (Joint Pain)',
      'लगातार खांसी व सांस फूलना (Cough / Breathless)'
    ]
  },
  scanner: {
    title: 'पुराने पर्चे एवं लैब रिपोर्ट स्कैन करें',
    subtitle: 'आपके पर्चे में लिखी दवाइयां और टेस्ट तुरंत पहचान कर डॉक्टर के लिए तैयार किए जाएंगे',
    scanButton: 'कैमरे से पर्चा स्कैन करें',
    uploadButton: 'फ़ाइल या फोटो अपलोड करें',
    analyzingText: 'पर्चे का विश्लेषण किया जा रहा है...',
    extractedMeds: 'पहचानी गई दवाइयां (Medications)',
    extractedDx: 'पूर्व रोग व डायग्नोसिस (Diagnosis)',
    audioPhrase: 'पर्चा स्कैन हो चुका है। अब आप क्लिनिकल सारांश की समीक्षा कर सकते हैं।',
    nextReview: 'आगे बढ़ें: समीक्षा व टोकन पर्ची'
  },
  review: {
    title: 'क्लिनिकल सारांश एवं टोकन पर्ची',
    subtitle: 'आपकी पूरी जानकारी डॉक्टर के कंसोल पर सुरक्षित भेज दी गई है',
    confirmSubmit: 'ओपीडी में दर्ज करें (Confirm & Push)',
    downloadPdf: 'क्लिनिकल पर्ची डाउनलोड करें (PDF)',
    printSlip: 'टोकन पर्ची प्रिंट करें',
    feedbackButton: 'कियोस्क अनुभव रेटिंग दें',
    audioPhrase: 'आपकी ओपीडी पर्ची तैयार है। कृपया अपने टोकन नंबर के साथ डॉक्टर के कमरे के बाहर प्रतीक्षा करें।',
    doctorBrief: 'डॉक्टर क्लिनिकल सारांश',
    chiefComplaint: 'मुख्य तकलीफ',
    patientDetails: 'मरीज का विवरण',
    vitals: 'शारीरिक माप (Vitals)',
    submittedSuccess: 'सफलतापूर्वक ओपीडी में दर्ज हो गया!'
  }
};

export const baseEnglish: Translations = {
  appTitle: 'Smart OPD Intake Kiosk & Doctor Consultation Assistant',
  kioskTag: 'Smart OPD Kiosk',
  kioskSubTag: 'Secure Clinical Intake',
  assignedToken: 'Assigned Token',
  doctorVoiceActive: 'Doctor Voice Active',
  emergencyAlert: 'Emergency Triage Alert',
  next: 'Proceed Next',
  back: 'Back',
  submit: 'Submit',
  save: 'Save',
  cancel: 'Cancel',
  loading: 'Processing...',
  selectLanguage: 'Select Language',
  steps: {
    identity: { label: 'Identity & Details', subLabel: 'Patient Profile' },
    consent: { label: 'Digital Consent', subLabel: 'Patient Consent' },
    department: { label: 'Department', subLabel: 'Select OPD Room' },
    interview: { label: 'Voice Interview', subLabel: 'Symptom Consultation' },
    documents: { label: 'Documents & Rx', subLabel: 'Document Scan' },
    review: { label: 'Review & Slip', subLabel: 'Clinical Summary' }
  },
  identity: {
    title: 'Patient Identification & Details',
    subtitle: 'Enter mobile number or scan ABHA QR code for instant pre-fill.',
    scanAbha: 'Scan ABHA QR',
    fullName: 'Full Name',
    fullNamePlaceholder: 'e.g. Rameshwar Prasad',
    mobile: 'Mobile Number',
    mobilePlaceholder: '10-digit mobile number',
    age: 'Age (Years)',
    gender: 'Gender',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Other',
    abhaId: 'ABHA ID / Health Card ID (Optional)',
    abhaPlaceholder: 'e.g. 91-4521-8890-1234',
    abhaLinked: 'ABHA Linked',
    secureSession: 'Secure Encrypted Session',
    nextConsent: 'Next: Digital Consent',
    abhaSuccessPhrase: 'ABHA ID verified and linked with hospital registration successfully.'
  },
  consent: {
    title: 'Patient Privacy & Digital Consent Agreement',
    audioExplanation: 'Listen to Consent Audio Guidance',
    dpdpBadge: 'Secure Patient Consent',
    clause1Title: 'Clinical Consultation Use Only',
    clause1: 'My medical symptoms will be digitized solely for clinical review by my consulting physician.',
    clause2Title: 'Secure Prescription Digitization',
    clause2: 'My uploaded prior prescriptions and lab reports are securely processed for clinical review.',
    clause3Title: 'Automatic Session Reset',
    clause3: 'Kiosk session resets automatically to safeguard health information privacy.',
    consentCheck: 'I hereby provide digital consent for clinical pre-intake and doctor consultation.',
    agreeButton: 'I Understand and Give Digital Consent',
    audioExplanationText: 'This OPD Kiosk securely assists with your pre-consultation. Your medical answers and scanned reports will only be shared with your consulting doctor to speed up your OPD consultation.'
  },
  department: {
    title: 'Select OPD Department & Specialty',
    subtitle: 'Touch your required OPD clinic. Allopathic and AYUSH / Ayurveda departments available.',
    inQueue: 'in queue',
    audioPhrase: 'department selected. Let us now proceed with symptom exploration.',
    deptLabels: {
      general_medicine: 'General Medicine',
      cardiology: 'Cardiology',
      orthopedics: 'Orthopedics & Joint Care',
      pediatrics: 'Pediatrics (Child Care)',
      gynecology: 'Gynecology & Obstetrics',
      ayush_ayurveda: 'AYUSH / Ayurveda Integrative',
      pulmonology: 'Pulmonology (Chest & Lungs)',
      ent: 'ENT (Ear, Nose, Throat)'
    }
  },
  interview: {
    title: 'Voice & Touch Interview',
    questionPrefix: 'Question',
    doctorSpeaking: 'Doctor Speaking...',
    repeatAudio: 'Listen to Doctor Audio',
    tapToSpeak: 'Tap to Speak (Voice Input)',
    tapToStop: 'Tap to Stop Listening',
    chooseQuickAnswer: 'Or select a common response below:',
    yourSpokenResponse: 'Recognized Spoken Transcript:',
    typeAnswerPlaceholder: 'Type custom response here if preferred...',
    proceedToScanner: 'Next: Scan Previous Prescriptions',
    emergencyAlertTitle: 'Priority Triage Alert Dispatched',
    emergencyAlertDesc: 'Red-flag symptoms identified. Pushed to OPD triage nurse.',
    initialQuestion: 'What is the main problem or discomfort that brought you to the OPD today? (Chief Complaint)',
    initialAudioPrompt: 'Welcome to the OPD. Please tell me your chief health complaint, or choose an option below.',
    initialOptions: [
      'Chest heaviness & discomfort (Chest Pain)',
      'High fever & body aches (Fever)',
      'Severe stomach pain & acidity (Stomach Pain)',
      'Joint & knee pain while walking (Joint Pain)',
      'Chronic cough & breathing difficulty (Cough)'
    ]
  },
  scanner: {
    title: 'Scan Previous Prescriptions & Lab Reports',
    subtitle: 'AI-OCR extracts past diagnoses and current medications for doctor review',
    scanButton: 'Scan Document with Camera',
    uploadButton: 'Upload PDF / Prescription Photo',
    analyzingText: 'Analyzing medical document with clinical OCR...',
    extractedMeds: 'Extracted Medications',
    extractedDx: 'Extracted Diagnosis / Findings',
    audioPhrase: 'Prescription scanned successfully. You can now review your clinical summary.',
    nextReview: 'Next: Review & Token Slip'
  },
  review: {
    title: 'Clinical Pre-Consultation Summary & Token Slip',
    subtitle: 'Your intake profile has been transmitted to the OPD Doctor Station',
    confirmSubmit: 'Confirm & Push to Hospital HIS',
    downloadPdf: 'Download Clinical Slip (PDF)',
    printSlip: 'Print Token Slip',
    feedbackButton: 'Rate Kiosk Experience',
    audioPhrase: 'Your OPD token slip is ready. Please proceed to the waiting area outside the doctor cabin.',
    doctorBrief: 'Doctor Clinical Brief',
    chiefComplaint: 'Chief Complaint',
    patientDetails: 'Patient Details',
    vitals: 'Vital Signs',
    submittedSuccess: 'Successfully submitted to Hospital OPD queue!'
  }
};

export const baseMarathi: Translations = {
  ...baseHindi,
  appTitle: 'स्मार्ट ओपीडी किऑस्क आणि डॉक्टर सल्लागार सहाय्यक',
  kioskTag: 'ओपीडी स्मार्ट किऑस्क',
  kioskSubTag: 'सुरक्षित वैद्यकीय सहाय्यक',
  assignedToken: 'तुमचा टोकन क्रमांक',
  doctorVoiceActive: 'डॉक्टरांचा आवाज सुरू आहे',
  emergencyAlert: 'तातडीची ट्रायज सूचना',
  next: 'पुढे चला',
  back: 'मागे या',
  submit: 'नोंदवा',
  save: 'जतन करा',
  cancel: 'रद्द करा',
  loading: 'कृपया प्रतीक्षा करा...',
  selectLanguage: 'भाषा निवडा',
  steps: {
    identity: { label: 'ओळख आणि तपशील', subLabel: 'Patient Profile' },
    consent: { label: 'संमती पत्र', subLabel: 'Digital Consent' },
    department: { label: 'विभाग निवड', subLabel: 'OPD Department' },
    interview: { label: 'लक्षणे व संवाद', subLabel: 'Voice & Touch Q&A' },
    documents: { label: 'प्रिस्क्रिप्शन व रिपोर्ट्स', subLabel: 'Document Scan' },
    review: { label: 'तपासणी व टोकन', subLabel: 'Summary & Token Slip' }
  },
  identity: {
    title: 'रुग्ण ओळख व आभा (ABHA) पडताळणी',
    subtitle: 'मोबाईल नंबर प्रविष्ट करा किंवा आभा क्यूआर कोड स्कॅन करा.',
    scanAbha: 'आभा स्कॅन (ABHA QR)',
    fullName: 'रुग्णाचे पूर्ण नाव',
    fullNamePlaceholder: 'उदा. रमेश कदम',
    mobile: 'मोबाईल नंबर',
    mobilePlaceholder: '१० अंकी मोबाईल नंबर',
    age: 'वय (वर्षे)',
    gender: 'लिंग',
    genderMale: 'पुरुष (Male)',
    genderFemale: 'स्त्री (Female)',
    genderOther: 'इतर (Other)',
    abhaId: 'आभा आयडी / आरोग्य कार्ड (ऐच्छिक)',
    abhaPlaceholder: 'उदा. 91-4521-8890-1234',
    abhaLinked: 'आभा लिंक झाले',
    secureSession: 'सुरक्षित एन्क्रिप्टेड सत्र',
    nextConsent: 'पुढे चला: डिजिटल संमती पत्र',
    abhaSuccessPhrase: 'आभा आयडी यशस्वीरीत्या पडताळला व लिंक झाला आहे.'
  },
  consent: {
    title: 'रुग्ण डेटा संरक्षण आणि डिजिटल संमती पत्र',
    audioExplanation: 'संमती तपशील आवाजात ऐका',
    dpdpBadge: 'सुरक्षित डेटा संमती',
    clause1Title: 'केवळ वैद्यकीय उपयोगासाठी',
    clause1: 'माझी आरोग्य माहिती केवळ डॉक्टरांच्या सल्ल्यासाठी आणि उपचारासाठी वापरली जाईल.',
    clause2Title: 'दस्तऐवज सुरक्षितता',
    clause2: 'माझे जुने रिपोर्ट्स आणि प्रिस्क्रिप्शन सुरक्षितपणे स्कॅन करून डॉक्टरांकडे पाठवले जातील.',
    clause3Title: 'सत्र रीसेट',
    clause3: 'हे किऑस्क सत्र संपताच स्क्रीन रीसेट होईल व माझी गोपनीयता सुरक्षित राहील.',
    consentCheck: 'मी माझ्या तपासणीसाठी आणि माहितीच्या विश्लेषणासाठी संमती देत आहे.',
    agreeButton: 'मी सहमत आहे आणि पुढे जाऊ इच्छितो',
    audioExplanationText: 'हे ओपीडी किऑस्क आपला वेळ वाचवण्यासाठी आहे. आपली लक्षणे व रिपोर्ट्स फक्त डॉक्टरांसाठी सुरक्षित ठेवले जातील.'
  },
  department: {
    title: 'ओपीडी विभाग आणि तज्ज्ञ डॉक्टर निवडा',
    subtitle: 'ज्या विभागाच्या डॉक्टरांना भेटायचे आहे त्यावर स्पर्श करा.',
    inQueue: 'प्रतीक्षेत',
    audioPhrase: 'विभाग निवडला गेला आहे. आता आपण आपल्या त्रासाबद्दल बोलूया.',
    deptLabels: {
      general_medicine: 'जनरल मेडिसिन (General Medicine)',
      cardiology: 'हृदयरोग विभाग (Cardiology)',
      orthopedics: 'हाडे आणि सांधे विभाग (Orthopedics)',
      pediatrics: 'बालरोग तज्ज्ञ (Pediatrics)',
      gynecology: 'स्त्रीरोग व प्रसूती (Gynecology)',
      ayush_ayurveda: 'आयुष आणि आयुर्वेद (AYUSH)',
      pulmonology: 'श्वसन व फुफ्फुस विभाग (Pulmonology)',
      ent: 'कान, नाक आणि घसा (ENT)'
    }
  },
  interview: {
    title: 'लक्षणे व संवाद',
    questionPrefix: 'प्रश्न',
    doctorSpeaking: 'डॉक्टर बोलत आहेत...',
    repeatAudio: 'डॉक्टरांचा आवाज पुन्हा ऐका',
    tapToSpeak: 'बोलून उत्तर द्या (मायक्रोफोन)',
    tapToStop: 'बोलणे थांबवा',
    chooseQuickAnswer: 'किंवा खालीलपैकी पर्याय निवडा:',
    yourSpokenResponse: 'तुमचा रेकॉर्ड झालेला आवाज:',
    typeAnswerPlaceholder: 'इथे तुमचे उत्तर टाईप करा...',
    proceedToScanner: 'पुढील पायरी: जुने प्रिस्क्रिप्शन स्कॅन करा',
    emergencyAlertTitle: 'तातडीची सूचना पाठवली',
    emergencyAlertDesc: 'गंभीर लक्षणे आढळली आहेत. ओपीडी ट्रायज नर्सला सूचना देण्यात आली आहे.',
    initialQuestion: 'आज आपल्याला कोणता त्रास होत आहे ज्यासाठी आपण डॉक्टरांना भेटायला आला आहात?',
    initialAudioPrompt: 'नमस्कार. कृपया सांगा की आज तुम्हाला काय मुख्य शारीरिक त्रास होत आहे?',
    initialOptions: [
      'छातीत जडपणा व दुखणे (Chest Pain)',
      'तीव्र ताप व अंगदुखी (Fever)',
      'पोटात तीव्र दुखणे व जळजळ (Stomach Pain)',
      'चालताना गुडघे व सांधे दुखणे (Joint Pain)',
      'खोकला आणि धाप लागणे (Cough / Breathless)'
    ]
  },
  scanner: {
    title: 'जुने प्रिस्क्रिप्शन आणि लॅब रिपोर्ट स्कॅन करा',
    subtitle: 'आपल्या कागदपत्रांमधील औषधे डॉक्टरांसाठी लगेच तयार केली जातील.',
    scanButton: 'कॅमेऱ्याने स्कॅन करा',
    uploadButton: 'फोटो किंवा फाईल अपलोड करा',
    analyzingText: 'प्रिस्क्रिप्शन तपासले जात आहे...',
    extractedMeds: 'ओळखलेली औषधे (Medications)',
    extractedDx: 'मागील आजार व निदान (Diagnosis)',
    audioPhrase: 'कागदपत्र स्कॅन झाले आहे. आता आपण सारांश पाहू शकता.',
    nextReview: 'पुढे चला: तपासणी व टोकन'
  },
  review: {
    title: 'क्लिनिकल सारांश आणि टोकन पावती',
    subtitle: 'आपली सर्व माहिती डॉक्टरांच्या कम्प्युटरवर सुरक्षित पाठवली गेली आहे.',
    confirmSubmit: 'ओपीडीमध्ये नोंदवा (Confirm)',
    downloadPdf: 'पर्ची डाउनलोड करा (PDF)',
    printSlip: 'टोकन पावती प्रिंट करा',
    feedbackButton: 'अनुभव रेटिंग द्या',
    audioPhrase: 'आपली ओपीडी टोकन पावती तयार आहे. कृपया डॉक्टरांच्या केबिनबाहेर प्रतीक्षा करा.',
    doctorBrief: 'डॉक्टर सारांश',
    chiefComplaint: 'मुख्य त्रास',
    patientDetails: 'रुग्ण तपशील',
    vitals: 'शारीरिक तपासणी (Vitals)',
    submittedSuccess: 'यशस्वीरीत्या ओपीडीमध्ये नोंदवले गेले!'
  }
};

export const baseBengali: Translations = {
  ...baseEnglish,
  appTitle: 'স্মার্ট ওপিডি কিয়স্ক ও ডাক্তার সহকারী',
  kioskTag: 'স্মার্ট ওপিডি কিয়স্ক',
  kioskSubTag: 'সুরক্ষিত স্বাস্থ্য সহকারী',
  assignedToken: 'আপনার টোকেন নম্বর',
  doctorVoiceActive: 'ডাক্তারের ভয়েস সক্রিয়',
  emergencyAlert: 'জরুরি সতর্কতা',
  next: 'পরবর্তী ধাপ',
  back: 'ফিরে যান',
  submit: 'জমা দিন',
  save: 'সংরক্ষণ করুন',
  cancel: 'বাতিল',
  loading: 'অপেক্ষা করুন...',
  selectLanguage: 'ভাষা নির্বাচন করুন',
  steps: {
    identity: { label: 'পরিচয় ও বিবরণ', subLabel: 'Patient Profile' },
    consent: { label: 'সম্মতি পত্র', subLabel: 'Digital Consent' },
    department: { label: 'বিভাগ নির্বাচন', subLabel: 'OPD Department' },
    interview: { label: 'লক্ষণ ও কথোপকথন', subLabel: 'Voice & Touch Q&A' },
    documents: { label: 'প্রেসক্রিপশন ও রিপোর্ট', subLabel: 'Document Scan' },
    review: { label: 'সারসংক্ষেপ ও টোকেন', subLabel: 'Summary & Token Slip' }
  },
  identity: {
    title: 'রোগীর পরিচয় ও আভা (ABHA) যাচাই',
    subtitle: 'মোবাইল নম্বর লিখুন বা আভা কিউআর কোড স্ক্যান করুন।',
    scanAbha: 'আভা স্ক্যান (ABHA QR)',
    fullName: 'রোগীর পুরো নাম',
    fullNamePlaceholder: 'যেমন: অমল সেনগুপ্ত',
    mobile: 'মোবাইল নম্বর',
    mobilePlaceholder: '১০ ডিজিটের মোবাইল নম্বর',
    age: 'বয়স (বছর)',
    gender: 'লিঙ্গ',
    genderMale: 'পুরুষ (Male)',
    genderFemale: 'মহিলা (Female)',
    genderOther: 'অন্যান্য (Other)',
    abhaId: 'আভা আইডি / স্বাস্থ্য কার্ড (ঐচ্ছিক)',
    abhaPlaceholder: 'যেমন: 91-4521-8890-1234',
    abhaLinked: 'আভা লিংক সম্পন্ন',
    secureSession: 'সুরক্ষিত এনক্রিপ্ট করা সেশন',
    nextConsent: 'পরবর্তী: ডিজিটাল সম্মতি পত্র',
    abhaSuccessPhrase: 'আভা আইডি সফলভাবে যাচাই করা হয়েছে।'
  },
  consent: {
    title: 'তথ্য সুরক্ষা ও ডিজিটাল সম্মতি পত্র',
    audioExplanation: 'অডিওতে সম্মতি বিবরণ শুনুন',
    dpdpBadge: 'সুরক্ষিত সম্মতি',
    clause1Title: 'শুধুমাত্র চিকিৎসার উদ্দেশ্যে',
    clause1: 'আমার স্বাস্থ্য সংক্রান্ত তথ্য শুধুমাত্র ডাক্তারের পরামর্শের জন্য ব্যবহার করা হবে।',
    clause2Title: 'নথিপত্র সুরক্ষা',
    clause2: 'আমার আগের প্রেসক্রিপশন ও টেস্ট রিপোর্ট সুরক্ষিতভাবে স্ক্যান করা হবে।',
    clause3Title: 'স্বয়ংক্রিয় রিসেট',
    clause3: 'সেশন শেষ হওয়ার সাথে সাথে স্ক্রিন রিসেট হবে ও গোপনীয়তা বজায় থাকবে।',
    consentCheck: 'আমি আমার স্বাস্থ্য পরীক্ষার জন্য সম্মতি প্রদান করছি।',
    agreeButton: 'আমি সম্মত এবং এগিয়ে যেতে চাই',
    audioExplanationText: 'এই ওপিডি কিয়স্ক আপনার সুবিধার জন্য। আপনার লক্ষণ ও রিপোর্ট শুধুমাত্র ডাক্তারের কাছে পাঠানো হবে।'
  },
  department: {
    title: 'ওপিডি বিভাগ নির্বাচন করুন',
    subtitle: 'যে বিভাগের ডাক্তার দেখাতে চান সেই বিভাগে স্পর্শ করুন।',
    inQueue: 'অপেক্ষায় আছেন',
    audioPhrase: 'বিভাগ নির্বাচন করা হয়েছে। এবার আপনার সমস্যা সম্পর্কে কথা বলা যাক।',
    deptLabels: {
      general_medicine: 'জেনারেল মেডিসিন (General Medicine)',
      cardiology: 'হৃদরোগ বিভাগ (Cardiology)',
      orthopedics: 'হাড় ও জোড়া বিভাগ (Orthopedics)',
      pediatrics: 'শিশু বিশেষজ্ঞ (Pediatrics)',
      gynecology: 'স্ত্রী ও প্রসূতি রোগ (Gynecology)',
      ayush_ayurveda: 'আয়ুষ ও আয়ুর্বেদ (AYUSH)',
      pulmonology: 'ফুসফুস ও বক্ষব্যাধি (Pulmonology)',
      ent: 'নাক, কান ও গলা (ENT)'
    }
  },
  interview: {
    title: 'লক্ষণ ও কথোপকথন',
    questionPrefix: 'প্রশ্ন',
    doctorSpeaking: 'ডাক্তার কথা বলছেন...',
    repeatAudio: 'ডাক্তারের কথা পুনরায় শুনুন',
    tapToSpeak: 'মুখে বলুন (মাইক্রোফোন)',
    tapToStop: 'বলা শেষ করুন',
    chooseQuickAnswer: 'অথবা নীচের বিকল্পগুলি থেকে বেছে নিন:',
    yourSpokenResponse: 'আপনার রেকর্ড করা উত্তর:',
    typeAnswerPlaceholder: 'এখানে উত্তর লিখুন...',
    proceedToScanner: 'পরবর্তী: পুরোনো প্রেসক্রিপশন স্ক্যান করুন',
    emergencyAlertTitle: 'জরুরি সতর্কতা পাঠানো হয়েছে',
    emergencyAlertDesc: 'গুরুতর লক্ষণ চিহ্নিত হয়েছে। ওপিডি নার্সকে সতর্কতা পাঠানো হয়েছে।',
    initialQuestion: 'আজ আপনি কোন শারীরিক সমস্যার জন্য ডাক্তার দেখাতে এসেছেন?',
    initialAudioPrompt: 'নমস্কার। অনুগ্রহ করে বলুন আজকে আপনার প্রধান শারীরিক সমস্যা কী?',
    initialOptions: [
      'বুকে চাপ ও ব্যথা (Chest Pain)',
      'তীব্র জ্বর ও শরীর ব্যথা (Fever)',
      'পেটে তীব্র ব্যথা ও অম্বল (Stomach Pain)',
      'হাঁটুর ও গাঁটের ব্যথা (Joint Pain)',
      'কাশি ও শ্বাসকষ্ট (Cough / Breathless)'
    ]
  },
  scanner: {
    title: 'পুরোনো প্রেসক্রিপশন ও রিপোর্ট স্ক্যান করুন',
    subtitle: 'আপনার প্রেসক্রিপশনের ওষুধগুলি তাৎক্ষণিকভাবে শনাক্ত করা হবে।',
    scanButton: 'ক্যামেরা দিয়ে স্ক্যান করুন',
    uploadButton: 'ফাইল বা ছবি আপলোড করুন',
    analyzingText: 'প্রেসক্রিপশন পরীক্ষা করা হচ্ছে...',
    extractedMeds: 'চিহ্নিত ওষুধসমূহ (Medications)',
    extractedDx: 'পূর্ববর্তী রোগ ও নির্ণয় (Diagnosis)',
    audioPhrase: 'প্রেসক্রিপশন স্ক্যান সম্পন্ন হয়েছে। এবার সারসংক্ষেপ পর্যালোচনা করুন।',
    nextReview: 'পরবর্তী: সারসংক্ষেপ ও টোকেন'
  },
  review: {
    title: 'সারসংক্ষেপ ও ওপিডি টোকেন স্লিপ',
    subtitle: 'আপনার সমস্ত তথ্য ডাক্তারের কাছে নিরাপদে পৌঁছে গেছে।',
    confirmSubmit: 'ওপিডি তে নিশ্চিত করুন',
    downloadPdf: 'স্লিপ ডাউনলোড করুন (PDF)',
    printSlip: 'টোকেন স্লিপ প্রিন্ট করুন',
    feedbackButton: 'মতামত দিন',
    audioPhrase: 'আপনার ওপিডি টোকেন প্রস্তুত। অনুগ্রহ করে ডাক্তারের রুমের বাইরে অপেক্ষা করুন।',
    doctorBrief: 'ডাক্তারের ব্রিফ',
    chiefComplaint: 'প্রধান সমস্যা',
    patientDetails: 'রোগীর বিবরণ',
    vitals: 'শারীরিক লক্ষণ (Vitals)',
    submittedSuccess: 'সফলভাবে ওপিডি সারিতে যুক্ত হয়েছে!'
  }
};

export const baseTamil: Translations = {
  ...baseEnglish,
  appTitle: 'ஸ்மார்ட் OPD கியோஸ்க் மற்றும் மருத்துவர் உதவியாளர்',
  kioskTag: 'ஸ்மார்ட் OPD கியோஸ்க்',
  kioskSubTag: 'பாதுகாப்பான மருத்துவ உதவியாளர்',
  assignedToken: 'உங்கள் டோக்கன் எண்',
  doctorVoiceActive: 'மருத்துவர் குரல் இயங்குகிறது',
  emergencyAlert: 'அவசர சிகிச்சை எச்சரிக்கை',
  next: 'அடுத்து செல்லவும்',
  back: 'பின்னால்',
  submit: 'சமர்ப்பிக்கவும்',
  save: 'சேமிக்கவும்',
  cancel: 'ரத்து செய்',
  loading: 'காத்திருக்கவும்...',
  selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
  steps: {
    identity: { label: 'அடையாளம் & விவரங்கள்', subLabel: 'Patient Profile' },
    consent: { label: 'சம்மதப் படிவம்', subLabel: 'Digital Consent' },
    department: { label: 'துறை தேர்வு', subLabel: 'OPD Department' },
    interview: { label: 'அறிகுறிகள் & உரையாடல்', subLabel: 'Voice & Touch Q&A' },
    documents: { label: 'மருந்துச் சீட்டுகள்', subLabel: 'Document Scan' },
    review: { label: 'மதிப்பாய்வு & டோக்கன்', subLabel: 'Summary & Token Slip' }
  },
  identity: {
    title: 'நோயாளி அடையாளம் & ஆபா (ABHA) சரிபார்ப்பு',
    subtitle: 'மொபைல் எண்ணை உள்ளிடவும் அல்லது ஆபா QR குறியீட்டை ஸ்கேன் செய்யவும்.',
    scanAbha: 'ஆபா ஸ்கேன் (ABHA QR)',
    fullName: 'முழு பெயர்',
    fullNamePlaceholder: 'எ.கா. கார்த்திக் குமார்',
    mobile: 'மொபைல் எண்',
    mobilePlaceholder: '10 இலக்க மொபைல் எண்',
    age: 'வயது (ஆண்டுகள்)',
    gender: 'பாலினம்',
    genderMale: 'ஆண் (Male)',
    genderFemale: 'பெண் (Female)',
    genderOther: 'மற்றவை (Other)',
    abhaId: 'ஆபா எண் / சுகாதார அட்டை (விருப்பத்தேர்வு)',
    abhaPlaceholder: 'எ.கா. 91-4521-8890-1234',
    abhaLinked: 'ஆபா இணைக்கப்பட்டது',
    secureSession: 'பாதுகாப்பான அமர்வு',
    nextConsent: 'அடுத்து: டிஜிட்டல் சம்மதம்',
    abhaSuccessPhrase: 'ஆபா எண் வெற்றிகரமாக சரிபார்க்கப்பட்டு இணைக்கப்பட்டது.'
  },
  consent: {
    title: 'நோயாளி தகவல் பாதுகாப்பு & டிஜிட்டல் சம்மதம்',
    audioExplanation: 'சம்மத விவரங்களைக் குரலில் கேட்கவும்',
    dpdpBadge: 'பாதுகாப்பான சம்மதம்',
    clause1Title: 'மருத்துவ நோக்கங்களுக்காக மட்டும்',
    clause1: 'எனது உடல்நலத் தகவல்கள் மருத்துவ ஆலோசனைக்காக மட்டுமே பயன்படுத்தப்படும்.',
    clause2Title: 'ஆவணப் பாதுகாப்பு',
    clause2: 'எனது முந்தைய மருந்துச் சீட்டுகள் மற்றும் அறிக்கைகள் பாதுகாப்பாக சேமிக்கப்படும்.',
    clause3Title: 'தானியங்கி மீட்டமைப்பு',
    clause3: 'இந்த அமர்வு முடிந்ததும் திரை தானாகவே மீட்டமைக்கப்படும்.',
    consentCheck: 'மருத்துவ பரிசோதனைக்காக நான் முழு சம்மதம் அளிக்கிறேன்.',
    agreeButton: 'நான் ஏற்றுக்கொள்கிறேன்',
    audioExplanationText: 'இந்த கியோஸ்க் உங்கள் நேரத்தை மிச்சப்படுத்துகிறது. உங்கள் தகவல்கள் மருத்துவரிடம் மட்டுமே பகிரப்படும்.'
  },
  department: {
    title: 'OPD துறையைத் தேர்ந்தெடுக்கவும்',
    subtitle: 'நீங்கள் பார்க்க விரும்பும் மருத்துவ துறையைத் தொட்டு தேர்வு செய்யவும்.',
    inQueue: 'காத்திருப்போர்',
    audioPhrase: 'துறை தேர்ந்தெடுக்கப்பட்டது. இப்போது உங்கள் அறிகுறிகளைப் பற்றிப் பேசுவோம்.',
    deptLabels: {
      general_medicine: 'பொது மருத்துவம் (General Medicine)',
      cardiology: 'இதயவியல் பிரிவு (Cardiology)',
      orthopedics: 'எலும்பு மற்றும் மூட்டு பிரிவு (Orthopedics)',
      pediatrics: 'குழந்தைகள் நல மருத்துவம் (Pediatrics)',
      gynecology: 'மகளிர் மற்றும் மகப்பேறு (Gynecology)',
      ayush_ayurveda: 'ஆயுஷ் மற்றும் ஆயுர்வேதம் (AYUSH)',
      pulmonology: 'நுரையீரல் பிரிவு (Pulmonology)',
      ent: 'காது, மூக்கு, தொண்டை (ENT)'
    }
  },
  interview: {
    title: 'அறிகுறிகள் & உரையாடல்',
    questionPrefix: 'கேள்வி',
    doctorSpeaking: 'மருத்துவர் பேசுகிறார்...',
    repeatAudio: 'மருத்துவர் குரலை மீண்டும் கேட்கவும்',
    tapToSpeak: 'பேசிப் பதிலளிக்கவும் (மைக்)',
    tapToStop: 'பேசுவதை நிறுத்தவும்',
    chooseQuickAnswer: 'அல்லது கீழே உள்ள விடைகளில் ஒன்றைத் தேர்ந்தெடுக்கவும்:',
    yourSpokenResponse: 'பதிவு செய்யப்பட்ட பதில்:',
    typeAnswerPlaceholder: 'இங்கே உங்கள் பதிலை தட்டச்சு செய்யவும்...',
    proceedToScanner: 'அடுத்து: பழைய மருந்துச் சீட்டை ஸ்கேன் செய்யவும்',
    emergencyAlertTitle: 'அவசர சிகிச்சை எச்சரிக்கை அனுப்பப்பட்டது',
    emergencyAlertDesc: 'தீவிர அறிகுறிகள் கண்டறியப்பட்டுள்ளன. செவிலியருக்கு தகவல் தெரிவிக்கப்பட்டது.',
    initialQuestion: 'இன்று நீங்கள் மருத்துவரிடம் வரக் காரணமான முக்கிய உடல் உபாதை என்ன?',
    initialAudioPrompt: 'வணக்கம். இன்று உங்களுக்கு என்ன உடல்நலப் பிரச்சனை உள்ளது என்று தயவுசெய்து கூறுங்கள்.',
    initialOptions: [
      'மார்பில் பாரம் மற்றும் வலி (Chest Pain)',
      'கடுமையான காய்ச்சல் & உடல் வலி (Fever)',
      'வயிற்று வலி மற்றும் அசிடிட்டி (Stomach Pain)',
      'மூட்டு மற்றும் முழங்கால் வலி (Joint Pain)',
      'தொடர் இருமல் மற்றும் மூச்சுத் திணறல் (Cough)'
    ]
  },
  scanner: {
    title: 'பழைய மருந்துச் சீட்டுகளை ஸ்கேன் செய்யவும்',
    subtitle: 'உங்கள் மருந்துச் சீட்டில் உள்ள மருந்துகள் உடனே பிரித்தெடுக்கப்படும்.',
    scanButton: 'கேமரா மூலம் ஸ்கேன் செய்யவும்',
    uploadButton: 'கோப்பு அல்லது புகைப்படத்தைப் பதிவேற்றவும்',
    analyzingText: 'ஆவணம் பரிசீலிக்கப்படுகிறது...',
    extractedMeds: 'கண்டறியப்பட்ட மருந்துகள் (Medications)',
    extractedDx: 'முந்தைய நோய்கள் (Diagnosis)',
    audioPhrase: 'மருந்துச் சீட்டு ஸ்கேன் செய்யப்பட்டது. இப்போது நீங்கள் விவரங்களை மதிப்பாய்வு செய்யலாம்.',
    nextReview: 'அடுத்து: மதிப்பாய்வு & டோக்கன்'
  },
  review: {
    title: 'மருத்துவ சுருக்கம் மற்றும் டோக்கன் சீட்டு',
    subtitle: 'உங்கள் விவரங்கள் மருத்துவரின் கணினிக்கு அனுப்பப்பட்டுள்ளன.',
    confirmSubmit: 'OPD இல் உறுதிப்படுத்தவும்',
    downloadPdf: 'சீட்டை பதிவிறக்கவும் (PDF)',
    printSlip: 'டோக்கனை அச்சிடவும்',
    feedbackButton: 'கருத்து தெரிவிக்கவும்',
    audioPhrase: 'உங்கள் OPD டோக்கன் தயார். தயவுசெய்து மருத்துவர் அறைக்கு வெளியே காத்திருக்கவும்.',
    doctorBrief: 'மருத்துவர் சுருக்கம்',
    chiefComplaint: 'முக்கிய பிரச்சனை',
    patientDetails: 'நோயாளி விவரங்கள்',
    vitals: 'உடல் பரிசோதனை (Vitals)',
    submittedSuccess: 'வெற்றிகரமாக பதிவு செய்யப்பட்டது!'
  }
};

export const baseTelugu: Translations = {
  ...baseEnglish,
  appTitle: 'స్మార్ట్ OPD కియోస్క్ మరియు డాక్టర్ అసిస్టెంట్',
  kioskTag: 'స్మార్ట్ OPD కియోస్క్',
  kioskSubTag: 'సురక్షిత వైద్య సహాయకుడు',
  assignedToken: 'మీ టోకెన్ నంబర్',
  doctorVoiceActive: 'డాక్టర్ వాయిస్ ఆన్‌లో ఉంది',
  emergencyAlert: 'అత్యవసర ట్రయాజ్ హెచ్చరిక',
  next: 'ముందుకు వెళ్ళండి',
  back: 'వెనుకకు',
  submit: 'సమర్పించండి',
  save: 'సేవ్ చేయండి',
  cancel: 'రద్దు చేయండి',
  loading: 'దయచేసి వేచి ఉండండి...',
  selectLanguage: 'భాషను ఎంచుకోండి',
  steps: {
    identity: { label: 'గుర్తింపు & వివరాలు', subLabel: 'Patient Profile' },
    consent: { label: 'సమ్మతి పత్రం', subLabel: 'Digital Consent' },
    department: { label: 'విభాగం ఎంపిక', subLabel: 'OPD Department' },
    interview: { label: 'లక్షణాలు & సంభాషణ', subLabel: 'Voice & Touch Q&A' },
    documents: { label: 'ప్రిస్క్రిప్షన్ & రిపోర్ట్‌లు', subLabel: 'Document Scan' },
    review: { label: 'సమీక్ష & టోకెన్', subLabel: 'Summary & Token Slip' }
  },
  identity: {
    title: 'రోగి గుర్తింపు & ఆభా (ABHA) ధృవీకరణ',
    subtitle: 'మొబైల్ నంబర్‌ను నమోదు చేయండి లేదా ఆభా QR కోడ్‌ను స్కాన్ చేయండి.',
    scanAbha: 'ఆభా స్కాన్ (ABHA QR)',
    fullName: 'రోగి పూర్తి పేరు',
    fullNamePlaceholder: 'ఉదా. శ్రీనివాస రావు',
    mobile: 'మొబైల్ నంబర్',
    mobilePlaceholder: '10 అంకెల మొబైల్ నంబర్',
    age: 'వయస్సు (సంవత్సరాలు)',
    gender: 'లింగం',
    genderMale: 'పురుషుడు (Male)',
    genderFemale: 'స్త్రీ (Female)',
    genderOther: 'ఇతర (Other)',
    abhaId: 'ఆభా ఐడీ / హెల్త్ కార్డ్ (ఐచ్ఛికం)',
    abhaPlaceholder: 'ఉదా. 91-4521-8890-1234',
    abhaLinked: 'ఆభా లింక్ చేయబడింది',
    secureSession: 'సురక్షిత ఎన్‌క్రిప్టెడ్ సెషన్',
    nextConsent: 'తరువాత: డిజిటల్ సమ్మతి పత్రం',
    abhaSuccessPhrase: 'ఆభా ఐడీ విజయవంతంగా ధృవీకరించబడింది మరియు లింక్ చేయబడింది.'
  },
  consent: {
    title: 'రోగి డేటా భద్రత & డిజిటల్ సమ్మతి పత్రం',
    audioExplanation: 'సమ్మతి వివరాలను వాయిస్‌లో వినండి',
    dpdpBadge: 'సురక్షిత సమ్మతి',
    clause1Title: 'వైద్య చికిత్స కొరకు మాత్రమే',
    clause1: 'నా ఆరోగ్య సమాచారం డాక్టర్ సంప్రదింపుల కోసం మాత్రమే ఉపయోగించబడుతుంది.',
    clause2Title: 'పత్రాల భద్రత',
    clause2: 'నా మునుపటి రిపోర్ట్‌లు మరియు ప్రిస్క్రిప్షన్‌లు సురక్షితంగా స్కాన్ చేయబడతాయి.',
    clause3Title: 'ఆటోమేటిక్ రీసెట్',
    clause3: 'ఈ సెషన్ ముగిసిన వెంటనే స్క్రీన్ రీసెట్ అవుతుంది మరియు గోప్యత రక్షించబడుతుంది.',
    consentCheck: 'నా వైద్య పరీక్ష మరియు డేటా విశ్లేషణ కొరకు నేను పూర్తి సమ్మతిని ఇస్తున్నాను.',
    agreeButton: 'నేను అంగీకరిస్తున్నాను',
    audioExplanationText: 'ఈ ఓపీడీ కియోస్క్ మీ సమయాన్ని ఆదా చేస్తుంది. మీ వివరాలు డాక్టర్‌కు మాత్రమే పంపబడతాయి.'
  },
  department: {
    title: 'OPD విభాగాన్ని ఎంచుకోండి',
    subtitle: 'మీరు సంప్రదించాలనుకుంటున్న విభాగాన్ని టచ్ చేయండి.',
    inQueue: 'వేచి ఉన్నారు',
    audioPhrase: 'విభాగం ఎంచుకోబడింది. ఇప్పుడు మీ సమస్య గురించి మాట్లాడదాం.',
    deptLabels: {
      general_medicine: 'జనరల్ మెడిసిన్ (General Medicine)',
      cardiology: 'కార్డియాలజీ విభాగం (Cardiology)',
      orthopedics: 'ఎముకలు & కీళ్ళ విభాగం (Orthopedics)',
      pediatrics: 'పిల్లల వైద్య నిపుణులు (Pediatrics)',
      gynecology: 'స్త్రీ జననేంద్రియ & ప్రసూతి (Gynecology)',
      ayush_ayurveda: 'ఆయుష్ & ఆయుర్వేదం (AYUSH)',
      pulmonology: 'శ్వాసకోశ విభాగం (Pulmonology)',
      ent: 'చెవి, ముక్కు, గొంతు (ENT)'
    }
  },
  interview: {
    title: 'లక్షణాలు & సంభాషణ',
    questionPrefix: 'ప్రశ్న',
    doctorSpeaking: 'డాక్టర్ మాట్లాడుతున్నారు...',
    repeatAudio: 'డాక్టర్ వాయిస్ మళ్ళీ వినండి',
    tapToSpeak: 'మాట్లాడి సమాధానం ఇవ్వండి (మైక్రోఫోన్)',
    tapToStop: 'మాట్లాడటం ముగించండి',
    chooseQuickAnswer: 'లేదా క్రింది సమాధానాలలో ఒకదాన్ని ఎంచుకోండి:',
    yourSpokenResponse: 'రికార్డ్ చేయబడిన మీ సమాధానం:',
    typeAnswerPlaceholder: 'మీ సమాధానాన్ని ఇక్కడ టైప్ చేయండి...',
    proceedToScanner: 'తరువాత: పాత ప్రిస్క్రిప్షన్ స్కాన్ చేయండి',
    emergencyAlertTitle: 'అత్యవసర హెచ్చరిక పంపబడింది',
    emergencyAlertDesc: 'తీవ్రమైన లక్షణాలు కనుగొనబడ్డాయి. నర్సుకు సమాచారం అందించబడింది.',
    initialQuestion: 'ఈరోజు మీరు డాక్టర్‌ను కలవడానికి వచ్చిన ప్రధాన ఆరోగ్య సమస్య ఏమిటి?',
    initialAudioPrompt: 'నమస్కారం. దయచేసి ఈరోజు మీకు ఉన్న ప్రధాన శారీరక సమస్య ఏమిటో చెప్పండి.',
    initialOptions: [
      'ఛాతీలో బరువు & నొప్పి (Chest Pain)',
      'తీవ్రమైన జ్వరం & ఒళ్ళు నొప్పులు (Fever)',
      'కడుపులో తీవ్రమైన నొప్పి & ఎసిడిటీ (Stomach Pain)',
      'కీళ్ళు & మోకాళ్ళ నొప్పులు (Joint Pain)',
      'దగ్గు & శ్వాస తీసుకోవడంలో ఇబ్బంది (Cough)'
    ]
  },
  scanner: {
    title: 'పాత ప్రిస్క్రిప్షన్ & రిపోర్ట్‌లను స్కాన్ చేయండి',
    subtitle: 'మీ పత్రాలలోని మందులు డాక్టర్ కోసం వెంటనే గుర్తించబడతాయి.',
    scanButton: 'కెమెరాతో స్కాన్ చేయండి',
    uploadButton: 'ఫోటో లేదా ఫైల్‌ను అప్‌లోడ్ చేయండి',
    analyzingText: 'ప్రిస్క్రిప్షన్ పరిశీలించబడుతోంది...',
    extractedMeds: 'గుర్తించబడిన మందులు (Medications)',
    extractedDx: 'మునుపటి వ్యాధులు (Diagnosis)',
    audioPhrase: 'ప్రిస్క్రిప్షన్ స్కాన్ పూర్తయింది. ఇప్పుడు మీరు సారాంశాన్ని సమీక్షించవచ్చు.',
    nextReview: 'తరువాత: సమీక్ష & టోకెన్'
  },
  review: {
    title: 'క్లినికల్ సారాంశం మరియు టోకెన్ స్లిప్',
    subtitle: 'మీ సమాచారం మొత్తం డాక్టర్ కంప్యూటర్‌కు సురక్షితంగా పంపబడింది.',
    confirmSubmit: 'OPD లో నమోదు చేయండి',
    downloadPdf: 'స్లిప్‌ను డౌన్‌లోడ్ చేయండి (PDF)',
    printSlip: 'టోకెన్ ప్రింట్ చేయండి',
    feedbackButton: 'అనుభవాన్ని రేట్ చేయండి',
    audioPhrase: 'మీ OPD టోకెన్ సిద్ధంగా ఉంది. దయచేసి డాక్టర్ గది వెలుపల వేచి ఉండండి.',
    doctorBrief: 'డాక్టర్ సారాంశం',
    chiefComplaint: 'ప్రధాన సమస్య',
    patientDetails: 'రోగి వివరాలు',
    vitals: 'శారీరక పరీక్ష (Vitals)',
    submittedSuccess: 'విజయవంతంగా నమోదు చేయబడింది!'
  }
};

export const baseGujarati: Translations = {
  ...baseHindi,
  appTitle: 'સ્માર્ટ OPD કિયોસ્ક અને ડૉક્ટર સહાયક',
  kioskTag: 'સ્માર્ટ OPD કિયોસ્ક',
  kioskSubTag: 'સુરક્ષિત તબીબી સહાયક',
  assignedToken: 'તમારો ટોકન નંબર',
  doctorVoiceActive: 'ડૉક્ટરનો અવાજ ચાલુ છે',
  emergencyAlert: 'ઇમરજન્સી ટ્રાયજ ચેતવણી',
  next: 'આગળ વધો',
  back: 'પાછા જાઓ',
  submit: 'સબમિટ કરો',
  save: 'સાચવો',
  cancel: 'રદ કરો',
  loading: 'કૃપા કરીને રાહ જુઓ...',
  selectLanguage: 'ભાષા પસંદ કરો',
  steps: {
    identity: { label: 'ઓળખ અને વિગતો', subLabel: 'Patient Profile' },
    consent: { label: 'સંમતિ પત્ર', subLabel: 'Digital Consent' },
    department: { label: 'વિભાગ પસંદગી', subLabel: 'OPD Department' },
    interview: { label: 'લક્ષણો અને વાતચીત', subLabel: 'Voice & Touch Q&A' },
    documents: { label: 'દવાઓ અને રિપોર્ટ્સ', subLabel: 'Document Scan' },
    review: { label: 'સમીક્ષા અને ટોકન', subLabel: 'Summary & Token Slip' }
  },
  identity: {
    title: 'દર્દી ઓળખ અને આભા (ABHA) ચકાસણી',
    subtitle: 'મોબાઇલ નંબર દાખલ કરો અથવા આભા QR કોડ સ્કેન કરો.',
    scanAbha: 'આભા સ્કેન (ABHA QR)',
    fullName: 'દર્દીનું પૂરું નામ',
    fullNamePlaceholder: 'દા.ત. પરેશભાઈ પટેલ',
    mobile: 'મોબાઇલ નંબર',
    mobilePlaceholder: '૧૦ અંકનો મોબાઇલ નંબર',
    age: 'ઉંમર (વર્ષ)',
    gender: 'જાતિ',
    genderMale: 'પુરુષ (Male)',
    genderFemale: 'સ્ત્રી (Female)',
    genderOther: 'અન્ય (Other)',
    abhaId: 'આભા આઈડી / હેલ્થ કાર્ડ (વૈકલ્પિક)',
    abhaPlaceholder: 'દા.ત. 91-4521-8890-1234',
    abhaLinked: 'આભા લિંક થઈ ગયું',
    secureSession: 'સુરક્ષિત સત્ર',
    nextConsent: 'આગળ: ડિજિટલ સંમતિ પત્ર',
    abhaSuccessPhrase: 'આભા આઈડી સફળતાપૂર્વક ચકાસાયું અને લિંક થઈ ગયું.'
  },
  consent: {
    title: 'દર્દી ડેટા સુરક્ષા અને સંમતિ પત્ર',
    audioExplanation: 'સંમતિ વિગતો અવાજમાં સાંભળો',
    dpdpBadge: 'સુરક્ષિત સંમતિ',
    clause1Title: 'માત્ર તબીબી ઉપયોગ માટે',
    clause1: 'મારી સ્વાસ્થ્ય માહિતી માત્ર ડૉક્ટરની સલાહ માટે ઉપયોગમાં લેવાશે.',
    clause2Title: 'દસ્તાવેજ સુરક્ષા',
    clause2: 'મારા જૂના રિપોર્ટ્સ અને પ્રિસ્ક્રિપ્શન સુરક્ષિત રીતે સ્કેન થશે.',
    clause3Title: 'ઓટોમેટિક રીસેટ',
    clause3: 'સત્ર પૂર્ણ થતાં જ સ્ક્રીન રીસેટ થશે અને ગોપનીયતા જળવાશે.',
    consentCheck: 'હું મારી સારવાર અને તપાસ માટે પૂર્ણ સંમતિ આપું છું.',
    agreeButton: 'હું સહમત છું',
    audioExplanationText: 'આ OPD કિયોસ્ક તમારો સમય બચાવવા માટે છે. તમારી વિગતો માત્ર ડૉક્ટર સાથે શેર થશે.'
  },
  department: {
    title: 'OPD વિભાગ પસંદ કરો',
    subtitle: 'જે વિભાગના ડૉક્ટરને મળવું હોય તે વિભાગ પર સ્પર્શ કરો.',
    inQueue: 'પ્રતીક્ષામાં',
    audioPhrase: 'વિભાગ પસંદ થયો. ચાલો હવે તમારી તકલીફ વિશે વાત કરીએ.',
    deptLabels: {
      general_medicine: 'જનરલ મેડિસિન (General Medicine)',
      cardiology: 'હૃદયરોગ વિભાગ (Cardiology)',
      orthopedics: 'હાડકાં અને સાંધા વિભાગ (Orthopedics)',
      pediatrics: 'બાળરોગ નિષ્ણાત (Pediatrics)',
      gynecology: 'સ્ત્રીરોગ અને પ્રસૂતિ (Gynecology)',
      ayush_ayurveda: 'આયુષ અને આયુર્વેદ (AYUSH)',
      pulmonology: 'ફેફસાં અને શ્વસનતંત્ર (Pulmonology)',
      ent: 'કાન, નાક અને ગળું (ENT)'
    }
  },
  interview: {
    title: 'લક્ષણો અને વાતચીત',
    questionPrefix: 'પ્રશ્ન',
    doctorSpeaking: 'ડૉક્ટર બોલી રહ્યા છે...',
    repeatAudio: 'ડૉક્ટરનો અવાજ ફરી સાંભળો',
    tapToSpeak: 'બોલીને જવાબ આપો (માઇક)',
    tapToStop: 'બોલવાનું બંધ કરો',
    chooseQuickAnswer: 'અથવા નીચેના વિકલ્પોમાંથી પસંદ કરો:',
    yourSpokenResponse: 'તમારો રેકોર્ડ થયેલો જવાબ:',
    typeAnswerPlaceholder: 'અહીં તમારો જવાબ લખો...',
    proceedToScanner: 'આગળ: જૂનું પ્રિસ્ક્રિપ્શન સ્કેન કરો',
    emergencyAlertTitle: 'ઇમરજન્સી ચેતવણી મોકલાઈ',
    emergencyAlertDesc: 'ગંભીર લક્ષણો જણાયા છે. નર્સને જાણ કરવામાં આવી છે.',
    initialQuestion: 'આજે તમને કઈ મુખ્ય શારીરિક તકલીફ થઈ રહી છે?',
    initialAudioPrompt: 'નમસ્તે. કૃપા કરીને જણાવો કે આજે તમને શું મુખ્ય તકલીફ છે?',
    initialOptions: [
      'છાતીમાં ભારેપણું અને દુખાવો (Chest Pain)',
      'તીવ્ર તાવ અને શરીરનો દુખાવો (Fever)',
      'પેટમાં દુખાવો અને એસિડિટી (Stomach Pain)',
      'ગોઠણ અને સાંધાનો દુખાવો (Joint Pain)',
      'ખાંસી અને શ્વાસ લેવામાં તકલીફ (Cough)'
    ]
  },
  scanner: {
    title: 'જૂના પ્રિસ્ક્રિપ્શન અને રિપોર્ટ સ્કેન કરો',
    subtitle: 'તમારા પ્રિસ્ક્રિપ્શનની દવાઓ તરત જ ઓળખી લેવામાં આવશે.',
    scanButton: 'કેમેરા વડે સ્કેન કરો',
    uploadButton: 'ફોટો અથવા ફાઇલ અપલોડ કરો',
    analyzingText: 'પ્રિસ્ક્રિપ્શન ચકાસાઈ રહ્યું છે...',
    extractedMeds: 'ઓળખાયેલી દવાઓ (Medications)',
    extractedDx: 'અગાઉની બીમારીઓ (Diagnosis)',
    audioPhrase: 'પ્રિસ્ક્રિપ્શન સ્કેન થઈ ગયું છે. હવે તમે સારાંશ જોઈ શકો છો.',
    nextReview: 'આગળ: સમીક્ષા અને ટોકન'
  },
  review: {
    title: 'ક્લિનિકલ સારાંશ અને ટોકન સ્લિપ',
    subtitle: 'તમારી બધી વિગતો ડૉક્ટરના કમ્પ્યુટર પર મોકલી દેવામાં આવી છે.',
    confirmSubmit: 'OPD માં નોંધણી કરો',
    downloadPdf: 'સ્લિપ ડાઉનલોડ કરો (PDF)',
    printSlip: 'ટોકન સ્લિપ પ્રિન્ટ કરો',
    feedbackButton: 'અનુભવ રેટિંગ આપો',
    audioPhrase: 'તમારો ટોકન તૈયાર છે. કૃપા કરીને ડૉક્ટરની કેબિન બહાર રાહ જુઓ.',
    doctorBrief: 'ડૉક્ટર સારાંશ',
    chiefComplaint: 'મુખ્ય તકલીફ',
    patientDetails: 'દર્દીની વિગતો',
    vitals: 'શારીરિક માપણી (Vitals)',
    submittedSuccess: 'સફળતાપૂર્વક નોંધણી થઈ ગઈ છે!'
  }
};

export const basePunjabi: Translations = {
  ...baseEnglish,
  appTitle: 'ਸਮਾਰਟ ਓਪੀਡੀ ਕਿਓਸਕ ਤੇ ਡਾਕਟਰ ਸਹਾਇਕ',
  kioskTag: 'ਸਮਾਰਟ ਓਪੀਡੀ ਕਿਓਸਕ',
  kioskSubTag: 'ਸੁਰੱਖਿਅਤ ਸਿਹਤ ਸਹਾਇਕ',
  assignedToken: 'ਤੁਹਾਡਾ ਟੋਕਨ ਨੰਬਰ',
  doctorVoiceActive: 'ਡਾਕਟਰ ਦੀ ਆਵਾਜ਼ ਚਾਲੂ ਹੈ',
  emergencyAlert: 'ਐਮਰਜੈਂਸੀ ਚੇਤਾਵਨੀ',
  next: 'ਅੱਗੇ ਵਧੋ',
  back: 'ਪਿੱਛੇ',
  submit: 'ਜਮ੍ਹਾਂ ਕਰੋ',
  save: 'ਸੰਭਾਲੋ',
  cancel: 'ਰੱਦ ਕਰੋ',
  loading: 'ਉਡੀਕ ਕਰੋ...',
  selectLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',
  steps: {
    identity: { label: 'ਪਛਾਣ ਤੇ ਵੇਰਵੇ', subLabel: 'Patient Profile' },
    consent: { label: 'ਸਹਿਮਤੀ ਪੱਤਰ', subLabel: 'Digital Consent' },
    department: { label: 'ਵਿਭਾਗ ਚੋਣ', subLabel: 'OPD Department' },
    interview: { label: 'ਲੱਛਣ ਤੇ ਗੱਲਬਾਤ', subLabel: 'Voice & Touch Q&A' },
    documents: { label: 'ਪਰਚੀ ਤੇ ਰਿਪੋਰਟਾਂ', subLabel: 'Document Scan' },
    review: { label: 'ਸਮੀਖਿਆ ਤੇ ਪਰਚੀ', subLabel: 'Summary & Token Slip' }
  },
  identity: {
    title: 'ਮਰੀਜ਼ ਦੀ ਪਛਾਣ ਤੇ ਆਭਾ (ABHA) ਤਸਦੀਕ',
    subtitle: 'ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ ਜਾਂ ਆਭਾ QR ਕੋਡ ਸਕੈਨ ਕਰੋ।',
    scanAbha: 'ਆਭਾ ਸਕੈਨ (ABHA QR)',
    fullName: 'ਮਰੀਜ਼ ਦਾ ਪੂਰਾ ਨਾਮ',
    fullNamePlaceholder: 'ਜਿਵੇਂ: ਗੁਰਪ੍ਰੀਤ ਸਿੰਘ',
    mobile: 'ਮੋਬਾਈਲ ਨੰਬਰ',
    mobilePlaceholder: '10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ',
    age: 'ਉਮਰ (ਸਾਲ)',
    gender: 'ਲਿੰਗ',
    genderMale: 'ਪੁਰਸ਼ (Male)',
    genderFemale: 'ਔਰਤ (Female)',
    genderOther: 'ਹੋਰ (Other)',
    abhaId: 'ਆਭਾ ਆਈਡੀ / ਸਿਹਤ ਕਾਰਡ (ਵਿਕਲਪਿਕ)',
    abhaPlaceholder: 'ਜਿਵੇਂ: 91-4521-8890-1234',
    abhaLinked: 'ਆਭਾ ਲਿੰਕ ਹੋ ਗਿਆ',
    secureSession: 'ਸੁਰੱਖਿਅਤ ਸੈਸ਼ਨ',
    nextConsent: 'ਅੱਗੇ: ਡਿਜੀਟਲ ਸਹਿਮਤੀ ਪੱਤਰ',
    abhaSuccessPhrase: 'ਆਭਾ ਆਈਡੀ ਸਫਲਤਾਪੂਰਵਕ ਤਸਦੀਕ ਹੋ ਗਈ ਹੈ।'
  },
  consent: {
    title: 'ਮਰੀਜ਼ ਡਾਟਾ ਸੁਰੱਖਿਆ ਤੇ ਡਿਜੀਟਲ ਸਹਿਮਤੀ',
    audioExplanation: 'ਸਹਿਮਤੀ ਵੇਰਵੇ ਸੁਣੋ',
    dpdpBadge: 'ਸੁਰੱਖਿਅਤ ਸਹਿਮਤੀ',
    clause1Title: 'ਸਿਰਫ ਇਲਾਜ ਲਈ',
    clause1: 'ਮੇਰੀ ਸਿਹਤ ਜਾਣਕਾਰੀ ਸਿਰਫ ਡਾਕਟਰ ਦੀ ਸਲਾਹ ਲਈ ਵਰਤੀ ਜਾਵੇਗੀ।',
    clause2Title: 'ਦਸਤਾਵੇਜ਼ ਸੁਰੱਖਿਆ',
    clause2: 'ਮੇਰੀਆਂ ਪੁਰਾਣੀਆਂ ਪਰਚੀਆਂ ਤੇ ਰਿਪੋਰਟਾਂ ਸੁਰੱਖਿਅਤ ਸਕੈਨ ਹੋਣਗੀਆਂ।',
    clause3Title: 'ਆਟੋਮੈਟਿਕ ਰੀਸੈਟ',
    clause3: 'ਇਹ ਸੈਸ਼ਨ ਖਤਮ ਹੁੰਦੇ ਹੀ ਸਕ੍ਰੀਨ ਰੀਸੈਟ ਹੋ ਜਾਵੇਗੀ।',
    consentCheck: 'ਮੈਂ ਆਪਣੀ ਜਾਂਚ ਅਤੇ ਜਾਣਕਾਰੀ ਵਿਸ਼ਲੇਸ਼ਣ ਲਈ ਸਹਿਮਤੀ ਦਿੰਦਾ/ਦਿੰਦੀ ਹਾਂ।',
    agreeButton: 'ਮੈਂ ਸਹਿਮਤ ਹਾਂ',
    audioExplanationText: 'ਇਹ ਓਪੀਡੀ ਕਿਓਸਕ ਤੁਹਾਡਾ ਸਮਾਂ ਬਚਾਉਣ ਲਈ ਹੈ। ਜਾਣਕਾਰੀ ਸਿਰਫ ਡਾਕਟਰ ਕੋਲ ਜਾਵੇਗੀ।'
  },
  department: {
    title: 'ਓਪੀਡੀ ਵਿਭਾਗ ਚੁਣੋ',
    subtitle: 'ਜਿਸ ਵਿਭਾਗ ਦੇ ਡਾਕਟਰ ਨੂੰ ਦਿਖਾਉਣਾ ਹੈ ਉਸ ਉੱਤੇ ਟੱਚ ਕਰੋ।',
    inQueue: 'ਕਤਾਰ ਵਿੱਚ ਹਨ',
    audioPhrase: 'ਵਿਭਾਗ ਚੁਣਿਆ ਗਿਆ। ਆਓ ਹੁਣ ਤੁਹਾਡੀ ਤਕਲੀਫ ਬਾਰੇ ਗੱਲ ਕਰੀਏ।',
    deptLabels: {
      general_medicine: 'ਜਨਰਲ ਮੈਡੀਸਨ (General Medicine)',
      cardiology: 'ਦਿਲ ਦੇ ਰੋਗ (Cardiology)',
      orthopedics: 'ਹੱਡੀਆਂ ਤੇ ਜੋੜਾਂ ਦੇ ਰੋਗ (Orthopedics)',
      pediatrics: 'ਬੱਚਿਆਂ ਦੇ ਮਾਹਿਰ (Pediatrics)',
      gynecology: 'ਔਰਤਾਂ ਦੇ ਰੋਗ (Gynecology)',
      ayush_ayurveda: 'ਆਯੁਸ਼ ਅਤੇ ਆਯੁਰਵੇਦ (AYUSH)',
      pulmonology: 'ਛਾਤੀ ਅਤੇ ਫੇਫੜਿਆਂ ਦੇ ਰੋਗ (Pulmonology)',
      ent: 'ਕੰਨ, ਨੱਕ ਅਤੇ ਗਲਾ (ENT)'
    }
  },
  interview: {
    title: 'ਲੱਛਣ ਤੇ ਗੱਲਬਾਤ',
    questionPrefix: 'ਸਵਾਲ',
    doctorSpeaking: 'ਡਾਕਟਰ ਬੋਲ ਰਹੇ ਹਨ...',
    repeatAudio: 'ਡਾਕਟਰ ਦੀ ਆਵਾਜ਼ ਦੁਬਾਰਾ ਸੁਣੋ',
    tapToSpeak: 'ਬੋਲ ਕੇ ਜਵਾਬ ਦਿਓ (ਮਾਈਕ)',
    tapToStop: 'ਬੋਲਣਾ ਬੰਦ ਕਰੋ',
    chooseQuickAnswer: 'ਜਾਂ ਹੇਠਾਂ ਦਿੱਤੇ ਵਿਕਲਪਾਂ ਵਿੱਚੋਂ ਚੁਣੋ:',
    yourSpokenResponse: 'ਤੁਹਾਡਾ ਰਿਕਾਰਡ ਹੋਇਆ ਜਵਾਬ:',
    typeAnswerPlaceholder: 'ਇੱਥੇ ਆਪਣਾ ਜਵਾਬ ਲਿਖੋ...',
    proceedToScanner: 'ਅੱਗੇ: ਪੁਰਾਣੀ ਪਰਚੀ ਸਕੈਨ ਕਰੋ',
    emergencyAlertTitle: 'ਐਮਰਜੈਂਸੀ ਅਲਰਟ ਭੇਜਿਆ ਗਿਆ',
    emergencyAlertDesc: 'ਗੰਭੀਰ ਲੱਛਣ ਮਿਲੇ ਹਨ। ਨਰਸ ਨੂੰ ਜਾਣਕਾਰੀ ਭੇਜੀ ਗਈ ਹੈ।',
    initialQuestion: 'ਅੱਜ ਤੁਹਾਨੂੰ ਕਿਹੜੀ ਮੁੱਖ ਤਕਲੀਫ ਹੈ ਜਿਸ ਲਈ ਤੁਸੀਂ ਡਾਕਟਰ ਕੋਲ ਆਏ ਹੋ?',
    initialAudioPrompt: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੱਸੋ ਕਿ ਅੱਜ ਤੁਹਾਨੂੰ ਕੀ ਮੁੱਖ ਤਕਲੀਫ ਹੈ?',
    initialOptions: [
      'ਛਾਤੀ ਵਿੱਚ ਭਾਰੀਪਣ ਤੇ ਦਰਦ (Chest Pain)',
      'ਤੇਜ਼ ਬੁਖਾਰ ਤੇ ਸਰੀਰ ਦਰਦ (Fever)',
      'ਪੇਟ ਵਿੱਚ ਤੇਜ਼ ਦਰਦ ਤੇ ਗੈਸ (Stomach Pain)',
      'ਗੋਡਿਆਂ ਤੇ ਜੋੜਾਂ ਦਾ ਦਰਦ (Joint Pain)',
      'ਖੰਘ ਅਤੇ ਸਾਹ ਚੜ੍ਹਨਾ (Cough / Breathless)'
    ]
  },
  scanner: {
    title: 'ਪੁਰਾਣੀ ਪਰਚੀ ਤੇ ਟੈਸਟ ਰਿਪੋਰਟਾਂ ਸਕੈਨ ਕਰੋ',
    subtitle: 'ਤੁਹਾਡੀ ਪਰਚੀ ਵਿਚਲੀਆਂ ਦਵਾਈਆਂ ਤੁਰੰਤ ਪਛਾਣ ਲਈਆਂ ਜਾਣਗੀਆਂ।',
    scanButton: 'ਕੈਮਰੇ ਨਾਲ ਸਕੈਨ ਕਰੋ',
    uploadButton: 'ਫੋਟੋ ਜਾਂ ਫਾਈਲ ਅੱਪਲੋਡ ਕਰੋ',
    analyzingText: 'ਪਰਚੀ ਦੀ ਜਾਂਚ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...',
    extractedMeds: 'ਪਛਾਣੀਆਂ ਗਈਆਂ ਦਵਾਈਆਂ (Medications)',
    extractedDx: 'ਪੁਰਾਣੀਆਂ ਬਿਮਾਰੀਆਂ (Diagnosis)',
    audioPhrase: 'ਪਰਚੀ ਸਕੈਨ ਹੋ ਗਈ ਹੈ। ਹੁਣ ਤੁਸੀਂ ਵੇਰਵੇ ਦੇਖ ਸਕਦੇ ਹੋ।',
    nextReview: 'ਅੱਗੇ: ਸਮੀਖਿਆ ਤੇ ਪਰਚੀ'
  },
  review: {
    title: 'ਕਲੀਨਿਕਲ ਸਾਰਾਂਸ਼ ਅਤੇ ਟੋਕਨ ਪਰਚੀ',
    subtitle: 'ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਡਾਕਟਰ ਦੇ ਕੰਪਿਊਟਰ ਉੱਤੇ ਭੇਜ ਦਿੱਤੀ ਗਈ ਹੈ।',
    confirmSubmit: 'ਓਪੀਡੀ ਵਿੱਚ ਦਰਜ ਕਰੋ',
    downloadPdf: 'ਪਰਚੀ ਡਾਊਨਲੋਡ ਕਰੋ (PDF)',
    printSlip: 'ਟੋਕਨ ਪ੍ਰਿੰਟ ਕਰੋ',
    feedbackButton: 'ਰੇਟਿੰਗ ਦਿਓ',
    audioPhrase: 'ਤੁਹਾਡਾ ਟੋਕਨ ਤਿਆਰ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਡਾਕਟਰ ਦੇ ਕਮਰੇ ਦੇ ਬਾਹਰ ਉਡੀਕ ਕਰੋ।',
    doctorBrief: 'ਡਾਕਟਰ ਸਾਰਾਂਸ਼',
    chiefComplaint: 'ਮੁੱਖ ਤਕਲੀਫ',
    patientDetails: 'ਮਰੀਜ਼ ਦੇ ਵੇਰਵੇ',
    vitals: 'ਸਰੀਰਕ ਮਾਪ (Vitals)',
    submittedSuccess: 'ਸਫਲਤਾਪੂਰਵਕ ਦਰਜ ਹੋ ਗਿਆ!'
  }
};

export const baseKannada: Translations = {
  ...baseEnglish,
  appTitle: 'AI ಸ್ಮಾರ್ಟ್ OPD ಕಿಯೋಸ್ಕ್ ಮತ್ತು ವೈದ್ಯರ ಸಹಾಯಕ',
  kioskTag: 'ಸ್ಮಾರ್ಟ್ OPD ಕಿಯೋಸ್ಕ್',
  kioskSubTag: 'ಸುರಕ್ಷಿತ ವೈದ್ಯಕೀಯ ಸಹಾಯಕ',
  assignedToken: 'ನಿಮ್ಮ ಟೋಕನ್ ಸಂಖ್ಯೆ',
  doctorVoiceActive: 'ವೈದ್ಯರ ಧ್ವನಿ ಸಕ್ರಿಯವಾಗಿದೆ',
  emergencyAlert: 'ತುರ್ತು ಚಿಕಿತ್ಸಾ ಎಚ್ಚರಿಕೆ',
  next: 'ಮುಂದೆ',
  back: 'ಹಿಂದೆ',
  submit: 'ಸಲ್ಲಿಸಿ',
  save: 'ಉಳಿಸಿ',
  cancel: 'ರದ್ದುಮಾಡಿ',
  loading: 'ದಯವಿಟ್ಟು ಕಾಯಿರಿ...',
  selectLanguage: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
  steps: {
    identity: { label: 'ಗುರುತು ಮತ್ತು ವಿವರಗಳು', subLabel: 'Patient Profile' },
    consent: { label: 'ಒಪ್ಪಿಗೆ ಪತ್ರ', subLabel: 'Digital Consent' },
    department: { label: 'ವಿಭಾಗ ಆಯ್ಕೆ', subLabel: 'OPD Department' },
    interview: { label: 'ರೋಗಲಕ್ಷಣಗಳು & ಸಂಭಾಷಣೆ', subLabel: 'Voice & Touch Q&A' },
    documents: { label: 'ದಾಖಲೆಗಳು & ವರದಿಗಳು', subLabel: 'Document Scan' },
    review: { label: 'ಪರಿಶೀಲನೆ & ಟೋಕನ್', subLabel: 'Summary & Token Slip' }
  },
  identity: {
    title: 'ರೋಗಿಯ ಗುರುತು ಮತ್ತು ಆಭಾ (ABHA) ಪರಿಶೀಲನೆ',
    subtitle: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ ಅಥವಾ ಆಭಾ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.',
    scanAbha: 'ಆಭಾ ಸ್ಕ್ಯಾನ್ (ABHA QR)',
    fullName: 'ರೋಗಿಯ ಪೂರ್ಣ ಹೆಸರು',
    fullNamePlaceholder: 'ಉದಾ. ಮಂಜುನಾಥ್',
    mobile: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    mobilePlaceholder: '10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    age: 'ವಯಸ್ಸು (ವರ್ಷಗಳು)',
    gender: 'ಲಿಂಗ',
    genderMale: 'ಪುರುಷ (Male)',
    genderFemale: 'ಮಹಿಳೆ (Female)',
    genderOther: 'ಇತರ (Other)',
    abhaId: 'ಆಭಾ ಐಡಿ / ಆರೋಗ್ಯ ಕಾರ್ಡ್ (ಐಚ್ಛಿಕ)',
    abhaPlaceholder: 'ಉದಾ. 91-4521-8890-1234',
    abhaLinked: 'ಆಭಾ ಲಿಂಕ್ ಆಗಿದೆ',
    secureSession: 'ಸುರಕ್ಷಿತ ಸೆಷನ್',
    nextConsent: 'ಮುಂದೆ: ಡಿಜಿಟಲ್ ಒಪ್ಪಿಗೆ ಪತ್ರ',
    abhaSuccessPhrase: 'ಆಭಾ ಐಡಿ ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ ಮತ್ತು ಲಿಂಕ್ ಆಗಿದೆ.'
  },
  consent: {
    title: 'ರೋಗಿಯ ಡೇಟಾ ಸುರಕ್ಷತೆ ಮತ್ತು ಡಿಜಿಟಲ್ ಒಪ್ಪಿಗೆ',
    audioExplanation: 'ಒಪ್ಪಿಗೆ ವಿವರಗಳನ್ನು ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ',
    dpdpBadge: 'ಸುರಕ್ಷಿತ ಒಪ್ಪಿಗೆ',
    clause1Title: 'ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆಗಾಗಿ ಮಾತ್ರ',
    clause1: 'ನನ್ನ ಆರೋಗ್ಯ ಮಾಹಿತಿಯನ್ನು ವೈದ್ಯರ ಸಲಹೆಗಾಗಿ ಮಾತ್ರ ಬಳಸಲಾಗುತ್ತದೆ.',
    clause2Title: 'ದಾಖಲೆಗಳ ಸುರಕ್ಷತೆ',
    clause2: 'ನನ್ನ ಹಳೆಯ ವರದಿಗಳು ಮತ್ತು ಚೀಟಿಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಲಾಗುತ್ತದೆ.',
    clause3Title: 'ಸ್ವಯಂಚಾಲಿತ ಮರುಹೊಂದಿಸುವಿಕೆ',
    clause3: 'ಈ ಸೆಷನ್ ಮುಗಿದ ತಕ್ಷಣ ಪರದೆಯು ಮರುಹೊಂದಿಸಲ್ಪಡುತ್ತದೆ.',
    consentCheck: 'ವೈದ್ಯಕೀಯ ತಪಾಸಣೆಗಾಗಿ ನಾನು ಪೂರ್ಣ ಒಪ್ಪಿಗೆ ನೀಡುತ್ತೇನೆ.',
    agreeButton: 'ನಾನು ಒಪ್ಪುತ್ತೇನೆ',
    audioExplanationText: 'ಈ ಕಿಯೋಸ್ಕ್ ನಿಮ್ಮ ಸಮಯವನ್ನು ಉಳಿಸಲು ಸಹಾಯಕವಾಗಿದೆ. ನಿಮ್ಮ ವಿವರಗಳು ವೈದ್ಯರಿಗೆ ಮಾತ್ರ ತಲುಪುತ್ತವೆ.'
  },
  department: {
    title: 'OPD ವಿಭಾಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    subtitle: 'ನೀವು ಭೇಟಿ ನೀಡಲು ಬಯಸುವ ವಿಭಾಗವನ್ನು ಸ್ಪರ್ಶಿಸಿ.',
    inQueue: 'ಸರದಿಯಲ್ಲಿದ್ದಾರೆ',
    audioPhrase: 'ವಿಭಾಗವನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ. ಈಗ ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಯ ಬಗ್ಗೆ ಮಾತನಾಡೋಣ.',
    deptLabels: {
      general_medicine: 'ಜನರಲ್ ಮೆಡಿಸಿನ್ (General Medicine)',
      cardiology: 'ಹೃದ್ರೋಗ ವಿಭಾಗ (Cardiology)',
      orthopedics: 'ಮೂಳೆ ಮತ್ತು ಕೀಲು ವಿಭಾಗ (Orthopedics)',
      pediatrics: 'ಮಕ್ಕಳ ತಜ್ಞರು (Pediatrics)',
      gynecology: 'ಸ್ತ್ರೀರೋಗ ಮತ್ತು ಪ್ರಸೂತಿ (Gynecology)',
      ayush_ayurveda: 'ಆಯುಷ್ ಮತ್ತು ಆಯುರ್ವೇದ (AYUSH)',
      pulmonology: 'ಶ್ವಾಸಕೋಶ ವಿಭಾಗ (Pulmonology)',
      ent: 'ಕಿವಿ, ಮೂಗು, ಗಂಟಲು (ENT)'
    }
  },
  interview: {
    title: 'ರೋಗಲಕ್ಷಣಗಳು & ಸಂಭಾಷಣೆ',
    questionPrefix: 'ಪ್ರಶ್ನೆ',
    doctorSpeaking: 'ವೈದ್ಯರು ಮಾತನಾಡುತ್ತಿದ್ದಾರೆ...',
    repeatAudio: 'ವೈದ್ಯರ ಧ್ವನಿಯನ್ನು ಮತ್ತೆ ಕೇಳಿ',
    tapToSpeak: 'ಮಾತನಾಡಿ ಉತ್ತರಿಸಿ (ಮೈಕ್)',
    tapToStop: 'ಮಾತನಾಡುವುದನ್ನು ನಿಲ್ಲಿಸಿ',
    chooseQuickAnswer: 'ಅಥವಾ ಕೆಳಗಿನ ಆಯ್ಕೆಗಳಲ್ಲಿ ಒಂದನ್ನು ಆರಿಸಿ:',
    yourSpokenResponse: 'ರೆಕಾರ್ಡ್ ಆದ ನಿಮ್ಮ ಉತ್ತರ:',
    typeAnswerPlaceholder: 'ಇಲ್ಲಿ ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಟೈಪ್ ಮಾಡಿ...',
    proceedToScanner: 'ಮುಂದೆ: ಹಳೆಯ ಚೀಟಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    emergencyAlertTitle: 'ತುರ್ತು ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಲಾಗಿದೆ',
    emergencyAlertDesc: 'ತೀವ್ರ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿವೆ. ದಾದಿಗೆ ಮಾಹಿತಿ ನೀಡಲಾಗಿದೆ.',
    initialQuestion: 'ಇಂದು ನೀವು ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಲು ಬಂದಿರುವ ಮುಖ್ಯ ಆರೋಗ್ಯ ತೊಂದರೆ ಏನು?',
    initialAudioPrompt: 'ನಮಸ್ಕಾರ. ದಯವಿಟ್ಟು ಇಂದು ನಿಮಗೆ ಇರುವ ಮುಖ್ಯ ತೊಂದರೆ ಏನು ಎಂದು ತಿಳಿಸಿ.',
    initialOptions: [
      'ಎದೆಯಲ್ಲಿ ಭಾರ ಮತ್ತು ನೋವು (Chest Pain)',
      'ತೀವ್ರ ಜ್ವರ ಮತ್ತು ಮೈಕೈ ನೋವು (Fever)',
      'ಹೊಟ್ಟೆ ನೋವು ಮತ್ತು ಆಸಿಡಿಟಿ (Stomach Pain)',
      'ಕೀಲು ಮತ್ತು ಮೊಣಕಾಲು ನೋವು (Joint Pain)',
      'ಕೆಮ್ಮು ಮತ್ತು ಉಸಿರಾಟದ ತೊಂದರೆ (Cough)'
    ]
  },
  scanner: {
    title: 'ಹಳೆಯ ಚೀಟಿ ಮತ್ತು ಲ್ಯಾಬ್ ವರದಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    subtitle: 'ನಿಮ್ಮ ಚೀಟಿಯಲ್ಲಿರುವ ಔಷಧಿಗಳನ್ನು ವೈದ್ಯರಿಗಾಗಿ ತಕ್ಷಣ ಗುರುತಿಸಲಾಗುತ್ತದೆ.',
    scanButton: 'ಕ್ಯಾಮೆರಾದಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    uploadButton: 'ಫೋಟೋ ಅಥವಾ ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    analyzingText: 'ಚೀಟಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
    extractedMeds: 'ಗುರುತಿಸಲಾದ ಔಷಧಿಗಳು (Medications)',
    extractedDx: 'ಹಿಂದಿನ ಕಾಯಿಲೆಗಳು (Diagnosis)',
    audioPhrase: 'ದಾಖಲೆ ಸ್ಕ್ಯಾನ್ ಪೂರ್ಣಗೊಂಡಿದೆ. ಈಗ ನೀವು ಸಾರಾಂಶವನ್ನು ಪರಿಶೀಲಿಸಬಹುದು.',
    nextReview: 'ಮುಂದೆ: ಪರಿಶೀಲನೆ & ಟೋಕನ್'
  },
  review: {
    title: 'ಕ್ಲಿನಿಕಲ್ ಸಾರಾಂಶ ಮತ್ತು ಟೋಕನ್ ಚೀಟಿ',
    subtitle: 'ನಿಮ್ಮ ವಿವರಗಳನ್ನು ವೈದ್ಯರ ಕಂಪ್ಯೂಟರ್‌ಗೆ ಸುರಕ್ಷಿತವಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ.',
    confirmSubmit: 'OPD ಯಲ್ಲಿ ದೃಢೀಕರಿಸಿ',
    downloadPdf: 'ಚೀಟಿಯನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (PDF)',
    printSlip: 'ಟೋಕನ್ ಮುದ್ರಿಸಿ',
    feedbackButton: 'ಅಭಿಪ್ರಾಯ ತಿಳಿಸಿ',
    audioPhrase: 'ನಿಮ್ಮ OPD ಟೋಕನ್ ಸಿದ್ಧವಾಗಿದೆ. ದಯವಿಟ್ಟು ವೈದ್ಯರ ಕೋಣೆಯ ಹೊರಗೆ ಕಾಯಿರಿ.',
    doctorBrief: 'ವೈದ್ಯರ ಸಾರಾಂಶ',
    chiefComplaint: 'ಮುಖ್ಯ ತೊಂದರೆ',
    patientDetails: 'ರೋಗಿಯ ವಿವರಗಳು',
    vitals: 'ದೇಹ ತಪಾಸಣೆ (Vitals)',
    submittedSuccess: 'ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಿಸಲಾಗಿದೆ!'
  }
};

export const baseMalayalam: Translations = {
  ...baseEnglish,
  appTitle: 'AI സ്മാർട്ട് OPD കിയോസ്കും ഡോക്ടർ അസിസ്റ്റന്റും',
  kioskTag: 'സ്മാർട്ട് OPD കിയോസ്ക്',
  kioskSubTag: 'സുരക്ഷിത മെഡിക്കൽ അസിസ്റ്റന്റ്',
  assignedToken: 'നിങ്ങളുടെ ടോക്കൺ നമ്പർ',
  doctorVoiceActive: 'ഡോക്ടറുടെ ശബ്ദം സജീവമാണ്',
  emergencyAlert: 'അടിയന്തര മുന്നറിയിപ്പ്',
  next: 'അടുത്തത്',
  back: 'പിന്നോട്ട്',
  submit: 'സമർപ്പിക്കുക',
  save: 'സംരക്ഷിക്കുക',
  cancel: 'റദ്ദാക്കുക',
  loading: 'ദയവായി കാത്തിരിക്കുക...',
  selectLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
  steps: {
    identity: { label: 'വിവരങ്ങൾ & തിരിച്ചറിയൽ', subLabel: 'Patient Profile' },
    consent: { label: 'സമ്മതപത്രം', subLabel: 'Digital Consent' },
    department: { label: 'വിഭാഗം തിരഞ്ഞെടുക്കുക', subLabel: 'OPD Department' },
    interview: { label: 'രോഗലക്ഷണങ്ങൾ & സംഭാഷണം', subLabel: 'Voice & Touch Q&A' },
    documents: { label: 'റിപ്പോർട്ടുകൾ & മരുന്നുകൾ', subLabel: 'Document Scan' },
    review: { label: 'പരിശോധന & ടോക്കൺ', subLabel: 'Summary & Token Slip' }
  },
  identity: {
    title: 'രോഗി തിരിച്ചറിയലും ആഭാ (ABHA) പരിശോധനയും',
    subtitle: 'മൊബൈൽ നമ്പർ നൽകുക അല്ലെങ്കിൽ ആഭാ QR കോഡ് സ്കാൻ ചെയ്യുക.',
    scanAbha: 'ആഭാ സ്കാൻ (ABHA QR)',
    fullName: 'രോഗിയുടെ പൂർണ്ണമായ പേര്',
    fullNamePlaceholder: 'ഉദാ. മോഹൻദാസ്',
    mobile: 'മൊബൈൽ നമ്പർ',
    mobilePlaceholder: '10 അക്ക മൊബൈൽ നമ്പർ',
    age: 'പ്രായം (വർഷങ്ങൾ)',
    gender: 'ലിംഗം',
    genderMale: 'പുരുഷൻ (Male)',
    genderFemale: 'സ്ത്രീ (Female)',
    genderOther: 'മറ്റുള്ളവ (Other)',
    abhaId: 'ആഭാ ഐഡി / ഹെൽത്ത് കാർഡ് (ഓപ്ഷണൽ)',
    abhaPlaceholder: 'ഉദാ. 91-4521-8890-1234',
    abhaLinked: 'ആഭാ ലിങ്ക് ചെയ്തു',
    secureSession: 'സുരക്ഷിത സെഷൻ',
    nextConsent: 'അടുത്തത്: ഡിജിറ്റൽ സമ്മതപത്രം',
    abhaSuccessPhrase: 'ആഭാ ഐഡി വിജയകരമായി പരിശോധിച്ചു.'
  },
  consent: {
    title: 'വിവര സുരക്ഷയും ഡിജിറ്റൽ സമ്മതപത്രവും',
    audioExplanation: 'സമ്മത വിവരങ്ങൾ കേൾക്കുക',
    dpdpBadge: 'സുരക്ഷിത സമ്മതം',
    clause1Title: 'ചികിത്സ ആവശ്യങ്ങൾക്ക് മാത്രം',
    clause1: 'എന്റെ ആരോഗ്യ വിവരങ്ങൾ ഡോക്ടറുടെ പരിശോധനയ്ക്ക് മാത്രമായി ഉപയോഗിക്കും.',
    clause2Title: 'രേഖകളുടെ സുരക്ഷിതത്വം',
    clause2: 'എന്റെ മുൻകാല റിപ്പോർട്ടുകൾ സുരക്ഷിതമായി സ്കാൻ ചെയ്യപ്പെടും.',
    clause3Title: 'ഓട്ടോമാറ്റിക് റീസെറ്റ്',
    clause3: 'ഈ സെഷൻ പൂർത്തിയാകുമ്പോൾ സ്ക്രീൻ റീസെറ്റ് ആകും.',
    consentCheck: 'പരിശോധനയ്ക്കായി ഞാൻ പൂർണ്ണ സമ്മതം നൽകുന്നു.',
    agreeButton: 'ഞാൻ സമ്മതിക്കുന്നു',
    audioExplanationText: 'ഈ കിയോസ്ക് നിങ്ങളുടെ സമയം ലാഭിക്കാൻ സഹായിക്കുന്നു. വിവരങ്ങൾ ഡോക്ടറിലേക്ക് മാത്രം എത്തും.'
  },
  department: {
    title: 'OPD വിഭാഗം തിരഞ്ഞെടുക്കുക',
    subtitle: 'നിങ്ങൾ കാണാൻ ആഗ്രഹിക്കുന്ന വിഭാഗത്തിൽ സ്പർശിക്കുക.',
    inQueue: 'കാത്തിരിക്കുന്നു',
    audioPhrase: 'വിഭാഗം തിരഞ്ഞെടുത്തു. ഇനി രോഗലക്ഷണങ്ങളെക്കുറിച്ച് സംസാരിക്കാം.',
    deptLabels: {
      general_medicine: 'ജനറൽ മെഡിസിൻ (General Medicine)',
      cardiology: 'കാർഡിയോളജി വിഭാഗം (Cardiology)',
      orthopedics: 'അസ്ഥിരോഗ വിഭാഗം (Orthopedics)',
      pediatrics: 'ശിശുരോഗ വിദഗ്ദ്ധർ (Pediatrics)',
      gynecology: 'സ്ത്രീരോഗ പ്രസവ വിഭാഗം (Gynecology)',
      ayush_ayurveda: 'ആയുഷ് & ആയുർവേദം (AYUSH)',
      pulmonology: 'ശ്വാസകോശ വിഭാഗം (Pulmonology)',
      ent: 'ഇ.എൻ.ടി (ENT)'
    }
  },
  interview: {
    title: 'രോഗലക്ഷണങ്ങൾ & സംഭാഷണം',
    questionPrefix: 'ചോദ്യം',
    doctorSpeaking: 'ഡോക്ടർ സംസാരിക്കുന്നു...',
    repeatAudio: 'ഡോക്ടറുടെ ശബ്ദം വീണ്ടും കേൾക്കുക',
    tapToSpeak: 'സംസാരിച്ച് മറുപടി നൽകുക (മൈക്ക്)',
    tapToStop: 'സംസാരം നിർത്തുക',
    chooseQuickAnswer: 'അല്ലെങ്കിൽ താഴെയുള്ളവയിൽ നിന്ന് തിരഞ്ഞെടുക്കുക:',
    yourSpokenResponse: 'രേഖപ്പെടുത്തിയ മറുപടി:',
    typeAnswerPlaceholder: 'ഇവിടെ മറുപടി ടൈപ്പ് ചെയ്യുക...',
    proceedToScanner: 'അടുത്തത്: പഴയ കുറിപ്പടി സ്കാൻ ചെയ്യുക',
    emergencyAlertTitle: 'അടിയന്തര മുന്നറിയിപ്പ് നൽകി',
    emergencyAlertDesc: 'ഗുരുതര ലക്ഷണങ്ങൾ കണ്ടെത്തി. നഴ്സിന് വിവരം കൈമാറി.',
    initialQuestion: 'ഇന്ന് ഡോക്ടറെ കാണാൻ വരാൻ ഇടയായ പ്രധാന ആരോഗ്യ പ്രശ്നം എന്താണ്?',
    initialAudioPrompt: 'നമസ്കാരം. ഇന്ന് നിങ്ങൾക്ക് അനുഭവപ്പെടുന്ന പ്രധാന ബുദ്ധിമുട്ട് എന്താണെന്ന് പറയുക.',
    initialOptions: [
      'നെഞ്ചിൽ ഭാരവും വേദനയും (Chest Pain)',
      'കടുത്ത പനിയും ശരീരവേദനയും (Fever)',
      'വയറുവേദനയും അസിഡിറ്റിയും (Stomach Pain)',
      'മുട്ടുവേദനയും സന്ധിവേദനയും (Joint Pain)',
      'ചുമയും ശ്വാസംമുട്ടലും (Cough)'
    ]
  },
  scanner: {
    title: 'പഴയ കുറിപ്പടിയും റിപ്പോർട്ടുകളും സ്കാൻ ചെയ്യുക',
    subtitle: 'നിങ്ങളുടെ കുറിപ്പടിയിലെ മരുന്നുകൾ ഉടൻ തിരിച്ചറിയപ്പെടും.',
    scanButton: 'ക്യാമറ വഴി സ്കാൻ ചെയ്യുക',
    uploadButton: 'ഫയൽ അല്ലെങ്കിൽ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക',
    analyzingText: 'കുറിപ്പടി പരിശോധിക്കുന്നു...',
    extractedMeds: 'തിരിച്ചറിഞ്ഞ മരുന്നുകൾ (Medications)',
    extractedDx: 'മുൻകാല രോഗങ്ങൾ (Diagnosis)',
    audioPhrase: 'സ്കാനിംഗ് പൂർത്തിയായി. ഇനി സംഗ്രഹം പരിശോധിക്കാം.',
    nextReview: 'അടുത്തത്: പരിശോധന & ടോക്കൺ'
  },
  review: {
    title: 'മെഡിക്കൽ സംഗ്രഹവും ടോക്കൺ സ്ലിപ്പും',
    subtitle: 'വിവരങ്ങൾ ഡോക്ടറുടെ സിസ്റ്റത്തിലേക്ക് അയച്ചു കഴിഞ്ഞു.',
    confirmSubmit: 'OPD യിൽ രജിസ്റ്റർ ചെയ്യുക',
    downloadPdf: 'സ്ലിപ്പ് ഡൗൺലോഡ് ചെയ്യുക (PDF)',
    printSlip: 'ടോക്കൺ പ്രിന്റ് ചെയ്യുക',
    feedbackButton: 'അഭിപ്രായം രേഖപ്പെടുത്തുക',
    audioPhrase: 'നിങ്ങളുടെ ടോക്കൺ തയ്യാറാണ്. ദയവായി ഡോക്ടറുടെ റൂമിന് പുറത്ത് കാത്തിരിക്കുക.',
    doctorBrief: 'ഡോക്ടർ സംഗ്രഹം',
    chiefComplaint: 'പ്രധാന പ്രശ്നം',
    patientDetails: 'രോഗിയുടെ വിവരങ്ങൾ',
    vitals: 'ശരീര പരിശോധന (Vitals)',
    submittedSuccess: 'വിജയകരമായി രജിസ്റ്റർ ചെയ്തു!'
  }
};

export const baseOdia: Translations = {
  ...baseEnglish,
  appTitle: 'AI ସ୍ମାର୍ଟ OPD କିଓସ୍କ ଏବଂ ଡାକ୍ତର ସହାୟକ',
  kioskTag: 'ସ୍ମାର୍ଟ OPD କିଓସ୍କ',
  kioskSubTag: 'ସୁରକ୍ଷିତ ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ',
  assignedToken: 'ଆପଣଙ୍କ ଟୋକନ୍ ନମ୍ବର',
  doctorVoiceActive: 'ଡାକ୍ତରଙ୍କ ସ୍ୱର ସକ୍ରିୟ ଅଛି',
  emergencyAlert: 'ଜରୁରୀକାଳୀନ ସତର୍କତା',
  next: 'ପରବର୍ତ୍ତୀ',
  back: 'ପଛକୁ',
  submit: 'ଦାଖଲ କରନ୍ତୁ',
  save: 'ସଂରକ୍ଷଣ କରନ୍ତୁ',
  cancel: 'ବାତିଲ୍',
  loading: 'ଅପେକ୍ଷା କରନ୍ତୁ...',
  selectLanguage: 'ଭାଷା ବାଛନ୍ତୁ',
  steps: {
    identity: { label: 'ପରିଚୟ ଓ ବିବରଣୀ', subLabel: 'Patient Profile' },
    consent: { label: 'ସମ୍ମତି ପତ୍ର', subLabel: 'Digital Consent' },
    department: { label: 'ବିଭାଗ ଚୟନ', subLabel: 'OPD Department' },
    interview: { label: 'ଲକ୍ଷଣ ଓ କଥାବାର୍ତ୍ତା', subLabel: 'Voice & Touch Q&A' },
    documents: { label: 'ପ୍ରେସକ୍ରିପସନ୍ ଓ ରିପୋର୍ଟ', subLabel: 'Document Scan' },
    review: { label: 'ସମୀକ୍ଷା ଓ ଟୋକନ୍', subLabel: 'Summary & Token Slip' }
  },
  identity: {
    title: 'ରୋଗୀ ପରିଚୟ ଏବଂ ଆଭା (ABHA) ଯାଞ୍ଚ',
    subtitle: 'ମୋବାଇଲ୍ ନମ୍ବର ଲେଖନ୍ତୁ କିମ୍ବା ଆଭା QR କୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ।',
    scanAbha: 'ଆଭା ସ୍କାନ୍ (ABHA QR)',
    fullName: 'ରୋଗୀଙ୍କ ପୂରା ନାମ',
    fullNamePlaceholder: 'ଯଥା: ବିଜୟ କୁମାର',
    mobile: 'ମୋବାଇଲ୍ ନମ୍ବର',
    mobilePlaceholder: '୧୦ ଅଙ୍କ ବିଶିଷ୍ଟ ମୋବାଇଲ୍ ନମ୍ବର',
    age: 'ବୟସ (ବର୍ଷ)',
    gender: 'ଲିଙ୍ଗ',
    genderMale: 'ପୁରୁଷ (Male)',
    genderFemale: 'ମହିଳା (Female)',
    genderOther: 'ଅନ୍ୟାନ୍ୟ (Other)',
    abhaId: 'ଆଭା ଆଇଡି / ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ (ଇଚ୍ଛାଧୀନ)',
    abhaPlaceholder: 'ଯଥା: 91-4521-8890-1234',
    abhaLinked: 'ଆଭା ଲିଙ୍କ୍ ହୋଇଛି',
    secureSession: 'ସୁରକ୍ଷିତ ସେସନ୍',
    nextConsent: 'ପରବର୍ତ୍ତୀ: ଡିଜିଟାଲ୍ ସମ୍ମତି ପତ୍ର',
    abhaSuccessPhrase: 'ଆଭା ଆଇଡି ସଫଳତାର ସହିତ ଯାଞ୍ଚ ହୋଇଛି।'
  },
  consent: {
    title: 'ଡାଟା ସୁରକ୍ଷା ଓ ଡିଜିଟାଲ୍ ସମ୍ମତି ପତ୍ର',
    audioExplanation: 'ଅଡିଓରେ ସମ୍ମତି ବିବରଣୀ ଶୁଣନ୍ତୁ',
    dpdpBadge: 'ସୁରକ୍ଷିତ ସମ୍ମତି',
    clause1Title: 'କେବଳ ଚିକିତ୍ସା ପାଇଁ',
    clause1: 'ମୋର ସ୍ୱାସ୍ଥ୍ୟ ସୂଚନା କେବଳ ଡାକ୍ତରଙ୍କ ପରାମର୍ଶ ପାଇଁ ବ୍ୟବହାର ହେବ।',
    clause2Title: 'ଦସ୍ତାବିଜ ସୁରକ୍ଷା',
    clause2: 'ମୋର ପୁରୁଣା ରିପୋର୍ଟ ସୁରକ୍ଷିତ ଭାବେ ସ୍କାନ୍ କରାଯିବ।',
    clause3Title: 'ସ୍ୱୟଂଚାଳିତ ରିସେଟ୍',
    clause3: 'ଏହି ସେସନ୍ ଶେଷ ହେବା ମାତ୍ରେ ସ୍କ୍ରିନ୍ ରିସେଟ୍ ହୋଇଯିବ।',
    consentCheck: 'ମୁଁ ମୋର ପରୀକ୍ଷା ପାଇଁ ସମ୍ମତି ପ୍ରଦାନ କରୁଛି।',
    agreeButton: 'ମୁଁ ସହମତ',
    audioExplanationText: 'ଏହି କିଓସ୍କ ଆପଣଙ୍କ ସମୟ ବଞ୍ଚାଇବା ପାଇଁ। ସୂଚନା କେବଳ ଡାକ୍ତରଙ୍କ ନିକଟକୁ ଯିବ।'
  },
  department: {
    title: 'OPD ବିଭାଗ ଚୟନ କରନ୍ତୁ',
    subtitle: 'ଆପଣ ଯେଉଁ ବିଭାଗର ଡାକ୍ତରଙ୍କୁ ଦେଖାଇବାକୁ ଚାହାଁନ୍ତି ତାହା ବାଛନ୍ତୁ।',
    inQueue: 'ଧାଡ଼ିରେ ଅଛନ୍ତି',
    audioPhrase: 'ବିଭାଗ ଚୟନ କରାଗଲା। ଆସନ୍ତୁ ଆପଣଙ୍କ ଅସୁବିଧା ବିଷୟରେ କଥା ହେବା।',
    deptLabels: {
      general_medicine: 'ଜେନେରାଲ୍ ମେଡିସିନ୍ (General Medicine)',
      cardiology: 'ହୃଦରୋଗ ବିଭାଗ (Cardiology)',
      orthopedics: 'ହାଡ଼ ଓ ଗଣ୍ଠି ବିଭାଗ (Orthopedics)',
      pediatrics: 'ଶିଶୁରୋଗ ବିଶେଷଜ୍ଞ (Pediatrics)',
      gynecology: 'ସ୍ତ୍ରୀରୋଗ ଓ ପ୍ରସୂତି (Gynecology)',
      ayush_ayurveda: 'ଆୟୁଷ ଓ ଆୟୁର୍ବେଦ (AYUSH)',
      pulmonology: 'ଫୁସଫୁସ୍ ରୋଗ (Pulmonology)',
      ent: 'ନାକ, କାନ, ଗଳା (ENT)'
    }
  },
  interview: {
    title: 'ଲକ୍ଷଣ ଓ କଥାବାର୍ତ୍ତା',
    questionPrefix: 'ପ୍ରଶ୍ନ',
    doctorSpeaking: 'ଡାକ୍ତର କହୁଛନ୍ତି...',
    repeatAudio: 'ଡାକ୍ତରଙ୍କ ସ୍ୱର ପୁନର୍ବାର ଶୁଣନ୍ତୁ',
    tapToSpeak: 'କହିକି ଉତ୍ତର ଦିଅନ୍ତୁ (ମାଇକ୍)',
    tapToStop: 'କହିବା ବନ୍ଦ କରନ୍ତୁ',
    chooseQuickAnswer: 'କିମ୍ବା ତଳେ ଥିବା ବିକଳ୍ପରୁ ବାଛନ୍ତୁ:',
    yourSpokenResponse: 'ଆପଣଙ୍କ ରେକର୍ଡ ହୋଇଥିବା ଉତ୍ତର:',
    typeAnswerPlaceholder: 'ଏଠାରେ ଉତ୍ତର ଲେଖନ୍ତୁ...',
    proceedToScanner: 'ପରବର୍ତ୍ତୀ: ପୁରୁଣା ପ୍ରେସକ୍ରିପସନ୍ ସ୍କାନ୍ କରନ୍ତୁ',
    emergencyAlertTitle: 'ଜରୁରୀକାଳୀନ ସତର୍କତା ପଠାଗଲା',
    emergencyAlertDesc: 'ଗୁରୁତର ଲକ୍ଷଣ ମିଳିଛି। ନର୍ସଙ୍କୁ ସୂଚନା ଦିଆଯାଇଛି।',
    initialQuestion: 'ଆଜି ଆପଣ ଡାକ୍ତରଙ୍କୁ ଦେଖାଇବାକୁ ଆସିଥିବା ମୁଖ୍ୟ ସମସ୍ୟା କ’ଣ?',
    initialAudioPrompt: 'ନମସ୍କାର। ଦୟାକରି କୁହନ୍ତୁ ଆଜି ଆପଣଙ୍କର ମୁଖ୍ୟ ଶାରୀରିକ ଅସୁବିଧା କ’ଣ?',
    initialOptions: [
      'ଛାତିରେ ଭାରିପଣ ଓ ଯନ୍ତ୍ରଣା (Chest Pain)',
      'ପ୍ରବଳ ଜ୍ୱର ଓ ଶରୀର ପୀଡ଼ା (Fever)',
      'ପେଟରେ ଯନ୍ତ୍ରଣା ଓ ଏସିଡିଟି (Stomach Pain)',
      'ଗଣ୍ଠି ଓ ଆଣ୍ଠୁ ଯନ୍ତ୍ରଣା (Joint Pain)',
      'କାଶ ଓ ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ (Cough)'
    ]
  },
  scanner: {
    title: 'ପୁରୁଣା ପ୍ରେସକ୍ରିପସନ୍ ଓ ରିପୋର୍ଟ ସ୍କାନ୍ କରନ୍ତୁ',
    subtitle: 'ଆପଣଙ୍କ ପ୍ରେସକ୍ରିପସନରେ ଥିବା ଔଷଧଗୁଡ଼ିକ ତୁରନ୍ତ ଚିହ୍ନଟ ହୋଇଯିବ।',
    scanButton: 'କ୍ୟାମେରା ଦ୍ୱାରା ସ୍କାନ୍ କରନ୍ତୁ',
    uploadButton: 'ଫାଇଲ୍ ବା ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ',
    analyzingText: 'ପ୍ରେସକ୍ରିପସନ୍ ଯାଞ୍ଚ ହେଉଛି...',
    extractedMeds: 'ଚିହ୍ନଟ ହୋଇଥିବା ଔଷଧ (Medications)',
    extractedDx: 'ପୂର୍ବ ରୋଗ (Diagnosis)',
    audioPhrase: 'ସ୍କାନ୍ ସମ୍ପନ୍ନ ହୋଇଛି। ଏବେ ଆପଣ ବିବରଣୀ ଦେଖିପାରିବେ।',
    nextReview: 'ପରବର୍ତ୍ତୀ: ସମୀକ୍ଷା ଓ ଟୋକନ୍'
  },
  review: {
    title: 'ଡାକ୍ତରୀ ସାରାଂଶ ଓ ଟୋକନ୍ ପର୍ଚି',
    subtitle: 'ଆପଣଙ୍କ ସମସ୍ତ ବିବରଣୀ ଡାକ୍ତରଙ୍କ ନିକଟକୁ ପଠାଯାଇଛି।',
    confirmSubmit: 'OPD ରେ ଦାଖଲ କରନ୍ତୁ',
    downloadPdf: 'ପର୍ଚି ଡାଉନଲୋଡ୍ କରନ୍ତୁ (PDF)',
    printSlip: 'ଟୋକନ୍ ପ୍ରିଣ୍ଟ କରନ୍ତୁ',
    feedbackButton: 'ମତାମତ ଦିଅନ୍ତୁ',
    audioPhrase: 'ଆପଣଙ୍କ ଟୋକନ୍ ପ୍ରସ୍ତୁତ। ଦୟାକରି ଡାକ୍ତରଙ୍କ ରୁମ୍ ବାହାରେ ଅପେକ୍ଷା କରନ୍ତୁ।',
    doctorBrief: 'ଡାକ୍ତର ସାରାଂଶ',
    chiefComplaint: 'ମୁଖ୍ୟ ସମସ୍ୟା',
    patientDetails: 'ରୋଗୀ ବିବରଣୀ',
    vitals: 'ଶାରୀରିକ ମାପ (Vitals)',
    submittedSuccess: 'ସଫଳତାର ସହିତ ଦାଖଲ ହେଲା!'
  }
};

export const baseUrdu: Translations = {
  ...baseHindi,
  appTitle: 'سمارٹ او پی ڈی کیوسک اور ڈاکٹر اسسٹنٹ',
  kioskTag: 'او پی ڈی سمارٹ کیوسک',
  kioskSubTag: 'محفوظ میڈیکل اسسٹنٹ',
  assignedToken: 'آپ کا ٹوکن نمبر',
  doctorVoiceActive: 'ڈاکٹر کی آواز فعال ہے',
  emergencyAlert: 'ہنگامی الرٹ',
  next: 'آگے بڑھیں',
  back: 'پیچھے جائیں',
  submit: 'جمع کریں',
  save: 'محفوظ کریں',
  cancel: 'منسوخ کریں',
  loading: 'براہ کرم انتظار کریں...',
  selectLanguage: 'زبان منتخب کریں',
  steps: {
    identity: { label: 'شناخت اور تفصیلات', subLabel: 'Patient Profile' },
    consent: { label: 'رضامندی نامہ', subLabel: 'Digital Consent' },
    department: { label: 'شعبہ کا انتخاب', subLabel: 'OPD Department' },
    interview: { label: 'علامات اور گفتگو', subLabel: 'Voice & Touch Q&A' },
    documents: { label: 'نسخہ اور رپورٹس', subLabel: 'Document Scan' },
    review: { label: 'جائزہ اور پرچی', subLabel: 'Summary & Token Slip' }
  },
  identity: {
    title: 'مریض کی شناخت اور آبھا (ABHA) تصدیق',
    subtitle: 'موبائل نمبر درج کریں یا آبھا کیو آر کوڈ اسکین کریں۔',
    scanAbha: 'آبھا اسکین (ABHA QR)',
    fullName: 'مریض کا پورا نام',
    fullNamePlaceholder: 'مثال: محمد احمد',
    mobile: 'موبائل نمبر',
    mobilePlaceholder: '10 ہندسوں کا موبائل نمبر',
    age: 'عمر (سال)',
    gender: 'جنس',
    genderMale: 'مرد (Male)',
    genderFemale: 'عورت (Female)',
    genderOther: 'دیگر (Other)',
    abhaId: 'آبھا آئی ڈی / ہیلتھ کارڈ (اختیاری)',
    abhaPlaceholder: 'مثال: 91-4521-8890-1234',
    abhaLinked: 'آبھا منسلک ہو گیا',
    secureSession: 'محفوظ سیشن',
    nextConsent: 'آگے: ڈیجیٹل رضامندی نامہ',
    abhaSuccessPhrase: 'آبھا آئی ڈی کی کامیابی سے تصدیق ہو گئی ہے۔'
  },
  consent: {
    title: 'مریض ڈیٹا کی حفاظت اور ڈیجیٹل رضامندی',
    audioExplanation: 'آواز میں تفصیلات سنیں',
    dpdpBadge: 'محفوظ رضامندی',
    clause1Title: 'صرف علاج کے لیے',
    clause1: 'میری طبی معلومات صرف ڈاکٹر کے مشورے کے لیے استعمال ہوں گی۔',
    clause2Title: 'دستاویزات کی حفاظت',
    clause2: 'میری پرانی رپورٹس اور نسخے محفوظ طریقے سے اسکین کیے جائیں گے۔',
    clause3Title: 'خودکار ری سیٹ',
    clause3: 'یہ سیشن مکمل ہوتے ہی اسکرین ری سیٹ ہو جائے گی۔',
    consentCheck: 'میں اپنے معائنے اور علاج کے لیے مکمل رضامندی دیتا ہوں۔',
    agreeButton: 'میں متفق ہوں',
    audioExplanationText: 'یہ کیوسک آپ کا وقت بچانے کے لیے ہے۔ معلومات صرف ڈاکٹر تک پہنچیں گی۔'
  },
  department: {
    title: 'او پی ڈی شعبہ منتخب کریں',
    subtitle: 'جس شعبے کے ڈاکٹر سے رجوع کرنا ہے اس پر ٹچ کریں۔',
    inQueue: 'قطار میں ہیں',
    audioPhrase: 'شعبہ منتخب کر لیا گیا ہے۔ آئیے اب آپ کی بیماری کے بارے میں بات کرتے ہیں۔',
    deptLabels: {
      general_medicine: 'جنرل میڈیسن (General Medicine)',
      cardiology: 'امراضِ قلب (Cardiology)',
      orthopedics: 'ہڈیوں اور جوڑوں کے امراض (Orthopedics)',
      pediatrics: 'ماہرِ امراضِ اطفال (Pediatrics)',
      gynecology: 'امراضِ نسواں و زچگی (Gynecology)',
      ayush_ayurveda: 'آیوش اور آیوروید (AYUSH)',
      pulmonology: 'امراضِ سینہ و پھیپھڑے (Pulmonology)',
      ent: 'کان، ناک، گلا (ENT)'
    }
  },
  interview: {
    title: 'علامات اور گفتگو',
    questionPrefix: 'سوال',
    doctorSpeaking: 'ڈاکٹر بول رہے ہیں...',
    repeatAudio: 'ڈاکٹر کی آواز دوبارہ سنیں',
    tapToSpeak: 'بول کر جواب دیں (مائیک)',
    tapToStop: 'بولنا بند کریں',
    chooseQuickAnswer: 'یا نیچے دیے گئے اختیارات میں سے منتخب کریں:',
    yourSpokenResponse: 'آپ کا ریکارڈ شدہ جواب:',
    typeAnswerPlaceholder: 'یہاں اپنا جواب لکھیں...',
    proceedToScanner: 'آگے: پرانا نسخہ اسکین کریں',
    emergencyAlertTitle: 'ہنگامی الرٹ بھیج دیا گیا',
    emergencyAlertDesc: 'سنگین علامات پائی گئی ہیں۔ نرس کو مطلع کر دیا گیا ہے۔',
    initialQuestion: 'آج آپ کس اہم تکلیف یا بیماری کے لیے ڈاکٹر کے پاس آئے ہیں؟',
    initialAudioPrompt: 'آداب۔ براہ کرم بتائیں کہ آج آپ کو کیا اہم جسمانی تکلیف ہے؟',
    initialOptions: [
      'سینے میں بھاری پن اور درد (Chest Pain)',
      'تیز بخار اور جسم میں درد (Fever)',
      'پیٹ میں شدید درد اور تیزابیت (Stomach Pain)',
      'جوڑوں اور گھٹنوں میں درد (Joint Pain)',
      'کھانسی اور سانس پھولنا (Cough)'
    ]
  },
  scanner: {
    title: 'پرانے نسخے اور ٹیسٹ رپورٹس اسکین کریں',
    subtitle: 'آپ کے نسخے میں لکھی ادویات فوری طور پر پہچان لی جائیں گی۔',
    scanButton: 'کیمرے سے اسکین کریں',
    uploadButton: 'فائل یا تصویر اپ لوڈ کریں',
    analyzingText: 'نسخے کی جانچ کی جا رہی ہے...',
    extractedMeds: 'پہچانی گئی ادویات (Medications)',
    extractedDx: 'سابقہ بیماریاں (Diagnosis)',
    audioPhrase: 'اسکین مکمل ہو گیا ہے۔ اب آپ تفصیلات دیکھ سکتے ہیں۔',
    nextReview: 'آگے: جائزہ اور ٹوکن'
  },
  review: {
    title: 'طبی خلاصہ اور ٹوکن پرچی',
    subtitle: 'آپ کی معلومات ڈاکٹر کے کمپیوٹر پر بھیج دی گئی ہے۔',
    confirmSubmit: 'او پی ڈی میں درج کریں',
    downloadPdf: 'پرچی ڈاؤن لوڈ کریں (PDF)',
    printSlip: 'ٹوکن پرنٹ کریں',
    feedbackButton: 'رائے دیں',
    audioPhrase: 'آپ کا او پی ڈی ٹوکن تیار ہے۔ براہ کرم ڈاکٹر کے کمرے کے باہر انتظار کریں۔',
    doctorBrief: 'ڈاکٹر کا خلاصہ',
    chiefComplaint: 'اہم تکلیف',
    patientDetails: 'مریض کی تفصیلات',
    vitals: 'جسمانی پیمائش (Vitals)',
    submittedSuccess: 'کامیابی سے درج ہو گیا!'
  }
};

export const baseBhojpuri: Translations = {
  ...baseHindi,
  appTitle: 'स्मार्ट ओपीडी कियोस्क व डॉक्टर सहायक',
  kioskTag: 'ओपीडी स्मार्ट कियोस्क',
  assignedToken: 'रउआ टोकन नंबर',
  doctorVoiceActive: 'डॉक्टर साहब के आवाज चालू बा',
  emergencyAlert: 'आपातकालीन सूचना',
  next: 'आगे बढ़ीं',
  back: 'पाछे जाईं',
  submit: 'दर्ज करीं',
  selectLanguage: 'भाषा चुनीं',
  steps: {
    identity: { label: 'पहचान व विवरण', subLabel: 'Patient Profile' },
    consent: { label: 'सहमति पत्र', subLabel: 'Digital Consent' },
    department: { label: 'विभाग चुनीं', subLabel: 'OPD Department' },
    interview: { label: 'लक्षण व बातचीत', subLabel: 'Voice & Touch Q&A' },
    documents: { label: 'पुरान पर्चा व रिपोर्ट', subLabel: 'Document Scan' },
    review: { label: 'समीक्षा व पर्ची', subLabel: 'Summary & Token Slip' }
  },
  identity: {
    ...baseHindi.identity,
    title: 'मरीज के पहचान व आभा (ABHA) सत्यापन',
    subtitle: 'मोबाइल नंबर डालीं भा आभा QR कोड स्कैन करीं।',
    fullName: 'मरीज के पूरा नाम',
    mobile: 'मोबाइल नंबर',
    age: 'उमिर (साल)',
    gender: 'लिंग',
    nextConsent: 'आगे बढ़ीं: सहमति पत्र'
  },
  interview: {
    ...baseHindi.interview,
    initialQuestion: 'आज रउआ के का खास तकलीफ भा बेमारी बा जेकरा खातिर डॉक्टर के देखावे आइल बानी?',
    initialAudioPrompt: 'प्रणाम। बताईं कि आज रउआ के का मुख्य शारीरिक तकलीफ बा?',
    tapToSpeak: 'बोल के जवाब दीं (माइक)'
  }
};

export const baseHinglish: Translations = {
  ...baseHindi,
  appTitle: 'Smart OPD Kiosk & Doctor Assistant',
  kioskTag: 'Smart OPD Kiosk',
  kioskSubTag: 'Secure Clinical Assistant',
  assignedToken: 'Aapka Token Number',
  doctorVoiceActive: 'Doctor voice active hai',
  emergencyAlert: 'Emergency Triage Alert',
  next: 'Aage Badhein (Next)',
  back: 'Peeche (Back)',
  submit: 'Submit Karein',
  selectLanguage: 'Language Select Karein',
  steps: {
    identity: { label: 'Pehchan & Details', subLabel: 'Patient Profile' },
    consent: { label: 'Consent Form', subLabel: 'Digital Consent' },
    department: { label: 'Department Select', subLabel: 'OPD Department' },
    interview: { label: 'Symptoms & Voice Q&A', subLabel: 'Voice & Touch Q&A' },
    documents: { label: 'Prescription & Reports', subLabel: 'Document Scan' },
    review: { label: 'Review & Token Slip', subLabel: 'Summary & Token Slip' }
  },
  identity: {
    ...baseHindi.identity,
    title: 'Patient Identification & Details',
    subtitle: 'Mobile number dalein ya ABHA QR code scan karein instant details ke liye.',
    fullName: 'Patient ka Full Name',
    mobile: 'Mobile Number',
    age: 'Age (Years)',
    gender: 'Gender',
    nextConsent: 'Next: Digital Consent'
  },
  interview: {
    ...baseHindi.interview,
    initialQuestion: 'Aaj aapko kis main health problem ya takleef ke liye doctor ko dikhana hai? (Chief Complaint)',
    initialAudioPrompt: 'Namaste! Please batayein ki aaj aapko kya main physical discomfort ya takleef ho rahi hai?',
    tapToSpeak: 'Bolkar Answer Dein (Microphone)',
    tapToStop: 'Stop Recording',
    chooseQuickAnswer: 'Ya neeche diye gaye options mein se select karein:',
    yourSpokenResponse: 'Voice se record kiya gaya answer:',
    typeAnswerPlaceholder: 'Yahan apna answer type karein...'
  }
};

export const TRANSLATIONS_MAP: Record<LanguageCode, Translations> = {
  hi: baseHindi,
  en: baseEnglish,
  mr: baseMarathi,
  bn: baseBengali,
  ta: baseTamil,
  te: baseTelugu,
  gu: baseGujarati,
  pa: basePunjabi,
  kn: baseKannada,
  ml: baseMalayalam,
  or: baseOdia,
  ur: baseUrdu,
  bho: baseBhojpuri,
  hinglish: baseHinglish
};

export function getTranslations(lang: LanguageCode = 'hi'): Translations {
  return TRANSLATIONS_MAP[lang] || TRANSLATIONS_MAP['hi'] || baseHindi;
}
