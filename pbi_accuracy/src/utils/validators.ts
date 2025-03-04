import { AsinMetadata } from '../types/data';

export const validateMetadataHeaders = (headers: string[]): string | null => {
  if (!headers || headers.length === 0) {
    return 'No headers found in metadata file';
  }

  const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
  const requiredHeaders = ['asin', 'brand', 'category', 'client', 'product', 'sku', 'subcategory', 'product type'];
  
  const missingHeaders = requiredHeaders.filter(header => 
    !normalizedHeaders.includes(header)
  );

  if (missingHeaders.length > 0) {
    return `Missing required headers: ${missingHeaders.join(', ')}`;
  }

  return null;
};

export const validateMetadataRow = (row: any): boolean => {
  if (!row || typeof row !== 'object') return false;
  
  // Find the ASIN field regardless of case
  const asinField = Object.keys(row).find(key => 
    key.toLowerCase() === 'asin'
  );
  
  if (!asinField || !row[asinField]) return false;
  
  const asinValue = row[asinField].toString().trim();
  return asinValue.length > 0;
};

export const normalizeMetadataRow = (row: any): AsinMetadata => {
  // Helper to find field regardless of case
  const findField = (fieldName: string): string => {
    const key = Object.keys(row).find(k => 
      k.toLowerCase() === fieldName.toLowerCase()
    );
    return (key && row[key]?.toString().trim()) || '';
  };

  return {
    asin: findField('asin'),
    brand: findField('brand'),
    category: findField('category'),
    client: findField('client'),
    product: findField('product'),
    sku: findField('sku'),
    subcategory: findField('subcategory'),
    'product-type': findField('product type'),
  };
};