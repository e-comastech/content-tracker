import { OrderData, AsinMetadata } from './data';

export interface OrderData {
  'purchase-date': string;
  date: string;
  'sales-channel': string;
  'order-status': string;
  'item-price': number;
  currency: string;
  'item-price-eur': number;
  asin: string;
  quantity: number;
}

export interface PBIData {
  ASIN: string;
  Sales: number;
  Units: number;
}

export interface AsinMetadata {
  asin: string;
  brand: string;
  category: string;
  client: string;
  product: string;
  sku: string;
  subcategory: string;
  'product-type': string;
}

export interface EnrichedOrderData extends OrderData {
  brand?: string;
  category?: string;
  client?: string;
  product?: string;
  sku?: string;
  subcategory?: string;
  'product-type'?: string;
}

export interface ComparisonData {
  asin: string;
  total: number;
  units: number;
  pbiSales: number;
  pbiUnits: number;
  salesDiscrepancy: number;
  unitsDiscrepancy: number;
}