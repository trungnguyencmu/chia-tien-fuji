import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGuest } from '../../contexts/guest-context';
import { Trip } from '../../api/api';
import { Expense } from '../../utils/calculation';
import {
  TripMember,
  GuestSettlement as GuestSettlementData,
  GuestAuthError,
  fetchGuestTrip,
  fetchGuestMembers,
  fetchGuestExpenses,
  fetchGuestSettlement,
  createGuestExpense,
  CreateGuestExpenseRequest,
} from '../../api/guest-api';
import { GuestExpenseForm } from './guest-expense-form';
import { GuestExpenseList } from './guest-expense-list';
import { GuestSettlement } from './guest-settlement';
import { GuestMemberList } from './guest-member-list';

type Tab = 'expenses' | 'settlement' | 'members';

export default function GuestTripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { displayName, leave } = useGuest();

  const [activeTab, setActiveTab] = useState<Tab>('expenses');
  const [trip, setTrip] = useState<Trip | null>(null);
  const [members, setMembers] = useState<TripMember[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlement, setSettlement] = useState<GuestSettlementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuthError = useCallback(
    (err: unknown) => {
      if (err instanceof GuestAuthError) {
        leave();
        navigate('/join', { replace: true });
        return true;
      }
      return false;
    },
    [leave, navigate],
  );

  const loadData = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    setError(null);

    try {
      const [tripData, membersData, expensesData, settlementData] =
        await Promise.all([
          fetchGuestTrip(tripId),
          fetchGuestMembers(tripId),
          fetchGuestExpenses(tripId),
          fetchGuestSettlement(tripId),
        ]);

      setTrip(tripData);
      setMembers(membersData);
      setExpenses(expensesData);
      setSettlement(settlementData);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof Error ? err.message : 'Failed to load trip data');
      }
    } finally {
      setLoading(false);
    }
  }, [tripId, handleAuthError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddExpense = async (expense: CreateGuestExpenseRequest) => {
    if (!tripId) return;
    await createGuestExpense(tripId, expense);
    // Reload expenses and settlement after adding
    const [expensesData, settlementData] = await Promise.all([
      fetchGuestExpenses(tripId),
      fetchGuestSettlement(tripId),
    ]);
    setExpenses(expensesData);
    setSettlement(settlementData);
  };

  const handleLeave = () => {
    leave();
    navigate('/join', { replace: true });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600' }}>
          Loading trip...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
        <div className="card">
          <div className="alert alert-error">⚠️ {error}</div>
          <button className="btn btn-primary" onClick={loadData} style={{ marginTop: '1rem' }}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
            {trip?.tripName || 'Trip'}
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
            Logged in as <strong>{displayName}</strong>
          </p>
        </div>
        <button
          onClick={handleLeave}
          className="btn btn-secondary"
          style={{ fontSize: '0.875rem' }}
        >
          🚪 Leave
        </button>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '12px',
          padding: '0.25rem',
        }}
      >
        {([
          { key: 'expenses', label: '💸 Expenses' },
          { key: 'settlement', label: '💰 Settlement' },
          { key: 'members', label: '👥 Members' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === key ? 'white' : 'transparent',
              color: activeTab === key ? '#1f2937' : 'rgba(255,255,255,0.8)',
              boxShadow: activeTab === key ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'expenses' && (
        <>
          <GuestExpenseForm members={members} onSubmit={handleAddExpense} />
          <div style={{ marginTop: '1.5rem' }}>
            <GuestExpenseList expenses={expenses} />
          </div>
        </>
      )}

      {activeTab === 'settlement' && (
        <GuestSettlement settlement={settlement} />
      )}

      {activeTab === 'members' && <GuestMemberList members={members} />}
    </div>
  );
}
