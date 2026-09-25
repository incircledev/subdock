import {
  DEFAULT_CURRENCY,
  isCurrencyCode,
  type CurrencyCode,
} from './currencies.ts';

export type Subscription = {
  id: string;
  name: string;
  plan: string;
  amount: number;
  currency: CurrencyCode;
  cycle: 'monthly' | 'yearly';
  date: string;
  category: string;
  brand: string;
  active: boolean;
  notes: string;
};
export const categories = ['影音娱乐', '效率工具', 'AI 助手', '云端存储'];
const serviceBrands: Record<string, string> = {
  spotify: 'spotify',
  notion: 'notion',
  chatgpt: 'openai',
  'chatgpt plus': 'openai',
  'chatgpt pro': 'openai',
  'chatgpt go': 'openai',
  'chatgpt team': 'openai',
  'chatgpt business': 'openai',
  openai: 'openai',
  claude: 'claude',
  'claude pro': 'claude',
  'claude max': 'claude',
  'claude team': 'claude',
  'claude.ai': 'claude',
  'claude code': 'claude',
  gemini: 'gemini',
  'gemini advanced': 'gemini',
  'gemini pro': 'gemini',
  'google gemini': 'gemini',
  '谷歌 gemini': 'gemini',
  'google ai': 'gemini',
  'google ai plus': 'gemini',
  'google ai pro': 'gemini',
  'google ai ultra': 'gemini',
  grok: 'grok',
  supergrok: 'grok',
  'super grok': 'grok',
  'supergrok heavy': 'grok',
  xai: 'grok',
  'x.ai': 'grok',
  copilot: 'copilot',
  'copilot pro': 'copilot',
  'microsoft copilot': 'copilot',
  'microsoft 365 copilot': 'copilot',
  'm365 copilot': 'copilot',
  'github copilot': 'github-copilot',
  'github copilot pro': 'github-copilot',
  'github copilot business': 'github-copilot',
  'github copilot enterprise': 'github-copilot',
  perplexity: 'perplexity',
  'perplexity pro': 'perplexity',
  'perplexity max': 'perplexity',
  cursor: 'cursor',
  'cursor pro': 'cursor',
  'cursor business': 'cursor',
  midjourney: 'midjourney',
  'midjourney basic': 'midjourney',
  'midjourney standard': 'midjourney',
  'midjourney pro': 'midjourney',
  'midjourney mega': 'midjourney',
  deepseek: 'deepseek',
  'deepseek pro': 'deepseek',
  深度求索: 'deepseek',
  kimi: 'kimi',
  'kimi+': 'kimi',
  'kimi plus': 'kimi',
  'kimi pro': 'kimi',
  kimi会员: 'kimi',
  月之暗面: 'kimi',
  'moonshot ai': 'kimi',
  qwen: 'qwen',
  'qwen chat': 'qwen',
  通义: 'qwen',
  通义千问: 'qwen',
  通义千问会员: 'qwen',
  tongyi: 'qwen',
  豆包: 'doubao',
  豆包会员: 'doubao',
  doubao: 'doubao',
  文心一言: 'wenxin',
  文心一言会员: 'wenxin',
  文心: 'wenxin',
  ernie: 'wenxin',
  'ernie bot': 'wenxin',
  腾讯元宝: 'yuanbao',
  元宝: 'yuanbao',
  yuanbao: 'yuanbao',
  智谱: 'zhipu',
  智谱清言: 'zhipu',
  智谱ai: 'zhipu',
  chatglm: 'zhipu',
  zhipu: 'zhipu',
  'z.ai': 'zhipu',
  minimax: 'minimax',
  海螺: 'hailuo',
  海螺ai: 'hailuo',
  海螺会员: 'hailuo',
  hailuo: 'hailuo',
  'hailuo ai': 'hailuo',
  suno: 'suno',
  'suno pro': 'suno',
  'suno premier': 'suno',
  可灵: 'kling',
  可灵ai: 'kling',
  可灵会员: 'kling',
  kling: 'kling',
  'kling ai': 'kling',
  即梦: 'jimeng',
  即梦ai: 'jimeng',
  即梦会员: 'jimeng',
  jimeng: 'jimeng',
  dreamina: 'jimeng',
  讯飞星火: 'xinghuo',
  星火: 'xinghuo',
  讯飞星火会员: 'xinghuo',
  sparkdesk: 'xinghuo',
  'iflytek spark': 'xinghuo',
  mistral: 'mistral',
  'mistral ai': 'mistral',
  'le chat': 'mistral',
  'le chat pro': 'mistral',
  manus: 'manus',
  'manus pro': 'manus',
  icloud: 'apple',
  'icloud+': 'apple',
  'apple icloud+': 'apple',
  netflix: 'netflix',
  vercel: 'vercel',
  哔哩哔哩: 'bilibili',
  哔哩哔哩大会员: 'bilibili',
  b站: 'bilibili',
  b站大会员: 'bilibili',
  bilibili: 'bilibili',
  网易云音乐: 'netease',
  网易云音乐黑胶vip: 'netease',
  网易云音乐黑胶会员: 'netease',
  'netease cloud music': 'netease',
  腾讯视频: 'tencent-video',
  腾讯视频vip: 'tencent-video',
  腾讯视频会员: 'tencent-video',
  'tencent video': 'tencent-video',
  爱奇艺: 'iqiyi',
  爱奇艺vip: 'iqiyi',
  爱奇艺会员: 'iqiyi',
  iqiyi: 'iqiyi',
  优酷: 'youku',
  优酷视频: 'youku',
  优酷vip: 'youku',
  youku: 'youku',
  qq音乐: 'qq-music',
  qq音乐绿钻: 'qq-music',
  qq音乐会员: 'qq-music',
  'qq music': 'qq-music',
  百度网盘: 'baidu-netdisk',
  百度网盘超级会员: 'baidu-netdisk',
  'baidu netdisk': 'baidu-netdisk',
  阿里云盘: 'aliyun-drive',
  阿里云盘会员: 'aliyun-drive',
  'aliyun drive': 'aliyun-drive',
  wps: 'wps-office',
  'wps office': 'wps-office',
  wps会员: 'wps-office',
  wps超级会员: 'wps-office',
  微信读书: 'weread',
  微信读书无限卡: 'weread',
  weread: 'weread',
};

