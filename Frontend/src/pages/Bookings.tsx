import { useState, useEffect } from 'react';
import API from '../api/client';
import { CalendarClock, Plus, XCircle, CalendarDays } from 'lucide-react';
import CalendarPicker from '../components/CalendarPicker';

export default function Bookings() {
  const [resources, setResources] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [form, setForm] = useState({ resourceId: '', startTime: '', endTime: '' });
  const [error, setError] = useState('');
  const [calStart, setCalStart] = useState<Date | null>(null);
  const [calEnd, setCalEnd] = useState<Date | null>(null);

  const load = async () => {
    const [r, b] = await Promise.all([
      API.get('/resources'), API.get('/bookings')
    ]);
    setResources(r.data.data);
    setBookings(b.data.data);
  };
  useEffect(() => { load(); }, []);

  const createBooking = async () => {
    setError('');
    if (!form.resourceId) { setError('Select a resource'); return; }
    if (!form.startTime || !form.endTime) { setError('Select start and end time'); return; }
    try {
      await API.post('/bookings', form);
      setShowForm(false);
      setShowCalendar(false);
      setForm({ resourceId: '', startTime: '', endTime: '' });
      setCalStart(null); setCalEnd(null);
      load();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Booking failed');
    }
  };

  const cancelBooking = async (id: string) => {
    await API.put(`/bookings/${id}/cancel`);
    load();
  };

  const handleCalendarSelect = (start: Date, end: Date | null) => {
    setCalStart(start);
    setCalEnd(end);
    if (start && end) {
      setForm(f => ({
        ...f,
        startTime: start.toISOString().slice(0, 16),
        endTime: end.toISOString().slice(0, 16),
      }));
    } else if (start) {
      const defaultEnd = new Date(start);
      defaultEnd.setHours(defaultEnd.getHours() + 2);
      setForm(f => ({
        ...f,
        startTime: start.toISOString().slice(0, 16),
        endTime: defaultEnd.toISOString().slice(0, 16),
      }));
    }
  };

  const filteredBookings = selectedResource ? bookings.filter((b: any) => b.resourceId?._id === selectedResource) : bookings;

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { upcoming: 'badge-blue', ongoing: 'badge-green', completed: 'badge-gray', cancelled: 'badge-red' };
    return <span className={map[s] || 'badge-gray'}>{s}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Resource Booking</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> {showForm ? 'Cancel' : 'Book Resource'}
        </button>
      </div>

      {error && <div className="bg-gabik-red-bg text-gabik-red text-sm p-3 rounded-lg">{error}</div>}

      {showForm && (
        <div className="card p-4 space-y-4">
          <h2>New Booking</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gabik-ink block mb-1.5">Resource</label>
              <select value={form.resourceId} onChange={e => setForm(f => ({ ...f, resourceId: e.target.value }))} className="input-field">
                <option value="">Select Resource</option>
                {resources.map((r: any) => <option key={r._id} value={r._id}>{r.name}</option>)}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className={`btn-secondary flex items-center gap-2 text-sm w-full justify-center ${showCalendar ? 'bg-gabik-100' : ''}`}
              >
                <CalendarDays size={16} /> {showCalendar ? 'Hide Calendar' : (calStart ? `${calStart.toLocaleDateString()}${calEnd ? ` — ${calEnd.toLocaleDateString()}` : ''}` : 'Pick Dates')}
              </button>
            </div>
          </div>

          {showCalendar && (
            <CalendarPicker
              selectedStart={calStart}
              selectedEnd={calEnd}
              onSelect={handleCalendarSelect}
              minDate={new Date()}
            />
          )}

          {form.startTime && form.endTime && (
            <div className="grid grid-cols-2 gap-3 text-sm bg-gabik-50 p-3 rounded-lg">
              <div>
                <span className="text-gabik-ink-muted">Start:</span>{' '}
                <span className="font-medium">{new Date(form.startTime).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gabik-ink-muted">End:</span>{' '}
                <span className="font-medium">{new Date(form.endTime).toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={createBooking} className="btn-primary text-sm">Confirm Booking</button>
            <button onClick={() => { setShowForm(false); setShowCalendar(false); }} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <select value={selectedResource} onChange={e => setSelectedResource(e.target.value)} className="input-field w-auto">
          <option value="">All Resources</option>
          {resources.map((r: any) => <option key={r._id} value={r._id}>{r.name}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gabik-50 text-gabik-ink-muted">
              <tr>
                <th className="text-left p-3">Resource</th>
                <th className="text-left p-3">Booked By</th>
                <th className="text-left p-3">Start</th>
                <th className="text-left p-3">End</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gabik-border">
              {filteredBookings.map((b: any) => (
                <tr key={b._id} className="hover:bg-gabik-50">
                  <td className="p-3 font-medium">{b.resourceId?.name || '-'}</td>
                  <td className="p-3">{b.bookedBy?.name || '-'}</td>
                  <td className="p-3 text-xs">{new Date(b.startTime).toLocaleString()}</td>
                  <td className="p-3 text-xs">{new Date(b.endTime).toLocaleString()}</td>
                  <td className="p-3">{statusBadge(b.status)}</td>
                  <td className="p-3">{b.status === 'upcoming' && <button onClick={() => cancelBooking(b._id)} className="text-gabik-red hover:underline text-xs flex items-center gap-1"><XCircle size={14} /> Cancel</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
