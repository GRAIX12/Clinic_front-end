import { NavLink, Outlet } from 'react-router-dom';

function Link({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: '8px 10px',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,.12)',
        background: isActive ? 'rgba(90,140,255,.35)' : 'rgba(255,255,255,.06)'
      })}
    >
      {label}
    </NavLink>
  );
}

export default function Layout() {
  return (
    <>
      <nav>
        <div className="inner">
          <div className="row" style={{ gap: 10 }}>
            <div style={{ fontWeight: 700 }}>Clinic CRUD</div>
            <span className="badge">Patients · Doctors · Appointments</span>
          </div>
          <div className="links">
            <Link to="/" label="Dashboard" />
            <Link to="/patients" label="Patients" />
            <Link to="/doctors" label="Doctors" />
            <Link to="/appointments" label="Appointments" />
          </div>
        </div>
      </nav>
      <div className="container">
        <Outlet />
      </div>
    </>
  );
}
