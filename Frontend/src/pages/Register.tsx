import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ShieldCheck, BarChart3, CalendarClock, ArrowRight } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', organizationName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await register(form.name, form.email, form.password, form.organizationName); navigate('/dashboard'); }
    catch (err: any) {
      if (!err.response) setError('Cannot connect to server. Make sure the backend is running on port 5000.');
      else setError(err.response?.data?.error?.message || 'Registration failed');
    }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Graphics + Brand */}
      <div className="hidden lg:flex flex-1 flex-col justify-between relative overflow-hidden bg-gradient-to-br from-gabik-700 via-gabik-500 to-gabik-teal p-12">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute rounded-full opacity-10" style={{
              width: `${100 + Math.random() * 300}px`,
              height: `${100 + Math.random() * 300}px`,
              background: 'radial-gradient(circle, white 0%, transparent 70%)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `drift ${15 + Math.random() * 20}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 8}s`,
            }} />
          ))}
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-2xl font-bold text-white">G</span>
            </div>
            <span className="text-2xl font-bold text-white">Gabik</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-bold text-white leading-tight">Join Gabik Today</h1>
          <p className="text-lg text-white/80 mt-4 leading-relaxed">
            Start managing your enterprise assets, resources, and operations with a powerful all-in-one platform designed for teams of any size.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: ShieldCheck, text: 'Multi-tenant security & permissions' },
              { icon: BarChart3, text: 'Live dashboards & exportable reports' },
              { icon: CalendarClock, text: 'Asset booking & maintenance scheduling' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/90">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center"><Icon size={18} /></div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/50 text-sm">
          &copy; {new Date().getFullYear()} Gabik. All rights reserved.
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gabik-300 to-gabik-500 flex items-center justify-center">
              <span className="text-lg font-bold text-white">G</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gabik-700 to-gabik-500 bg-clip-text text-transparent">Gabik</span>
          </div>

          <h2 className="text-2xl font-bold text-gabik-ink">Create account</h2>
          <p className="text-sm text-gabik-ink-muted mt-1">Start managing your assets in minutes</p>

          {error && <div className="bg-gabik-red-bg text-gabik-red text-sm p-3 rounded-lg mt-5 flex items-start gap-2"><span>⚠</span><span>{error}</span></div>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gabik-ink block mb-1.5">Full Name</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gabik-ink-muted" size="16" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
                <input placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field pl-10" required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gabik-ink block mb-1.5">Email</label>
              <input type="email" placeholder="you@organization.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gabik-ink block mb-1.5">Password</label>
              <input type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input-field" required minLength={6} />
            </div>
            <div>
              <label className="text-sm font-medium text-gabik-ink block mb-1.5">Organization</label>
              <input placeholder="Your Company Name" value={form.organizationName} onChange={e => setForm(f => ({ ...f, organizationName: e.target.value }))} className="input-field" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? 'Creating account...' : <>Create Account <UserPlus size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gabik-ink-muted mt-6">
            Already have an account? <Link to="/login" className="text-gabik-500 font-medium hover:underline">Sign in</Link>
          </p>
          <p className="text-center text-xs text-gabik-ink-muted mt-4 leading-relaxed">
            Sign up creates an Employee account. <br className="hidden sm:inline" />Admin roles are later assigned by an existing Admin.
            <br />
            <Link to="/" className="text-gabik-500 hover:underline mt-1 inline-block"><ArrowRight size={12} className="inline" /> Back to Home</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -30px) scale(1.1); }
          66% { transform: translate(-15px, 20px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
