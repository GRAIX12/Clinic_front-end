import { useEffect, useMemo, useState } from 'react';
import { clinicApi } from '../api/clinic';
import { getErrorMessage } from '../api/client';
import type { Patient, PatientCreate } from '../types/models';
import { InlineMessage } from '../components/InlineMessage';
import { fromDateInputValue, toDateInputValue } from '../components/utils';

const empty: PatientCreate = { name: '', birthDate: new Date().toISOString(), email: '', phone: '' };

export default function PatientsPage() {
  const [items, setItems] = useState<Patient[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<PatientCreate>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: 'error' | 'success' | 'info'; text?: string }>({ kind: 'info' });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(p => [p.name, p.email, p.phone || ''].some(x => x.toLowerCase().includes(s)));
  }, [items, q]);

  async function refresh() {
    setLoading(true);
    setMsg({ kind: 'info', text: '' });
    try {
      const data = await clinicApi.listPatients();
      setItems(data);
    } catch (e) {
      setMsg({ kind: 'error', text: getErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function startCreate() {
    setEditingId(null);
    setForm(empty);
    setMsg({ kind: 'info', text: '' });
  }

  function startEdit(p: Patient) {
    setEditingId(p._id);
    setForm({
      name: p.name,
      email: p.email,
      phone: p.phone || '',
      birthDate: p.birthDate
    });
    setMsg({ kind: 'info', text: '' });
  }

  async function submit() {
    setLoading(true);
    setMsg({ kind: 'info', text: '' });
    try {
      if (editingId) {
        await clinicApi.updatePatient(editingId, form);
        setMsg({ kind: 'success', text: 'Patient updated.' });
      } else {
        await clinicApi.createPatient(form);
        setMsg({ kind: 'success', text: 'Patient created.' });
      }
      startCreate();
      await refresh();
    } catch (e) {
      setMsg({ kind: 'error', text: getErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    const ok = confirm('Delete this patient?');
    if (!ok) return;
    setLoading(true);
    setMsg({ kind: 'info', text: '' });
    try {
      await clinicApi.deletePatient(id);
      setMsg({ kind: 'success', text: 'Patient deleted.' });
      await refresh();
      if (editingId === id) startCreate();
    } catch (e) {
      setMsg({ kind: 'error', text: getErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="row" style={{ alignItems: 'flex-start' }}>
      <div className="card" style={{ flex: 2, minWidth: 420 }}>
        <div className="row">
          <h2 style={{ margin: 0 }}>Patients</h2>
          <div style={{ flex: 1 }} />
          <button onClick={refresh} disabled={loading}>Refresh</button>
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <input placeholder="Search name/email/phone…" value={q} onChange={e => setQ(e.target.value)} />
          <span className="badge">{filtered.length} shown</span>
        </div>

        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Birth date</th>
                <th>Phone</th>
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{new Date(p.birthDate).toLocaleDateString()}</td>
                  <td>{p.phone || <span className="small">—</span>}</td>
                  <td className="actions">
                    <div className="row" style={{ gap: 8 }}>
                      <button onClick={() => startEdit(p)} disabled={loading}>Edit</button>
                      <button className="danger" onClick={() => remove(p._id)} disabled={loading}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="small">No patients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ flex: 1, minWidth: 320 }}>
        <div className="row">
          <h3 style={{ margin: 0 }}>{editingId ? 'Edit Patient' : 'Create Patient'}</h3>
          <div style={{ flex: 1 }} />
          <button onClick={startCreate} disabled={loading}>New</button>
        </div>

        <InlineMessage kind={msg.kind} message={msg.text} />

        <div className="row">
          <div>
            <label className="small">Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="small">Birth date</label>
            <input
              type="date"
              value={toDateInputValue(form.birthDate)}
              onChange={e => setForm({ ...form, birthDate: fromDateInputValue(e.target.value) })}
            />
          </div>
        </div>

        <div className="row">
          <div>
            <label className="small">Email</label>
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="small">Phone</label>
            <input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <button className="primary" onClick={submit} disabled={loading || !form.name || !form.email || !form.birthDate}>
            {editingId ? 'Save Changes' : 'Create'}
          </button>
        </div>

        <p className="small" style={{ marginTop: 10 }}>
        </p>
      </div>
    </div>
  );
}
