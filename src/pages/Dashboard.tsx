import { useEffect, useState } from 'react';
import { clinicApi } from '../api/clinic';
import { getErrorMessage } from '../api/client';

export default function Dashboard() {
  const [counts, setCounts] = useState<{ patients: number; doctors: number; appointments: number } | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const [patients, doctors, appointments] = await Promise.all([
          clinicApi.listPatients(),
          clinicApi.listDoctors(),
          clinicApi.listAppointments()
        ]);
        setCounts({ patients: patients.length, doctors: doctors.length, appointments: appointments.length });
      } catch (e) {
        setError(getErrorMessage(e));
      }
    })();
  }, []);

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Dashboard</h2>
      <p className="small">
        Configure the backend URL via <code>VITE_API_BASE_URL</code> (defaults to <code>http://localhost:3000/api</code>).
      </p>
      {error && <div className="error">{error}</div>}
      {!counts ? (
        <div className="small">Loading…</div>
      ) : (
        <div className="row" style={{ marginTop: 12 }}>
          <div className="card">
            <div className="small">Patients</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{counts.patients}</div>
          </div>
          <div className="card">
            <div className="small">Doctors</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{counts.doctors}</div>
          </div>
          <div className="card">
            <div className="small">Appointments</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{counts.appointments}</div>
          </div>
        </div>
      )}
    </div>
  );
}
