import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dateString,
  monthlyAmount,
  nextRenewal,
  isSubscription,
  sampleSubscriptions,
  daysUntil,
} from '../lib/subscriptions.ts';
const base = sampleSubscriptions(new Date(2026, 8, 5))[0];
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
  ])
    assert.equal(isSubscription({ ...base, ...patch }), false);
});
