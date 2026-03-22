import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  register,
  confirmRegistration,
  resendConfirmationCode,
} from '../api/auth-api';

type Step = 'register' | 'confirm';

export default function RegisterPage() {
  const navigate = useNavigate();

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
          : 'Registration failed. Please try again.',
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
            {step === 'register' ? 'Create Account' : 'Verify Email'}
          </h1>
          <p className="auth-subtitle">
            {step === 'register'
              ? 'Sign up for Share Money'
              : `Enter the code sent to ${email}`}
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
                Name (optional)
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
                Email
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
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, uppercase, lowercase, number"
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirm}>
            <div className="form-group">
              <label className="form-label" htmlFor="code">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                className="form-input"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
                autoComplete="one-time-code"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <button
              type="button"
              className="btn btn-secondary auth-submit"
              onClick={handleResendCode}
              style={{ marginTop: '0.75rem' }}
            >
              Resend Code
            </button>
          </form>
        )}

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
