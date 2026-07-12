import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogIn, UserPlus, ArrowRight, Package, CalendarClock, Wrench, ClipboardCheck, BarChart3, ShieldCheck, Building2 } from 'lucide-react';

const features = [
  { icon: Package, title: 'Asset Lifecycle Tracking', body: 'Track every asset from procurement to retirement with full audit trails, condition monitoring, and automated depreciation schedules.' },
  { icon: CalendarClock, title: 'Smart Resource Booking', body: 'Book rooms, equipment, and shared resources through an intuitive calendar system with conflict detection and approval workflows.' },
  { icon: Wrench, title: 'Maintenance Orchestration', body: 'Schedule preventive and corrective maintenance with automated notifications, vendor coordination, and SLA tracking.' },
  { icon: ClipboardCheck, title: 'Audit Cycle Management', body: 'Run periodic audit cycles with role-assigned auditors, real-time verification, and one-way sealed closure for compliance.' },
  { icon: BarChart3, title: 'Real-Time Analytics', body: 'Executive dashboards with live KPIs, exportable reports, and trend analysis across departments and asset categories.' },
  { icon: ShieldCheck, title: 'Role-Based Access Control', body: 'Four-tier permission model — Admin, Asset Manager, Department Head, Employee — ensuring data security at every level.' },
];

