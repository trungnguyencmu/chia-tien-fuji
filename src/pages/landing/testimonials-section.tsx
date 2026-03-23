import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const testimonials = [
  {
    name: 'Sarah K.',
    role: 'Backpacker',
    avatar: 'S',
    color: '#74b9ff',
    stars: 5,
    text: 'This saved our trip from money drama! We had 6 people on a 2-week trip and settling up took literally 5 minutes.',
  },
  {
    name: 'James L.',
    role: 'Weekend Warrior',
    avatar: 'J',
    color: '#c7b4f3',
    stars: 5,
    text: "Finally, an app that's actually simple. No sign-up hassle, no complicated features. Just add expenses and go.",
  },
  {
    name: 'Mai P.',
    role: 'Group Organizer',
    avatar: 'M',
    color: '#b4d4ff',
    stars: 5,
    text: "I organize trips for 10+ friends every year. Share Money is the only app that doesn't make me want to pull my hair out.",
  },
];

export function TestimonialsSection() {
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
        <span className="section-badge">Testimonials</span>
        <h2 className="section-title">Loved by travelers worldwide</h2>
        <p className="section-subtitle">
          Don't just take our word for it. Here's what our users say.
        </p>
      </motion.div>

      <div className="testimonials-grid">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            className="testimonial-card"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
          >
            <div className="testimonial-stars">
              {'★'.repeat(t.stars)}
            </div>
            <p className="testimonial-text">"{t.text}"</p>
            <div className="testimonial-author">
              <div
                className="testimonial-avatar"
                style={{ background: t.color }}
              >
                {t.avatar}
              </div>
              <div>
                <div className="testimonial-name">{t.name}</div>
                <div className="testimonial-role">{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
