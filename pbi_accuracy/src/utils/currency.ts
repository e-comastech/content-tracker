const EXCHANGE_RATES = {
  EUR: 1,
  USD: 0.92, // 1 USD = 0.92 EUR
  GBP: 1.15, // 1 GBP = 1.15 EUR
  SEK: 0.088, // 1 SEK = 0.088 EUR
} as const;

export const convertToEUR = (amount: number, currency: string): number => {
  return amount * (EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES] || 1);
};