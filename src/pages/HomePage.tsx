import { useState, useEffect } from 'react';
import { fetchExpenses, createExpense, CreateExpenseRequest } from '../api/api';
import { Expense } from '../utils/calculation';
import { fetchPayerNames } from '../utils/storage';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseList } from '../components/ExpenseList';
import { Settlement } from '../components/Settlement';

export function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payerNames, setPayerNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses and payer names on mount
  useEffect(() => {
    loadExpenses();
    loadPayerNames();

    // Listen for refresh event from header
    const handleRefresh = () => {
      loadExpenses();
      loadPayerNames();
    };

    window.addEventListener('refreshExpenses', handleRefresh);

    return () => {
      window.removeEventListener('refreshExpenses', handleRefresh);
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
