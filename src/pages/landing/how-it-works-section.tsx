import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '../../i18n';

const steps = [
  {
    number: '01',
    icon: '🗺️',
    titleKey: 'landingStep1Title',
    descriptionKey: 'landingStep1Desc',
  },
  {
    number: '02',
    icon: '➕',
    titleKey: 'landingStep2Title',
    descriptionKey: 'landingStep2Desc',
  },
  {
    number: '03',
    icon: '✅',
    titleKey: 'landingStep3Title',
    descriptionKey: 'landingStep3Desc',
  },
];

export function HowItWorksSection() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="how-it-works"
      className="landing-section how-it-works-section"
      ref={ref}
    >
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <span className="section-badge">{t('landingHowItWorks')}</span>
        <h2 className="section-title">{t('landingHowItWorksTitle')}</h2>
        <p className="section-subtitle">
          {t('landingHowItWorksSubtitle')}
        </p>
      </motion.div>

      <div className="steps-container">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            className="step-card"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 * (i + 1) }}
          >
            <div className="step-number">{step.number}</div>
            <div className="step-icon">{step.icon}</div>
            <h3 className="step-title">{t(step.titleKey as any)}</h3>
            <p className="step-description">{t(step.descriptionKey as any)}</p>
            {i < steps.length - 1 && <div className="step-connector" />}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
