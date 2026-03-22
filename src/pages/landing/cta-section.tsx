import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export function CtaSection() {
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
        <h2 className="cta-title">Ready to travel without money stress?</h2>
        <p className="cta-subtitle">
          Join thousands of travelers who split expenses the easy way. Free
          forever, no credit card required.
        </p>
        <Link to="/register" className="btn btn-primary cta-btn">
          Get Started Now
          <span className="hero-btn-arrow">→</span>
        </Link>
      </motion.div>
    </section>
  );
}
