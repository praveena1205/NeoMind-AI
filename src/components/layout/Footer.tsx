import { Link } from 'react-router-dom';
import { Brain, Mail, Phone, MapPin, Twitter, Linkedin, Github, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">Neo</span>
                <span className="text-lg font-bold text-cyan-400">Mind</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI-powered early detection of neurodevelopmental disorders in newborns.
              Empowering clinicians with intelligent diagnostics.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {['Dashboard', 'Patient Management', 'Video Analysis', 'Audio Analysis', 'AI Insights', 'Reports'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Disorders */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Detection Areas</h4>
            <ul className="space-y-2.5">
              {['Autism Spectrum Disorder', 'ADHD', 'Down Syndrome', 'Developmental Delays', 'Motor Disorders', 'Cognitive Assessment'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <a href="mailto:contact@neomind.ai" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                  contact@neomind.ai
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-400">+1 (800) NEO-MIND</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-400">Medical Innovation Hub, San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; 2026 NeoMind AI. All rights reserved. HIPAA Compliant &bull; FDA Class II Device
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>Built with</span>
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
            <span>for better newborn care</span>
          </div>
          <div className="flex items-center gap-4">
            {['Privacy Policy', 'Terms of Service', 'HIPAA Notice'].map(item => (
              <a key={item} href="#" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
