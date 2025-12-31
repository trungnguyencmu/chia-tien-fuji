import { Expense, calculateBalances, calculateTransactions, formatTransaction } from '../utils/calculation';

interface SettlementProps {
  expenses: Expense[];
  payerNames?: string[];
}

export function Settlement({ expenses, payerNames }: SettlementProps) {
  if (expenses.length === 0) {
    return null;
  }

  const balances = calculateBalances(expenses, payerNames);
  const transactions = calculateTransactions(balances);
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
        💰 Settlement
      </h2>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          Summary
        </h3>
        <div className="grid grid-2" style={{ gap: '1rem' }}>
          <div className="stat-card" style={{ borderLeftColor: '#4f46e5' }}>
            <div className="stat-label">Total Expenses</div>
            <div className="stat-value">{total.toLocaleString()} VND</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
            <div className="stat-label">Members</div>
            <div className="stat-value">{balances.length}</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#f59e0b', gridColumn: 'span 2' }}>
            <div className="stat-label">Share per Person</div>
            <div className="stat-value">{Math.round(total / balances.length).toLocaleString()} VND</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          Member Balances
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th className="text-right">Paid</th>
                <th className="text-right">Share</th>
                <th className="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((balance) => (
                <tr key={balance.member}>
                  <td>
                    <strong>{balance.member}</strong>
                  </td>
                  <td className="text-right">{Math.round(balance.totalPaid).toLocaleString()}</td>
                  <td className="text-right">{Math.round(balance.share).toLocaleString()}</td>
                  <td className="text-right">
                    <span
                      className={
                        balance.balance > 0.01
                          ? 'badge badge-success'
                          : balance.balance < -0.01
                          ? 'badge badge-danger'
                          : 'badge badge-neutral'
                      }
                    >
                      {balance.balance > 0.01 && '+'}
                      {Math.round(balance.balance).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          🔄 Who Owes Whom
        </h3>
        {transactions.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <div className="empty-state-icon">✅</div>
            <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#10b981' }}>
              Everyone is settled!
            </p>
          </div>
        ) : (
          <ul className="transaction-list">
            {transactions.map((transaction, index) => (
              <li key={index} className="transaction-item">
                💸 {formatTransaction(transaction)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
