import { useEffect, useState } from 'react';
import { useI18n } from '@/components/i18n-provider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const themes = [
  { id: 'forest', name: '苔原', pair: '暖白 × 墨绿', mood: '自然 · 安静' },
  { id: 'graphite', name: '石墨', pair: '纸白 × 炭黑', mood: '克制 · 纯粹' },
];
const storageKey = 'subdock.theme.v1';

export function applyStoredTheme() {
  try {
    const saved = localStorage.getItem(storageKey);
    const next = themes.some((item) => item.id === saved) ? saved! : 'forest';
    document.documentElement.dataset.theme = next;
    return next;
  } catch {
    document.documentElement.dataset.theme = 'forest';
    return 'forest';
  }
}

export function ThemeSwitcher() {
  const { t } = useI18n();
  const [theme, setTheme] = useState('forest');
  const [message, setMessage] = useState<'saved' | 'error' | ''>('');
  // Keep the picker in sync when the settings dialog is opened or storage changes.
  /* eslint-disable react/react-compiler */
  useEffect(() => {
    const sync = () => setTheme(applyStoredTheme());
    sync();
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) sync();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  /* eslint-enable react/react-compiler */
  const choose = (value: unknown) => {
    if (typeof value !== 'string' || !themes.some((item) => item.id === value))
      return;
    setTheme(value);
    document.documentElement.dataset.theme = value;
    try {
      localStorage.setItem(storageKey, value);
      setMessage('saved');
    } catch {
      setMessage('error');
    }
  };
  return (
    <section className="settings-theme" aria-labelledby="appearance-title">
      <h3 id="appearance-title" className="settings-group-title">
        {t('外观')}
      </h3>
      <p className="theme-field-label" id="theme-field-label">
        {t('主题')}
      </p>
      <RadioGroup
        value={theme}
        onValueChange={choose}
        aria-labelledby="theme-field-label"
        className="theme-options"
      >
        {themes.map((item) => (
          <label
            key={item.id}
            className={`theme-option ${theme === item.id ? 'is-selected' : ''}`}
          >
            <div
              className="theme-sample"
              data-theme={item.id}
              aria-hidden="true"
            >
              <div className="sample-nav">
                <i />
                <span />
                <b />
              </div>
              <div className="sample-main">
                <div className="sample-hero">
                  <i />
                  <b />
                  <span />
                </div>
                <div className="sample-side">
                  <i />
                  <b />
                  <span />
                </div>
              </div>
              <div className="sample-cards">
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="theme-option-title">
              <strong>{t(item.name)}</strong>
              <RadioGroupItem
                value={item.id}
                aria-label={`${t(item.name)}：${t(item.pair)}，${t(item.mood)}`}
              />
            </div>
            <span className="theme-pair">{t(item.pair)}</span>
            <span className="theme-mood">{t(item.mood)}</span>
          </label>
        ))}
      </RadioGroup>
      <p className="theme-footnote">
        {t('仅改变界面配色，服务品牌色保持原样。')}
      </p>
      <output className="theme-status" aria-live="polite">
        {message === 'saved'
          ? t('已切换为{name}，选择已保存', {
              name: t(themes.find((item) => item.id === theme)!.name),
            })
          : message === 'error'
            ? t('主题已切换，但未能保存偏好')
            : ''}
      </output>
    </section>
  );
}
