import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGuest } from '../contexts/guest-context';
import { useLanguage } from '../i18n';

export default function JoinPage() {
  const navigate = useNavigate();
  const { code: urlCode } = useParams<{ code: string }>();
  const { isGuest, tripId, join } = useGuest();
  const { t } = useLanguage();

  const [code, setCode] = useState(urlCode || '');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already has valid guest session
  useEffect(() => {
    if (isGuest && tripId) {
      navigate(`/trips/${tripId}`, { replace: true });
    }
  }, [isGuest, tripId, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = displayName.trim();

    if (!trimmedCode || !trimmedName) {
      setError(t('bothRequired'));
      return;
    }

    setLoading(true);

    try {
      const resultTripId = await join(trimmedCode, trimmedName);
      navigate(`/trips/${resultTripId}`, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to join trip. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-icon">🎒</div>
          <h1 className="auth-title">{t('joinTrip')}</h1>
          <p className="auth-subtitle">
            {t('enterInviteCode')}
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="code">
              {t('inviteLink')}
            </label>
            <input
              id="code"
              type="text"
              className="form-input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. A3F1B2C4"
              required
              maxLength={8}
              autoComplete="off"
              style={{ letterSpacing: '0.15em', fontWeight: '600' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="displayName">
              {t('yourName')}
            </label>
            <input
              id="displayName"
              type="text"
              className="form-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('howShouldOthersSeeYou')}
              required
              autoComplete="name"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? t('joining') : '🚀 ' + t('join')}
          </button>
        </form>

        <div className="auth-footer">
          {t('haveAccount')}{' '}
          <Link to="/login" className="auth-link">
            {t('signIn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
