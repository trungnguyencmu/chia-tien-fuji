import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export function AppPreviewSection() {
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
        <span className="section-badge">App Preview</span>
        <h2 className="section-title">See it in action</h2>
        <p className="section-subtitle">
          A clean, intuitive interface designed for real trips.
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
                <h3 className="preview-trip-name">🏖️ Nha Trang Trip</h3>
                <p className="preview-trip-meta">
                  4 participants &middot; Mar 15 - 18
                </p>
              </div>
              <div className="preview-trip-total">
                <div className="preview-total-label">Total</div>
                <div className="preview-total-amount">$1,240.00</div>
              </div>
            </div>

            {/* Add expense form */}
            <div className="preview-form">
              <div className="preview-form-title">Add Expense</div>
              <div className="preview-form-row">
                <div className="preview-input">
                  <span className="preview-input-label">Description</span>
                  <span className="preview-input-value">Beach BBQ dinner</span>
                </div>
                <div className="preview-input preview-input-small">
                  <span className="preview-input-label">Amount</span>
                  <span className="preview-input-value">$120.00</span>
                </div>
              </div>
              <div className="preview-form-row">
                <div className="preview-input">
                  <span className="preview-input-label">Paid by</span>
                  <span className="preview-input-value">Mai</span>
                </div>
                <button className="preview-add-btn">+ Add Expense</button>
              </div>
            </div>

            {/* Expense list */}
            <div className="preview-expenses">
              <div className="preview-expenses-title">Recent Expenses</div>
              {[
                {
                  icon: '🍜',
                  name: 'Seafood dinner',
                  by: 'Mai',
                  amount: '$85.00',
                },
                {
                  icon: '🏨',
                  name: 'Hotel (3 nights)',
                  by: 'An',
                  amount: '$450.00',
                },
                {
                  icon: '🚕',
                  name: 'Airport transfer',
                  by: 'Khanh',
                  amount: '$32.00',
                },
                {
                  icon: '🎢',
                  name: 'VinWonders tickets',
                  by: 'Trang',
                  amount: '$96.00',
                },
              ].map((exp) => (
                <div key={exp.name} className="preview-expense-row">
                  <span className="preview-expense-icon">{exp.icon}</span>
                  <div className="preview-expense-info">
                    <div className="preview-expense-name">{exp.name}</div>
                    <div className="preview-expense-by">Paid by {exp.by}</div>
                  </div>
                  <div className="preview-expense-amount">{exp.amount}</div>
                </div>
              ))}
            </div>

            {/* Settlement summary */}
            <div className="preview-settlement">
              <div className="preview-settlement-title">Who Owes Whom</div>
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
