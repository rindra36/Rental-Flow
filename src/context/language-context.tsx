"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import en from '@/lib/locales/en.json';
import fr from '@/lib/locales/fr.json';

type Locale = 'en' | 'fr';

const translations = { en, fr };

// A simple template replacement function
const simpleTemplate = (str: string, data: Record<string, any> = {}) => {
  if (!str) return '';
  return str.replace(/\{(\w+)\}/g, (match, key) => {
    // Basic pluralization for {count}
    if (key === 'count' && 'count' in data) {
      const count = data.count;
      const pluralMatch = str.match(/\{count, plural, .*?one {(.*?)}(.*?)other {(.*?)}}/);
      if (pluralMatch) {
         if (count === 1) {
            return pluralMatch[1];
         }
         return pluralMatch[3].replace('#', String(count));
      }
    }
    return data.hasOwnProperty(key) ? String(data[key]) : match;
  });
};

type TranslateFunction = (key: keyof typeof en, values?: Record<string, string | number>) => string;

interface LanguageContextType {
  language: Locale;
  setLanguage: (language: Locale) => void;
  t: TranslateFunction & { locale: Locale };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Locale>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('language') as Locale;
    if (storedLang && ['en', 'fr'].includes(storedLang)) {
      setLanguage(storedLang);
    } else {
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'fr') {
            setLanguage('fr');
        }
    }
  }, []);

  const handleSetLanguage = (lang: Locale) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = useCallback((key: keyof typeof en, values?: Record<string, string | number>) => {
      const langDict = translations[language] as Record<string, string>;
      const fallbackDict = translations.en as Record<string, string>;
      let text = langDict[key] || fallbackDict[key] || key;
      
      // Handle simple ICU-like pluralization if values are provided
      if (values) {
        text = simpleTemplate(text, values);
      }

      return text;
  }, [language]);
  
  // Attach locale to t function
  (t as LanguageContextType['t']).locale = language;

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: t as LanguageContextType['t'] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
