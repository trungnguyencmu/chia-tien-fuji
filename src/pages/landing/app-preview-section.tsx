import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '../../i18n';

export function AppPreviewSection() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="app-preview"
      className="landing-section app-preview-section"
      ref={ref}
    >
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <span className="section-badge">{t('landingAppPreview')}</span>
        <h2 className="section-title">{t('landingAppPreviewTitle')}</h2>
        <p className="section-subtitle">
          {t('landingAppPreviewSubtitle')}
        </p>
      </motion.div>

      <motion.div
        className="preview-container"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="preview-window">
          <div className="preview-window-bar">
            <div className="preview-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <div className="preview-url">share-money.app</div>
          </div>

          <div className="preview-body">
            {/* Trip header */}
            <div className="preview-trip-header">
              <div>
                <h3 className="preview-trip-name">🏖️ {t('landingAppTripName')}</h3>
                <p className="preview-trip-meta">
                  4 {t('landingAppParticipants')} &middot; Mar 15 - 18
                </p>
              </div>
              <div className="preview-trip-total">
                <div className="preview-total-label">{t('landingAppTotal')}</div>
                <div className="preview-total-amount">$1,240.00</div>
              </div>
            </div>

            {/* Add expense form */}
            <div className="preview-form">
              <div className="preview-form-title">{t('landingAppAddExpense')}</div>
              <div className="preview-form-row">
                <div className="preview-input">
                  <span className="preview-input-label">{t('landingAppDescription')}</span>
                  <span className="preview-input-value">{t('landingAppBeachBBQ')}</span>
                </div>
                <div className="preview-input preview-input-small">
                  <span className="preview-input-label">{t('landingAppAmount')}</span>
                  <span className="preview-input-value">$120.00</span>
                </div>
              </div>
              <div className="preview-form-row">
                <div className="preview-input">
                  <span className="preview-input-label">{t('landingAppPaidBy')}</span>
                  <span className="preview-input-value">Mai</span>
                </div>
                <button className="preview-add-btn">+ {t('landingAppAddExpense')}</button>
              </div>
            </div>

            {/* Expense list */}
            <div className="preview-expenses">
              <div className="preview-expenses-title">{t('landingAppRecentExpenses')}</div>
              {[
                {
                  icon: '🍜',
                  nameKey: 'landingAppSeafoodDinner',
                  by: 'Mai',
                  amount: '$85.00',
                },
                {
                  icon: '🏨',
                  nameKey: 'landingAppHotel',
                  by: 'An',
                  amount: '$450.00',
                },
                {
                  icon: '🚕',
                  nameKey: 'landingAppAirportTransfer',
                  by: 'Khanh',
                  amount: '$32.00',
                },
                {
                  icon: '🎢',
                  nameKey: 'landingAppVinWonders',
                  by: 'Trang',
                  amount: '$96.00',
                },
              ].map((exp) => (
                <div key={exp.nameKey} className="preview-expense-row">
                  <span className="preview-expense-icon">{exp.icon}</span>
                  <div className="preview-expense-info">
                    <div className="preview-expense-name">{t(exp.nameKey as any)}</div>
                    <div className="preview-expense-by">{t('landingAppPaidByPattern')} {exp.by}</div>
                  </div>
                  <div className="preview-expense-amount">{exp.amount}</div>
                </div>
              ))}
            </div>

            {/* Settlement summary */}
            <div className="preview-settlement">
              <div className="preview-settlement-title">{t('landingAppWhoOwesWhom')}</div>
              <div className="preview-settlement-item">
                <span>Trang</span>
                <span className="preview-arrow">→</span>
                <span>Mai</span>
                <span className="preview-settlement-amount">$45.00</span>
              </div>
              <div className="preview-settlement-item">
                <span>Khanh</span>
                <span className="preview-arrow">→</span>
                <span>An</span>
                <span className="preview-settlement-amount">$78.50</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
