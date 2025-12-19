import { useEffect, useMemo, useState } from 'react';
import { clinicApi } from '../api/clinic';
import { getErrorMessage } from '../api/client';
import type { Appointment, AppointmentCreate, Doctor, Patient } from '../types/models';
import { InlineMessage } from '../components/InlineMessage';
import { fromDateTimeLocalValue, toDateTimeLocalValue, formatDateTime } from '../components/utils';

const empty: AppointmentCreate = {
  patientId: '',
  doctorId: '',
  startAt: new Date().toISOString(),
  endAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  notes: ''
};

function asName(x: any): string {
  if (!x) return '';
  if (typeof x === 'string') return x;
  return x.name || x._id || '';
}

export default function AppointmentsPage() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<AppointmentCreate>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: 'error' | 'success' | 'info'; text?: string }>({ kind: 'info' });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(a => {
      const p = asName(a.patientId).toLowerCase();
      const d = asName(a.doctorId).toLowerCase();
      const n = (a.notes || '').toLowerCase();
      return p.includes(s) || d.includes(s) || n.includes(s);
    });
  }, [items, q]);

  async function refresh() {
    setLoading(true);
    setMsg({ kind: 'info', text: '' });
    try {
      const [apps, pats, docs] = await Promise.all([
        clinicApi.listAppointments(),
        clinicApi.listPatients(),
        clinicApi.listDoctors()
      ]);
      setItems(apps);
      setPatients(pats);
      setDoctors(docs);
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

  function startEdit(a: Appointment) {
    setEditingId(a._id);
    setForm({
      patientId: typeof a.patientId === 'string' ? a.patientId : a.patientId._id,
      doctorId: typeof a.doctorId === 'string' ? a.doctorId : a.doctorId._id,
      startAt: a.startAt,
      endAt: a.endAt,
      notes: a.notes || ''
    });
    setMsg({ kind: 'info', text: '' });
  }

  async function submit() {
    setLoading(true);
    setMsg({ kind: 'info', text: '' });
    try {
      if (editingId) {
        await clinicApi.updateAppointment(editingId, form);
        setMsg({ kind: 'success', text: 'Appointment updated.' });
      } else {
        await clinicApi.createAppointment(form);
        setMsg({ kind: 'success', text: 'Appointment created.' });
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
    const ok = confirm('Delete this appointment?');
    if (!ok) return;
    setLoading(true);
    setMsg({ kind: 'info', text: '' });
    try {
      await clinicApi.deleteAppointment(id);
      setMsg({ kind: 'success', text: 'Appointment deleted.' });
      await refresh();
      if (editingId === id) startCreate();
    } catch (e) {
      setMsg({ kind: 'error', text: getErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    !!form.patientId && !!form.doctorId && !!form.startAt && !!form.endAt && new Date(form.endAt) > new Date(form.startAt);

  return (
    <div className="row" style={{ alignItems: 'flex-start' }}>
      <div className="card" style={{ flex: 2, minWidth: 420 }}>
        <div className="row">
          <h2 style={{ margin: 0 }}>Appointments</h2>
          <div style={{ flex: 1 }} />
          <button onClick={refresh} disabled={loading}>Refresh</button>
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <input placeholder="Search patient/doctor/notes…" value={q} onChange={e => setQ(e.target.value)} />
          <span className="badge">{filtered.length} shown</span>
        </div>

        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Start</th>
                <th>End</th>
                <th>Notes</th>
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a._id}>
                  <td>{asName(a.patientId)}</td>
                  <td>{asName(a.doctorId)}</td>
                  <td>{formatDateTime(a.startAt)}</td>
                  <td>{formatDateTime(a.endAt)}</td>
                  <td>{a.notes ? a.notes : <span className="small">—</span>}</td>
                  <td className="actions">
                    <div className="row" style={{ gap: 8 }}>
                      <button onClick={() => startEdit(a)} disabled={loading}>Edit</button>
                      <button className="danger" onClick={() => remove(a._id)} disabled={loading}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="small">No appointments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ flex: 1, minWidth: 320 }}>
        <div className="row">
          <h3 style={{ margin: 0 }}>{editingId ? 'Edit Appointment' : 'Create Appointment'}</h3>
          <div style={{ flex: 1 }} />
          <button onClick={startCreate} disabled={loading}>New</button>
        </div>

        <InlineMessage kind={msg.kind} message={msg.text} />

        <div className="row">
          <div>
            <label className="small">Patient</label>
            <select value={form.patientId as string} onChange={e => setForm({ ...form, patientId: e.target.value })}>
              <option value="">Select patient…</option>
              {patients.map(p => (
                <option key={p._id} value={p._id}>{p.name} — {p.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="small">Doctor</label>
            <select value={form.doctorId as string} onChange={e => setForm({ ...form, doctorId: e.target.value })}>
              <option value="">Select doctor…</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>{d.name}{d.specialty ? ` — ${d.specialty}` : ''}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="row">
          <div>
            <label className="small">Start</label>
            <input
              type="datetime-local"
              value={toDateTimeLocalValue(form.startAt)}
              onChange={e => setForm({ ...form, startAt: fromDateTimeLocalValue(e.target.value) })}
            />
          </div>
          <div>
            <label className="small">End</label>
            <input
              type="datetime-local"
              value={toDateTimeLocalValue(form.endAt)}
              onChange={e => setForm({ ...form, endAt: fromDateTimeLocalValue(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <label className="small">Notes</label>
          <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>

        {!canSubmit && (
          <div className="small" style={{ marginTop: 8, opacity: 0.9 }}>
            Required: patient, doctor, start/end (end must be after start).
          </div>
        )}

        <div className="row" style={{ marginTop: 10 }}>
          <button className="primary" onClick={submit} disabled={loading || !canSubmit}>
            {editingId ? 'Save Changes' : 'Create'}
          </button>
        </div>

        <p className="small" style={{ marginTop: 10 }}>
        </p>
      </div>
    </div>
  );
}
