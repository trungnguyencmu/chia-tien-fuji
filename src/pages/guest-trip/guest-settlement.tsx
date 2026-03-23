import { GuestSettlement as GuestSettlementData } from '../../api/guest-api';
import { useLanguage } from '../../i18n';

interface GuestSettlementProps {
  settlement: GuestSettlementData | null;
}

export function GuestSettlement({ settlement }: GuestSettlementProps) {
  const { t } = useLanguage();
  if (!settlement || settlement.totalExpenses === 0) {
    return (
      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '700' }}>
          💰 {t('settlement')}
        </h2>
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <p>{t('addExpensesToSeeWhoOwes')}</p>
        </div>
      </div>
    );
  }

  const { balances, transactions, totalExpenses, participantCount } = settlement;
  const sharePerPerson = participantCount > 0 ? totalExpenses / participantCount : 0;

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
        💰 {t('settlement')}
      </h2>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          {t('totalExpenses')}
        </h3>
        <div className="grid grid-2" style={{ gap: '1rem' }}>
          <div className="stat-card" style={{ borderLeftColor: '#4f46e5' }}>
            <div className="stat-label">{t('totalExpenses')}</div>
            <div className="stat-value">{totalExpenses.toLocaleString()} {t('currency')}</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
            <div className="stat-label">{t('members')}</div>
            <div className="stat-value">{participantCount}</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#f59e0b', gridColumn: 'span 2' }}>
            <div className="stat-label">{t('sharePerPerson')}</div>
            <div className="stat-value">
              {Math.round(sharePerPerson).toLocaleString()} {t('currency')}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          {t('memberBalances')}
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('member')}</th>
                <th className="text-right">{t('paidCol')}</th>
                <th className="text-right">{t('share')}</th>
                <th className="text-right">{t('balance')}</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((b) => (
                <tr key={b.member}>
                  <td>
                    <strong>{b.member}</strong>
                  </td>
                  <td className="text-right">
                    {Math.round(b.totalPaid).toLocaleString()}
                  </td>
                  <td className="text-right">
                    {Math.round(b.share).toLocaleString()}
                  </td>
                  <td className="text-right">
                    <span
                      className={
                        b.balance > 0.01
                          ? 'badge badge-success'
                          : b.balance < -0.01
                          ? 'badge badge-danger'
                          : 'badge badge-neutral'
                      }
                    >
                      {b.balance > 0.01 && '+'}
                      {Math.round(b.balance).toLocaleString()}
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
          🔄 {t('whoOwesWho')}
        </h3>
        {transactions.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <div className="empty-state-icon">✅</div>
            <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#10b981' }}>
              {t('everyoneIsSettledGuest')}
            </p>
          </div>
        ) : (
          <ul className="transaction-list">
            {transactions.map((tx, i) => (
              <li key={i} className="transaction-item">
                💸 {tx.from} {t('owes')} {tx.to} {Math.round(tx.amount).toLocaleString()} {t('currency')}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
