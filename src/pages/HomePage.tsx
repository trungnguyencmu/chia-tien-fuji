import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { createExpense, deleteAllExpenses, createTrip, CreateExpenseRequest } from '../api/api';
import { setCurrentTripId } from '../utils/storage';
import { LayoutContext } from '../components/Layout';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseList } from '../components/ExpenseList';
import { Settlement } from '../components/Settlement';
import { TripMembers } from '../components/TripMembers';

function HomePage() {
  const { trips, currentTrip, currentTripId, expenses, memberNames, loading, error, reloadData, reloadTrips } = useOutletContext<LayoutContext>();

  // Create trip state
  const [newTripName, setNewTripName] = useState('');
  const [creating, setCreating] = useState(false);

  // Delete all expenses state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAddExpense = async (expense: CreateExpenseRequest) => {
    if (!currentTripId) throw new Error('No trip selected');
    await createExpense(currentTripId, expense);
    // Reload to get accurate data
    await reloadData();
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripName.trim()) return;

    setCreating(true);
    try {
      const newTrip = await createTrip(newTripName);
      setNewTripName('');
      setCurrentTripId(newTrip.tripId);
      await reloadTrips();
    } catch (err) {
      console.error('Failed to create trip:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAllExpenses = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTripId || !deletePassword) return;

    if (!window.confirm('This will permanently delete ALL expenses in this trip. Are you sure?')) return;

    setDeleteLoading(true);
    try {
      await deleteAllExpenses(currentTripId, deletePassword);
      setDeletePassword('');
      await reloadData();
    } catch (err) {
      console.error('Failed to delete expenses:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // No trips — first-time user
  if (trips.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✈️</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--gray-900)' }}>
          Create Your First Trip
        </h2>
        <p style={{ color: 'var(--gray-600)', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Get started by creating a trip to track shared expenses!
        </p>
        <form onSubmit={handleCreateTrip} style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              className="form-input"
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
              disabled={creating}
              placeholder="e.g., Fuji Trip 2025"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={creating || !newTripName.trim()}>
              {creating ? '⏳' : '➕ Create'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // No trip selected
  if (!currentTripId) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✈️</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--gray-900)' }}>
          No Trip Selected
        </h2>
        <p style={{ color: 'var(--gray-600)', fontSize: '1.1rem' }}>
          Select a trip from the header to get started.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600' }}>
          Loading expenses...
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="alert alert-error">
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <strong>Error:</strong> {error}
          </div>
          <button onClick={() => reloadData()} className="btn btn-primary">
            Retry
          </button>
        </div>
      )}

      <ExpenseForm onSubmit={handleAddExpense} />

      <ExpenseList expenses={expenses} onExpenseDeleted={reloadData} />

      <Settlement expenses={expenses} payerNames={memberNames} />

      {currentTrip && (
        <TripMembers trip={currentTrip} onMembersChanged={reloadData} />
      )}

      {/* Danger Zone */}
      <div className="card" style={{ background: '#fef2f2', border: '2px solid #fca5a5' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '700', color: '#991b1b' }}>
          🗑️ Danger Zone
        </h2>
        <form onSubmit={handleDeleteAllExpenses}>
          <p style={{ color: '#991b1b', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Permanently delete ALL expenses in this trip.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
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
              disabled={deleteLoading || !deletePassword}
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
        </form>
      </div>
    </div>
  );
}

export default HomePage;
