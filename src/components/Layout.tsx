import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { getCurrentTripId, setCurrentTripId, clearCurrentTripId } from '../utils/storage';
import { fetchTrips, createTrip, deleteTrip, Trip } from '../api/api';
import { useAuth } from '../contexts/auth-context';

export interface LayoutContext {
  trips: Trip[];
  currentTripId: string | null;
  reloadTrips: () => Promise<void>;
}

export function Layout() {
  const navigate = useNavigate();
  const { userEmail, logout } = useAuth();
  const [newTripName, setNewTripName] = useState('');
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [tripLoading, setTripLoading] = useState(false);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoaded, setTripsLoaded] = useState(false);
  const [currentTripId, setCurrentTripIdState] = useState<string | null>(null);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  useEffect(() => {
    if (trips.length === 0) {
      clearCurrentTripId();
      setCurrentTripIdState(null);
      setCurrentTrip(null);
      window.dispatchEvent(new CustomEvent('tripChanged'));
      return;
    }

    // Validate stored trip ID exists in fetched trips
    const storedId = getCurrentTripId();
    const storedTripExists = storedId && trips.some((t) => t.tripId === storedId);

    if (storedTripExists) {
      // Stored trip is valid
      setCurrentTripIdState(storedId);
      setCurrentTrip(trips.find((t) => t.tripId === storedId) || null);
    } else {
      // Stored trip is stale or none selected — clear stale and auto-select latest
      clearCurrentTripId();

      const sortedTrips = [...trips].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const latestTrip = sortedTrips[0];

      setCurrentTripId(latestTrip.tripId);
      setCurrentTripIdState(latestTrip.tripId);
      setCurrentTrip(latestTrip);
      window.dispatchEvent(new CustomEvent('tripChanged'));
    }
  }, [trips]);

  useEffect(() => {
    // Update current trip object when selection changes
    if (currentTripId && trips.length > 0) {
      const trip = trips.find((t) => t.tripId === currentTripId);
      setCurrentTrip(trip || null);
    }
  }, [currentTripId, trips]);

  const loadTrips = useCallback(async () => {
    try {
      const data = await fetchTrips();
      const activeTrips = data.filter((t) => t.isActive);
      setTrips(activeTrips);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setTripsLoaded(true);
    }
  }, []);

  const handleTripChange = (tripId: string) => {
    setCurrentTripId(tripId);
    setCurrentTripIdState(tripId);
    window.dispatchEvent(new CustomEvent('tripChanged'));
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripName.trim()) return;

    setTripLoading(true);
    try {
      const newTrip = await createTrip(newTripName);
      setNewTripName('');
      setShowCreateTrip(false);
      setCurrentTripId(newTrip.tripId);
      setCurrentTripIdState(newTrip.tripId);
      await loadTrips();
      window.dispatchEvent(new CustomEvent('tripChanged'));
    } catch (err) {
      console.error('Failed to create trip:', err);
    } finally {
      setTripLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId: string, tripName: string) => {
    if (!window.confirm(`Delete trip "${tripName}"? This cannot be undone.`)) return;

    setTripLoading(true);
    try {
      await deleteTrip(tripId);
      if (tripId === currentTripId) {
        clearCurrentTripId();
        setCurrentTripIdState(null);
        setCurrentTrip(null);
      }
      await loadTrips();
      window.dispatchEvent(new CustomEvent('tripChanged'));
    } catch (err) {
      console.error('Failed to delete trip:', err);
    } finally {
      setTripLoading(false);
    }
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
        {/* Top row: Title and actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: currentTrip || showCreateTrip ? '1rem' : '0' }}>
          <div
            style={{
              padding: '0.875rem 1.75rem',
              borderRadius: '15px',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: 'linear-gradient(135deg, #ff9ec1 0%, #ffc4e1 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgb(255 158 193 / 0.3)',
            }}
          >
            💰 Share Money
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
            <button
              onClick={() => { logout(); navigate('/'); }}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: '15px',
                background: 'rgba(255, 179, 186, 0.3)',
                color: 'var(--gray-700)',
                border: '1px solid rgba(255, 179, 186, 0.4)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 179, 186, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 179, 186, 0.3)';
              }}
              title={userEmail || 'Sign out'}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Trip selector row */}
        {currentTrip && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
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
                  minWidth: '150px',
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
              onClick={() => setShowCreateTrip(!showCreateTrip)}
              style={{
                padding: '0.5rem 0.75rem',
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
              title="New Trip"
            >
              ➕
            </button>
            <button
              onClick={() => handleDeleteTrip(currentTrip.tripId, currentTrip.tripName)}
              disabled={tripLoading}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                background: 'rgba(255, 179, 186, 0.2)',
                color: '#991b1b',
                border: '1px solid rgba(255, 179, 186, 0.3)',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: tripLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: tripLoading ? 0.5 : 1,
              }}
              onMouseOver={(e) => {
                if (!tripLoading) e.currentTarget.style.background = 'rgba(255, 179, 186, 0.4)';
              }}
              onMouseOut={(e) => {
                if (!tripLoading) e.currentTarget.style.background = 'rgba(255, 179, 186, 0.2)';
              }}
              title="Delete current trip"
            >
              🗑️
            </button>
          </div>
        )}

        {/* Inline create trip form */}
        {showCreateTrip && (
          <form
            onSubmit={handleCreateTrip}
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: currentTrip ? '0.75rem' : '0',
              padding: '0.75rem 1rem',
              background: 'rgba(199, 180, 243, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(199, 180, 243, 0.3)',
            }}
          >
            <input
              type="text"
              className="form-input"
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
              disabled={tripLoading}
              placeholder="New trip name..."
              style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              autoFocus
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={tripLoading || !newTripName.trim()}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {tripLoading ? '⏳' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreateTrip(false); setNewTripName(''); }}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                background: 'transparent',
                border: '1px solid var(--gray-300)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'var(--gray-600)',
              }}
            >
              ✕
            </button>
          </form>
        )}
      </nav>

      {tripsLoaded ? (
        <Outlet context={{ trips, currentTripId, reloadTrips: loadTrips } satisfies LayoutContext} />
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600' }}>
            Loading...
          </div>
        </div>
      )}
    </div>
  );
}
