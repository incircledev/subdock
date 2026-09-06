import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { locales, resolveLocale, matchLocale } from '../lib/i18n/locale.ts';
void test('language selection honors manual preference, browser order and Chinese fallback', () => {
  assert.equal(resolveLocale('ko', ['en-US']), 'ko');
  assert.equal(resolveLocale('auto', ['fr-FR', 'ja-JP', 'en-US']), 'ja');
  assert.equal(resolveLocale('invalid', ['ko-KR']), 'ko');
  assert.equal(resolveLocale(null, ['de-DE']), 'zh-CN');
  assert.equal(resolveLocale(null, []), 'zh-CN');
});
void test('Chinese scripts override region, while Traditional regions match correctly', () => {
  for (const tag of [
    'zh-TW',
    'zh-HK',
    'zh-MO',
    'zh-Hant',
    'zh-Hant-CN',
    'zh_HK',
  ])
    assert.equal(matchLocale(tag), 'zh-TW', tag);
  for (const tag of ['zh', 'zh-CN', 'zh-SG', 'zh-Hans', 'zh-Hans-HK'])
    assert.equal(matchLocale(tag), 'zh-CN', tag);
  for (const [tag, expected] of [
    ['en-GB', 'en'],
    ['en-US', 'en'],
    ['ja-JP', 'ja'],
    ['ko-KR', 'ko'],
  ])
    assert.equal(matchLocale(tag), expected);
  assert.equal(matchLocale('fr-FR'), undefined);
});
void test('all five dictionaries have complete key and interpolation parity', () => {
  const read = (locale: string) =>
    JSON.parse(
      readFileSync(
        new URL(`../lib/i18n/${locale}.json`, import.meta.url),
        'utf8',
      ),
    ) as Record<string, string>;
  const source = read('zh-CN');
  const keys = Object.keys(source).sort();
  const placeholders = (s: string) =>
    [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  for (const locale of locales) {
    const data = read(locale);
    assert.deepEqual(Object.keys(data).sort(), keys, locale);
    for (const key of keys) {
      assert.ok(data[key].trim(), `${locale}: ${key}`);
      assert.deepEqual(
        placeholders(data[key]),
        placeholders(source[key]),
        `${locale}: ${key}`,
      );
    }
  }
});
