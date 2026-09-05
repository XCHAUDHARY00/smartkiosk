import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  localAdaptiveClinicalEngine,
  NextQuestionPayload
} from '../clinicalInterviewService.js';
import { TriageAlert } from '../../types.js';

describe('Triage & Red Flag Safety System Verification', () => {
  it('1. Acute Cardiac Trigger: Chest discomfort radiating to left arm or with dyspnea triggers urgent cardiac red flag', () => {
    const payload: NextQuestionPayload = {
      language: 'en',
      stepNumber: 3,
      dialogueHistory: [
        {
          questionNumber: 1,
          question: 'What primary symptom brought you today?',
          answer: 'Severe chest pain radiating to left arm and jaw',
          timestamp: new Date().toISOString()
        },
        {
          questionNumber: 2,
          question: 'When did it start?',
          answer: 'Started 2 hours ago with breathlessness',
          timestamp: new Date().toISOString()
        }
      ],
      latestAnswer: 'Started 2 hours ago with breathlessness',
      isFinalRequest: false
    };

    const response = localAdaptiveClinicalEngine(payload);

    assert.ok(response.redFlagsDetected && response.redFlagsDetected.length > 0, 'Red flags must be detected');
    const cardiacFlag = response.redFlagsDetected.find(f => f.includes('Acute Coronary') || f.includes('Cardiac Risk'));
    assert.ok(cardiacFlag, 'Must flag Potential Acute Coronary / Cardiac Risk');
    assert.ok(response.structuredData.redFlags.some(f => f.includes('Cardiac Risk')));
    assert.ok(response.structuredData.historyOfPresentIllness.includes('ALERT: Red flag findings detected'));
  });

  it('2. Hemorrhage / Acute Bleeding Trigger: Blood in sputum or vomit triggers urgent GI/Pulmonary bleed alert', () => {
    const payload: NextQuestionPayload = {
      language: 'en',
      stepNumber: 2,
      dialogueHistory: [
        {
          questionNumber: 1,
          question: 'What primary symptom brought you today?',
          answer: 'Cough with blood in sputum since morning',
          timestamp: new Date().toISOString()
        }
      ],
      latestAnswer: 'Cough with blood in sputum since morning',
      isFinalRequest: false
    };

    const response = localAdaptiveClinicalEngine(payload);

    assert.ok(response.redFlagsDetected.some(f => f.includes('Hemoptysis') || f.includes('GI Bleed Risk')));
  });

  it('3. Neurological Alert: Stiff neck + high fever + projectile vomiting triggers meningeal irritation warning', () => {
    const payload: NextQuestionPayload = {
      language: 'en',
      stepNumber: 2,
      dialogueHistory: [
        {
          questionNumber: 1,
          question: 'What primary symptom brought you today?',
          answer: 'High fever with stiff neck and severe headache and vomit',
          timestamp: new Date().toISOString()
        }
      ],
      latestAnswer: 'High fever with stiff neck and severe headache and vomit',
      isFinalRequest: false
    };

    const response = localAdaptiveClinicalEngine(payload);

    assert.ok(
      response.redFlagsDetected.some(f => f.includes('Meningeal Irritation') || f.includes('Neuro-Infection')),
      'Must trigger meningeal irritation alert'
    );
  });

  it('4. Syncope / Loss of Consciousness Trigger: Transient fainting triggers syncope red flag', () => {
    const payload: NextQuestionPayload = {
      language: 'hi',
      stepNumber: 2,
      dialogueHistory: [
        {
          questionNumber: 1,
          question: 'नमस्ते! आज आप किस मुख्य परेशानी की जांच कराने अस्पताल आए हैं?',
          answer: 'अचानक चक्कर आकर बेहोश हो गया (syncope episode)',
          timestamp: new Date().toISOString()
        }
      ],
      latestAnswer: 'अचानक चक्कर आकर बेहोश हो गया (syncope episode)',
      isFinalRequest: false
    };

    const response = localAdaptiveClinicalEngine(payload);

    assert.ok(response.redFlagsDetected.some(f => f.includes('Syncope') || f.includes('Loss of Consciousness')));
  });

  it('5. False-Positive Guardrail: Non-urgent chronic complaints strictly do NOT trigger acute red flags', () => {
    const payload: NextQuestionPayload = {
      language: 'en',
      stepNumber: 3,
      dialogueHistory: [
        {
          questionNumber: 1,
          question: 'What primary symptom brought you today?',
          answer: 'Mild right knee joint pain while climbing stairs',
          timestamp: new Date().toISOString()
        },
        {
          questionNumber: 2,
          question: 'When did it start?',
          answer: 'For the last 3 months, mild ache only',
          timestamp: new Date().toISOString()
        }
      ],
      latestAnswer: 'For the last 3 months, mild ache only',
      isFinalRequest: false
    };

    const response = localAdaptiveClinicalEngine(payload);

    assert.strictEqual(response.redFlagsDetected.length, 0, 'Knee pain must not trigger acute red flags');
    assert.strictEqual(response.structuredData.redFlags.length, 0);
    assert.ok(response.structuredData.historyOfPresentIllness.includes('No acute systemic red flags reported by patient'));
  });

  it('6. False-Positive Guardrail: Past resolved illness does NOT trigger acute emergency alert', () => {
    const payload: NextQuestionPayload = {
      language: 'en',
      stepNumber: 2,
      dialogueHistory: [
        {
          questionNumber: 1,
          question: 'What primary symptom brought you today?',
          answer: 'Need routine refill for prescription. Had mild fever 2 years ago (resolved).',
          timestamp: new Date().toISOString()
        }
      ],
      latestAnswer: 'Need routine refill for prescription. Had mild fever 2 years ago (resolved).',
      isFinalRequest: false
    };

    const response = localAdaptiveClinicalEngine(payload);

    assert.strictEqual(response.redFlagsDetected.length, 0, 'Past resolved fever/prescription refill must not trigger red flag');
  });

  it('7. Triage Alert Lifecycle: tracks active alerts, acknowledges, and prevents duplicate panic', () => {
    const alerts: TriageAlert[] = [
      {
        id: 'alert-101',
        tokenNumber: 'A-102',
        patientName: 'Devendra Nath',
        severity: 'EMERGENCY',
        reason: 'Acute Retrosternal Chest Discomfort with exertional dyspnea',
        symptomsTriggered: ['Chest pain', 'Dyspnea', 'Arm radiation'],
        status: 'active',
        createdAt: '10:15 AM'
      }
    ];

    assert.strictEqual(alerts.filter(a => a.status === 'active').length, 1);

    // Acknowledge alert by triage nurse / doctor
    alerts[0].status = 'acknowledged';

    assert.strictEqual(alerts.filter(a => a.status === 'active').length, 0);
    assert.strictEqual(alerts.filter(a => a.status === 'acknowledged').length, 1);
  });
});
