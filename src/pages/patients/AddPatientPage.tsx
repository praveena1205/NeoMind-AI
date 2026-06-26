import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Baby, CheckCircle, AlertCircle, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { AppSidebar } from '../../components/layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { generatePatientCode } from '../../lib/utils';

const steps = ['Patient Info', 'Birth Details', 'Family History', 'Clinical Notes'];

export default function AddPatientPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'unknown',
    gestational_age_weeks: 40,
    birth_weight_grams: 3200,
    apgar_score_1min: '',
    apgar_score_5min: '',
    delivery_type: 'vaginal',
    nicu_admission: false,
    nicu_duration_days: 0,
    family_history_asd: false,
    family_history_adhd: false,
    family_history_chromosomal: false,
    maternal_age: '',
    maternal_health_notes: '',
    notes: '',
  });

  const update = (field: string, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    const payload = {
      clinician_id: user!.id,
      patient_code: generatePatientCode(),
      full_name: form.full_name,
      date_of_birth: form.date_of_birth,
      gender: form.gender,
      gestational_age_weeks: Number(form.gestational_age_weeks),
      birth_weight_grams: Number(form.birth_weight_grams),
      apgar_score_1min: form.apgar_score_1min ? Number(form.apgar_score_1min) : null,
      apgar_score_5min: form.apgar_score_5min ? Number(form.apgar_score_5min) : null,
      delivery_type: form.delivery_type,
      nicu_admission: form.nicu_admission,
      nicu_duration_days: Number(form.nicu_duration_days),
      family_history_asd: form.family_history_asd,
      family_history_adhd: form.family_history_adhd,
      family_history_chromosomal: form.family_history_chromosomal,
      maternal_age: form.maternal_age ? Number(form.maternal_age) : null,
      maternal_health_notes: form.maternal_health_notes,
      notes: form.notes,
    };

    const { data, error: err } = await supabase.from('patients').insert(payload).select().maybeSingle();
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate(data ? `/patients/${data.id}` : '/patients'), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar isApp />
      <AppSidebar />
      <main className="lg:ml-64 pt-16">
        <div className="p-6 lg:p-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/patients" className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Add New Patient</h1>
              <p className="text-slate-400 text-sm">Register a newborn for AI screening</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-500'
                }`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? 'text-cyan-400 font-medium' : 'text-slate-500'}`}>{s}</span>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-emerald-500' : 'bg-slate-800'}`} />}
              </div>
            ))}
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-12 text-center"
            >
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Patient Registered!</h3>
              <p className="text-slate-400 text-sm">Redirecting to patient profile...</p>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-8"
            >
              {error && (
                <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl px-4 py-3 text-sm mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              {step === 0 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-cyan-500/15 rounded-xl flex items-center justify-center">
                      <Baby className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-white">Patient Information</h2>
                      <p className="text-xs text-slate-400">Basic newborn details</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1.5">Full Name *</label>
                    <input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)}
                      placeholder="Baby's full name" className="input-field" required />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1.5">Date of Birth *</label>
                      <input type="date" value={form.date_of_birth} onChange={e => update('date_of_birth', e.target.value)}
                        className="input-field" required />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1.5">Gender</label>
                      <select value={form.gender} onChange={e => update('gender', e.target.value)} className="input-field">
                        <option value="unknown">Unknown</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-teal-500/15 rounded-xl flex items-center justify-center">
                      <Baby className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-white">Birth Details</h2>
                      <p className="text-xs text-slate-400">Clinical birth information</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1.5">Gestational Age (weeks)</label>
                      <input type="number" value={form.gestational_age_weeks} onChange={e => update('gestational_age_weeks', e.target.value)}
                        min={22} max={45} className="input-field" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1.5">Birth Weight (grams)</label>
                      <input type="number" value={form.birth_weight_grams} onChange={e => update('birth_weight_grams', e.target.value)}
                        min={400} max={6000} className="input-field" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1.5">APGAR Score (1 min)</label>
                      <input type="number" value={form.apgar_score_1min} onChange={e => update('apgar_score_1min', e.target.value)}
                        min={0} max={10} placeholder="0-10" className="input-field" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1.5">APGAR Score (5 min)</label>
                      <input type="number" value={form.apgar_score_5min} onChange={e => update('apgar_score_5min', e.target.value)}
                        min={0} max={10} placeholder="0-10" className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1.5">Delivery Type</label>
                    <select value={form.delivery_type} onChange={e => update('delivery_type', e.target.value)} className="input-field">
                      <option value="vaginal">Vaginal</option>
                      <option value="cesarean">Cesarean</option>
                      <option value="assisted">Assisted (Forceps/Vacuum)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.nicu_admission} onChange={e => update('nicu_admission', e.target.checked)}
                        className="w-4 h-4 accent-cyan-500" />
                      <span className="text-sm text-slate-300">NICU Admission</span>
                    </label>
                    {form.nicu_admission && (
                      <div className="flex items-center gap-2">
                        <input type="number" value={form.nicu_duration_days} onChange={e => update('nicu_duration_days', e.target.value)}
                          min={0} max={365} placeholder="Days" className="input-field w-24" />
                        <span className="text-xs text-slate-400">days</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                      <Baby className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-white">Family History</h2>
                      <p className="text-xs text-slate-400">Genetic and family risk factors</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { key: 'family_history_asd', label: 'Family History of ASD (Autism)', desc: 'Parent or sibling with ASD diagnosis' },
                      { key: 'family_history_adhd', label: 'Family History of ADHD', desc: 'Parent or sibling with ADHD diagnosis' },
                      { key: 'family_history_chromosomal', label: 'Family History of Chromosomal Disorders', desc: 'Down Syndrome or other chromosomal conditions' },
                    ].map(({ key, label, desc }) => (
                      <label key={key} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        form[key as keyof typeof form]
                          ? 'bg-cyan-500/10 border-cyan-500/30'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }`}>
                        <input
                          type="checkbox"
                          checked={form[key as keyof typeof form] as boolean}
                          onChange={e => update(key, e.target.checked)}
                          className="w-4 h-4 accent-cyan-500 mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium text-white">{label}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1.5">Maternal Age</label>
                    <input type="number" value={form.maternal_age} onChange={e => update('maternal_age', e.target.value)}
                      min={10} max={70} placeholder="Mother's age" className="input-field" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-slate-700/50 rounded-xl flex items-center justify-center">
                      <Baby className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-white">Clinical Notes</h2>
                      <p className="text-xs text-slate-400">Additional context for AI analysis</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1.5">Maternal Health Notes</label>
                    <textarea value={form.maternal_health_notes} onChange={e => update('maternal_health_notes', e.target.value)}
                      rows={3} placeholder="Gestational diabetes, hypertension, medications, etc."
                      className="input-field resize-none" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1.5">Additional Notes</label>
                    <textarea value={form.notes} onChange={e => update('notes', e.target.value)}
                      rows={4} placeholder="Any additional clinical observations or concerns..."
                      className="input-field resize-none" />
                  </div>
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                    <p className="text-sm text-cyan-300 font-medium mb-1">Ready to register?</p>
                    <p className="text-xs text-slate-400">After registering, you can upload videos and audio recordings for AI analysis.</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="btn-secondary gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                {step < steps.length - 1 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={step === 0 && (!form.full_name || !form.date_of_birth)}
                    className="btn-primary gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-primary gap-2 disabled:opacity-60"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</> : 'Register Patient'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
