import React, { useState, useMemo, useCallback } from 'react';
import { Download, Check, AlertCircle, Copy, CheckCheck, FileOutput } from 'lucide-react';
import type { Cell } from 'exceljs';
import ExcelJS from 'exceljs';
import { ComparisonResult, FieldSelection } from '../types';

interface OpenCasesAssistantProps {
  results: ComparisonResult[];
  selectedFields: FieldSelection;
  selectedMarketplace: string;
}

interface BatchFile {
  id: number;
  results: ComparisonResult[];
  marketplace: string;
  downloaded: boolean;
}

export const OpenCasesAssistant: React.FC<OpenCasesAssistantProps> = ({ 
  results, 
  selectedFields,
  selectedMarketplace
}) => {
  const [batches, setBatches] = useState<BatchFile[]>([]);
  const [batchSize, setBatchSize] = useState(100);
  const [showCopied, setShowCopied] = useState(false);
  const [showOpenCasesAssistant, setShowOpenCasesAssistant] = useState(true);

  const filteredResults = useMemo(() => {
    return selectedMarketplace
      ? results.filter((r) => r.Marketplace === selectedMarketplace)
      : results;
  }, [results, selectedMarketplace]);

  const generateBatches = useCallback(() => {
    const newBatches: BatchFile[] = [];
    const marketplaces = Array.from(new Set(filteredResults.map(r => r.Marketplace)));

    marketplaces.forEach(marketplace => {
      const marketplaceResults = filteredResults.filter(r => r.Marketplace === marketplace);
      
      for (let i = 0; i < marketplaceResults.length; i += batchSize) {
        newBatches.push({
          id: newBatches.length + 1,
          results: marketplaceResults.slice(i, i + batchSize),
          marketplace,
          downloaded: false
        });
      }
    });

    setBatches(newBatches);
  }, [filteredResults, batchSize]);

  const generateExcel = async (batch: BatchFile) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Open Cases');

    // Add headers
    worksheet.columns = [
      { header: 'ASIN', key: 'asin', width: 15 },
      { header: 'Marketplace', key: 'marketplace', width: 15 },
      { header: 'Overall Match', key: 'overallMatch', width: 15 },
      ...Object.entries(selectedFields)
        .filter(([_, isSelected]) => isSelected)
        .map(([field]) => ({ header: field, key: field.toLowerCase(), width: 50 }))
    ];

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' }
    };

    // Add data
    batch.results.forEach(result => {
      const row: any = {
        asin: result.ASIN,
        marketplace: result.Marketplace,
        overallMatch: `${result.overallMatch.toFixed(2)}%`
      };

      Object.entries(selectedFields)
        .filter(([_, isSelected]) => isSelected)
        .forEach(([field]) => {
          const fieldData = result.fields[field];
          if (fieldData) {
            row[field.toLowerCase()] = `Current: ${fieldData.source1}\n\nNew: ${fieldData.source2}\n\nMatch: ${fieldData.similarity.toFixed(2)}%`;
          }
        });

      worksheet.addRow(row);
    });

    // Auto-fit rows
    worksheet.eachRow((row) => {
      row.eachCell((cell: Cell) => {
        if (typeof cell.value === 'string') {
          const lines = cell.value.split('\n').length;
          row.height = Math.max(lines * 15, 20);
        }
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `open-cases-batch-${batch.id}-${batch.marketplace}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);

    // Mark batch as downloaded
    setBatches(prev => prev.map(b => 
      b.id === batch.id ? { ...b, downloaded: true } : b
    ));
  };

  const copyBatchInfo = () => {
    const info = batches.map(batch => 
      `Batch ${batch.id} - ${batch.marketplace}: ${batch.results.length} products`
    ).join('\n');
    
    navigator.clipboard.writeText(info);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  if (filteredResults.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <AlertCircle className="w-12 h-12 text-brand-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Cases to Process</h2>
        <p className="text-gray-600">
          All products have content matching rates above 90% for the selected fields.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Open Cases Assistant</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate Excel files for creating open cases in bulk. Files will be split by marketplace and batch size to manage large volumes efficiently.
          </p>
          <div className="flex items-center space-x-4">
            <div className="w-48">
              <label htmlFor="batchSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Products per batch
              </label>
              <select
                id="batchSize"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-brand-400 focus:border-brand-400 sm:text-sm rounded-md dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
              </select>
            </div>
            <button
              onClick={generateBatches}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-400 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-400 dark:focus:ring-offset-gray-800"
            >
              Generate Batches
            </button>
          </div>
        </div>

        {batches.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Generated Batches</h3>
              <button
                onClick={copyBatchInfo}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-400 dark:focus:ring-offset-gray-800"
              >
                {showCopied ? (
                  <>
                    <CheckCheck className="w-4 h-4 mr-1.5 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1.5" />
                    Copy Info
                  </>
                )}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="relative rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 p-4 shadow-sm"
                >
                  <div className="flex justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Batch {batch.id}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {batch.marketplace} • {batch.results.length} products
                      </p>
                    </div>
                    {batch.downloaded && (
                      <div className="absolute top-4 right-4">
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => generateExcel(batch)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-400 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-400 dark:focus:ring-offset-gray-800 w-full justify-center"
                    >
                      <Download className="w-4 h-4 mr-1.5" />
                      {batch.downloaded ? 'Download Again' : 'Download Excel'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {batches.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No batches generated</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Click the "Generate Batches" button to create Excel files for open cases.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};