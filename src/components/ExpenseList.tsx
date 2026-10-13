import { useMemo, memo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Expense } from '../utils/calculation';
import { Avatar } from './ui/Avatar';
import { getIconForTitle } from './ui/CategoryTag';
import { Icon, Spinner } from './ui/Icon';
import { deleteExpense, deleteImage, fetchImages, TripMember } from '../api/api';
import { useLanguage } from '../i18n';
import { exportExpensesToExcel } from '../utils/export-excel';

interface ExpenseListProps {
  tripId: string;
  tripName?: string;
  expenses: Expense[];
  members: TripMember[];
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

export const ExpenseList = memo(function ExpenseList({ tripId, tripName, expenses, members, onExpenseDeleted }: ExpenseListProps) {
  const { t } = useLanguage();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lightboxExpense, setLightboxExpense] = useState<Expense | null>(null);
  const [deletingBill, setDeletingBill] = useState(false);

  const handleExport = useCallback(() => {
    if (expenses.length === 0) {
      alert(t('noExpensesToExport'));
      return;
    }
    try {
      const memberSettledStatus = new Map<string, boolean>();
      members.forEach((m) => memberSettledStatus.set(m.userId, !!m.isSettled));
      exportExpensesToExcel({
        tripName: tripName || 'expenses',
        expenses,
        members: members.map((m) => ({ userId: m.userId, displayName: m.displayName })),
        currency: t('currency'),
        memberSettledStatus,
      });
    } catch (err) {
      console.error('Export failed:', err);
      alert(err instanceof Error ? err.message : t('exportFailed'));
    }
  }, [expenses, members, tripName, t]);

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

  const memberNameById = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach((m) => map.set(m.userId, m.displayName));
    return map;
  }, [members]);

  if (expenses.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Icon name="receipt" size={26} />
          </div>
          <h3>{t('noExpensesYet')}</h3>
          <p>{t('addFirstExpense')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header">
        <div className="card-header-text">
          <h2 className="card-title">
            <Icon name="list" size={22} />
            {t('expenses')}
          </h2>
          <p className="card-subtitle tabular">
            {expenses.length} {expenses.length === 1 ? t('items').slice(0, -1) : t('items')} · {t('totalExpenses')} {totalAmount.toLocaleString()} {t('currency')}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleExport}
          disabled={expenses.length === 0}
          title={t('exportExcel')}
        >
          <Icon name="download" size={16} />
          {t('exportExcel')}
        </button>
      </div>

      {/* Timeline */}
      {Array.from(grouped.entries()).map(([dateKey, dateExpenses]) => {
        const { label } = formatDate(dateKey);
        return (
          <div key={dateKey} className="timeline-group">
            <div className="timeline-date">{label}</div>
            {dateExpenses.map((expense) => {
              const payerName = expense.payerName
                ?? memberNameById.get(expense.payerUserId)
                ?? expense.payerUserId;
              const isDeleting = deletingId === expense.id;
              return (
                <div key={expense.id} className="expense-card">
                  <div className="expense-icon">
                    <Icon name={getIconForTitle(expense.title)} size={22} />
                  </div>
                  <div className="expense-details">
                    <div className="expense-title">{expense.title}</div>
                    <div className="expense-meta">
                      <Avatar name={payerName} size="sm" />
                      <span>{payerName} {t('paid')}</span>
                      <span aria-hidden="true">·</span>
                      <span>{members.length > 0 ? `${members.length} ${t('people')}` : 'everyone'}</span>
                      {expense.billImageUrl && (
                        <button
                          type="button"
                          className="link-btn"
                          onClick={() => setLightboxExpense(expense)}
                          title={t('viewReceipt')}
                        >
                          <Icon name="receipt" size={14} />
                          {t('receipt')}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="expense-side">
                    <div className="expense-amount">{expense.amount.toLocaleString()}</div>
                    <button
                      type="button"
                      className="icon-btn icon-btn-danger"
                      onClick={() => handleDelete(expense.id, expense.tripId, expense.title)}
                      disabled={isDeleting}
                      title={t('deleteExpense')}
                      aria-label={`${t('deleteExpense')}: ${expense.title}`}
                    >
                      {isDeleting ? <Spinner /> : <Icon name="trash" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Bill Image Lightbox */}
      <AnimatePresence>
        {lightboxExpense && (
          <motion.div
            className="photo-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={t('viewReceipt')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxExpense(null)}
          >
            <button
              type="button"
              className="photo-lightbox-close"
              onClick={() => setLightboxExpense(null)}
              aria-label={t('cancel')}
            >
              <Icon name="x" size={22} />
            </button>
            <motion.img
              src={lightboxExpense.billImageUrl!}
              alt={`${t('receipt')}: ${lightboxExpense.title}`}
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="photo-lightbox-actions">
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!window.confirm(t('deleteReceiptConfirm'))) return;
                  setDeletingBill(true);
                  try {
                    // Find the imageId by looking up trip images
                    const images = await fetchImages(tripId);
                    const image = images.find(img => img.url === lightboxExpense.billImageUrl);
                    if (image) {
                      await deleteImage(tripId, image.imageId);
                    }
                    setLightboxExpense(null);
                    onExpenseDeleted();
                  } catch (err) {
                    alert(err instanceof Error ? err.message : t('failedToDeleteReceipt'));
                  } finally {
                    setDeletingBill(false);
                  }
                }}
                disabled={deletingBill}
              >
                {deletingBill ? <Spinner size={16} /> : <Icon name="trash" size={16} />}
                {t('deleteReceipt')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
