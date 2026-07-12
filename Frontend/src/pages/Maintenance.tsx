import { useState, useEffect } from 'react';
import API from '../api/client';
import { Plus, Wrench, CheckCircle, XCircle, UserCheck } from 'lucide-react';

const COLUMNS = ['pending', 'approved', 'technician_assigned', 'in_progress', 'resolved'];
const COLUMN_LABELS: Record<string, string> = { pending: 'Pending', approved: 'Approved', technician_assigned: 'Assigned', in_progress: 'In Progress', resolved: 'Resolved' };

export default function Maintenance() {
  const [requests, setRequests] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ assetId: '', issueDescription: '', priority: 'medium' });

  const load = async () => {
    const [r, a] = await Promise.all([
      API.get('/maintenance-requests'), API.get('/assets?limit=100')
    ]);
    setRequests(r.data.data);
    setAssets(a.data.data);
  };
  useEffect(() => { load(); }, []);

  const createRequest = async () => {
    await API.post('/maintenance-requests', form);
    setShowForm(false);
    setForm({ assetId: '', issueDescription: '', priority: 'medium' });
    load();
  };

  const approve = async (id: string) => { await API.put(`/maintenance-requests/${id}/approve`); load(); };
  const reject = async (id: string) => { await API.put(`/maintenance-requests/${id}/reject`); load(); };
  const updateStatus = async (id: string, status: string) => {
    const body: any = { status };
    if (status === 'technician_assigned') {
      const name = prompt('Technician name:');
      if (!name) return;
      body.technicianName = name;
    }
    await API.put(`/maintenance-requests/${id}/status`, body);
    load();
  };

  const priorityColor = (p: string) => {
    const map: Record<string, string> = { critical: 'border-l-gabik-red', high: 'border-l-gabik-amber', medium: 'border-l-gabik-blue', low: 'border-l-gabik-300' };
    return map[p] || 'border-l-gabik-300';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Maintenance</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Raise Request</button>
      </div>

      {showForm && (
        <div className="card p-4">
          <h2 className="mb-4">Raise Maintenance Request</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select value={form.assetId} onChange={e => setForm(f => ({ ...f, assetId: e.target.value }))} className="input-field">
              <option value="">Select Asset</option>
              {assets.map((a: any) => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}
            </select>
            <input placeholder="Describe the issue" value={form.issueDescription} onChange={e => setForm(f => ({ ...f, issueDescription: e.target.value }))} className="input-field md:col-span-1" />
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="input-field">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={createRequest} className="btn-primary text-sm">Submit</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
        {COLUMNS.map(col => {
          const colRequests = requests.filter((r: any) => r.status === col);
          return (
            <div key={col} className="card p-3 min-w-[220px]">
              <div className="text-sm font-medium text-gabik-ink-muted mb-3 pb-2 border-b border-gabik-border">
                {COLUMN_LABELS[col]} <span className="ml-1 text-xs">({colRequests.length})</span>
              </div>
              <div className="space-y-2">
                {colRequests.map((r: any) => (
                  <div key={r._id} className={`p-3 bg-white rounded-lg border border-gabik-border border-l-4 ${priorityColor(r.priority)} text-sm`}>
                    <p className="font-medium text-xs">{r.assetId?.name || '-'}</p>
                    <p className="text-xs text-gabik-ink-muted mt-1 truncate">{r.issueDescription}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${r.priority === 'critical' ? 'bg-gabik-red-bg text-gabik-red' : r.priority === 'high' ? 'bg-gabik-amber-bg text-gabik-amber' : 'bg-gabik-blue-bg text-gabik-blue'}`}>{r.priority}</span>
                      {r.technicianName && <span className="text-[10px] text-gabik-ink-muted">| {r.technicianName}</span>}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {col === 'pending' && <>
                        <button onClick={() => approve(r._id)} className="text-gabik-500 text-xs flex items-center gap-1"><CheckCircle size={12} /> Approve</button>
                        <button onClick={() => reject(r._id)} className="text-gabik-red text-xs flex items-center gap-1"><XCircle size={12} /> Reject</button>
                      </>}
                      {col === 'approved' && <button onClick={() => updateStatus(r._id, 'technician_assigned')} className="text-gabik-blue text-xs flex items-center gap-1"><UserCheck size={12} /> Assign</button>}
                      {col === 'technician_assigned' && <button onClick={() => updateStatus(r._id, 'in_progress')} className="text-gabik-amber text-xs"><Wrench size={12} className="inline mr-1" /> Start</button>}
                      {col === 'in_progress' && <button onClick={() => updateStatus(r._id, 'resolved')} className="text-gabik-500 text-xs"><CheckCircle size={12} className="inline mr-1" /> Resolve</button>}
                    </div>
                  </div>
                ))}
                {colRequests.length === 0 && <p className="text-xs text-gabik-ink-muted text-center py-4">No items</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
