import React from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { ComparisonResult, FieldSelection } from '../types';

interface ComparisonTableProps {
  results: ComparisonResult[];
  selectedFields: FieldSelection;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ results, selectedFields }) => {
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());

  const toggleRow = (asin: string) => {
    const newExpanded = new Set(expandedRows);
    if (expandedRows.has(asin)) {
      newExpanded.delete(asin);
    } else {
      newExpanded.add(asin);
    }
    setExpandedRows(newExpanded);
  };

  const getMatchColor = (similarity: number) => {
    if (similarity >= 90) return 'bg-green-100 dark:bg-green-900/30';
    if (similarity >= 70) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Expand
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              ASIN
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Marketplace
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Overall Match
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Link
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {results.map((result) => (
            <React.Fragment key={`${result.ASIN}-${result.Marketplace}`}>
              <tr className={getMatchColor(result.overallMatch)}>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleRow(result.ASIN)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {expandedRows.has(result.ASIN) ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{result.ASIN}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                  {result.Marketplace}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                  {result.overallMatch.toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {result.Link && (
                    <a
                      href={result.Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View
                    </a>
                  )}
                </td>
              </tr>
              {expandedRows.has(result.ASIN) && (
                <tr key={`expanded-${result.ASIN}-${result.Marketplace}`}>
                  <td colSpan={5} className="px-6 py-4 bg-white dark:bg-gray-900">
                    <div className="space-y-4">
                      {Object.entries(result.fields)
                        .filter(([field]) => selectedFields[field])
                        .map(([field, data]) => (
                          <div
                            key={`${result.ASIN}-${field}`}
                            className={`p-4 rounded ${getMatchColor(
                              data.similarity
                            )}`}
                          >
                            <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">{field}</h4>
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                  Amazon Current Content
                                </p>
                                <p className="mt-1 break-words whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                                  {data.source1}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                  Source of Truth
                                </p>
                                <p className="mt-1 break-words whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                                  {data.source2}
                                </p>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Similarity: {data.similarity.toFixed(2)}%
                                </p>
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