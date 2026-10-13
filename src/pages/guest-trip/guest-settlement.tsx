import { GuestSettlement as GuestSettlementData } from '../../api/guest-api';
import { Icon } from '../../components/ui/Icon';
import { useLanguage } from '../../i18n';

interface GuestSettlementProps {
  settlement: GuestSettlementData | null;
}

export function GuestSettlement({ settlement }: GuestSettlementProps) {
  const { t } = useLanguage();
  if (!settlement || settlement.totalExpenses === 0) {
    return (
      <div className="card">
        <h2 className="card-title">
          <Icon name="wallet" size={22} />
          {t('settlement')}
        </h2>
        <div className="empty-state">
          <div className="empty-state-icon">
            <Icon name="bar-chart" size={26} />
          </div>
          <p>{t('addExpensesToSeeWhoOwes')}</p>
        </div>
      </div>
    );
  }

  const { balances, transactions, totalExpenses, participantCount } = settlement;
  const sharePerPerson = participantCount > 0 ? totalExpenses / participantCount : 0;

  return (
    <div className="card">
      <h2 className="card-title">
        <Icon name="wallet" size={22} />
        {t('settlement')}
      </h2>

      <div className="grid grid-2 section-block">
        <div className="stat-card">
          <div className="stat-label">{t('totalExpenses')}</div>
          <div className="stat-value">{totalExpenses.toLocaleString()} {t('currency')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('members')}</div>
          <div className="stat-value">{participantCount}</div>
        </div>
        <div className="stat-card span-2">
          <div className="stat-label">{t('sharePerPerson')}</div>
          <div className="stat-value">
            {Math.round(sharePerPerson).toLocaleString()} {t('currency')}
          </div>
        </div>
      </div>

      {/* Who owes who comes first: it is the answer people open this tab for */}
      <div className="section-block">
        <h3 className="section-heading">
          <Icon name="swap" />
          {t('whoOwesWho')}
        </h3>
        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon is-success">
              <Icon name="check" size={26} />
            </div>
            <p className="settled-message">{t('everyoneIsSettledGuest')}</p>
          </div>
        ) : (
          <ul className="transaction-list">
            {transactions.map((tx, i) => (
              <li key={i} className="transaction-item">
                <Icon name="arrow-right" />
                <span className="transaction-text">
                  <strong>{tx.from}</strong> {t('owes')} <strong>{tx.to}</strong>
                </span>
                <span className="settlement-amount">
                  {Math.round(tx.amount).toLocaleString()} {t('currency')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="section-heading">
          <Icon name="users" />
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
                  <td className="numeric">
                    {Math.round(b.totalPaid).toLocaleString()}
                  </td>
                  <td className="numeric">
                    {Math.round(b.share).toLocaleString()}
                  </td>
                  <td className="numeric">
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
    </div>
  );
}
