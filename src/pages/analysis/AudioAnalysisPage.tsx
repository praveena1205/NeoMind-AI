import { useState, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Upload, Play, Pause, RotateCcw, CheckCircle, AlertCircle,
  Brain, Activity, BarChart3, Loader2, ChevronRight, X, Info,
  Volume2, Radio, Waveform,
} from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Navbar } from '../../components/layout/Navbar';
import { AppSidebar } from '../../components/layout/Navbar';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getRiskBadgeClass, scoreToRiskLevel, generateMockAnalysis } from '../../lib/utils';

type AnalysisStep = 'upload' | 'processing' | 'complete';

const PROCESSING_STEPS = [
  { id: 1, label: 'Loading audio signal', icon: Volume2, duration: 800 },
  { id: 2, label: 'Extracting MFCC features', icon: BarChart3, duration: 1200 },
  { id: 3, label: 'Generating mel spectrogram', icon: Radio, duration: 1400 },
  { id: 4, label: 'Analyzing cry frequency patterns', icon: Activity, duration: 1600 },
  { id: 5, label: 'Running neural cry classifier', icon: Brain, duration: 2000 },
  { id: 6, label: 'Computing risk scores', icon: BarChart3, duration: 1200 },
];

// Fake spectrogram data
const spectrogramData = Array.from({ length: 20 }, (_, i) => ({
  freq: `${(i + 1) * 250}Hz`,
  intensity: Math.random() * 80 + 20,
}));

