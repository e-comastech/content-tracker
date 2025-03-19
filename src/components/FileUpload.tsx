import React, { useCallback, useState } from 'react';
import { Upload, CheckCircle, FileUp, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Papa from 'papaparse';
import { ProductData } from '../types';
import { ClientSelector } from './ClientSelector';

interface FileUploadProps {
  onDataLoaded: (data: ProductData[]) => void;
  label: string;
  allowClientSource?: boolean;
  step?: number;
  isEnabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onDataLoaded, 
  label,
  allowClientSource = false,
  step = 1,
  isEnabled = true
}) => {
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [uploadMode, setUploadMode] = useState<'client' | 'manual'>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataCount, setDataCount] = useState<number>(0);

  const validateData = (data: ProductData[]) => {
    if (!data || data.length === 0) {
      throw new Error('No valid data found in the file');
    }

    // Get all available headers from the first row
    const availableHeaders = Object.keys(data[0] || {}).map(header => header.trim().toLowerCase());
    console.log('Available headers:', availableHeaders);

    const requiredFields = ['asin', 'marketplace'];
    const missingFields = requiredFields.filter(field => 
      !availableHeaders.includes(field.toLowerCase())
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}. Available fields: ${availableHeaders.join(', ')}`);
    }

    // Filter out invalid rows and normalize field names
    return data.filter(row => {
      const hasAsin = Object.keys(row).some(key => 
        key.toLowerCase() === 'asin' && row[key]
      );
      const hasMarketplace = Object.keys(row).some(key => 
        key.toLowerCase() === 'marketplace' && row[key]
      );
      return hasAsin && hasMarketplace;
    });
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
          console.log('Parsed data first row:', results.data[0]);
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
        // Normalize headers: trim whitespace and convert to standard format
        const normalizedHeader = header.trim().replace(/\s+/g, '');
        console.log(`Header transformation: "${header}" -> "${normalizedHeader}"`);
        return normalizedHeader;
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

  return (
    <div className={`rounded-lg border ${isEnabled ? 'border-brand-200' : 'border-gray-200'} p-6 ${!isEnabled && 'opacity-50'}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
          <span className="text-brand-600 dark:text-brand-400 font-semibold">{step}</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {label}
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {allowClientSource ? (
        <div className="space-y-4">
          <ClientSelector 
            onClientSelect={() => {}} 
            onSourceDataLoaded={handleClientSourceData}
          />
          
          <div className="relative">
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              {showAdvancedOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Advanced Options
            </button>
            
            {showAdvancedOptions && (
              <div className="mt-4">
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
                        Manual Upload
                      </p>
                      {!isUploaded && !isLoading && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center max-w-[80%]">
                          CSV file with headers: ASIN, Marketplace, ProductTitle, Description, BulletPoint1-5
                        </p>
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
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".csv"
                      onChange={handleFileUpload}
                      disabled={isLoading || !isEnabled}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Original file upload UI for non-client-source components
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
                {label}
              </p>
              {!isUploaded && !isLoading && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center max-w-[80%]">
                  CSV file with headers: ASIN, Marketplace, ProductTitle, Description, BulletPoint1-5
                </p>
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
            </div>
            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isLoading || !isEnabled}
            />
          </label>
        </div>
      )}

      {isUploaded && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          ✓ {dataCount} products loaded and validated
        </div>
      )}
    </div>
  );
};