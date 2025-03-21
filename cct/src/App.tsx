import React, { useState, useCallback, useMemo } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LoginPage } from './components/LoginPage';
import { FileUpload } from './components/FileUpload';
import { ComparisonTable } from './components/ComparisonTable';
import { Dashboard } from './components/Dashboard';
import { OpenCasesAssistant } from './components/OpenCasesAssistant';
import { ProductData, ComparisonResult, Statistics, FieldSelection } from './types/index';
import { compareProducts } from './utils/comparison';
import { FileCheck, Settings, AlertTriangle, X, Download, Info, HelpCircle, FileOutput } from 'lucide-react';
import Papa from 'papaparse';
import { UserProvider, useUser } from './contexts/UserContext';

const AVAILABLE_FIELDS = {
  ProductTitle: 'Product Title',
  Description: 'Description',
  BulletPoint1: 'Bullet Point 1',
  BulletPoint2: 'Bullet Point 2',
  BulletPoint3: 'Bullet Point 3',
  BulletPoint4: 'Bullet Point 4',
  BulletPoint5: 'Bullet Point 5',
  Variations: 'Variations'
};

const CHANGELOG = {
  version: '2.4',
  date: '12/02/2025',
  changes: [
    'Added help documentation link',
    'Added file name display in upload sections',
    'Added CSV template download option',
    'Added data accuracy warning',
    'Improved upload section layout and information',
    'Added Open Cases Assistant for batch Excel generation'
  ]
};

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { user, setUser } = useUser();
  const [source1Data, setSource1Data] = useState<ProductData[]>([]);
  const [source2Data, setSource2Data] = useState<ProductData[]>([]);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('');
  const [showChangeLog, setShowChangeLog] = useState(false);
  const [showOpenCasesAssistant, setShowOpenCasesAssistant] = useState(false);
  const [selectedFields, setSelectedFields] = useState<FieldSelection>(() => 
    Object.keys(AVAILABLE_FIELDS).reduce((acc, field) => ({
      ...acc,
      [field]: true
    }), {})
  );
  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [statistics, setStatistics] = useState<Statistics>({
    totalProducts: 0,
    perfectMatches: 0,
    marketplaceStats: {},
    fieldStats: {},
    results: [],
  });

  const downloadTemplate = () => {
    const headers = ['ASIN', 'Marketplace', 'ProductTitle', 'Description', 'BulletPoint1', 'BulletPoint2', 'BulletPoint3', 'BulletPoint4', 'BulletPoint5', 'Variations', 'Link'];
    const csv = Papa.unparse({
      fields: headers,
      data: []
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const filteredResults = useMemo(() => {
    return selectedMarketplace
      ? comparisonResults.filter((r) => r.Marketplace === selectedMarketplace)
      : comparisonResults;
  }, [comparisonResults, selectedMarketplace]);

  const calculateStatistics = useCallback((results: ComparisonResult[]) => {
    const marketplaceStats: { [key: string]: number } = {};
    const fieldStats: { [key: string]: number } = {};
    let perfectMatches = 0;

    results.forEach((result) => {
      if (!marketplaceStats[result.Marketplace]) {
        marketplaceStats[result.Marketplace] = 0;
      }
      marketplaceStats[result.Marketplace] += result.overallMatch;

      Object.entries(result.fields).forEach(([field, data]) => {
        if (!fieldStats[field]) {
          fieldStats[field] = 0;
        }
        fieldStats[field] += data.similarity;
      });

      if (result.overallMatch >= 99.9) {
        perfectMatches++;
      }
    });

    Object.keys(marketplaceStats).forEach((marketplace) => {
      const marketplaceResults = results.filter(
        (r) => r.Marketplace === marketplace
      ).length;
      marketplaceStats[marketplace] /= marketplaceResults;
    });

    Object.keys(fieldStats).forEach((field) => {
      fieldStats[field] /= results.length;
    });

    setStatistics({
      totalProducts: results.length,
      perfectMatches,
      marketplaceStats,
      fieldStats,
      results,
    });
  }, []);

  const handleComparison = useCallback(() => {
    if (source1Data.length === 0 || source2Data.length === 0) return;

    const source1ByMarketplace = source1Data.reduce((acc, product) => {
      const key = `${product.ASIN}-${product.Marketplace}`;
      acc[key] = product;
      return acc;
    }, {} as Record<string, ProductData>);

    const results: ComparisonResult[] = [];

    source2Data.forEach((product2) => {
      const key = `${product2.ASIN}-${product2.Marketplace}`;
      const product1 = source1ByMarketplace[key];
      
      if (product1) {
        results.push(compareProducts(product1, product2, selectedFields));
      }
    });

    setComparisonResults(results);
    calculateStatistics(results);
    setShowFieldSelector(false);
    setShowWarning(false);
  }, [source1Data, source2Data, calculateStatistics, selectedFields]);

  const marketplaces = Array.from(
    new Set(comparisonResults.map((r) => r.Marketplace))
  );

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  // Main app content when authenticated
  return (
    <div className="min-h-screen bg-brand-50 flex flex-col">
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <img 
                  src="/cct-logo.png" 
                  alt="Content Comparison Tool" 
                  className="h-32 w-auto"
                  style={{ maxWidth: '600px' }}
                />
                {user && (
                  <div className="ml-4">
                    <p className="text-brand-600 font-medium">
                      Welcome, {user.firstName}!
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.email}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                {user?.picture && (
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <button
                  onClick={() => {
                    setUser(null);
                    setIsAuthenticated(false);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-brand-300 text-sm font-medium rounded-md text-brand-700 bg-white hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-400"
                >
                  Logout
                </button>
                <a
                  href="https://doc.clickup.com/14349561/d/h/dnx7t-29272/c1fb97f7b77dbcf"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open help guide in new tab"
                  className="inline-flex items-center px-4 py-2 border border-brand-300 text-sm font-medium rounded-md text-brand-700 bg-white hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-400"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help Guide
                </a>
                {marketplaces.length > 0 && (
                  <select
                    value={selectedMarketplace}
                    onChange={(e) => setSelectedMarketplace(e.target.value)}
                    className="block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-400 focus:border-brand-400 sm:text-sm rounded-md"
                  >
                    <option value="">All Marketplaces</option>
                    {marketplaces.map((marketplace) => (
                      <option key={marketplace} value={marketplace}>
                        {marketplace}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FileUpload
                onDataLoaded={setSource1Data}
                label="Upload Amazon Current Content (CSV)"
              />
              <FileUpload
                onDataLoaded={setSource2Data}
                label="Upload Source of Truth (CSV)"
              />
            </div>
            <div className="mt-4 flex flex-col items-center space-y-4">
              <button
                onClick={() => setShowFieldSelector(!showFieldSelector)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-400"
              >
                <Settings className="w-5 h-5 mr-2" />
                Select Fields to Compare
              </button>
              
              {showFieldSelector && (
                <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Select Fields to Compare</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(AVAILABLE_FIELDS).map(([key, label]) => (
                      <label key={key} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedFields[key]}
                          onChange={(e) => setSelectedFields(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          className="h-4 w-4 text-brand-400 focus:ring-brand-400 border-gray-300 rounded"
                        />
                        <span className="text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleComparison}
                disabled={source1Data.length === 0 || source2Data.length === 0 || !Object.values(selectedFields).some(v => v)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-400 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-400 disabled:bg-gray-400"
              >
                <FileCheck className="w-5 h-5 mr-2" />
                Compare Content
              </button>

              {showWarning && (
                <div className="w-full max-w-2xl bg-amber-50 border border-amber-200 rounded-lg p-4 relative">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">Data Accuracy Warning</h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>
                          Please ensure your CSV files contain accurate and up-to-date data before comparing. 
                          The quality of the comparison results depends on the accuracy of your input files.
                        </p>
                        <button
                          onClick={downloadTemplate}
                          className="mt-2 inline-flex items-center text-amber-800 hover:text-amber-900"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download CSV template
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowWarning(false)}
                      className="absolute top-4 right-4 text-amber-400 hover:text-amber-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {filteredResults.length > 0 && (
            <>
              <Dashboard stats={statistics} selectedMarketplace={selectedMarketplace} selectedFields={selectedFields} />
              <div className="flex justify-center mt-4 mb-8">
                <button
                  onClick={() => setShowOpenCasesAssistant(!showOpenCasesAssistant)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-brand-400 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-400 shadow-lg transform transition-all duration-200 hover:scale-105"
                >
                  <FileOutput className="w-6 h-6 mr-2" />
                  {showOpenCasesAssistant ? 'Close Cases Assistant' : 'Open Cases Assistant'}
                </button>
              </div>
              {showOpenCasesAssistant ? (
                <OpenCasesAssistant 
                  results={filteredResults} 
                  selectedFields={selectedFields}
                  selectedMarketplace={selectedMarketplace}
                />
              ) : (
                <div className="bg-white shadow rounded-lg">
                  <ComparisonTable results={filteredResults} selectedFields={selectedFields} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-2">
            <p className="text-center text-gray-500">
              Made with love ❤️ and lots of coffee ☕️ by{' '}
              <a 
                href="https://www.linkedin.com/in/claudiu-clement/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-brand-400 hover:text-brand-500"
              >
                Clau
              </a>
              . Copyright e-Comas SARL.
            </p>
            <div className="relative group">
              <div className="flex items-center space-x-1 text-sm text-gray-400">
                <span>v{CHANGELOG.version}</span>
                <Info className="w-4 h-4 cursor-help" />
                <span className="text-gray-300">•</span>
                <span>Last updated: {CHANGELOG.date}</span>
              </div>
              <div className="absolute bottom-full mb-2 p-3 bg-gray-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-64">
                <p className="font-medium mb-2">What's new in v{CHANGELOG.version}:</p>
                <ul className="list-disc list-inside space-y-1">
                  {CHANGELOG.changes.map((change, index) => (
                    <li key={index} className="text-gray-300">{change}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </GoogleOAuthProvider>
  );
}

export default App;