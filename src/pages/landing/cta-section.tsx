import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '../../i18n';
import { Icon } from '../../components/ui/Icon';

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
        <h2 className="cta-title">{t('landingCtaTitle')}</h2>
        <p className="cta-subtitle">
          {t('landingCtaSubtitle')}
        </p>
        <Link to="/register" className="btn btn-primary btn-lg cta-btn">
          {t('landingCtaBtn')}
          <Icon name="arrow-right" className="hero-btn-arrow" />
        </Link>
      </motion.div>
    </section>
  );
}
