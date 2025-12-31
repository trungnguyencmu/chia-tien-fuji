import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentTripId, setCurrentTripId } from '../utils/storage';
import { fetchTrips, Trip } from '../api/api';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTripId, setCurrentTripIdState] = useState<string | null>(null);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);

  useEffect(() => {
    loadTrips();
    const tripId = getCurrentTripId();
    setCurrentTripIdState(tripId);
  }, []);

  useEffect(() => {
    // Auto-select latest (most recently created) trip if none selected
    if (!currentTripId && trips.length > 0) {
      // Sort by createdAt descending to get the latest trip
      const sortedTrips = [...trips].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const latestTrip = sortedTrips[0];

      setCurrentTripId(latestTrip.tripId);
      setCurrentTripIdState(latestTrip.tripId);
      window.dispatchEvent(new CustomEvent('tripChanged'));
    }

    // Update current trip when trips or currentTripId changes
    if (currentTripId && trips.length > 0) {
      const trip = trips.find((t) => t.tripId === currentTripId);
      setCurrentTrip(trip || null);
    } else {
      setCurrentTrip(null);
    }
  }, [currentTripId, trips]);

  const loadTrips = async () => {
    try {
      const data = await fetchTrips();
      const activeTrips = data.filter((t) => t.isActive);
      setTrips(activeTrips);
    } catch (err) {
      console.error('Failed to load trips:', err);
    }
  };

  const handleTripChange = (tripId: string) => {
    setCurrentTripId(tripId);
    setCurrentTripIdState(tripId);
    window.dispatchEvent(new CustomEvent('tripChanged'));
  };

  return (
    <div>
      <nav
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 240, 245, 0.95) 100%)',
          borderRadius: '20px',
          padding: '1.25rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 24px rgb(255 158 193 / 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Top row: Navigation tabs and refresh */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: currentTrip ? '1rem' : '0' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <NavLink
              to="/"
              style={({ isActive }) => ({
                padding: '0.875rem 1.75rem',
                borderRadius: '15px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                background: isActive
                  ? 'linear-gradient(135deg, #ff9ec1 0%, #ffc4e1 100%)'
                  : 'rgba(255, 255, 255, 0.7)',
                color: isActive ? 'white' : '#5a5770',
                boxShadow: isActive ? '0 4px 12px rgb(255 158 193 / 0.3)' : 'none',
                border: isActive ? 'none' : '2px solid rgba(255, 158, 193, 0.2)',
              })}
            >
              🏠 Home
            </NavLink>
            <NavLink
              to="/admin"
              style={({ isActive }) => ({
                padding: '0.875rem 1.75rem',
                borderRadius: '15px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                background: isActive
                  ? 'linear-gradient(135deg, #c7b4f3 0%, #e4b5f7 100%)'
                  : 'rgba(255, 255, 255, 0.7)',
                color: isActive ? 'white' : '#5a5770',
                boxShadow: isActive ? '0 4px 12px rgb(199 180 243 / 0.3)' : 'none',
                border: isActive ? 'none' : '2px solid rgba(199, 180, 243, 0.2)',
              })}
            >
              ⚙️ Admin
            </NavLink>
          </div>

          {isHomePage && (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('refreshExpenses'))}
              style={{
                padding: '0.875rem',
                minWidth: 'auto',
                borderRadius: '15px',
                background: 'linear-gradient(135deg, #b4e4ff 0%, #c7b4f3 100%)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.25rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgb(180 228 255 / 0.3)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.1) rotate(180deg)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgb(180 228 255 / 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgb(180 228 255 / 0.3)';
              }}
              title="Refresh Data"
            >
              🔄
            </button>
          )}
        </div>

        {/* Bottom row: Current trip selector */}
        {currentTrip && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem 1rem',
              background: 'rgba(255, 158, 193, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 158, 193, 0.3)',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>✈️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: '600' }}>
                CURRENT TRIP
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--gray-900)' }}>
                {currentTrip.tripName}
              </div>
            </div>
            {trips.length > 1 && (
              <select
                value={currentTripId || ''}
                onChange={(e) => handleTripChange(e.target.value)}
                className="form-input"
                style={{
                  width: 'auto',
                  minWidth: '200px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                {trips.map((trip) => (
                  <option key={trip.tripId} value={trip.tripId}>
                    {trip.tripName}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => navigate('/admin')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: 'rgba(199, 180, 243, 0.2)',
                color: 'var(--gray-700)',
                border: '1px solid rgba(199, 180, 243, 0.3)',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(199, 180, 243, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(199, 180, 243, 0.2)';
              }}
            >
              ⚙️ Manage
            </button>
          </div>
        )}
      </nav>

      <Outlet />
    </div>
  );
}
