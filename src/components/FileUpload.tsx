import React, { useCallback, useState } from 'react';
import { Upload, CheckCircle, FileUp, Loader2, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { ProductData } from '../types';
import { ClientSelector } from './ClientSelector';

interface FileUploadProps {
  onDataLoaded: (data: ProductData[]) => void;
  label: string;
  allowClientSource?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onDataLoaded, 
  label,
  allowClientSource = false
}) => {
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<'manual' | 'client'>('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataCount, setDataCount] = useState<number>(0);

  const validateData = (data: ProductData[]) => {
    if (!data || data.length === 0) {
      throw new Error('No valid data found in the file');
    }

    const requiredFields = ['ASIN', 'Marketplace'];
    const missingFields = requiredFields.filter(field => 
      !data.some(row => row[field as keyof ProductData])
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Filter out invalid rows
    return data.filter(row => row.ASIN && row.Marketplace);
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);
    setError(null);

    Papa.parse(file, {
      complete: (results) => {
        try {
          const validData = validateData(results.data as ProductData[]);
          setDataCount(validData.length);
          onDataLoaded(validData);
          setIsUploaded(true);
        } catch (err) {
          setError((err as Error).message);
          setIsUploaded(false);
        } finally {
          setIsLoading(false);
        }
      },
      error: (error) => {
        setError(`Failed to parse file: ${error.message}`);
        setIsLoading(false);
        setIsUploaded(false);
      },
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        return header.trim().replace(/\s+/g, '');
      }
    });
  }, [onDataLoaded]);

  const handleClientSourceData = (data: ProductData[]) => {
    try {
      const validData = validateData(data);
      setDataCount(validData.length);
      onDataLoaded(validData);
      setIsUploaded(true);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setIsUploaded(false);
    }
  };

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

  if (allowClientSource) {
    return (
      <div className="space-y-4">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => {
              setUploadMode('manual');
              setIsUploaded(false);
              setError(null);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              uploadMode === 'manual'
                ? 'bg-brand-400 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <FileUp className="w-4 h-4 inline mr-2" />
            Manual Upload
          </button>
          <button
            onClick={() => {
              setUploadMode('client');
              setIsUploaded(false);
              setError(null);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              uploadMode === 'client'
                ? 'bg-brand-400 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Client Source
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {uploadMode === 'manual' ? (
          <div className="w-full">
            <label 
              className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
                isUploaded 
                  ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50' 
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isLoading ? (
                  <Loader2 className="w-8 h-8 mb-2 text-brand-400 animate-spin" />
                ) : isUploaded ? (
                  <CheckCircle className="w-8 h-8 mb-2 text-green-500 dark:text-green-400" />
                ) : (
                  <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                )}
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">{getLabel()}</span>
                </p>
                {!isUploaded && !isLoading && (
                  <>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Drop your CSV file here or click to browse
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center max-w-[80%]">
                      {getFormatExplanation()}
                    </p>
                  </>
                )}
                {isUploaded && (
                  <>
                    <p className="text-xs text-green-500 dark:text-green-400">
                      File processed successfully
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {fileName} ({dataCount} products)
                    </p>
                  </>
                )}
                {isLoading && (
                  <p className="text-xs text-brand-500 dark:text-brand-400">
                    Processing file...
                  </p>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isLoading}
              />
            </label>
          </div>
        ) : (
          <ClientSelector 
            onClientSelect={() => {}} 
            onSourceDataLoaded={handleClientSourceData}
          />
        )}

        {isUploaded && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            ✓ {dataCount} products loaded and validated
          </div>
        )}
      </div>
    );
  }

  // Original file upload UI for non-client-source components
  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      <label 
        className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
          isUploaded 
            ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50' 
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isLoading ? (
            <Loader2 className="w-8 h-8 mb-2 text-brand-400 animate-spin" />
          ) : isUploaded ? (
            <CheckCircle className="w-8 h-8 mb-2 text-green-500 dark:text-green-400" />
          ) : (
            <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
          )}
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">{getLabel()}</span>
          </p>
          {!isUploaded && !isLoading && (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Drop your CSV file here or click to browse
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center max-w-[80%]">
                {getFormatExplanation()}
              </p>
            </>
          )}
          {isUploaded && (
            <>
              <p className="text-xs text-green-500 dark:text-green-400">
                File processed successfully
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {fileName} ({dataCount} products)
              </p>
            </>
          )}
          {isLoading && (
            <p className="text-xs text-brand-500 dark:text-brand-400">
              Processing file...
            </p>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isLoading}
        />
      </label>

      {isUploaded && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          ✓ {dataCount} products loaded and validated
        </div>
      )}
    </div>
  );
};