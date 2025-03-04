import Papa from 'papaparse';
import { OrderData, AsinMetadata, PBIData, ComparisonData } from '../types/data';
import { validateMetadataHeaders, validateMetadataRow, normalizeMetadataRow } from './validators';
import { processOrderRow } from './parsers/orderParser';
import { processPBIRow } from './parsers/pbiParser';

export const processFileData = (file: File): Promise<OrderData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const processedData = results.data
            .map(row => processOrderRow(row))
            .filter(row => row !== null) as OrderData[];
          resolve(processedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error)
    });
  });
};

export const processMetadataFile = (file: File): Promise<AsinMetadata[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const headerError = validateMetadataHeaders(Object.keys(results.data[0] || {}));
          if (headerError) {
            throw new Error(headerError);
          }

          const processedData = results.data
            .filter(row => validateMetadataRow(row))
            .map(row => normalizeMetadataRow(row));
          resolve(processedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error)
    });
  });
};

export const processPBIData = (file: File): Promise<PBIData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const processedData = results.data
            .map(row => processPBIRow(row))
            .filter(row => row !== null) as PBIData[];
          resolve(processedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error)
    });
  });
};

export const compareData = (orderData: OrderData[], pbiData: PBIData[]): ComparisonData[] => {
  const asinTotals = aggregateByAsin(orderData);
  
  return asinTotals.map(({ asin, total, units }) => {
    const pbiItem = pbiData.find(item => item.ASIN === asin) || { Sales: 0, Units: 0 };
    const salesDiscrepancy = total > 0 ? ((pbiItem.Sales - total) / total) * 100 : 0;
    const unitsDiscrepancy = units > 0 ? ((pbiItem.Units - units) / units) * 100 : 0;

    return {
      asin,
      total,
      units,
      pbiSales: pbiItem.Sales,
      pbiUnits: pbiItem.Units,
      salesDiscrepancy,
      unitsDiscrepancy
    };
  });
};

export const aggregateByAsin = (data: OrderData[]) => {
  // Use a more memory-efficient approach with a Map
  const totalsMap = new Map<string, { total: number; units: number }>();
  
  for (const item of data) {
    const existing = totalsMap.get(item.asin);
    if (existing) {
      existing.total += item['item-price-eur'];
      existing.units += item.quantity;
    } else {
      totalsMap.set(item.asin, {
        total: item['item-price-eur'],
        units: item.quantity
      });
    }
  }
  
  // Convert Map to array
  const totals = Array.from(totalsMap.entries()).map(([asin, { total, units }]) => ({
    asin,
    total,
    units
  }));

  return totals.sort((a, b) => b.total - a.total);
};

export const aggregateByMarketplace = (data: OrderData[]) => {
  // Use a more memory-efficient approach with a Map
  const totalsMap = new Map<string, { total: number; units: number }>();
  
  for (const item of data) {
    const marketplace = item['sales-channel'];
    const existing = totalsMap.get(marketplace);
    if (existing) {
      existing.total += item['item-price-eur'];
      existing.units += item.quantity;
    } else {
      totalsMap.set(marketplace, {
        total: item['item-price-eur'],
        units: item.quantity
      });
    }
  }
  
  // Convert Map to array
  const totals = Array.from(totalsMap.entries()).map(([marketplace, { total, units }]) => ({
    marketplace,
    total,
    units
  }));

  return totals.sort((a, b) => b.total - a.total);
};

export const aggregateByDate = (data: OrderData[]) => {
  // Use a more memory-efficient approach with a Map
  const totalsMap = new Map<string, { total: number; units: number }>();
  
  for (const item of data) {
    const existing = totalsMap.get(item.date);
    if (existing) {
      existing.total += item['item-price-eur'];
      existing.units += item.quantity;
    } else {
      totalsMap.set(item.date, {
        total: item['item-price-eur'],
        units: item.quantity
      });
    }
  }
  
  // Convert Map to array
  const totals = Array.from(totalsMap.entries()).map(([date, { total, units }]) => ({
    date,
    total,
    units
  }));

  return totals.sort((a, b) => a.date.localeCompare(b.date));
};

export const getUniqueValues = (data: any[], field: string): string[] => {
  // Use Set for more efficient unique value collection
  const values = new Set<string>();
  
  for (const item of data) {
    const value = item[field];
    if (value) {
      values.add(value.toString());
    }
  }
  
  return Array.from(values).sort();
};

export const findMissingAsins = (orderData: OrderData[], pbiData: PBIData[]): string[] => {
  // Get unique ASINs from order data with positive sales
  const orderAsins = new Set(
    orderData
      .filter(order => order['item-price-eur'] > 0)
      .map(order => order.asin)
  );

  // Get unique ASINs from PBI data
  const pbiAsins = new Set(pbiData.map(item => item.ASIN));

  // Find ASINs that are in orderData but not in pbiData
  return Array.from(orderAsins)
    .filter(asin => !pbiAsins.has(asin))
    .sort();
};