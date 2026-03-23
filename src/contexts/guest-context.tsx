import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { joinTrip } from '../api/guest-api';
import {
  getGuestClaims,
  setGuestToken,
  clearGuestToken,
  isGuestTokenExpired,
} from '../utils/guest-storage';

interface GuestContextType {
  isGuest: boolean;
  isLoading: boolean;
  tripId: string | null;
  displayName: string | null;
  join: (code: string, displayName: string) => Promise<string>;
  leave: () => void;
}

const GuestContext = createContext<GuestContextType | null>(null);

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tripId, setTripId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const claims = getGuestClaims();
    if (claims && !isGuestTokenExpired()) {
      setIsGuest(true);
      setTripId(claims.tripId);
      setDisplayName(claims.displayName);
    } else if (claims) {
      // Token exists but expired
      clearGuestToken();
    }
    setIsLoading(false);
  }, []);

  const join = useCallback(async (code: string, name: string) => {
    const response = await joinTrip(code, name);
    setGuestToken(response.token);
    setIsGuest(true);
    setTripId(response.tripId);
    setDisplayName(response.displayName);
    return response.tripId;
  }, []);

  const leave = useCallback(() => {
    clearGuestToken();
    setIsGuest(false);
    setTripId(null);
    setDisplayName(null);
  }, []);

  return (
    <GuestContext.Provider
      value={{ isGuest, isLoading, tripId, displayName, join, leave }}
    >
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest(): GuestContextType {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
}
