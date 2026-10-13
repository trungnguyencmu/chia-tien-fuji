import { Navigate, useParams } from 'react-router-dom';
import { useGuest } from '../contexts/guest-context';
import { PageLoader } from './ui/PageLoader';

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isGuest, isLoading, tripId } = useGuest();
  const { tripId: urlTripId } = useParams<{ tripId: string }>();

  if (isLoading) {
    return <PageLoader />;
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
