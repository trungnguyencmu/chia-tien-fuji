import { useMemo } from 'react';
import { Expense, calculateBalances, calculateTransactions } from '../utils/calculation';
import { Avatar } from './ui/Avatar';
import { useLanguage } from '../i18n';

interface SettlementProps {
  expenses: Expense[];
  payerNames?: string[];
}

export function Settlement({ expenses, payerNames }: SettlementProps) {
  const { t } = useLanguage();
  const balances = useMemo(() => calculateBalances(expenses, payerNames), [expenses, payerNames]);
  const transactions = useMemo(() => calculateTransactions(balances), [balances]);
  const total = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  if (expenses.length === 0) {
    return null;
  }

  const sharePerPerson = balances.length > 0 ? Math.round(total / balances.length) : 0;

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        💰 {t('settlement')}
      </h2>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeftColor: '#4f46e5' }}>
          <div className="stat-label">{t('totalSpent')}</div>
          <div className="stat-value" style={{ fontSize: '1.25rem' }}>
            {total.toLocaleString()} {t('currency')}
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="stat-label">{t('yourShare')}</div>
          <div className="stat-value" style={{ fontSize: '1.25rem' }}>
            {sharePerPerson.toLocaleString()} {t('currency')}
          </div>
        </div>
      </div>

      {/* Who Owes Who - The Most Important Part */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '1rem' }}>
          🔄 {t('whoOwesWho')}
        </h3>

        {transactions.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <div className="empty-state-icon">✅</div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#10b981' }}>
              {t('allSettledUp')}
            </p>
          </div>
        ) : (
          <div>
            {transactions.map((transaction, index) => (
              <div key={index} className="settlement-card">
                <Avatar name={transaction.from} size="md" />
                <div className="settlement-arrow">→</div>
                <div className="settlement-names">
                  <div className="settlement-from">{transaction.from}</div>
                  <div className="settlement-to">{t('owes')} {transaction.to}</div>
                </div>
                <div className="settlement-amount">
                  {transaction.amount.toLocaleString()} {t('currency')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Individual Balances */}
      {balances.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.75rem' }}>
            💼 {t('balances')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {balances.map((balance) => {
              const isPositive = balance.balance > 0.01;
              const isNegative = balance.balance < -0.01;
              const isSettled = !isPositive && !isNegative;

              return (
                <div
                  key={balance.member}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: isSettled ? 'var(--gray-50)' : 'white',
                    borderRadius: 'var(--border-radius-sm)',
                    border: `1px solid ${isSettled ? 'var(--gray-200)' : 'var(--gray-200)'}`,
                  }}
                >
                  <Avatar name={balance.member} size="sm" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{balance.member}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                      {t('paid')} {Math.round(balance.totalPaid).toLocaleString()} {t('currency')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {isSettled ? (
                      <span className="badge badge-neutral">{t('settled')}</span>
                    ) : isPositive ? (
                      <span className="badge badge-success">
                        +{Math.round(balance.balance).toLocaleString()} {t('currency')}
                      </span>
                    ) : (
                      <span className="badge badge-danger">
                        {Math.round(balance.balance).toLocaleString()} {t('currency')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
