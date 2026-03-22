import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreateExpenseRequest, fetchPayerNames } from '../api/api';
import { getCurrentTripId } from '../utils/storage';

interface ExpenseFormProps {
  onSubmit: (expense: CreateExpenseRequest) => Promise<void>;
}

export function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [payerNames, setPayerNames] = useState<string[]>([]);
  const [payer, setPayer] = useState('');
  const [customPayer, setCustomPayer] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tripId = getCurrentTripId();
    if (tripId) {
      loadPayerNames(tripId);
    }
  }, []);

  const loadPayerNames = async (tripId: string) => {
    try {
      const names = await fetchPayerNames(tripId);
      setPayerNames(names);
    } catch (err) {
      console.error('Failed to fetch payer names:', err);
    }
  };

  const handlePayerChange = (value: string) => {
    setPayer(value);
    if (value === 'custom') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      setCustomPayer('');
    }
  };

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

    const finalPayer = payer === 'custom' ? customPayer : payer;

    if (!finalPayer || !title || !amount || !date) {
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
        payer: finalPayer,
        title,
        amount: amountNum,
        date,
      });

      // Reset form
      setPayer('');
      setCustomPayer('');
      setShowCustomInput(false);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
          💸 Add New Expense
        </h2>
        {payerNames.length === 0 && (
          <Link to="/admin" className="btn btn-secondary" style={{ textDecoration: 'none', fontSize: '0.875rem' }}>
            ⚙️ Add Payers
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="payer">
              Payer Name
            </label>
            {payerNames.length > 0 ? (
              <>
                <select
                  id="payer"
                  className="form-input"
                  value={payer}
                  onChange={(e) => handlePayerChange(e.target.value)}
                  disabled={loading}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Select a payer...</option>
                  {payerNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                  <option value="custom">➕ Other (enter name)</option>
                </select>
                {showCustomInput && (
                  <input
                    type="text"
                    className="form-input"
                    value={customPayer}
                    onChange={(e) => setCustomPayer(e.target.value)}
                    disabled={loading}
                    placeholder="Enter custom name"
                    style={{ marginTop: '0.5rem' }}
                  />
                )}
              </>
            ) : (
              <input
                id="payer"
                type="text"
                className="form-input"
                value={payer}
                onChange={(e) => setPayer(e.target.value)}
                disabled={loading}
                placeholder="Enter name (or add payers in admin)"
              />
            )}
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
