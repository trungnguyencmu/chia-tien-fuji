import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '../../i18n';

export function CtaSection() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="landing-section cta-section" ref={ref}>
      <motion.div
        className="cta-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="cta-glow" />
        <h2 className="cta-title">{t('landingCtaTitle')}</h2>
        <p className="cta-subtitle">
          {t('landingCtaSubtitle')}
        </p>
        <Link to="/register" className="btn btn-primary cta-btn">
          {t('landingCtaBtn')}
          <span className="hero-btn-arrow">→</span>
        </Link>
      </motion.div>
    </section>
  );
}
