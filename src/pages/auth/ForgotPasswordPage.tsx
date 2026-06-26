import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, AlertCircle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-cyan-500/8 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">Neo</span>
              <span className="text-xl font-bold text-cyan-400">Mind</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-slate-400 text-sm mt-1">
            {sent ? 'Check your email for reset instructions' : "Enter your email and we'll send a reset link"}
          </p>
        </div>

        <div className="glass-card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Email Sent!</h3>
              <p className="text-sm text-slate-400 mb-6">
                We've sent password reset instructions to <span className="text-cyan-400">{email}</span>.
                Please check your inbox.
              </p>
              <Link to="/login" className="btn-primary w-full justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="doctor@hospital.com"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full gap-2 disabled:opacity-60">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
              </button>
              <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
