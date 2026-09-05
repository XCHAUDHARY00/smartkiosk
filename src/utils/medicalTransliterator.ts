/**
 * Smart OPD Medical Transliterator & PDF Text Sanitizer
 * Solves jsPDF Latin-1/WinAnsi mojibake when printing Indian regional scripts
 * (Devanagari, Gurmukhi, Tamil, Telugu, Bengali, Marathi, Gujarati, etc.)
 */

// Common medical symptom mappings across Indian languages to Standard Clinical English
const SYMPTOM_PATTERNS: Array<{ regex: RegExp; clinical: string; romanized: string }> = [
  // Chest / Heart
  {
    regex: /(ਸੀਨੇ|ਛਾਤੀ|seene|cheste?|chhati|heart|dil|छाती|हृदय|हार्ट|सीना|ਛਾਤੀ ਚ|ਸੀਨੇ ਵਿੱਚ)/i,
    clinical: 'Precordial Chest Heaviness / Retrosternal Discomfort',
    romanized: 'Seene / Chhati vich dard'
  },
  // Headache
  {
    regex: /(ਸਿਰ|ਸਿਰਦਰਦ|sir|headache|sar|matha|सिर|माथा|सरदर्द|ਸਿਰ ਵਿੱਚ)/i,
    clinical: 'Acute Cephalalgia / Severe Headache',
    romanized: 'Sir / Sar dard'
  },
  // Fever
  {
    regex: /(ਬੁਖਾਰ|ਤਾਪ|bukhar|fever|taap|bukhaar|बुखार|ताप|ज्वर)/i,
    clinical: 'Febrile Illness with Rigors & Bodyache',
    romanized: 'Bukhar / Taap'
  },
  // Cough
  {
    regex: /(ਖੰਘ|cough|khang|khasi|khansi|balgam|ਖੰਘਾਰ|खांसी|कफ|बलगम)/i,
    clinical: 'Persistent Cough & Pharyngeal Congestion',
    romanized: 'Khang / Khansi'
  },
  // Breathlessness / Dyspnea
  {
    regex: /(ਸਾਹ|breath|saah|saans|dum|phoolna|सांस|दमा|सांस फूलना|ਘਬਰਾਹਟ)/i,
    clinical: 'Exertional Dyspnea / Shortness of Breath',
    romanized: 'Saans / Saah phullna'
  },
  // Abdominal / Stomach
  {
    regex: /(ਪੇਟ|stomach|pet|abdomen|dharan|afara|gas|पेट|उदर|गैस|मरोड़|ਪੇਟ ਵਿੱਚ)/i,
    clinical: 'Acute Epigastric Abdominal Pain & Dyspepsia',
    romanized: 'Pet dard / Gas'
  },
  // Nausea / Vomiting
  {
    regex: /(ਉਲਟੀ|vomit|ulti|nausea|jee kacha|उल्टी|जी मिचलाना|कै)/i,
    clinical: 'Nausea & Recurrent Emesis',
    romanized: 'Ulti / Jee kacha'
  },
  // Acidity / Heartburn
  {
    regex: /(ਜਲਣ|acidity|jalan|acid|khate|dakar|जलन|एसिडिटी|खट्टी डकार)/i,
    clinical: 'Pyrosis & Gastroesophageal Reflux',
    romanized: 'Seene mein jalan / Acidity'
  },
  // Dizziness / Vertigo
  {
    regex: /(ਚੱਕਰ|dizzy|chakkar|giddiness|vertigo|चक्कर|सिर घूमना)/i,
    clinical: 'Postural Vertigo & Presyncope',
    romanized: 'Chakkar aana'
  },
  // Joint / Body Pain
  {
    regex: /(ਜੋੜ|ਗੋਡੇ|joint|jodan|goda|kamar|back|haad|जोड़ों|कमर|दर्द|घुटने|हड्डी)/i,
    clinical: 'Bilateral Arthralgia & Musculoskeletal Strain',
    romanized: 'Jodan / Kamar da dard'
  },
  // Weakness / Fatigue
  {
    regex: /(ਕਮਜ਼ੋਰੀ|ਥਕਾਵਟ|weak|kamzori|fatigue|thakawat|कमजोरी|थकावट)/i,
    clinical: 'Generalized Asthenia & Chronic Malaise',
    romanized: 'Kamzori / Thakawat'
  },
  // Diabetes / Sugar
  {
    regex: /(ਸ਼ੂਗਰ|sugar|diabetes|मधुमेह|शुगर)/i,
    clinical: 'Type-2 Diabetes Mellitus Review & Glycemic Control',
    romanized: 'Sugar / Diabetes'
  },
  // Hypertension / BP
  {
    regex: /(ਬਲੱਡ|ਪ੍ਰੈਸ਼ਰ|bp|pressure|hypertension|रक्तचाप|बीपी)/i,
    clinical: 'Essential Hypertension Screening & Management',
    romanized: 'High Blood Pressure'
  },
  // Throat / ENT
  {
    regex: /(ਗਲਾ|throat|gala|sore|gale|गला|खराश)/i,
    clinical: 'Acute Pharyngitis / Sore Throat',
    romanized: 'Gala kharab / Khash'
  },
  // Eye / Vision
  {
    regex: /(ਅੱਖ|eye|akhan|nazar|drishti|आंख|नेत्र|नजर)/i,
    clinical: 'Ocular Discomfort & Visual Strain',
    romanized: 'Akhan / Aankhon mein dard'
  },
  // Ear
  {
    regex: /(ਕੰਨ|ear|kann|kaan|कान|श्रवण)/i,
    clinical: 'Otalgia & Middle Ear Examination',
    romanized: 'Kaan / Kann dard'
  },
  // Skin / Rash
  {
    regex: /(ਖਾਰਸ਼|allergy|kharish|skin|rash|खुजली|चमड़ी|चकत्ते)/i,
    clinical: 'Pruritic Dermatitis & Cutaneous Eruption',
    romanized: 'Kharish / Khujli'
  }
];

