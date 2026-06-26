import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Brain, Play, ArrowRight, Shield, Zap, Eye, Mic2, Activity,
  TrendingUp, CheckCircle, Star, Users, FileText, Award,
  ChevronRight, Heart, Cpu, BarChart3, Bot, Lock,
  Baby, ScanLine, Dna, Clock, Mail, Phone, MapPin, Send,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6 },
};

const stagger = {
  initial: {},
  whileInView: {},
  viewport: { once: true },
  transition: { staggerChildren: 0.1 },
};

export default function LandingPage() {
  return (
    <div className="bg-hero-gradient min-h-screen">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-teal-500/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-xs text-cyan-400 font-medium">FDA-Recognized AI Diagnostic Platform</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Detect Disorders{' '}
                <span className="gradient-text">Early.</span>
                <br />
                Change Lives{' '}
                <span className="gradient-text">Forever.</span>
              </h1>

              <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
                NeoMind uses cutting-edge AI to analyze newborn behavior, movement, facial expressions,
                and crying patterns to detect early signs of ASD, ADHD, Down Syndrome, and developmental delays.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/signup" className="btn-primary gap-2">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Link>
                <button className="btn-secondary gap-2">
                  <Play className="w-4 h-4 fill-current" /> Watch Demo
                </button>
              </div>

              <div className="flex items-center gap-8 pt-2">
                {[
                  { label: 'Newborns Screened', value: '48,000+' },
                  { label: 'Detection Accuracy', value: '94.7%' },
                  { label: 'Clinical Partners', value: '200+' },
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              {/* Main card */}
              <div className="glass-card p-6 space-y-4 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center">
                      <Baby className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Patient NM26-04821</p>
                      <p className="text-xs text-slate-400">Age: 3 weeks, 2 days</p>
                    </div>
                  </div>
                  <span className="risk-badge-medium">Medium Risk</span>
                </div>

                {/* Scan animation */}
                <div className="relative bg-slate-900 rounded-xl h-40 overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=400"
                    alt="AI scanning"
                    className="w-full h-full object-cover opacity-40"
                  />
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                  {/* Scan line */}
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent scan-animation opacity-80" />
                  {/* Facial landmark dots */}
                  {[
                    { top: '30%', left: '35%' }, { top: '30%', left: '65%' },
                    { top: '50%', left: '50%' }, { top: '65%', left: '40%' },
                    { top: '65%', left: '60%' },
                  ].map((pos, i) => (
                    <div key={i} className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full neural-node"
                      style={{ top: pos.top, left: pos.left, animationDelay: `${i * 0.3}s` }} />
                  ))}
                  <div className="absolute bottom-2 left-2 text-[10px] text-cyan-400 font-mono">
                    FACIAL LANDMARK DETECTION ACTIVE
                  </div>
                </div>

                {/* Risk scores */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'ASD', score: 32, color: 'from-amber-500 to-amber-600' },
                    { label: 'ADHD', score: 18, color: 'from-emerald-500 to-emerald-600' },
                    { label: 'Down Syndrome', score: 8, color: 'from-emerald-500 to-teal-500' },
                    { label: 'Dev. Delay', score: 45, color: 'from-orange-500 to-orange-600' },
                  ].map(({ label, score, color }) => (
                    <div key={label} className="bg-slate-900/80 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-slate-400">{label}</span>
                        <span className="text-xs font-bold text-white">{score}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${color} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Analysis complete — 94.2% confidence</span>
                  </div>
                  <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                </div>
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 glass-card px-3 py-2 flex items-center gap-2"
              >
                <ScanLine className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-medium text-teal-400">Live CV Analysis</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-4 -left-4 glass-card px-3 py-2 flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">HIPAA Secure</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────── */}
      <section className="py-10 border-y border-slate-800/50 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-slate-500 uppercase tracking-widest mb-6">Trusted by leading medical institutions</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
            {['Mayo Clinic Network', 'Johns Hopkins Affiliated', 'Cleveland Clinic Partner', 'Stanford Medicine', 'NHS Digital'].map(name => (
              <span key={name} className="text-slate-500 font-semibold text-sm">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="text-xs text-cyan-400 font-semibold uppercase tracking-widest">Capabilities</span>
            <h2 className="text-4xl font-bold text-white mt-3 mb-4">
              Comprehensive AI Analysis Suite
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our multi-modal AI system analyzes multiple data sources simultaneously for the most accurate early detection possible.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Eye, color: 'from-cyan-500 to-cyan-600', glow: 'cyan',
                title: 'Facial Expression Analysis',
                desc: 'Computer vision detects micro-expressions, facial symmetry, and behavioral markers using 468 facial landmarks via MediaPipe.',
                tags: ['MediaPipe', 'OpenCV', 'TensorFlow'],
              },
              {
                icon: Activity, color: 'from-teal-500 to-teal-600', glow: 'teal',
                title: 'Movement Pattern Detection',
                desc: 'Full-body pose estimation analyzes movement patterns, reflex responses, and motor development milestones.',
                tags: ['Pose Estimation', 'Motion Analysis', 'Reflex Scoring'],
              },
              {
                icon: Mic2, color: 'from-emerald-500 to-emerald-600', glow: 'emerald',
                title: 'Cry Audio Analysis',
                desc: 'Deep neural networks analyze cry frequency, spectrogram patterns, and acoustic features to detect neurological differences.',
                tags: ['Librosa', 'MFCC', 'Spectrogram'],
              },
              {
                icon: ScanLine, color: 'from-blue-500 to-cyan-500', glow: 'cyan',
                title: 'Eye Tracking Behavior',
                desc: 'Tracks gaze patterns, saccadic movements, and visual attention to identify early signs of ASD and visual processing disorders.',
                tags: ['Gaze Tracking', 'Saccades', 'Attention Map'],
              },
              {
                icon: Dna, color: 'from-teal-500 to-emerald-500', glow: 'teal',
                title: 'Genetic Risk Integration',
                desc: 'Combines family history, birth data, and genetic markers with AI models for comprehensive risk stratification.',
                tags: ['Family History', 'APGAR', 'Genomics'],
              },
              {
                icon: BarChart3, color: 'from-cyan-600 to-teal-600', glow: 'cyan',
                title: 'Explainable AI Reports',
                desc: 'SHAP-based explainability provides clinicians with transparent insights into exactly which features drove each risk prediction.',
                tags: ['SHAP Values', 'Feature Importance', 'Confidence Scores'],
              },
            ].map(({ icon: Icon, color, title, desc, tags }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-6 group hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => (
                    <span key={tag} className="text-xs bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded-full border border-slate-600/50">{tag}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="text-xs text-teal-400 font-semibold uppercase tracking-widest">Process</span>
            <h2 className="text-4xl font-bold text-white mt-3 mb-4">How NeoMind Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              A streamlined 5-step process from data collection to personalized treatment recommendations.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-cyan-500/20 via-teal-500/40 to-emerald-500/20" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {[
                { step: 1, icon: Baby, color: 'cyan', title: 'Register Patient', desc: 'Input newborn birth data, family history, and clinical notes.' },
                { step: 2, icon: FileText, color: 'teal', title: 'Upload Data', desc: 'Upload movement videos, facial recordings, and crying audio clips.' },
                { step: 3, icon: Cpu, color: 'teal', title: 'AI Processing', desc: 'Multi-modal deep learning models analyze all inputs in parallel.' },
                { step: 4, icon: BarChart3, color: 'emerald', title: 'Risk Scores', desc: 'Receive disorder-specific risk scores with explainable AI insights.' },
                { step: 5, icon: Heart, color: 'emerald', title: 'Recommendations', desc: 'Get personalized specialist referrals and follow-up action plans.' },
              ].map(({ step, icon: Icon, color, title, desc }) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: step * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-2xl flex items-center justify-center shadow-lg`}
                      style={{ background: color === 'cyan' ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : color === 'teal' ? 'linear-gradient(135deg, #14b8a6, #0d9488)' : 'linear-gradient(135deg, #10b981, #059669)' }}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 border-2 border-slate-700 rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-300">{step}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AI BENEFITS ──────────────────────────────────────── */}
      <section id="benefits" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <span className="text-xs text-emerald-400 font-semibold uppercase tracking-widest">Benefits</span>
              <h2 className="text-4xl font-bold text-white mt-3 mb-6">
                Why Early Detection Matters
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Studies show that early intervention before age 3 can dramatically improve outcomes for children with neurodevelopmental conditions. NeoMind brings this critical detection capability to every clinic.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Zap, title: 'Early Intervention Window', desc: 'Identify risks within the first weeks of life when neuroplasticity is highest.' },
                  { icon: TrendingUp, title: '94.7% Diagnostic Accuracy', desc: 'Our ensemble AI model outperforms traditional screening methods by 40%.' },
                  { icon: Clock, title: 'Results in Under 5 Minutes', desc: 'Rapid AI analysis means no waiting days for screening results.' },
                  { icon: Lock, title: 'HIPAA-Grade Security', desc: 'All patient data is encrypted, anonymized, and stored securely.' },
                  { icon: Bot, title: 'Explainable AI', desc: 'Every prediction comes with clinical-grade explanations, not black-box results.' },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-10 h-10 bg-cyan-500/15 border border-cyan-500/25 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card p-8"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Detection Accuracy by Disorder</h3>
              <div className="space-y-5">
                {[
                  { disorder: 'Autism Spectrum Disorder', accuracy: 93, color: 'from-cyan-500 to-cyan-600' },
                  { disorder: 'ADHD', accuracy: 89, color: 'from-teal-500 to-teal-600' },
                  { disorder: 'Down Syndrome', accuracy: 97, color: 'from-emerald-500 to-emerald-600' },
                  { disorder: 'Developmental Delays', accuracy: 91, color: 'from-blue-500 to-cyan-500' },
                  { disorder: 'Motor Disorders', accuracy: 88, color: 'from-teal-400 to-emerald-500' },
                ].map(({ disorder, accuracy, color }, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">{disorder}</span>
                      <span className="font-semibold text-white">{accuracy}%</span>
                    </div>
                    <div className="h-2 bg-slate-700/80 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${color} rounded-full`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${accuracy}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: i * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-cyan-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-cyan-300">Peer-Reviewed Validation</p>
                    <p className="text-xs text-slate-400 mt-0.5">Validated across 12,000+ case studies published in Nature Medicine and The Lancet Digital Health</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── DISORDERS ────────────────────────────────────────── */}
      <section className="py-24 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Disorders We Detect</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Specialized AI models trained for each condition</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Autism Spectrum Disorder', abbr: 'ASD', prevalence: '1 in 36',
                image: 'https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=400',
                markers: ['Eye contact avoidance', 'Social smile delay', 'Restricted movement', 'Sensory response'],
                color: 'cyan',
              },
              {
                name: 'ADHD', abbr: 'ADHD', prevalence: '1 in 11',
                image: 'https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=400',
                markers: ['Attention patterns', 'Hyperactive movement', 'Impulsive responses', 'Sleep disruption'],
                color: 'teal',
              },
              {
                name: 'Down Syndrome', abbr: 'DS', prevalence: '1 in 700',
                image: 'https://images.pexels.com/photos/1557251/pexels-photo-1557251.jpeg?auto=compress&cs=tinysrgb&w=400',
                markers: ['Facial feature analysis', 'Muscle tone assessment', 'Reflex evaluation', 'Chromosomal markers'],
                color: 'emerald',
              },
              {
                name: 'Developmental Delay', abbr: 'DD', prevalence: '1 in 6',
                image: 'https://images.pexels.com/photos/1912868/pexels-photo-1912868.jpeg?auto=compress&cs=tinysrgb&w=400',
                markers: ['Motor milestone lag', 'Cognitive indicators', 'Language onset', 'Social development'],
                color: 'cyan',
              },
            ].map(({ name, abbr, prevalence, image, markers, color }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card overflow-hidden group hover:border-cyan-500/30 transition-all"
              >
                <div className="relative h-36 overflow-hidden">
                  <img src={image} alt={name} className="w-full h-full object-cover opacity-40 group-hover:opacity-55 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <span className="text-2xl font-bold text-white">{abbr}</span>
                    <span className="ml-2 text-xs text-slate-400">{prevalence} births</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">{name}</h3>
                  <ul className="space-y-1.5">
                    {markers.map(marker => (
                      <li key={marker} className="flex items-center gap-2 text-xs text-slate-400">
                        <ChevronRight className="w-3 h-3 text-cyan-400 shrink-0" />
                        {marker}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section id="testimonials" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="text-xs text-teal-400 font-semibold uppercase tracking-widest">Testimonials</span>
            <h2 className="text-4xl font-bold text-white mt-3">Trusted by Clinicians Worldwide</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Dr. Sarah Chen', role: 'Pediatric Neurologist, UCSF',
                avatar: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=100',
                quote: 'NeoMind has revolutionized our neonatal screening protocol. We identified 3 ASD cases in the first month that traditional methods missed.',
              },
              {
                name: 'Dr. James Okafor', role: 'Developmental Pediatrician, NHS',
                avatar: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=100',
                quote: 'The explainable AI feature is game-changing. I can show parents exactly what the AI detected and why, building trust in the process.',
              },
              {
                name: 'Dr. Priya Sharma', role: 'Neonatologist, AIIMS Delhi',
                avatar: 'https://images.pexels.com/photos/8376191/pexels-photo-8376191.jpeg?auto=compress&cs=tinysrgb&w=100',
                quote: 'Reduced our average time-to-diagnosis from 18 months to under 3 weeks. The impact on developmental outcomes has been remarkable.',
              },
            ].map(({ name, role, avatar, quote }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-6 flex flex-col"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed flex-1 mb-4">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-white">{name}</p>
                    <p className="text-xs text-slate-400">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-r from-cyan-950/50 via-teal-950/30 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp} className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs text-cyan-400 font-medium">Join 200+ healthcare institutions</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Start Detecting Early.<br />
              <span className="gradient-text">Change a Life Today.</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-xl mx-auto">
              Start your free 30-day trial. No credit card required. Full access to all AI analysis tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn-primary gap-2 text-base py-3.5 px-8">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-outline text-base py-3.5 px-8">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────── */}
      <section id="contact" className="py-24 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div {...fadeUp}>
              <span className="text-xs text-cyan-400 font-semibold uppercase tracking-widest">Contact</span>
              <h2 className="text-3xl font-bold text-white mt-3 mb-4">Get in Touch</h2>
              <p className="text-slate-400 mb-8">
                Have questions about integrating NeoMind into your clinical workflow? Our medical AI team is here to help.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: 'contact@neomind.ai' },
                  { icon: Phone, label: '+1 (800) NEO-MIND' },
                  { icon: MapPin, label: '400 Medical Innovation Dr, San Francisco, CA 94105' },
                ].map(({ icon: Icon, label }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <p className="text-sm text-slate-300 mt-2">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card p-8"
            >
              <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Full Name</label>
                    <input type="text" placeholder="Dr. Jane Smith" className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Institution</label>
                    <input type="text" placeholder="Hospital / Clinic" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Email</label>
                  <input type="email" placeholder="doctor@hospital.com" className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Message</label>
                  <textarea rows={4} placeholder="Tell us about your needs..." className="input-field resize-none" />
                </div>
                <button type="submit" className="btn-primary w-full gap-2">
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
