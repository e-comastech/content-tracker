import React, { useState, useEffect, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ScenarioSelector } from './components/ScenarioSelector';
import { ComparisonView } from './views/ComparisonView';
import { DrilldownView } from './views/DrilldownView';
import { OrderData, AsinMetadata, PBIData } from './types/data';
import { processFileData, processMetadataFile, processPBIData } from './utils/dataProcessing';
import { useUser } from '../../src/contexts/UserContext';
import { LoginPage } from '../../src/components/LoginPage';

function App() {
  const { user } = useUser();
  const [scenario, setScenario] = useState<'comparison' | 'drilldown'>('comparison');
  const [data, setData] = useState<OrderData[]>([]);
  const [metadata, setMetadata] = useState<AsinMetadata[]>([]);
  const [pbiData, setPBIData] = useState<PBIData[]>([]);
  const [error, setError] = useState<string>('');
  const [filesUploaded, setFilesUploaded] = useState({
    metadata: false,
    orders: false,
    pbi: false
  });

  const handleMetadataFileUpload = useCallback(async (file: File) => {
    try {
      setError('');
      const processedMetadata = await processMetadataFile(file);
      setMetadata(processedMetadata);
      setFilesUploaded(prev => ({ ...prev, metadata: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process metadata file';
      setError(errorMessage);
      console.error('Error processing metadata file:', error);
    }
  }, []);

  const handleOrderFileUpload = useCallback(async (file: File) => {
    try {
      setError('');
      const processedData = await processFileData(file);
      setData(processedData);
      setFilesUploaded(prev => ({ ...prev, orders: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process order file';
      setError(errorMessage);
      console.error('Error processing file:', error);
    }
  }, []);

  const handlePBIFileUpload = useCallback(async (file: File) => {
    try {
      setError('');
      const processedPBIData = await processPBIData(file);
      setPBIData(processedPBIData);
      setFilesUploaded(prev => ({ ...prev, pbi: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process PBI file';
      setError(errorMessage);
      console.error('Error processing PBI file:', error);
    }
  }, []);

  const handleRestart = useCallback(() => {
    setData([]);
    setMetadata([]);
    setPBIData([]);
    setError('');
    setFilesUploaded({
      metadata: false,
      orders: false,
      pbi: false
    });
  }, []);

  // Clean up memory when component unmounts
  useEffect(() => {
    return () => {
      // Clear large data objects when component unmounts
      setData([]);
      setMetadata([]);
      setPBIData([]);
    };
  }, []);

  useEffect(() => {
    // Check theme on mount
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  if (!user) {
    return <LoginPage onLogin={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img
                  className="h-8 w-auto"
                  src="/cct-logo.png"
                  alt="PBI Data Accuracy"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col items-center">
            <ScenarioSelector
              scenario={scenario}
              onScenarioChange={setScenario}
            />
            <div className="w-full flex justify-end mb-4">
              <button
                onClick={handleRestart}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Reset Analysis
              </button>
            </div>
            <FileUpload
              onOrderFileUpload={handleOrderFileUpload}
              onMetadataFileUpload={handleMetadataFileUpload}
              onPBIFileUpload={handlePBIFileUpload}
              scenario={scenario}
              filesUploaded={filesUploaded}
            />
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                {error}
              </div>
            )}
          </div>

          {scenario === 'comparison' && (
            <ComparisonView
              data={data}
              pbiData={pbiData}
              filesUploaded={{
                orders: filesUploaded.orders,
                pbi: filesUploaded.pbi
              }}
            />
          )}

          {scenario === 'drilldown' && (
            <DrilldownView
              metadata={metadata}
              pbiData={pbiData}
              filesUploaded={{
                metadata: filesUploaded.metadata,
                pbi: filesUploaded.pbi
              }}
            />
          )}
        </div>
      </main>
      <footer className="bg-white dark:bg-gray-800 shadow mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} E-Comas. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;