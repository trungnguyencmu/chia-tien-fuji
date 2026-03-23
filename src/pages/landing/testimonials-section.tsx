import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '../../i18n';

const testimonials = [
  {
    name: 'Sarah K.',
    role: 'Backpacker',
    avatar: 'S',
    color: '#74b9ff',
    stars: 5,
    textKey: 'landingTestimonial1Text',
  },
  {
    name: 'James L.',
    role: 'Weekend Warrior',
    avatar: 'J',
    color: '#c7b4f3',
    stars: 5,
    textKey: 'landingTestimonial2Text',
  },
  {
    name: 'Mai P.',
    role: 'Group Organizer',
    avatar: 'M',
    color: '#b4d4ff',
    stars: 5,
    textKey: 'landingTestimonial3Text',
  },
];

export function TestimonialsSection() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="testimonials"
      className="landing-section testimonials-section"
      ref={ref}
    >
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <span className="section-badge">{t('landingTestimonials')}</span>
        <h2 className="section-title">{t('landingTestimonialsTitle')}</h2>
        <p className="section-subtitle">
          {t('landingTestimonialsSubtitle')}
        </p>
      </motion.div>

      <div className="testimonials-grid">
        {testimonials.map((tm, i) => (
          <motion.div
            key={tm.name}
            className="testimonial-card"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
          >
            <div className="testimonial-stars">
              {'★'.repeat(tm.stars)}
            </div>
            <p className="testimonial-text">"{t(tm.textKey as any)}"</p>
            <div className="testimonial-author">
              <div
                className="testimonial-avatar"
                style={{ background: tm.color }}
              >
                {tm.avatar}
              </div>
              <div>
                <div className="testimonial-name">{tm.name}</div>
                <div className="testimonial-role">{tm.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
