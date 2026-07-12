import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ShieldCheck, BarChart3, CalendarClock, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/dashboard'); }
    catch (err: any) {
      if (!err.response) setError('Cannot connect to server. Make sure the backend is running on port 5000.');
      else setError(err.response?.data?.error?.message || 'Invalid email or password');
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
          <h1 className="text-4xl font-bold text-white leading-tight">Welcome Back to Gabik</h1>
          <p className="text-lg text-white/80 mt-4 leading-relaxed">
            Continue managing your enterprise assets, resource bookings, maintenance schedules, and audit cycles from one unified dashboard.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: ShieldCheck, text: 'Role-based access control' },
              { icon: BarChart3, text: 'Real-time analytics & reports' },
              { icon: CalendarClock, text: 'Smart resource scheduling' },
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

          <h2 className="text-2xl font-bold text-gabik-ink">Sign in</h2>
          <p className="text-sm text-gabik-ink-muted mt-1">Enter your credentials to access your account</p>

          {error && <div className="bg-gabik-red-bg text-gabik-red text-sm p-3 rounded-lg mt-5 flex items-start gap-2"><span>⚠</span><span>{error}</span></div>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gabik-ink block mb-1.5">Email</label>
              <input type="email" placeholder="you@organization.com" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gabik-ink block mb-1.5">Password</label>
              <input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? 'Signing in...' : <>Sign In <LogIn size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gabik-ink-muted mt-6">
            Don't have an account? <Link to="/register" className="text-gabik-500 font-medium hover:underline">Create one</Link>
          </p>
          <p className="text-center text-xs text-gabik-ink-muted mt-4 leading-relaxed">
            Sign up creates an Employee account. <br className="hidden sm:inline" />Admin roles are assigned later by an existing Admin.
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
