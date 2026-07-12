import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Building2, Package, ArrowLeftRight, CalendarClock, Wrench, ClipboardCheck, BarChart3, Bell, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
  { to: '/org-setup', label: 'Organization', icon: Building2, roles: ['admin'] },
  { to: '/assets', label: 'Assets', icon: Package, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
  { to: '/allocations', label: 'Allocation', icon: ArrowLeftRight, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
  { to: '/bookings', label: 'Bookings', icon: CalendarClock, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
  { to: '/audits', label: 'Audits', icon: ClipboardCheck, roles: ['admin', 'asset_manager'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'asset_manager', 'department_head'] },
  { to: '/notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const visibleItems = navItems.filter(i => i.roles.includes(user?.role || ''));

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-56 bg-gabik-50 border-r border-gabik-border transition-transform flex flex-col`}>
        <div className="p-5 border-b border-gabik-border">
          <h1 className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #4FCB6E, #1E9E4A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Gabik</h1>
          <p className="text-xs text-gabik-ink-muted mt-0.5">Asset & Resource Manager</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/dashboard'} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'sidebar-active' : 'text-gabik-ink-muted hover:bg-gabik-100'}`}>
              <Icon size={18} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gabik-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gabik-300 to-gabik-500 flex items-center justify-center text-white text-xs font-bold">{user?.name?.[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gabik-ink-muted capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full text-sm text-gabik-red hover:bg-gabik-red-bg rounded-lg transition-colors mt-1">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gabik-border flex items-center px-4 lg:px-6 gap-3">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <h2 className="text-lg font-semibold flex-1">Gabik</h2>
          <div className="flex items-center gap-2 text-sm text-gabik-ink-muted">
            <span className="hidden sm:inline">{user?.tenantId?.name}</span>
            <span className="hidden sm:inline">|</span>
            <span className="capitalize">{user?.role?.replace('_', ' ')}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
