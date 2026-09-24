import test from 'node:test';
import assert from 'node:assert/strict';
import {
  convertCurrency,
  currencyDisplayParts,
  parseExchangeRates,
} from '../lib/currencies.ts';

const rates = parseExchangeRates([
  { quote: 'USD', rate: 0.14 },
  { quote: 'EUR', rate: 0.12 },
  { quote: 'GBP', rate: 0.1 },
  { quote: 'JPY', rate: 20 },
  { quote: 'KRW', rate: 190 },
  { quote: 'HKD', rate: 1.08 },
  { quote: 'TWD', rate: 4.4 },
  { quote: 'SGD', rate: 0.18 },
]);

void test('Frankfurter v2 rates convert through the CNY base', () => {
  assert.ok(rates);
  assert.ok(
    Math.abs((convertCurrency(100, 'CNY', 'USD', rates) || 0) - 14) < 1e-9,
  );
  assert.ok(
    Math.abs((convertCurrency(14, 'USD', 'CNY', rates) || 0) - 100) < 1e-9,
  );
  assert.ok(
    Math.abs((convertCurrency(14, 'USD', 'EUR', rates) || 0) - 12) < 1e-9,
  );
});

void test('conversion without rates only permits the same currency', () => {
  assert.equal(convertCurrency(20, 'USD', 'USD', null), 20);
  assert.equal(convertCurrency(20, 'USD', 'CNY', null), null);
});

void test('currency formatting honors zero-decimal currencies', () => {
  assert.equal(currencyDisplayParts('en', 1200, 'JPY').fraction, '');
  assert.equal(currencyDisplayParts('en', 12.5, 'USD').fraction, '50');
});
