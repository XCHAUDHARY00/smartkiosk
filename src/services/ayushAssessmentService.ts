import { AYUSHAssessment, LanguageCode } from '../types';

export interface AyushQuestionItem {
  id: string;
  category: 'agni' | 'koshtha' | 'prakriti' | 'nidra' | 'ahara_vihara' | 'followup_agni' | 'followup_nidra';
  questionNumber: number;
  questionHindi: string;
  questionEnglish: string;
  helperTextHindi: string;
  helperTextEnglish: string;
  options: Array<{
    id: string;
    labelHindi: string;
    labelEnglish: string;
    icon: string;
    sublabelHindi?: string;
    sublabelEnglish?: string;
    mappedParameter: string;
    valueTag: string;
  }>;
}

export interface AyushDialogueEntry {
  questionNumber: number;
  category: string;
  questionText: string;
  questionEnglish: string;
  selectedOptionId: string;
  answerText: string;
  timestamp: string;
  parameterTag: string;
}

// Structured question bank with adaptive branching
export const AYUSH_QUESTION_BANK: Record<string, AyushQuestionItem> = {
  // 1. Agni / Appetite Baseline
  agni_baseline: {
    id: 'agni_baseline',
    category: 'agni',
    questionNumber: 1,
    questionHindi: 'आपकी भूख और भोजन पचने की स्थिति आमतौर पर कैसी रहती है?',
    questionEnglish: 'How is your regular appetite and digestion power (Agni)?',
    helperTextHindi: 'आयुर्वेद में अग्नि को स्वास्थ्य का मूल आधार माना जाता है',
    helperTextEnglish: 'Agni (digestive fire) is central to Ayurvedic metabolic assessment',
    options: [
      {
        id: 'sama_agni',
        labelHindi: 'समय पर भूख व सामान्य पाचन',
        labelEnglish: 'Normal Appetite & Digestion (Sama Agni)',
        icon: 'Utensils',
        sublabelHindi: 'नियमित समय पर भूख लगती है, खाना ठीक पचता है',
        sublabelEnglish: 'Balanced hunger at regular times, comfortable digestion',
        mappedParameter: 'agni.agniType',
        valueTag: 'Sama Agni (Balanced / सम अग्नि)'
      },
      {
        id: 'manda_agni',
        labelHindi: 'भूख कम लगना या पेट में भारीपन',
        labelEnglish: 'Low Appetite / Sluggish (Manda Agni)',
        icon: 'TrendingDown',
        sublabelHindi: 'भूख नहीं लगती, खाने के बाद भारीपन व सुस्ती',
        sublabelEnglish: 'Poor hunger, post-meal heaviness and lethargy',
        mappedParameter: 'agni.agniType',
        valueTag: 'Manda Agni (Sluggish / मंद अग्नि)'
      },
      {
        id: 'tikshna_agni',
        labelHindi: 'तीव्र भूख या सीने में जलन/एसिडिटी',
        labelEnglish: 'Sharp Hunger / Acidity (Tikshna Agni)',
        icon: 'Flame',
        sublabelHindi: 'बहुत जल्दी भूख लगना, खट्टी डकारें या जलन',
        sublabelEnglish: 'Intense frequent hunger, burning sensation, acid reflux',
        mappedParameter: 'agni.agniType',
        valueTag: 'Tikshna Agni (Sharp / तीक्ष्ण अग्नि)'
      },
      {
        id: 'visham_agni',
        labelHindi: 'अनियमित भूख (कभी कम, कभी ज्यादा)',
        labelEnglish: 'Variable / Irregular (Visham Agni)',
        icon: 'Activity',
        sublabelHindi: 'किसी दिन बहुत भूख, किसी दिन बिल्कुल नहीं',
        sublabelEnglish: 'Unpredictable hunger patterns and fluctuating digestion',
        mappedParameter: 'agni.agniType',
        valueTag: 'Visham Agni (Irregular / विषम अग्नि)'
      }
    ]
  },

  // 1a. Adaptive Follow-up: Manda Agni (Low Appetite)
  manda_agni_followup: {
    id: 'manda_agni_followup',
    category: 'followup_agni',
    questionNumber: 2,
    questionHindi: 'खाना खाने के बाद पेट में मुख्य रूप से क्या असुविधा महसूस होती है?',
    questionEnglish: 'What specific discomfort do you notice after having food?',
    helperTextHindi: 'यह आपके पाचन तंत्र में आम (टॉक्सिन) व कफ की स्थिति समझने में मदद करता है',
    helperTextEnglish: 'Helps evaluate digestive sluggishness and Ama formation',
    options: [
      {
        id: 'post_heaviness',
        labelHindi: 'पेट में भारीपन व सुस्ती',
        labelEnglish: 'Heaviness & Sluggishness',
        icon: 'Coffee',
        sublabelHindi: 'कम खाने पर भी पेट घंटों भारी रहता है',
        sublabelEnglish: 'Stomach feels full and heavy for hours',
        mappedParameter: 'agni.postMealComfort',
        valueTag: 'Heavy & Lethargic (गुरुता)'
      },
      {
        id: 'bloating_gas',
        labelHindi: 'पेट फूलना व गैस बनना',
        labelEnglish: 'Bloating & Distension',
        icon: 'Wind',
        sublabelHindi: 'पेट में तनाव, आवाजें या अफरा होना',
        sublabelEnglish: 'Abdominal gas and distension',
        mappedParameter: 'agni.postMealComfort',
        valueTag: 'Bloated with gas (आध्मान)'
      },
      {
        id: 'nausea_taste',
        labelHindi: 'मुंह का बेस्वाद होना या मिचली',
        labelEnglish: 'Tastelessness or Mild Nausea',
        icon: 'AlertCircle',
        sublabelHindi: 'भोजन में रुचि न होना (अरोचक)',
        sublabelEnglish: 'Loss of taste perception and aversion to food',
        mappedParameter: 'agni.postMealComfort',
        valueTag: 'Tastelessness / Aversion (अरोचक)'
      },
      {
        id: 'mild_tolerable',
        labelHindi: 'हल्की असुविधा, कोई गंभीर समस्या नहीं',
        labelEnglish: 'Mild Discomfort / Tolerable',
        icon: 'CheckCircle',
        sublabelHindi: 'थोड़ी देर बाद सामान्य हो जाता है',
        sublabelEnglish: 'Mild and settles gradually',
        mappedParameter: 'agni.postMealComfort',
        valueTag: 'Mild & Self-settling'
      }
    ]
  },

  // 1b. Adaptive Follow-up: Tikshna Agni (Sharp Hunger / Burning)
  tikshna_agni_followup: {
    id: 'tikshna_agni_followup',
    category: 'followup_agni',
    questionNumber: 2,
    questionHindi: 'क्या आपको सीने में जलन, अत्यधिक प्यास, या खट्टी डकारें अधिक आती हैं?',
    questionEnglish: 'Do you experience burning in chest/throat, excessive thirst, or sour belching?',
    helperTextHindi: 'पित्त दोष के प्रभाव की संरचना हेतु आवश्यक',
    helperTextEnglish: 'Structures Pitta metabolic aggravation indicators',
    options: [
      {
        id: 'acid_heartburn',
        labelHindi: 'सीने व गले में तेज जलन',
        labelEnglish: 'Heartburn & Retro-sternal Burning',
        icon: 'Flame',
        sublabelHindi: 'खाली पेट अथवा तैलीय/मसालेदार खाने पर जलन',
        sublabelEnglish: 'Burning sensation aggravated on empty stomach or spicy foods',
        mappedParameter: 'agni.postMealComfort',
        valueTag: 'Retrosternal Burning / Vidagdha'
      },
      {
        id: 'excessive_thirst',
        labelHindi: 'अत्यधिक प्यास व शरीर में गर्मी',
        labelEnglish: 'Excessive Thirst & Body Heat',
        icon: 'Droplet',
        sublabelHindi: 'बार-बार ठंडा पानी पीने की इच्छा होना',
        sublabelEnglish: 'Frequent urge for cold fluids and feeling flushed',
        mappedParameter: 'agni.postMealComfort',
        valueTag: 'Excessive Thirst / Trishna'
      },
      {
        id: 'sour_belch',
        labelHindi: 'खट्टी डकारें व मुंह में कड़वाहट',
        labelEnglish: 'Sour Eructations / Bitter Taste',
        icon: 'Smile',
        sublabelHindi: 'भोजन के बाद खट्टा पानी गले में आना',
        sublabelEnglish: 'Acid water brash and bitter taste in mouth',
        mappedParameter: 'agni.postMealComfort',
        valueTag: 'Sour Belching / Amlodgara'
      },
      {
        id: 'no_burning',
        labelHindi: 'जलन नहीं है, केवल तीव्र भूख लगती है',
        labelEnglish: 'No Burning, Only Frequent Hunger',
        icon: 'CheckCircle',
        sublabelHindi: 'समय पर भोजन न मिलने पर कमजोरी या सिरदर्द',
        sublabelEnglish: 'Feels irritable or weak if food is delayed',
        mappedParameter: 'agni.postMealComfort',
        valueTag: 'Sharp Hunger Without Acid Pain'
      }
    ]
  },

  // 2. Koshtha / Bowel Habits
  koshtha_baseline: {
    id: 'koshtha_baseline',
    category: 'koshtha',
    questionNumber: 3,
    questionHindi: 'पेट साफ होने (शौच) की आदत और मल की स्थिति कैसी रहती है?',
    questionEnglish: 'How are your bowel habits and stool consistency (Koshtha)?',
    helperTextHindi: 'कोष्ठ परीक्षा से वात, पित्त या कफ का प्रभाव स्पष्ट होता है',
    helperTextEnglish: 'Koshtha assessment identifies gut motility patterns',
    options: [
      {
        id: 'madhyama_koshtha',
        labelHindi: 'प्रतिदिन नियमित व बिना परेशानी के साफ',
        labelEnglish: 'Regular Daily & Effortless (Madhyama Koshtha)',
        icon: 'CheckCircle2',
        sublabelHindi: 'दिन में 1 बार, सामान्य रूप से बंधा हुआ मल',
        sublabelEnglish: 'Once daily, soft formed stool without strain',
        mappedParameter: 'koshtha.koshthaType',
        valueTag: 'Madhyama (Regular / मध्यम)'
      },
      {
        id: 'krura_koshtha',
        labelHindi: 'कब्ज, सख्त मल या जोर लगाना पड़ता है',
        labelEnglish: 'Constipated / Hard Stools (Krura Koshtha)',
        icon: 'ShieldAlert',
        sublabelHindi: '2-3 दिन में एक बार या मल त्याग में कठिनाई',
        sublabelEnglish: 'Dry, hard pellet stools with straining (Vata predominance)',
        mappedParameter: 'koshtha.koshthaType',
        valueTag: 'Krura (Hard / Constipated / क्रूर)'
      },
      {
        id: 'mridu_koshtha',
        labelHindi: 'दिन में 2-3 बार या ढीला/पतला मल',
        labelEnglish: 'Frequent / Loose Stools (Mridu Koshtha)',
        icon: 'Waves',
        sublabelHindi: 'दूध या थोड़ा घी लेने पर भी पेट तुरंत साफ होना',
        sublabelEnglish: 'Soft or loose stool easily evacuated (Pitta predominance)',
        mappedParameter: 'koshtha.koshthaType',
        valueTag: 'Mridu (Soft / Loose / मृदु)'
      },
      {
        id: 'irregular_koshtha',
        labelHindi: 'अनियमित (कभी कब्ज, कभी पतला मल)',
        labelEnglish: 'Variable / Irregular Bowel Habits',
        icon: 'RefreshCw',
        sublabelHindi: 'पेट पूरी तरह साफ न होने का अहसास',
        sublabelEnglish: 'Incomplete evacuation sensation, alternating consistency',
        mappedParameter: 'koshtha.koshthaType',
        valueTag: 'Variable / Vishama Koshtha'
      }
    ]
  },

  // 3. Prakriti Constitutional Preference / Thermal Tolerance
  prakriti_thermal: {
    id: 'prakriti_thermal',
    category: 'prakriti',
    questionNumber: 4,
    questionHindi: 'आपको आमतौर पर किस प्रकार के मौसम या तापमान में ज्यादा परेशानी होती है?',
    questionEnglish: 'Which climate or environmental temperature affects you more negatively?',
    helperTextHindi: 'यह आपकी प्राकृतिक शारीरिक प्रकृति (वात/पित्त/कफ) को समझने में सहायक है',
    helperTextEnglish: 'Thermal sensitivity helps structure constitutional Dosha tendency',
    options: [
      {
        id: 'sensitive_cold',
        labelHindi: 'ठंड ज्यादा लगती है, गर्म पानी व धूप पसंद है',
        labelEnglish: 'Sensitive to Cold / Prefers Warmth',
        icon: 'ThermometerSnowflake',
        sublabelHindi: 'सर्दियों में जोड़ों में दर्द, त्वचा का रूखापन या जुकाम जल्दी',
        sublabelEnglish: 'Aversion to cold; feels comfortable in warmth (Vata-Kapha)',
        mappedParameter: 'prakriti.thermalTolerance',
        valueTag: 'Sensitive to Cold / Prefers Warmth (शीत असहिष्णुता)'
      },
      {
        id: 'sensitive_heat',
        labelHindi: 'गर्मी व पसीना ज्यादा आता है, ठंडी चीजें पसंद हैं',
        labelEnglish: 'Sensitive to Heat / Prefers Cool',
        icon: 'Sun',
        sublabelHindi: 'गर्मियों में चिड़चिड़ापन, पसीना या त्वचा पर लाल दाने',
        sublabelEnglish: 'Excessive sweating, flushed easily, prefers cool air (Pitta)',
        mappedParameter: 'prakriti.thermalTolerance',
        valueTag: 'Sensitive to Heat / Prefers Cool (उष्ण असहिष्णुता)'
      },
      {
        id: 'balanced_thermal',
        labelHindi: 'दोनों मौसम सामान्य लगते हैं, कोई विशेष परेशानी नहीं',
        labelEnglish: 'Balanced / Tolerant to Both Seasons',
        icon: 'Compass',
        sublabelHindi: 'मौसम बदलने पर भी शरीर सामान्य सामंजस्य बना लेता है',
        sublabelEnglish: 'Good adaptability to moderate temperature swings',
        mappedParameter: 'prakriti.thermalTolerance',
        valueTag: 'Moderate / Balanced Thermal Adaptability'
      }
    ]
  },

  // 4. Nidra / Sleep Quality
  nidra_baseline: {
    id: 'nidra_baseline',
    category: 'nidra',
    questionNumber: 5,
    questionHindi: 'आपकी रात की नींद कैसी रहती है और सुबह उठने पर शरीर कैसा लगता है?',
    questionEnglish: 'How is your night sleep quality and how fresh do you feel upon waking?',
    helperTextHindi: 'निद्रा को आयुर्वेद में तीन मुख्य उपस्तंभों (आधार स्तंभों) में माना गया है',
    helperTextEnglish: 'Nidra (sleep) is one of the three primary pillars of Ayurvedic health',
    options: [
      {
        id: 'sound_sleep',
        labelHindi: 'गहरी, शांतिपूर्ण नींद व सुबह ताज़गी',
        labelEnglish: 'Deep Sound Sleep & Energetic Waking',
        icon: 'Moon',
        sublabelHindi: '6 से 8 घंटे की सुखद नींद, सुबह स्फूर्ति',
        sublabelEnglish: 'Uninterrupted 7-8 hours, wakes up fresh and rested',
        mappedParameter: 'nidra.quality',
        valueTag: 'Sound & Deep (सुख निद्रा)'
      },
      {
        id: 'disturbed_sleep',
        labelHindi: 'नींद बार-बार टूटती है या देर से आती है',
        labelEnglish: 'Disturbed / Frequent Waking / Insomnia',
        icon: 'Sparkles',
        sublabelHindi: 'मन में विचार चलना, करवटें बदलना, सुबह थकान',
        sublabelEnglish: 'Restless mind, takes long to sleep, unrefreshed morning (Vata)',
        mappedParameter: 'nidra.quality',
        valueTag: 'Disturbed / Delayed Sleep (खंडित निद्रा)'
      },
      {
        id: 'excessive_heavy',
        labelHindi: 'बहुत गहरी नींद पर सुबह भारीपन व सुस्ती',
        labelEnglish: 'Heavy Sleep / Unrefreshed Morning Sluggishness',
        icon: 'CloudRain',
        sublabelHindi: 'सुबह उठने का मन न करना, शरीर में आलस्य व भारीपन',
        sublabelEnglish: 'Sleeps long but wakes up lethargic and stiff (Kapha)',
        mappedParameter: 'nidra.quality',
        valueTag: 'Excessive / Sluggish Waking (तंद्रा / गुरुता)'
      }
    ]
  },

  // 4a. Adaptive Follow-up: Disturbed Sleep / Insomnia
  nidra_disturbed_followup: {
    id: 'nidra_disturbed_followup',
    category: 'followup_nidra',
    questionNumber: 6,
    questionHindi: 'नींद में बाधा का मुख्य कारण क्या लगता है?',
    questionEnglish: 'What seems to be the primary contributing factor to disturbed sleep?',
    helperTextHindi: 'मानसिक व जीवनशैली संबंधी कारणों की संरचना हेतु',
    helperTextEnglish: 'Helps evaluate Vihara and psychological stress factors',
    options: [
      {
        id: 'mental_stress',
        labelHindi: 'काम या परिवार का मानसिक तनाव व चिंता',
        labelEnglish: 'Mental Stress, Overthinking & Anxiety',
        icon: 'Brain',
        sublabelHindi: 'बिस्तर पर जाने पर भी दिमाग में चिंताएं चलना',
        sublabelEnglish: 'Racing thoughts and restlessness at bedtime',
        mappedParameter: 'lifestyle.stressLevel',
        valueTag: 'High Mental Stress / Chinta'
      },
      {
        id: 'physical_pain',
        labelHindi: 'शारीरिक दर्द, खांसी या रात में बार-बार पेशाब',
        labelEnglish: 'Physical Pain, Cough or Nocturia',
        icon: 'Activity',
        sublabelHindi: 'कमर/जोड़ों में दर्द या अन्य शारीरिक परेशानी से नींद टूटना',
        sublabelEnglish: 'Body aches, joint stiffness or cough interrupting sleep',
        mappedParameter: 'lifestyle.notes',
        valueTag: 'Sleep Interrupted by Physical Aches'
      },
      {
        id: 'screen_late_hours',
        labelHindi: 'देर रात तक मोबाइल/स्क्रीन देखना व अनियमित समय',
        labelEnglish: 'Late Night Screen Use / Irregular Schedule',
        icon: 'Smartphone',
        sublabelHindi: 'देर रात तक जागना, सुबह देर से उठना',
        sublabelEnglish: 'Excessive blue light and erratic sleep timings (Ratri Jagarana)',
        mappedParameter: 'vihara.dailyRoutine',
        valueTag: 'Late Night Screen Habits (रात्रि जागरण)'
      },
      {
        id: 'no_specific_reason',
        labelHindi: 'कोई स्पष्ट कारण नहीं, बिना बात के नींद टूटती है',
        labelEnglish: 'No Obvious Reason / Spontaneous Waking',
        icon: 'HelpCircle',
        sublabelHindi: 'अचानक 2-3 बजे नींद खुल जाना',
        sublabelEnglish: 'Early morning waking without apparent trigger',
        mappedParameter: 'nidra.notes',
        valueTag: 'Spontaneous Early Awakening'
      }
    ]
  },

  // 5. Ahara & Vihara Routine
  ahara_vihara_routine: {
    id: 'ahara_vihara_routine',
    category: 'ahara_vihara',
    questionNumber: 6,
    questionHindi: 'आपकी भोजन की आदतें और दिनचर्या (आहार एवं विहार) किस प्रकार की है?',
    questionEnglish: 'What describes your typical dietary habits and physical routine (Ahara & Vihara)?',
    helperTextHindi: 'आयुर्वेद में नियमित दिनचर्या रोग निवारण का आधार है',
    helperTextEnglish: 'Daily routine and food habits structure your health baseline',
    options: [
      {
        id: 'sattvic_moderate',
        labelHindi: 'सादा ताजा भोजन, नियमित समय व हल्का व्यायाम',
        labelEnglish: 'Fresh Balanced Meals, Regular Timings & Walking',
        icon: 'HeartHandshake',
        sublabelHindi: 'घर का बना सात्विक भोजन, समय पर भोजन',
        sublabelEnglish: 'Fresh home-cooked food, regular meal hours, light walk',
        mappedParameter: 'ahara.dietaryPattern',
        valueTag: 'Sattvic / Balanced Diet with Regular Routine'
      },
      {
        id: 'spicy_irregular',
        labelHindi: 'तीखा/तली चीजें या बाहर का भोजन, समय अनियमित',
        labelEnglish: 'Spicy/Fried Foods, Outside Meals, Irregular Times',
        icon: 'AlertTriangle',
        sublabelHindi: 'चाय-कॉफी अधिक, रात का खाना बहुत देर से',
        sublabelEnglish: 'Frequent tea/coffee, spicy fried snacks, late dinner',
        mappedParameter: 'ahara.dietaryPattern',
        valueTag: 'Spicy / Pungent / Irregular Meal Hours'
      },
      {
        id: 'sedentary_sitting',
        labelHindi: 'दिनभर कुर्सी पर बैठकर काम, बहुत कम शारीरिक गतिविधि',
        labelEnglish: 'Desk-Bound Sedentary Work, Minimal Movement',
        icon: 'Armchair',
        sublabelHindi: '8-10 घंटे बैठना, व्यायाम का अभाव, दिन में आलस्य',
        sublabelEnglish: 'Prolonged sitting with lack of active physical exercise',
        mappedParameter: 'vihara.physicalActivity',
        valueTag: 'Sedentary Work / Alpa Vyayama'
      },
      {
        id: 'active_travel',
        labelHindi: 'दौड़भाग वाला काम, अधिक शारीरिक परिश्रम या यात्रा',
        labelEnglish: 'Active Field Work, Heavy Physical Exertion / Travel',
        icon: 'Footprints',
        sublabelHindi: 'दिनभर खड़े रहना या सफर, समय पर खाना न मिल पाना',
        sublabelEnglish: 'High physical exertion or frequent field travel',
        mappedParameter: 'vihara.physicalActivity',
        valueTag: 'High Physical Exertion / Ati-Vyayama'
      }
    ]
  }
};

