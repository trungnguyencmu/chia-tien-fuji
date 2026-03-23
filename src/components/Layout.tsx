import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { getCurrentTripId, setCurrentTripId, clearCurrentTripId } from '../utils/storage';
import { fetchTrips, fetchCurrentTrip, fetchExpenses, fetchTripMembers, fetchImages, createTrip, deleteTrip, Trip, TripMember, TripImage } from '../api/api';
import { Expense } from '../utils/calculation';
import { useAuth } from '../contexts/auth-context';
import { useLanguage } from '../i18n';

export interface LayoutContext {
  trips: Trip[];
  currentTrip: Trip | null;
  currentTripId: string | null;
  expenses: Expense[];
  memberNames: string[];
  images: TripImage[];
  loading: boolean;
  error: string | null;
  reloadData: () => Promise<void>;
  reloadTrips: () => Promise<void>;
  reloadImages: () => Promise<void>;
}

export function Layout() {
  const navigate = useNavigate();
  const { userEmail, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [newTripName, setNewTripName] = useState('');
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [tripLoading, setTripLoading] = useState(false);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoaded, setTripsLoaded] = useState(false);
  const [currentTripId, setCurrentTripIdState] = useState<string | null>(null);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);

  // Trip data
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [memberNames, setMemberNames] = useState<string[]>([]);
  const [images, setImages] = useState<TripImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reload all trip data (for external callers)
  const reloadData = useCallback(async () => {
    if (!currentTripId) return;
    setLoading(true);
    setError(null);
    try {
      const [expensesData, membersData, imagesData] = await Promise.all([
        fetchExpenses(currentTripId),
        fetchTripMembers(currentTripId),
        fetchImages(currentTripId),
      ]);
      setExpenses(expensesData);
      setMemberNames(membersData.map((m: TripMember) => m.displayName));
      setImages(imagesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [currentTripId]);

  // Reload only images
  const reloadImages = useCallback(async () => {
    if (!currentTripId) return;
    try {
      const imagesData = await fetchImages(currentTripId);
      setImages(imagesData);
    } catch (err) {
      console.error('Failed to load images:', err);
    }
  }, [currentTripId]);

  // Reload trips list
  const reloadTrips = useCallback(async () => {
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

  // Load trips on mount
  useEffect(() => {
    reloadTrips();
  }, [reloadTrips]);

  // Handle trips loaded - set current trip and load its data
  useEffect(() => {
    if (!tripsLoaded) return;

    if (trips.length === 0) {
      clearCurrentTripId();
      setCurrentTripIdState(null);
      setCurrentTrip(null);
      setExpenses([]);
      setMemberNames([]);
      return;
    }

    // Validate stored trip ID exists in fetched trips
    const storedId = getCurrentTripId();
    const storedTripExists = storedId && trips.some((t) => t.tripId === storedId);

    if (storedTripExists) {
      setCurrentTripIdState(storedId);
    } else {
      // Stored trip is stale or none selected — clear stale and auto-select latest
      clearCurrentTripId();

      const sortedTrips = [...trips].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const latestTrip = sortedTrips[0];

      setCurrentTripId(latestTrip.tripId);
      setCurrentTripIdState(latestTrip.tripId);
    }
  }, [trips, tripsLoaded]);

  // When currentTripId changes, fetch full trip details and data ONCE
  useEffect(() => {
    if (!currentTripId) return;

    let cancelled = false;

    const initTrip = async () => {
      setLoading(true);
      setError(null);

      try {
        const [fullTrip, expensesData, membersData, imagesData] = await Promise.all([
          fetchCurrentTrip(currentTripId),
          fetchExpenses(currentTripId),
          fetchTripMembers(currentTripId),
          fetchImages(currentTripId),
        ]);

        if (!cancelled) {
          setCurrentTrip(fullTrip);
          setExpenses(expensesData);
          setMemberNames(membersData.map((m: TripMember) => m.displayName));
          setImages(imagesData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initTrip();

    return () => {
      cancelled = true;
    };
  }, [currentTripId]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      reloadData();
    };

    const handleTripUpdated = (e: CustomEvent<Trip>) => {
      setCurrentTrip(e.detail);
    };

    window.addEventListener('refreshExpenses', handleRefresh);
    window.addEventListener('tripUpdated', handleTripUpdated as EventListener);
    return () => {
      window.removeEventListener('refreshExpenses', handleRefresh);
      window.removeEventListener('tripUpdated', handleTripUpdated as EventListener);
    };
  }, [reloadData]);

  const handleTripChange = (tripId: string) => {
    setCurrentTripId(tripId);
    setCurrentTripIdState(tripId);
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
      await reloadTrips();
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
      await reloadTrips();
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
          boxShadow: '0 8px 24px rgb(116 185 255 / 0.2)',
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
              background: 'linear-gradient(135deg, #74b9ff 0%, #55efc4 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgb(116 185 255 / 0.3)',
            }}
          >
            💰 {t('appTitle')}
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
              title={t('refresh')}
            >
              🔄
            </button>
            <button
              onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: '15px',
                background: 'rgba(116, 185, 255, 0.3)',
                color: 'var(--gray-700)',
                border: '1px solid rgba(116, 185, 255, 0.4)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(116, 185, 255, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(116, 185, 255, 0.3)';
              }}
              title={language === 'en' ? 'Switch to Vietnamese' : 'Switch to English'}
            >
              {language === 'en' ? '🇺🇸 EN' : '🇻🇳 VI'}
            </button>
            <button
              onClick={() => { logout(); navigate('/'); }}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: '15px',
                background: 'rgba(116, 185, 255, 0.3)',
                color: 'var(--gray-700)',
                border: '1px solid rgba(116, 185, 255, 0.4)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(116, 185, 255, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(116, 185, 255, 0.3)';
              }}
              title={userEmail || t('signOut')}
            >
              {t('signOut')}
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
              background: 'rgba(116, 185, 255, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(116, 185, 255, 0.3)',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>✈️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: '600' }}>
                {t('currentTrip')}
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
              title={t('newTrip')}
            >
              ➕
            </button>
            <button
              onClick={() => handleDeleteTrip(currentTrip.tripId, currentTrip.tripName)}
              disabled={tripLoading}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                background: 'rgba(116, 185, 255, 0.2)',
                color: '#991b1b',
                border: '1px solid rgba(116, 185, 255, 0.3)',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: tripLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: tripLoading ? 0.5 : 1,
              }}
              onMouseOver={(e) => {
                if (!tripLoading) e.currentTarget.style.background = 'rgba(116, 185, 255, 0.4)';
              }}
              onMouseOut={(e) => {
                if (!tripLoading) e.currentTarget.style.background = 'rgba(116, 185, 255, 0.2)';
              }}
              title={t('deleteTrip')}
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
              placeholder={t('newTripNamePlaceholder')}
              style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              autoFocus
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={tripLoading || !newTripName.trim()}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {tripLoading ? '⏳' : t('create')}
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
              {t('cancel')}
            </button>
          </form>
        )}
      </nav>

      {tripsLoaded ? (
        <Outlet context={{ trips, currentTrip, currentTripId, expenses, memberNames, images, loading, error, reloadData, reloadTrips, reloadImages } satisfies LayoutContext} />
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600' }}>
            {t('loading')}
          </div>
        </div>
      )}
    </div>
  );
}
