import { useState } from 'react';
import { CreateExpenseRequest } from '../api/api';

interface ExpenseFormProps {
  onSubmit: (expense: CreateExpenseRequest) => Promise<void>;
}

export function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [payer, setPayer] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');

    // Store the raw number
    setAmount(numbers);

    // Format with commas for display
    if (numbers) {
      const formatted = Number(numbers).toLocaleString('en-US');
      setDisplayAmount(formatted);
    } else {
      setDisplayAmount('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!payer || !title || !amount || !date) {
      setError('All fields are required');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        payer,
        title,
        amount: amountNum,
        date,
      });

      // Reset form
      setPayer('');
      setTitle('');
      setAmount('');
      setDisplayAmount('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
        💸 Add New Expense
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="payer">
              Payer Name
            </label>
            <input
              id="payer"
              type="text"
              className="form-input"
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
              disabled={loading}
              placeholder="Enter payer name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              placeholder="e.g., Dinner, Hotel"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="amount">
              Amount (VND)
            </label>
            <input
              id="amount"
              type="text"
              inputMode="numeric"
              className="form-input"
              value={displayAmount}
              onChange={handleAmountChange}
              disabled={loading}
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="date">
              Date
            </label>
            <input
              id="date"
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? '⏳ Adding...' : '➕ Add Expense'}
        </button>

        {error && (
          <div className="alert alert-error" style={{ marginTop: '1rem' }}>
            ⚠️ {error}
          </div>
        )}
      </form>
    </div>
  );
}
