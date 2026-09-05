export type LanguageCode = 'hi' | 'en' | 'pa' | 'bn' | 'mr' | 'gu' | 'ta' | 'te' | 'kn' | 'ml' | 'or' | 'ur' | 'bho' | 'hinglish';

export interface VitalsData {
  bloodPressure?: string;
  bp?: string; // Compatibility alias
  pulse?: number;
  spo2?: number;
  temperature?: number;
  temp?: number; // Compatibility alias
  weight?: number;
  bloodSugar?: number;
}

export interface PastVisitRecord {
  date: string;
  department: string;
  doctorName: string;
  diagnosis: string;
  prescriptions: string[];
  testsOrdered: string[];
  notes?: string;
}

export type PatientQueueStatus = 
  | 'Waiting' 
  | 'Called' 
  | 'With Doctor' 
  | 'Investigations' 
  | 'Report Ready' 
  | 'Doctor Review' 
  | 'Pharmacy' 
  | 'Completed' 
  | 'Review';

export interface ConsentRecord {
  granted: boolean;
  timestamp: string;
  purposeVersion: string;
}

export interface PersonalHistory {
  diet?: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Other' | string;
  tobacco?: 'Never' | 'Former' | 'Current Smoker / Chewer' | 'No' | string;
  alcohol?: 'None' | 'Occasional' | 'Regular' | 'No' | string;
  sleep?: 'Normal (7-8 hrs)' | 'Insomnia / Disturbed' | 'Poor' | string;
}

export interface AYUSHAssessment {
  prakriti?: {
    dominantDoshaTendency?: string;
    thermalTolerance?: string;
    physicalTraits?: string[];
    summary?: string;
  };
  vikriti?: {
    imbalanceSuspected?: string[];
    aggravatingFactors?: string[];
    dominantImbalanceSite?: string;
  };
  agni?: {
    agniType?: 'Sama Agni (Balanced / सम अग्नि)' | 'Visham Agni (Irregular / विषम अग्नि)' | 'Tikshna Agni (Sharp / तीक्ष्ण अग्नि)' | 'Manda Agni (Sluggish / मंद अग्नि)' | string;
    appetite?: string;
    postMealComfort?: string;
    notes?: string;
  };
  koshtha?: {
    koshthaType?: 'Madhyama (Regular / मध्यम)' | 'Krura (Hard / Constipated / क्रूर)' | 'Mridu (Soft / Loose / मृदु)' | string;
    bowelHabits?: string;
    stoolConsistency?: string;
    notes?: string;
  };
  ahara?: {
    dietaryPattern?: string;
    mealTimings?: string;
    tastePreferences?: string[];
    waterIntake?: string;
    notes?: string;
  };
  vihara?: {
    dailyRoutine?: string;
    physicalActivity?: string;
    daytimeSleep?: string;
    notes?: string;
  };
  nidra?: {
    quality?: string;
    durationHours?: string | number;
    wakingFeeling?: string;
    sleepObstacles?: string[];
    notes?: string;
  };
  lifestyle?: {
    stressLevel?: string;
    occupationNature?: string;
    seasonalReaction?: string;
    notes?: string;
  };
  additionalParameters?: {
    dashavidhaSummary?: string;
    balaStamina?: string;
    patientProvidedResponses?: Array<{ question: string; answer: string; parameter: string }>;
    disclaimer?: string;
    [key: string]: any;
  };
  provenance?: {
    patientProvided: string[];
    aiStructured: string[];
    doctorVerificationStatus: 'PENDING_DOCTOR_VERIFICATION' | 'VERIFIED' | 'MODIFIED_BY_VAIDYA';
  };
}

export interface StructuredClinicalInterview {
  chiefComplaint: string;
  duration: string;
  severity: number | string;
  associatedSymptoms: string[];
  symptoms?: string[]; // Backwards compatibility for existing views
  historyOfPresentIllness: string;
  pastMedicalHistory: string[];
  pastSurgicalHistory: string[];
  medications: string[];
  allergies: string[];
  familyHistory: string;
  personalHistory: {
    diet?: string;
    tobacco?: string;
    alcohol?: string;
    sleep?: string;
  };
  reviewOfSystems: string[];
  redFlags: string[];
  dialogueHistory?: InterviewDialogueEntry[];
  relevantHistory?: string;
}

