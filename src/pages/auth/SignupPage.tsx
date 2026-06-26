import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, Eye, EyeOff, User, Stethoscope, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'clinician',
    specialty: '',
    institution: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const update = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const passwordStrength = () => {
    const p = formData.password;
    if (p.length === 0) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-rose-500', 'bg-amber-500', 'bg-teal-500', 'bg-emerald-500'];
  const ps = passwordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    const { error } = await signUp(formData.email, formData.password, formData.fullName, formData.role);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4 py-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">Neo</span>
              <span className="text-xl font-bold text-cyan-400">Mind</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Join 200+ healthcare institutions</p>
        </div>

        <div className="glass-card p-8">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Account Created!</h3>
              <p className="text-slate-400 text-sm">Redirecting to your dashboard...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl px-4 py-3 text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </motion.div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={e => update('fullName', e.target.value)}
                      placeholder="Dr. Jane Smith"
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Role</label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
                    <select
                      value={formData.role}
                      onChange={e => update('role', e.target.value)}
                      className="input-field pl-10 appearance-none"
                    >
                      <option value="clinician">Clinician</option>
                      <option value="researcher">Researcher</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => update('email', e.target.value)}
                    placeholder="doctor@hospital.com"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Specialty (optional)</label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={e => update('specialty', e.target.value)}
                    placeholder="Pediatric Neurology"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Institution (optional)</label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={e => update('institution', e.target.value)}
                    placeholder="Hospital / Clinic"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => update('password', e.target.value)}
                    placeholder="Min. 8 characters"
                    className="input-field pl-10 pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i <= ps ? strengthColors[ps] : 'bg-slate-700'} transition-all`} />
                      ))}
                    </div>
                    <p className={`text-xs mt-1 ${ps <= 1 ? 'text-rose-400' : ps === 2 ? 'text-amber-400' : ps === 3 ? 'text-teal-400' : 'text-emerald-400'}`}>
                      {strengthLabels[ps]}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={e => update('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 gap-2 disabled:opacity-60">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
              </button>

              <p className="text-xs text-slate-500 text-center">
                By signing up, you agree to our{' '}
                <a href="#" className="text-cyan-400 hover:text-cyan-300">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</a>.
              </p>
            </form>
          )}

          {!success && (
            <>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-xs text-slate-500 bg-slate-800/80 rounded">or</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Sign in</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
