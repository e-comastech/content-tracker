import React, { useCallback, useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import { ProductData } from '../types';

interface FileUploadProps {
  onDataLoaded: (data: ProductData[]) => void;
  label: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, label }) => {
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      complete: (results) => {
        // Filter out any rows that don't have an ASIN
        const validData = (results.data as ProductData[]).filter(row => row.ASIN);
        onDataLoaded(validData);
        setIsUploaded(true);
      },
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // Ensure consistent header names
        return header.trim().replace(/\s+/g, '');
      }
    });
  }, [onDataLoaded]);

  const getLabel = () => {
    if (label.includes('Source 1')) {
      return 'Amazon Current Content';
    }
    if (label.includes('Source 2')) {
      return 'Source of Truth';
    }
    return label;
  };

  const getFormatExplanation = () => {
    return "CSV file with headers: ASIN, Marketplace, ProductTitle, Description, BulletPoint1-5, Variations";
  };

  return (
    <div className="mb-4">
      <label
        className={`
          flex flex-col items-center w-full p-6 rounded-lg border-2 border-dashed
          ${isUploaded 
            ? 'border-green-600 bg-green-50 dark:border-green-600 dark:bg-green-900/30' 
            : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
          }
          cursor-pointer transition-all duration-200 hover:border-brand-400 dark:hover:border-brand-400
        `}
      >
        <div className="flex flex-col items-center">
          {isUploaded ? (
            <>
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {fileName} uploaded successfully
              </span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getLabel()}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {getFormatExplanation()}
              </span>
            </>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleFileUpload}
        />
      </label>
    </div>
  );
};