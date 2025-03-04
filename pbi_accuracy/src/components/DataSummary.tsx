import React from 'react';
import { ComparisonData } from '../types/data';

interface DataSummaryProps {
  comparisonData: ComparisonData[];
}

export const DataSummary: React.FC<DataSummaryProps> = ({ comparisonData }) => {
  const totalAmazonSales = comparisonData.reduce((sum, item) => sum + item.total, 0);
  const totalPBISales = comparisonData.reduce((sum, item) => sum + item.pbiSales, 0);
  const totalSalesDiscrepancy = Math.abs(((totalPBISales - totalAmazonSales) / totalAmazonSales) * 100);
  
  const totalAmazonUnits = comparisonData.reduce((sum, item) => sum + item.units, 0);
  const totalPBIUnits = comparisonData.reduce((sum, item) => sum + item.pbiUnits, 0);
  const totalUnitsDiscrepancy = Math.abs(((totalPBIUnits - totalAmazonUnits) / totalAmazonUnits) * 100);

  const isDataMatching = totalSalesDiscrepancy <= 2 && totalUnitsDiscrepancy <= 2;

  return (
    <div className={`p-4 rounded-lg ${isDataMatching ? 'bg-green-50' : 'bg-red-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className={`text-lg font-semibold ${isDataMatching ? 'text-green-800' : 'text-red-800'}`}>
            Data Matching Status
          </h2>
          <p className={`mt-1 ${isDataMatching ? 'text-green-600' : 'text-red-600'}`}>
            {isDataMatching
              ? '✓ Amazon and PowerBI data match (less than 2% discrepancy)'
              : '⚠ Data discrepancy detected (more than 2% difference)'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            Sales Discrepancy: <span className={totalSalesDiscrepancy <= 2 ? 'text-green-600' : 'text-red-600'}>
              {totalSalesDiscrepancy.toFixed(2)}%
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Units Discrepancy: <span className={totalUnitsDiscrepancy <= 2 ? 'text-green-600' : 'text-red-600'}>
              {totalUnitsDiscrepancy.toFixed(2)}%
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};