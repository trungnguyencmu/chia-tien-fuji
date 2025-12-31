import { NavLink, Outlet, useLocation } from 'react-router-dom';

interface LayoutProps {
  onRefresh?: () => void;
}

export function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div>
      <nav
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 240, 245, 0.95) 100%)',
          borderRadius: '20px',
          padding: '1.25rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 24px rgb(255 158 193 / 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '2px solid rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <NavLink
            to="/"
            style={({ isActive }) => ({
              padding: '0.875rem 1.75rem',
              borderRadius: '15px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.95rem',
              transition: 'all 0.3s ease',
              background: isActive
                ? 'linear-gradient(135deg, #ff9ec1 0%, #ffc4e1 100%)'
                : 'rgba(255, 255, 255, 0.7)',
              color: isActive ? 'white' : '#5a5770',
              boxShadow: isActive ? '0 4px 12px rgb(255 158 193 / 0.3)' : 'none',
              border: isActive ? 'none' : '2px solid rgba(255, 158, 193, 0.2)',
            })}
          >
            🏠 Home
          </NavLink>
          <NavLink
            to="/admin"
            style={({ isActive }) => ({
              padding: '0.875rem 1.75rem',
              borderRadius: '15px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.95rem',
              transition: 'all 0.3s ease',
              background: isActive
                ? 'linear-gradient(135deg, #c7b4f3 0%, #e4b5f7 100%)'
                : 'rgba(255, 255, 255, 0.7)',
              color: isActive ? 'white' : '#5a5770',
              boxShadow: isActive ? '0 4px 12px rgb(199 180 243 / 0.3)' : 'none',
              border: isActive ? 'none' : '2px solid rgba(199, 180, 243, 0.2)',
            })}
          >
            ⚙️ Admin
          </NavLink>
        </div>

        {isHomePage && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('refreshExpenses'))}
            style={{
              padding: '0.875rem',
              minWidth: 'auto',
              borderRadius: '15px',
              background: 'linear-gradient(135deg, #b4e4ff 0%, #c7b4f3 100%)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgb(180 228 255 / 0.3)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) rotate(180deg)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgb(180 228 255 / 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgb(180 228 255 / 0.3)';
            }}
            title="Refresh Data"
          >
            🔄
          </button>
        )}
      </nav>

      <Outlet />
    </div>
  );
}
