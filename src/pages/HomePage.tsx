import { useState, useEffect } from 'react';
import { fetchExpenses, createExpense, CreateExpenseRequest } from '../api/api';
import { Expense } from '../utils/calculation';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseList } from '../components/ExpenseList';
import { Settlement } from '../components/Settlement';

export function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses on mount
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchExpenses();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expense: CreateExpenseRequest) => {
    const newExpense = await createExpense(expense);
    setExpenses((prev) => [...prev, newExpense]);
  };

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
          ✈️ Trip Expense Splitter
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem' }}>
          Track and split expenses with friends
        </p>
        <button
          onClick={loadExpenses}
          className="btn btn-secondary"
          style={{ marginTop: '1rem' }}
        >
          🔄 Refresh Data
        </button>
      </header>

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

      <ExpenseList expenses={expenses} />

      <Settlement expenses={expenses} />
    </div>
  );
}
