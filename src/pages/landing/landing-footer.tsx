import { useLanguage } from '../../i18n';

export function LandingFooter() {
  const { t } = useLanguage();

  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="landing-footer-brand">
          <span className="landing-logo-icon">💸</span>
          <span className="landing-logo-text">Share Money</span>
          <p className="landing-footer-tagline">
            {t('landingFooterTagline')}
          </p>
        </div>

        <div className="landing-footer-links">
          <div className="landing-footer-col">
            <h4>{t('landingFooterProduct')}</h4>
            <a href="#features">{t('landingFooterFeatures')}</a>
            <a href="#how-it-works">{t('landingFooterHowItWorks')}</a>
            <a href="#app-preview">{t('landingFooterDemo')}</a>
          </div>
          <div className="landing-footer-col">
            <h4>{t('landingFooterCompany')}</h4>
            <a href="#about">{t('landingFooterAbout')}</a>
            <a href="#contact">{t('landingFooterContact')}</a>
            <a href="#privacy">{t('landingFooterPrivacy')}</a>
          </div>
        </div>
      </div>

      <div className="landing-footer-bottom">
        <p>&copy; {new Date().getFullYear()} Share Money. All rights reserved.</p>
      </div>
    </footer>
  );
}
