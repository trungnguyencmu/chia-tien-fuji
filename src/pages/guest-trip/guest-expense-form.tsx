import { useState } from 'react';
import { TripMember, CreateGuestExpenseRequest } from '../../api/guest-api';
import { useLanguage } from '../../i18n';

interface GuestExpenseFormProps {
  members: TripMember[];
  onSubmit: (expense: CreateGuestExpenseRequest) => Promise<void>;
}

export function GuestExpenseForm({ members, onSubmit }: GuestExpenseFormProps) {
  const { t } = useLanguage();
  const [payer, setPayer] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbers = e.target.value.replace(/\D/g, '');
    setAmount(numbers);
    setDisplayAmount(numbers ? Number(numbers).toLocaleString('en-US') : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!payer || !title || !amount || !date) {
      setError(t('allFieldsRequired'));
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError(t('amountMustBePositive'));
      return;
    }

    setLoading(true);

    try {
      await onSubmit({ payer, title, amount: amountNum, date });
      setPayer('');
      setTitle('');
      setAmount('');
      setDisplayAmount('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToAdd'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
        💸 {t('addNewExpense')}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="guest-payer">
              {t('payerName')}
            </label>
            <select
              id="guest-payer"
              className="form-input"
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
              disabled={loading}
              style={{ cursor: 'pointer' }}
            >
              <option value="">{t('selectPayer')}</option>
              {members.map((m) => (
                <option key={m.userId} value={m.displayName}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="guest-title">
              {t('title')}
            </label>
            <input
              id="guest-title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              placeholder="e.g., Dinner, Hotel"
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="guest-amount">
              {t('amountVnd')}
            </label>
            <input
              id="guest-amount"
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
            <label className="form-label" htmlFor="guest-date">
              {t('date')}
            </label>
            <input
              id="guest-date"
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? '⏳ ' + t('addingExpense') : '➕ ' + t('addExpenseGuest')}
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
