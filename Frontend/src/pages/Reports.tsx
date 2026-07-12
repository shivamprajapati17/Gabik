import { useState, useEffect } from 'react';
import API from '../api/client';
import { BarChart3, Download, Package, AlertTriangle, CalendarClock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#4FCB6E', '#3E8EF7', '#F0B429', '#F4544D', '#A9E6B4', '#2FBF9E'];

export default function Reports() {
  const [utilization, setUtilization] = useState<any>(null);
  const [idle, setIdle] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      API.get('/reports/utilization'),
      API.get('/reports/idle-assets'),
      API.get('/reports/upcoming-maintenance')
    ]).then(([u, i, um]) => {
      setUtilization(u.data.data);
      setIdle(i.data.data);
      setUpcoming(um.data.data);
    });
  }, []);

  const pieData = utilization ? [
    { name: 'Available', value: utilization.available },
    { name: 'Allocated', value: utilization.allocated },
    { name: 'Maintenance', value: utilization.maintenance },
    { name: 'Lost', value: utilization.lost },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Reports & Analytics</h1>
        <button className="btn-secondary flex items-center gap-2 text-sm"><Download size={16} /> Export Report</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <h2 className="mb-4">Asset Utilization</h2>
          {utilization && (
            <>
              <div className="grid grid-cols-4 gap-3 mb-4 text-center">
                <div><p className="text-2xl font-bold text-gabik-lime">{utilization.totalAssets}</p><p className="text-xs text-gabik-ink-muted">Total</p></div>
                <div><p className="text-2xl font-bold text-gabik-500">{utilization.available}</p><p className="text-xs text-gabik-ink-muted">Available</p></div>
                <div><p className="text-2xl font-bold text-gabik-blue">{utilization.allocated}</p><p className="text-xs text-gabik-ink-muted">Allocated</p></div>
                <div><p className="text-2xl font-bold text-gabik-amber">{utilization.maintenance}</p><p className="text-xs text-gabik-ink-muted">Maintenance</p></div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        <div className="card p-4">
          <h2 className="mb-4">Department-wise Allocation</h2>
          {utilization && utilization.byDepartment && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={utilization.byDepartment.map((d: any) => ({ name: d._id?.name || 'Unassigned', count: d.count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3F7E5" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4FCB6E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4"><Package size={18} className="text-gabik-500" /><h2>Idle Assets</h2></div>
          {idle.length === 0 ? <p className="text-sm text-gabik-ink-muted">No idle assets</p> : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {idle.map((a: any) => (
                <div key={a._id} className="flex items-center justify-between text-sm py-2 border-b border-gabik-border last:border-0">
                  <span>{a.name} <span className="text-xs text-gabik-ink-muted">({a.assetTag})</span></span>
                  <span className="text-xs text-gabik-ink-muted">{a.location || 'No location'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4"><AlertTriangle size={18} className="text-gabik-amber" /><h2>Assets Due for Maintenance</h2></div>
          {upcoming.length === 0 ? <p className="text-sm text-gabik-ink-muted">No assets due for maintenance</p> : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {upcoming.map((a: any) => (
                <div key={a._id} className="flex items-center justify-between text-sm py-2 border-b border-gabik-border last:border-0">
                  <span>{a.name} <span className="text-xs text-gabik-ink-muted">({a.assetTag})</span></span>
                  <span className="text-xs capitalize badge-amber">{a.condition}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