export function brandForService(name: string) {
  return (
    serviceBrands[name.trim().replace(/\s+/g, ' ').toLowerCase()] || 'custom'
  );
}

export function dateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function parseDate(s: string) {
  return new Date(s + 'T00:00:00');
}
export function monthlyAmount(s: Subscription) {
  return s.amount / (s.cycle === 'yearly' ? 12 : 1);
}
export function nextRenewal(s: Subscription, today: Date): Date {
  const anchor = parseDate(s.date);
  const cutoff = parseDate(dateString(today));
  if (anchor >= cutoff) return anchor;
  const yearStep = s.cycle === 'yearly';
  let offset = yearStep
    ? Math.max(0, cutoff.getFullYear() - anchor.getFullYear())
    : Math.max(
        0,
        (cutoff.getFullYear() - anchor.getFullYear()) * 12 +
          cutoff.getMonth() -
          anchor.getMonth(),
      );
  const occurrence = (n: number) => {
    const target = new Date(
      anchor.getFullYear() + (yearStep ? n : 0),
      anchor.getMonth() + (yearStep ? 0 : n),
      1,
    );
    const last = new Date(
      target.getFullYear(),
      target.getMonth() + 1,
      0,
    ).getDate();
    return new Date(
      target.getFullYear(),
      target.getMonth(),
      Math.min(anchor.getDate(), last),
    );
  };
  let next = occurrence(offset);
  if (next < cutoff) next = occurrence(++offset);
  return next;
}
export function daysUntil(date: Date, today: Date) {
  const utcDay = (d: Date) =>
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((utcDay(date) - utcDay(today)) / 86400000);
}
export function isSubscription(value: unknown): value is Subscription {
  if (!value || typeof value !== 'object') return false;
  const s = value as Subscription;
  return (
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    s.name.trim().length > 0 &&
    s.name.length <= 60 &&
    typeof s.plan === 'string' &&
    typeof s.notes === 'string' &&
    typeof s.brand === 'string' &&
    typeof s.active === 'boolean' &&
    Number.isFinite(s.amount) &&
    s.amount > 0 &&
    s.amount <= 10000000 &&
    isCurrencyCode(s.currency) &&
    ['monthly', 'yearly'].includes(s.cycle) &&
    categories.includes(s.category) &&
    typeof s.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(s.date) &&
    !Number.isNaN(parseDate(s.date).getTime()) &&
    dateString(parseDate(s.date)) === s.date
  );
}

export function normalizeSubscription(value: unknown): Subscription | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = {
    ...(value as Record<string, unknown>),
    currency: (value as { currency?: unknown }).currency || DEFAULT_CURRENCY,
  };
  return isSubscription(candidate) ? candidate : null;
}
export function sampleSubscriptions(today: Date): Subscription[] {
  const rows = [
    ['Spotify', 'Premium 个人', 68, 'monthly', 2, '影音娱乐', 'spotify'],
    ['Notion', 'Plus', 70, 'monthly', 5, '效率工具', 'notion'],
    ['ChatGPT', 'Plus', 145, 'monthly', 8, 'AI 助手', 'openai'],
    ['Apple iCloud+', '200 GB', 21, 'monthly', 12, '云端存储', 'apple'],
    ['Netflix', '标准套餐', 78, 'monthly', 15, '影音娱乐', 'netflix'],
    ['Vercel', 'Pro', 1440, 'yearly', 20, '效率工具', 'vercel'],
  ];
  return rows.map(([name, plan, amount, cycle, days, category, brand], i) => {
    const next = new Date(today);
    next.setDate(next.getDate() + Number(days));
    return {
      id: `sample-${i}`,
      name: String(name),
      plan: String(plan),
      amount: Number(amount),
      currency: DEFAULT_CURRENCY,
      cycle: cycle as Subscription['cycle'],
      date: dateString(next),
      category: String(category),
      brand: String(brand),
      active: true,
      notes: '',
    };
  });
}
