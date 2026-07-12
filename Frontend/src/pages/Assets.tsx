import { useState, useEffect } from 'react';
import API from '../api/client';
import { Search, Plus, Eye, Filter } from 'lucide-react';

export default function Assets() {
  const [assets, setAssets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [filters, setFilters] = useState({ search: '', categoryId: '', status: '', departmentId: '' });
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', categoryId: '', serialNumber: '', acquisitionDate: '', acquisitionCost: '', condition: 'good', location: '', isBookable: false });
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const load = async () => {
    const params = new URLSearchParams({ ...filters, page: String(page), limit: '20' });
    const [a, c, d] = await Promise.all([
      API.get(`/assets?${params}`), API.get('/asset-categories'), API.get('/departments')
    ]);
    setAssets(a.data.data); setPagination(a.data.pagination); setCategories(c.data.data); setDepartments(d.data.data);
  };
  useEffect(() => { load(); }, [page, filters]);

  const createAsset = async () => {
    await API.post('/assets', form); setShowForm(false); setForm({ name: '', categoryId: '', serialNumber: '', acquisitionDate: '', acquisitionCost: '', condition: 'good', location: '', isBookable: false }); load();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { available: 'badge-green', allocated: 'badge-blue', under_maintenance: 'badge-amber', lost: 'badge-red', retired: 'badge-gray', disposed: 'badge-gray' };
    return <span className={map[s] || 'badge-gray'}>{s.replace(/_/g, ' ')}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Asset Directory</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Register Asset</button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gabik-ink-muted" />
          <input placeholder="Search by name, tag, or serial..." value={filters.search} onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }} className="input-field pl-9" />
        </div>
        <select value={filters.categoryId} onChange={e => { setFilters(f => ({ ...f, categoryId: e.target.value })); setPage(1); }} className="input-field w-auto">
          <option value="">All Categories</option>
          {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }} className="input-field w-auto">
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="allocated">Allocated</option>
          <option value="under_maintenance">Under Maintenance</option>
          <option value="lost">Lost</option>
          <option value="retired">Retired</option>
        </select>
        <select value={filters.departmentId} onChange={e => { setFilters(f => ({ ...f, departmentId: e.target.value })); setPage(1); }} className="input-field w-auto">
          <option value="">All Departments</option>
          {departments.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="card p-4">
          <h2 className="mb-4">Register New Asset</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="Asset Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="input-field">
              <option value="">Category *</option>
              {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <input placeholder="Serial Number" value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} className="input-field" />
            <input type="date" placeholder="Acquisition Date" value={form.acquisitionDate} onChange={e => setForm(f => ({ ...f, acquisitionDate: e.target.value }))} className="input-field" />
            <input type="number" placeholder="Acquisition Cost" value={form.acquisitionCost} onChange={e => setForm(f => ({ ...f, acquisitionCost: e.target.value }))} className="input-field" />
            <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} className="input-field">
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="damaged">Damaged</option>
            </select>
            <input placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="input-field" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isBookable} onChange={e => setForm(f => ({ ...f, isBookable: e.target.checked }))} className="rounded" /> Bookable resource</label>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={createAsset} className="btn-primary text-sm">Register</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gabik-50 text-gabik-ink-muted">
              <tr>
                <th className="text-left p-3">Tag</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Location</th>
                <th className="text-left p-3">Condition</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gabik-border">
              {assets.map((a: any) => (
                <tr key={a._id} className="hover:bg-gabik-50">
                  <td className="p-3 font-mono text-xs">{a.assetTag}</td>
                  <td className="p-3 font-medium">{a.name}</td>
                  <td className="p-3">{a.categoryId?.name || '-'}</td>
                  <td className="p-3">{statusBadge(a.status)}</td>
                  <td className="p-3 text-gabik-ink-muted">{a.location || '-'}</td>
                  <td className="p-3 capitalize">{a.condition}</td>
                  <td className="p-3">
                    <button onClick={() => setSelectedAsset(a)} className="text-gabik-500 hover:underline flex items-center gap-1 text-xs"><Eye size={14} /> View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination && (
          <div className="p-3 flex items-center justify-between text-sm text-gabik-ink-muted border-t border-gabik-border">
            <span>Page {pagination.page} of {pagination.pages} ({pagination.total} assets)</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs py-1">Prev</button>
              <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs py-1">Next</button>
            </div>
          </div>
        )}
      </div>

      {selectedAsset && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-card p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="font-medium mb-4">{selectedAsset.name} ({selectedAsset.assetTag})</h3>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><span className="text-gabik-ink-muted">Category:</span> {selectedAsset.categoryId?.name || '-'}</div>
              <div><span className="text-gabik-ink-muted">Serial:</span> {selectedAsset.serialNumber || '-'}</div>
              <div><span className="text-gabik-ink-muted">Condition:</span> <span className="capitalize">{selectedAsset.condition}</span></div>
              <div><span className="text-gabik-ink-muted">Status:</span> {statusBadge(selectedAsset.status)}</div>
              <div><span className="text-gabik-ink-muted">Location:</span> {selectedAsset.location || '-'}</div>
              <div><span className="text-gabik-ink-muted">Acquisition:</span> {selectedAsset.acquisitionDate ? new Date(selectedAsset.acquisitionDate).toLocaleDateString() : '-'}</div>
            </div>
            <button onClick={() => setSelectedAsset(null)} className="btn-secondary text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
