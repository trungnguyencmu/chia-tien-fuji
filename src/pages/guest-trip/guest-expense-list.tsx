import { useMemo, memo } from 'react';
import { Expense } from '../../utils/calculation';
import { Icon } from '../../components/ui/Icon';
import { useLanguage } from '../../i18n';

interface GuestExpenseListProps {
  expenses: Expense[];
}

export const GuestExpenseList = memo(function GuestExpenseList({
  expenses,
}: GuestExpenseListProps) {
  const { t } = useLanguage();
  const sorted = useMemo(
    () =>
      [...expenses].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [expenses],
  );

  const totalAmount = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  );

  if (expenses.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title">
          <Icon name="list" size={22} />
          Expenses
        </h2>
        <div className="empty-state">
          <div className="empty-state-icon">
            <Icon name="receipt" size={26} />
          </div>
          <p>No expenses yet — add the first one!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <Icon name="list" size={22} />
          Expenses
        </h2>
        <div className="badge badge-neutral">
          {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
        </div>
      </div>

      <div className="stat-card section-block">
        <div className="stat-label">Total Expenses</div>
        <div className="stat-value">{totalAmount.toLocaleString()} {t('currency')}</div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Payer</th>
              <th>Title</th>
              <th className="text-right">{t('amount')} ({t('currency')})</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((expense) => (
              <tr key={expense.id}>
                <td className="tabular">{expense.date}</td>
                <td>
                  <strong>{expense.payerName ?? expense.payerUserId}</strong>
                </td>
                <td>{expense.title}</td>
                <td className="numeric">
                  <strong>{expense.amount.toLocaleString()}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
