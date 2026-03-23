import { useState } from 'react';
import { CreateExpenseRequest } from '../api/api';
import { Avatar } from './ui/Avatar';
import { CategorySelector, type Category } from './ui/CategoryTag';
import { useLanguage } from '../i18n';

interface ExpenseFormProps {
  members: string[];
  onSubmit: (expense: CreateExpenseRequest) => Promise<void>;
}

export function ExpenseForm({ members, onSubmit }: ExpenseFormProps) {
  const { t } = useLanguage();
  const [payer, setPayer] = useState('');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbers = value.replace(/\D/g, '');
    setAmount(numbers);
    if (numbers) {
      setDisplayAmount(Number(numbers).toLocaleString('en-US'));
    } else {
      setDisplayAmount('');
    }
  };

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    if (!title) {
      setTitle(cat.label);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!payer || !amount || !title.trim()) {
      setError(t('pleaseFillAllFields'));
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError(t('pleaseEnterValidAmount'));
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        payer,
        title: title.trim(),
        amount: amountNum,
        date: new Date().toISOString().split('T')[0],
      });

      // Reset form
      setPayer('');
      setAmount('');
      setDisplayAmount('');
      setCategory(null);
      setTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToAddExpense'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Who Paid - Avatar Selector */}
      <div className="form-group">
        <label className="form-label">{t('whoPaid')}</label>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {members.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setPayer(name)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.75rem',
                borderRadius: 'var(--border-radius-sm)',
                border: `2px solid ${payer === name ? 'var(--primary)' : 'var(--gray-200)'}`,
                background: payer === name ? 'var(--primary-light)' : 'white',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                minWidth: '70px',
              }}
            >
              <Avatar name={name} size="lg" />
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--gray-700)' }}>
                {name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div className="form-group">
        <label className="form-label">{t('howMuch')}</label>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--gray-600)',
          }}>
            VND
          </span>
          <input
            type="text"
            inputMode="numeric"
            className="form-input"
            value={displayAmount}
            onChange={handleAmountChange}
            disabled={loading}
            placeholder="0"
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              paddingLeft: '4rem',
              textAlign: 'right',
              borderRadius: 'var(--border-radius)',
            }}
          />
        </div>
      </div>

      {/* Category */}
      <div className="form-group">
        <label className="form-label">{t('whatFor')}</label>
        <CategorySelector
          selected={category?.id}
          onSelect={handleCategorySelect}
        />
      </div>

      {/* Title (auto-filled from category, editable) */}
      {category && (
        <div className="form-group">
          <label className="form-label">{t('description')}</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            placeholder={`e.g., ${category.emoji} ${category.label}`}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !payer || !amount || !title.trim()}
        className="btn btn-primary"
        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
      >
        {loading ? '⏳ ' + t('adding') : '💸 ' + t('addExpense')}
      </button>
    </form>
  );
}
