import { useState, useEffect } from 'react';
import API from '../api/client';
import { Plus, ArrowLeftRight, CheckCircle, XCircle } from 'lucide-react';

export default function Allocations() {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [tab, setTab] = useState<'active' | 'returned'>('active');
  const [showAllocate, setShowAllocate] = useState(false);
  const [form, setForm] = useState({ assetId: '', holderUserId: '', expectedReturnDate: '' });
  const [transfers, setTransfers] = useState<any[]>([]);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferForm, setTransferForm] = useState({ assetId: '', toUserId: '', reason: '' });
  const [conflict, setConflict] = useState<any>(null);
  const [error, setError] = useState('');

  const load = async () => {
    const [a, e, all, tr] = await Promise.all([
      API.get('/assets?status=available'), API.get('/employees'),
      API.get(`/allocations?status=${tab === 'active' ? 'active' : 'returned'}`),
      API.get('/transfer-requests')
    ]);
    setAssets(a.data.data); setEmployees(e.data.data);
    setAllocations(all.data.data); setTransfers(tr.data.data);
  };
  useEffect(() => { load(); }, [tab]);

  const doAllocate = async () => {
    setError('');
    try {
      await API.post('/allocations', form);
      setShowAllocate(false);
      setForm({ assetId: '', holderUserId: '', expectedReturnDate: '' });
      load();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setConflict(err.response.data.conflict);
        setShowTransferForm(true);
        setTransferForm(f => ({ ...f, assetId: form.assetId }));
      } else setError(err.response?.data?.error?.message || 'Allocation failed');
    }
  };

  const doReturn = async (id: string) => {
    await API.put(`/allocations/${id}/return`, {});
    load();
  };

  const doTransfer = async () => {
    await API.post('/transfer-requests', transferForm);
    setShowTransferForm(false);
    setConflict(null);
    setShowAllocate(false);
    load();
  };

  const approveTransfer = async (id: string) => {
    await API.put(`/transfer-requests/${id}/approve`);
    load();
  };

  const rejectTransfer = async (id: string) => {
    await API.put(`/transfer-requests/${id}/reject`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Allocation & Transfer</h1>
        <button onClick={() => setShowAllocate(!showAllocate)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Allocate Asset</button>
      </div>

      {error && <div className="bg-gabik-red-bg text-gabik-red text-sm p-3 rounded-lg">{error}</div>}

      {showAllocate && !showTransferForm && (
        <div className="card p-4">
          <h2 className="mb-4">Allocate Asset</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select value={form.assetId} onChange={e => setForm(f => ({ ...f, assetId: e.target.value }))} className="input-field">
              <option value="">Select Asset</option>
              {assets.map((a: any) => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}
            </select>
            <select value={form.holderUserId} onChange={e => setForm(f => ({ ...f, holderUserId: e.target.value }))} className="input-field">
              <option value="">Select Employee</option>
              {employees.map((e: any) => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
            <input type="date" placeholder="Expected Return" value={form.expectedReturnDate} onChange={e => setForm(f => ({ ...f, expectedReturnDate: e.target.value }))} className="input-field" />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={doAllocate} className="btn-primary text-sm">Allocate</button>
            <button onClick={() => setShowAllocate(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      {showTransferForm && (
        <div className="card p-4 border-2 border-gabik-red">
          <div className="flex items-center gap-2 text-gabik-red font-medium mb-3"><ArrowLeftRight size={18} /> Asset Already Allocated</div>
          {conflict && (
            <div className="bg-gabik-red-bg p-3 rounded-lg text-sm mb-4">
              Currently held by <strong>{conflict.currentHolder?.name || 'Unknown'}</strong> since {new Date(conflict.allocatedAt).toLocaleDateString()}. Submit a transfer request instead.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select value={transferForm.toUserId} onChange={e => setTransferForm(f => ({ ...f, toUserId: e.target.value }))} className="input-field">
              <option value="">Transfer To</option>
              {employees.map((e: any) => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
            <input placeholder="Reason for transfer" value={transferForm.reason} onChange={e => setTransferForm(f => ({ ...f, reason: e.target.value }))} className="input-field md:col-span-2" />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={doTransfer} className="btn-primary text-sm">Submit Transfer Request</button>
            <button onClick={() => { setShowTransferForm(false); setConflict(null); }} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex gap-1 bg-gabik-100 rounded-lg p-1 w-fit">
        {(['active', 'returned'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize ${tab === t ? 'bg-white shadow-sm text-gabik-700' : 'text-gabik-ink-muted'}`}>{t}</button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gabik-50 text-gabik-ink-muted">
              <tr>
                <th className="text-left p-3">Asset</th>
                <th className="text-left p-3">Holder</th>
                <th className="text-left p-3">Allocated</th>
                <th className="text-left p-3">Expected Return</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gabik-border">
              {allocations.map((al: any) => (
                <tr key={al._id} className="hover:bg-gabik-50">
                  <td className="p-3">{al.assetId?.name || '-'} <span className="text-xs text-gabik-ink-muted">({al.assetId?.assetTag})</span></td>
                  <td className="p-3">{al.holderUserId?.name || '-'}</td>
                  <td className="p-3 text-xs text-gabik-ink-muted">{new Date(al.allocatedAt).toLocaleDateString()}</td>
                  <td className="p-3 text-xs">{al.expectedReturnDate ? new Date(al.expectedReturnDate).toLocaleDateString() : 'Not set'}</td>
                  <td className="p-3">{tab === 'active' && <button onClick={() => doReturn(al._id)} className="text-gabik-500 hover:underline text-xs flex items-center gap-1"><CheckCircle size={14} /> Return</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="mb-3">Transfer Requests</h2>
        {transfers.filter(t => t.status === 'requested').length === 0 ? (
          <p className="text-sm text-gabik-ink-muted">No pending transfer requests</p>
        ) : (
          <div className="space-y-2">
            {transfers.filter((t: any) => t.status === 'requested').map((t: any) => (
              <div key={t._id} className="flex items-center justify-between p-3 bg-gabik-50 rounded-lg text-sm">
                <div>
                  <p><strong>{t.assetId?.name}</strong> → {t.toUserId?.name}</p>
                  <p className="text-xs text-gabik-ink-muted">Reason: {t.reason || 'Not specified'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approveTransfer(t._id)} className="text-gabik-500 hover:underline text-xs flex items-center gap-1"><CheckCircle size={14} /> Approve</button>
                  <button onClick={() => rejectTransfer(t._id)} className="text-gabik-red hover:underline text-xs flex items-center gap-1"><XCircle size={14} /> Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
