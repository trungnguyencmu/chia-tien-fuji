import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Language, TranslationKey } from './types';
import { en } from './translations/en';
import { vi } from './translations/vi';

const translations = { en, vi };

const LANGUAGE_KEY = 'app_language';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getStoredLanguage(): Language {
  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (stored === 'en' || stored === 'vi') return stored;
  return 'en';
}

function storeLanguage(lang: Language) {
  localStorage.setItem(LANGUAGE_KEY, lang);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  useEffect(() => {
    storeLanguage(language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    const translation = translations[language][key] || translations['en'][key] || key;

    if (!params) return translation;

    return Object.entries(params).reduce(
      (str, [k, v]) => str.replace(`{${k}}`, String(v)),
      translation
    );
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
