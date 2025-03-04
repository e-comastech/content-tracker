import React from 'react';
import { Download } from 'lucide-react';
import { PBIData, AsinMetadata } from '../types/data';
import { formatNumber } from '../utils/formatters';
import { exportToCSV } from '../utils/exportUtils';

interface PBIDataTableProps {
  data: PBIData[];
  metadata: AsinMetadata[];
}

export const PBIDataTable: React.FC<PBIDataTableProps> = ({ data, metadata }) => {
  const handleExportCSV = () => {
    const exportData = data.map(item => {
      const metadataItem = metadata.find(m => m.asin === item.ASIN);
      return {
        ASIN: item.ASIN,
        Sales: item.Sales,
        Units: item.Units,
        Brand: metadataItem?.brand || '',
        Category: metadataItem?.category || '',
        Client: metadataItem?.client || '',
        Subcategory: metadataItem?.subcategory || '',
        'Product Type': metadataItem?.['product-type'] || '',
      };
    });

    exportToCSV(exportData, 'pbi-data-analysis.csv');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">PBI Data Analysis</h3>
        <button
          onClick={handleExportCSV}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
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
            {data.map((item) => {
              const metadataItem = metadata.find(m => m.asin === item.ASIN);
              return (
                <tr key={item.ASIN}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.ASIN}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {metadataItem?.brand || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {metadataItem?.category || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    €{formatNumber(item.Sales)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatNumber(item.Units)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};