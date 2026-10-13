import {
  dateString,
  parseDate,
  priceOn,
  type Subscription,
} from './subscriptions.ts';

const perYear = { monthly: 12, quarterly: 4, yearly: 1 };
/** Converts an amount in the subscription's currency to the display currency. */
export type Convert = (s: Subscription, amount: number) => number;

export type FootprintNode = {
  id: string;
  kind: 'origin' | 'add' | 'cancel' | 'price';
  date: string;
  sub?: Subscription;
  before: number;
  after: number;
  delta: number;
  /** Origin only: subscriptions included in the baseline with their daily cost. */
  members?: { sub: Subscription; daily: number }[];
};

const addDays = (key: string, days: number) => {
  const d = parseDate(key);
  d.setDate(d.getDate() + days);
  return dateString(d);
};

/**
 * Daily cost of one subscription on a day: annualized price / 365, zero before
 * it starts (startDate, or the origin day for older records) and from its end.
 */
export function dailyCost(
  s: Subscription,
  key: string,
  origin: string,
  convert: Convert,
) {
  if (key < (s.startDate || origin)) return 0;
  if (s.endDate && key >= s.endDate) return 0;
  return convert(s, (priceOn(s, parseDate(key)) * perYear[s.cycle]) / 365);
}

/**
 * The origin day groups records without a start date. It is the first app use
 * day, moved back to the start of the month of the earliest recorded change
 * (start, end or price change) when history predates first use.
 */
export function originDate(subs: Subscription[], firstUse: string) {
  let origin = firstUse;
  for (const s of subs) {
    const dates = [
      s.startDate,
      s.endDate,
      ...(s.priceChanges || []).map((c) => c.date),
    ].filter((d): d is string => !!d);
    for (const d of dates) {
      // Start of that event's month, or the day before when it is the 1st.
      const monthStart = `${d.slice(0, 7)}-01`;
      const before = monthStart < d ? monthStart : addDays(d, -1);
      if (before < origin) origin = before;
    }
  }
  return origin;
}

export function buildFootprint(
  subs: Subscription[],
  today: Date,
  firstUse: string,
  convert: Convert,
) {
  const todayKey = dateString(today);
  const tracked = subs.filter((s) => s.active);
  const origin = originDate(tracked, firstUse < todayKey ? firstUse : todayKey);
  const cost = (s: Subscription, key: string) =>
    dailyCost(s, key, origin, convert);
  const nodes: FootprintNode[] = [];
  const originSubs = tracked.filter((s) => !s.startDate);
  const events: Omit<FootprintNode, 'before' | 'after'>[] = [];
  for (const s of tracked) {
    if (s.startDate && s.startDate <= todayKey)
      events.push({
        id: `add-${s.id}`,
        kind: 'add',
        date: s.startDate,
        sub: s,
        delta: cost(s, s.startDate),
      });
    for (const c of s.priceChanges || []) {
      const start = s.startDate || origin;
      if (c.date <= start || c.date > todayKey) continue;
      if (s.endDate && c.date >= s.endDate) continue;
      events.push({
        id: `price-${s.id}-${c.date}`,
        kind: 'price',
        date: c.date,
        sub: s,
        delta: cost(s, c.date) - cost(s, addDays(c.date, -1)),
      });
    }
    if (
      s.endDate &&
      s.endDate <= todayKey &&
      s.endDate > (s.startDate || origin)
    )
      events.push({
        id: `cancel-${s.id}`,
        kind: 'cancel',
        date: s.endDate,
        sub: s,
        delta: -cost(s, addDays(s.endDate, -1)),
      });
  }
  let running = 0;
  if (originSubs.length) {
    const members = originSubs.map((sub) => ({
      sub,
      daily: cost(sub, origin),
    }));
    running = members.reduce((n, m) => n + m.daily, 0);
    nodes.push({
      id: 'origin',
      kind: 'origin',
      date: origin,
      before: 0,
      after: running,
      delta: running,
      members,
    });
  }
  events.sort((a, b) => a.date.localeCompare(b.date));
  for (const e of events) {
    const before = running;
    running += e.delta;
    nodes.push({ ...e, before, after: running });
  }
  const at = (key: string) => tracked.reduce((n, s) => n + cost(s, key), 0);
  const yearStart = `${today.getFullYear()}-01-01`;
  return {
    origin: originSubs.length ? origin : null,
    nodes,
    today: at(todayKey),
    yearStart: at(yearStart),
    at,
  };
}
