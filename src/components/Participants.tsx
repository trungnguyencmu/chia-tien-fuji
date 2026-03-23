import { useState } from 'react';
import {
  fetchPayerNames,
  addPayerNameToBackend,
  deletePayerNameFromBackend,
} from '../api/api';

interface ParticipantsProps {
  tripId: string;
  payerNames: string[];
  onParticipantsChanged: (names: string[]) => void;
}

export function Participants({ tripId, payerNames, onParticipantsChanged }: ParticipantsProps) {
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = newName.trim();
    if (!trimmedName) {
      setError('Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      await addPayerNameToBackend(tripId, trimmedName);
      const names = await fetchPayerNames(tripId);
      onParticipantsChanged(names);
      setNewName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add participant');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveName = async (name: string) => {
    if (!window.confirm(`Remove "${name}" from this trip?`)) return;

    setLoading(true);
    try {
      await deletePayerNameFromBackend(tripId, name);
      const names = await fetchPayerNames(tripId);
      onParticipantsChanged(names);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove participant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
        👥 Participants ({payerNames.length})
      </h2>

      <form onSubmit={handleAddName} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            className="form-input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={loading}
            placeholder="Add participant name"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳' : '➕ Add'}
          </button>
        </div>
        {error && (
          <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>
            ⚠️ {error}
          </div>
        )}
      </form>

      {payerNames.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <p>No participants yet. Add some above!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {payerNames.map((name) => (
            <div
              key={name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                background: 'var(--gray-50)',
                borderRadius: '20px',
                border: '2px solid var(--gray-200)',
                fontSize: '0.875rem',
              }}
            >
              <span style={{ fontWeight: '600' }}>{name}</span>
              <button
                onClick={() => handleRemoveName(name)}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.75rem',
                  color: '#991b1b',
                  padding: '0.125rem 0.25rem',
                  borderRadius: '4px',
                  opacity: loading ? 0.5 : 1,
                }}
                title={`Remove ${name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
