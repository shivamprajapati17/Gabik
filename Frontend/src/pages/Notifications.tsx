import { useState, useEffect } from 'react';
import API from '../api/client';
import { Bell, CheckCheck, AlertTriangle, ArrowLeftRight, Wrench, CalendarClock, Package } from 'lucide-react';

const TYPE_ICONS: Record<string, any> = {
  asset_assigned: Package, transfer_requested: ArrowLeftRight, transfer_approved: ArrowLeftRight,
  maintenance_approved: Wrench, maintenance_rejected: Wrench, booking_confirmed: CalendarClock,
  booking_cancelled: CalendarClock, overdue_return: AlertTriangle, audit_discrepancy: AlertTriangle
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<string>('all');

  const load = async () => {
    const params = filter !== 'all' ? `?type=${filter}` : '';
    const { data } = await API.get(`/notifications${params}`);
    setNotifications(data.data);
    setUnreadCount(data.unreadCount);
  };
  useEffect(() => { load(); }, [filter]);

  const markAllRead = async () => {
    await API.put('/notifications/mark-all-read');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-sm py-1.5">
            <CheckCheck size={16} /> Mark All Read ({unreadCount})
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'asset_assigned', 'maintenance_approved', 'booking_confirmed', 'overdue_return', 'audit_discrepancy'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${filter === f ? 'bg-gabik-500 text-white' : 'bg-gabik-100 text-gabik-ink-muted hover:bg-gabik-300'}`}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="card divide-y divide-gabik-border">
        {notifications.length === 0 ? (
          <p className="p-6 text-sm text-gabik-ink-muted text-center">No notifications</p>
        ) : (
          notifications.map((n: any) => {
            const Icon = TYPE_ICONS[n.type] || Bell;
            return (
              <div key={n._id} className={`p-4 flex items-start gap-3 ${!n.readAt ? 'bg-gabik-50' : ''}`}>
                <div className={`p-2 rounded-lg ${!n.readAt ? 'bg-gabik-100' : 'bg-gray-50'}`}>
                  <Icon size={16} className={!n.readAt ? 'text-gabik-700' : 'text-gabik-ink-muted'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize">{n.type.replace(/_/g, ' ')}</p>
                  {n.payload?.message && <p className="text-xs text-gabik-ink-muted mt-0.5">{n.payload.message}</p>}
                </div>
                <span className="text-xs text-gabik-ink-muted whitespace-nowrap">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
