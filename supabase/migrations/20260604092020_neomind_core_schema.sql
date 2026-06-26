/*
  # NeoMind Core Database Schema

  ## Overview
  Complete schema for the NeoMind AI-powered early detection platform for neurodevelopmental disorders in newborns.

  ## New Tables

  ### profiles
  - Extends Supabase auth.users with role-based access
  - Stores user display name, role (clinician, admin, researcher), specialty

  ### patients
  - Newborn patient records linked to a clinician
  - Stores birth info, gestational age, weight, family history flags

  ### video_uploads
  - Records of uploaded baby movement/expression videos
  - Stores file path, duration, upload status, analysis status

  ### audio_uploads
  - Records of uploaded baby crying audio
  - Stores file path, duration, upload status, analysis status

  ### risk_assessments
  - AI-generated risk scores per disorder per patient
  - Stores scores for ASD, ADHD, Down Syndrome, Developmental Delay
  - Includes confidence scores and model version

  ### assessment_features
  - Individual feature scores that feed into risk models
  - SHAP-like explainability data per assessment

  ### recommendations
  - AI-generated personalized recommendations per assessment
  - Priority levels, category, action items

  ### reports
  - Compiled clinical reports per patient
  - PDF generation status, clinician notes

  ### audit_logs
  - HIPAA-style audit trail of all data access and modifications

  ## Security
  - RLS enabled on all tables
  - Clinicians can only access their own patients
  - Admins can access all data
  - Audit logs are insert-only for regular users
*/

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'clinician' CHECK (role IN ('clinician', 'admin', 'researcher')),
  specialty text DEFAULT '',
  institution text DEFAULT '',
  phone text DEFAULT '',
  avatar_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- PATIENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinician_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_code text UNIQUE NOT NULL,
  full_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text NOT NULL DEFAULT 'unknown' CHECK (gender IN ('male', 'female', 'unknown')),
  gestational_age_weeks integer DEFAULT 40 CHECK (gestational_age_weeks BETWEEN 22 AND 45),
  birth_weight_grams integer DEFAULT 3200 CHECK (birth_weight_grams BETWEEN 400 AND 6000),
  apgar_score_1min integer CHECK (apgar_score_1min BETWEEN 0 AND 10),
  apgar_score_5min integer CHECK (apgar_score_5min BETWEEN 0 AND 10),
  delivery_type text DEFAULT 'vaginal' CHECK (delivery_type IN ('vaginal', 'cesarean', 'assisted')),
  nicu_admission boolean DEFAULT false,
  nicu_duration_days integer DEFAULT 0,
  family_history_asd boolean DEFAULT false,
  family_history_adhd boolean DEFAULT false,
  family_history_chromosomal boolean DEFAULT false,
  maternal_age integer CHECK (maternal_age BETWEEN 10 AND 70),
  maternal_health_notes text DEFAULT '',
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  overall_risk_level text DEFAULT 'unknown' CHECK (overall_risk_level IN ('low', 'medium', 'high', 'critical', 'unknown')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinicians can view own patients"
  ON patients FOR SELECT
  TO authenticated
  USING (clinician_id = auth.uid());

CREATE POLICY "Clinicians can insert own patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (clinician_id = auth.uid());

CREATE POLICY "Clinicians can update own patients"
  ON patients FOR UPDATE
  TO authenticated
  USING (clinician_id = auth.uid())
  WITH CHECK (clinician_id = auth.uid());

CREATE POLICY "Admins can view all patients"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all patients"
  ON patients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- VIDEO UPLOADS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS video_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES profiles(id),
  file_name text NOT NULL,
  file_size_bytes bigint DEFAULT 0,
  duration_seconds integer DEFAULT 0,
  video_type text DEFAULT 'general' CHECK (video_type IN ('general', 'facial', 'movement', 'eye_tracking')),
  storage_path text DEFAULT '',
  upload_status text DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploading', 'complete', 'failed')),
  analysis_status text DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'complete', 'failed')),
  analysis_started_at timestamptz,
  analysis_completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE video_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinicians can view own patient videos"
  ON video_uploads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = patient_id AND pt.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can insert videos for own patients"
  ON video_uploads FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = patient_id AND pt.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can update own patient videos"
  ON video_uploads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = patient_id AND pt.clinician_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = patient_id AND pt.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all videos"
  ON video_uploads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- AUDIO UPLOADS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS audio_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES profiles(id),
  file_name text NOT NULL,
  file_size_bytes bigint DEFAULT 0,
  duration_seconds integer DEFAULT 0,
  cry_type text DEFAULT 'unknown' CHECK (cry_type IN ('hunger', 'pain', 'discomfort', 'unknown')),
  storage_path text DEFAULT '',
  upload_status text DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploading', 'complete', 'failed')),
  analysis_status text DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'complete', 'failed')),
  analysis_started_at timestamptz,
  analysis_completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audio_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinicians can view own patient audio"
  ON audio_uploads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = patient_id AND pt.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can insert audio for own patients"
  ON audio_uploads FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = patient_id AND pt.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can update own patient audio"
  ON audio_uploads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = patient_id AND pt.clinician_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = patient_id AND pt.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all audio"
  ON audio_uploads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- RISK ASSESSMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  conducted_by uuid NOT NULL REFERENCES profiles(id),
  video_upload_id uuid REFERENCES video_uploads(id),
  audio_upload_id uuid REFERENCES audio_uploads(id),
  assessment_type text DEFAULT 'combined' CHECK (assessment_type IN ('video', 'audio', 'combined', 'clinical')),
  asd_risk_score numeric(5,2) DEFAULT 0 CHECK (asd_risk_score BETWEEN 0 AND 100),
  adhd_risk_score numeric(5,2) DEFAULT 0 CHECK (adhd_risk_score BETWEEN 0 AND 100),
  down_syndrome_risk_score numeric(5,2) DEFAULT 0 CHECK (down_syndrome_risk_score BETWEEN 0 AND 100),
  developmental_delay_risk_score numeric(5,2) DEFAULT 0 CHECK (developmental_delay_risk_score BETWEEN 0 AND 100),
  overall_risk_score numeric(5,2) DEFAULT 0 CHECK (overall_risk_score BETWEEN 0 AND 100),
  overall_risk_level text DEFAULT 'low' CHECK (overall_risk_level IN ('low', 'medium', 'high', 'critical')),
  confidence_score numeric(5,2) DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),
  model_version text DEFAULT '1.0.0',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'complete', 'failed')),
  clinician_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinicians can view own patient assessments"
  ON risk_assessments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = patient_id AND pt.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can insert assessments for own patients"
  ON risk_assessments FOR INSERT
  TO authenticated
  WITH CHECK (
    conducted_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = patient_id AND pt.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can update own assessments"
  ON risk_assessments FOR UPDATE
  TO authenticated
  USING (conducted_by = auth.uid())
  WITH CHECK (conducted_by = auth.uid());

CREATE POLICY "Admins can view all assessments"
  ON risk_assessments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- ASSESSMENT FEATURES TABLE (Explainable AI)
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
  feature_name text NOT NULL,
  feature_value numeric(8,4) DEFAULT 0,
  shap_value numeric(8,4) DEFAULT 0,
  category text DEFAULT 'behavioral' CHECK (category IN ('behavioral', 'motor', 'facial', 'audio', 'clinical')),
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assessment_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinicians can view features for own patient assessments"
  ON assessment_features FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM risk_assessments ra
      JOIN patients pt ON pt.id = ra.patient_id
      WHERE ra.id = assessment_id AND pt.clinician_id = auth.uid()
    )
  );

