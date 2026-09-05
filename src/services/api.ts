import { PatientProfile, PastVisitRecord, PatientEncounter, MedicationItem } from '../types';

export type ClientRole = 'KIOSK' | 'DOCTOR' | 'TRIAGE' | 'ADMIN';

let activeClientRole: ClientRole = 'KIOSK';

export function setActiveRole(role: ClientRole): void {
  activeClientRole = role;
}

export function getActiveRole(): ClientRole {
  return activeClientRole;
}

function getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  return {
    'Accept': 'application/json',
    'X-User-Role': activeClientRole,
    ...extraHeaders
  };
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Robust Patient Lookup by Phone / ABHA / ID / Name
 * Connects directly to backend database without fake data fallback.
 */
export async function lookupPatientFromDB(query: string): Promise<{ 
  found: boolean; 
  patient?: PatientProfile; 
  allMatches?: PatientProfile[];
  error?: string;
}> {
  const trimmed = query.trim();
  if (!trimmed) return { found: false };

  try {
    const res = await fetch(`/api/patients/lookup?q=${encodeURIComponent(trimmed)}`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(4000)
    });

    if (!res.ok) {
      throw new ApiError(`Lookup failed with status ${res.status}`, res.status);
    }

    const data = await res.json();
    if (data && data.found && data.patient) {
      return data;
    }
    return { found: false };
  } catch (err: any) {
    console.error('Patient database lookup error:', err);
    return { 
      found: false, 
      error: 'Unable to connect to hospital database. Please verify connection with reception desk.' 
    };
  }
}

/**
 * Patient History Retrieval by Phone Number
 * Connects to backend database without fake data fallback.
 */
export async function fetchPatientHistoryByPhone(phone: string): Promise<PastVisitRecord[]> {
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone && !phone.trim()) return [];

  try {
    const res = await fetch(`/api/patient-history?phone=${encodeURIComponent(phone.trim())}`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(4000)
    });

    if (!res.ok) {
      throw new ApiError(`History fetch failed with status ${res.status}`, res.status);
    }

    const data = await res.json();
    if (data && Array.isArray(data.history)) {
      return data.history;
    }
    return [];
  } catch (err: any) {
    console.error('Patient history database fetch error:', err);
    throw new ApiError('Failed to fetch patient history from hospital database.', err?.status);
  }
}

/**
 * Register or update patient in persistent SQLite database.
 * No localStorage primary storage.
 */
export async function savePatientIntake(patient: PatientProfile): Promise<PatientProfile> {
  const res = await fetch('/api/patients', {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(patient),
    signal: AbortSignal.timeout(5000)
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(errorBody.error || `Server registration error (${res.status})`, res.status);
  }

  const data = await res.json();
  return data.patient || patient;
}

/**
 * Fetch patients list with role-based privacy guard.
 * KIOSK role receives sanitized tokens; DOCTOR/ADMIN receives clinical profiles.
 * Does not fall back to fake mock data on failure.
 */
export async function fetchAllPatients(role?: ClientRole): Promise<PatientProfile[]> {
  const effectiveRole = role || activeClientRole;
  const res = await fetch('/api/patients', {
    headers: {
      'Accept': 'application/json',
      'X-User-Role': effectiveRole
    },
    signal: AbortSignal.timeout(4000)
  });

  if (!res.ok) {
    throw new ApiError(`Failed to load patient queue from database (${res.status})`, res.status);
  }

  const data = await res.json();
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

/**
 * Fetch detailed clinical record for doctor cockpit (Restricted to DOCTOR / ADMIN).
 */
export async function fetchClinicalDetails(patientId: string): Promise<PatientProfile> {
  const res = await fetch(`/api/patients/${patientId}/clinical`, {
    headers: {
      'Accept': 'application/json',
      'X-User-Role': 'DOCTOR'
    },
    signal: AbortSignal.timeout(4000)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new ApiError(errData.error || `Failed to fetch clinical details (${res.status})`, res.status);
  }

  const data = await res.json();
  return data.patient;
}

/**
 * Update patient queue status in persistent database
 */
export async function updatePatientStatus(
  patientId: string, 
  status: PatientProfile['status'],
  encounter?: PatientEncounter
): Promise<boolean> {
  const res = await fetch(`/api/patients/${patientId}/status`, {
    method: 'PATCH',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status, encounter }),
    signal: AbortSignal.timeout(4000)
  });

  if (!res.ok) {
    throw new ApiError(`Status update failed (${res.status})`, res.status);
  }

  return true;
}

/**
 * Save doctor orders to SQLite orders table
 */
export async function saveOrdersToDb(
  patientId: string, 
  orders: Array<{ orderType: string; itemName: string; details?: any }>
): Promise<boolean> {
  const res = await fetch(`/api/patients/${patientId}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-User-Role': 'DOCTOR'
    },
    body: JSON.stringify({ orders }),
    signal: AbortSignal.timeout(4000)
  });

  if (!res.ok) {
    throw new ApiError(`Failed to save doctor orders (${res.status})`, res.status);
  }

  return true;
}

/**
 * Save doctor verifications to SQLite doctor_verifications table
 */
export async function saveDoctorVerificationsToDb(
  patientId: string, 
  verifications: Record<string, 'accepted' | 'edited' | 'rejected'>
): Promise<boolean> {
  const res = await fetch(`/api/patients/${patientId}/verifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-User-Role': 'DOCTOR'
    },
    body: JSON.stringify({ verifications }),
    signal: AbortSignal.timeout(4000)
  });

  if (!res.ok) {
    throw new ApiError(`Failed to save doctor verifications (${res.status})`, res.status);
  }

  return true;
}

/**
 * Fetch audit logs (Restricted to ADMIN)
 */
export async function fetchAuditLogs(limit: number = 50): Promise<any[]> {
  const res = await fetch(`/api/audit-logs?limit=${limit}`, {
    headers: {
      'Accept': 'application/json',
      'X-User-Role': 'ADMIN'
    },
    signal: AbortSignal.timeout(4000)
  });

  if (!res.ok) {
    throw new ApiError(`Failed to fetch audit logs (${res.status})`, res.status);
  }

  const data = await res.json();
  return data.logs || [];
}