export interface InterviewDialogueEntry {
  questionNumber: number;
  question: string;
  questionEnglish?: string;
  answer: string;
  timestamp: string;
  detectedSymptoms?: string[];
  detectedRedFlags?: string[];
}

export interface InterviewStepResponse {
  nextQuestion: string;
  nextQuestionEnglish: string;
  isComplete: boolean;
  questionNumber: number;
  totalSuggestedQuestions: number;
  redFlagsDetected: string[];
  quickReplies?: string[];
  structuredData: StructuredClinicalInterview;
}

export type MedicalDocumentType = 
  | 'prescription' 
  | 'laboratory_report' 
  | 'consultation_summary' 
  | 'discharge_summary' 
  | 'other';

export type ExtractionStatus = 
  | 'AI extracted — needs verification' 
  | 'Verified by Patient' 
  | 'Doctor Verified' 
  | 'Edited by User' 
  | 'Uncertain / Flagged';

export interface ExtractedPrescriptionItem {
  id: string;
  medicine: string;
  strength: string; // e.g. "500 mg" or "Could not confidently read this field."
  dosage: string;   // e.g. "1 tablet" or "Could not confidently read this field."
  frequency: string;// e.g. "twice daily (BD)"
  duration?: string;// e.g. "30 days"
  sourceDocument: string;
  sourceDate?: string;
  status: ExtractionStatus;
  confidence: 'High' | 'Medium' | 'Low' | 'Uncertain';
  confidenceNote?: string;
  isEdited?: boolean;
}

export interface ExtractedLabItem {
  id: string;
  testName: string;
  value: string; // e.g. "142" or "Could not confidently read this field."
  unit: string;  // e.g. "mg/dL"
  referenceRange?: string; // e.g. "70 - 100 mg/dL"
  date?: string; // e.g. "18 Apr 2026"
  isAbnormal?: boolean;
  sourceDocument: string;
  status: ExtractionStatus;
  confidence: 'High' | 'Medium' | 'Low' | 'Uncertain';
  confidenceNote?: string;
  isEdited?: boolean;
}

export interface ExtractedSummaryItem {
  id: string;
  title: string;
  content: string;
  sourceDocument: string;
  date?: string;
  status: ExtractionStatus;
  confidence: 'High' | 'Medium' | 'Low' | 'Uncertain';
  isEdited?: boolean;
}

export interface StructuredDocumentExtraction {
  documentType: MedicalDocumentType;
  documentTypeLabel: string;
  date?: string;
  hospitalOrClinic?: string;
  doctorName?: string;
  prescriptions: ExtractedPrescriptionItem[];
  labResults: ExtractedLabItem[];
  summaryItems: ExtractedSummaryItem[];
  unreadableFieldsDetected: boolean;
  ocrRawSnippet?: string;
  extractionNotes?: string;
}

export interface PatientDocumentRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileSize?: string;
  uploadedAt: string;
  documentTimelineStage: 'Previous medical history' | 'Recent prior visit' | 'Current encounter';
  filePreviewUrl?: string;
  extractedData?: {
    documentType: string;
    date?: string;
    diagnosedCondition?: string;
    extractedMedications?: string[];
    labValues?: string;
    notes?: string;
  };
  structuredExtraction?: StructuredDocumentExtraction;
  verifiedByPatient: boolean;
  doctorVerification?: {
    status: 'PENDING' | 'VERIFIED' | 'MODIFIED' | 'FLAGGED';
    verifiedByDoctorName?: string;
    verifiedAt?: string;
    notes?: string;
  };
}

export type DepartmentCode = string;

