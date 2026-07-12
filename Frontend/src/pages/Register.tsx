import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', organizationName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await register(form.name, form.email, form.password, form.organizationName); navigate('/dashboard'); }
    catch (err: any) { setError(err.response?.data?.error?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #C9F5D6 0%, #4FCB6E 55%, #1E9E4A 100%)' }}>
      <div className="w-full max-w-md bg-white rounded-card shadow-card p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gabik-300 to-gabik-500 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">G</span>
          </div>
          <h1 className="text-2xl font-semibold">Create Account</h1>
          <p className="text-sm text-gabik-ink-muted mt-1">Start managing your assets</p>
        </div>
        {error && <div className="bg-gabik-red-bg text-gabik-red text-sm p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><input placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" required /></div>
          <div><input type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" required /></div>
          <div><input type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input-field" required minLength={6} /></div>
          <div><input placeholder="Organization Name" value={form.organizationName} onChange={e => setForm(f => ({ ...f, organizationName: e.target.value }))} className="input-field" required /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p className="text-center text-sm text-gabik-ink-muted mt-6">
          Already have an account? <Link to="/login" className="text-gabik-500 font-medium hover:underline">Sign in</Link>
        </p>
        <p className="text-center text-xs text-gabik-ink-muted mt-3">Sign up creates an Employee account. Admin roles are assigned later.</p>
      </div>
    </div>
  );
}