// Adaptive next question decider
export function getNextAyushQuestion(
  history: AyushDialogueEntry[],
  currentQuestionId?: string
): AyushQuestionItem | null {
  // If no history, begin with Agni baseline
  if (!history || history.length === 0) {
    return AYUSH_QUESTION_BANK.agni_baseline;
  }

  const answeredIds = new Set(history.map(h => h.selectedOptionId));
  const answeredCategories = new Set(history.map(h => h.category));

  // Find latest response
  const latestEntry = history[history.length - 1];

  // 1. If just finished Agni Baseline:
  if (latestEntry.category === 'agni') {
    // If Manda Agni (Low appetite) -> trigger Manda Agni follow-up
    if (latestEntry.selectedOptionId === 'manda_agni') {
      return AYUSH_QUESTION_BANK.manda_agni_followup;
    }
    // If Tikshna Agni (Acidity/Sharp) -> trigger Tikshna Agni follow-up
    if (latestEntry.selectedOptionId === 'tikshna_agni') {
      return AYUSH_QUESTION_BANK.tikshna_agni_followup;
    }
    // Else move directly to Koshtha (Bowel habits)
    return AYUSH_QUESTION_BANK.koshtha_baseline;
  }

  // 2. If finished Agni follow-up -> move to Koshtha
  if (latestEntry.category === 'followup_agni') {
    return AYUSH_QUESTION_BANK.koshtha_baseline;
  }

  // 3. If finished Koshtha -> move to Prakriti Thermal Tolerance
  if (latestEntry.category === 'koshtha') {
    return AYUSH_QUESTION_BANK.prakriti_thermal;
  }

  // 4. If finished Prakriti Thermal -> move to Nidra (Sleep)
  if (latestEntry.category === 'prakriti') {
    return AYUSH_QUESTION_BANK.nidra_baseline;
  }

  // 5. If finished Nidra:
  if (latestEntry.category === 'nidra') {
    // If disturbed sleep -> ask sleep follow-up
    if (latestEntry.selectedOptionId === 'disturbed_sleep') {
      return AYUSH_QUESTION_BANK.nidra_disturbed_followup;
    }
    // Otherwise move to Ahara & Vihara
    return AYUSH_QUESTION_BANK.ahara_vihara_routine;
  }

  // 6. If finished Nidra follow-up -> move to Ahara & Vihara
  if (latestEntry.category === 'followup_nidra') {
    return AYUSH_QUESTION_BANK.ahara_vihara_routine;
  }

  // 7. If Ahara & Vihara is completed -> we have completed the assessment!
  if (latestEntry.category === 'ahara_vihara') {
    return null; // Completed
  }

  // Safeguard: if 5 questions have been answered, complete
  if (history.length >= 5) {
    return null;
  }

  return null;
}

