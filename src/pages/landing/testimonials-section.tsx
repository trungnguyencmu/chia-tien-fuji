import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '../../i18n';
import { Icon } from '../../components/ui/Icon';

const testimonials = [
  {
    name: 'Sarah K.',
    role: 'Backpacker',
    avatar: 'S',
    color: '#1d4ed8',
    stars: 5,
    textKey: 'landingTestimonial1Text',
  },
  {
    name: 'James L.',
    role: 'Weekend Warrior',
    avatar: 'J',
    color: '#7e22ce',
    stars: 5,
    textKey: 'landingTestimonial2Text',
  },
  {
    name: 'Mai P.',
    role: 'Group Organizer',
    avatar: 'M',
    color: '#0f766e',
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
            <div className="testimonial-stars" role="img" aria-label={`${tm.stars} / 5`}>
              {Array.from({ length: tm.stars }, (_, s) => (
                <Icon key={s} name="star" size={16} />
              ))}
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
