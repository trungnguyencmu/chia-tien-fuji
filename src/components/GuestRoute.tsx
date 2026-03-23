import { Navigate, useParams } from 'react-router-dom';
import { useGuest } from '../contexts/guest-context';

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isGuest, isLoading, tripId } = useGuest();
  const { tripId: urlTripId } = useParams<{ tripId: string }>();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!isGuest) {
    return <Navigate to="/join" replace />;
  }

  // Guest can only access their own trip
  if (tripId && urlTripId && tripId !== urlTripId) {
    return <Navigate to={`/trips/${tripId}`} replace />;
  }

  return <>{children}</>;
}
