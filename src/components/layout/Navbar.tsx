import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Menu, X, ChevronDown, Bell, User,
  LogOut, Settings, LayoutDashboard, Users,
  FileVideo, Mic, Lightbulb, FileText, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#benefits', label: 'AI Benefits' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#contact', label: 'Contact' },
];

const dashboardLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/video-analysis', label: 'Video Analysis', icon: FileVideo },
  { href: '/audio-analysis', label: 'Audio Analysis', icon: Mic },
  { href: '/insights', label: 'AI Insights', icon: Lightbulb },
  { href: '/reports', label: 'Reports', icon: FileText },
];

export function Navbar({ isApp = false }: { isApp?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">Neo</span>
              <span className="text-lg font-bold text-cyan-400">Mind</span>
              <p className="text-[9px] text-slate-500 leading-none -mt-0.5 tracking-wide">AI NEURAL DIAGNOSTICS</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {!isApp && !user && navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-slate-400 hover:text-cyan-400 transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}

            {isApp && user && dashboardLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? 'text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-3 py-2 transition-colors"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-sm text-slate-200 hidden sm:block max-w-[120px] truncate">
                      {profile?.full_name || 'User'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden"
                        onMouseLeave={() => setProfileOpen(false)}
                      >
                        <div className="px-4 py-3 border-b border-slate-700">
                          <p className="text-sm font-medium text-white">{profile?.full_name}</p>
                          <p className="text-xs text-slate-400">{profile?.email}</p>
                          <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-full mt-1 inline-block capitalize">
                            {profile?.role}
                          </span>
                        </div>
                        <div className="py-1">
                          <Link to="/settings" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                            <Settings className="w-4 h-4" /> Settings
                          </Link>
                          {profile?.role === 'admin' && (
                            <Link to="/admin" onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                              <ShieldCheck className="w-4 h-4" /> Admin Panel
                            </Link>
                          )}
                          <button onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors w-full text-left">
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors font-medium hidden sm:block">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary text-sm py-2 px-4">
                  Get Started
                </Link>
              </>
            )}

            <button
              className="md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-800 bg-slate-950"
          >
            <div className="px-4 py-4 space-y-1">
              {(!isApp || !user) && navLinks.map(link => (
                <a key={link.href} href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                  {link.label}
                </a>
              ))}
              {isApp && user && dashboardLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 py-2 text-sm transition-colors ${
                      location.pathname === link.href ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
                    }`}>
                    <Icon className="w-4 h-4" /> {link.label}
                  </Link>
                );
              })}
              {!user && (
                <div className="pt-2 border-t border-slate-800 flex gap-2">
                  <Link to="/login" className="flex-1 btn-secondary text-sm py-2 text-center">Sign In</Link>
                  <Link to="/signup" className="flex-1 btn-primary text-sm py-2 text-center">Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export function AppSidebar() {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/patients', label: 'Patients', icon: Users },
    { href: '/video-analysis', label: 'Video Analysis', icon: FileVideo },
    { href: '/audio-analysis', label: 'Audio Analysis', icon: Mic },
    { href: '/insights', label: 'AI Insights', icon: Lightbulb },
    { href: '/reports', label: 'Reports', icon: FileText },
  ];

  const bottomLinks = [
    { href: '/settings', label: 'Settings', icon: Settings },
    ...(profile?.role === 'admin' ? [{ href: '/admin', label: 'Admin Panel', icon: ShieldCheck }] : []),
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-slate-900 border-r border-slate-800 hidden lg:flex flex-col z-40">
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium px-3 mb-2">Navigation</p>
        {links.map(link => {
          const Icon = link.icon;
          const active = location.pathname === link.href;
          return (
            <Link
              key={link.href}
              to={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" style={{ width: '1.125rem', height: '1.125rem' }} />
              {link.label}
              {active && <div className="ml-auto w-1.5 h-1.5 bg-cyan-400 rounded-full" />}
            </Link>
          );
        })}
      </div>

      <div className="px-3 py-4 border-t border-slate-800 space-y-1">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium px-3 mb-2">Account</p>
        {bottomLinks.map(link => {
          const Icon = link.icon;
          const active = location.pathname === link.href;
          return (
            <Link key={link.href} to={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}>
              <Icon className="w-4 h-4" /> {link.label}
            </Link>
          );
        })}
        <button
          onClick={async () => { await signOut(); navigate('/'); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all w-full"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      <div className="px-3 pb-4">
        <div className="glass-card p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">
                {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{profile?.full_name || 'User'}</p>
              <p className="text-[10px] text-slate-500 capitalize">{profile?.role || 'clinician'}</p>
            </div>
            <User className="w-4 h-4 text-slate-500 ml-auto shrink-0" />
          </div>
        </div>
      </div>
    </aside>
  );
}
