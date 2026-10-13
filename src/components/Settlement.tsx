import { useMemo } from 'react';
import { Expense, calculateBalances, calculateTransactions, BalanceMember } from '../utils/calculation';
import { Avatar } from './ui/Avatar';
import { Icon } from './ui/Icon';
import { useLanguage } from '../i18n';

interface SettlementProps {
  expenses: Expense[];
  members?: BalanceMember[];
  memberSettledStatus?: Map<string, boolean>;
}

export function Settlement({ expenses, members, memberSettledStatus }: SettlementProps) {
  const { t } = useLanguage();
  const balances = useMemo(() => calculateBalances(expenses, members), [expenses, members]);
  const transactions = useMemo(() => calculateTransactions(balances), [balances]);
  const total = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  const memberNameById = useMemo(() => {
    const map = new Map<string, string>();
    members?.forEach((m) => map.set(m.userId, m.displayName));
    return map;
  }, [members]);

  if (expenses.length === 0) {
    return null;
  }

  const sharePerPerson = balances.length > 0 ? Math.round(total / balances.length) : 0;

  return (
    <div className="card">
      <h2 className="card-title">
        <Icon name="wallet" size={22} />
        {t('settlement')}
      </h2>

      {/* Summary */}
      <div className="grid grid-2 section-block">
        <div className="stat-card">
          <div className="stat-label">{t('totalSpent')}</div>
          <div className="stat-value">
            {total.toLocaleString()} {t('currency')}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('yourShare')}</div>
          <div className="stat-value">
            {sharePerPerson.toLocaleString()} {t('currency')}
          </div>
        </div>
      </div>

      {/* Who Owes Who - The Most Important Part */}
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
            <p className="settled-message">{t('allSettledUp')}</p>
          </div>
        ) : (
          <div>
            {transactions.map((transaction, index) => {
              const fromName = (transaction.fromUserId && memberNameById.get(transaction.fromUserId)) || transaction.from;
              const toName = (transaction.toUserId && memberNameById.get(transaction.toUserId)) || transaction.to;
              const key = transaction.fromUserId && transaction.toUserId
                ? `${transaction.fromUserId}->${transaction.toUserId}`
                : index;
              return (
                <div key={key} className="settlement-card">
                  <Avatar name={fromName} size="md" />
                  <div className="settlement-arrow">
                    <Icon name="arrow-right" />
                  </div>
                  <div className="settlement-names">
                    <div className="settlement-from">{fromName}</div>
                    <div className="settlement-to">{t('owes')} {toName}</div>
                  </div>
                  <div className="settlement-amount">
                    {transaction.amount.toLocaleString()} {t('currency')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Individual Balances */}
      {balances.length > 0 && (
        <div>
          <h3 className="section-heading">
            <Icon name="users" />
            {t('balances')}
          </h3>
          <div className="balance-list">
            {balances.map((balance) => {
              const isPositive = balance.balance > 0.01;
              const isNegative = balance.balance < -0.01;
              const settledKey = balance.userId ?? balance.member;
              const displayName = (balance.userId && memberNameById.get(balance.userId)) || balance.member;
              // Manual member.isSettled flag takes precedence over balance-based calculation
              const isSettled = memberSettledStatus?.has(settledKey)
                ? memberSettledStatus.get(settledKey)!
                : (!isPositive && !isNegative);

              return (
                <div key={settledKey} className={`balance-row${isSettled ? ' is-settled' : ''}`}>
                  <Avatar name={displayName} size="sm" />
                  <div className="balance-info">
                    <div className="balance-name">{displayName}</div>
                    <div className="balance-paid">
                      {t('paid')} {Math.round(balance.totalPaid).toLocaleString()} {t('currency')}
                    </div>
                  </div>
                  {isSettled ? (
                    <span className="badge badge-neutral">
                      <Icon name="check" size={12} />
                      {t('settled')}
                    </span>
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
