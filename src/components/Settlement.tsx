import { useMemo } from 'react';
import { Expense, calculateBalances, calculateTransactions } from '../utils/calculation';
import { Avatar } from './ui/Avatar';

interface SettlementProps {
  expenses: Expense[];
  payerNames?: string[];
}

export function Settlement({ expenses, payerNames }: SettlementProps) {
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
        💰 Settlement
      </h2>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeftColor: '#4f46e5' }}>
          <div className="stat-label">Total Spent</div>
          <div className="stat-value" style={{ fontSize: '1.25rem' }}>
            {total.toLocaleString()} VND
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="stat-label">Your Share</div>
          <div className="stat-value" style={{ fontSize: '1.25rem' }}>
            {sharePerPerson.toLocaleString()} VND
          </div>
        </div>
      </div>

      {/* Who Owes Who - The Most Important Part */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '1rem' }}>
          🔄 Who Owes Who
        </h3>

        {transactions.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <div className="empty-state-icon">✅</div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#10b981' }}>
              All settled up!
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
                  <div className="settlement-to">owes {transaction.to}</div>
                </div>
                <div className="settlement-amount">
                  {transaction.amount.toLocaleString()} VND
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
            💼 Balances
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
                      Paid {Math.round(balance.totalPaid).toLocaleString()} VND
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {isSettled ? (
                      <span className="badge badge-neutral">Settled</span>
                    ) : isPositive ? (
                      <span className="badge badge-success">
                        +{Math.round(balance.balance).toLocaleString()} VND
                      </span>
                    ) : (
                      <span className="badge badge-danger">
                        {Math.round(balance.balance).toLocaleString()} VND
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
