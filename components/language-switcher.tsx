import { Languages } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useI18n } from '@/components/i18n-provider';
import { isLocale } from '@/lib/i18n/locale';
export function LanguageSwitcher() {
  const { locale, preference, setLanguage, t, storageError } = useI18n();
  const options = [
    { value: 'zh-CN', label: '简体中文' },
    { value: 'zh-TW', label: '繁體中文' },
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
  ];
  const short = {
    'zh-CN': '简',
    'zh-TW': '繁',
    en: 'EN',
    ja: '日本語',
    ko: '한국어',
  };
  return (
    <div className="language-control">
      <Select
        value={preference}
        onValueChange={(v) => {
          if (isLocale(v)) setLanguage(v);
        }}
        items={options}
      >
        <SelectTrigger
          className="language-trigger"
          aria-label={`${t('语言')} · ${options.find((o) => o.value === preference)?.label}`}
        >
          <Languages size={17} />
          <span aria-hidden="true">{short[locale]}</span>
          <SelectValue className="sr-only" />
        </SelectTrigger>
        <SelectContent align="end" className="language-menu">
          {options.map((o) => (
            <SelectItem value={o.value} key={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {storageError && (
        <output className="language-error" aria-live="polite">
          {t('语言偏好无法保存，本次切换仍然有效。')}
        </output>
      )}
    </div>
  );
}
