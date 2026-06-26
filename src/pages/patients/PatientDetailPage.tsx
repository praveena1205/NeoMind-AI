import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Baby, Calendar, Activity, Brain, FileVideo, Mic,
  Lightbulb, Plus, Edit, AlertTriangle, CheckCircle, Clock,
  TrendingUp, FileText, Loader2, ChevronRight,
} from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Navbar } from '../../components/layout/Navbar';
import { AppSidebar } from '../../components/layout/Navbar';
import { supabase } from '../../lib/supabase';
import { getRiskBadgeClass, getRiskColor, calculateAge, formatDate, formatDateTime } from '../../lib/utils';
import type { Patient, RiskAssessment } from '../../types';

const DEMO_PATIENT: Patient = {
  id: '1', clinician_id: '', patient_code: 'NM26-04821', full_name: 'Baby Emma Johnson',
  date_of_birth: '2026-05-01', gender: 'female', gestational_age_weeks: 39, birth_weight_grams: 3200,
  apgar_score_1min: 8, apgar_score_5min: 9, delivery_type: 'vaginal', nicu_admission: false,
  nicu_duration_days: 0, family_history_asd: true, family_history_adhd: false,
  family_history_chromosomal: false, maternal_age: 32, maternal_health_notes: '',
  notes: 'First born, family history of ASD on paternal side.',
  status: 'active', overall_risk_level: 'medium',
  created_at: '2026-05-01T09:00:00Z', updated_at: '2026-05-01T09:00:00Z',
};

