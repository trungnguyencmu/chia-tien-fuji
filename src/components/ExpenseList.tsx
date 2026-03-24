import { useMemo, memo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Expense } from '../utils/calculation';
import { Avatar } from './ui/Avatar';
import { getEmojiForTitle } from './ui/CategoryTag';
import { deleteExpense } from '../api/api';
import { useLanguage } from '../i18n';

interface ExpenseListProps {
  tripId: string;
  expenses: Expense[];
  members: string[];
  onExpenseDeleted: () => void;
}

function formatDate(dateStr: string): { label: string; isToday: boolean; isYesterday: boolean } {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return { label: 'Today', isToday: true, isYesterday: false };
  if (isYesterday) return { label: 'Yesterday', isToday: false, isYesterday: true };

  return {
    label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    isToday: false,
    isYesterday: false,
  };
}

function groupByDate(expenses: Expense[]): Map<string, Expense[]> {
  const groups = new Map<string, Expense[]>();

  const sorted = [...expenses].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  for (const expense of sorted) {
    const dateKey = expense.date;
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(expense);
  }

  return groups;
}

export const ExpenseList = memo(function ExpenseList({ tripId, expenses, members, onExpenseDeleted }: ExpenseListProps) {
  const { t } = useLanguage();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const handleDelete = useCallback(async (expenseId: string, expenseTripId: string, expenseTitle: string) => {
    // Safety check: ensure expense belongs to this trip
    if (expenseTripId !== tripId) {
      alert(`Cannot delete expense: it belongs to a different trip (${expenseTripId})`);
      return;
    }

    const confirm = window.prompt(
      `Type "delete" to confirm removing "${expenseTitle}":`
    );

    if (!confirm || confirm.toLowerCase() !== 'delete') return;

    setDeletingId(expenseId);

    try {
      await deleteExpense(tripId, expenseId);
      onExpenseDeleted();
    } catch (err) {
      alert(err instanceof Error ? err.message : t('deleteExpense') + ' failed');
    } finally {
      setDeletingId(null);
    }
  }, [tripId, onExpenseDeleted]);

  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const grouped = useMemo(() => groupByDate(expenses), [expenses]);

  if (expenses.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">🧾</div>
          <h3>{t('noExpensesYet')}</h3>
          <p>{t('addFirstExpense')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
            📋 {t('expenses')}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', margin: '0.25rem 0 0' }}>
            {expenses.length} {expenses.length === 1 ? t('items').slice(0, -1) : t('items')} • {t('totalExpenses')} {totalAmount.toLocaleString()} {t('currency')}
          </p>
        </div>
      </div>

      {/* Timeline */}
      {Array.from(grouped.entries()).map(([dateKey, dateExpenses]) => {
        const { label } = formatDate(dateKey);
        return (
          <div key={dateKey}>
            <div className="timeline-date">{label}</div>
            {dateExpenses.map((expense) => (
              <div key={expense.id} className="expense-card">
                <div className="expense-emoji">
                  {getEmojiForTitle(expense.title)}
                </div>
                <div className="expense-details">
                  <div className="expense-title">
                    {expense.title}
                    <span className="expense-split">
                      • {members.length > 0 ? `${members.length} ${t('people')}` : 'everyone'}
                    </span>
                  </div>
                  <div className="expense-meta">
                    <Avatar name={expense.payer} size="sm" />
                    <span>{expense.payer} {t('paid')}</span>
                    {expense.billImageUrl && (
                      <button
                        onClick={() => setLightboxImage(expense.billImageUrl!)}
                        style={{
                          background: 'rgba(79, 70, 229, 0.1)',
                          border: '1px solid rgba(79, 70, 229, 0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          color: '#4f46e5',
                          padding: '0.2rem 0.5rem',
                          marginLeft: '0.5rem',
                        }}
                        title={t('viewReceipt')}
                      >
                        🧾 {t('receipt')}
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="expense-amount">{expense.amount.toLocaleString()}</div>
                  <button
                    onClick={() => handleDelete(expense.id, expense.tripId, expense.title)}
                    disabled={deletingId === expense.id}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: deletingId === expense.id ? 'not-allowed' : 'pointer',
                      fontSize: '0.75rem',
                      color: 'var(--gray-500)',
                      padding: '0.25rem',
                      marginTop: '0.25rem',
                    }}
                    title={t('deleteExpense')}
                  >
                    {deletingId === expense.id ? '⏳' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Bill Image Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            className="photo-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
          >
            <button
              className="photo-lightbox-close"
              onClick={() => setLightboxImage(null)}
            >
              ✕
            </button>
            <motion.img
              src={lightboxImage}
              alt="Receipt"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
