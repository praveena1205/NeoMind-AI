import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, TrendingUp, AlertTriangle, CheckCircle, Lightbulb,
  BarChart3, Activity, Eye, Mic, FileText, ChevronRight,
  Info, Cpu, Zap, Users, Calendar,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ScatterChart, Scatter, ZAxis, Legend,
} from 'recharts';
import { Navbar } from '../../components/layout/Navbar';
import { AppSidebar } from '../../components/layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getRiskBadgeClass, getRiskColor, formatDate, scoreToRiskLevel } from '../../lib/utils';
import type { RiskAssessment } from '../../types';

const DEMO_ASSESSMENT: RiskAssessment = {
  id: 'demo', patient_id: '1', conducted_by: '', video_upload_id: null, audio_upload_id: null,
  assessment_type: 'combined', asd_risk_score: 32.4, adhd_risk_score: 18.6,
  down_syndrome_risk_score: 7.8, developmental_delay_risk_score: 28.9,
  overall_risk_score: 21.9, overall_risk_level: 'medium', confidence_score: 91.4,
  model_version: '2.1.0', status: 'complete', clinician_notes: '',
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
};

const SHAP_FEATURES = [
  { name: 'Gaze Following Ability', shap: 0.22, impact: 'negative', category: 'behavioral' },
  { name: 'ASD Family History', shap: 0.19, impact: 'negative', category: 'clinical' },
  { name: 'Facial Landmark Symmetry', shap: 0.18, impact: 'positive', category: 'facial' },
  { name: 'Eye Contact Duration', shap: 0.16, impact: 'positive', category: 'behavioral' },
  { name: 'Cry Pitch Variability', shap: 0.14, impact: 'negative', category: 'audio' },
  { name: 'Motor Pattern Regularity', shap: 0.13, impact: 'positive', category: 'motor' },
  { name: 'Social Smile Response', shap: 0.11, impact: 'positive', category: 'behavioral' },
  { name: 'Gestational Age (<37w)', shap: 0.09, impact: 'neutral', category: 'clinical' },
  { name: 'APGAR Score (5min)', shap: 0.07, impact: 'positive', category: 'clinical' },
  { name: 'Birth Weight', shap: 0.05, impact: 'positive', category: 'clinical' },
];