// Compile responses into strict AYUSHAssessment object without diagnosing
export function compileAyushAssessment(
  history: AyushDialogueEntry[],
  patientDraft?: { name?: string; age?: number; gender?: string; department?: string; chiefComplaint?: string }
): AYUSHAssessment {
  const patientProvided: string[] = [];
  const aiStructured: string[] = [];

  let agniType = 'Sama Agni (Balanced / सम अग्नि)';
  let appetite = 'Normal';
  let postMealComfort = 'Comfortable';

  let koshthaType = 'Madhyama (Regular / मध्यम)';
  let bowelHabits = 'Regular daily evacuation';
  let stoolConsistency = 'Normal formed stool';

  let thermalTolerance = 'Balanced / Moderate Adaptability';
  let dominantDoshaTendency = 'Indeterminate / Balanced (Sama)';

  let sleepQuality = 'Sound & Deep (सुख निद्रा)';
  let wakingFeeling = 'Fresh & Rested';
  let sleepObstacles: string[] = [];

  let dietPattern = 'Balanced / Mixed';
  let physicalActivity = 'Moderate';
  let stressLevel = 'Low / Normal';

  const collectedResponses: Array<{ question: string; answer: string; parameter: string }> = [];

  history.forEach(entry => {
    patientProvided.push(`${entry.questionText}: "${entry.answerText}"`);
    collectedResponses.push({
      question: entry.questionText,
      answer: entry.answerText,
      parameter: entry.parameterTag
    });

    switch (entry.selectedOptionId) {
      // Agni baseline
      case 'sama_agni':
        agniType = 'Sama Agni (Balanced / सम अग्नि)';
        appetite = 'Regular, healthy appetite';
        aiStructured.push('Agni structured as Sama Agni (Balanced digestive metabolic rate)');
        break;
      case 'manda_agni':
        agniType = 'Manda Agni (Sluggish / मंद अग्नि)';
        appetite = 'Poor / Reduced appetite with heaviness';
        aiStructured.push('Agni structured as Manda Agni (Sluggish metabolic fire, Kapha/Ama tendency)');
        break;
      case 'tikshna_agni':
        agniType = 'Tikshna Agni (Sharp / तीक्ष्ण अग्नि)';
        appetite = 'High frequency hunger with burning/acidity';
        aiStructured.push('Agni structured as Tikshna Agni (Hyperactive metabolic fire, Pitta tendency)');
        break;
      case 'visham_agni':
        agniType = 'Visham Agni (Irregular / विषम अग्नि)';
        appetite = 'Erratic hunger, variable digestion';
        aiStructured.push('Agni structured as Visham Agni (Fluctuating metabolic fire, Vata tendency)');
        break;

      // Agni Follow-up: Manda
      case 'post_heaviness':
        postMealComfort = 'Prolonged heaviness & lethargy (गुरुता)';
        aiStructured.push('Symptoms indicate post-prandial heaviness and sluggish gastric emptying');
        break;
      case 'bloating_gas':
        postMealComfort = 'Bloating, distension and gas (आध्मान)';
        aiStructured.push('Symptoms indicate intestinal distension and flatulence');
        break;
      case 'nausea_taste':
        postMealComfort = 'Altered taste and mild nausea (अरोचक)';
        aiStructured.push('Symptoms indicate oral dysgeusia and sluggish taste perception');
        break;

      // Agni Follow-up: Tikshna
      case 'acid_heartburn':
        postMealComfort = 'Retrosternal heartburn and gastric burning';
        aiStructured.push('Reflects Amlapitta (acid hyperacidity) presentation');
        break;
      case 'excessive_thirst':
        postMealComfort = 'Excessive thirst and internal body heat (तृष्णा / दाह)';
        aiStructured.push('Reflects high metabolic heat and increased fluid demand');
        break;
      case 'sour_belch':
        postMealComfort = 'Sour regurgitation and bitter taste';
        aiStructured.push('Reflects acid reflux and delayed gastric neutralization');
        break;

      // Koshtha
      case 'madhyama_koshtha':
        koshthaType = 'Madhyama (Regular / मध्यम)';
        bowelHabits = 'Once daily, unobstructed bowel movement';
        stoolConsistency = 'Formed and soft';
        aiStructured.push('Koshtha structured as Madhyama (Balanced gastrointestinal motility)');
        break;
      case 'krura_koshtha':
        koshthaType = 'Krura (Hard / Constipated / क्रूर)';
        bowelHabits = 'Infrequent, hard pellet stools requiring straining';
        stoolConsistency = 'Dry, hard';
        aiStructured.push('Koshtha structured as Krura (Hypo-motile, Vata predominant bowel tendency)');
        break;
      case 'mridu_koshtha':
        koshthaType = 'Mridu (Soft / Loose / मृदु)';
        bowelHabits = 'Frequent (2-3 times/day) or loose stools easily triggered';
        stoolConsistency = 'Soft, semi-solid or loose';
        aiStructured.push('Koshtha structured as Mridu (Hyper-motile, Pitta predominant bowel tendency)');
        break;
      case 'irregular_koshtha':
        koshthaType = 'Variable / Vishama Koshtha';
        bowelHabits = 'Alternating between constipation and loose stools';
        stoolConsistency = 'Variable with sensation of incomplete evacuation';
        aiStructured.push('Koshtha structured as Vishama (Irregular gut transit)');
        break;

      // Thermal / Prakriti
      case 'sensitive_cold':
        thermalTolerance = 'Sensitive to Cold / Prefers Warmth (शीत असहिष्णुता)';
        dominantDoshaTendency = 'Vata-Kapha constitutional tendency';
        aiStructured.push('Thermal tolerance structured as Vata-Kapha affinity (Cold intolerance)');
        break;
      case 'sensitive_heat':
        thermalTolerance = 'Sensitive to Heat / Prefers Cool (उष्ण असहिष्णुता)';
        dominantDoshaTendency = 'Pitta constitutional tendency';
        aiStructured.push('Thermal tolerance structured as Pitta affinity (Heat intolerance, Ushna)');
        break;
      case 'balanced_thermal':
        thermalTolerance = 'Moderate / Balanced Thermal Adaptability';
        dominantDoshaTendency = 'Sama / Balanced constitutional tendency';
        aiStructured.push('Thermal tolerance structured as Balanced / Sama');
        break;

      // Nidra
      case 'sound_sleep':
        sleepQuality = 'Sound & Deep (सुख निद्रा)';
        wakingFeeling = 'Fresh, energetic and alert';
        aiStructured.push('Nidra structured as Samyak Nidra (Optimal restorative sleep)');
        break;
      case 'disturbed_sleep':
        sleepQuality = 'Disturbed / Frequent Waking (खंडित निद्रा)';
        wakingFeeling = 'Unrefreshed, fatigued morning';
        aiStructured.push('Nidra structured as Asamyak / Khandita Nidra (Interrupted sleep pattern)');
        break;
      case 'excessive_heavy':
        sleepQuality = 'Heavy / Excessive Sleep (अतिनिद्रा / तंद्रा)';
        wakingFeeling = 'Stiff, sluggish and heavy awakening';
        aiStructured.push('Nidra structured as Kapha-predominant heavy awakening');
        break;

      // Nidra Follow-up
      case 'mental_stress':
        stressLevel = 'High / Mental Worry & Overthinking';
        sleepObstacles.push('Bedtime anxiety / racing thoughts');
        aiStructured.push('Lifestyle structured with Manasika Chinta (psychological overthinking)');
        break;
      case 'physical_pain':
        sleepObstacles.push('Physical ache / nocturia interrupting sleep');
        aiStructured.push('Sleep disturbances secondary to musculoskeletal or somatic pain');
        break;
      case 'screen_late_hours':
        sleepObstacles.push('Late night screen use (Ratri Jagarana)');
        aiStructured.push('Habitual late night awakening violating Dincharya');
        break;

      // Ahara & Vihara
      case 'sattvic_moderate':
        dietPattern = 'Sattvic / Fresh Home Cooked Food';
        physicalActivity = 'Moderate walking and regular mobility';
        aiStructured.push('Ahara/Vihara conforms to wholesome Dincharya recommendations');
        break;
      case 'spicy_irregular':
        dietPattern = 'Spicy / Pungent, late dinners, high tea/coffee';
        aiStructured.push('Ahara exhibits Vidahi/Katu (irritant/acidic) dietary influences');
        break;
      case 'sedentary_sitting':
        physicalActivity = 'Sedentary / Desk work with minimal physical exertion';
        aiStructured.push('Vihara exhibits Alpa-Vyayama (sedentary lifestyle risk factor)');
        break;
      case 'active_travel':
        physicalActivity = 'Strenuous / Field work with high physical expenditure';
        aiStructured.push('Vihara exhibits Ati-Vyayama or physical exertion');
        break;

      default:
        break;
    }
  });

  // Calculate Vikriti (imbalance indications) based strictly on patient complaints + answers
  const suspectedImbalance: string[] = [];
  if (agniType.includes('Manda') || postMealComfort.includes('Heavy') || postMealComfort.includes('Bloat')) {
    suspectedImbalance.push('Kapha-Ama (Digestive sluggishness / metabolic heaviness)');
  }
  if (agniType.includes('Tikshna') || postMealComfort.includes('Burning') || thermalTolerance.includes('Heat')) {
    suspectedImbalance.push('Pitta (Metabolic heat & acidic tendency)');
  }
  if (koshthaType.includes('Krura') || sleepQuality.includes('Disturbed') || agniType.includes('Visham') || thermalTolerance.includes('Cold')) {
    suspectedImbalance.push('Vata (Dryness, erratic motility & nervous agitation)');
  }
  if (suspectedImbalance.length === 0) {
    suspectedImbalance.push('Mild / Non-specific constitutional variation');
  }

  return {
    prakriti: {
      dominantDoshaTendency,
      thermalTolerance,
      physicalTraits: [
        `Thermal Reaction: ${thermalTolerance}`,
        `Metabolic Temperament: ${agniType.split('(')[0].trim()}`
      ],
      summary: `Patient reports ${thermalTolerance.toLowerCase()} with ${agniType.toLowerCase()} metabolic characteristics.`
    },
    vikriti: {
      imbalanceSuspected: suspectedImbalance,
      aggravatingFactors: [
        `Bowel Motility: ${koshthaType}`,
        `Sleep Quality: ${sleepQuality}`
      ],
      dominantImbalanceSite: 'Gastrointestinal & Systemic Constitutional State'
    },
    agni: {
      agniType: agniType as any,
      appetite,
      postMealComfort,
      notes: `Patient reports: ${appetite}. Post-prandial state: ${postMealComfort}.`
    },
    koshtha: {
      koshthaType: koshthaType as any,
      bowelHabits,
      stoolConsistency,
      notes: `Reported bowel pattern: ${bowelHabits}.`
    },
    ahara: {
      dietaryPattern: dietPattern,
      mealTimings: 'Reported in intake',
      tastePreferences: dietPattern.includes('Spicy') ? ['Katu (Pungent)', 'Lavana (Salty)'] : ['Madhura (Sweet)', 'Balanced'],
      notes: `Dietary baseline: ${dietPattern}.`
    },
    vihara: {
      dailyRoutine: sleepObstacles.includes('Late night screen use (Ratri Jagarana)') ? 'Irregular / Late night hours' : 'Regular Dincharya',
      physicalActivity,
      daytimeSleep: 'Not habitually reported',
      notes: `Physical exertion level: ${physicalActivity}.`
    },
    nidra: {
      quality: sleepQuality,
      durationHours: '6 - 7 hours',
      wakingFeeling,
      sleepObstacles,
      notes: `Sleep status: ${sleepQuality}. Waking status: ${wakingFeeling}.`
    },
    lifestyle: {
      stressLevel,
      occupationNature: physicalActivity.includes('Sedentary') ? 'Desk-bound / Sedentary' : 'Field / Active',
      seasonalReaction: thermalTolerance,
      notes: `Stress level: ${stressLevel}.`
    },
    additionalParameters: {
      dashavidhaSummary: 'Structured constitutional intake parameters (Prakriti, Vikriti, Agni, Koshtha, Nidra, Ahara, Vihara, Sattva).',
      balaStamina: physicalActivity.includes('Sedentary') ? 'Madhyama (Medium)' : 'Pravara (Good)',
      patientProvidedResponses: collectedResponses,
      disclaimer: 'AI-Structured Constitutional Intake. Does NOT constitute a medical diagnosis. Requires clinical Nadi Pariksha and validation by attending Vaidya.'
    },
    provenance: {
      patientProvided,
      aiStructured,
      doctorVerificationStatus: 'PENDING_DOCTOR_VERIFICATION'
    }
  };
}
