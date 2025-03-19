import React, { useState, useMemo } from 'react';
import { Download, Check, AlertCircle, Copy, CheckCheck, FileOutput, Table2 } from 'lucide-react';
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

type TabType = 'amazon' | 'marketplace';

export const OpenCasesAssistant: React.FC<OpenCasesAssistantProps> = ({ 
  results, 
  selectedFields,
  selectedMarketplace 
}) => {
  const [downloadedFiles, setDownloadedFiles] = useState<Set<number>>(new Set());
  const [copiedMessages, setCopiedMessages] = useState<Set<number>>(new Set());
  const [showOpenCasesAssistant, setShowOpenCasesAssistant] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('amazon');
  const [downloadedMarketplaces, setDownloadedMarketplaces] = useState<Set<string>>(new Set());

  // Filter results to only include products with at least one attribute below 90%
  const filteredResults = useMemo(() => {
    if (activeTab === 'amazon') {
      return results
        .filter(result => {
          // First apply marketplace filter if selected
          if (selectedMarketplace && result.Marketplace !== selectedMarketplace) {
            return false;
          }
          // Then apply similarity threshold filter
          return Object.entries(result.fields)
            .some(([field, data]) => selectedFields[field] && data.similarity < 90);
        });
    }
    // For marketplace tab, return all results filtered by marketplace
    return selectedMarketplace
      ? results.filter(r => r.Marketplace === selectedMarketplace)
      : results;
  }, [results, selectedFields, selectedMarketplace, activeTab]);

  const batches = useMemo(() => {
    const batchFiles: BatchFile[] = [];
    
    // Group results by marketplace first
    const marketplaceGroups = filteredResults.reduce((groups, result) => {
      const marketplace = result.Marketplace;
      if (!groups[marketplace]) {
        groups[marketplace] = [];
      }
      groups[marketplace].push(result);
      return groups;
    }, {} as Record<string, ComparisonResult[]>);

    // Create batches for each marketplace group
    Object.entries(marketplaceGroups).forEach(([marketplace, results]) => {
      for (let i = 0; i < results.length; i += 10) {
        batchFiles.push({
          id: batchFiles.length + 1,
          results: results.slice(i, i + 10),
          marketplace: marketplace,
          downloaded: false
        });
      }
    });
    
    return batchFiles;
  }, [filteredResults]);

  const marketplaces = useMemo(() => {
    return Array.from(new Set(results.map(r => r.Marketplace)));
  }, [results]);

  const generateExcel = async (batch: BatchFile) => {
    const selectedFieldKeys = Object.keys(selectedFields).filter(key => selectedFields[key]);
    
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Content Review');

    // Add headers
    worksheet.columns = [
      { header: 'ASIN', width: 15 },
      { header: 'Marketplace', width: 15 },
      ...selectedFieldKeys.map(key => ({ header: key, width: 30 }))
    ];

    // Define style for cells with low similarity
    const yellowFill = {
      type: 'pattern' as const,
      pattern: 'solid' as const,
      fgColor: { argb: 'FFFFFF00' }
    };

    // Add data rows
    batch.results.forEach(result => {
      // Create row with data
      const rowData = [
        result.ASIN,
        result.Marketplace,
        ...selectedFieldKeys.map(field => result.fields[field]?.source2 || '')
      ];

      // Add row to worksheet
      const row = worksheet.addRow(rowData);

      // Check for fields with similarity < 90% and highlight only those cells
      selectedFieldKeys.forEach((field, index) => {
        const similarity = result.fields[field]?.similarity || 0;
        if (similarity < 90) {
          const colIndex = index + 3; // +3 for ASIN and Marketplace
          const cell = row.getCell(colIndex);
          cell.fill = yellowFill;
          cell.font = { bold: true };
        }
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern' as const,
      pattern: 'solid' as const,
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Create blob and download
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `open_cases_batch_${batch.id}_${batch.marketplace}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    setDownloadedFiles(prev => new Set([...prev, batch.id]));
  };

  const generateMarketplaceExcel = async (marketplace: string) => {
    const selectedFieldKeys = Object.keys(selectedFields).filter(key => selectedFields[key]);
    const marketplaceResults = results.filter(r => r.Marketplace === marketplace);
    
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Content Review');

    // Add headers
    worksheet.columns = [
      { header: 'ASIN', width: 15 },
      { header: 'Needs Update', width: 15 },
      { header: 'Overall Match %', width: 15 },
      ...selectedFieldKeys.flatMap(field => [
        { header: `${field} - Current on Amazon`, width: 40 },
        { header: `${field} - Required Content`, width: 40 },
        { header: `${field} - Match %`, width: 15 }
      ])
    ];

    // Add data rows
    marketplaceResults.forEach(result => {
      const needsUpdate = Object.entries(result.fields)
        .some(([field, data]) => selectedFields[field] && data.similarity < 90);

      const rowData = [
        result.ASIN,
        needsUpdate ? 'Yes' : 'No',
        result.overallMatch.toFixed(2) + '%',
        ...selectedFieldKeys.flatMap(field => {
          const fieldData = result.fields[field];
          return [
            fieldData?.source1 || '',
            fieldData?.source2 || '',
            (fieldData?.similarity || 0).toFixed(2) + '%'
          ];
        })
      ];

      const row = worksheet.addRow(rowData);

      // Style the "Needs Update" cell
      const needsUpdateCell = row.getCell(2);
      if (needsUpdate) {
        needsUpdateCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFD700' }
        };
        needsUpdateCell.font = { bold: true };
      }

      // Style match percentage cells
      selectedFieldKeys.forEach((_, index) => {
        const matchCell = row.getCell(6 + index * 3); // Position of Match % column
        const matchValue = parseFloat(matchCell.value as string);
        if (matchValue < 90) {
          matchCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFD700' }
          };
          matchCell.font = { bold: true };
        }
      });
    });

    // Style and format
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

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
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `content_review_${marketplace}_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    setDownloadedMarketplaces(prev => new Set([...prev, marketplace]));
  };

  const generateSupportMessage = (batch: BatchFile) => {
    // Create ASIN-specific content sections
    const asinSections = batch.results.map(result => {
      // Get fields that need updating (similarity < 90%)
      const fieldsToUpdate = Object.entries(result.fields)
        .filter(([field, data]) => selectedFields[field] && data.similarity < 90)
        .map(([field]) => `- ${field}`)
        .join('\n');

      return `[${result.ASIN}]:\n${fieldsToUpdate}`;
    }).join('\n\n');

    const message = `Hi team,

I am writing regarding content updates needed for the following ASINs in the marketplace ${batch.marketplace}:

${asinSections}

As brand owners, we would like to request your assistance to get the right content live. Please see the attached Excel file where the yellow cells indicate the content that needs to be updated.

Thanks!`;

    return message;
  };

  const copyToClipboard = async (batch: BatchFile) => {
    const message = generateSupportMessage(batch);
    await navigator.clipboard.writeText(message);
    setCopiedMessages(prev => new Set([...prev, batch.id]));
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(batch.id);
        return newSet;
      });
    }, 2000);
  };

  if (filteredResults.length === 0 && activeTab === 'amazon') {
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
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <div className="max-w-6xl mx-auto">
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('amazon')}
              className={`
                ${activeTab === 'amazon'
                  ? 'border-brand-400 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              `}
            >
              Amazon Support Cases
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`
                ${activeTab === 'marketplace'
                  ? 'border-brand-400 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              `}
            >
              Marketplace Export
            </button>
          </nav>
        </div>

        {activeTab === 'amazon' ? (
          // Amazon Support Cases Tab
          <div className="space-y-6">
            <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-brand-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-brand-800">Processing Information</h3>
                  <div className="mt-2 text-sm text-brand-700">
                    <p>Found {filteredResults.length} products with content matching below 90%</p>
                    <p className="mt-1">
                      {batches.length} batch{batches.length !== 1 ? 'es' : ''} will be generated
                      {filteredResults.length % 10 !== 0 && ` (last batch will contain ${filteredResults.length % 10} ASINs)`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Batch #{batch.id} - {batch.marketplace}
                    </h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {batch.results.length} ASINs
                    </span>
                  </div>
                  <div className="space-y-2 mb-6">
                    {batch.results.map((result) => (
                      <div key={result.ASIN} className="flex justify-between items-center text-sm">
                        <span className="font-mono text-gray-600">{result.ASIN}</span>
                        <span className="text-gray-500">{result.Marketplace}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => generateExcel(batch)}
                      className={`flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                        downloadedFiles.has(batch.id)
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-brand-400 text-white hover:bg-brand-500'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-400 transition-colors`}
                    >
                      {downloadedFiles.has(batch.id) ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Downloaded
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download Excel
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(batch)}
                      className={`flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                        copiedMessages.has(batch.id)
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors`}
                    >
                      {copiedMessages.has(batch.id) ? (
                        <>
                          <CheckCheck className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Support Message
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Marketplace Export Tab
          <div className="space-y-6">
            <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Table2 className="h-5 w-5 text-brand-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-brand-800">Marketplace Export</h3>
                  <div className="mt-2 text-sm text-brand-700">
                    <p>Export all products by marketplace with detailed content comparison</p>
                    <p className="mt-1">Products that need updates will be highlighted in the export</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketplaces.map((marketplace) => {
                const marketplaceResults = results.filter(r => r.Marketplace === marketplace);
                const needsUpdateCount = marketplaceResults.filter(result =>
                  Object.entries(result.fields)
                    .some(([field, data]) => selectedFields[field] && data.similarity < 90)
                ).length;
                
                return (
                  <div
                    key={marketplace}
                    className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {marketplace}
                      </h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {marketplaceResults.length} ASINs
                      </span>
                    </div>
                    <div className="space-y-2 mb-6">
                      <div className="text-sm text-gray-600">
                        Products needing updates: {needsUpdateCount}
                      </div>
                      <div className="text-sm text-gray-600">
                        Products up to date: {marketplaceResults.length - needsUpdateCount}
                      </div>
                    </div>
                    <button
                      onClick={() => generateMarketplaceExcel(marketplace)}
                      className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                        downloadedMarketplaces.has(marketplace)
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-brand-400 text-white hover:bg-brand-500'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-400 transition-colors`}
                    >
                      {downloadedMarketplaces.has(marketplace) ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Downloaded
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download Excel
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};