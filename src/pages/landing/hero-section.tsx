import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../../i18n';
import { Icon } from '../../components/ui/Icon';

export function HeroSection() {
  const { t } = useLanguage();
  // Decorative float loops are switched off for users who prefer reduced motion
  const reduceMotion = useReducedMotion();

  return (
    <section className="hero-section">
      {/* Floating decorative elements */}
      <div className="hero-floating-elements" aria-hidden="true">
        <motion.div
          className="hero-float hero-float-1"
          animate={reduceMotion ? undefined : { y: [-10, 10, -10], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon name="globe" size={44} />
        </motion.div>
        <motion.div
          className="hero-float hero-float-2"
          animate={reduceMotion ? undefined : { y: [10, -10, 10], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon name="wallet" size={44} />
        </motion.div>
        <motion.div
          className="hero-float hero-float-3"
          animate={reduceMotion ? undefined : { y: [-15, 15, -15] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon name="plane" size={44} />
        </motion.div>
        <motion.div
          className="hero-float hero-float-4"
          animate={reduceMotion ? undefined : { y: [8, -12, 8], x: [-5, 5, -5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon name="map" size={44} />
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
          {t('landingHeroBadge')}
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {t('landingHeroTitle')}{' '}
          <span className="hero-title-accent">{t('landingHeroTitleAccent')}</span>
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {t('landingHeroSubtitle')}
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link to="/register" className="btn btn-primary btn-lg hero-btn-primary">
            {t('landingHeroStartFree')}
            <Icon name="arrow-right" className="hero-btn-arrow" />
          </Link>
          <a href="#app-preview" className="btn btn-secondary btn-lg hero-btn-secondary">
            <span className="hero-btn-play"><Icon name="play" size={10} /></span>
            {t('landingHeroViewDemo')}
          </a>
        </motion.div>

        <motion.div
          className="hero-social-proof"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="hero-avatars">
            <div className="hero-avatar" style={{ background: '#1d4ed8' }}>
              M
            </div>
            <div className="hero-avatar" style={{ background: '#7e22ce' }}>
              A
            </div>
            <div className="hero-avatar" style={{ background: '#0f766e' }}>
              K
            </div>
            <div className="hero-avatar" style={{ background: '#c2410c' }}>
              T
            </div>
          </div>
          <span className="hero-users-text">
            {t('landingHeroTrusted')} <strong>2,000+</strong> {t('landingHeroTravelers')}
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
              <div className="hero-app-title">{t('landingAppTripName')}</div>
              <div className="hero-app-amount">$1,240.00</div>
              <div className="hero-app-label">{t('landingAppTotalExpenses')}</div>
            </div>
            <div className="hero-app-list">
              <div className="hero-app-item">
                <span className="hero-app-item-icon"><Icon name="utensils" size={20} /></span>
                <div className="hero-app-item-info">
                  <div className="hero-app-item-name">{t('landingAppSeafoodDinner')}</div>
                  <div className="hero-app-item-by">{t('landingAppPaidByPattern')} Mai</div>
                </div>
                <div className="hero-app-item-amount">$85.00</div>
              </div>
              <div className="hero-app-item">
                <span className="hero-app-item-icon"><Icon name="bed" size={20} /></span>
                <div className="hero-app-item-info">
                  <div className="hero-app-item-name">{t('landingAppHotel')}</div>
                  <div className="hero-app-item-by">{t('landingAppPaidByPattern')} An</div>
                </div>
                <div className="hero-app-item-amount">$450.00</div>
              </div>
              <div className="hero-app-item">
                <span className="hero-app-item-icon"><Icon name="car" size={20} /></span>
                <div className="hero-app-item-info">
                  <div className="hero-app-item-name">{t('landingAppAirportTransfer')}</div>
                  <div className="hero-app-item-by">{t('landingAppPaidByPattern')} Khanh</div>
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
