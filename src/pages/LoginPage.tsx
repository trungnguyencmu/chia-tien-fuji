import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { useLanguage } from '../i18n';
import { Icon } from '../components/ui/Icon';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('loginFailed'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-icon"><Icon name="wallet" size={28} /></div>
          <h1 className="auth-title">{t('welcomeBack')}</h1>
          <p className="auth-subtitle">{t('signInToShareMoney')}</p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <Icon name="alert-circle" />
            <span className="alert-body">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              {t('emailLogin')}
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              {t('password')}
            </label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('enterYourPassword')}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? t('signingIn') : t('signIn')}
          </button>

          <div className="auth-aside">
            <Link to="/forgot-password" className="auth-link">
              {t('forgotPassword')}?
            </Link>
          </div>
        </form>

        <div className="auth-footer">
          {t('dontHaveAccount')}{' '}
          <Link to="/register" className="auth-link">
            {t('signUp')}
          </Link>
        </div>
      </div>
    </div>
  );
}
