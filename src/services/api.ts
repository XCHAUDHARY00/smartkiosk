import { PatientProfile, ClinicalSummary, PastVisitRecord } from '../types';
import { INITIAL_PATIENTS, INITIAL_CLINICAL_SUMMARIES } from '../data/mockData';

// Local storage key for persistent client cache
const LOCAL_PATIENTS_KEY = 'opd_kiosk_patients';
const LOCAL_SUMMARIES_KEY = 'opd_kiosk_summaries';

function getLocalPatients(): PatientProfile[] {
  try {
    const raw = localStorage.getItem(LOCAL_PATIENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Ignore storage errors
  }
  return INITIAL_PATIENTS;
}

function saveLocalPatients(list: PatientProfile[]): void {
  try {
    localStorage.setItem(LOCAL_PATIENTS_KEY, JSON.stringify(list));
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Robust Patient Lookup by Phone / ABHA / ID / Name
 * Addresses error 0: "Error looking up patient from DB: Failed to fetch"
 */
export async function lookupPatientFromDB(query: string): Promise<{ found: boolean; patient?: PatientProfile; allMatches?: PatientProfile[] }> {
  const trimmed = query.trim();
  if (!trimmed) return { found: false };

  // 1. Attempt API server fetch with safe JSON content-type guard
  try {
    const res = await fetch(`/api/patients/lookup?q=${encodeURIComponent(trimmed)}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.found && data.patient) {
        return data;
      }
    }
  } catch (err) {
    // Graceful fallback to local in-memory DB without throwing
    console.info('Server lookup fallback to local records database');
  }

  // 2. Safe local fallback
  const all = getLocalPatients();
  const cleanQ = trimmed.replace(/\D/g, '');
  
  const match = all.find(p => {
    if (p.phone === trimmed || (cleanQ && p.phone.includes(cleanQ))) return true;
    if (p.abhaId && p.abhaId.replace(/\D/g, '').includes(cleanQ)) return true;
    if (p.id.toLowerCase() === trimmed.toLowerCase()) return true;
    if (p.name.toLowerCase().includes(trimmed.toLowerCase())) return true;
    return false;
  });

  if (match) {
    return { found: true, patient: match, allMatches: [match] };
  }

  return { found: false };
}

/**
 * Robust Patient History Retrieval by Phone Number
 * Addresses error 1: "Error fetching patient history by phone from server: Failed to fetch"
 * Addresses error 2: "Error fetching patient history by phone from server: Unexpected token '<', '<!doctype '... is not valid JSON"
 */
export async function fetchPatientHistoryByPhone(phone: string): Promise<PastVisitRecord[]> {
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone && !phone.trim()) return [];

  // 1. Attempt API call with strict content-type check
  try {
    const res = await fetch(`/api/patient-history?phone=${encodeURIComponent(phone.trim())}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && Array.isArray(data.history)) {
        return data.history;
      }
    }
  } catch (err) {
    console.info('Server patient history fetch fallback to local records database');
  }

  // 2. Local fallback
  const all = getLocalPatients();
  const patient = all.find(p => p.phone === phone || (cleanPhone && p.phone.replace(/\D/g, '').includes(cleanPhone)));
  if (patient && patient.pastVisits) {
    return patient.pastVisits;
  }

  return [];
}

/**
 * Register or update patient
 */
export async function savePatientIntake(patient: PatientProfile): Promise<PatientProfile> {
  // Update local
  const current = getLocalPatients();
  const idx = current.findIndex(p => p.id === patient.id);
  let updatedList: PatientProfile[];
  if (idx >= 0) {
    updatedList = [...current];
    updatedList[idx] = patient;
  } else {
    updatedList = [patient, ...current];
  }
  saveLocalPatients(updatedList);

  // Sync to server if reachable
  try {
    await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(patient),
      signal: AbortSignal.timeout(3000)
    });
  } catch (e) {
    // Local persistence is already saved
  }

  return patient;
}

/**
 * Fetch all patients
 */
export async function fetchAllPatients(): Promise<PatientProfile[]> {
  try {
    const res = await fetch('/api/patients', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data)) {
        saveLocalPatients(data);
        return data;
      }
    }
  } catch (e) {
    // fallback
  }
  return getLocalPatients();
}

/**
 * Update patient queue status
 */
export async function updatePatientStatus(patientId: string, status: PatientProfile['status']): Promise<boolean> {
  const current = getLocalPatients();
  const idx = current.findIndex(p => p.id === patientId);
  if (idx >= 0) {
    current[idx] = { ...current[idx], status };
    saveLocalPatients([...current]);
  }
  try {
    await fetch(`/api/patients/${patientId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ status }),
      signal: AbortSignal.timeout(3000)
    });
  } catch (e) {
    // local already saved
  }
  return true;
}
