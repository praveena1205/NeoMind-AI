import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Plus, Search, Filter, ChevronRight, Baby,
  Calendar, Activity, AlertTriangle, Loader2, SortDesc,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { AppSidebar } from '../../components/layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getRiskBadgeClass, calculateAge, formatDate } from '../../lib/utils';
import type { Patient, RiskLevel } from '../../types';

const DEMO_PATIENTS: Patient[] = [
  { id: '1', clinician_id: '', patient_code: 'NM26-04821', full_name: 'Baby Emma Johnson', date_of_birth: '2026-05-01', gender: 'female', gestational_age_weeks: 39, birth_weight_grams: 3200, apgar_score_1min: 8, apgar_score_5min: 9, delivery_type: 'vaginal', nicu_admission: false, nicu_duration_days: 0, family_history_asd: true, family_history_adhd: false, family_history_chromosomal: false, maternal_age: 32, maternal_health_notes: '', notes: '', status: 'active', overall_risk_level: 'medium', created_at: '2026-05-01T09:00:00Z', updated_at: '2026-05-01T09:00:00Z' },
  { id: '2', clinician_id: '', patient_code: 'NM26-04822', full_name: 'Baby Liam Williams', date_of_birth: '2026-04-18', gender: 'male', gestational_age_weeks: 40, birth_weight_grams: 3500, apgar_score_1min: 9, apgar_score_5min: 10, delivery_type: 'vaginal', nicu_admission: false, nicu_duration_days: 0, family_history_asd: false, family_history_adhd: false, family_history_chromosomal: false, maternal_age: 28, maternal_health_notes: '', notes: '', status: 'active', overall_risk_level: 'low', created_at: '2026-04-18T10:30:00Z', updated_at: '2026-04-18T10:30:00Z' },
  { id: '3', clinician_id: '', patient_code: 'NM26-04823', full_name: 'Baby Sofia Martinez', date_of_birth: '2026-05-10', gender: 'female', gestational_age_weeks: 36, birth_weight_grams: 2800, apgar_score_1min: 6, apgar_score_5min: 7, delivery_type: 'cesarean', nicu_admission: true, nicu_duration_days: 5, family_history_asd: false, family_history_adhd: true, family_history_chromosomal: false, maternal_age: 38, maternal_health_notes: '', notes: 'Premature birth', status: 'active', overall_risk_level: 'high', created_at: '2026-05-10T14:00:00Z', updated_at: '2026-05-10T14:00:00Z' },
  { id: '4', clinician_id: '', patient_code: 'NM26-04824', full_name: 'Baby Noah Brown', date_of_birth: '2026-03-22', gender: 'male', gestational_age_weeks: 41, birth_weight_grams: 3800, apgar_score_1min: 9, apgar_score_5min: 9, delivery_type: 'vaginal', nicu_admission: false, nicu_duration_days: 0, family_history_asd: false, family_history_adhd: false, family_history_chromosomal: false, maternal_age: 30, maternal_health_notes: '', notes: '', status: 'active', overall_risk_level: 'low', created_at: '2026-03-22T11:00:00Z', updated_at: '2026-03-22T11:00:00Z' },
  { id: '5', clinician_id: '', patient_code: 'NM26-04825', full_name: 'Baby Ava Davis', date_of_birth: '2026-05-25', gender: 'female', gestational_age_weeks: 35, birth_weight_grams: 2500, apgar_score_1min: 5, apgar_score_5min: 6, delivery_type: 'cesarean', nicu_admission: true, nicu_duration_days: 12, family_history_asd: true, family_history_adhd: true, family_history_chromosomal: true, maternal_age: 42, maternal_health_notes: 'Gestational diabetes', notes: 'High risk, monitor closely', status: 'active', overall_risk_level: 'critical', created_at: '2026-05-25T08:00:00Z', updated_at: '2026-05-25T08:00:00Z' },
];

export default function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');

  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
      setPatients(error || !data?.length ? DEMO_PATIENTS : data);
      setLoading(false);
    };
    fetchPatients();
  }, [user]);

  const filtered = patients.filter(p => {
    const matchSearch = !search || p.full_name.toLowerCase().includes(search.toLowerCase()) || p.patient_code.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === 'all' || p.overall_risk_level === riskFilter;
    return matchSearch && matchRisk;
  });

  const counts = {
    all: patients.length,
    low: patients.filter(p => p.overall_risk_level === 'low').length,
    medium: patients.filter(p => p.overall_risk_level === 'medium').length,
    high: patients.filter(p => p.overall_risk_level === 'high').length,
    critical: patients.filter(p => p.overall_risk_level === 'critical').length,
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar isApp />
      <AppSidebar />

      <main className="lg:ml-64 pt-16">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Patients</h1>
              <p className="text-slate-400 text-sm mt-0.5">{patients.length} newborns registered</p>
            </div>
            <Link to="/patients/add" className="btn-primary gap-2">
              <Plus className="w-4 h-4" /> Add Patient
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or patient code..."
                className="input-field pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'low', 'medium', 'high', 'critical'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setRiskFilter(level)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    riskFilter === level
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {level === 'all' ? `All (${counts.all})` : `${level.charAt(0).toUpperCase() + level.slice(1)} (${counts[level]})`}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-1">No patients found</h3>
                  <p className="text-slate-400 text-sm">
                    {search ? 'Try adjusting your search query' : 'Add your first patient to get started'}
                  </p>
                  {!search && (
                    <Link to="/patients/add" className="btn-primary mt-4 gap-2 inline-flex">
                      <Plus className="w-4 h-4" /> Add Patient
                    </Link>
                  )}
                </div>
              ) : filtered.map((patient, i) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Link
                    to={`/patients/${patient.id}`}
                    className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-cyan-500/30 transition-all group block"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center shrink-0 text-lg font-bold text-white">
                        {patient.gender === 'female' ? '♀' : patient.gender === 'male' ? '♂' : '?'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">{patient.full_name}</h3>
                          <span className={getRiskBadgeClass(patient.overall_risk_level)}>{patient.overall_risk_level}</span>
                          {patient.nicu_admission && (
                            <span className="text-xs bg-rose-500/15 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded-full">NICU</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-slate-500">{patient.patient_code}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Baby className="w-3 h-3" /> {calculateAge(patient.date_of_birth)} old
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Born {formatDate(patient.date_of_birth)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 sm:ml-auto">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-slate-500">Gestation</p>
                          <p className="text-sm font-semibold text-slate-200">{patient.gestational_age_weeks}w</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Weight</p>
                          <p className="text-sm font-semibold text-slate-200">{(patient.birth_weight_grams / 1000).toFixed(1)}kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">APGAR</p>
                          <p className="text-sm font-semibold text-slate-200">{patient.apgar_score_5min ?? 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {patient.family_history_asd && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">Fam.ASD</span>
                        )}
                        {patient.family_history_adhd && (
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">Fam.ADHD</span>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
