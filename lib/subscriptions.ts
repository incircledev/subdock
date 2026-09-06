export type Subscription = {
  id: string;
  name: string;
  plan: string;
  amount: number;
  cycle: 'monthly' | 'yearly';
  date: string;
  category: string;
  brand: string;
  active: boolean;
  notes: string;
};
export const categories = ['影音娱乐', '效率工具', 'AI 助手', '云端存储'];
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
    ['monthly', 'yearly'].includes(s.cycle) &&
    categories.includes(s.category) &&
    typeof s.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(s.date) &&
    !Number.isNaN(parseDate(s.date).getTime()) &&
    dateString(parseDate(s.date)) === s.date
  );
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
      cycle: cycle as Subscription['cycle'],
      date: dateString(next),
      category: String(category),
      brand: String(brand),
      active: true,
      notes: '',
    };
  });
}
