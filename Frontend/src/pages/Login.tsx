import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

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
    catch (err: any) { setError(err.response?.data?.error?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #C9F5D6 0%, #4FCB6E 55%, #1E9E4A 100%)' }}>
      <div className="w-full max-w-md bg-white rounded-card shadow-card p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gabik-300 to-gabik-500 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">G</span>
          </div>
          <h1 className="text-2xl font-semibold">Welcome to Gabik</h1>
          <p className="text-sm text-gabik-ink-muted mt-1">Sign in to your account</p>
        </div>
        {error && <div className="bg-gabik-red-bg text-gabik-red text-sm p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required /></div>
          <div><input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p className="text-center text-sm text-gabik-ink-muted mt-6">
          Don't have an account? <Link to="/register" className="text-gabik-500 font-medium hover:underline">Sign up</Link>
        </p>
        <p className="text-center text-xs text-gabik-ink-muted mt-3">Sign up creates an Employee account. Admin roles are assigned later.</p>
      </div>
    </div>
  );
}
