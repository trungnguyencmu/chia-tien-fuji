import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TripMember, CreateGuestExpenseRequest } from '../../api/guest-api';
import { Avatar } from '../../components/ui/Avatar';
import { CategoryChipSelector, CATEGORIES, type Category } from '../../components/ui/CategoryTag';
import { Icon, Spinner } from '../../components/ui/Icon';
import { useLanguage } from '../../i18n';

interface GuestExpenseFormProps {
  members: TripMember[];
  onSubmit: (expense: CreateGuestExpenseRequest) => Promise<void>;
}

export function GuestExpenseForm({ members, onSubmit }: GuestExpenseFormProps) {
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
      await onSubmit({
        payer,
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
      setError(err instanceof Error ? err.message : t('failedToAdd'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">
        <Icon name="plus" size={22} />
        {t('addNewExpense')}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* 1. Amount — Hero Element */}
        <div className="expense-form-amount-wrapper">
          <label className="expense-form-amount-label" htmlFor="guest-expense-amount">
            {t('howMuch')}
          </label>
          <input
            id="guest-expense-amount"
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
                className={`avatar-picker-item ${payer === m.displayName ? 'selected' : ''}`}
                onClick={() => setPayer(m.displayName)}
                aria-pressed={payer === m.displayName}
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
            {loading ? t('addingExpense') : t('addExpenseGuest')}
          </button>
        </div>
      </form>
    </div>
  );
}
