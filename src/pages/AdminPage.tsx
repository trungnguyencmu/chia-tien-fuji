import { useState, useEffect } from 'react';
import { fetchPayerNames, addPayerName, removePayerName } from '../utils/storage';
import { deleteAllExpenses } from '../api/api';

export function AdminPage() {
  const [payerNames, setPayerNames] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadPayerNames();
  }, []);

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

    if (!deletePassword) {
      setError('Please enter the password');
      return;
    }

    if (
      !window.confirm(
        '⚠️ WARNING: This will permanently delete ALL expenses! Are you absolutely sure?'
      )
    ) {
      return;
    }

    setDeleteLoading(true);
    try {
      await deleteAllExpenses(deletePassword);
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
      <header
        style={{
          textAlign: 'center',
          marginBottom: '3rem',
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
          }}
        >
          ⚙️ Admin Settings
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem' }}>
          Manage payer names for your trip
        </p>
      </header>

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

      <div className="card" style={{ background: '#fffbeb', border: '2px solid #fcd34d' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span style={{ fontSize: '2rem' }}>💡</span>
          <div>
            <h3 style={{ fontWeight: '700', marginBottom: '0.5rem', color: '#78350f' }}>
              Tip
            </h3>
            <p style={{ color: '#78350f', lineHeight: '1.6' }}>
              Add all trip members here first. When you add an expense on the homepage, you'll
              be able to select from this list. This prevents typos and keeps names consistent!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
