import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/auth-context';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load pages to reduce initial bundle size
const HomePage = lazy(() => import('./pages/HomePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
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
          {/* Public auth routes */}
          <Route
            path="/login"
            element={
              <Suspense fallback={<PageLoader />}>
                <LoginPage />
              </Suspense>
            }
          />
          <Route
            path="/register"
            element={
              <Suspense fallback={<PageLoader />}>
                <RegisterPage />
              </Suspense>
            }
          />

          {/* Protected app routes */}
          <Route
            path="/"
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
            <Route
              path="admin"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminPage />
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