export interface PatientProfile {
  id: string;
  tokenNumber: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other' | 'M' | 'F' | 'O';
  phone: string;
  mobile?: string; // Compatibility alias
  abhaId?: string;
  abhaLinked?: boolean;
  isAyushPatient?: boolean;
  consentSigned?: boolean;
  consentTimestamp?: string;
  language: LanguageCode;
  department: string;
  assignedCabin: string;
  registeredAt: string;
  status: PatientQueueStatus;
  consent?: ConsentRecord;
  vitals?: VitalsData;
  pastVisits?: PastVisitRecord[];
  chiefComplaintTranscript?: string;
  chiefComplaintHindi?: string;
  clinicalInterview?: StructuredClinicalInterview;
  ayushAssessment?: AYUSHAssessment;
  documents?: PatientDocumentRecord[];
  encounter?: PatientEncounter;
}

export interface PatientEncounter {
  id: string;
  patientId: string;
  tokenNumber: string;
  status: PatientQueueStatus;
  assignedCabin: string;
  calledAt?: string;
  consultationStartedAt?: string;
  consultationCompletedAt?: string;
  orderedTests: string[];
  completedTests: string[];
  reportCollected?: boolean;
  doctorReviewDone?: boolean;
  medicationsPrescribed: MedicationItem[];
  pharmacyDispensed?: boolean;
  completedAt?: string;
  lastUpdated: string;
}

export interface SocratesAnalysis {
  site?: string;
  onset?: string;
  character?: string;
  radiation?: string;
  associations?: string;
  timeCourse?: string;
  exacerbatingRelieving?: string;
  severity?: string;
  associatedSymptoms?: string[] | string; // Compatibility alias
  timing?: string; // Compatibility alias
}

export interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface ClinicalSummary {
  id: string;
  patientId: string;
  tokenNumber: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  socrates: SocratesAnalysis;
  differentialDiagnosis: Array<{
    condition: string;
    probability: 'High' | 'Medium' | 'Low' | string;
    reasoning?: string;
    rationale?: string; // Compatibility alias
  }>;
  recommendedLabInvestigations: string[];
  doctorOrderedTests: string[];
  isDoctorConsultationDone: boolean;
  doctorConsultationNotes: string;
  urgencyScore: 'NORMAL' | 'URGENT' | 'EMERGENCY' | 'HIGH' | 'MODERATE' | 'LOW';
  medications?: MedicationItem[] | string[];
  pastHistory?: string;
  criticalFlags?: string[];
  doctorActionChecklist?: string[];
  vitalAlerts?: any[];
  redFlags?: string[];
  generatedAt: string;
  executiveKeyPoints?: string[]; // Compatibility alias
  /** Per-item verification map: key = field/item id, value = doctor action */
  doctorVerifiedItems?: Record<string, 'accepted' | 'edited' | 'rejected'>;
  /** Follow-up date for navigator consumption */
  followUpDate?: string;
  /** Follow-up instructions for navigator consumption */
  followUpInstructions?: string;
  patientVerification?: PatientVerificationRecord;
}

export interface PatientVoiceCorrection {
  id?: string;
  fieldId?: string;
  originalText?: string;
  correctedText?: string;
  timestamp: string;
  voiceRecordingUrl?: string;
  transcript?: string;
  fieldUpdated?: string;
  newValue?: string;
}

export interface PatientVerificationRecord {
  isVerified?: boolean;
  verified?: boolean; // Compatibility alias
  status?: 'unverified' | 'confirmed_accurate' | 'corrected_by_patient';
  verifiedAt?: string;
  verifiedVia?: 'touch' | 'voice' | 'assisted' | string;
  readBackCompleted?: boolean;
  corrections?: PatientVoiceCorrection[];
  verificationMethod?: 'touch' | 'voice' | 'assisted';
  verifiedBy?: string;
  reviewedByPatient?: boolean;
  notes?: string;
}

export type LoadLevel = 'LOW' | 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface Department {
  id: string;
  code: string;
  name: string;
  hindiName: string;
  category: string;
  estimatedWaitMinutes: number;
  currentQueueCount: number;
  floor: string;
  roomNumber: string;
  status: string;
  [key: string]: any;
}

