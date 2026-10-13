import { useLanguage } from '../../i18n';
import { Icon } from './Icon';

/** EN/VI switch shared by the app nav and the landing nav. */
export function LanguageToggle({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  const label = language === 'en' ? 'Switch to Vietnamese' : 'Switch to English';

  return (
    <button
      type="button"
      className={`btn btn-ghost btn-sm ${className}`.trim()}
      onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
      aria-label={label}
      title={label}
    >
      <Icon name="globe" size={16} />
      {language.toUpperCase()}
    </button>
  );
}
