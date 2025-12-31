import { useState } from 'react';
import { Expense } from '../utils/calculation';
import { deleteExpense } from '../api/api';

interface ExpenseListProps {
  expenses: Expense[];
  onExpenseDeleted: () => void;
}

export function ExpenseList({ expenses, onExpenseDeleted }: ExpenseListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (expenseId: string, expenseTitle: string) => {
    const password = window.prompt(
      `⚠️ Delete "${expenseTitle}"?\n\nEnter password to confirm:`
    );

    if (!password) return;

    setDeletingId(expenseId);

    try {
      await deleteExpense(expenseId, password);
      onExpenseDeleted();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '700' }}>
          📋 Expenses
        </h2>
        <div className="empty-state">
          <div className="empty-state-icon">💳</div>
          <p>No expenses yet. Add one above!</p>
        </div>
      </div>
    );
  }

  // Sort by date (newest first)
  const sorted = [...expenses].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
          📋 Expenses
        </h2>
        <div className="badge badge-neutral">
          {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
        </div>
      </div>

      <div className="stat-card" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-label">Total Expenses</div>
        <div className="stat-value">{totalAmount.toLocaleString()} VND</div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Payer</th>
              <th>Title</th>
              <th className="text-right">Amount (VND)</th>
              <th style={{ width: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.date}</td>
                <td>
                  <strong>{expense.payer}</strong>
                </td>
                <td>{expense.title}</td>
                <td className="text-right" style={{ fontWeight: '600' }}>
                  {expense.amount.toLocaleString()}
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(expense.id, expense.title)}
                    disabled={deletingId === expense.id}
                    style={{
                      padding: '0.375rem 0.75rem',
                      background: '#fee2e2',
                      color: '#991b1b',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '0.75rem',
                      cursor: deletingId === expense.id ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: deletingId === expense.id ? 0.6 : 1,
                    }}
                    onMouseOver={(e) => {
                      if (deletingId !== expense.id) e.currentTarget.style.background = '#fecaca';
                    }}
                    onMouseOut={(e) => {
                      if (deletingId !== expense.id) e.currentTarget.style.background = '#fee2e2';
                    }}
                  >
                    {deletingId === expense.id ? '⏳' : '🗑️'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
