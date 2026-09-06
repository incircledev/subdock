import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import zhCN from '@/lib/i18n/zh-CN.json';
import zhTW from '@/lib/i18n/zh-TW.json';
import en from '@/lib/i18n/en.json';
import ja from '@/lib/i18n/ja.json';
import ko from '@/lib/i18n/ko.json';
import { isLocale, resolveLocale, type Locale } from '@/lib/i18n/locale';
const dictionaries: Record<Locale, Record<string, string>> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  en,
  ja,
  ko,
};
const key = 'subdock.locale.v1';
type Params = Record<string, string | number>;
type I18n = {
  locale: Locale;
  preference: Locale;
  setLanguage: (value: Locale) => void;
  t: (key: string, params?: Params) => string;
  storageError: boolean;
};
const Context = createContext<I18n | null>(null);
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('zh-CN');
  const [preference, setPreference] = useState<Locale>('zh-CN');
  const [storageError, setStorageError] = useState(false);
  const browserLanguages = () =>
    navigator.languages?.length ? navigator.languages : [navigator.language];
  // Server and first hydration render share a Simplified Chinese fallback.
  /* eslint-disable react/react-compiler */
  useEffect(() => {
    const sync = () => {
      let saved: unknown;
      try {
        saved = localStorage.getItem(key);
      } catch {
        /* Browser detection still works without storage. */
      }
      const resolved = resolveLocale(saved, browserLanguages());
      setPreference(resolved);
      setLocale(resolved);
    };
    sync();
    const storage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) sync();
    };
    window.addEventListener('storage', storage);
    window.addEventListener('languagechange', sync);
    return () => {
      window.removeEventListener('storage', storage);
      window.removeEventListener('languagechange', sync);
    };
  }, []);
  /* eslint-enable react/react-compiler */
  const t = useMemo(
    () =>
      (message: string, params: Params = {}) => {
        let translated = dictionaries[locale][message] ?? message;
        if (locale === 'en' && params.count === 1)
          translated = translated
            .replace(/\bservices\b/g, 'service')
            .replace(/\bdays\b/g, 'day')
            .replace(/\brenewals\b/g, 'renewal')
            .replace(/\bsubscriptions\b/g, 'subscription')
            .replace(/\bcategories\b/g, 'category');
        return translated.replace(/\{(\w+)\}/g, (placeholder, k: string) =>
          params[k] === undefined ? placeholder : String(params[k]),
        );
      },
    [locale],
  );
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t('Subdock · 订阅生活，井井有条');
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        t('把喜欢的服务留在身边，把每一笔开销看得清楚。'),
      );
  }, [locale, t]);
  const setLanguage = (value: Locale) => {
    if (!isLocale(value)) return;
    setPreference(value);
    setLocale(resolveLocale(value, browserLanguages()));
    try {
      localStorage.setItem(key, value);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  };
  return (
    <Context.Provider
      value={{ locale, preference, setLanguage, t, storageError }}
    >
      {children}
    </Context.Provider>
  );
}
export function useI18n() {
  const value = useContext(Context);
  if (!value) throw new Error('I18nProvider is required');
  return value;
}
