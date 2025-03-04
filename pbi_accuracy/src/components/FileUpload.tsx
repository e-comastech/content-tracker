import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onOrderFileUpload: (file: File) => void;
  onMetadataFileUpload: (file: File) => void;
  onPBIFileUpload: (file: File) => void;
  scenario: 'comparison' | 'drilldown';
  filesUploaded: {
    metadata: boolean;
    orders: boolean;
    pbi: boolean;
  };
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onOrderFileUpload,
  onMetadataFileUpload,
  onPBIFileUpload,
  scenario,
  filesUploaded,
}) => {
  const [error, setError] = useState<string>('');

  const handleOrderFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError('');

    if (!file) return;

    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
      setError('Please select a valid text file for orders');
      return;
    }

    onOrderFileUpload(file);
    event.target.value = '';
  };

  const handleMetadataFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError('');

    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please select a valid CSV file for ASIN metadata');
      return;
    }

    onMetadataFileUpload(file);
    event.target.value = '';
  };

  const handlePBIFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError('');

    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please select a valid CSV file for PowerBI data');
      return;
    }

    onPBIFileUpload(file);
    event.target.value = '';
  };

  const isComparisonMode = scenario === 'comparison';

  return (
    <div className="w-full max-w-2xl text-center">
      <div className="flex gap-4 justify-center flex-wrap">
        {!isComparisonMode && (
          <label className={`flex-1 min-w-[200px] flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide border cursor-pointer transition-colors ${!filesUploaded.metadata ? 'border-[#64D7BE] hover:bg-[#64D7BE] hover:text-white' : 'border-green-500 bg-green-50'}`}>
            <Upload className="w-8 h-8" />
            <span className="mt-2 text-sm">
              {filesUploaded.metadata ? '✓ Metadata uploaded' : '1. Select ASIN metadata (.csv)'}
            </span>
            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleMetadataFileChange}
              disabled={filesUploaded.metadata}
            />
          </label>
        )}

        {isComparisonMode && (
          <label className={`flex-1 min-w-[200px] flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide border cursor-pointer transition-colors ${!filesUploaded.orders ? 'border-[#64D7BE] hover:bg-[#64D7BE] hover:text-white' : 'border-green-500 bg-green-50'}`}>
            <Upload className="w-8 h-8" />
            <span className="mt-2 text-sm">
              {filesUploaded.orders ? '✓ Orders uploaded' : '1. Select orders file (.txt)'}
            </span>
            <input
              type="file"
              className="hidden"
              accept=".txt"
              onChange={handleOrderFileChange}
              disabled={filesUploaded.orders}
            />
          </label>
        )}

        <label className={`flex-1 min-w-[200px] flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide border cursor-pointer transition-colors ${!filesUploaded.pbi ? 'border-[#64D7BE] hover:bg-[#64D7BE] hover:text-white' : 'border-green-500 bg-green-50'}`}>
          <Upload className="w-8 h-8" />
          <span className="mt-2 text-sm">
            {filesUploaded.pbi ? '✓ PBI data uploaded' : `${isComparisonMode ? '2' : '2'}. Select PowerBI data (.csv)`}
          </span>
          <input
            type="file"
            className="hidden"
            accept=".csv"
            onChange={handlePBIFileChange}
            disabled={filesUploaded.pbi}
          />
        </label>
      </div>
      {error && (
        <div className="mt-2 flex items-center justify-center text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};