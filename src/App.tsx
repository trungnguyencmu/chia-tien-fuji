import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/auth-context';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';

// Lazy load pages to reduce initial bundle size
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// Loading fallback component
function PageLoader() {
  return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
      <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600' }}>
        Loading...
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes — redirect to /app if already logged in */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Suspense fallback={<PageLoader />}>
                  <LandingPage />
                </Suspense>
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Suspense fallback={<PageLoader />}>
                  <LoginPage />
                </Suspense>
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Suspense fallback={<PageLoader />}>
                  <RegisterPage />
                </Suspense>
              </PublicRoute>
            }
          />

          {/* Protected app routes — redirect to / if not logged in */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PageLoader />}>
                  <HomePage />
                </Suspense>
              }
            />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
