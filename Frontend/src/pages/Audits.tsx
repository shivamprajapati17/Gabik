import { useState, useEffect } from 'react';
import API from '../api/client';
import { Plus, ClipboardCheck, CheckCircle, XCircle, AlertTriangle, Lock } from 'lucide-react';

export default function Audits() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', scopeDepartmentId: '', startDate: '', endDate: '', auditorIds: [] as string[] });
  const [selectedCycle, setSelectedCycle] = useState<any>(null);

  const load = async () => {
    const [c, d, e] = await Promise.all([
      API.get('/audits'), API.get('/departments'), API.get('/employees')
    ]);
    setCycles(c.data.data);
    setDepartments(d.data.data);
    setEmployees(e.data.data);
  };
  useEffect(() => { load(); }, []);

  const createCycle = async () => {
    await API.post('/audits', form);
    setShowForm(false);
    setForm({ name: '', scopeDepartmentId: '', startDate: '', endDate: '', auditorIds: [] });
    load();
  };

  const verify = async (verificationId: string, status: string) => {
    await API.put(`/audits/verification/${verificationId}`, { verification: status });
    if (selectedCycle) {
      const updated = await API.get(`/audits/${selectedCycle._id}`);
      setSelectedCycle(updated.data.data);
    }
  };

  const closeCycle = async (id: string) => {
    if (!confirm('Close audit cycle? This is irreversible.')) return;
    await API.put(`/audits/${id}/close`);
    setSelectedCycle(null);
    load();
  };

  const viewCycle = async (id: string) => {
    const { data } = await API.get(`/audits/${id}`);
    setSelectedCycle(data.data);
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { verified: 'badge-green', missing: 'badge-red', damaged: 'badge-amber', pending: 'badge-gray' };
    return <span className={map[s] || 'badge-gray'}>{s}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Asset Audit</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> New Audit Cycle</button>
      </div>

      {showForm && (
        <div className="card p-4">
          <h2 className="mb-4">Create Audit Cycle</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Audit Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
            <select value={form.scopeDepartmentId} onChange={e => setForm(f => ({ ...f, scopeDepartmentId: e.target.value }))} className="input-field">
              <option value="">All Departments</option>
              {departments.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <input type="date" placeholder="Start Date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-field" />
            <input type="date" placeholder="End Date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="input-field" />
            <div className="md:col-span-2">
              <label className="text-xs text-gabik-ink-muted block mb-1">Auditors</label>
              <div className="flex gap-2 flex-wrap">
                {employees.map((e: any) => (
                  <label key={e._id} className="flex items-center gap-1 text-sm bg-gabik-50 px-2 py-1 rounded-lg">
                    <input type="checkbox" checked={form.auditorIds.includes(e._id)} onChange={() => setForm(f => ({ ...f, auditorIds: f.auditorIds.includes(e._id) ? f.auditorIds.filter(id => id !== e._id) : [...f.auditorIds, e._id] }))} />
                    {e.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={createCycle} className="btn-primary text-sm">Create Cycle</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cycles.map((c: any) => {
          const count = c.verifications?.length || 0;
          const verified = c.verifications?.filter((v: any) => v.verification === 'verified').length || 0;
          return (
            <div key={c._id} className="card p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => viewCycle(c._id)}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">{c.name}</h3>
                <span className={c.status === 'open' ? 'badge-blue' : 'badge-gray'}>{c.status}</span>
              </div>
              <p className="text-xs text-gabik-ink-muted">{c.scopeDepartmentId?.name || 'All depts'}</p>
              {c.status === 'open' && <p className="text-xs text-gabik-500 mt-2">{verified}/{count} verified</p>}
            </div>
          );
        })}
        {cycles.length === 0 && <p className="text-sm text-gabik-ink-muted col-span-full">No audit cycles yet</p>}
      </div>

      {selectedCycle && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-card p-6 w-full max-w-3xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium">{selectedCycle.name}</h3>
                <p className="text-xs text-gabik-ink-muted">
                  {selectedCycle.scopeDepartmentId?.name || 'All depts'} | {selectedCycle.status === 'open' ? 'Open' : `Closed ${selectedCycle.closedAt ? new Date(selectedCycle.closedAt).toLocaleDateString() : ''}`}
                </p>
              </div>
              {selectedCycle.status === 'open' && (
                <button onClick={() => closeCycle(selectedCycle._id)} className="btn-secondary text-sm flex items-center gap-1"><Lock size={14} /> Close Cycle</button>
              )}
            </div>

            {selectedCycle.verifications?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <AlertTriangle size={16} className="text-gabik-amber" />
                  Discrepancies: {selectedCycle.verifications.filter((v: any) => v.verification === 'missing').length} missing, {selectedCycle.verifications.filter((v: any) => v.verification === 'damaged').length} damaged
                </div>
                <div className="divide-y divide-gabik-border max-h-96 overflow-y-auto">
                  {selectedCycle.verifications.map((v: any) => (
                    <div key={v._id} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        <p className="font-medium">{v.assetId?.name || '-'} <span className="text-xs text-gabik-ink-muted">({v.assetId?.assetTag})</span></p>
                        <p className="text-xs text-gabik-ink-muted">Expected: {v.expectedLocation || 'Not specified'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(v.verification)}
                        {selectedCycle.status === 'open' && (
                          <div className="flex gap-1">
                            <button onClick={() => verify(v._id, 'verified')} className="text-gabik-500 text-xs p-1 hover:bg-gabik-50 rounded"><CheckCircle size={14} /></button>
                            <button onClick={() => verify(v._id, 'missing')} className="text-gabik-red text-xs p-1 hover:bg-gabik-red-bg rounded"><XCircle size={14} /></button>
                            <button onClick={() => verify(v._id, 'damaged')} className="text-gabik-amber text-xs p-1 hover:bg-gabik-amber-bg rounded"><AlertTriangle size={14} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => setSelectedCycle(null)} className="btn-secondary text-sm mt-4">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
