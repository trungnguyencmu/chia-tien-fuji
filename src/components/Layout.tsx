import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { useLanguage } from '../i18n';
import { Icon } from './ui/Icon';
import { LanguageToggle } from './ui/LanguageToggle';

export function Layout() {
  const navigate = useNavigate();
  const { userEmail, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <div>
      <header className="app-nav">
        <button type="button" className="app-brand" onClick={() => navigate('/app')}>
          <span className="app-brand-mark">
            <Icon name="wallet" size={20} />
          </span>
          {t('appTitle')}
        </button>

        <div className="app-nav-actions">
          <LanguageToggle />
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => { logout(); navigate('/'); }}
            title={userEmail || t('signOut')}
          >
            <Icon name="log-out" size={16} />
            <span className="app-nav-label">{t('signOut')}</span>
          </button>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
