export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="landing-footer-brand">
          <span className="landing-logo-icon">💸</span>
          <span className="landing-logo-text">Share Money</span>
          <p className="landing-footer-tagline">
            Split expenses, not friendships.
          </p>
        </div>

        <div className="landing-footer-links">
          <div className="landing-footer-col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#app-preview">Demo</a>
          </div>
          <div className="landing-footer-col">
            <h4>Company</h4>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <a href="#privacy">Privacy</a>
          </div>
        </div>
      </div>

      <div className="landing-footer-bottom">
        <p>&copy; {new Date().getFullYear()} Share Money. All rights reserved.</p>
      </div>
    </footer>
  );
}
