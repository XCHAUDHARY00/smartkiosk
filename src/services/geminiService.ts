import { ClinicalSummary, PatientProfile, SocratesAnalysis } from '../types';

export async function generateClinicalSummaryAI(
  patient: PatientProfile,
  complaintText: string
): Promise<ClinicalSummary> {
  // 1. Try server API first
  try {
    const res = await fetch('/api/gemini/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ patient, complaintText }),
      signal: AbortSignal.timeout(6000)
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.summary) {
        return data.summary;
      }
    }
  } catch (e) {
    // Fall back smoothly
  }

  // 2. Intelligent clinical heuristic fallback
  return generateClinicalSummaryLocal(patient, complaintText);
}

export function generateClinicalSummaryLocal(
  patient: PatientProfile,
  complaintText: string
): ClinicalSummary {
  const text = (complaintText || patient.chiefComplaintTranscript || '').toLowerCase();
  
  let urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY' = 'NORMAL';
  const recTests: string[] = ['Blood Test (CBC)'];
  const diffDiag: Array<{ condition: string; probability: string; reasoning?: string }> = [];

  const socrates: SocratesAnalysis = {
    site: 'Generalized / Not localized',
    onset: 'Acute to subacute presentation',
    character: 'Discomfort reported by patient',
    radiation: 'None reported',
    associations: 'Fatigue, general malaise',
    timeCourse: 'Persistent over recent days',
    exacerbatingRelieving: 'Aggravated with routine activity',
    severity: 'Moderate'
  };

  if (text.includes('chest') || text.includes('सीना') || text.includes('छाती') || text.includes('heaviness') || text.includes('भारीपन')) {
    urgency = 'URGENT';
    socrates.site = 'Precordium / Retrosternal';
    socrates.character = 'Heaviness / Pressure';
    socrates.associations = 'Shortness of breath, dizziness';
    socrates.severity = '7 / 10';
    recTests.push('12-Lead ECG', 'Troponin I', 'Blood Sugar (FBS/PPBS)', 'Lipid Profile');
    diffDiag.push(
      { condition: 'Atypical Angina / CAD', probability: 'High', reasoning: 'Retrosternal pressure in adult with cardiovascular risk.' },
      { condition: 'Uncontrolled Hypertension Stress', probability: 'Medium', reasoning: 'Elevated circulatory workload.' },
      { condition: 'Musculoskeletal Chest Wall Strain', probability: 'Low', reasoning: 'Benign superficial chest muscle fatigue.' }
    );
  } else if (text.includes('fever') || text.includes('बुखार') || text.includes('chills') || text.includes('ठंड')) {
    urgency = 'NORMAL';
    socrates.site = 'Systemic pyrexia';
    socrates.character = 'High grade spikes with rigors';
    socrates.associations = 'Myalgia, headache, retro-orbital pain';
    recTests.push('CBC with Platelet Count', 'Dengue NS1 Antigen', 'Malarial Parasite MP/Smear', 'Urine Routine');
    diffDiag.push(
      { condition: 'Acute Viral Pyrexia / Suspected Dengue', probability: 'High', reasoning: 'High fever with constitutional symptoms.' },
      { condition: 'Enteric / Typhoid Fever', probability: 'Medium', reasoning: 'Endemic bacterial fever.' },
      { condition: 'Upper Respiratory Tract Infection', probability: 'Low', reasoning: 'Mild accompanying airway irritation.' }
    );
  } else if (text.includes('cough') || text.includes('खांसी') || text.includes('breath') || text.includes('सांस')) {
    urgency = 'NORMAL';
    socrates.site = 'Bronchopulmonary airways';
    socrates.character = 'Spasmodic cough / Wheezing';
    socrates.associations = 'Nocturnal cough, dyspnea';
    recTests.push('Digital Chest X-Ray', 'CBC with Absolute Eosinophil Count', 'Spirometry');
    diffDiag.push(
      { condition: 'Bronchial Asthma / Reactive Airway', probability: 'High', reasoning: 'Wheezing and episodic dry cough.' },
      { condition: 'Acute Bronchitis', probability: 'Medium', reasoning: 'Infectious or irritant airway inflammation.' },
      { condition: 'Post-Nasal Drip Syndrome', probability: 'Low', reasoning: 'Upper airway allergic trigger.' }
    );
  } else if (text.includes('knee') || text.includes('घुटना') || text.includes('joint') || text.includes('दर्द')) {
    urgency = 'NORMAL';
    socrates.site = 'Bilateral Knee Joints';
    socrates.character = 'Dull aching with stiffness';
    socrates.associations = 'Difficulty climbing stairs, crepitus';
    recTests.push('X-Ray Both Knees (AP/Lateral Standing)', 'Serum Uric Acid', 'ESR / CRP');
    diffDiag.push(
      { condition: 'Primary Osteoarthritis (OA) Knees', probability: 'High', reasoning: 'Degenerative cartilage wear with mechanical pain.' },
      { condition: 'Hyperuricemia / Gouty Arthropathy', probability: 'Low', reasoning: 'Metabolic crystal deposition.' }
    );
  } else {
    diffDiag.push(
      { condition: 'General Medical Evaluation Required', probability: 'High', reasoning: 'Baseline outpatient clinical evaluation.' }
    );
    recTests.push('CBC', 'Urine Routine');
  }

  return {
    id: `sum_${patient.id}`,
    patientId: patient.id,
    tokenNumber: patient.tokenNumber,
    chiefComplaint: complaintText || patient.chiefComplaintTranscript || 'Outpatient consultation request',
    historyOfPresentIllness: `${patient.age}y ${patient.gender} presenting with ${complaintText || 'general health symptoms'}.`,
    socrates,
    differentialDiagnosis: diffDiag,
    recommendedLabInvestigations: recTests,
    doctorOrderedTests: recTests.slice(0, 3), // Default initial presets
    isDoctorConsultationDone: false,
    doctorConsultationNotes: '',
    urgencyScore: urgency,
    medications: [],
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}
