export const locales = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko'] as const;
export type Locale = (typeof locales)[number];
export function isLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale);
}
export function matchLocale(tag: string): Locale | undefined {
  const parts = tag.replaceAll('_', '-').toLowerCase().split('-');
  if (parts[0] === 'zh') {
    if (parts.includes('hant')) return 'zh-TW';
    if (parts.includes('hans')) return 'zh-CN';
    return parts.some((p) => ['tw', 'hk', 'mo'].includes(p))
      ? 'zh-TW'
      : 'zh-CN';
  }
  if (['en', 'ja', 'ko'].includes(parts[0])) return parts[0] as Locale;
}
export function resolveLocale(
  saved: unknown,
  browserLanguages: readonly string[],
): Locale {
  if (isLocale(saved)) return saved;
  for (const language of browserLanguages) {
    const matched = matchLocale(language);
    if (matched) return matched;
  }
  return 'zh-CN';
}
