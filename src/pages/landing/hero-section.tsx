import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="hero-section">
      {/* Floating decorative elements */}
      <div className="hero-floating-elements">
        <motion.div
          className="hero-float hero-float-1"
          animate={{ y: [-10, 10, -10], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          🌍
        </motion.div>
        <motion.div
          className="hero-float hero-float-2"
          animate={{ y: [10, -10, 10], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          💳
        </motion.div>
        <motion.div
          className="hero-float hero-float-3"
          animate={{ y: [-15, 15, -15] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          ✈️
        </motion.div>
        <motion.div
          className="hero-float hero-float-4"
          animate={{ y: [8, -12, 8], x: [-5, 5, -5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          🏖️
        </motion.div>
      </div>

      <div className="hero-content">
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="hero-badge-dot" />
          No more awkward money talks
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Split Travel Expenses{' '}
          <span className="hero-title-accent">Effortlessly</span>
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          No more awkward calculations. Track, split, and settle instantly with
          friends. Focus on making memories, not counting pennies.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link to="/register" className="btn btn-primary hero-btn-primary">
            Start Free
            <span className="hero-btn-arrow">→</span>
          </Link>
          <a href="#app-preview" className="btn hero-btn-secondary">
            <span className="hero-btn-play">▶</span>
            View Demo
          </a>
        </motion.div>

        <motion.div
          className="hero-social-proof"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="hero-avatars">
            <div className="hero-avatar" style={{ background: '#74b9ff' }}>
              M
            </div>
            <div className="hero-avatar" style={{ background: '#c7b4f3' }}>
              A
            </div>
            <div className="hero-avatar" style={{ background: '#b4d4ff' }}>
              K
            </div>
            <div className="hero-avatar" style={{ background: '#a8e6cf' }}>
              T
            </div>
          </div>
          <span className="hero-users-text">
            Trusted by <strong>2,000+</strong> travelers
          </span>
        </motion.div>
      </div>

      {/* Hero illustration - a stylized app preview card */}
      <motion.div
        className="hero-illustration"
        initial={{ opacity: 0, x: 40, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="hero-phone">
          <div className="hero-phone-notch" />
          <div className="hero-phone-screen">
            <div className="hero-app-header">
              <div className="hero-app-title">🏖️ Nha Trang Trip</div>
              <div className="hero-app-amount">$1,240.00</div>
              <div className="hero-app-label">Total expenses</div>
            </div>
            <div className="hero-app-list">
              <div className="hero-app-item">
                <span className="hero-app-item-icon">🍜</span>
                <div className="hero-app-item-info">
                  <div className="hero-app-item-name">Dinner at Seafood</div>
                  <div className="hero-app-item-by">Paid by Mai</div>
                </div>
                <div className="hero-app-item-amount">$85.00</div>
              </div>
              <div className="hero-app-item">
                <span className="hero-app-item-icon">🏨</span>
                <div className="hero-app-item-info">
                  <div className="hero-app-item-name">Hotel (3 nights)</div>
                  <div className="hero-app-item-by">Paid by An</div>
                </div>
                <div className="hero-app-item-amount">$450.00</div>
              </div>
              <div className="hero-app-item">
                <span className="hero-app-item-icon">🚕</span>
                <div className="hero-app-item-info">
                  <div className="hero-app-item-name">Airport Transfer</div>
                  <div className="hero-app-item-by">Paid by Khanh</div>
                </div>
                <div className="hero-app-item-amount">$32.00</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
