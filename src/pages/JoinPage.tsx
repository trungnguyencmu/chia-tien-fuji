import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGuest } from '../contexts/guest-context';

export default function JoinPage() {
  const navigate = useNavigate();
  const { code: urlCode } = useParams<{ code: string }>();
  const { isGuest, tripId, join } = useGuest();

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
      setError('Both invite code and display name are required');
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
          <h1 className="auth-title">Join a Trip</h1>
          <p className="auth-subtitle">
            Enter the invite code shared by your trip organizer
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
              Invite Code
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
              Your Name
            </label>
            <input
              id="displayName"
              type="text"
              className="form-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How should others see you?"
              required
              autoComplete="name"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? 'Joining...' : '🚀 Join Trip'}
          </button>
        </form>

        <div className="auth-footer">
          Have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
