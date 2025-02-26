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
    <div className="w-full">
      <label 
        className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
          isUploaded 
            ? 'border-green-300 bg-green-50 hover:bg-green-100' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isUploaded ? (
            <CheckCircle className="w-8 h-8 mb-2 text-green-500" />
          ) : (
            <Upload className="w-8 h-8 mb-2 text-gray-500" />
          )}
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">{getLabel()}</span>
          </p>
          {!isUploaded && (
            <>
              <p className="text-xs text-gray-500 mb-1">
                Drop your CSV file here or click to browse
              </p>
              <p className="text-xs text-gray-400 text-center max-w-[80%]">
                {getFormatExplanation()}
              </p>
            </>
          )}
          {isUploaded && (
            <>
              <p className="text-xs text-green-500">
                File uploaded successfully
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {fileName}
              </p>
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