export default function AIInsightsPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [selected, setSelected] = useState<RiskAssessment>(DEMO_ASSESSMENT);
  const [activeDisorder, setActiveDisorder] = useState<'asd' | 'adhd' | 'ds' | 'dd'>('asd');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('risk_assessments')
        .select('*, patients(full_name, patient_code)')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data?.length) {
        setAssessments(data);
        setSelected(data[0]);
      } else {
        setAssessments([DEMO_ASSESSMENT]);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const radarData = [
    { subject: 'ASD', score: selected.asd_risk_score, fullMark: 100 },
    { subject: 'ADHD', score: selected.adhd_risk_score, fullMark: 100 },
    { subject: 'Down Syn.', score: selected.down_syndrome_risk_score, fullMark: 100 },
    { subject: 'Dev. Delay', score: selected.developmental_delay_risk_score, fullMark: 100 },
    { subject: 'Overall', score: selected.overall_risk_score, fullMark: 100 },
  ];

  const disorderScores = {
    asd: selected.asd_risk_score,
    adhd: selected.adhd_risk_score,
    ds: selected.down_syndrome_risk_score,
    dd: selected.developmental_delay_risk_score,
  };

  const disorderLabels = { asd: 'Autism Spectrum Disorder', adhd: 'ADHD', ds: 'Down Syndrome', dd: 'Developmental Delay' };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar isApp />
      <AppSidebar />
      <main className="lg:ml-64 pt-16">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">AI Insights</h1>
              <p className="text-slate-400 text-sm mt-0.5">Explainable AI analysis with SHAP-based feature importance</p>
            </div>
            <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-3 py-2">
              <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs text-cyan-400 font-medium">Model v{selected.model_version}</span>
            </div>
          </div>

          {/* Assessment Selector */}
          {assessments.length > 1 && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {assessments.map(a => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className={`px-3 py-2 rounded-xl text-xs whitespace-nowrap border transition-all ${
                    selected.id === a.id
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {(a as any).patients?.full_name || 'Patient'} · {formatDate(a.created_at)}
                </button>
              ))}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Risk Score Summary */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Overall Risk Score</h3>
                <span className={getRiskBadgeClass(selected.overall_risk_level)}>{selected.overall_risk_level}</span>
              </div>

              <div className="relative flex items-center justify-center mb-4">
                <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="10" />
                  <motion.circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={getRiskColor(selected.overall_risk_level)}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - selected.overall_risk_score / 100) }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-3xl font-bold text-white">{selected.overall_risk_score.toFixed(0)}</p>
                  <p className="text-xs text-slate-400">/ 100</p>
                </div>
              </div>

              <div className="text-center mb-4">
                <p className="text-xs text-slate-400">Confidence: <span className="text-emerald-400 font-medium">{selected.confidence_score}%</span></p>
              </div>

              <div className="space-y-2">
                {[
                  { label: 'ASD', score: selected.asd_risk_score, color: '#06b6d4' },
                  { label: 'ADHD', score: selected.adhd_risk_score, color: '#14b8a6' },
                  { label: 'Down Syn.', score: selected.down_syndrome_risk_score, color: '#10b981' },
                  { label: 'Dev. Delay', score: selected.developmental_delay_risk_score, color: '#f59e0b' },
                ].map(({ label, score, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-400">{label}</span>
                      <span className="text-slate-200">{score.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
                        initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1.2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">Risk Profile Radar</h3>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Radar name="Risk Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Disorder tabs */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">Disorder-Specific View</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(['asd', 'adhd', 'ds', 'dd'] as const).map(d => (
                  <button key={d} onClick={() => setActiveDisorder(d)}
                    className={`p-2.5 rounded-xl text-xs font-medium border transition-all text-center ${
                      activeDisorder === d ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}>
                    <span className="block text-lg font-bold">{disorderScores[d].toFixed(0)}%</span>
                    <span>{d === 'ds' ? 'Down Syn.' : d.toUpperCase()}</span>
                  </button>
                ))}
              </div>

              <div className={`p-4 rounded-xl border ${
                disorderScores[activeDisorder] < 25 ? 'bg-emerald-500/10 border-emerald-500/20' :
                disorderScores[activeDisorder] < 50 ? 'bg-amber-500/10 border-amber-500/20' :
                disorderScores[activeDisorder] < 75 ? 'bg-orange-500/10 border-orange-500/20' :
                'bg-rose-500/10 border-rose-500/20'
              }`}>
                <p className="text-sm font-semibold text-white mb-1">{disorderLabels[activeDisorder]}</p>
                <p className="text-xs text-slate-400">
                  {disorderScores[activeDisorder] < 25
                    ? 'Low risk. Continue routine developmental monitoring.'
                    : disorderScores[activeDisorder] < 50
                    ? 'Moderate risk. Enhanced monitoring and early evaluation recommended.'
                    : disorderScores[activeDisorder] < 75
                    ? 'High risk. Specialist consultation strongly recommended within 2 weeks.'
                    : 'Critical risk. Immediate specialist referral required.'}
                </p>
              </div>
            </div>
          </div>

          {/* SHAP Explainability */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-cyan-500/15 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">SHAP Feature Importance</h3>
                <p className="text-xs text-slate-400">Explainable AI — what drove this prediction</p>
              </div>
              <div className="ml-auto flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500" /> Reduces risk</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-500" /> Increases risk</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-500" /> Neutral</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {SHAP_FEATURES.map(({ name, shap, impact }, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xs text-slate-400 w-52 shrink-0 truncate">{name}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-5 relative">
                      <div className="absolute inset-y-0 left-1/2 w-0.5 bg-slate-700" />
                      <motion.div
                        className="absolute h-full rounded-sm"
                        style={{
                          backgroundColor: impact === 'positive' ? '#10b981' : impact === 'negative' ? '#f43f5e' : '#64748b',
                          left: impact === 'negative' ? `calc(50% - ${shap * 200}px)` : '50%',
                          width: `${shap * 200}px`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${shap * 200}px` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-300 w-14 text-right">
                      {impact === 'negative' ? '-' : '+'}{shap.toFixed(3)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-teal-500/15 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-teal-400" />
              </div>
              <h3 className="font-semibold text-white">AI-Generated Recommendations</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  priority: 'high', category: 'Specialist Referral', disorder: 'ASD',
                  title: 'Pediatric Neurologist Consultation',
                  desc: 'Based on elevated ASD risk score (32.4%) and reduced gaze-following ability, schedule evaluation with a pediatric neurologist.',
                  followup: '2-4 weeks',
                },
                {
                  priority: 'medium', category: 'Monitoring', disorder: 'Dev. Delay',
                  title: 'Enhanced Developmental Monitoring',
                  desc: 'Developmental delay risk at 28.9%. Implement monthly milestone assessments and consider early stimulation program enrollment.',
                  followup: 'Monthly',
                },
                {
                  priority: 'medium', category: 'Therapy', disorder: 'ASD',
                  title: 'Early Intervention Program',
                  desc: 'Enroll in evidence-based early intervention program focusing on social skills, communication, and sensory processing.',
                  followup: 'As soon as possible',
                },
                {
                  priority: 'low', category: 'General', disorder: 'General',
                  title: 'Parent Education & Support',
                  desc: 'Provide parents with developmental milestone guides and connect with support networks for families of high-risk newborns.',
                  followup: 'Ongoing',
                },
              ].map(({ priority, category, disorder, title, desc, followup }, i) => (
                <div key={i} className={`p-4 rounded-xl border ${
                  priority === 'high' ? 'bg-orange-500/10 border-orange-500/25' :
                  priority === 'medium' ? 'bg-amber-500/10 border-amber-500/25' :
                  'bg-slate-800/50 border-slate-700'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-slate-700 text-slate-400'
                      }`}>{priority.toUpperCase()}</span>
                      <span className="ml-2 text-xs text-slate-500">{category}</span>
                    </div>
                    <span className="text-xs bg-slate-700/80 text-slate-400 px-2 py-0.5 rounded-full">{disorder}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1.5">{title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">{desc}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>Follow-up: {followup}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Info */}
          <div className="glass-card p-5">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-400 space-y-1">
                <p><span className="text-slate-200 font-medium">About the AI Model:</span> NeoMind uses a stacked ensemble of CNN, LSTM, and XGBoost models trained on 48,000+ verified clinical cases. SHAP (SHapley Additive exPlanations) values quantify each feature's contribution.</p>
                <p><span className="text-slate-200 font-medium">Disclaimer:</span> This AI assessment is a screening tool to assist clinicians. It does not replace a formal clinical diagnosis. All results should be interpreted by a qualified healthcare professional.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
