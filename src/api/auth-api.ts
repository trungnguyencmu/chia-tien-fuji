const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthMessage {
  message: string;
}

async function authFetch<T>(
  endpoint: string,
  body: Record<string, string>,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

export function register(
  email: string,
  password: string,
  name?: string,
): Promise<AuthMessage> {
  const body: Record<string, string> = { email, password };
  if (name) body.name = name;
  return authFetch<AuthMessage>('register', body);
}

export function confirmRegistration(
  email: string,
  confirmationCode: string,
): Promise<AuthMessage> {
  return authFetch<AuthMessage>('confirm', { email, confirmationCode });
}

export function login(
  email: string,
  password: string,
): Promise<AuthTokens> {
  return authFetch<AuthTokens>('login', { email, password });
}

export function refreshToken(
  refreshTokenValue: string,
): Promise<AuthTokens> {
  return authFetch<AuthTokens>('refresh', {
    refreshToken: refreshTokenValue,
  });
}

export function resendConfirmationCode(
  email: string,
): Promise<AuthMessage> {
  return authFetch<AuthMessage>('resend-code', { email });
}

export function forgotPassword(
  email: string,
): Promise<AuthMessage> {
  return authFetch<AuthMessage>('forgot-password', { email });
}

export function resetPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<AuthMessage> {
  return authFetch<AuthMessage>('reset-password', { email, code, newPassword });
}
