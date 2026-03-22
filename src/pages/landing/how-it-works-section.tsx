import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  {
    number: '01',
    icon: '🗺️',
    title: 'Create a Trip',
    description:
      'Name your trip and invite your travel buddies. Set up in under 30 seconds.',
  },
  {
    number: '02',
    icon: '➕',
    title: 'Add Expenses',
    description:
      'Log every expense as it happens — food, hotel, transport, activities. Quick and easy.',
  },
  {
    number: '03',
    icon: '✅',
    title: 'See Who Owes What',
    description:
      'The app calculates the perfect split. Everyone knows exactly what they owe. No confusion.',
  },
];

export function HowItWorksSection() {
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
        <span className="section-badge">How It Works</span>
        <h2 className="section-title">Three steps to stress-free splitting</h2>
        <p className="section-subtitle">
          From trip creation to settlement — it's that simple.
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
            <h3 className="step-title">{step.title}</h3>
            <p className="step-description">{step.description}</p>
            {i < steps.length - 1 && <div className="step-connector" />}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
