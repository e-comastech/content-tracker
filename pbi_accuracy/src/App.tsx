import React, { useState, useEffect, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ScenarioSelector } from './components/ScenarioSelector';
import { ComparisonView } from './views/ComparisonView';
import { DrilldownView } from './views/DrilldownView';
import { OrderData, AsinMetadata, PBIData } from './types/data';
import { processFileData, processMetadataFile, processPBIData } from './utils/dataProcessing';
import { useUser } from './contexts/UserContext';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Loading } from './components/Loading';

function App() {
  const { user } = useUser();
  const [scenario, setScenario] = useState<'comparison' | 'drilldown'>('comparison');
  const [data, setData] = useState<OrderData[]>([]);
  const [metadata, setMetadata] = useState<AsinMetadata[]>([]);
  const [pbiData, setPBIData] = useState<PBIData[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
              PBI Data Accuracy
            </h1>
            
            <ScenarioSelector
              scenario={scenario}
              onScenarioChange={setScenario}
            />
            
            <div className="w-full flex justify-end mb-4">
              <button
                onClick={handleRestart}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
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
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400">
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

      <Footer />
    </div>
  );
}

export default App;