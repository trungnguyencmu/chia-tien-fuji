import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../i18n';
import { Icon } from '../../components/ui/Icon';
import { LanguageToggle } from '../../components/ui/LanguageToggle';

export function LandingNavbar() {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="landing-nav" aria-label="Main">
      <div className="landing-nav-inner">
        <Link to="/" className="landing-logo">
          <span className="landing-logo-icon"><Icon name="wallet" size={20} /></span>
          <span className="landing-logo-text">Share Money</span>
        </Link>

        <div className="landing-nav-links">
          <a href="#features">{t('landingFeatures')}</a>
          <a href="#how-it-works">{t('landingHowItWorks')}</a>
          <a href="#testimonials">{t('landingReviews')}</a>
        </div>

        <div className="landing-nav-actions">
          <LanguageToggle />
          <Link to="/login" className="landing-nav-signin">
            {t('landingSignIn')}
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            {t('landingGetStarted')}
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="landing-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="landing-mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <a href="#features" onClick={() => setMenuOpen(false)}>
              {t('landingFeatures')}
            </a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
              {t('landingHowItWorks')}
            </a>
            <a href="#testimonials" onClick={() => setMenuOpen(false)}>
              {t('landingReviews')}
            </a>
            <div className="landing-mobile-actions">
              <LanguageToggle />
              <Link to="/login">{t('landingSignIn')}</Link>
              <Link to="/register" className="btn btn-primary">
                {t('landingGetStarted')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
