import React from 'react';
import { Download } from 'lucide-react';
import { EnrichedOrderData, ComparisonData } from '../types/data';
import { formatNumber } from '../utils/formatters';
import { exportToCSV } from '../utils/exportUtils';

interface DataTableProps {
  data: EnrichedOrderData[];
  asinTotals: { asin: string; total: number; units: number; }[];
  marketplaceTotals: { marketplace: string; total: number; units: number; }[];
  comparisonData?: ComparisonData[];
}

export const DataTable: React.FC<DataTableProps> = ({ 
  data, 
  asinTotals, 
  marketplaceTotals,
  comparisonData 
}) => {
  const getDiscrepancyColor = (value: number) => {
    if (Math.abs(value) > 2) {
      return 'text-red-600';
    }
    return 'text-green-600';
  };

  const handleExportCSV = (data: any[], filename: string) => {
    exportToCSV(data, filename);
  };

  // Calculate totals for comparison section
  const totalAmazonSales = data.reduce((sum, item) => sum + item['item-price-eur'], 0);
  const totalAmazonUnits = data.reduce((sum, item) => sum + item.quantity, 0);
  const totalPBISales = comparisonData?.reduce((sum, item) => sum + item.pbiSales, 0) || 0;
  const totalPBIUnits = comparisonData?.reduce((sum, item) => sum + item.pbiUnits, 0) || 0;
  const totalSalesDiscrepancy = totalAmazonSales > 0 ? ((totalPBISales - totalAmazonSales) / totalAmazonSales) * 100 : 0;
  const totalUnitsDiscrepancy = totalAmazonUnits > 0 ? ((totalPBIUnits - totalAmazonUnits) / totalAmazonUnits) * 100 : 0;

  return (
    <div className="space-y-6">
      {comparisonData && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Data Comparison Overview</h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Totals Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Total Sales Comparison</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Amazon Sales</p>
                  <p className="text-sm font-medium">€{formatNumber(totalAmazonSales)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">PBI Sales</p>
                  <p className="text-sm font-medium">€{formatNumber(totalPBISales)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amazon Units</p>
                  <p className="text-sm font-medium">{formatNumber(totalAmazonUnits)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">PBI Units</p>
                  <p className="text-sm font-medium">{formatNumber(totalPBIUnits)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
                <div>
                  <p className="text-xs text-gray-500">Sales Difference</p>
                  <p className={`text-sm font-medium ${getDiscrepancyColor(totalSalesDiscrepancy)}`}>
                    {totalSalesDiscrepancy.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Units Difference</p>
                  <p className={`text-sm font-medium ${getDiscrepancyColor(totalUnitsDiscrepancy)}`}>
                    {totalUnitsDiscrepancy.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales by Marketplace */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Sales by Marketplace</h3>
          <button
            onClick={() => handleExportCSV(marketplaceTotals, 'sales-by-marketplace.csv')}
            className="flex items-center text-sm text-[#64D7BE] hover:text-[#50c5ac]"
          >
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marketplace
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales (EUR)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {marketplaceTotals.map(({ marketplace, total, units }) => (
                <tr key={marketplace}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {marketplace}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    €{formatNumber(total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatNumber(units)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales by ASIN */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Sales by ASIN</h3>
          <button
            onClick={() => handleExportCSV(comparisonData || [], 'sales-by-asin.csv')}
            className="flex items-center text-sm text-[#64D7BE] hover:text-[#50c5ac]"
          >
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ASIN
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales (EUR)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PBI Sales
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Diff %
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PBI Units
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units Diff %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {comparisonData?.map((item) => (
                <tr key={item.asin} className={Math.abs(item.unitsDiscrepancy) > 2 ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.asin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    €{formatNumber(item.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    €{formatNumber(item.pbiSales)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${getDiscrepancyColor(item.salesDiscrepancy)}`}>
                    {item.salesDiscrepancy.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatNumber(item.units)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatNumber(item.pbiUnits)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${getDiscrepancyColor(item.unitsDiscrepancy)}`}>
                    {item.unitsDiscrepancy.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};