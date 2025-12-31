import { NavLink, Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div>
      <nav
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
        }}
      >
        <NavLink
          to="/"
          style={({ isActive }) => ({
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.875rem',
            transition: 'all 0.2s',
            background: isActive ? '#4f46e5' : 'transparent',
            color: isActive ? 'white' : '#374151',
          })}
        >
          🏠 Home
        </NavLink>
        <NavLink
          to="/admin"
          style={({ isActive }) => ({
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.875rem',
            transition: 'all 0.2s',
            background: isActive ? '#4f46e5' : 'transparent',
            color: isActive ? 'white' : '#374151',
          })}
        >
          ⚙️ Admin
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
}
