export interface ProductData {
  ASIN: string;
  Marketplace: string;
  ProductTitle: string;
  Description: string;
  BulletPoint1: string;
  BulletPoint2: string;
  BulletPoint3: string;
  BulletPoint4: string;
  BulletPoint5: string;
  Variations: string;
  Link: string;
}

export interface ComparisonResult {
  ASIN: string;
  Marketplace: string;
  Link: string;
  fields: {
    [key: string]: {
      source1: string;
      source2: string;
      similarity: number;
    };
  };
  overallMatch: number;
}

export interface Statistics {
  totalProducts: number;
  perfectMatches: number;
  marketplaceStats: { [key: string]: number };
  fieldStats: { [key: string]: number };
  results?: ComparisonResult[];
}

export interface FieldSelection {
  [key: string]: boolean;
}