const stats = [
  { value: '10K+', label: 'Assets Tracked' },
  { value: '500+', label: 'Organizations' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
];

export default function Homepage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden relative bg-gradient-to-br from-gabik-50 via-white to-gabik-100">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[100dvh] flex flex-col">
        {/* Animated particle field */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${4 + (i % 5) * 3}px`,
                height: `${4 + (i % 5) * 3}px`,
                background: ['#4FCB6E', '#A9E6B4', '#2FBF9E', '#CFEA3A', '#1E9E4A'][i % 5],
                left: `${5 + (i * 7) % 90}%`,
                top: `${10 + (i * 13) % 80}%`,
                opacity: 0.15 + (i % 5) * 0.05,
                animation: `particle-drift ${12 + (i % 8) * 3}s ease-in-out infinite`,
                animationDelay: `${i * 0.7}s`,
              }}
            />
          ))}
        </div>

        {/* Morphing gradient orb */}
        <div className="absolute top-1/4 right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none opacity-20" style={{
          background: 'radial-gradient(circle, #4FCB6E 0%, #2FBF9E 40%, transparent 70%)',
          animation: 'morph-orb 16s ease-in-out infinite',
        }} />
        <div className="absolute bottom-1/4 left-[-8%] w-[400px] h-[400px] rounded-full pointer-events-none opacity-15" style={{
          background: 'radial-gradient(circle, #A9E6B4 0%, #CFEA3A 40%, transparent 70%)',
          animation: 'morph-orb 20s ease-in-out infinite reverse',
        }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(#1E9E4A 1px, transparent 1px), linear-gradient(90deg, #1E9E4A 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* Nav bar */}
        <nav className="relative z-10 flex items-center justify-between px-6 lg:px-16 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gabik-300 to-gabik-500 flex items-center justify-center shadow-lg" style={{ animation: 'logo-breathe 3s ease-in-out infinite' }}>
              <span className="text-xl font-bold text-white">G</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gabik-700 to-gabik-500 bg-clip-text text-transparent">Gabik</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5">
                <LayoutDashboard size={16} /> Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-secondary flex items-center gap-2 text-sm px-5 py-2.5">
                  <LogIn size={16} /> Sign In
                </Link>
                <Link to="/register" className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5">
                  <UserPlus size={16} /> Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-16 lg:pb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gabik-100 text-gabik-700 text-sm font-medium mb-8 border border-gabik-300/40" style={{ animation: 'fade-slide-up 0.8s ease-out both' }}>
            <span className="w-2 h-2 rounded-full bg-gabik-500 animate-pulse" />
            Enterprise Asset and Resource Management
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold leading-tight max-w-4xl" style={{ animation: 'fade-slide-up 0.8s 0.15s ease-out both' }}>
            Manage Your{' '}
            <span className="bg-gradient-to-r from-gabik-700 via-gabik-500 to-gabik-teal bg-clip-text text-transparent inline-block" style={{ animation: 'text-shimmer 4s ease-in-out infinite' }}>
              Assets and Resources
            </span>
            {' '}with Ease
          </h1>

          <p className="text-lg lg:text-xl text-gabik-ink-muted max-w-2xl mt-6 leading-relaxed" style={{ animation: 'fade-slide-up 0.8s 0.3s ease-out both' }}>
            Track allocations, book resources, schedule maintenance, and run audits — all in one platform designed for modern enterprises.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-10" style={{ animation: 'fade-slide-up 0.8s 0.45s ease-out both' }}>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn-primary flex items-center gap-2 px-8 py-3.5 text-base">
                Go to Dashboard <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <Link to="/register" className="btn-primary flex items-center gap-2 px-8 py-3.5 text-base">
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-secondary flex items-center gap-2 px-8 py-3.5 text-base">
                  Sign In
                </Link>
              </>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-16" style={{ animation: 'fade-slide-up 0.8s 0.6s ease-out both' }}>
            {['Asset Tracking', 'Resource Booking', 'Maintenance', 'Audit Cycles', 'Reports'].map((f, i) => (
              <span
                key={f}
                className="px-5 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-gabik-border text-sm text-gabik-ink-muted font-medium shadow-sm hover:bg-white/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                style={{ animation: `fade-slide-up 0.6s ${0.7 + i * 0.1}s ease-out both` }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="relative z-10 px-6 lg:px-16 py-24 lg:py-32 max-w-6xl mx-auto">
        <div className="text-center mb-16 lg:mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gabik-100 text-gabik-700 text-sm font-medium mb-4 border border-gabik-300/40">
            Platform Capabilities
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-gabik-ink">Everything you need to manage your enterprise</h2>
          <p className="text-gabik-ink-muted text-lg max-w-2xl mx-auto mt-4">
            From asset procurement to retirement, Gabik provides complete visibility and control over your organization's resources.
          </p>
        </div>

        <div className="space-y-20 lg:space-y-28">
          {features.map((feat, i) => {
            const isReversed = i % 2 === 1;
            const Icon = feat.icon;
            return (
              <div key={feat.title} className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-10 lg:gap-16 group`}>
                <div className="flex-1">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-gabik-100 to-gabik-300 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500`}>
                    <Icon size={28} className="text-gabik-700" />
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gabik-ink mb-3">{feat.title}</h3>
                  <p className="text-gabik-ink-muted text-lg leading-relaxed max-w-prose">{feat.body}</p>
                </div>
                <div className="flex-1 w-full">
                  <div className="rounded-3xl bg-gradient-to-br from-gabik-50 to-gabik-100 border border-gabik-border p-8 lg:p-10 aspect-[4/3] flex items-center justify-center group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-500">
                    <Icon size={80} className="text-gabik-300" strokeWidth={1} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="relative z-10 px-6 lg:px-16 py-20 lg:py-28">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-gabik-700 via-gabik-500 to-gabik-teal p-10 lg:p-16 text-center">
          <h2 className="text-2xl lg:text-4xl font-bold text-white mb-3">Trusted by growing enterprises</h2>
          <p className="text-white/70 text-lg mb-12 max-w-2xl mx-auto">
            Organizations of all sizes rely on Gabik to keep their assets and operations running smoothly.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((s) => (
              <div key={s.value} className="group">
                <div className="text-3xl lg:text-5xl font-bold text-white group-hover:scale-110 transition-transform duration-500">{s.value}</div>
                <div className="text-white/60 text-sm lg:text-base mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative z-10 px-6 lg:px-16 py-20 lg:py-28 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-5xl font-bold text-gabik-ink">Ready to get started?</h2>
          <p className="text-gabik-ink-muted text-lg mt-4">
            Join thousands of organizations managing their assets with Gabik. No credit card required.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn-primary flex items-center gap-2 px-8 py-3.5 text-base">
                Go to Dashboard <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <Link to="/register" className="btn-primary flex items-center gap-2 px-8 py-3.5 text-base">
                  Start Free Trial <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-secondary flex items-center gap-2 px-8 py-3.5 text-base">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-gabik-border bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-16 py-14 lg:py-18">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gabik-300 to-gabik-500 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">G</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gabik-700 to-gabik-500 bg-clip-text text-transparent">Gabik</span>
              </div>
              <p className="text-gabik-ink-muted text-sm leading-relaxed max-w-sm">
                Enterprise asset and resource management platform. Track, book, maintain, and audit everything your organization owns.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-gabik-ink text-sm mb-4 uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Integrations', 'Changelog'].map((l) => (
                  <li key={l}><a href="#" className="text-gabik-ink-muted text-sm hover:text-gabik-500 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-gabik-ink text-sm mb-4 uppercase tracking-wider">Company</h4>
              <ul className="space-y-3">
                {['About', 'Blog', 'Careers', 'Contact'].map((l) => (
                  <li key={l}><a href="#" className="text-gabik-ink-muted text-sm hover:text-gabik-500 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Legal & Social */}
            <div>
              <h4 className="font-semibold text-gabik-ink text-sm mb-4 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3 mb-6">
                {['Privacy', 'Terms', 'Security'].map((l) => (
                  <li key={l}><a href="#" className="text-gabik-ink-muted text-sm hover:text-gabik-500 transition-colors">{l}</a></li>
                ))}
              </ul>
              <div className="flex items-center gap-3">
                {[
                  { viewBox: '0 0 24 24', path: 'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z' },
                  { viewBox: '0 0 24 24', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                  { viewBox: '0 0 24 24', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                ].map(({ viewBox, path }, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg bg-gabik-50 flex items-center justify-center text-gabik-ink-muted hover:bg-gabik-100 hover:text-gabik-700 transition-all">
                    <svg viewBox={viewBox} fill="currentColor" width="16" height="16"><path d={path} /></svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gabik-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gabik-ink-muted">
            <p>&copy; {new Date().getFullYear()} Gabik. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <Building2 size={14} />
              <span>Built for modern enterprises</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes particle-drift {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
          25% { transform: translate(30px, -40px) scale(1.2); }
          50% { transform: translate(-20px, -60px) scale(0.8); opacity: 0.35; }
          75% { transform: translate(10px, -30px) scale(1.1); }
        }
        @keyframes morph-orb {
          0%, 100% { border-radius: 50%; transform: scale(1) rotate(0deg); }
          33% { border-radius: 40% 60% 60% 40%; transform: scale(1.1) rotate(30deg); }
          66% { border-radius: 60% 40% 40% 60%; transform: scale(0.95) rotate(-20deg); }
        }
        @keyframes logo-breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 16px rgba(79, 203, 110, 0.2); }
          50% { transform: scale(1.05); box-shadow: 0 8px 32px rgba(79, 203, 110, 0.35); }
        }
        @keyframes text-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-slide-up {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
