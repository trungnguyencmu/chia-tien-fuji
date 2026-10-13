import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { PageLoader } from './ui/PageLoader';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