const DEMO_ASSESSMENTS: RiskAssessment[] = [
  {
    id: 'a1', patient_id: '1', conducted_by: '', video_upload_id: null, audio_upload_id: null,
    assessment_type: 'combined', asd_risk_score: 32, adhd_risk_score: 18,
    down_syndrome_risk_score: 8, developmental_delay_risk_score: 28,
    overall_risk_score: 21.5, overall_risk_level: 'medium', confidence_score: 91.4,
    model_version: '2.1.0', status: 'complete', clinician_notes: '',
    created_at: '2026-05-20T14:30:00Z', updated_at: '2026-05-20T14:30:00Z',
  },
];

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'assessments' | 'uploads'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: pData }, { data: aData }] = await Promise.all([
        supabase.from('patients').select('*').eq('id', id!).maybeSingle(),
        supabase.from('risk_assessments').select('*').eq('patient_id', id!).order('created_at', { ascending: false }),
      ]);
      setPatient(pData || (id === '1' ? DEMO_PATIENT : null));
      setAssessments(aData?.length ? aData : id === '1' ? DEMO_ASSESSMENTS : []);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const radarData = assessments[0] ? [
    { subject: 'ASD', score: assessments[0].asd_risk_score },
    { subject: 'ADHD', score: assessments[0].adhd_risk_score },
    { subject: 'Down Syn.', score: assessments[0].down_syndrome_risk_score },
    { subject: 'Dev. Delay', score: assessments[0].developmental_delay_risk_score },
    { subject: 'Overall', score: assessments[0].overall_risk_score },
  ] : [];

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
    </div>
  );

  if (!patient) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-white text-lg mb-2">Patient not found</p>
        <Link to="/patients" className="btn-primary">Back to Patients</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar isApp />
      <AppSidebar />
      <main className="lg:ml-64 pt-16">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <Link to="/patients" className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 mt-1 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{patient.full_name}</h1>
                <span className={getRiskBadgeClass(patient.overall_risk_level)}>{patient.overall_risk_level} risk</span>
                {patient.nicu_admission && (
                  <span className="text-xs bg-rose-500/15 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded-full">NICU</span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-slate-400 flex-wrap">
                <span>{patient.patient_code}</span>
                <span>·</span>
                <span>Age: {calculateAge(patient.date_of_birth)}</span>
                <span>·</span>
                <span>Born: {formatDate(patient.date_of_birth)}</span>
                <span>·</span>
                <span className="capitalize">{patient.gender}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={`/video-analysis?patient=${patient.id}`} className="btn-secondary text-sm gap-1.5 py-2 px-3">
                <FileVideo className="w-4 h-4" /> Analyze Video
              </Link>
              <Link to={`/audio-analysis?patient=${patient.id}`} className="btn-secondary text-sm gap-1.5 py-2 px-3">
                <Mic className="w-4 h-4" /> Analyze Audio
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-900 rounded-xl p-1 mb-6 w-fit">
            {(['overview', 'assessments', 'uploads'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  activeTab === tab ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Patient Info */}
              <div className="space-y-4">
                <div className="glass-card p-5">
                  <h3 className="font-semibold text-white mb-4">Birth Information</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Gestational Age', value: `${patient.gestational_age_weeks} weeks` },
                      { label: 'Birth Weight', value: `${(patient.birth_weight_grams / 1000).toFixed(2)} kg` },
                      { label: 'Delivery Type', value: patient.delivery_type },
                      { label: 'APGAR (1 min)', value: patient.apgar_score_1min ?? 'N/A' },
                      { label: 'APGAR (5 min)', value: patient.apgar_score_5min ?? 'N/A' },
                      { label: 'NICU Admission', value: patient.nicu_admission ? `Yes (${patient.nicu_duration_days} days)` : 'No' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-xs text-slate-500">{label}</span>
                        <span className="text-xs text-slate-200 font-medium capitalize">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5">
                  <h3 className="font-semibold text-white mb-4">Risk Factors</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Family History: ASD', active: patient.family_history_asd },
                      { label: 'Family History: ADHD', active: patient.family_history_adhd },
                      { label: 'Family History: Chromosomal', active: patient.family_history_chromosomal },
                      { label: 'Premature Birth (<37w)', active: patient.gestational_age_weeks < 37 },
                      { label: 'Low Birth Weight (<2500g)', active: patient.birth_weight_grams < 2500 },
                      { label: 'Low APGAR Score (<7)', active: (patient.apgar_score_5min ?? 10) < 7 },
                      { label: 'NICU Admission', active: patient.nicu_admission },
                      { label: 'Advanced Maternal Age (>35)', active: (patient.maternal_age ?? 0) > 35 },
                    ].map(({ label, active }) => (
                      <div key={label} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${active ? 'bg-amber-500/10 text-amber-400' : 'text-slate-500'}`}>
                        {active ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> : <CheckCircle className="w-3.5 h-3.5 shrink-0 text-slate-600" />}
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Latest Assessment */}
              <div className="lg:col-span-2 space-y-4">
                {assessments[0] ? (
                  <>
                    <div className="glass-card p-6">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="font-semibold text-white">Latest AI Assessment</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(assessments[0].created_at)} · Confidence: {assessments[0].confidence_score}%</p>
                        </div>
                        <Link to="/insights" className="btn-outline text-xs py-1.5 gap-1">
                          <Lightbulb className="w-3.5 h-3.5" /> Full Insights
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        {[
                          { label: 'ASD Risk', score: assessments[0].asd_risk_score, color: '#06b6d4' },
                          { label: 'ADHD Risk', score: assessments[0].adhd_risk_score, color: '#14b8a6' },
                          { label: 'Down Syndrome', score: assessments[0].down_syndrome_risk_score, color: '#10b981' },
                          { label: 'Dev. Delay', score: assessments[0].developmental_delay_risk_score, color: '#f59e0b' },
                        ].map(({ label, score, color }) => (
                          <div key={label} className="bg-slate-900/80 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-white mb-0.5">{score.toFixed(0)}%</div>
                            <div className="text-xs text-slate-400">{label}</div>
                            <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ duration: 1 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#1e293b" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                          <Radar name="Risk Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                ) : (
                  <div className="glass-card p-12 text-center">
                    <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-white font-semibold mb-2">No Assessments Yet</h3>
                    <p className="text-slate-400 text-sm mb-4">Upload video or audio data to run an AI analysis</p>
                    <div className="flex justify-center gap-3">
                      <Link to={`/video-analysis?patient=${patient.id}`} className="btn-primary gap-2 text-sm">
                        <FileVideo className="w-4 h-4" /> Upload Video
                      </Link>
                      <Link to={`/audio-analysis?patient=${patient.id}`} className="btn-secondary gap-2 text-sm">
                        <Mic className="w-4 h-4" /> Upload Audio
                      </Link>
                    </div>
                  </div>
                )}

                {patient.notes && (
                  <div className="glass-card p-5">
                    <h3 className="font-semibold text-white mb-2">Clinical Notes</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{patient.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'assessments' && (
            <div className="space-y-4">
              {assessments.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-1">No assessments yet</h3>
                  <p className="text-slate-400 text-sm">Run your first AI analysis to see results here</p>
                </div>
              ) : assessments.map((assessment, i) => (
                <motion.div
                  key={assessment.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white capitalize">{assessment.assessment_type} Assessment</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${assessment.status === 'complete' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                          {assessment.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(assessment.created_at)}</p>
                    </div>
                    <span className={getRiskBadgeClass(assessment.overall_risk_level)}>{assessment.overall_risk_level}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'ASD', score: assessment.asd_risk_score },
                      { label: 'ADHD', score: assessment.adhd_risk_score },
                      { label: 'Down Syn.', score: assessment.down_syndrome_risk_score },
                      { label: 'Dev. Delay', score: assessment.developmental_delay_risk_score },
                    ].map(({ label, score }) => (
                      <div key={label} className="text-center bg-slate-900/60 rounded-lg p-2.5">
                        <p className="text-lg font-bold text-white">{score.toFixed(0)}%</p>
                        <p className="text-xs text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                    <span>Confidence: {assessment.confidence_score}%</span>
                    <span>Model v{assessment.model_version}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'uploads' && (
            <div className="glass-card p-12 text-center">
              <div className="flex justify-center gap-6 mb-4">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center">
                  <FileVideo className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center">
                  <Mic className="w-8 h-8 text-teal-400" />
                </div>
              </div>
              <h3 className="text-white font-semibold mb-2">Upload Data for Analysis</h3>
              <p className="text-slate-400 text-sm mb-6">Upload video recordings and audio clips for AI-powered screening</p>
              <div className="flex justify-center gap-3">
                <Link to={`/video-analysis?patient=${patient.id}`} className="btn-primary gap-2 text-sm">
                  <FileVideo className="w-4 h-4" /> Upload Video
                </Link>
                <Link to={`/audio-analysis?patient=${patient.id}`} className="btn-secondary gap-2 text-sm">
                  <Mic className="w-4 h-4" /> Upload Audio
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
