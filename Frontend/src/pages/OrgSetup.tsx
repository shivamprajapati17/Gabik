import { useState, useEffect } from 'react';
import API from '../api/client';
import { Plus, Building2, Tag, Users, Shield, Edit2 } from 'lucide-react';

export default function OrgSetup() {
  const [tab, setTab] = useState<'departments' | 'categories' | 'employees'>('departments');
  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', headUserId: '', parentDepartmentId: '' });
  const [catForm, setCatForm] = useState({ name: '', customFields: '' });
  const [empForm, setEmpForm] = useState({ role: '', departmentId: '' });
  const [selectedEmp, setSelectedEmp] = useState<any>(null);

  const load = async () => {
    const [d, c, e] = await Promise.all([
      API.get('/departments'), API.get('/asset-categories'), API.get('/employees')
    ]);
    setDepartments(d.data.data); setCategories(c.data.data); setEmployees(e.data.data);
  };
  useEffect(() => { load(); }, []);

  const createDept = async () => {
    await API.post('/departments', form); setShowForm(false); setForm({ name: '', headUserId: '', parentDepartmentId: '' }); load();
  };
  const createCat = async () => {
    const customFields = catForm.customFields ? JSON.parse(catForm.customFields) : {};
    await API.post('/asset-categories', { name: catForm.name, customFields }); setShowForm(false); setCatForm({ name: '', customFields: '' }); load();
  };
  const promoteRole = async (id: string) => {
    await API.put(`/employees/${id}/role`, { role: empForm.role }); setSelectedEmp(null); load();
  };
  const updateDept = async (id: string, data: any) => {
    await API.put(`/departments/${id}`, data); load();
  };

  return (
    <div className="space-y-6">
      <h1>Organization Setup</h1>
      <div className="flex gap-1 bg-gabik-100 rounded-lg p-1">
        {(['departments', 'categories', 'employees'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-white shadow-sm text-gabik-700' : 'text-gabik-ink-muted hover:text-gabik-700'}`}>
            {t === 'departments' && <Building2 size={16} className="inline mr-1.5" />}
            {t === 'categories' && <Tag size={16} className="inline mr-1.5" />}
            {t === 'employees' && <Users size={16} className="inline mr-1.5" />}
            {t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {tab === 'departments' && (
        <div className="card">
          <div className="p-4 border-b border-gabik-border flex items-center justify-between">
            <h2>Departments</h2>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-1 text-sm py-1.5"><Plus size={15} /> Add</button>
          </div>
          {showForm && (
            <div className="p-4 border-b border-gabik-border bg-gabik-50">
              <div className="flex gap-3 flex-wrap">
                <input placeholder="Department Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field flex-1 min-w-[200px]" />
                <select value={form.parentDepartmentId} onChange={e => setForm(f => ({ ...f, parentDepartmentId: e.target.value }))} className="input-field flex-1 min-w-[150px]">
                  <option value="">No parent</option>
                  {departments.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
                <button onClick={createDept} className="btn-primary text-sm">Create</button>
              </div>
            </div>
          )}
          <div className="divide-y divide-gabik-border">
            {departments.map((d: any) => (
              <div key={d._id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{d.name}</p>
                  <p className="text-xs text-gabik-ink-muted">Head: {d.headUserId?.name || 'Unassigned'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select value={d.status} onChange={e => updateDept(d._id, { status: e.target.value })} className="text-xs border border-gabik-border rounded-lg px-2 py-1">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            ))}
            {departments.length === 0 && <p className="p-4 text-sm text-gabik-ink-muted">No departments yet</p>}
          </div>
        </div>
      )}

      {tab === 'categories' && (
        <div className="card">
          <div className="p-4 border-b border-gabik-border flex items-center justify-between">
            <h2>Asset Categories</h2>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-1 text-sm py-1.5"><Plus size={15} /> Add</button>
          </div>
          {showForm && (
            <div className="p-4 border-b border-gabik-border bg-gabik-50">
              <div className="flex gap-3 flex-wrap">
                <input placeholder="Category Name" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} className="input-field flex-1 min-w-[200px]" />
                <input placeholder='Custom fields JSON (e.g. {"warranty":24})' value={catForm.customFields} onChange={e => setCatForm(f => ({ ...f, customFields: e.target.value }))} className="input-field flex-1 min-w-[200px]" />
                <button onClick={createCat} className="btn-primary text-sm">Create</button>
              </div>
            </div>
          )}
          <div className="divide-y divide-gabik-border">
            {categories.map((c: any) => (
              <div key={c._id} className="p-4 flex items-center justify-between">
                <p className="font-medium">{c.name}</p>
                {c.customFields && Object.keys(c.customFields).length > 0 && (
                  <span className="text-xs text-gabik-ink-muted">{JSON.stringify(c.customFields)}</span>
                )}
              </div>
            ))}
            {categories.length === 0 && <p className="p-4 text-sm text-gabik-ink-muted">No categories yet</p>}
          </div>
        </div>
      )}

      {tab === 'employees' && (
        <div className="card">
          <div className="p-4 border-b border-gabik-border">
            <h2>Employee Directory</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gabik-50 text-gabik-ink-muted">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Department</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gabik-border">
                {employees.map((e: any) => (
                  <tr key={e._id} className="hover:bg-gabik-50">
                    <td className="p-3 font-medium">{e.name}</td>
                    <td className="p-3 text-gabik-ink-muted">{e.email}</td>
                    <td className="p-3">{e.departmentId?.name || '-'}</td>
                    <td className="p-3"><span className="capitalize badge-green">{e.role.replace('_', ' ')}</span></td>
                    <td className="p-3"><span className={e.status === 'active' ? 'badge-green' : 'badge-red'}>{e.status}</span></td>
                    <td className="p-3">
                      <button onClick={() => { setSelectedEmp(e); setEmpForm({ role: e.role, departmentId: e.departmentId?._id || '' }); }} className="text-gabik-500 hover:underline flex items-center gap-1 text-xs"><Shield size={14} /> Edit Role</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedEmp && (
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
              <div className="bg-white rounded-card p-6 w-full max-w-sm mx-4">
                <h3 className="font-medium mb-4">Edit Role: {selectedEmp.name}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gabik-ink-muted block mb-1">Role</label>
                    <select value={empForm.role} onChange={e => setEmpForm(f => ({ ...f, role: e.target.value }))} className="input-field">
                      <option value="employee">Employee</option>
                      <option value="department_head">Department Head</option>
                      <option value="asset_manager">Asset Manager</option>
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end mt-4">
                    <button onClick={() => setSelectedEmp(null)} className="btn-secondary text-sm">Cancel</button>
                    <button onClick={() => promoteRole(selectedEmp._id)} className="btn-primary text-sm">Save</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
