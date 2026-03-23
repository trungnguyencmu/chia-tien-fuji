import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../api/auth-api';
import { useLanguage } from '../i18n';

type Step = 'email' | 'reset';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await forgotPassword(email);
      setSuccess(result.message);
      setStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email, code, newPassword);
      navigate('/login', {
        state: { message: t('passwordResetSuccess') },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    try {
      const result = await forgotPassword(email);
      setSuccess(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-icon">🔑</div>
          <h1 className="auth-title">
            {step === 'email' ? t('forgotPassword') : t('resetPassword')}
          </h1>
          <p className="auth-subtitle">
            {step === 'email'
              ? t('forgotPasswordSubtitle')
              : t('enterCodeSentTo', { email })}
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>✅</span>
            {success}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendCode}>
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
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? t('sendingCode') : t('sendResetCode')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label className="form-label" htmlFor="code">
                {t('resetCode')}
              </label>
              <input
                id="code"
                type="text"
                className="form-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t('enterResetCode')}
                required
                autoComplete="one-time-code"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">
                {t('newPassword')}
              </label>
              <div className="password-input-wrapper">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('enterNewPassword')}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? t('resettingPassword') : t('resetPassword')}
            </button>

            <button
              type="button"
              className="btn btn-secondary auth-submit"
              onClick={handleResend}
              style={{ marginTop: '0.75rem' }}
            >
              {t('resendCode')}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login" className="auth-link">
            ← {t('backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
