import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import API from '../api/client';

interface User { _id: string; name: string; email: string; role: string; tenantId: { _id: string; name: string }; departmentId?: { _id: string; name: string }; }

interface AuthCtx { user: User | null; token: string | null; login: (email: string, password: string) => Promise<void>; register: (name: string, email: string, password: string, organizationName: string) => Promise<void>; logout: () => void; loading: boolean; }

const AuthContext = createContext<AuthCtx>(null!);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      API.get('/auth/me').then(({ data }) => setUser(data.user)).catch(() => { logout(); }).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string, organizationName: string) => {
    const { data } = await API.post('/auth/register', { name, email, password, organizationName });
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => { localStorage.clear(); setToken(null); setUser(null); };

  return <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
