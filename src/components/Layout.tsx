import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { useLanguage } from '../i18n';

export function Layout() {
  const navigate = useNavigate();
  const { userEmail, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div>
      <nav
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 240, 245, 0.95) 100%)',
          borderRadius: '20px',
          padding: '1.25rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 24px rgb(116 185 255 / 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            onClick={() => navigate('/app')}
            style={{
              padding: '0.875rem 1.75rem',
              borderRadius: '15px',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: 'linear-gradient(135deg, #74b9ff 0%, #55efc4 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgb(116 185 255 / 0.3)',
              cursor: 'pointer',
            }}
          >
            💰 {t('appTitle')}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: '15px',
                background: 'rgba(116, 185, 255, 0.3)',
                color: 'var(--gray-700)',
                border: '1px solid rgba(116, 185, 255, 0.4)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(116, 185, 255, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(116, 185, 255, 0.3)';
              }}
              title={language === 'en' ? 'Switch to Vietnamese' : 'Switch to English'}
            >
              {language === 'en' ? '🇺🇸 EN' : '🇻🇳 VI'}
            </button>
            <button
              onClick={() => { logout(); navigate('/'); }}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: '15px',
                background: 'rgba(116, 185, 255, 0.3)',
                color: 'var(--gray-700)',
                border: '1px solid rgba(116, 185, 255, 0.4)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(116, 185, 255, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(116, 185, 255, 0.3)';
              }}
              title={userEmail || t('signOut')}
            >
              {t('signOut')}
            </button>
          </div>
        </div>
      </nav>

      <Outlet />
    </div>
  );
}
