'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Language, I18nContextValue } from './types';
import thTranslations from './locales/th.json';
import enTranslations from './locales/en.json';

const STORAGE_KEY = 'cefr_platform_language';

const dictionaries: Record<Language, Record<string, any>> = {
  th: thTranslations,
  en: enTranslations,
};

const resolveNestedKey = (obj: any, path: string): string | undefined => {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
};

const interpolate = (template: string, params?: Record<string, string | number>): string => {
  if (!params) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{{${key}}}`;
  });
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('th');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'th' || stored === 'en') {
        setLanguageState(stored);
      } else if (typeof navigator !== 'undefined' && navigator.language) {
        if (!navigator.language.toLowerCase().startsWith('th')) {
          setLanguageState('en');
        }
      }
    } catch {
      // Fallback if localStorage or navigator is unavailable
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const currentDict = dictionaries[language];
      let val = resolveNestedKey(currentDict, key);

      // Fallback to English, then Thai if missing in current locale
      if (val === undefined) {
        val = resolveNestedKey(dictionaries.en, key);
      }
      if (val === undefined) {
        val = resolveNestedKey(dictionaries.th, key);
      }

      if (val === undefined) {
        return key;
      }

      return interpolate(val, params);
    },
    [language]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t,
      isThai: language === 'th',
      isEnglish: language === 'en',
    }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useTranslation = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    // Graceful fallback for components or tests rendered without provider
    return {
      language: 'th',
      setLanguage: () => {},
      t: (key: string, params?: Record<string, string | number>) => {
        let val = resolveNestedKey(thTranslations, key) || resolveNestedKey(enTranslations, key) || key;
        return interpolate(val, params);
      },
      isThai: true,
      isEnglish: false,
    };
  }
  return context;
};

export const useI18n = useTranslation;
