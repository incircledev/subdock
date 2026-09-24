export const currencies = [
  'CNY',
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'KRW',
  'HKD',
  'TWD',
  'SGD',
] as const;

export type CurrencyCode = (typeof currencies)[number];

export const DEFAULT_CURRENCY: CurrencyCode = 'CNY';
export const EXCHANGE_RATE_URL =
  'https://api.frankfurter.dev/v2/rates?base=CNY&quotes=USD,EUR,GBP,JPY,KRW,HKD,TWD,SGD';

export type ExchangeRates = Record<CurrencyCode, number>;

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return currencies.includes(value as CurrencyCode);
}

export function parseExchangeRates(value: unknown): ExchangeRates | null {
  const parsed: Partial<ExchangeRates> = { CNY: 1 };

  if (Array.isArray(value)) {
    for (const row of value) {
      if (!row || typeof row !== 'object') continue;
      const entry = row as { quote?: unknown; rate?: unknown };
      const quote =
        typeof entry.quote === 'string' ? entry.quote.toUpperCase() : '';
      if (isCurrencyCode(quote) && Number(entry.rate) > 0)
        parsed[quote] = Number(entry.rate);
    }
  } else if (value && typeof value === 'object') {
    const response = value as { rates?: unknown };
    if (!response.rates || typeof response.rates !== 'object') return null;
    for (const [code, rate] of Object.entries(response.rates)) {
      const currency = code.toUpperCase();
      if (isCurrencyCode(currency) && Number(rate) > 0)
        parsed[currency] = Number(rate);
    }
  }

  return currencies.every((currency) => Number(parsed[currency]) > 0)
    ? (parsed as ExchangeRates)
    : null;
}

export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: ExchangeRates | null,
) {
  if (from === to) return amount;
  if (!rates) return null;
  return (amount / rates[from]) * rates[to];
}

export function formatCurrency(
  locale: string,
  amount: number,
  currency: CurrencyCode,
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  }).format(amount);
}

export function currencyDisplayParts(
  locale: string,
  amount: number,
  currency: CurrencyCode,
) {
  const parts = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  }).formatToParts(amount);
  return {
    symbol: parts.find((part) => part.type === 'currency')?.value || currency,
    integer: parts
      .filter((part) => ['integer', 'group'].includes(part.type))
      .map((part) => part.value)
      .join(''),
    fraction: parts.find((part) => part.type === 'fraction')?.value || '',
    decimal: parts.find((part) => part.type === 'decimal')?.value || '.',
  };
}
