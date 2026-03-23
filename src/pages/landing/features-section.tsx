import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    icon: '💸',
    title: 'Easy Expense Tracking',
    description:
      'Add expenses in seconds. Just tap, type the amount, and select who paid. Done.',
    color: '#74b9ff',
  },
  {
    icon: '🤝',
    title: 'Fair Split, No Headache',
    description:
      'Automatic calculations ensure everyone pays their fair share. No arguments, no drama.',
    color: '#c7b4f3',
  },
  {
    icon: '📱',
    title: 'Real-time Sync',
    description:
      'Everyone sees expenses as they happen. No more "did you add that?" messages.',
    color: '#b4d4ff',
  },
  {
    icon: '📊',
    title: 'Clear Summary',
    description:
      'See exactly who owes whom at a glance. Settle up with one simple view.',
    color: '#a8e6cf',
  },
];

export function FeaturesSection() {
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
        <span className="section-badge">Features</span>
        <h2 className="section-title">Everything you need to split fairly</h2>
        <p className="section-subtitle">
          Built for real group trips. No accounting degree required.
        </p>
      </motion.div>

      <div className="features-grid">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
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
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
