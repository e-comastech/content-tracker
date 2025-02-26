import levenshtein from 'js-levenshtein';
import { ProductData, ComparisonResult, FieldSelection } from '../types';

const LEVENSHTEIN_WEIGHT = 0.7;
const JACCARD_WEIGHT = 0.3;

export const preprocessText = (text: string): string => {
  if (!text) return '';
  return text.trim().toLowerCase().replace(/[^\w\s]/g, '');
};

const calculateJaccardSimilarity = (str1: string, str2: string): number => {
  if (!str1 && !str2) return 1;
  if (!str1 || !str2) return 0;
  
  const words1 = str1.split(/\s+/).filter(word => word.length > 0);
  const words2 = str2.split(/\s+/).filter(word => word.length > 0);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
};

const calculateLevenshteinSimilarity = (str1: string, str2: string): number => {
  if (!str1 && !str2) return 1;
  if (!str1 || !str2) return 0;
  
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshtein(str1, str2);
  return 1 - distance / maxLength;
};

const calculateFieldSimilarity = (text1: string | undefined, text2: string | undefined): number => {
  if (!text1 && !text2) return 100;
  if (!text1 || !text2) return 0;

  const processed1 = preprocessText(text1);
  const processed2 = preprocessText(text2);

  if (processed1 === processed2) return 100;

  const levenshteinScore = calculateLevenshteinSimilarity(processed1, processed2);
  const jaccardScore = calculateJaccardSimilarity(processed1, processed2);

  return (levenshteinScore * LEVENSHTEIN_WEIGHT + jaccardScore * JACCARD_WEIGHT) * 100;
};

export const compareProducts = (
  source1: ProductData,
  source2: ProductData,
  selectedFields: FieldSelection
): ComparisonResult => {
  const fieldsToCompare = Object.keys(selectedFields).filter(field => selectedFields[field]) as Array<keyof ProductData>;

  const fields = fieldsToCompare.reduce((acc, field) => {
    const source1Value = source1[field];
    const source2Value = source2[field];
    
    const similarity = calculateFieldSimilarity(source1Value, source2Value);

    acc[field] = {
      source1: source1Value || '',
      source2: source2Value || '',
      similarity
    };

    return acc;
  }, {} as ComparisonResult['fields']);

  const validFieldCount = Object.values(fields).filter(
    field => field.source1 || field.source2
  ).length;

  const overallMatch = validFieldCount > 0
    ? Object.values(fields).reduce(
        (sum, field) => sum + field.similarity,
        0
      ) / validFieldCount
    : 0;

  return {
    ASIN: source1.ASIN,
    Marketplace: source1.Marketplace,
    Link: source1.Link || source2.Link || '',
    fields,
    overallMatch
  };
};