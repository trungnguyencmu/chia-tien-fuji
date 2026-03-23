import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '../../i18n';

const features = [
  {
    icon: '💸',
    titleKey: 'landingFeature1Title',
    descriptionKey: 'landingFeature1Desc',
    color: '#74b9ff',
  },
  {
    icon: '🤝',
    titleKey: 'landingFeature2Title',
    descriptionKey: 'landingFeature2Desc',
    color: '#c7b4f3',
  },
  {
    icon: '📱',
    titleKey: 'landingFeature3Title',
    descriptionKey: 'landingFeature3Desc',
    color: '#b4d4ff',
  },
  {
    icon: '📊',
    titleKey: 'landingFeature4Title',
    descriptionKey: 'landingFeature4Desc',
    color: '#a8e6cf',
  },
];

export function FeaturesSection() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="features" className="landing-section features-section" ref={ref}>
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <span className="section-badge">{t('landingFeatures')}</span>
        <h2 className="section-title">{t('landingFeaturesTitle')}</h2>
        <p className="section-subtitle">
          {t('landingFeaturesSubtitle')}
        </p>
      </motion.div>

      <div className="features-grid">
        {features.map((feature, i) => (
          <motion.div
            key={feature.titleKey}
            className="feature-card"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
          >
            <div
              className="feature-icon"
              style={{ background: `${feature.color}20` }}
            >
              {feature.icon}
            </div>
            <h3 className="feature-title">{t(feature.titleKey as any)}</h3>
            <p className="feature-description">{t(feature.descriptionKey as any)}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
