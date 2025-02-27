import React, { useMemo, useRef } from 'react';
import { BarChart, PieChart, Download } from 'lucide-react';
import { Statistics, FieldSelection } from '../types';
import { toPng } from 'html-to-image';

interface DashboardProps {
  stats: Statistics;
  selectedMarketplace: string;
  selectedFields: FieldSelection;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, selectedMarketplace, selectedFields }) => {
  const fieldMatchRatesRef = useRef<HTMLDivElement>(null);

  const filteredMarketplaceStats = selectedMarketplace
    ? { [selectedMarketplace]: stats.marketplaceStats[selectedMarketplace] }
    : stats.marketplaceStats;

  const totalProducts = useMemo(() => {
    if (!stats.results) return 0;
    return selectedMarketplace
      ? stats.results.filter(r => r.Marketplace === selectedMarketplace).length
      : stats.results.length;
  }, [stats.results, selectedMarketplace]);

  const fieldStats = useMemo(() => {
    const fields = Object.keys(stats.fieldStats).filter(field => selectedFields[field]);
    const result: Record<string, { 
      average: number; 
      highMatchCount: number;
    }> = {};

    fields.forEach(field => {
      let totalSimilarity = 0;
      let count = 0;
      let highMatchCount = 0;

      Object.entries(stats.marketplaceStats).forEach(([marketplace]) => {
        if (!selectedMarketplace || marketplace === selectedMarketplace) {
          const marketplaceResults = stats.results?.filter(r => r.Marketplace === marketplace) || [];
          marketplaceResults.forEach(result => {
            if (result.fields[field]) {
              totalSimilarity += result.fields[field].similarity;
              count++;
              if (result.fields[field].similarity >= 90) {
                highMatchCount++;
              }
            }
          });
        }
      });

      result[field] = {
        average: count > 0 ? totalSimilarity / count : 0,
        highMatchCount
      };
    });

    return result;
  }, [stats, selectedMarketplace, selectedFields]);

  const handleExport = async () => {
    if (!fieldMatchRatesRef.current) return;

    try {
      const dataUrl = await toPng(fieldMatchRatesRef.current, {
        quality: 1.0,
        pixelRatio: 2,
      });
      
      const link = document.createElement('a');
      link.download = `field-match-rates-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
    }
  };

  const selectedFieldsCount = Object.values(selectedFields).filter(Boolean).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{totalProducts}</p>
          </div>
          <BarChart className="w-8 h-8 text-brand-400 dark:text-brand-300" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Perfect Matches</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.perfectMatches}</p>
          </div>
          <PieChart className="w-8 h-8 text-brand-400 dark:text-brand-300" />
        </div>
      </div>

      <div className="col-span-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow relative">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Field Match Rates
          </p>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-400 dark:focus:ring-offset-gray-800"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export as PNG
          </button>
        </div>
        <div ref={fieldMatchRatesRef} className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(fieldStats).map(([field, { average, highMatchCount }]) => (
              <div key={field} className="bg-brand-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{field}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Average Match:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{average.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">≥90% Match:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{highMatchCount} products</span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-400 dark:bg-brand-500 rounded-full"
                      style={{ width: `${average}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 right-0 text-xs text-gray-400 dark:text-gray-500 mt-4 p-2">
            {selectedMarketplace ? `Marketplace: ${selectedMarketplace}` : 'All Marketplaces'} | 
            Fields Selected: {selectedFieldsCount} | 
            Generated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};