export interface DepartmentCrowdSnapshot {
  id: string;
  departmentName: string;
  hindiName: string;
  category: string;
  building: string;
  currentWaitingPatients: number;
  currentWaitMin: number;
  activeCounters: number;
  totalCounters: number;
  predictedIncomingCount: number;
  predictedPeakLoad: LoadLevel;
  predictedSurgeTime: string;
  bottleneckFactor: string;
  recommendedIntervention: string;
  isInterventionActive?: boolean;
}

export interface HourlySurgeDataPoint {
  hourLabel: string;
  isSurgeHour: boolean;
  medicineOpd: number;
  pathologyLab: number;
  radiology?: number;
  pharmacy: number;
}

export interface AdminInterventionAction {
  id: string;
  department: string;
  title: string;
  impactDescription: string;
  reductionMinutes: number;
  applied: boolean;
  timestamp?: string;
}

export interface HospitalServiceOrder {
  id: string;
  name: string;
  category: 'doctor_consultation' | 'lab' | 'radiology' | 'billing_token' | 'opd_review' | 'pharmacy';
  department: string;
  roomNumber: string;
  floor: string;
  block: string;
  currentQueueCount: number;
  estimatedWaitMin: number;
  estimatedProcedureMin: number;
  instructions: string;
  landmark?: string;
  prerequisites?: string[];
  urgent?: boolean;
  tokenRequired?: boolean;
}

export interface HospitalRouteStep {
  stepNumber: number;
  service: HospitalServiceOrder;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  walkTimeMin: number;
  directionsText: string;
  directionsHindi: string;
}

export interface HospitalRoutePlan {
  patientId: string;
  steps: HospitalRouteStep[];
  totalEstimatedWaitMin: number;
  totalEstimatedWalkMin: number;
  optimized: boolean;
}

export type AppViewMode = 'kiosk' | 'doctor' | 'navigator' | 'queue_display' | 'queue' | 'triage' | 'crowd' | 'analytics' | 'management' | 'patient';

export type UserRole = 'patient' | 'doctor' | 'staff' | 'admin' | 'triage' | 'kiosk' | 'crowd' | 'management';

export interface TriageAlert {
  id: string;
  severity: 'URGENT' | 'EMERGENCY' | 'NORMAL' | 'HIGH' | 'MODERATE' | 'LOW' | string;
  sign?: string;
  reason?: string;
  message?: string;
  category?: string;
  status?: string;
  tokenNumber?: string;
  patientName?: string;
  createdAt?: string;
  symptomsTriggered?: string[];
  vitals?: any;
  patientId?: string;
  ruleId?: string;
}

export interface PatientFeedback {
  id?: string;
  rating?: number;
  easeRating?: number;
  voiceClarityRating?: number;
  preferredLanguage?: string;
  kioskHelpful?: boolean;
  comments?: string;
  timestamp?: string;
  tokenNumber?: string;
}

export interface QuestionAnswer {
  questionId?: string;
  question?: string;
  questionText?: string; // Compatibility alias
  answer?: string;
  answerText?: string; // Compatibility alias
  audioRecordingUrl?: string;
  answeredVia?: string;
  timestamp?: string;
}

export interface UploadedDocument {
  id: string;
  name?: string;
  fileName?: string;
  url?: string;
  previewUrl?: string;
  type?: string;
  fileType?: string;
  extractedText?: string;
  confidence?: number;
  confidenceScore?: number;
  extractedDiagnosis?: string | string[];
  extractedMedications?: string[];
  patientId?: string;
  uploadedAt?: string;
}

export interface PastVisit {
  id?: string;
  date?: string;
  visitDate?: string;
  diagnosis?: string;
  doctor?: string;
  doctorName?: string;
  hospital?: string;
  prescriptions?: string[];
  prescriptionDoc?: any;
  clinicalNotes?: string;
  department?: string;
  patientId?: string;
  diagnosisType?: string;
  oldProblem?: string;
  chiefComplaint?: string;
  diagnoses?: string[];
  treatments?: any[];
  keyDiagnosisHighlights?: any[];
  mobile?: string;
  vitals?: any;
  labInvestigations?: string[];
  followUpPlan?: string;
}