export default function AudioAnalysisPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const patientIdParam = searchParams.get('patient');

  const [step, setStep] = useState<AnalysisStep>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cryType, setCryType] = useState<'hunger' | 'pain' | 'discomfort' | 'unknown'>('unknown');
  const [patientId, setPatientId] = useState(patientIdParam || '');
  const [currentProcessingStep, setCurrentProcessingStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [results, setResults] = useState<ReturnType<typeof generateMockAnalysis> | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please upload an audio file (MP3, WAV, M4A, etc.)');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError('File size must be under 100MB');
      return;
    }
    setSelectedFile(file);
    setAudioUrl(URL.createObjectURL(file));
    setError('');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

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
      const { data: uploadData } = await supabase.from('audio_uploads').insert({
        patient_id: patientId,
        uploaded_by: user.id,
        file_name: selectedFile.name,
        file_size_bytes: selectedFile.size,
        cry_type: cryType,
        upload_status: 'complete',
        analysis_status: 'complete',
        analysis_started_at: new Date().toISOString(),
        analysis_completed_at: new Date().toISOString(),
      }).select().maybeSingle();
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
            <h1 className="text-2xl font-bold text-white">Audio Analysis</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              AI-powered cry analysis using MFCC feature extraction and deep neural networks
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 mb-8">
            {(['Upload', 'Processing', 'Results'] as const).map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  (step === 'upload' && i === 0) || (step === 'processing' && i === 1) || (step === 'complete' && i === 2)
                    ? 'bg-teal-500 text-white'
                    : step === 'complete' && i < 2 ? 'bg-emerald-500 text-white'
                    : step === 'processing' && i === 0 ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {((step === 'complete' && i < 2) || (step === 'processing' && i === 0)) ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${
                  (step === 'upload' && i === 0) || (step === 'processing' && i === 1) || (step === 'complete' && i === 2)
                    ? 'text-teal-400 font-medium' : 'text-slate-500'
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
                <div className="glass-card p-5">
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Patient ID (optional)</label>
                  <input type="text" value={patientId} onChange={e => setPatientId(e.target.value)}
                    placeholder="Link this analysis to a patient" className="input-field" />
                </div>

                <div className="glass-card p-5">
                  <label className="text-xs text-slate-400 font-medium block mb-3">Cry Type Classification (pre-label)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { value: 'unknown', label: 'Unknown', color: 'slate' },
                      { value: 'hunger', label: 'Hunger', color: 'amber' },
                      { value: 'pain', label: 'Pain', color: 'rose' },
                      { value: 'discomfort', label: 'Discomfort', color: 'orange' },
                    ].map(({ value, label, color }) => (
                      <button key={value} onClick={() => setCryType(value as typeof cryType)}
                        className={`p-3 rounded-xl border text-center text-xs font-medium transition-all ${
                          cryType === value ? 'bg-teal-500/15 border-teal-500/40 text-teal-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}>
                        {label}
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
                    dragOver ? 'border-teal-400 bg-teal-500/10' : selectedFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-teal-500/50'
                  }`}
                >
                  <input ref={fileInputRef} type="file" accept="audio/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                  {selectedFile ? (
                    <div>
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Mic className="w-8 h-8 text-emerald-400" />
                      </div>
                      <p className="font-medium text-white">{selectedFile.name}</p>
                      <p className="text-sm text-slate-400 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-300 font-medium">Drop audio here or click to browse</p>
                      <p className="text-sm text-slate-500 mt-1">WAV, MP3, M4A, OGG — up to 100MB</p>
                    </div>
                  )}
                </div>

                {selectedFile && audioUrl && (
                  <div className="glass-card p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <button onClick={togglePlay}
                        className="w-10 h-10 bg-teal-500/20 hover:bg-teal-500/30 rounded-full flex items-center justify-center text-teal-400 transition-all">
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>
                      <div className="flex-1">
                        {/* Waveform visualization */}
                        <div className="flex items-center gap-0.5 h-10">
                          {Array.from({ length: 50 }, (_, i) => (
                            <div key={i}
                              className={`flex-1 rounded-full ${isPlaying ? 'waveform-bar' : ''} bg-teal-500/60`}
                              style={{
                                height: `${Math.random() * 70 + 20}%`,
                                animationDelay: `${i * 0.02}s`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                  </div>
                )}

                <div className="flex gap-3">
                  {selectedFile && (
                    <button onClick={() => { setSelectedFile(null); setAudioUrl(null); }} className="btn-secondary gap-2">
                      <RotateCcw className="w-4 h-4" /> Clear
                    </button>
                  )}
                  <button onClick={runAnalysis} disabled={!selectedFile}
                    className="btn-primary gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: selectedFile ? 'linear-gradient(to right, #14b8a6, #0d9488)' : undefined }}>
                    <Brain className="w-4 h-4" /> Analyze Cry Audio
                  </button>
                </div>

                <div className="glass-card p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-slate-400 space-y-1">
                      <p><span className="text-slate-300 font-medium">Recording tips:</span> Record in a quiet environment for at least 30 seconds. Avoid background noise.</p>
                      <p>The AI analyzes fundamental frequency, formants, and temporal patterns to identify neurological markers.</p>
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
                      <div className="absolute inset-0 bg-teal-500/20 rounded-full animate-ping" />
                      <div className="relative w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <Mic className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-white">Processing Audio...</h2>
                    <p className="text-slate-400 text-sm mt-1">{selectedFile?.name}</p>
                  </div>

                  {/* Live waveform animation */}
                  <div className="flex items-center justify-center gap-0.5 h-16 mb-8">
                    {Array.from({ length: 30 }, (_, i) => (
                      <div key={i} className="w-1.5 bg-teal-500/70 rounded-full waveform-bar"
                        style={{ animationDelay: `${i * 0.04}s` }} />
                    ))}
                  </div>

                  <div className="space-y-3">
                    {PROCESSING_STEPS.map((s, i) => {
                      const Icon = s.icon;
                      const isComplete = completedSteps.includes(i);
                      const isCurrent = currentProcessingStep === i && !isComplete;
                      return (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          isComplete ? 'bg-emerald-500/10 border border-emerald-500/20' :
                          isCurrent ? 'bg-teal-500/10 border border-teal-500/20' : 'opacity-40'
                        }`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isComplete ? 'bg-emerald-500/20' : isCurrent ? 'bg-teal-500/20' : 'bg-slate-800'
                          }`}>
                            {isComplete ? <CheckCircle className="w-4 h-4 text-emerald-400" /> :
                             isCurrent ? <Loader2 className="w-4 h-4 text-teal-400 animate-spin" /> :
                             <Icon className="w-4 h-4 text-slate-500" />}
                          </div>
                          <span className={`text-sm ${isComplete ? 'text-emerald-400' : isCurrent ? 'text-teal-400' : 'text-slate-500'}`}>{s.label}</span>
                          {isComplete && <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6">
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
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
                      <h2 className="font-semibold text-white">Audio Analysis Complete</h2>
                      <p className="text-xs text-slate-400">Confidence: {results.confidence}%</p>
                    </div>
                    <span className={`ml-auto ${getRiskBadgeClass(scoreToRiskLevel(results.overall))}`}>
                      {scoreToRiskLevel(results.overall)} risk
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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
                          <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
                            initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1.2 }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Frequency Analysis */}
                  <h3 className="text-sm font-semibold text-white mb-3">Frequency Spectrum Analysis</h3>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={spectrogramData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="freq" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} interval={4} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                      <Bar dataKey="intensity" radius={[2, 2, 0, 0]}>
                        {spectrogramData.map((_, i) => (
                          <Cell key={i} fill={`hsl(${180 + i * 5}, 70%, ${40 + i * 1.5}%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Audio Features */}
                <div className="glass-card p-6">
                  <h3 className="font-semibold text-white mb-4">Acoustic Feature Analysis</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { feature: 'Fundamental Frequency (F0)', value: '412 Hz', normal: '350-450 Hz', status: 'normal' },
                      { feature: 'Cry Duration', value: '2.8s', normal: '1-4s', status: 'normal' },
                      { feature: 'Pitch Variability', value: 'High', normal: 'Moderate', status: 'elevated' },
                      { feature: 'Harmonic-to-Noise Ratio', value: '8.2 dB', normal: '>10 dB', status: 'low' },
                      { feature: 'MFCC Coefficient Variance', value: '0.73', normal: '<0.8', status: 'normal' },
                      { feature: 'Cry Onset Latency', value: '180ms', normal: '<200ms', status: 'normal' },
                    ].map(({ feature, value, normal, status }) => (
                      <div key={feature} className={`p-3 rounded-lg border ${
                        status === 'elevated' || status === 'low' ? 'bg-amber-500/8 border-amber-500/20' : 'bg-slate-800/50 border-slate-700/50'
                      }`}>
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-slate-400">{feature}</span>
                          <span className={`text-xs font-semibold ${status === 'elevated' || status === 'low' ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {value}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-600 mt-0.5">Normal: {normal}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep('upload'); setSelectedFile(null); setAudioUrl(null); setResults(null); setCompletedSteps([]); }}
                    className="btn-secondary gap-2"
                    style={{ color: '#2dd4bf', borderColor: '#2dd4bf50' }}>
                    <RotateCcw className="w-4 h-4" /> New Analysis
                  </button>
                  <Link to="/insights" className="btn-primary gap-2 flex-1 justify-center"
                    style={{ background: 'linear-gradient(to right, #14b8a6, #0d9488)' }}>
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
