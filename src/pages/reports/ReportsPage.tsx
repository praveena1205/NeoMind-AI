import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Plus, Search, Download, Eye, Filter,
  CheckCircle, Clock, Archive, Loader2, Calendar, ChevronRight,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { AppSidebar } from '../../components/layout/Navbar';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getRiskBadgeClass, formatDate } from '../../lib/utils';
import type { Report } from '../../types';

const DEMO_REPORTS: Report[] = [
  { id: 'r1', patient_id: '1', assessment_id: 'a1', generated_by: '', report_title: 'NeoMind Screening Report — Baby Emma Johnson', report_type: 'standard', summary: 'Medium risk assessment with elevated ASD indicators. Specialist consultation recommended.', clinician_notes: '', pdf_url: '', status: 'final', created_at: '2026-05-20T14:30:00Z', updated_at: '2026-05-20T14:30:00Z', patients: { id: '1', clinician_id: '', patient_code: 'NM26-04821', full_name: 'Baby Emma Johnson', date_of_birth: '2026-05-01', gender: 'female', gestational_age_weeks: 39, birth_weight_grams: 3200, apgar_score_1min: 8, apgar_score_5min: 9, delivery_type: 'vaginal', nicu_admission: false, nicu_duration_days: 0, family_history_asd: true, family_history_adhd: false, family_history_chromosomal: false, maternal_age: 32, maternal_health_notes: '', notes: '', status: 'active', overall_risk_level: 'medium', created_at: '', updated_at: '' } },
  { id: 'r2', patient_id: '2', assessment_id: null, generated_by: '', report_title: 'Routine Developmental Screening — Baby Liam Williams', report_type: 'summary', summary: 'Low risk. All developmental markers within normal range. Continue routine follow-up.', clinician_notes: '', pdf_url: '', status: 'final', created_at: '2026-04-25T10:00:00Z', updated_at: '2026-04-25T10:00:00Z', patients: { id: '2', clinician_id: '', patient_code: 'NM26-04822', full_name: 'Baby Liam Williams', date_of_birth: '2026-04-18', gender: 'male', gestational_age_weeks: 40, birth_weight_grams: 3500, apgar_score_1min: 9, apgar_score_5min: 10, delivery_type: 'vaginal', nicu_admission: false, nicu_duration_days: 0, family_history_asd: false, family_history_adhd: false, family_history_chromosomal: false, maternal_age: 28, maternal_health_notes: '', notes: '', status: 'active', overall_risk_level: 'low', created_at: '', updated_at: '' } },
  { id: 'r3', patient_id: '3', assessment_id: null, generated_by: '', report_title: 'High-Risk Assessment Report — Baby Sofia Martinez', report_type: 'detailed', summary: 'High risk assessment. Premature birth with NICU admission. Multiple risk factors identified.', clinician_notes: 'Immediate pediatric neurology referral scheduled.', pdf_url: '', status: 'draft', created_at: '2026-05-15T09:00:00Z', updated_at: '2026-05-15T09:00:00Z', patients: { id: '3', clinician_id: '', patient_code: 'NM26-04823', full_name: 'Baby Sofia Martinez', date_of_birth: '2026-05-10', gender: 'female', gestational_age_weeks: 36, birth_weight_grams: 2800, apgar_score_1min: 6, apgar_score_5min: 7, delivery_type: 'cesarean', nicu_admission: true, nicu_duration_days: 5, family_history_asd: false, family_history_adhd: true, family_history_chromosomal: false, maternal_age: 38, maternal_health_notes: '', notes: '', status: 'active', overall_risk_level: 'high', created_at: '', updated_at: '' } },
];

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'final' | 'archived'>('all');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('reports')
        .select('*, patients(full_name, patient_code, overall_risk_level, date_of_birth, gender, gestational_age_weeks, birth_weight_grams, apgar_score_1min, apgar_score_5min, delivery_type, nicu_admission, nicu_duration_days, family_history_asd, family_history_adhd, family_history_chromosomal, maternal_age, maternal_health_notes, notes, status, id, clinician_id, created_at, updated_at)')
        .order('created_at', { ascending: false });
      setReports(data?.length ? data as Report[] : DEMO_REPORTS);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const filtered = reports.filter(r => {
    const matchSearch = !search || r.report_title.toLowerCase().includes(search.toLowerCase()) ||
      (r.patients as any)?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusIcon = (status: string) => {
    if (status === 'final') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (status === 'draft') return <Clock className="w-4 h-4 text-amber-400" />;
    return <Archive className="w-4 h-4 text-slate-500" />;
  };

  const typeLabel: Record<string, string> = {
    standard: 'Standard', detailed: 'Detailed', summary: 'Summary', followup: 'Follow-up'
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar isApp />
      <AppSidebar />
      <main className="lg:ml-64 pt-16">
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Reports</h1>
              <p className="text-slate-400 text-sm mt-0.5">{reports.length} clinical reports generated</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search reports..." className="input-field pl-10" />
            </div>
            <div className="flex gap-2">
              {(['all', 'draft', 'final', 'archived'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all capitalize ${
                    statusFilter === s ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>{s}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-1">No reports found</h3>
                  <p className="text-slate-400 text-sm">Run an AI analysis to generate your first report</p>
                </div>
              ) : filtered.map((report, i) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-5 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      report.status === 'final' ? 'bg-emerald-500/15' : report.status === 'draft' ? 'bg-amber-500/15' : 'bg-slate-800'
                    }`}>
                      {statusIcon(report.status)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-white text-sm group-hover:text-cyan-400 transition-colors leading-snug">
                            {report.report_title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {formatDate(report.created_at)}
                            </span>
                            <span className="text-xs text-slate-500">{typeLabel[report.report_type] || report.report_type} report</span>
                            {(report.patients as any) && (
                              <span className={getRiskBadgeClass((report.patients as any).overall_risk_level)}>
                                {(report.patients as any).overall_risk_level}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                          report.status === 'final' ? 'bg-emerald-500/15 text-emerald-400' :
                          report.status === 'draft' ? 'bg-amber-500/15 text-amber-400' :
                          'bg-slate-700 text-slate-400'
                        } capitalize`}>{report.status}</span>
                      </div>

                      {report.summary && (
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">{report.summary}</p>
                      )}

                      <div className="flex items-center gap-3 mt-3">
                        <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors">
                          <Download className="w-3.5 h-3.5" /> Download PDF
                        </button>
                        {report.patients && (
                          <Link to={`/patients/${(report.patients as any).id}`}
                            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors ml-auto">
                            View Patient <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
