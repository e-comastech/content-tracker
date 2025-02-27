import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { ComparisonResult, FieldSelection } from '../types';

interface ComparisonTableProps {
  results: ComparisonResult[];
  selectedFields: FieldSelection;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ results, selectedFields }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (rowId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowId)) {
      newExpandedRows.delete(rowId);
    } else {
      newExpandedRows.add(rowId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getMatchColor = (similarity: number) => {
    if (similarity >= 90) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    } else if (similarity >= 70) {
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    }
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              ASIN
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Marketplace
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Overall Match
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Link
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {results.map((result) => (
            <React.Fragment key={`${result.ASIN}-${result.Marketplace}`}>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {result.ASIN}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {result.Marketplace}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleRow(`${result.ASIN}-${result.Marketplace}`)}
                      className="mr-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      {expandedRows.has(`${result.ASIN}-${result.Marketplace}`) ? (
                        <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMatchColor(result.overallMatch)}`}>
                      {result.overallMatch.toFixed(2)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <a
                    href={result.Link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 inline-flex items-center"
                  >
                    View <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </td>
              </tr>
              {expandedRows.has(`${result.ASIN}-${result.Marketplace}`) && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
                    <div className="space-y-4">
                      {Object.entries(selectedFields)
                        .filter(([_, isSelected]) => isSelected)
                        .map(([field]) => (
                          <div key={field} className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{field}</h4>
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMatchColor(result.fields[field]?.similarity || 0)}`}>
                                  {(result.fields[field]?.similarity || 0).toFixed(2)}%
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Source 1</p>
                                  <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{result.fields[field]?.source1 || ''}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Source 2</p>
                                  <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{result.fields[field]?.source2 || ''}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};