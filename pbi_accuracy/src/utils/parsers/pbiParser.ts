import { PBIData } from '../../types/data';

const parseEuropeanNumber = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  // Handle European number format with euro symbol and thousands separators
  const cleanValue = value.toString()
    .replace('€', '')           // Remove euro symbol
    .replace(/\s/g, '')        // Remove any whitespace
    .replace(/,(?=\d{3})/g, '') // Remove thousands separators (commas)
    .replace(/\./g, '')        // Remove dots (also thousand separators)
    .replace(/,/g, '.')        // Replace remaining comma with dot for decimal
    .trim();
  
  const number = parseFloat(cleanValue);
  return isNaN(number) ? 0 : number;
};

export const processPBIRow = (row: any): PBIData | null => {
  if (!row.ASIN || row.ASIN === 'NA') {
    return null;
  }

  const salesValue = row.Sales || row['ProductSales'] || '0';
  const unitsValue = row.Units || '0';

  const sales = parseEuropeanNumber(salesValue);
  const units = parseInt(String(unitsValue).replace(/[^0-9-]/g, '')) || 0;

  return {
    ASIN: row.ASIN.trim(),
    Sales: sales,
    Units: units
  };
};