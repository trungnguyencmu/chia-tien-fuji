import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="landing-nav">
      <div className="landing-nav-inner">
        <Link to="/" className="landing-logo">
          <span className="landing-logo-icon">💸</span>
          <span className="landing-logo-text">Share Money</span>
        </Link>

        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#testimonials">Reviews</a>
        </div>

        <div className="landing-nav-actions">
          <Link to="/login" className="landing-nav-signin">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary landing-nav-cta">
            Get Started
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="landing-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="landing-mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <a href="#features" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
              How It Works
            </a>
            <a href="#testimonials" onClick={() => setMenuOpen(false)}>
              Reviews
            </a>
            <div className="landing-mobile-actions">
              <Link to="/login">Sign In</Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
