import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { getGuestClaims, isGuestTokenExpired } from '../utils/guest-storage';

/**
 * Redirects authenticated users to the app dashboard.
 * Redirects returning guests to their trip.
 * Shows children (landing, login, register) only for unauthenticated users.
 */
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <div
          style={{
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: '600',
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  // Returning guest: redirect to their trip
  const guestClaims = getGuestClaims();
  if (guestClaims && !isGuestTokenExpired()) {
    return <Navigate to={`/trips/${guestClaims.tripId}`} replace />;
  }

  return <>{children}</>;
}
