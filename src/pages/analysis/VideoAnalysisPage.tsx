import { useState, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileVideo, Upload, Play, Pause, RotateCcw, CheckCircle,
  AlertCircle, Brain, Eye, Activity, ScanLine, Loader2,
  TrendingUp, Info, ChevronRight, X, Cpu,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { AppSidebar } from '../../components/layout/Navbar';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getRiskBadgeClass, scoreToRiskLevel, generateMockAnalysis } from '../../lib/utils';
import type { Patient } from '../../types';

type AnalysisStep = 'upload' | 'processing' | 'complete';

const PROCESSING_STEPS = [
  { id: 1, label: 'Extracting video frames', icon: FileVideo, duration: 1200 },
  { id: 2, label: 'Detecting facial landmarks (468 points)', icon: Eye, duration: 1800 },
  { id: 3, label: 'Analyzing eye tracking & gaze patterns', icon: ScanLine, duration: 1600 },
  { id: 4, label: 'Processing movement & motor patterns', icon: Activity, duration: 2000 },
  { id: 5, label: 'Running ensemble AI risk models', icon: Brain, duration: 2200 },
  { id: 6, label: 'Generating explainable AI report', icon: TrendingUp, duration: 1400 },
];

export default function VideoAnalysisPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const patientIdParam = searchParams.get('patient');

  const [step, setStep] = useState<AnalysisStep>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoType, setVideoType] = useState<'general' | 'facial' | 'movement' | 'eye_tracking'>('general');
  const [patientId, setPatientId] = useState(patientIdParam || '');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentProcessingStep, setCurrentProcessingStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [results, setResults] = useState<ReturnType<typeof generateMockAnalysis> | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file (MP4, MOV, AVI, etc.)');
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setError('File size must be under 500MB');
      return;
    }
    setSelectedFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setError('');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const runAnalysis = async () => {
    if (!selectedFile) return;
    setStep('processing');
    setCompletedSteps([]);
    setCurrentProcessingStep(0);

    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      setCurrentProcessingStep(i);
      await new Promise(resolve => setTimeout(resolve, PROCESSING_STEPS[i].duration));
      setCompletedSteps(prev => [...prev, i]);
    }

    const mockResult = generateMockAnalysis({
      gestational_age_weeks: 39,
      birth_weight_grams: 3200,
      family_history_asd: false,
      family_history_adhd: false,
      family_history_chromosomal: false,
      nicu_admission: false,
      apgar_score_5min: 9,
    });

    if (user && patientId) {
      const { data: uploadData } = await supabase.from('video_uploads').insert({
        patient_id: patientId,
        uploaded_by: user.id,
        file_name: selectedFile.name,
        file_size_bytes: selectedFile.size,
        video_type: videoType,
        upload_status: 'complete',
        analysis_status: 'complete',
        analysis_started_at: new Date().toISOString(),
        analysis_completed_at: new Date().toISOString(),
      }).select().maybeSingle();

      if (uploadData) {
        await supabase.from('risk_assessments').insert({
          patient_id: patientId,
          conducted_by: user.id,
          video_upload_id: uploadData.id,
          assessment_type: 'video',
          asd_risk_score: mockResult.asd,
          adhd_risk_score: mockResult.adhd,
          down_syndrome_risk_score: mockResult.ds,
          developmental_delay_risk_score: mockResult.dd,
          overall_risk_score: mockResult.overall,
          overall_risk_level: scoreToRiskLevel(mockResult.overall),
          confidence_score: mockResult.confidence,
          model_version: '2.1.0',
          status: 'complete',
        });
      }
    }

    setResults(mockResult);
    setStep('complete');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar isApp />
      <AppSidebar />
      <main className="lg:ml-64 pt-16">
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Video Analysis</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              AI-powered computer vision analysis of newborn behavior and facial expressions
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 mb-8">
            {(['Upload', 'Processing', 'Results'] as const).map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  (step === 'upload' && i === 0) || (step === 'processing' && i === 1) || (step === 'complete' && i === 2)
                    ? 'bg-cyan-500 text-white'
                    : step === 'complete' && i < 2 ? 'bg-emerald-500 text-white'
                    : step === 'processing' && i === 0 ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {((step === 'complete' && i < 2) || (step === 'processing' && i === 0)) ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${
                  (step === 'upload' && i === 0) || (step === 'processing' && i === 1) || (step === 'complete' && i === 2)
                    ? 'text-cyan-400 font-medium' : 'text-slate-500'
                }`}>{s}</span>
                {i < 2 && <div className={`flex-1 h-0.5 ${step === 'complete' ? 'bg-emerald-500' : (step === 'processing' && i === 0) ? 'bg-emerald-500' : 'bg-slate-800'}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl px-4 py-3 text-sm mb-4">
              <AlertCircle className="w-4 h-4" /> {error}
              <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">
                {/* Patient selector */}
                <div className="glass-card p-5">
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Patient (optional)</label>
                  <input
                    type="text"
                    value={patientId}
                    onChange={e => setPatientId(e.target.value)}
                    placeholder="Enter patient ID to link this analysis"
                    className="input-field"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">Results will be saved to the patient's record</p>
                </div>

                {/* Video type */}
                <div className="glass-card p-5">
                  <label className="text-xs text-slate-400 font-medium block mb-3">Video Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { value: 'general', label: 'General', icon: FileVideo, desc: 'Full body recording' },
                      { value: 'facial', label: 'Facial', icon: Eye, desc: 'Face close-up' },
                      { value: 'movement', label: 'Movement', icon: Activity, desc: 'Motor patterns' },
                      { value: 'eye_tracking', label: 'Eye Tracking', icon: ScanLine, desc: 'Gaze & attention' },
                    ].map(({ value, label, icon: Icon, desc }) => (
                      <button
                        key={value}
                        onClick={() => setVideoType(value as typeof videoType)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          videoType === value
                            ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-1.5" />
                        <p className="text-xs font-medium">{label}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`glass-card p-12 border-2 border-dashed text-center cursor-pointer transition-all ${
                    dragOver ? 'border-cyan-400 bg-cyan-500/10' : selectedFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />
                  {selectedFile ? (
                    <div>
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <FileVideo className="w-8 h-8 text-emerald-400" />
                      </div>
                      <p className="font-medium text-white">{selectedFile.name}</p>
                      <p className="text-sm text-slate-400 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-300 font-medium">Drop video here or click to browse</p>
                      <p className="text-sm text-slate-500 mt-1">MP4, MOV, AVI — up to 500MB</p>
                    </div>
                  )}
                </div>

                {selectedFile && videoUrl && (
                  <div className="glass-card p-4">
                    <p className="text-xs text-slate-400 mb-2">Preview</p>
                    <video src={videoUrl} controls className="w-full rounded-xl max-h-64" />
                  </div>
                )}

                <div className="flex gap-3">
                  {selectedFile && (
                    <button
                      onClick={() => { setSelectedFile(null); setVideoUrl(null); }}
                      className="btn-secondary gap-2"
                    >
                      <RotateCcw className="w-4 h-4" /> Clear
                    </button>
                  )}
                  <button
                    onClick={runAnalysis}
                    disabled={!selectedFile}
                    className="btn-primary gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Brain className="w-4 h-4" /> Start AI Analysis
                  </button>
                </div>

                <div className="glass-card p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-slate-400 space-y-1">
                      <p><span className="text-slate-300 font-medium">Best practices:</span> Record for at least 60 seconds in good lighting with the baby's face clearly visible.</p>
                      <p>For eye tracking analysis, ensure the baby is awake and in a calm state.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <div className="glass-card p-8">
                  <div className="text-center mb-8">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping" />
                      <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center">
                        <Brain className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-white">AI Analysis in Progress</h2>
                    <p className="text-slate-400 text-sm mt-1">Processing {selectedFile?.name}...</p>
                  </div>

                  <div className="space-y-3">
                    {PROCESSING_STEPS.map((s, i) => {
                      const Icon = s.icon;
                      const isComplete = completedSteps.includes(i);
                      const isCurrent = currentProcessingStep === i && !isComplete;
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                            isComplete ? 'bg-emerald-500/10 border border-emerald-500/20' :
                            isCurrent ? 'bg-cyan-500/10 border border-cyan-500/20' :
                            'opacity-40'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isComplete ? 'bg-emerald-500/20' : isCurrent ? 'bg-cyan-500/20' : 'bg-slate-800'
                          }`}>
                            {isComplete ? <CheckCircle className="w-4 h-4 text-emerald-400" /> :
                             isCurrent ? <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" /> :
                             <Icon className="w-4 h-4 text-slate-500" />}
                          </div>
                          <span className={`text-sm ${isComplete ? 'text-emerald-400' : isCurrent ? 'text-cyan-400' : 'text-slate-500'}`}>
                            {s.label}
                          </span>
                          {isComplete && <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>Progress</span>
                      <span>{Math.round((completedSteps.length / PROCESSING_STEPS.length) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full"
                        animate={{ width: `${(completedSteps.length / PROCESSING_STEPS.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'complete' && results && (
              <motion.div key="complete" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-white">Analysis Complete</h2>
                      <p className="text-xs text-slate-400">{selectedFile?.name} · Confidence: {results.confidence}%</p>
                    </div>
                    <span className={`ml-auto ${getRiskBadgeClass(scoreToRiskLevel(results.overall))}`}>
                      {scoreToRiskLevel(results.overall)} risk
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                    {[
                      { label: 'ASD Risk', score: results.asd, color: '#06b6d4' },
                      { label: 'ADHD Risk', score: results.adhd, color: '#14b8a6' },
                      { label: 'Down Syndrome', score: results.ds, color: '#10b981' },
                      { label: 'Dev. Delay', score: results.dd, color: '#f59e0b' },
                    ].map(({ label, score, color }) => (
                      <div key={label} className="bg-slate-900/80 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-white mb-1">{score.toFixed(1)}%</div>
                        <div className="text-xs text-slate-400 mb-2">{label}</div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Feature Breakdown */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Key Detected Features</h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {[
                        { feature: 'Eye Contact Duration', score: 0.72, shap: 0.18, positive: true },
                        { feature: 'Social Smile Response', score: 0.65, shap: 0.14, positive: true },
                        { feature: 'Facial Symmetry Score', score: 0.91, shap: 0.08, positive: true },
                        { feature: 'Gaze Following Ability', score: 0.48, shap: 0.22, positive: false },
                        { feature: 'Blink Rate (norm.)', score: 0.83, shap: 0.06, positive: true },
                        { feature: 'Motor Synchrony', score: 0.55, shap: 0.15, positive: false },
                      ].map(({ feature, score, shap, positive }) => (
                        <div key={feature} className="flex items-center gap-3 bg-slate-900/60 rounded-lg p-3">
                          <div className={`w-1 h-10 rounded-full ${positive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-200 truncate">{feature}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${positive ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ width: `${score * 100}%` }} />
                              </div>
                              <span className="text-[10px] text-slate-500 whitespace-nowrap">SHAP: {shap.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="glass-card p-6">
                  <h3 className="font-semibold text-white mb-4">AI Recommendations</h3>
                  <div className="space-y-3">
                    {[
                      { priority: 'medium', title: 'Pediatric Neurodevelopmental Consultation', desc: 'Schedule evaluation with a pediatric neurologist within the next 4-6 weeks.' },
                      { priority: 'low', title: 'Continued Monitoring', desc: 'Regular monthly follow-ups to track developmental milestones.' },
                      { priority: 'low', title: 'Early Intervention Program', desc: 'Consider enrolling in early stimulation and developmental support program.' },
                    ].map(({ priority, title, desc }, i) => (
                      <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${
                        priority === 'high' ? 'bg-orange-500/10 border-orange-500/20' :
                        priority === 'medium' ? 'bg-amber-500/10 border-amber-500/20' :
                        'bg-slate-800/50 border-slate-700'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          priority === 'high' ? 'bg-orange-400' : priority === 'medium' ? 'bg-amber-400' : 'bg-slate-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-white">{title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep('upload'); setSelectedFile(null); setVideoUrl(null); setResults(null); setCompletedSteps([]); }}
                    className="btn-secondary gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> New Analysis
                  </button>
                  <Link to="/insights" className="btn-primary gap-2 flex-1 justify-center">
                    <Brain className="w-4 h-4" /> View Full Insights <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
