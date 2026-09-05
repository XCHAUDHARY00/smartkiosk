import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AYUSH_QUESTION_BANK,
  getNextAyushQuestion,
  compileAyushAssessment,
  AyushDialogueEntry
} from '../ayushAssessmentService.js';
import { Department } from '../../types.js';

describe('AYUSH & Ayurveda Clinical Assessment Workflow', () => {
  it('1. Begins with Agni baseline question when history is empty', () => {
    const firstQ = getNextAyushQuestion([]);
    assert.ok(firstQ, 'First question should not be null');
    assert.strictEqual(firstQ.id, 'agni_baseline');
    assert.strictEqual(firstQ.category, 'agni');
    assert.ok(firstQ.questionEnglish.includes('Agni'));
    assert.strictEqual(firstQ.options.length, 4);
  });

  it('2. Dynamically adapts when patient reports Manda Agni (Sluggish appetite)', () => {
    const history: AyushDialogueEntry[] = [
      {
        questionNumber: 1,
        category: 'agni',
        questionText: AYUSH_QUESTION_BANK.agni_baseline.questionEnglish,
        questionEnglish: AYUSH_QUESTION_BANK.agni_baseline.questionEnglish,
        selectedOptionId: 'manda_agni',
        answerText: 'Low Appetite / Sluggish (Manda Agni)',
        timestamp: new Date().toISOString(),
        parameterTag: 'agni.agniType'
      }
    ];

    const nextQ = getNextAyushQuestion(history);
    assert.ok(nextQ, 'Adaptive follow-up question expected');
    assert.strictEqual(nextQ.id, 'manda_agni_followup');
    assert.strictEqual(nextQ.category, 'followup_agni');
    assert.ok(nextQ.questionEnglish.includes('specific discomfort do you notice'));
  });

  it('3. Dynamically adapts when patient reports Tikshna Agni (Sharp / Acidity)', () => {
    const history: AyushDialogueEntry[] = [
      {
        questionNumber: 1,
        category: 'agni',
        questionText: AYUSH_QUESTION_BANK.agni_baseline.questionEnglish,
        questionEnglish: AYUSH_QUESTION_BANK.agni_baseline.questionEnglish,
        selectedOptionId: 'tikshna_agni',
        answerText: 'Sharp Hunger / Acidity (Tikshna Agni)',
        timestamp: new Date().toISOString(),
        parameterTag: 'agni.agniType'
      }
    ];

    const nextQ = getNextAyushQuestion(history);
    assert.ok(nextQ, 'Adaptive follow-up question expected for Tikshna Agni');
    assert.strictEqual(nextQ.id, 'tikshna_agni_followup');
    assert.strictEqual(nextQ.category, 'followup_agni');
    assert.ok(nextQ.questionEnglish.includes('burning in chest/throat'));
  });

  it('4. Navigates directly from Sama Agni to Koshtha baseline', () => {
    const history: AyushDialogueEntry[] = [
      {
        questionNumber: 1,
        category: 'agni',
        questionText: AYUSH_QUESTION_BANK.agni_baseline.questionEnglish,
        questionEnglish: AYUSH_QUESTION_BANK.agni_baseline.questionEnglish,
        selectedOptionId: 'sama_agni',
        answerText: 'Normal Appetite & Digestion (Sama Agni)',
        timestamp: new Date().toISOString(),
        parameterTag: 'agni.agniType'
      }
    ];

    const nextQ = getNextAyushQuestion(history);
    assert.ok(nextQ, 'Koshtha question expected directly after balanced Agni');
    assert.strictEqual(nextQ.id, 'koshtha_baseline');
    assert.strictEqual(nextQ.category, 'koshtha');
  });

  it('5. Transitions through complete Dashavidha questionnaire and terminates gracefully', () => {
    const completeHistory: AyushDialogueEntry[] = [
      // 1. Agni
      {
        questionNumber: 1,
        category: 'agni',
        questionText: 'Agni Baseline',
        questionEnglish: 'Agni Baseline',
        selectedOptionId: 'sama_agni',
        answerText: 'Normal Appetite & Digestion (Sama Agni)',
        timestamp: new Date().toISOString(),
        parameterTag: 'agni.agniType'
      },
      // 2. Koshtha
      {
        questionNumber: 2,
        category: 'koshtha',
        questionText: 'Koshtha Baseline',
        questionEnglish: 'Koshtha Baseline',
        selectedOptionId: 'krura_koshtha',
        answerText: 'Constipated / Hard Stools (Krura Koshtha)',
        timestamp: new Date().toISOString(),
        parameterTag: 'koshtha.koshthaType'
      },
      // 3. Prakriti Thermal
      {
        questionNumber: 3,
        category: 'prakriti',
        questionText: 'Thermal Tolerance',
        questionEnglish: 'Thermal Tolerance',
        selectedOptionId: 'sensitive_cold',
        answerText: 'Sensitive to Cold / Prefers Warmth',
        timestamp: new Date().toISOString(),
        parameterTag: 'prakriti.thermalTolerance'
      },
      // 4. Nidra
      {
        questionNumber: 4,
        category: 'nidra',
        questionText: 'Nidra Baseline',
        questionEnglish: 'Nidra Baseline',
        selectedOptionId: 'disturbed_sleep',
        answerText: 'Disturbed / Frequent Waking',
        timestamp: new Date().toISOString(),
        parameterTag: 'nidra.quality'
      },
      // 5. Nidra Follow-up
      {
        questionNumber: 5,
        category: 'followup_nidra',
        questionText: 'Nidra Cause',
        questionEnglish: 'Nidra Cause',
        selectedOptionId: 'mental_stress',
        answerText: 'Mental Stress, Overthinking & Anxiety',
        timestamp: new Date().toISOString(),
        parameterTag: 'lifestyle.stressLevel'
      },
      // 6. Ahara & Vihara
      {
        questionNumber: 6,
        category: 'ahara_vihara',
        questionText: 'Ahara & Vihara Routine',
        questionEnglish: 'Ahara & Vihara Routine',
        selectedOptionId: 'spicy_irregular',
        answerText: 'Spicy/Fried Foods, Outside Meals, Irregular Times',
        timestamp: new Date().toISOString(),
        parameterTag: 'ahara.dietaryPattern'
      }
    ];

    const finalNext = getNextAyushQuestion(completeHistory);
    assert.strictEqual(finalNext, null, 'Should return null when dialogue sequence is finished');
  });

  it('6. Compiles clinical AYUSH assessment with non-final disclaimer and strict provenance', () => {
    const history: AyushDialogueEntry[] = [
      {
        questionNumber: 1,
        category: 'agni',
        questionText: 'Appetite',
        questionEnglish: 'Appetite',
        selectedOptionId: 'tikshna_agni',
        answerText: 'Sharp Hunger / Acidity (Tikshna Agni)',
        timestamp: new Date().toISOString(),
        parameterTag: 'agni.agniType'
      },
      {
        questionNumber: 2,
        category: 'followup_agni',
        questionText: 'Agni Discomfort',
        questionEnglish: 'Agni Discomfort',
        selectedOptionId: 'acid_heartburn',
        answerText: 'Heartburn & Retro-sternal Burning',
        timestamp: new Date().toISOString(),
        parameterTag: 'agni.postMealComfort'
      },
      {
        questionNumber: 3,
        category: 'koshtha',
        questionText: 'Bowel Habits',
        questionEnglish: 'Bowel Habits',
        selectedOptionId: 'mridu_koshtha',
        answerText: 'Frequent / Loose Stools (Mridu Koshtha)',
        timestamp: new Date().toISOString(),
        parameterTag: 'koshtha.koshthaType'
      },
      {
        questionNumber: 4,
        category: 'prakriti',
        questionText: 'Thermal Sensitivity',
        questionEnglish: 'Thermal Sensitivity',
        selectedOptionId: 'sensitive_heat',
        answerText: 'Sensitive to Heat / Prefers Cool',
        timestamp: new Date().toISOString(),
        parameterTag: 'prakriti.thermalTolerance'
      },
      {
        questionNumber: 5,
        category: 'nidra',
        questionText: 'Sleep Quality',
        questionEnglish: 'Sleep Quality',
        selectedOptionId: 'sound_sleep',
        answerText: 'Deep Sound Sleep & Energetic Waking',
        timestamp: new Date().toISOString(),
        parameterTag: 'nidra.quality'
      },
      {
        questionNumber: 6,
        category: 'ahara_vihara',
        questionText: 'Dietary Routine',
        questionEnglish: 'Dietary Routine',
        selectedOptionId: 'spicy_irregular',
        answerText: 'Spicy/Fried Foods, Outside Meals, Irregular Times',
        timestamp: new Date().toISOString(),
        parameterTag: 'ahara.dietaryPattern'
      }
    ];

    const assessment = compileAyushAssessment(history, {
      name: 'Ramesh Kumar',
      age: 44,
      gender: 'Male',
      department: 'Ayurveda & AYUSH OPD',
      chiefComplaint: 'Chronic acidity and burning sensation'
    });

    // Verify structured parameters
    assert.ok(assessment.agni, 'Agni must be defined');
    assert.ok(assessment.koshtha, 'Koshtha must be defined');
    assert.ok(assessment.prakriti, 'Prakriti must be defined');
    assert.ok(assessment.nidra, 'Nidra must be defined');
    assert.ok(assessment.vikriti, 'Vikriti must be defined');
    assert.ok(assessment.additionalParameters, 'Additional parameters must be defined');
    assert.ok(assessment.provenance, 'Provenance must be defined');

    assert.strictEqual(assessment.agni.agniType, 'Tikshna Agni (Sharp / तीक्ष्ण अग्नि)');
    assert.strictEqual(assessment.koshtha.koshthaType, 'Mridu (Soft / Loose / मृदु)');
    assert.ok(assessment.prakriti.thermalTolerance?.includes('Heat'));
    assert.ok(assessment.prakriti.dominantDoshaTendency?.includes('Pitta'));
    assert.strictEqual(assessment.nidra.quality, 'Sound & Deep (सुख निद्रा)');

    // Verify Vikriti calculation accurately detected Pitta aggravation
    assert.ok(
      assessment.vikriti.imbalanceSuspected?.some(imbalance => imbalance.includes('Pitta')),
      'Should detect Pitta imbalance for Tikshna Agni + Heat sensitivity'
    );

    // Verify Safety Disclaimer: NOT A FINAL DIAGNOSIS
    assert.ok(assessment.additionalParameters.disclaimer?.includes('Does NOT constitute a medical diagnosis'));
    assert.ok(assessment.additionalParameters.disclaimer?.includes('attending Vaidya'));

    // Verify Provenance
    assert.strictEqual(assessment.provenance.doctorVerificationStatus, 'PENDING_DOCTOR_VERIFICATION');
    assert.ok(assessment.provenance.patientProvided?.length > 0);
    assert.ok(assessment.provenance.aiStructured?.length > 0);
  });

  it('7. Department Gating: Non-AYUSH departments (General Medicine, Cardiology, etc.) omit AYUSH assessment', () => {
    const generalMedicineDept: Department = {
      id: 'general_medicine',
      code: 'GEN',
      name: 'General Medicine',
      hindiName: 'सामान्य चिकित्सा',
      category: 'General',
      estimatedWaitMinutes: 15,
      currentQueueCount: 4,
      floor: 'Ground Floor',
      roomNumber: '102',
      status: 'AVAILABLE'
    };

    const isAyushGeneral =
      generalMedicineDept.category === 'AYUSH' ||
      generalMedicineDept.id === 'ayurveda' ||
      generalMedicineDept.name.toLowerCase().includes('ayush') ||
      generalMedicineDept.name.toLowerCase().includes('ayurveda');

    assert.strictEqual(isAyushGeneral, false, 'General Medicine must NOT be classified as AYUSH');

    const ayurvedaDept: Department = {
      id: 'ayurveda',
      code: 'AYU',
      name: 'Ayurveda & Panchakarma',
      hindiName: 'आयुर्वेद एवं पंचकर्म',
      category: 'AYUSH',
      estimatedWaitMinutes: 10,
      currentQueueCount: 2,
      floor: '1st Floor',
      roomNumber: '204',
      status: 'AVAILABLE'
    };

    const isAyushAyurveda =
      ayurvedaDept.category === 'AYUSH' ||
      ayurvedaDept.id === 'ayurveda' ||
      ayurvedaDept.name.toLowerCase().includes('ayush') ||
      ayurvedaDept.name.toLowerCase().includes('ayurveda');

    assert.strictEqual(isAyushAyurveda, true, 'Ayurveda department must be classified as AYUSH');
  });
});