// Indic to Latin character phonetic mapping for transliteration fallback
const INDIC_MAP: Record<number, string> = {
  // Gurmukhi (0x0A00 - 0x0A7F)
  0x0a05: 'a', 0x0a06: 'aa', 0x0a07: 'i', 0x0a08: 'ee', 0x0a09: 'u', 0x0a0a: 'oo',
  0x0a0f: 'e', 0x0a10: 'ai', 0x0a13: 'o', 0x0a14: 'au',
  0x0a15: 'k', 0x0a16: 'kh', 0x0a17: 'g', 0x0a18: 'gh',
  0x0a1a: 'ch', 0x0a1b: 'chh', 0x0a1c: 'j', 0x0a1d: 'jh',
  0x0a1f: 't', 0x0a20: 'th', 0x0a21: 'd', 0x0a22: 'dh', 0x0a23: 'n',
  0x0a24: 't', 0x0a25: 'th', 0x0a26: 'd', 0x0a27: 'dh', 0x0a28: 'n',
  0x0a2a: 'p', 0x0a2b: 'ph', 0x0a2c: 'b', 0x0a2d: 'bh', 0x0a2e: 'm',
  0x0a2f: 'y', 0x0a30: 'r', 0x0a32: 'l', 0x0a33: 'l', 0x0a35: 'v', 0x0a36: 'sh', 0x0a38: 's', 0x0a39: 'h',
  0x0a3e: 'aa', 0x0a3f: 'i', 0x0a40: 'ee', 0x0a41: 'u', 0x0a42: 'oo',
  0x0a47: 'e', 0x0a48: 'ai', 0x0a4b: 'o', 0x0a4c: 'au', 0x0a4d: '',
  0x0a70: 'n', 0x0a71: '', 0x0a72: 'u', 0x0a73: 'oo',

  // Devanagari (0x0900 - 0x097F)
  0x0905: 'a', 0x0906: 'aa', 0x0907: 'i', 0x0908: 'ee', 0x0909: 'u', 0x090a: 'oo',
  0x090f: 'e', 0x0910: 'ai', 0x0913: 'o', 0x0914: 'au',
  0x0915: 'k', 0x0916: 'kh', 0x0917: 'g', 0x0918: 'gh',
  0x091a: 'ch', 0x091b: 'chh', 0x091c: 'j', 0x091d: 'jh',
  0x091f: 't', 0x0920: 'th', 0x0921: 'd', 0x0922: 'dh', 0x0923: 'n',
  0x0924: 't', 0x0925: 'th', 0x0926: 'd', 0x0927: 'dh', 0x0928: 'n',
  0x092a: 'p', 0x092b: 'ph', 0x092c: 'b', 0x092d: 'bh', 0x092e: 'm',
  0x092f: 'y', 0x0930: 'r', 0x0932: 'l', 0x0935: 'v', 0x0936: 'sh', 0x0937: 'sh', 0x0938: 's', 0x0939: 'h',
  0x093e: 'aa', 0x093f: 'i', 0x0940: 'ee', 0x0941: 'u', 0x0942: 'oo',
  0x0947: 'e', 0x0948: 'ai', 0x094b: 'o', 0x094c: 'au', 0x094d: '',
  0x0902: 'n', 0x0901: 'n'
};

