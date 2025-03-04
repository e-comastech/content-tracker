import { OrderData } from '../../types/data';
import { convertToEUR } from '../currency';

const parseNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  // Handle various number formats
  const cleanValue = value.toString()
    .replace(/^[^0-9-]*/, '')  // Remove any leading non-numeric characters
    .replace(/\.(?=.*\.)/g, '') // Remove thousand separators
    .replace(/,/g, '.')        // Replace decimal comma with dot
    .trim();
  
  return parseFloat(cleanValue) || 0;
};

export const processOrderRow = (row: any): OrderData => {
  if (!row['purchase-date']) {
    throw new Error('Missing purchase date in order data');
  }

  const itemPrice = parseNumber(row['item-price']);
  const quantity = Math.round(parseNumber(row.quantity)); // Ensure quantity is a whole number

  return {
    'purchase-date': row['purchase-date'],
    date: row['purchase-date'].substring(0, 10),
    'sales-channel': row['sales-channel'] || '',
    'order-status': row['order-status'] || '',
    'item-price': itemPrice,
    currency: row.currency || 'EUR',
    'item-price-eur': convertToEUR(itemPrice, row.currency || 'EUR'),
    asin: row.asin || '',
    quantity: quantity,
  };
};