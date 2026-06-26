import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Activity, AlertTriangle, Calendar, TrendingUp, TrendingDown,
  ArrowRight, Plus, Brain, Loader2, CheckCircle, Clock, FileText,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Navbar } from '../../components/layout/Navbar';
import { AppSidebar } from '../../components/layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getRiskBadgeClass, formatDate, calculateAge } from '../../lib/utils';
import type { Patient, RiskAssessment } from '../../types';

const COLORS = ['#10b981', '#f59e0b', '#f97316', '#f43f5e'];

const monthlyData = [
  { month: 'Jan', assessments: 12, highRisk: 2 },
  { month: 'Feb', assessments: 18, highRisk: 4 },
  { month: 'Mar', assessments: 15, highRisk: 3 },
  { month: 'Apr', assessments: 24, highRisk: 5 },
  { month: 'May', assessments: 21, highRisk: 4 },
  { month: 'Jun', assessments: 28, highRisk: 7 },
];

export default function DashboardPage() {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: pData }, { data: aData }] = await Promise.all([
        supabase.from('patients').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('risk_assessments').select('*, patients(full_name, patient_code)').order('created_at', { ascending: false }).limit(20),
      ]);
      setPatients(pData || []);
      setAssessments(aData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const stats = {
    total: patients.length,
    highRisk: patients.filter(p => ['high', 'critical'].includes(p.overall_risk_level)).length,
    thisMonth: assessments.filter(a => new Date(a.created_at).getMonth() === new Date().getMonth()).length,
    pending: assessments.filter(a => a.status === 'pending').length,
  };

  const riskDistribution = [
    { name: 'Low Risk', value: patients.filter(p => p.overall_risk_level === 'low').length || 12, color: '#10b981' },
    { name: 'Medium Risk', value: patients.filter(p => p.overall_risk_level === 'medium').length || 8, color: '#f59e0b' },
    { name: 'High Risk', value: patients.filter(p => p.overall_risk_level === 'high').length || 4, color: '#f97316' },
    { name: 'Critical', value: patients.filter(p => p.overall_risk_level === 'critical').length || 1, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar isApp />
      <AppSidebar />

      <main className="lg:ml-64 pt-16">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
                {profile?.full_name?.split(' ')[0] || 'Doctor'}
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <Link to="/patients/add" className="btn-primary gap-2">
              <Plus className="w-4 h-4" /> New Patient
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Patients', value: stats.total || 25, icon: Users, color: 'cyan', trend: '+3 this week', up: true },
                  { label: 'Assessments (Month)', value: stats.thisMonth || 18, icon: Activity, color: 'teal', trend: '+12% vs last month', up: true },
                  { label: 'High Risk Patients', value: stats.highRisk || 5, icon: AlertTriangle, color: 'orange', trend: '-1 from last week', up: false },
                  { label: 'Pending Reviews', value: stats.pending || 3, icon: Calendar, color: 'slate', trend: '2 urgent', up: false },
                ].map(({ label, value, icon: Icon, color, trend, up }) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center`}
                        style={{ background: color === 'cyan' ? 'rgba(6,182,212,0.15)' : color === 'teal' ? 'rgba(20,184,166,0.15)' : color === 'orange' ? 'rgba(249,115,22,0.15)' : 'rgba(100,116,139,0.15)' }}>
                        <Icon className="w-5 h-5" style={{ color: color === 'cyan' ? '#22d3ee' : color === 'teal' ? '#2dd4bf' : color === 'orange' ? '#fb923c' : '#94a3b8' }} />
                      </div>
                      <span className={`flex items-center gap-1 text-xs ${up ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {trend}
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-white">{value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Area chart */}
                <div className="glass-card p-6 lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold text-white">Assessment Trends</h3>
                      <p className="text-xs text-slate-400">Monthly assessments & high-risk cases</p>
                    </div>
                    <span className="text-xs bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full">6 months</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={monthlyData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="colorAssessments" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorHighRisk" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                      <Area type="monotone" dataKey="assessments" stroke="#06b6d4" fill="url(#colorAssessments)" strokeWidth={2} name="Assessments" />
                      <Area type="monotone" dataKey="highRisk" stroke="#f97316" fill="url(#colorHighRisk)" strokeWidth={2} name="High Risk" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie chart */}
                <div className="glass-card p-6">
                  <h3 className="font-semibold text-white mb-1">Risk Distribution</h3>
                  <p className="text-xs text-slate-400 mb-4">Current patient risk levels</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {riskDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {riskDistribution.map(({ name, value, color }) => (
                      <div key={name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-slate-400">{name}</span>
                        </div>
                        <span className="text-slate-300 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Disorder Risk Bar Chart */}
              <div className="glass-card p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-white">Average Risk Scores by Disorder</h3>
                    <p className="text-xs text-slate-400">Across all assessments this month</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={[
                    { name: 'ASD', score: 28, color: '#06b6d4' },
                    { name: 'ADHD', score: 22, color: '#14b8a6' },
                    { name: 'Down Syndrome', score: 14, color: '#10b981' },
                    { name: 'Dev. Delay', score: 35, color: '#f59e0b' },
                  ]} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} formatter={(v: number) => [`${v}%`, 'Avg. Risk Score']} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {[
                        { color: '#06b6d4' }, { color: '#14b8a6' }, { color: '#10b981' }, { color: '#f59e0b' },
                      ].map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Patients + Assessments */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-semibold text-white">Recent Patients</h3>
                    <Link to="/patients" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                      View all <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {patients.slice(0, 5).length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No patients yet</p>
                        <Link to="/patients/add" className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 block">Add your first patient</Link>
                      </div>
                    ) : patients.slice(0, 5).map(patient => (
                      <Link
                        key={patient.id}
                        to={`/patients/${patient.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/50 transition-colors group"
                      >
                        <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-white">{patient.full_name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors">{patient.full_name}</p>
                          <p className="text-xs text-slate-500">{patient.patient_code} · Age: {calculateAge(patient.date_of_birth)}</p>
                        </div>
                        <span className={getRiskBadgeClass(patient.overall_risk_level)}>{patient.overall_risk_level}</span>
                      </Link>
                    ))}
                    {patients.length === 0 && (
                      // Demo data
                      [
                        { id: '1', full_name: 'Baby Johnson', patient_code: 'NM26-04821', dob: '2026-05-01', risk: 'medium' },
                        { id: '2', full_name: 'Baby Williams', patient_code: 'NM26-04822', dob: '2026-04-18', risk: 'low' },
                        { id: '3', full_name: 'Baby Martinez', patient_code: 'NM26-04823', dob: '2026-05-10', risk: 'high' },
                      ].map(p => (
                        <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl">
                          <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{p.full_name.charAt(0)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{p.full_name}</p>
                            <p className="text-xs text-slate-500">{p.patient_code}</p>
                          </div>
                          <span className={getRiskBadgeClass(p.risk as any)}>{p.risk}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-semibold text-white">Recent Assessments</h3>
                    <Link to="/reports" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                      View all <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {assessments.length === 0 ? (
                      [
                        { id: 1, type: 'Combined', status: 'complete', risk: 'medium', score: 42, name: 'Baby Johnson', date: 'Jun 2, 2026' },
                        { id: 2, type: 'Video', status: 'complete', risk: 'low', score: 18, name: 'Baby Williams', date: 'Jun 1, 2026' },
                        { id: 3, type: 'Audio', status: 'processing', risk: 'unknown', score: 0, name: 'Baby Martinez', date: 'Jun 3, 2026' },
                      ].map(a => (
                        <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${a.status === 'complete' ? 'bg-emerald-500/15' : 'bg-amber-500/15'}`}>
                            {a.status === 'complete' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-amber-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium">{a.name}</p>
                            <p className="text-xs text-slate-500">{a.type} · {a.date}</p>
                          </div>
                          <div className="text-right">
                            {a.status === 'complete' ? (
                              <><span className={getRiskBadgeClass(a.risk as any)}>{a.risk}</span>
                              <p className="text-xs text-slate-500 mt-0.5">{a.score}% risk</p></>
                            ) : (
                              <span className="text-xs text-amber-400 flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" /> Processing
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : assessments.slice(0, 5).map(a => (
                      <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${a.status === 'complete' ? 'bg-emerald-500/15' : 'bg-amber-500/15'}`}>
                          {a.status === 'complete' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium">{(a.patients as any)?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">{a.assessment_type} · {formatDate(a.created_at)}</p>
                        </div>
                        <span className={getRiskBadgeClass(a.overall_risk_level)}>{a.overall_risk_level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 glass-card p-6">
                <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { to: '/patients/add', icon: Plus, label: 'Add Patient', color: 'cyan' },
                    { to: '/video-analysis', icon: Activity, label: 'Video Analysis', color: 'teal' },
                    { to: '/audio-analysis', icon: Brain, label: 'Audio Analysis', color: 'emerald' },
                    { to: '/reports', icon: FileText, label: 'View Reports', color: 'slate' },
                  ].map(({ to, icon: Icon, label, color }) => (
                    <Link
                      key={to}
                      to={to}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-cyan-500/30 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                        style={{ background: color === 'cyan' ? 'rgba(6,182,212,0.15)' : color === 'teal' ? 'rgba(20,184,166,0.15)' : color === 'emerald' ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)' }}>
                        <Icon className="w-5 h-5 group-hover:scale-110 transition-transform"
                          style={{ color: color === 'cyan' ? '#22d3ee' : color === 'teal' ? '#2dd4bf' : color === 'emerald' ? '#34d399' : '#94a3b8' }} />
                      </div>
                      <span className="text-xs text-slate-300 font-medium text-center">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
