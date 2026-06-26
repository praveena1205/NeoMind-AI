export type UserRole = 'clinician' | 'admin' | 'researcher';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical' | 'unknown';
export type AnalysisStatus = 'pending' | 'processing' | 'complete' | 'failed';
export type UploadStatus = 'pending' | 'uploading' | 'complete' | 'failed';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  specialty: string;
  institution: string;
  phone: string;
  avatar_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  clinician_id: string;
  patient_code: string;
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'unknown';
  gestational_age_weeks: number;
  birth_weight_grams: number;
  apgar_score_1min: number | null;
  apgar_score_5min: number | null;
  delivery_type: 'vaginal' | 'cesarean' | 'assisted';
  nicu_admission: boolean;
  nicu_duration_days: number;
  family_history_asd: boolean;
  family_history_adhd: boolean;
  family_history_chromosomal: boolean;
  maternal_age: number | null;
  maternal_health_notes: string;
  notes: string;
  status: 'active' | 'inactive' | 'archived';
  overall_risk_level: RiskLevel;
  created_at: string;
  updated_at: string;
}

export interface VideoUpload {
  id: string;
  patient_id: string;
  uploaded_by: string;
  file_name: string;
  file_size_bytes: number;
  duration_seconds: number;
  video_type: 'general' | 'facial' | 'movement' | 'eye_tracking';
  storage_path: string;
  upload_status: UploadStatus;
  analysis_status: AnalysisStatus;
  analysis_started_at: string | null;
  analysis_completed_at: string | null;
  created_at: string;
}

export interface AudioUpload {
  id: string;
  patient_id: string;
  uploaded_by: string;
  file_name: string;
  file_size_bytes: number;
  duration_seconds: number;
  cry_type: 'hunger' | 'pain' | 'discomfort' | 'unknown';
  storage_path: string;
  upload_status: UploadStatus;
  analysis_status: AnalysisStatus;
  analysis_started_at: string | null;
  analysis_completed_at: string | null;
  created_at: string;
}

export interface RiskAssessment {
  id: string;
  patient_id: string;
  conducted_by: string;
  video_upload_id: string | null;
  audio_upload_id: string | null;
  assessment_type: 'video' | 'audio' | 'combined' | 'clinical';
  asd_risk_score: number;
  adhd_risk_score: number;
  down_syndrome_risk_score: number;
  developmental_delay_risk_score: number;
  overall_risk_score: number;
  overall_risk_level: RiskLevel;
  confidence_score: number;
  model_version: string;
  status: AnalysisStatus;
  clinician_notes: string;
  created_at: string;
  updated_at: string;
  patients?: Patient;
}

export interface AssessmentFeature {
  id: string;
  assessment_id: string;
  feature_name: string;
  feature_value: number;
  shap_value: number;
  category: 'behavioral' | 'motor' | 'facial' | 'audio' | 'clinical';
  description: string;
  created_at: string;
}

export interface Recommendation {
  id: string;
  assessment_id: string;
  patient_id: string;
  title: string;
  description: string;
  category: 'general' | 'specialist' | 'therapy' | 'monitoring' | 'lifestyle' | 'followup';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  disorder_target: 'asd' | 'adhd' | 'down_syndrome' | 'developmental_delay' | 'general';
  action_required: boolean;
  follow_up_date: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  created_at: string;
}

export interface Report {
  id: string;
  patient_id: string;
  assessment_id: string | null;
  generated_by: string;
  report_title: string;
  report_type: 'standard' | 'detailed' | 'summary' | 'followup';
  summary: string;
  clinician_notes: string;
  pdf_url: string;
  status: 'draft' | 'final' | 'archived';
  created_at: string;
  updated_at: string;
  patients?: Patient;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string;
  created_at: string;
}

export interface DashboardStats {
  totalPatients: number;
  assessmentsThisMonth: number;
  highRiskCount: number;
  pendingFollowups: number;
  recentAssessments: RiskAssessment[];
  riskDistribution: { level: string; count: number }[];
  monthlyTrend: { month: string; assessments: number; highRisk: number }[];
}

export interface AIAnalysisResult {
  asd_risk_score: number;
  adhd_risk_score: number;
  down_syndrome_risk_score: number;
  developmental_delay_risk_score: number;
  overall_risk_score: number;
  overall_risk_level: RiskLevel;
  confidence_score: number;
  features: AssessmentFeature[];
  recommendations: Omit<Recommendation, 'id' | 'assessment_id' | 'patient_id' | 'created_at'>[];
}
