import { PatientProfile, ClinicalSummary, UploadedDocument, TriageAlert, PatientFeedback, QuestionAnswer, PastVisit } from '../types';
import { SAMPLE_PAST_VISITS } from '../data/mockData';

export async function fetchPatientsFromDB(): Promise<PatientProfile[]> {
  try {
    const res = await fetch('/api/patients');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error fetching patients from DB:', err);
  }
  return [];
}

export async function createPatientInDB(patient: Partial<PatientProfile>): Promise<PatientProfile> {
  const res = await fetch('/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patient)
  });
  if (!res.ok) throw new Error('Failed to create patient in DB');
  return await res.json();
}

export async function updatePatientInDB(id: string, updates: Partial<PatientProfile>): Promise<PatientProfile> {
  const res = await fetch(`/api/patients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update patient in DB');
  return await res.json();
}

export async function lookupPatientFromDB(query: string): Promise<{
  patient: PatientProfile;
  history: PastVisit[];
  documents: UploadedDocument[];
} | null> {
  if (!query || !query.trim()) return null;
  try {
    const res = await fetch(`/api/patients/lookup?q=${encodeURIComponent(query.trim())}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error looking up patient from DB:', err);
  }
  return null;
}

export async function deletePatientFromDB(id: string): Promise<boolean> {
  const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function fetchAnswersFromDB(patientId: string): Promise<QuestionAnswer[]> {
  try {
    const res = await fetch(`/api/patients/${patientId}/answers`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error fetching answers from DB:', err);
  }
  return [];
}

export async function saveAnswerToDB(patientId: string, answer: QuestionAnswer): Promise<QuestionAnswer> {
  const res = await fetch(`/api/patients/${patientId}/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answer)
  });
  if (!res.ok) throw new Error('Failed to save answer to DB');
  return await res.json();
}

export async function fetchDocumentsFromDB(patientId: string): Promise<UploadedDocument[]> {
  try {
    const res = await fetch(`/api/documents/${patientId}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error fetching documents from DB:', err);
  }
  return [];
}

export async function saveDocumentToDB(doc: Partial<UploadedDocument>): Promise<UploadedDocument> {
  const res = await fetch('/api/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc)
  });
  if (!res.ok) throw new Error('Failed to save document to DB');
  return await res.json();
}

export async function deleteDocumentFromDB(id: string): Promise<boolean> {
  const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function fetchSummaryFromDB(patientId: string): Promise<ClinicalSummary | null> {
  try {
    const res = await fetch(`/api/summaries/${patientId}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.error('Error fetching summary from DB:', err);
  }
  return null;
}

export async function saveSummaryToDB(summary: ClinicalSummary): Promise<ClinicalSummary> {
  const res = await fetch('/api/summaries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(summary)
  });
  if (!res.ok) throw new Error('Failed to save summary to DB');
  return await res.json();
}

export async function fetchAlertsFromDB(): Promise<TriageAlert[]> {
  try {
    const res = await fetch('/api/alerts');
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error fetching alerts from DB:', err);
  }
  return [];
}

export async function createAlertInDB(alert: Partial<TriageAlert>): Promise<TriageAlert> {
  const res = await fetch('/api/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alert)
  });
  if (!res.ok) throw new Error('Failed to create alert in DB');
  return await res.json();
}

export async function updateAlertStatusInDB(id: string, status: 'active' | 'acknowledged' | 'triaged'): Promise<TriageAlert> {
  const res = await fetch(`/api/alerts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update alert in DB');
  return await res.json();
}

export async function fetchFeedbacksFromDB(): Promise<PatientFeedback[]> {
  try {
    const res = await fetch('/api/feedbacks');
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error fetching feedbacks from DB:', err);
  }
  return [];
}

export async function saveFeedbackToDB(feedback: Partial<PatientFeedback>): Promise<PatientFeedback> {
  const res = await fetch('/api/feedbacks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedback)
  });
  if (!res.ok) throw new Error('Failed to save feedback to DB');
  return await res.json();
}

export async function saveConsultationToDB(consultation: {
  patientId: string;
  tokenNumber: string;
  doctorNotes: string;
  prescriptions: string[];
  doctorName?: string;
  roomNumber?: string;
  department?: string;
  diagnoses?: string[];
  diagnosisType?: string;
  keyDiagnosisHighlights?: string[];
  vitals?: any;
  labInvestigations?: string[];
  followUpPlan?: string;
  mobile?: string;
  patientName?: string;
  oldProblem?: string;
  chiefComplaint?: string;
}) {
  const res = await fetch('/api/consultations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(consultation)
  });
  if (!res.ok) throw new Error('Failed to save consultation to DB');
  return await res.json();
}

export interface PatientHistoryByPhoneResponse {
  phone: string;
  hasHistory: boolean;
  recordsCount: number;
  latestVisit: PastVisit | null;
  history: PastVisit[];
  pastPrescriptions: UploadedDocument[];
  message: string;
}

export async function fetchPatientHistoryByPhone(phone: string): Promise<PatientHistoryByPhoneResponse> {
  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length < 7) {
    return {
      phone: cleanPhone,
      hasHistory: false,
      recordsCount: 0,
      latestVisit: null,
      history: [],
      pastPrescriptions: [],
      message: 'Past medicine record not available'
    };
  }

  try {
    const res = await fetch(`/api/history-by-phone?phone=${encodeURIComponent(cleanPhone)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.hasHistory === 'boolean') {
        return data;
      }
    }
  } catch (err) {
    console.error('Error fetching patient history by phone from server:', err);
  }

  // Fallback to sample data for offline / preview
  const fallbackRecords: PastVisit[] = [];
  for (const pid of Object.keys(SAMPLE_PAST_VISITS)) {
    for (const v of SAMPLE_PAST_VISITS[pid]) {
      const vPhone = (v.mobile || '').replace(/\D/g, '').slice(-10);
      if (vPhone === cleanPhone || (cleanPhone === '9876543210' && pid === 'p_101') || (cleanPhone === '9123456789' && pid === 'p_102')) {
        fallbackRecords.push({ ...v, mobile: cleanPhone });
      }
    }
  }

  const hasHist = fallbackRecords.length > 0;
  return {
    phone: cleanPhone,
    hasHistory: hasHist,
    recordsCount: fallbackRecords.length,
    latestVisit: fallbackRecords[0] || null,
    history: fallbackRecords,
    pastPrescriptions: [],
    message: hasHist ? 'Previous patient records located' : 'Past medicine record not available'
  };
}

export async function fetchPatientHistoryFromDB(patientId: string): Promise<PastVisit[]> {
  try {
    const res = await fetch(`/api/patients/${patientId}/history`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.error('Error fetching patient history from DB:', err);
  }
  // Fallback to sample data for seamless preview
  return SAMPLE_PAST_VISITS[patientId] || [];
}

export async function savePatientPastVisitToDB(pastVisit: Partial<PastVisit>): Promise<PastVisit> {
  const patientId = pastVisit.patientId || 'p_101';
  const res = await fetch(`/api/patients/${patientId}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pastVisit)
  });
  if (!res.ok) throw new Error('Failed to save past visit to DB');
  return await res.json();
}

export async function resetDatabase(): Promise<boolean> {
  const res = await fetch('/api/db/reset', { method: 'POST' });
  return res.ok;
}

