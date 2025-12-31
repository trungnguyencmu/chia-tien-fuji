import { useState, useEffect } from 'react';
import { fetchExpenses, createExpense, CreateExpenseRequest } from '../api/api';
import { Expense } from '../utils/calculation';
import { fetchPayerNames, getCurrentTripId } from '../utils/storage';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseList } from '../components/ExpenseList';
import { Settlement } from '../components/Settlement';

function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payerNames, setPayerNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);

  // Check for current trip on mount
  useEffect(() => {
    const tripId = getCurrentTripId();
    setCurrentTripId(tripId);

    if (tripId) {
      loadExpenses();
      loadPayerNames();
    } else {
      setLoading(false);
    }

    // Listen for refresh event from header
    const handleRefresh = () => {
      if (getCurrentTripId()) {
        loadExpenses();
        loadPayerNames();
      }
    };

    // Listen for trip change event from header
    const handleTripChange = () => {
      const newTripId = getCurrentTripId();
      setCurrentTripId(newTripId);
      if (newTripId) {
        loadExpenses();
        loadPayerNames();
      }
    };

    window.addEventListener('refreshExpenses', handleRefresh);
    window.addEventListener('tripChanged', handleTripChange);

    return () => {
      window.removeEventListener('refreshExpenses', handleRefresh);
      window.removeEventListener('tripChanged', handleTripChange);
    };
  }, []);

  const loadPayerNames = async () => {
    try {
      const names = await fetchPayerNames();
      setPayerNames(names);
    } catch (err) {
      console.error('Failed to load payer names:', err);
    }
  };

  const loadExpenses = async () => {
    const tripId = getCurrentTripId();
    if (!tripId) {
      setError('No trip selected');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchExpenses(tripId);
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expense: CreateExpenseRequest) => {
    const tripId = getCurrentTripId();
    if (!tripId) {
      throw new Error('No trip selected');
    }

    const newExpense = await createExpense(tripId, expense);
    setExpenses((prev) => [...prev, newExpense]);
  };

  if (!currentTripId) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✈️</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--gray-900)' }}>
          No Trip Selected
        </h2>
        <p style={{ color: 'var(--gray-600)', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Please create or select a trip in the Admin page to get started!
        </p>
        <a href="/admin" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          ⚙️ Go to Admin
        </a>
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
          <button onClick={loadExpenses} className="btn btn-primary">
            Retry
          </button>
        </div>
      )}

      <ExpenseForm onSubmit={handleAddExpense} />

      <ExpenseList expenses={expenses} onExpenseDeleted={loadExpenses} />

      <Settlement expenses={expenses} payerNames={payerNames} />
    </div>
  );
}

export default HomePage;
