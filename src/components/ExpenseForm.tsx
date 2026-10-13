import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateExpenseRequest, TripMember } from '../api/api';
import { Avatar } from './ui/Avatar';
import { CategoryChipSelector, CATEGORIES, type Category } from './ui/CategoryTag';
import { Icon, Spinner } from './ui/Icon';
import { useLanguage } from '../i18n';

interface ExpenseFormProps {
  members: TripMember[];
  onSubmit: (expense: CreateExpenseRequest) => Promise<void>;
}

export function ExpenseForm({ members, onSubmit }: ExpenseFormProps) {
  const { t } = useLanguage();
  const [payer, setPayer] = useState('');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [title, setTitle] = useState(CATEGORIES[0].label);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbers = e.target.value.replace(/\D/g, '');
    setAmount(numbers);
    setDisplayAmount(numbers ? Number(numbers).toLocaleString('en-US') : '');
  };

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    if (!title || title === category.label) {
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
        payerUserId: payer,
        title: title.trim(),
        amount: amountNum,
        date: new Date().toISOString().split('T')[0],
      });

      setPayer('');
      setAmount('');
      setDisplayAmount('');
      setCategory(CATEGORIES[0]);
      setTitle(CATEGORIES[0].label);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToAddExpense'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      {/* 1. Amount — Hero Element */}
      <div className="expense-form-amount-wrapper">
        <label className="expense-form-amount-label" htmlFor="expense-amount">
          {t('howMuch')}
        </label>
        <input
          id="expense-amount"
          type="text"
          inputMode="numeric"
          className="expense-form-amount-input"
          value={displayAmount}
          onChange={handleAmountChange}
          disabled={loading}
          placeholder={t('enterAmount')}
          autoComplete="off"
          autoFocus
        />
        <div className="expense-form-amount-currency">{t('currency')}</div>
      </div>

      {/* 2. Category — Smart Chips */}
      <div className="section-block">
        <div className="expense-form-section-label">{t('selectCategory')}</div>
        <CategoryChipSelector
          selected={category.id}
          onSelect={handleCategorySelect}
        />
        <input
          type="text"
          className="form-input expense-form-description"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          placeholder={`e.g., ${category.label}`}
          aria-label={t('whatFor')}
        />
      </div>

      {/* 3. Who Paid — Avatar Picker */}
      <div className="section-block">
        <div className="expense-form-section-label">{t('whoPaid')}</div>
        <div className="avatar-picker">
          {members.map((m) => (
            <motion.button
              key={m.userId}
              type="button"
              className={`avatar-picker-item ${payer === m.userId ? 'selected' : ''}`}
              onClick={() => setPayer(m.userId)}
              aria-pressed={payer === m.userId}
              whileTap={{ scale: 0.97 }}
            >
              <Avatar name={m.displayName} size="lg" />
              <span className="avatar-picker-name">{m.displayName.split(' ')[0]}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="alert alert-error"
            role="alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Icon name="alert-circle" />
            <span className="alert-body">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. CTA Button — Sticky */}
      <div className="expense-form-cta">
        <button
          type="submit"
          disabled={loading || !payer || !amount || !title.trim()}
          className="btn btn-primary btn-lg btn-block"
        >
          {loading ? <Spinner /> : <Icon name="plus" />}
          {loading ? t('adding') : t('addExpense')}
        </button>
      </div>
    </form>
  );
}