/**
 * Checks if a string contains non-ASCII Indic characters (Devanagari, Gurmukhi, etc.)
 */
export function hasIndicCharacters(text: string): boolean {
  if (!text) return false;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Devanagari (0x0900-0x097F), Bengali (0x0980-0x09FF), Gurmukhi (0x0A00-0x0A7F),
    // Gujarati (0x0A80-0x0AFF), Oriya (0x0B00-0x0B7F), Tamil (0x0B80-0x0BFF),
    // Telugu (0x0C00-0x0C7F), Kannada (0x0C80-0x0CFF), Malayalam (0x0D00-0x0D7F)
    if (code >= 0x0900 && code <= 0x0d7f) {
      return true;
    }
  }
  return false;
}

/**
 * Translates regional Indian symptom phrase to clean Standard Clinical English
 */
export function translateSymptomToClinicalEnglish(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') {
    return 'General Health Intake & Clinical Review';
  }

  const cleaned = rawText.trim();

  // Try matching symptom patterns
  for (const item of SYMPTOM_PATTERNS) {
    if (item.regex.test(cleaned)) {
      return `${item.clinical} [${item.romanized}]`;
    }
  }

  // If text has non-ASCII characters, transliterate it phonetically
  if (hasIndicCharacters(cleaned)) {
    const romanized = transliterateIndicToLatin(cleaned);
    if (romanized.length > 2) {
      return `Clinical Review (${romanized})`;
    }
    return 'General OPD Clinical Intake';
  }

  return cleaned;
}

/**
 * Phonetically transliterates Indic script characters into safe Latin ASCII
 */
export function transliterateIndicToLatin(text: string): string {
  if (!text) return '';
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code in INDIC_MAP) {
      out += INDIC_MAP[code];
    } else if (code >= 32 && code <= 126) {
      out += text[i];
    } else if (code === 9 || code === 10 || code === 13) {
      out += ' ';
    }
    // Omit unmapped non-Latin code points to prevent jsPDF 16-bit split bugs
  }
  return out.replace(/\s+/g, ' ').trim();
}

/**
 * Sanitizes any string destined for jsPDF vector drawing:
 * 1. Automatically converts any non-ASCII regional Indian medical words to Clinical English.
 * 2. Strips all tabs (\t) and unwanted control characters.
 * 3. Guarantees that only standard printable ASCII characters (32 to 126) are returned.
 * Prevents jsPDF WinAnsi byte splitting into '. G 0 G 8 ? 0 . G & 0 M & 9 K'
 */
export function sanitizeTextForPDF(input: string | undefined | null): string {
  if (!input) return '';
  
  let str = String(input);

  // If text contains Indic characters, replace known phrases first
  if (hasIndicCharacters(str)) {
    for (const item of SYMPTOM_PATTERNS) {
      if (item.regex.test(str)) {
        str = str.replace(item.regex, `${item.clinical} [${item.romanized}]`);
      }
    }
  }

  // Clean characters code by code to guarantee 100% printable ASCII
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);

    if (code >= 32 && code <= 126) {
      // Standard printable ASCII
      result += str[i];
    } else if (code in INDIC_MAP) {
      // Known Indic character
      result += INDIC_MAP[code];
    } else if (code === 9 || code === 10 || code === 13) {
      // Tab or newline -> space
      result += ' ';
    } else if (code === 8216 || code === 8217) {
      // Single quotes
      result += "'";
    } else if (code === 8220 || code === 8221) {
      // Double quotes
      result += '"';
    } else if (code === 8211 || code === 8212) {
      // En/em dash
      result += '-';
    } else if (code === 8226) {
      // Bullet symbol
      result += '*';
    } else {
      // Any other high-code Unicode character: replace with space if boundary
      result += ' ';
    }
  }

  // Collapse multiple spaces
  return result.replace(/\s+/g, ' ').trim();
}
