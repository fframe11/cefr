export type Language = 'th' | 'en';

export interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isThai: boolean;
  isEnglish: boolean;
}
