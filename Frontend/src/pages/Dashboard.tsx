import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/client';
import { Package, Users, CalendarClock, ArrowLeftRight, AlertTriangle, Plus, BookOpen, Wrench } from 'lucide-react';

interface Kpis { available: number; allocated: number; activeBookings: number; pendingTransfers: number; overdueReturns: number; }

export default function Dashboard() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [overdue, setOverdue] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/dashboard').then(({ data }) => { setKpis(data.data.kpis); setOverdue(data.data.overdueAllocations); setActivity(data.data.recentActivity); });
  }, []);

  const kpiCards = kpis ? [
    { label: 'Available', value: kpis.available, icon: Package, color: 'text-gabik-500' },
    { label: 'Allocated', value: kpis.allocated, icon: Users, color: 'text-gabik-blue' },
    { label: 'Active Bookings', value: kpis.activeBookings, icon: CalendarClock, color: 'text-gabik-teal' },
    { label: 'Pending Transfers', value: kpis.pendingTransfers, icon: ArrowLeftRight, color: 'text-gabik-amber' },
    { label: 'Overdue Returns', value: kpis.overdueReturns, icon: AlertTriangle, color: 'text-gabik-red' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Today's Overview</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/assets?action=register')} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Register Asset</button>
          <button onClick={() => navigate('/bookings')} className="btn-secondary flex items-center gap-2 text-sm"><BookOpen size={16} /> Book Resource</button>
          <button onClick={() => navigate('/maintenance')} className="btn-secondary flex items-center gap-2 text-sm"><Wrench size={16} /> Raise Request</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((k, i) => (
          <div key={i} className="card p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(135deg, #C9F5D6 0%, #4FCB6E 55%, #1E9E4A 100%)' }} />
            <div className="flex items-center justify-between mb-2">
              <k.icon size={20} className={k.color} />
            </div>
            <p className="text-2xl font-bold" style={{ color: '#CFEA3A' }}>{k.value}</p>
            <p className="text-xs text-gabik-ink-muted mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {overdue.length > 0 && (
        <div className="bg-gabik-red-bg border border-gabik-red rounded-card p-4">
          <div className="flex items-center gap-2 text-gabik-red font-medium mb-3"><AlertTriangle size={18} /> {overdue.length} asset(s) overdue — action required</div>
          <div className="space-y-2">
            {overdue.map((o: any) => (
              <div key={o._id} className="flex items-center justify-between text-sm bg-white/80 p-2 rounded-lg">
                <span>{o.assetId?.name} ({o.assetId?.assetTag}) — held by {o.holderUserId?.name}</span>
                <span className="text-gabik-red text-xs">Due: {new Date(o.expectedReturnDate).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-4">
        <h2 className="mb-3">Recent Activity</h2>
        {activity.length === 0 ? <p className="text-sm text-gabik-ink-muted">No recent activity</p> : (
          <div className="space-y-2">
            {activity.map((a: any) => (
              <div key={a._id} className="flex items-center gap-3 text-sm py-2 border-b border-gabik-border last:border-0">
                <div className="w-7 h-7 rounded-full bg-gabik-100 flex items-center justify-center text-xs font-medium text-gabik-700">
                  {a.actorUserId?.name?.[0] || '?'}
                </div>
                <div className="flex-1">
                  <span className="font-medium">{a.actorUserId?.name}</span>{' '}
                  <span className="text-gabik-ink-muted">{a.action} {a.entityType}</span>
                </div>
                <span className="text-xs text-gabik-ink-muted">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
