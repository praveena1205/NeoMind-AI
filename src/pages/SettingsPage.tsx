import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Save, CheckCircle, Loader2, Mail, Phone, Building } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { AppSidebar } from '../components/layout/Navbar';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const { profile, updateProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    specialty: profile?.specialty || '',
    institution: profile?.institution || '',
    phone: profile?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setLoading(true);
    const { error } = await updateProfile(form);
    setLoading(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar isApp />
      <AppSidebar />
      <main className="lg:ml-64 pt-16">
        <div className="p-6 lg:p-8 max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-slate-400 text-sm mt-0.5">Manage your account and preferences</p>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-cyan-500/15 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Profile Information</h2>
                  <p className="text-xs text-slate-400">Update your personal details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)}
                      className="input-field pl-10" placeholder="Your full name" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="email" value={profile?.email || ''} disabled
                      className="input-field pl-10 opacity-50 cursor-not-allowed" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1.5">Specialty</label>
                    <input type="text" value={form.specialty} onChange={e => update('specialty', e.target.value)}
                      className="input-field" placeholder="e.g. Pediatric Neurology" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1.5">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                        className="input-field pl-10" placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Institution</label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" value={form.institution} onChange={e => update('institution', e.target.value)}
                      className="input-field pl-10" placeholder="Hospital or clinic name" />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button onClick={handleSave} disabled={loading}
                  className="btn-primary gap-2 disabled:opacity-60">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> :
                   saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> :
                   <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
                {saved && <span className="text-xs text-emerald-400">Profile updated successfully</span>}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-teal-500/15 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Account Security</h2>
                  <p className="text-xs text-slate-400">Manage your security settings</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Account Role', value: profile?.role || 'clinician', badge: true },
                  { label: 'Two-Factor Authentication', value: 'Not enabled', badge: false },
                  { label: 'Last Sign-in', value: 'Today', badge: false },
                ].map(({ label, value, badge }) => (
                  <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60">
                    <span className="text-sm text-slate-300">{label}</span>
                    {badge ? (
                      <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full capitalize">{value}</span>
                    ) : (
                      <span className="text-xs text-slate-400">{value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-slate-700/50 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Notifications</h2>
                  <p className="text-xs text-slate-400">Configure alert preferences</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'High-risk assessment alerts', desc: 'Get notified when a critical risk is detected', enabled: true },
                  { label: 'Analysis completion', desc: 'Email when AI analysis finishes', enabled: true },
                  { label: 'Weekly summary reports', desc: 'Weekly digest of your patient portfolio', enabled: false },
                  { label: 'System updates', desc: 'Platform updates and new features', enabled: false },
                ].map(({ label, desc, enabled: defaultEnabled }, i) => {
                  const [enabled, setEnabled] = useState(defaultEnabled);
                  return (
                    <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60">
                      <div>
                        <p className="text-sm text-slate-200">{label}</p>
                        <p className="text-xs text-slate-500">{desc}</p>
                      </div>
                      <button
                        onClick={() => setEnabled(!enabled)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${enabled ? 'bg-cyan-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
