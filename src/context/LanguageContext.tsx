import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import en from '../i18n/en.json';
import fr from '../i18n/fr.json';
import nl from '../i18n/nl.json';

export type Language = 'en' | 'fr' | 'nl';

type TranslationKeys = typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
];

const translations: Record<Language, TranslationKeys> = {
  en,
  fr,
  nl,
};

const STORAGE_KEY = 'wingfoil_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get saved language or default to English
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'fr' || saved === 'nl') {
      return saved;
    }
    return 'en';
  });

  // Save language preference to localStorage and update HTML lang attribute
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  // Translation function with dot notation support (e.g., "common.save")
  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (typeof value === 'string') {
      return value;
    }

    console.warn(`Translation key is not a string: ${key}`);
    return key;
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Export a hook for easier translation access
export const useTranslation = () => {
  const { t, language } = useLanguage();
  return { t, language };
};
