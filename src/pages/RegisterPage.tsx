import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  register,
  confirmRegistration,
  resendConfirmationCode,
} from '../api/auth-api';
import { useLanguage } from '../i18n';

type Step = 'register' | 'confirm';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [step, setStep] = useState<Step>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await register(email, password, name || undefined);
      setSuccess(result.message);
      setStep('confirm');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('registrationFailed'),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await confirmRegistration(email, confirmationCode);
      navigate('/login', {
        state: { message: 'Email confirmed! You can now sign in.' },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Confirmation failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');

    try {
      const result = await resendConfirmationCode(email);
      setSuccess(result.message);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to resend code.',
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-icon">✨</div>
          <h1 className="auth-title">
            {step === 'register' ? t('createAccount') : t('verifyEmail')}
          </h1>
          <p className="auth-subtitle">
            {step === 'register'
              ? t('signUpForShareMoney')
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

        {step === 'register' ? (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                {t('nameOptional')}
              </label>
              <input
                id="name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                {t('email')}
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
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('min8Chars')}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? t('creatingAccount') : t('createAccount')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirm}>
            <div className="form-group">
              <label className="form-label" htmlFor="code">
                {t('verificationCode')}
              </label>
              <input
                id="code"
                type="text"
                className="form-input"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder={t('enter6DigitCode')}
                required
                autoComplete="one-time-code"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? t('verifying') : t('verifyEmail')}
            </button>

            <button
              type="button"
              className="btn btn-secondary auth-submit"
              onClick={handleResendCode}
              style={{ marginTop: '0.75rem' }}
            >
              {t('resendCode')}
            </button>
          </form>
        )}

        <div className="auth-footer">
          {t('alreadyHaveAccount')}{' '}
          <Link to="/login" className="auth-link">
            {t('signIn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