CREATE POLICY "System can insert assessment features"
  ON assessment_features FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM risk_assessments ra
      JOIN patients pt ON pt.id = ra.patient_id
      WHERE ra.id = assessment_id AND pt.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all features"
  ON assessment_features FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- RECOMMENDATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text DEFAULT 'general' CHECK (category IN ('general', 'specialist', 'therapy', 'monitoring', 'lifestyle', 'followup')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  disorder_target text DEFAULT 'general' CHECK (disorder_target IN ('asd', 'adhd', 'down_syndrome', 'developmental_delay', 'general')),
  action_required boolean DEFAULT false,
  follow_up_date date,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinicians can view recommendations for own patients"
  ON recommendations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = patient_id AND pt.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can insert recommendations for own patients"
  ON recommendations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = patient_id AND pt.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can update recommendations for own patients"
  ON recommendations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = patient_id AND pt.clinician_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = patient_id AND pt.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  assessment_id uuid REFERENCES risk_assessments(id),
  generated_by uuid NOT NULL REFERENCES profiles(id),
  report_title text NOT NULL,
  report_type text DEFAULT 'standard' CHECK (report_type IN ('standard', 'detailed', 'summary', 'followup')),
  summary text DEFAULT '',
  clinician_notes text DEFAULT '',
  pdf_url text DEFAULT '',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinicians can view reports for own patients"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = patient_id AND pt.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can insert reports for own patients"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (
    generated_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = patient_id AND pt.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can update own reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (generated_by = auth.uid())
  WITH CHECK (generated_by = auth.uid());

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- AUDIT LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb DEFAULT '{}',
  ip_address text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_patients_clinician ON patients(clinician_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_video_uploads_patient ON video_uploads(patient_id);
CREATE INDEX IF NOT EXISTS idx_audio_uploads_patient ON audio_uploads(patient_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_patient ON risk_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_status ON risk_assessments(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_patient ON recommendations(patient_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_priority ON recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_reports_patient ON reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER risk_assessments_updated_at
  BEFORE UPDATE ON risk_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
