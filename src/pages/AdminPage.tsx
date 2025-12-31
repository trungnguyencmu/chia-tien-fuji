import { useState, useEffect } from 'react';
import { fetchPayerNames, addPayerName, removePayerName, getCurrentTripId, setCurrentTripId } from '../utils/storage';
import { deleteAllExpenses, fetchTrips, createTrip, deleteTrip, Trip } from '../api/api';

function AdminPage() {
  // Trip state
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTripId, setCurrentTripIdState] = useState<string | null>(null);
  const [newTripName, setNewTripName] = useState('');
  const [tripsLoading, setTripsLoading] = useState(false);

  // Payer names state
  const [payerNames, setPayerNames] = useState<string[]>([]);
  const [newName, setNewName] = useState('');

  // General state
  const [deletePassword, setDeletePassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadTrips();
    const tripId = getCurrentTripId();
    setCurrentTripIdState(tripId);

    if (tripId) {
      loadPayerNames();
    }
  }, []);

  const loadTrips = async () => {
    setTripsLoading(true);
    try {
      const data = await fetchTrips();
      // Only show active trips
      const activeTrips = data.filter((t) => t.isActive);
      setTrips(activeTrips);
    } catch (err) {
      setError('Failed to load trips from server');
    } finally {
      setTripsLoading(false);
    }
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newTripName.trim()) {
      setError('Trip name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const newTrip = await createTrip(newTripName);
      setTrips((prev) => [...prev, newTrip]);
      setNewTripName('');

      // Auto-select the new trip
      setCurrentTripId(newTrip.tripId);
      setCurrentTripIdState(newTrip.tripId);

      setSuccess(`Created trip "${newTripName}" successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrip = (tripId: string) => {
    setCurrentTripId(tripId);
    setCurrentTripIdState(tripId);
    loadPayerNames();
    setSuccess('Trip selected!');
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleDeleteTrip = async (tripId: string, tripName: string) => {
    if (window.confirm(`Are you sure you want to delete trip "${tripName}"?`)) {
      setLoading(true);
      try {
        await deleteTrip(tripId);
        setTrips((prev) => prev.filter((t) => t.tripId !== tripId));

        // If deleted current trip, clear selection
        if (tripId === currentTripId) {
          setCurrentTripId('');
          setCurrentTripIdState(null);
          setPayerNames([]);
        }

        setSuccess(`Deleted trip "${tripName}" successfully!`);
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete trip');
      } finally {
        setLoading(false);
      }
    }
  };

  const loadPayerNames = async () => {
    setLoading(true);
    try {
      const names = await fetchPayerNames();
      setPayerNames(names);
    } catch (err) {
      setError('Failed to load payer names from server');
    } finally {
      setLoading(false);
    }
  };

  const handleAddName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newName.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const updatedNames = await addPayerName(newName);
      setPayerNames(updatedNames);
      setNewName('');
      setSuccess(`Added "${newName}" successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add name');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveName = async (name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}"?`)) {
      setLoading(true);
      try {
        const updatedNames = await removePayerName(name);
        setPayerNames(updatedNames);
        setSuccess(`Removed "${name}" successfully!`);
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove name');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAllExpenses = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentTripId) {
      setError('No trip selected');
      return;
    }

    if (!deletePassword) {
      setError('Please enter the password');
      return;
    }

    if (
      !window.confirm(
        '⚠️ WARNING: This will permanently delete ALL expenses in this trip! Are you absolutely sure?'
      )
    ) {
      return;
    }

    setDeleteLoading(true);
    try {
      await deleteAllExpenses(currentTripId, deletePassword);
      setDeletePassword('');
      setSuccess('All expenses have been deleted successfully!');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expenses');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      {success && (
        <div
          className="alert"
          style={{
            background: '#d1fae5',
            border: '1px solid #6ee7b7',
            color: '#065f46',
            marginBottom: '2rem',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>✅</span>
          <div style={{ flex: 1 }}>{success}</div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Trip Management */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(255, 158, 193, 0.1) 0%, rgba(199, 180, 243, 0.1) 100%)' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
          ✈️ Trip Management
        </h2>

        <form onSubmit={handleCreateTrip} style={{ marginBottom: '2rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="newTripName">
              Create New Trip
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                id="newTripName"
                type="text"
                className="form-input"
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
                disabled={loading}
                placeholder="e.g., Fuji Trip 2025, Da Lat Weekend"
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⏳ Creating...' : '➕ Create Trip'}
              </button>
            </div>
          </div>
        </form>

        {tripsLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2rem' }}>⏳</div>
            <p>Loading trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✈️</div>
            <p>No trips yet. Create your first trip above!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {trips.map((trip) => (
              <div
                key={trip.tripId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: trip.tripId === currentTripId ? 'linear-gradient(135deg, #ff9ec1 0%, #ffc4e1 100%)' : 'white',
                  borderRadius: '8px',
                  border: trip.tripId === currentTripId ? '2px solid #ff9ec1' : '2px solid var(--gray-200)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => handleSelectTrip(trip.tripId)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {trip.tripId === currentTripId ? '✅' : '✈️'}
                  </span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '1rem', color: trip.tripId === currentTripId ? 'white' : 'inherit' }}>
                      {trip.tripName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: trip.tripId === currentTripId ? 'rgba(255, 255, 255, 0.8)' : 'var(--gray-600)' }}>
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTrip(trip.tripId, trip.tripName);
                  }}
                  disabled={loading}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.6 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!loading) e.currentTarget.style.background = '#fecaca';
                  }}
                  onMouseOut={(e) => {
                    if (!loading) e.currentTarget.style.background = '#fee2e2';
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payer Names - only show if trip is selected */}
      {currentTripId && (
        <>
          <div className="card">
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
              👥 Add Payer Name
            </h2>
            <form onSubmit={handleAddName}>
              <div className="form-group">
                <label className="form-label" htmlFor="newName">
                  Name
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input
                    id="newName"
                    type="text"
                    className="form-input"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={loading}
                    placeholder="Enter name (e.g., Alice, Bob)"
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? '⏳ Adding...' : '➕ Add Name'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="card">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
          📋 Payer Names ({payerNames.length})
        </h2>

        {payerNames.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <p>No payer names yet. Add some above!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {payerNames.map((name) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'var(--gray-50)',
                  borderRadius: '8px',
                  border: '2px solid var(--gray-200)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>👤</span>
                  <span style={{ fontWeight: '600', fontSize: '1rem' }}>{name}</span>
                </div>
                <button
                  onClick={() => handleRemoveName(name)}
                  disabled={loading}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.6 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!loading) e.currentTarget.style.background = '#fecaca';
                  }}
                  onMouseOut={(e) => {
                    if (!loading) e.currentTarget.style.background = '#fee2e2';
                  }}
                >
                  🗑️ Remove
                </button>
              </div>
            ))}
          </div>
        )}
          </div>

          <div className="card" style={{ background: '#fef2f2', border: '2px solid #fca5a5' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700', color: '#991b1b' }}>
              🗑️ Danger Zone
            </h2>
        <form onSubmit={handleDeleteAllExpenses}>
          <div className="form-group">
            <label className="form-label" htmlFor="deletePassword" style={{ color: '#991b1b' }}>
              Delete All Expenses
            </label>
            <p style={{ color: '#991b1b', fontSize: '0.875rem', marginBottom: '1rem' }}>
              This will permanently delete ALL expenses from Google Sheets. Type the password <strong>"ok"</strong> to confirm.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                id="deletePassword"
                type="text"
                className="form-input"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                disabled={deleteLoading}
                placeholder="Enter password"
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                disabled={deleteLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#dc2626',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: deleteLoading ? 'not-allowed' : 'pointer',
                  opacity: deleteLoading ? 0.6 : 1,
                }}
              >
                {deleteLoading ? '⏳ Deleting...' : '🗑️ Delete All'}
              </button>
            </div>
          </div>
            </form>
          </div>
        </>
      )}

      <div className="card" style={{ background: '#fffbeb', border: '2px solid #fcd34d' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span style={{ fontSize: '2rem' }}>💡</span>
          <div>
            <h3 style={{ fontWeight: '700', marginBottom: '0.5rem', color: '#78350f' }}>
              Tip
            </h3>
            <p style={{ color: '#78350f', lineHeight: '1.6' }}>
              <strong>How to use:</strong><br />
              1. Create a trip above (e.g., "Fuji Trip 2025")<br />
              2. Add all trip members as payer names<br />
              3. Go to Home page to add expenses<br />
              <br />
              Each trip has its own expenses and payer names. Switch between trips by clicking them above!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
