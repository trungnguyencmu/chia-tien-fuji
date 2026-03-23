import { jwtDecode } from 'jwt-decode';

const GUEST_TOKEN_KEY = 'guest_token';

export interface GuestClaims {
  sub: string;
  tripId: string;
  displayName: string;
  isGuest: boolean;
  iat: number;
  exp: number;
}

export function getGuestToken(): string | null {
  return localStorage.getItem(GUEST_TOKEN_KEY);
}

export function setGuestToken(token: string): void {
  localStorage.setItem(GUEST_TOKEN_KEY, token);
}

export function clearGuestToken(): void {
  localStorage.removeItem(GUEST_TOKEN_KEY);
}

export function getGuestClaims(): GuestClaims | null {
  const token = getGuestToken();
  if (!token) return null;

  try {
    return jwtDecode<GuestClaims>(token);
  } catch {
    clearGuestToken();
    return null;
  }
}

export function isGuestTokenExpired(): boolean {
  const claims = getGuestClaims();
  if (!claims) return true;
  // exp is in seconds, Date.now() in ms
  return Date.now() >= claims.exp * 1000;
}
