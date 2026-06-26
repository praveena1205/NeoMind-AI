import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, ShieldCheck, Activity, Database, AlertTriangle,
  TrendingUp, CheckCircle, Clock, Eye, Lock, Trash2,
  Search, Filter, Settings, BarChart3, Loader2, Download,
} from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Navbar } from '../../components/layout/Navbar';
import { AppSidebar } from '../../components/layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { formatDate, formatDateTime } from '../../lib/utils';
import type { Profile } from '../../types';

const DEMO_USERS: Profile[] = [
  { id: '1', email: 'dr.chen@hospital.com', full_name: 'Dr. Sarah Chen', role: 'clinician', specialty: 'Pediatric Neurology', institution: 'UCSF', phone: '', avatar_url: '', is_active: true, created_at: '2026-01-15T09:00:00Z', updated_at: '2026-01-15T09:00:00Z' },
  { id: '2', email: 'dr.okafor@nhs.uk', full_name: 'Dr. James Okafor', role: 'clinician', specialty: 'Developmental Pediatrics', institution: 'NHS', phone: '', avatar_url: '', is_active: true, created_at: '2026-02-01T10:00:00Z', updated_at: '2026-02-01T10:00:00Z' },
  { id: '3', email: 'admin@neomind.ai', full_name: 'System Admin', role: 'admin', specialty: '', institution: 'NeoMind AI', phone: '', avatar_url: '', is_active: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: '4', email: 'dr.sharma@aiims.in', full_name: 'Dr. Priya Sharma', role: 'researcher', specialty: 'Neonatology', institution: 'AIIMS Delhi', phone: '', avatar_url: '', is_active: false, created_at: '2026-03-01T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
];

const usageData = [
  { month: 'Jan', analyses: 42, users: 8 },
  { month: 'Feb', analyses: 58, users: 12 },
  { month: 'Mar', analyses: 61, users: 15 },
  { month: 'Apr', analyses: 84, users: 19 },
  { month: 'May', analyses: 93, users: 22 },
  { month: 'Jun', analyses: 112, users: 25 },
];

export default function AdminPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'audit'>('overview');
  const [auditLogs] = useState([
    { id: 1, user: 'Dr. Sarah Chen', action: 'PATIENT_CREATE', resource: 'Patient NM26-04821', time: '2026-06-04T09:15:00Z' },
    { id: 2, user: 'Dr. James Okafor', action: 'ASSESSMENT_RUN', resource: 'Assessment for Patient NM26-04822', time: '2026-06-04T08:45:00Z' },
    { id: 3, user: 'Dr. Sarah Chen', action: 'REPORT_GENERATE', resource: 'Report for Baby Emma Johnson', time: '2026-06-03T16:30:00Z' },
    { id: 4, user: 'Dr. Priya Sharma', action: 'VIDEO_UPLOAD', resource: 'Video for Patient NM26-04823', time: '2026-06-03T14:00:00Z' },
    { id: 5, user: 'System Admin', action: 'USER_DEACTIVATE', resource: 'User dr.sharma@aiims.in', time: '2026-06-02T11:00:00Z' },
  ]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setUsers(data?.length ? data as Profile[] : DEMO_USERS);
      setLoading(false);
    };
    fetch();
  }, []);

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center glass-card p-12">
          <ShieldCheck className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm">Admin privileges required to access this area.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    !search || u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar isApp />
      <AppSidebar />
      <main className="lg:ml-64 pt-16">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-cyan-500/15 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-slate-400 text-sm">Platform management and analytics</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-900 rounded-xl p-1 mb-6 w-fit">
            {(['overview', 'users', 'audit'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  activeTab === tab ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}>{tab}</button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Platform Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: users.length || 25, icon: Users, color: '#22d3ee' },
                  { label: 'Analyses Run', value: '450', icon: Activity, color: '#2dd4bf' },
                  { label: 'Active Patients', value: '182', icon: Database, color: '#34d399' },
                  { label: 'High Risk Cases', value: '23', icon: AlertTriangle, color: '#fb923c' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="glass-card p-5">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-5 h-5" style={{ color }} />
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Usage Chart */}
              <div className="glass-card p-6">
                <h3 className="font-semibold text-white mb-5">Platform Usage (6 months)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={usageData} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                    <Bar dataKey="analyses" name="Analyses" radius={[4, 4, 0, 0]} fill="#06b6d4" opacity={0.8} />
                    <Bar dataKey="users" name="Active Users" radius={[4, 4, 0, 0]} fill="#14b8a6" opacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* System Health */}
              <div className="glass-card p-6">
                <h3 className="font-semibold text-white mb-4">System Health</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { service: 'AI Analysis Engine', status: 'operational', latency: '142ms' },
                    { service: 'Database', status: 'operational', latency: '8ms' },
                    { service: 'File Storage', status: 'operational', latency: '45ms' },
                    { service: 'Auth Service', status: 'operational', latency: '23ms' },
                  ].map(({ service, status, latency }) => (
                    <div key={service} className="bg-slate-900/80 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">{service}</span>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      </div>
                      <p className="text-xs text-emerald-400 font-medium capitalize">{status}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">Latency: {latency}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex items-center gap-4 mb-5">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search users..." className="input-field pl-10" />
                </div>
                <button className="btn-secondary gap-2 text-sm py-2">
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
              ) : (
                <div className="glass-card overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">User</th>
                        <th className="text-left text-xs text-slate-500 font-medium px-5 py-3 hidden md:table-cell">Role</th>
                        <th className="text-left text-xs text-slate-500 font-medium px-5 py-3 hidden lg:table-cell">Institution</th>
                        <th className="text-left text-xs text-slate-500 font-medium px-5 py-3 hidden sm:table-cell">Joined</th>
                        <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Status</th>
                        <th className="text-right text-xs text-slate-500 font-medium px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, i) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-white">{user.full_name.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{user.full_name}</p>
                                <p className="text-xs text-slate-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                              user.role === 'admin' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                              user.role === 'researcher' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' :
                              'bg-slate-700 text-slate-400 border border-slate-600'
                            }`}>{user.role}</span>
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                            <span className="text-xs text-slate-400">{user.institution || '—'}</span>
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell">
                            <span className="text-xs text-slate-400">{formatDate(user.created_at)}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`flex items-center gap-1.5 text-xs ${user.is_active ? 'text-emerald-400' : 'text-slate-500'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors">
                                <Lock className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="glass-card overflow-hidden">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-semibold text-white">Audit Log</h3>
                <button className="btn-secondary gap-2 text-sm py-2">
                  <Download className="w-4 h-4" /> Export Log
                </button>
              </div>
              <div className="divide-y divide-slate-800/50">
                {auditLogs.map(log => (
                  <div key={log.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors">
                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono bg-slate-800 text-cyan-400 px-2 py-0.5 rounded">{log.action}</span>
                        <span className="text-xs text-slate-400 truncate">{log.resource}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{log.user}</p>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">{formatDateTime(log.time)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
