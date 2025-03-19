import React, { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import Papa from 'papaparse';

interface Client {
  name: string;
  sourceUrl: string;
}

interface ClientSelectorProps {
  onClientSelect: (client: Client | null) => void;
  onSourceDataLoaded: (data: any[]) => void;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({ 
  onClientSelect,
  onSourceDataLoaded
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loadingSource, setLoadingSource] = useState(false);

  const MASTER_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1BPerEt9xtrm4rT_oedPbUBMT6vOIlyZTeMaaKOAVnTA/export?format=csv';

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(MASTER_SHEET_URL);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const clientList = results.data
              .filter((row: any) => row['Client Name'] && row['Source of Truth URL'])
              .map((row: any) => ({
                name: row['Client Name'],
                sourceUrl: row['Source of Truth URL'].replace('/edit?', '/export?format=csv&')
              }));
            setClients(clientList);
          },
          error: (error) => {
            setError('Failed to parse client list: ' + error.message);
          }
        });
      } catch (err) {
        setError('Failed to fetch client list');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleClientChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const clientName = event.target.value;
    if (!clientName) {
      setSelectedClient(null);
      onClientSelect(null);
      return;
    }

    const client = clients.find(c => c.name === clientName) || null;
    setSelectedClient(client);
    onClientSelect(client);

    if (client) {
      setLoadingSource(true);
      try {
        const response = await fetch(client.sourceUrl);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            onSourceDataLoaded(results.data);
          },
          error: (error) => {
            setError('Failed to parse source data: ' + error.message);
          }
        });
      } catch (err) {
        setError('Failed to fetch source data');
      } finally {
        setLoadingSource(false);
      }
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center text-red-800 dark:text-red-300">
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label htmlFor="client-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Client
        </label>
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
        )}
      </div>
      <div className="relative">
        <select
          id="client-select"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-brand-400 focus:border-brand-400 sm:text-sm rounded-md dark:bg-gray-700 dark:text-gray-100"
          onChange={handleClientChange}
          value={selectedClient?.name || ''}
          disabled={loading}
        >
          <option value="">Select a client...</option>
          {clients.map((client) => (
            <option key={client.name} value={client.name}>
              {client.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          {loadingSource ? (
            <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
          ) : (
            <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          )}
        </div>
      </div>
    </div>
  );
}; 