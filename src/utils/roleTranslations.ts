import { LanguageCode } from '../types';

export interface RoleScreenText {
  title: string;
  subtitle: string;
  patientTitle: string;
  patientBadge: string;
  patientBullets: string[];
  patientAction: string;
  doctorTitle: string;
  doctorBadge: string;
  doctorBullets: string[];
  doctorAction: string;
  abdmBadge: string;
  systemName: string;
  tagline: string;
}

export const ROLE_SCREEN_TRANSLATIONS: Record<LanguageCode, RoleScreenText> = {
  hi: {
    title: 'आप कौन हैं? अपनी भूमिका चुनें',
    subtitle: 'मरीज़ ओपीडी टोकन लेने और डॉक्टर क्लिनिकल कंसल्टेशन के लिए अपनी श्रेणी चुनें।',
    patientTitle: 'मैं मरीज़ हूँ',
    patientBadge: 'Patient Entry • मरीज़',
    patientBullets: [
      'बोलकर या टच से पर्ची बनवाएं',
      'पुराना पर्चा (Prescription) कैमरा से स्कैन करें',
      'तुरंत OPD टोकन व कक्ष संख्या पाएं'
    ],
    patientAction: 'शुरू करें (Start Intake)',
    doctorTitle: 'मैं डॉक्टर / स्टाफ हूँ',
    doctorBadge: 'Doctor & Staff • डॉक्टर / स्टाफ',
    doctorBullets: [
      'लाइव मरीज़ कतार (OPD Queue) व टोकन कॉल',
      'AI क्लिनिकल समरी और प्राथमिकता रेड फ्लैग',
      'EMR कंसल्टेशन और डिजिटल पर्चा (Rx)'
    ],
    doctorAction: 'डॉक्टर कंसोल (Console)',
    abdmBadge: 'आयुष्मान भारत डिजिटल मिशन (ABDM) व डीपीआर सुरक्षित • ऑफलाइन सक्षम',
    systemName: 'Smart OPD Assistant',
    tagline: 'AI Kiosk & EMR Consultation'
  },
  mr: {
    title: 'तुम्ही कोण आहात? तुमची भूमिका निवडा',
    subtitle: 'ओपीडी टोकन मिळवण्यासाठी किंवा रुग्णांची तपासणी करण्यासाठी योग्य पर्याय निवडा.',
    patientTitle: 'मी रुग्ण आहे',
    patientBadge: 'Patient Entry • रुग्ण',
    patientBullets: [
      'बोलून किंवा टच करून टोकन मिळवा',
      'जुने प्रिस्क्रिप्शन कॅमेऱ्याने स्कॅन करा',
      'त्वरित ओपीडी टोकन आणि खोली क्रमांक मिळवा'
    ],
    patientAction: 'सुरू करा (Start Intake)',
    doctorTitle: 'मी डॉक्टर / स्टाफ आहे',
    doctorBadge: 'Doctor & Staff • डॉक्टर',
    doctorBullets: [
      'थेट रुग्ण रांग (Live OPD Queue)',
      'AI वैद्यकीय सारांश आणि तातडीच्या सूचना',
      'डिजिटल प्रिस्क्रिप्शन आणि तपासणी नोंद'
    ],
    doctorAction: 'डॉक्टर कन्सोल (Console)',
    abdmBadge: 'आयुष्मान भारत (ABDM) सुसंगत • जलद व सुरक्षित',
    systemName: 'Smart OPD Assistant',
    tagline: 'AI Kiosk & EMR Consultation'
  },
  bn: {
    title: 'আপনি কে? আপনার ভূমিকা নির্বাচন করুন',
    subtitle: 'ওপিডি টোকেন পেতে বা রোগীর চিকিৎসা পরিচালনার জন্য বিকল্প বেছে নিন।',
    patientTitle: 'আমি একজন রোগী',
    patientBadge: 'Patient Entry • রোগী',
    patientBullets: [
      'কথা বলে বা স্পর্শ করে স্লিপ বানান',
      'পুরানো প্রেসক্রিপশন ক্যামেরা দিয়ে স্ক্যান করুন',
      'তাত্ক্ষণিক ওপিডি টোকেন এবং রুম নম্বর পান'
    ],
    patientAction: 'শুরু করুন (Start Intake)',
    doctorTitle: 'আমি একজন ডাক্তার / কর্মী',
    doctorBadge: 'Doctor & Staff • ডাক্তার',
    doctorBullets: [
      'লাইভ রোগীর সারি (OPD Queue)',
      'AI ক্লিনিক্যাল সারসংক্ষেপ ও রেড ফ্ল্যাগ',
      'ডিজিটাল প্রেসক্রিপশন ও পরামর্শ'
    ],
    doctorAction: 'ডাক্তার কনসোল (Console)',
    abdmBadge: 'আয়ুষ্মান ভারত (ABDM) সমর্থিত • অফলাইন প্রস্তুত',
    systemName: 'Smart OPD Assistant',
    tagline: 'AI Kiosk & EMR Consultation'
  },
  gu: {
    title: 'તમે કોણ છો? તમારી ભૂમિકા પસંદ કરો',
    subtitle: 'ઓપીડી ટોકન મેળવવા અથવા દર્દીઓની તપાસ માટે યોગ્ય વિકલ્પ પસંદ કરો.',
    patientTitle: 'હું દર્દી છું',
    patientBadge: 'Patient Entry • દર્દી',
    patientBullets: [
      'બોલીને અથવા ટચ કરીને ટોકન મેળવો',
      'જૂનું પ્રિસ્ક્રિપ્શન કેમેરાથી સ્કેન કરો',
      'ત્વરિત OPD ટોકન અને રૂમ નંબર મેળવો'
    ],
    patientAction: 'શરૂ કરો (Start Intake)',
    doctorTitle: 'હું ડોક્ટર / સ્ટાફ છું',
    doctorBadge: 'Doctor & Staff • ડોક્ટર',
    doctorBullets: [
      'લાઈવ દર્દી લાઈન (OPD Queue)',
      'AI ક્લિનિકલ સારાંશ અને કટોકટી ચેતવણીઓ',
      'ડિજિટલ પ્રિસ્ક્રિપ્શન અને નોંધ'
    ],
    doctorAction: 'ડોક્ટર કન્સોલ (Console)',
    abdmBadge: 'આયુષ્માન ભારત (ABDM) સુસંગત • સુરક્ષિત',
    systemName: 'Smart OPD Assistant',
    tagline: 'AI Kiosk & EMR Consultation'
  },
  ta: {
    title: 'நீங்கள் யார்? உங்கள் பங்கைத் தேர்ந்தெடுக்கவும்',
    subtitle: 'ஓபிடி டோக்கன் பெற அல்லது மருத்துவ ஆலோசனைகளை நிர்வகிக்க விருப்பத்தைத் தேர்ந்தெடுக்கவும்.',
    patientTitle: 'நான் நோயாளி',
    patientBadge: 'Patient Entry • நோயாளி',
    patientBullets: [
      'குரல் அல்லது தொடுதல் மூலம் சீட்டு பெறவும்',
      'பழைய மருந்துச் சீட்டை கேமரா மூலம் ஸ்கேன் செய்யவும்',
      'உடனடி OPD டோக்கன் & அறை எண் பெறவும்'
    ],
    patientAction: 'தொடங்கவும் (Start Intake)',
    doctorTitle: 'நான் மருத்துவர் / பணியாளர்',
    doctorBadge: 'Doctor & Staff • மருத்துவர்',
    doctorBullets: [
      'நேரலை நோயாளி வரிசை (OPD Queue)',
      'AI மருத்துவச் சுருக்கம் & அவசர எச்சரிக்கைகள்',
      'டிஜிட்டல் மருந்துச் சீட்டு (Rx) எழுதுதல்'
    ],
    doctorAction: 'மருத்துவர் பக்கம் (Console)',
    abdmBadge: 'ஆயுஷ்மான் பாரத் (ABDM) இணக்கமானது • பாதுகாப்பானது',
    systemName: 'Smart OPD Assistant',
    tagline: 'AI Kiosk & EMR Consultation'
  },
  te: {
    title: 'మీరు ఎవరు? మీ పాత్రను ఎంచుకోండి',
    subtitle: 'ఓపీడీ టోకెన్ పొందడానికి లేదా రోగుల సేవలను నిర్వహించడానికి ఎంచుకోండి.',
    patientTitle: 'నేను రోగిని',
    patientBadge: 'Patient Entry • రోగి',
    patientBullets: [
      'వాయిస్ లేదా టచ్ ద్వారా టోకెన్ స్లిప్ పొందండి',
      'పాత ప్రిస్క్రిప్షన్‌ను కెమెరాతో స్కాన్ చేయండి',
      'తక్షణ OPD టోకెన్ & గది సంఖ్య పొందండి'
    ],
    patientAction: 'ప్రారంభించండి (Start Intake)',
    doctorTitle: 'నేను డాక్టర్ / సిబ్బందిని',
    doctorBadge: 'Doctor & Staff • డాక్టర్',
    doctorBullets: [
      'లైవ్ రోగుల క్యూ (OPD Queue)',
      'AI క్లినికల్ సారాంశం & అత్యవసర హెచ్చరికలు',
      'డిజిటల్ ప్రిస్క్రిప్షన్ & రికార్డులు'
    ],
    doctorAction: 'డాక్టర్ కన్సోల్ (Console)',
    abdmBadge: 'ఆయుష్మాన్ భారత్ (ABDM) అనుకూలమైనది • వేగవంతమైనది',
    systemName: 'Smart OPD Assistant',
    tagline: 'AI Kiosk & EMR Consultation'
  },
  kn: {
    title: 'ನೀವು ಯಾರು? ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    subtitle: 'ಒಪಿಡಿ ಟೋಕನ್ ಪಡೆಯಲು ಅಥವಾ ರೋಗಿಗಳ ಸಲಹೆಯನ್ನು ನಿರ್ವಹಿಸಲು ಆಯ್ಕೆಮಾಡಿ.',
    patientTitle: 'ನಾನು ರೋಗಿ',
    patientBadge: 'Patient Entry • ರೋಗಿ',
    patientBullets: [
      'ಧ್ವನಿ ಅಥವಾ ಸ್ಪರ್ಶದ ಮೂಲಕ ಟೋಕನ್ ಸ್ಲಿಪ್ ಪಡೆಯಿರಿ',
      'ಹಳೆಯ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಕ್ಯಾಮೆರಾದಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
      'ತಕ್ಷಣದ OPD ಟೋಕನ್ ಮತ್ತು ಕೊಠಡಿ ಸಂಖ್ಯೆ ಪಡೆಯಿರಿ'
    ],
    patientAction: 'ಪ್ರಾರಂಭಿಸಿ (Start Intake)',
    doctorTitle: 'ನಾನು ವೈದ್ಯ / ಸಿಬ್ಬಂದಿ',
    doctorBadge: 'Doctor & Staff • ವೈದ್ಯರು',
    doctorBullets: [
      'ನೇರ ರೋಗಿಗಳ ಸಾಲು (Live OPD Queue)',
      'AI ಕ್ಲಿನಿಕಲ್ ಸಾರಾಂಶ ಮತ್ತು ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳು',
      'ಡಿಜಿಟಲ್ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಬರೆಯಿರಿ'
    ],
    doctorAction: 'ವೈದ್ಯರ ಕನ್ಸೋಲ್ (Console)',
    abdmBadge: 'ಆಯುಷ್ಮಾನ್ ಭಾರತ್ (ABDM) ಹೊಂದಾಣಿಕೆಯಾಗಿದೆ',
    systemName: 'Smart OPD Assistant',
    tagline: 'AI Kiosk & EMR Consultation'
  },
  pa: {
    title: 'ਤੁਸੀਂ ਕੌਣ ਹੋ? ਆਪਣੀ ਸ਼੍ਰੇਣੀ ਚੁਣੋ',
    subtitle: 'ਓਪੀਡੀ ਟੋਕਨ ਲੈਣ ਜਾਂ ਮਰੀਜ਼ਾਂ ਦੀ ਜਾਂਚ ਲਈ ਆਪਣੀ ਭੂਮਿਕਾ ਚੁਣੋ।',
    patientTitle: 'ਮੈਂ ਮਰੀਜ਼ ਹਾਂ',
    patientBadge: 'Patient Entry • ਮਰੀਜ਼',
    patientBullets: [
      'ਬੋਲ ਕੇ ਜਾਂ ਟੱਚ ਨਾਲ ਪਰਚੀ ਬਣਵਾਓ',
      'ਪੁਰਾਣਾ ਨੁਸਖ਼ਾ ਕੈਮਰੇ ਨਾਲ ਸਕੈਨ ਕਰੋ',
      'ਤੁਰੰਤ OPD ਟੋਕਨ ਤੇ ਕਮਰਾ ਨੰਬਰ ਪ੍ਰਾਪਤ ਕਰੋ'
    ],
    patientAction: 'ਸ਼ੁਰੂ ਕਰੋ (Start Intake)',
    doctorTitle: 'ਮੈਂ ਡਾਕਟਰ / ਸਟਾਫ਼ ਹਾਂ',
    doctorBadge: 'Doctor & Staff • ਡਾਕਟਰ',
    doctorBullets: [
      'ਲਾਈਵ ਮਰੀਜ਼ਾਂ ਦੀ ਕਤਾਰ (Live OPD Queue)',
      'AI ਮੈਡੀਕਲ ਸਾਰਾਂਸ਼ ਅਤੇ ਐਮਰਜੈਂਸੀ ਅਲਰਟ',
      'ਡਿਜੀਟਲ ਨੁਸਖ਼ਾ (Rx) ਅਤੇ ਸਲਾਹ'
    ],
    doctorAction: 'ਡਾਕਟਰ ਕੰਸੋਲ (Console)',
    abdmBadge: 'ਆਯੁਸ਼ਮਾਨ ਭਾਰਤ (ABDM) ਅਨੁਕੂਲ • ਸੁਰੱਖਿਅਤ',
    systemName: 'Smart OPD Assistant',
    tagline: 'AI Kiosk & EMR Consultation'
  },
  bho: {
    title: 'रउआ के बानी? आपन रोल चुनीं',
    subtitle: 'ओपीडी टोकन लेवे खातिर भा डॉक्टर के मरीज देखे खातिर चुनीं।',
    patientTitle: 'हम मरीज बानी',
    patientBadge: 'Patient Entry • मरीज',
    patientBullets: [
      'बोल के भा छू के परची बनवावीं',
      'पुरान परचा कैमरा से स्कैन करीं',
      'तुरंत OPD टोकन आ कमरा नंबर पाईं'
    ],
    patientAction: 'शुरू करीं (Start Intake)',
    doctorTitle: 'हम डॉक्टर / स्टाफ बानी',
    doctorBadge: 'Doctor & Staff • डॉक्टर',
    doctorBullets: [
      'लाइव मरीज कतार (OPD Queue)',
      'AI क्लिनिकल समरी आ जरूरी चेताउनी',
      'डिजिटल परचा आ इलाज सलाह'
    ],
    doctorAction: 'डॉक्टर कंसोल (Console)',
    abdmBadge: 'आयुष्मान भारत (ABDM) सुरक्षित • ऑफलाइन उपलब्ध',
    systemName: 'Smart OPD Assistant',
    tagline: 'AI Kiosk & EMR Consultation'
  },
  ml: {
    title: 'നിങ്ങൾ ആരാണ്? നിങ്ങളുടെ പങ്ക് തിരഞ്ഞെടുക്കുക',
    subtitle: 'ഒപിഡി ടോക്കൺ ലഭിക്കുന്നതിനോ കൺസൾട്ടേഷൻ നടത്തുന്നതിനോ തിരഞ്ഞെടുക്കുക.',
    patientTitle: 'ഞാൻ രോഗിയാണ്',
    patientBadge: 'Patient Entry • രോഗി',
    patientBullets: [
      'സംസാരിച്ചോ സ്പർശിച്ചോ ടോക്കൺ എടുക്കുക',
      'പഴയ കുറിപ്പടി ക്യാമറ ഉപയോഗിച്ച് സ്കാൻ ചെയ്യുക',
      'തൽക്ഷണ OPD ടോക്കണും മുറി നമ്പറും നേടുക'
    ],
    patientAction: 'ആരംഭിക്കുക (Start Intake)',
    doctorTitle: 'ഞാൻ ഡോക്ടർ / ജീവനക്കാരനാണ്',
    doctorBadge: 'Doctor & Staff • ഡോക്ടർ',
    doctorBullets: [
      'തത്സമയ രോഗികളുടെ നിര (OPD Queue)',
      'AI മെഡിക്കൽ സംഗ്രഹവും അടിയന്തര മുന്നറിയിപ്പുകളും',
      'ഡിജിറ്റൽ കുറിപ്പടിയും പരിശോധനയും'
    ],
    doctorAction: 'ഡോക്ടർ കൺസോൾ (Console)',
    abdmBadge: 'ആയുഷ്മാൻ ഭാരത് (ABDM) അനുയോജ്യമാണ്',
    systemName: 'Smart OPD Assistant',
    tagline: 'AI Kiosk & EMR Consultation'
  },
  or: {
    title: 'ଆପଣ କିଏ? ଆପଣଙ୍କ ଭୂମିକା ବାଛନ୍ତୁ',
    subtitle: 'ଓପିଡି ଟୋକନ୍ ପାଇବା କିମ୍ବା ରୋଗୀ ଦେଖିବା ପାଇଁ ବିକଳ୍ପ ବାଛନ୍ତୁ।',
    patientTitle: 'ମୁଁ ଜଣେ ରୋଗୀ',
    patientBadge: 'Patient Entry • ରୋଗୀ',
    patientBullets: [
      'କହି କିମ୍ବା ସ୍ପର୍ଶ କରି ସ୍ଲିପ୍ ପ୍ରସ୍ତୁତ କରନ୍ତୁ',
      'ପୁରୁଣା ପ୍ରେସକ୍ରିପସନ୍ କ୍ୟାମେରାରେ ସ୍କାନ୍ କରନ୍ତୁ',
      'ତୁରନ୍ତ OPD ଟୋକନ୍ ଏବଂ ରୁମ୍ ନମ୍ବର ପାଆନ୍ତୁ'
    ],
    patientAction: 'ଆରମ୍ଭ କରନ୍ତୁ (Start Intake)',
    doctorTitle: 'ମୁଁ ଡାକ୍ତର / କର୍ମଚାରୀ',
    doctorBadge: 'Doctor & Staff • ଡାକ୍ତର',
    doctorBullets: [
      'ଲାଇଭ୍ ରୋଗୀ ତାଲିକା (Live OPD Queue)',
      'AI ଚିକିତ୍ସା ସାରାଂଶ ଏବଂ ସତର୍କତା',
      'ଡିଜିଟାଲ୍ ପ୍ରେସକ୍ରିପସନ୍ ଲେଖନ୍ତୁ'
    ],
    doctorAction: 'ଡାକ୍ତର କନସୋଲ୍ (Console)',
    abdmBadge: 'ଆୟୁଷ୍ମାନ ଭାରତ (ABDM) ସୁସଙ୍ଗତ',
    systemName: 'Smart OPD Assistant',
    tagline: 'AI Kiosk & EMR Consultation'
  },
  ur: {
    title: 'آپ کون ہیں؟ اپنا کردار منتخب کریں',
    subtitle: 'او پی ڈی ٹوکن حاصل کرنے یا طبی مشاورت کے لیے انتخاب کریں۔',
    patientTitle: 'میں مریض ہوں',
    patientBadge: 'Patient Entry • مریض',
    patientBullets: [
      'بول کر یا ٹچ کے ذریعے پرچی حاصل کریں',
      'پرانا نسخہ کیمرے سے اسکین کریں',
      'فوری او پی ڈی ٹوکن اور کمرہ نمبر حاصل کریں'
    ],
    patientAction: 'شروع کریں (Start Intake)',
    doctorTitle: 'میں ڈاکٹر / عملہ ہوں',
    doctorBadge: 'Doctor & Staff • ڈاکٹر',
    doctorBullets: [
      'لائیو مریضوں کی قطار (Live OPD Queue)',
      'AI طبی خلاصہ اور ہنگامی الرٹس',
      'ڈیجیٹل نسخہ (Rx) اور مشاورت'
    ],
    doctorAction: 'ڈاکٹر کنسول (Console)',
    abdmBadge: 'آیوشمان بھارت (ABDM) کے مطابق • محفوظ',
    systemName: 'Smart OPD Assistant',
    tagline: 'AI Kiosk & EMR Consultation'
  },
  hinglish: {
    title: 'Aap Kaun Hain? Choose Your Role',
    subtitle: 'OPD Token lene ke liye ya patient consultation ke liye category select karein.',
    patientTitle: 'Main Patient Hoon',
    patientBadge: 'Patient Entry • Kiosk',
    patientBullets: [
      'Bolkar ya touch se instant slip banwayein',
      'Purana prescription camera se scan karein',
      'Instant OPD token slip aur room number paayein'
    ],
    patientAction: 'Start Intake • Shuru Karein',
    doctorTitle: 'Main Doctor / Staff Hoon',
    doctorBadge: 'Doctor & Staff Console',
    doctorBullets: [
      'Live patient token queue aur call system',
      'AI concise clinical summary & red flag alerts',
      'Write EMR prescriptions (Rx) & advice'
    ],
    doctorAction: 'Doctor Console',
    abdmBadge: 'Ayushman Bharat Digital Mission (ABDM) & DPDP Compliant • Offline Ready',
    systemName: 'Smart OPD Assistant',
    tagline: 'AI Kiosk & EMR Consultation'
  },
  en: {
    title: 'Please Select Your Role',
    subtitle: 'Choose your portal to get an OPD intake token or manage patient clinical consultations.',
    patientTitle: 'I am a Patient',
    patientBadge: 'Patient Intake • Kiosk',
    patientBullets: [
      'Voice & touch multilingual intake registration',
      'Scan past prescriptions with camera OCR',
      'Instant OPD Token slip generation with room number'
    ],
    patientAction: 'Start Intake Registration',
    doctorTitle: 'I am a Doctor / Staff',
    doctorBadge: 'Clinical Console',
    doctorBullets: [
      'Live patient queue & one-click token call',
      'AI clinical summary & priority red flags',
      'Generate EMR prescriptions (Rx) & download PDF'
    ],
    doctorAction: 'Open Doctor Console',
    abdmBadge: 'Ayushman Bharat Digital Mission (ABDM) & DPDP Compliant • Offline Ready',
    systemName: 'Smart OPD Assistant',
    tagline: 'AI Kiosk & EMR Consultation'
  }
};
