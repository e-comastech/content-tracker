import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import Papa, { ParseError } from 'papaparse';
import { ProductData } from '../types';

interface Client {
  name: string;
  sourceUrl: string;
}

interface ClientSelectorProps {
  onClientSelect: (client: Client) => void;
  onSourceDataLoaded: (data: ProductData[]) => void;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  onClientSelect,
  onSourceDataLoaded,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingSource, setIsLoadingSource] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract the sheet ID from the full URL
  const SHEET_ID = '1BPerEt9xtrm4rT_oedPbUBMT6vOIlyZTeMaaKOAVnTA';
  const MASTER_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoadingClients(true);
    setError(null);

    try {
      const response = await fetch(MASTER_SHEET_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch client list');
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error('Unable to access the sheet. Please make sure it\'s shared with "Anyone with the link can view" access.');
      }

      const csvText = await response.text();
      if (csvText.toLowerCase().includes('<!doctype html>')) {
        throw new Error('Received HTML instead of CSV. Please check sheet sharing settings.');
      }

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const clientData = results.data.map((row: any) => ({
            name: row['Client Name'],
            sourceUrl: row['Source of Truth URL']
          })).filter(client => client.name && client.sourceUrl);

          if (clientData.length === 0) {
            setError('No valid clients found in the master sheet');
          } else {
            setClients(clientData);
          }
          setIsLoadingClients(false);
        },
        error: (error: ParseError) => {
          setError(`Failed to parse client list: ${error.message}`);
          setIsLoadingClients(false);
        }
      });
    } catch (err) {
      setError(`Failed to load client list: ${(err as Error).message}`);
      setIsLoadingClients(false);
    }
  };

  const validateSourceData = (data: ProductData[]) => {
    if (!data || data.length === 0) {
      throw new Error('No valid data found in the source file');
    }

    // Get all available headers from the first row
    const availableHeaders = Object.keys(data[0] || {}).map(header => header.trim().toLowerCase());
    console.log('Client source available headers:', availableHeaders);

    const requiredFields = ['asin', 'marketplace'];
    const missingFields = requiredFields.filter(field => 
      !availableHeaders.includes(field.toLowerCase())
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields in source file: ${missingFields.join(', ')}. Available fields: ${availableHeaders.join(', ')}`);
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

  const handleClientChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const client = clients.find(c => c.name === event.target.value);
    if (!client) return;

    setSelectedClient(client);
    onClientSelect(client);
    setError(null);
    setIsLoadingSource(true);

    try {
      // Convert the view/edit URL to an export URL
      const sourceUrl = new URL(client.sourceUrl);
      const urlParts = sourceUrl.pathname.split('/');
      const sheetId = urlParts[urlParts.indexOf('d') + 1];
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

      const response = await fetch(exportUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch source data for ${client.name}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error(`Unable to access the source sheet for ${client.name}. Please make sure it's shared with "Anyone with the link can view" access.`);
      }

      const csvText = await response.text();
      if (csvText.toLowerCase().includes('<!doctype html>')) {
        throw new Error(`Received HTML instead of CSV for ${client.name}. Please check sheet sharing settings.`);
      }

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            console.log('Client source parsed data first row:', results.data[0]);
            const validData = validateSourceData(results.data as ProductData[]);
            onSourceDataLoaded(validData);
            setIsLoadingSource(false);
          } catch (err) {
            setError((err as Error).message);
            setIsLoadingSource(false);
          }
        },
        error: (error: ParseError) => {
          setError(`Failed to parse source data: ${error.message}`);
          setIsLoadingSource(false);
        },
        transformHeader: (header: string) => {
          // Normalize headers: trim whitespace and convert to standard format
          const normalizedHeader = header.trim().replace(/\s+/g, '');
          console.log(`Client source header transformation: "${header}" -> "${normalizedHeader}"`);
          return normalizedHeader;
        }
      });
    } catch (err) {
      setError(`Failed to load source data: ${(err as Error).message}`);
      setIsLoadingSource(false);
    }
  };

  if (isLoadingClients) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mb-2 mx-auto text-brand-400 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="relative">
        <select
          className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
          onChange={handleClientChange}
          value={selectedClient?.name || ''}
          disabled={isLoadingSource}
        >
          <option value="">Select a client...</option>
          {clients.map((client) => (
            <option key={client.name} value={client.name}>
              {client.name}
            </option>
          ))}
        </select>

        {isLoadingSource && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-lg">
            <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
          </div>
        )}
      </div>

      {selectedClient && !error && !isLoadingSource && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          ✓ Source data loaded for {selectedClient.name}
        </div>
      )}
    </div>
  );
}; 