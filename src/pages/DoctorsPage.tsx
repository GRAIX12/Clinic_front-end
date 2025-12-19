import { useEffect, useMemo, useState } from 'react';
import { clinicApi } from '../api/clinic';
import { getErrorMessage } from '../api/client';
import type { Doctor, DoctorCreate } from '../types/models';
import { InlineMessage } from '../components/InlineMessage';

const empty: DoctorCreate = { name: '', specialty: '' };

export default function DoctorsPage() {
  const [items, setItems] = useState<Doctor[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<DoctorCreate>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: 'error' | 'success' | 'info'; text?: string }>({ kind: 'info' });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(d => [d.name, d.specialty || ''].some(x => x.toLowerCase().includes(s)));
  }, [items, q]);

  async function refresh() {
    setLoading(true);
    setMsg({ kind: 'info', text: '' });
    try {
      setItems(await clinicApi.listDoctors());
    } catch (e) {
      setMsg({ kind: 'error', text: getErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  function startCreate() {
    setEditingId(null);
    setForm(empty);
    setMsg({ kind: 'info', text: '' });
  }

  function startEdit(d: Doctor) {
    setEditingId(d._id);
    setForm({ name: d.name, specialty: d.specialty || '' });
    setMsg({ kind: 'info', text: '' });
  }

  async function submit() {
    setLoading(true);
    setMsg({ kind: 'info', text: '' });
    try {
      if (editingId) {
        await clinicApi.updateDoctor(editingId, form);
        setMsg({ kind: 'success', text: 'Doctor updated.' });
      } else {
        await clinicApi.createDoctor(form);
        setMsg({ kind: 'success', text: 'Doctor created.' });
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
    const ok = confirm('Delete this doctor?');
    if (!ok) return;
    setLoading(true);
    setMsg({ kind: 'info', text: '' });
    try {
      await clinicApi.deleteDoctor(id);
      setMsg({ kind: 'success', text: 'Doctor deleted.' });
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
          <h2 style={{ margin: 0 }}>Doctors</h2>
          <div style={{ flex: 1 }} />
          <button onClick={refresh} disabled={loading}>Refresh</button>
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <input placeholder="Search name/specialty…" value={q} onChange={e => setQ(e.target.value)} />
          <span className="badge">{filtered.length} shown</span>
        </div>

        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialty</th>
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d._id}>
                  <td>{d.name}</td>
                  <td>{d.specialty || <span className="small">—</span>}</td>
                  <td className="actions">
                    <div className="row" style={{ gap: 8 }}>
                      <button onClick={() => startEdit(d)} disabled={loading}>Edit</button>
                      <button className="danger" onClick={() => remove(d._id)} disabled={loading}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={3} className="small">No doctors found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ flex: 1, minWidth: 320 }}>
        <div className="row">
          <h3 style={{ margin: 0 }}>{editingId ? 'Edit Doctor' : 'Create Doctor'}</h3>
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
            <label className="small">Specialty</label>
            <input value={form.specialty || ''} onChange={e => setForm({ ...form, specialty: e.target.value })} />
          </div>
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <button className="primary" onClick={submit} disabled={loading || !form.name}>
            {editingId ? 'Save Changes' : 'Create'}
          </button>
        </div>

        <p className="small" style={{ marginTop: 10 }}>
          Backend validation: doctor requires <code>name</code>. <code>specialty</code> is optional.
        </p>
      </div>
    </div>
  );
}
