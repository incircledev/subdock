import test from 'node:test';
import assert from 'node:assert/strict';
import {
  brandForService,
  dateString,
  monthlyAmount,
  nextRenewal,
  isSubscription,
  normalizeSubscription,
  sampleSubscriptions,
  daysUntil,
} from '../lib/subscriptions.ts';
const base = sampleSubscriptions(new Date(2026, 8, 5))[0];
void test('known service names select their icons without affecting custom names', () => {
  for (const [name, brand] of [
    ['Spotify', 'spotify'],
    ['Notion', 'notion'],
    ['ChatGPT', 'openai'],
    ['ChatGPT Pro', 'openai'],
    ['Claude Max', 'claude'],
    ['Claude.ai', 'claude'],
    ['Google AI Pro', 'gemini'],
    ['Gemini', 'gemini'],
    ['SuperGrok', 'grok'],
    ['x.ai', 'grok'],
    ['Microsoft 365 Copilot', 'copilot'],
    ['GitHub Copilot', 'github-copilot'],
    ['Perplexity Pro', 'perplexity'],
    ['Cursor Pro', 'cursor'],
    ['Midjourney', 'midjourney'],
    ['DeepSeek', 'deepseek'],
    ['深度求索', 'deepseek'],
    ['Kimi+', 'kimi'],
    ['月之暗面', 'kimi'],
    ['通义千问', 'qwen'],
    ['豆包', 'doubao'],
    ['文心一言', 'wenxin'],
    ['腾讯元宝', 'yuanbao'],
    ['智谱清言', 'zhipu'],
    ['ChatGLM', 'zhipu'],
    ['MiniMax', 'minimax'],
    ['海螺AI', 'hailuo'],
    ['Suno', 'suno'],
    ['可灵', 'kling'],
    ['即梦', 'jimeng'],
    ['Dreamina', 'jimeng'],
    ['讯飞星火', 'xinghuo'],
    ['Le Chat', 'mistral'],
    ['Manus', 'manus'],
    ['Apple iCloud+', 'apple'],
    ['Netflix', 'netflix'],
    ['Vercel', 'vercel'],
    ['哔哩哔哩大会员', 'bilibili'],
    ['B站', 'bilibili'],
    ['网易云音乐黑胶VIP', 'netease'],
    ['NetEase Cloud Music', 'netease'],
    ['腾讯视频VIP', 'tencent-video'],
    ['Tencent Video', 'tencent-video'],
    ['爱奇艺', 'iqiyi'],
    ['iQIYI', 'iqiyi'],
    ['优酷视频', 'youku'],
    ['QQ音乐绿钻', 'qq-music'],
    ['QQ Music', 'qq-music'],
    ['百度网盘超级会员', 'baidu-netdisk'],
    ['阿里云盘', 'aliyun-drive'],
    ['WPS超级会员', 'wps-office'],
    ['WPS Office', 'wps-office'],
    ['微信读书无限卡', 'weread'],
    ['WeRead', 'weread'],
  ])
    assert.equal(brandForService(name), brand);
  assert.equal(brandForService('  CHATGPT   Plus  '), 'openai');
  assert.equal(brandForService('iCloud+'), 'apple');
  assert.equal(brandForService('My own service'), 'custom');
  assert.equal(brandForService('视频会员'), 'custom');
  assert.equal(brandForService('Copilot'), 'copilot');
  assert.equal(brandForService('文心一格'), 'custom');
  assert.equal(brandForService('通义万相'), 'custom');
  assert.equal(brandForService('X Premium'), 'custom');
});

void test('yearly amounts are normalized and the seeded monthly total is accurate', () => {
  const items = sampleSubscriptions(new Date(2026, 8, 5));
  assert.equal(monthlyAmount(items[5]), 120);
  assert.equal(
    items.reduce((n, s) => n + monthlyAmount(s), 0),
    502,
  );
});
void test('monthly renewals clamp to month end and preserve the original billing day', () => {
  const s = { ...base, date: '2026-01-31' };
  assert.equal(dateString(nextRenewal(s, new Date(2026, 1, 1))), '2026-02-28');
  assert.equal(dateString(nextRenewal(s, new Date(2026, 2, 1))), '2026-03-31');
});
void test('annual leap-day renewal clamps correctly and returns to leap day', () => {
  const s = { ...base, date: '2024-02-29', cycle: 'yearly' as const };
  assert.equal(dateString(nextRenewal(s, new Date(2025, 0, 1))), '2025-02-28');
  assert.equal(dateString(nextRenewal(s, new Date(2028, 0, 1))), '2028-02-29');
});
void test('renewal remains due today and calendar day counting crosses year boundaries', () => {
  assert.equal(
    dateString(
      nextRenewal(
        { ...base, date: '2026-09-05' },
        new Date(2026, 8, 5, 23, 59),
      ),
    ),
    '2026-09-05',
  );
  assert.equal(daysUntil(new Date(2027, 0, 2), new Date(2026, 11, 31)), 2);
});
void test('future annual payments remain in their scheduled year', () => {
  assert.equal(
    dateString(
      nextRenewal(
        { ...base, date: '2027-03-21', cycle: 'yearly' },
        new Date(2026, 8, 5),
      ),
    ),
    '2027-03-21',
  );
});
void test('invalid stored entries, impossible dates and invalid prices are rejected', () => {
  assert.equal(isSubscription(base), true);
  for (const patch of [
    { date: '2026-02-31' },
    { amount: -1 },
    { amount: NaN },
    { name: '  ' },
    { category: 'unknown' },
    { active: 'yes' },
    { cycle: 'weekly' },
    { currency: 'BTC' },
  ])
    assert.equal(isSubscription({ ...base, ...patch }), false);
});

void test('legacy subscriptions migrate to CNY without changing their amount', () => {
  const { currency: _currency, ...legacy } = base;
  const migrated = normalizeSubscription(legacy);
  assert.equal(migrated?.currency, 'CNY');
  assert.equal(migrated?.amount, base.amount);
});
