
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import en from '@/lib/locales/en.json';
import fr from '@/lib/locales/fr.json';

type Locale = 'en' | 'fr';

const translations = { en, fr };

// A simple template replacement function
const simpleTemplate = (str: string, data: Record<string, any> = {}) => {
  if (!str) return '';

  let result = '';
  let i = 0;

  while (i < str.length) {
    if (str[i] === '{') {
      const start = i;
      let depth = 1;
      i++;
      while (i < str.length && depth > 0) {
        if (str[i] === '{') depth++;
        else if (str[i] === '}') depth--;
        i++;
      }

      if (depth === 0) {
        const block = str.substring(start + 1, i - 1);
        const pluralMatch = block.match(/^(\w+),\s*plural,\s*([\s\S]*)$/);

        if (pluralMatch) {
            const key = pluralMatch[1];
            const optionsStr = pluralMatch[2];
            const value = data[key];
            
            if (typeof value === 'number') {
                const options: Record<string, string> = {};
                let p = 0;
                while (p < optionsStr.length) {
                     while (p < optionsStr.length && /\s/.test(optionsStr[p])) p++;
                     if (p >= optionsStr.length) break;
                     
                     const kStart = p;
                     while (p < optionsStr.length && optionsStr[p] !== '{' && !/\s/.test(optionsStr[p])) p++;
                     const k = optionsStr.substring(kStart, p).trim();
                     
                     while (p < optionsStr.length && /\s/.test(optionsStr[p])) p++;
                     
                     if (optionsStr[p] === '{') {
                         const bStart = p;
                         let d = 1;
                         p++;
                         while (p < optionsStr.length && d > 0) {
                             if (optionsStr[p] === '{') d++;
                             else if (optionsStr[p] === '}') d--;
                             p++;
                         }
                         if (d === 0) {
                             options[k] = optionsStr.substring(bStart + 1, p - 1);
                         }
                     }
                }
                
                let selectedTemplate = options['other'] || '';
                if (options[`=${value}`]) selectedTemplate = options[`=${value}`];
                else if (value === 1 && options['one']) selectedTemplate = options['one'];
                
                selectedTemplate = selectedTemplate.replace('#', String(value));
                result += simpleTemplate(selectedTemplate, data);
            } else {
                result += str.substring(start, i);
            }
        } else {
            const key = block.trim();
            if (data.hasOwnProperty(key)) {
                result += data[key];
            } else {
                result += str.substring(start, i);
            }
        }
      } else {
        result += str.substring(start, i);
      }
    } else {
      result += str[i];
      i++;
    }
  }
  return result;
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
