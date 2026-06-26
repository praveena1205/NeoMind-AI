import type { RiskLevel } from '../types';

export function getRiskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'risk-badge-low';
    case 'medium': return 'risk-badge-medium';
    case 'high': return 'risk-badge-high';
    case 'critical': return 'risk-badge-critical';
    default: return 'bg-slate-700/50 text-slate-400 border border-slate-600/50 px-2.5 py-0.5 rounded-full text-xs font-medium';
  }
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'low': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'high': return '#f97316';
    case 'critical': return '#f43f5e';
    default: return '#64748b';
  }
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'Low Risk';
    case 'medium': return 'Medium Risk';
    case 'high': return 'High Risk';
    case 'critical': return 'Critical Risk';
    default: return 'Unknown';
  }
}

export function scoreToRiskLevel(score: number): RiskLevel {
  if (score < 25) return 'low';
  if (score < 50) return 'medium';
  if (score < 75) return 'high';
  return 'critical';
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr));
}

export function calculateAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  const diffMs = now.getTime() - birth.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) return `${diffDays}d`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`;
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  return months > 0 ? `${years}y ${months}mo` : `${years}y`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function generatePatientCode(): string {
  const prefix = 'NM';
  const year = new Date().getFullYear().toString().slice(-2);
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `${prefix}${year}-${rand}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str;
}

// Simulate AI analysis with realistic results
export function generateMockAnalysis(patientData: {
  gestational_age_weeks: number;
  birth_weight_grams: number;
  family_history_asd: boolean;
  family_history_adhd: boolean;
  family_history_chromosomal: boolean;
  nicu_admission: boolean;
  apgar_score_5min: number | null;
}) {
  const riskMultiplier =
    (patientData.family_history_asd ? 1.4 : 1) *
    (patientData.family_history_adhd ? 1.2 : 1) *
    (patientData.family_history_chromosomal ? 1.5 : 1) *
    (patientData.nicu_admission ? 1.3 : 1) *
    (patientData.gestational_age_weeks < 37 ? 1.35 : 1) *
    ((patientData.apgar_score_5min !== null && patientData.apgar_score_5min < 7) ? 1.4 : 1);

  const base = () => Math.random() * 30 + 5;
  const clamp = (v: number) => Math.min(Math.max(v, 0), 100);

  const asd = clamp(base() * (patientData.family_history_asd ? riskMultiplier : 1));
  const adhd = clamp(base() * (patientData.family_history_adhd ? riskMultiplier : 1));
  const ds = clamp(base() * (patientData.family_history_chromosomal ? riskMultiplier : 1));
  const dd = clamp(base() * riskMultiplier);
  const overall = clamp((asd + adhd + ds + dd) / 4);

  return {
    asd: parseFloat(asd.toFixed(2)),
    adhd: parseFloat(adhd.toFixed(2)),
    ds: parseFloat(ds.toFixed(2)),
    dd: parseFloat(dd.toFixed(2)),
    overall: parseFloat(overall.toFixed(2)),
    confidence: parseFloat((Math.random() * 15 + 78).toFixed(2)),
  };
}
