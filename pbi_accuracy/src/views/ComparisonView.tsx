import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DataFilters } from '../components/DataFilters';
import { DataTable } from '../components/DataTable';
import { DailyChart } from '../components/DailyChart';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { DataSummary } from '../components/DataSummary';
import { OrderData, PBIData, ComparisonData } from '../types/data';
import { compareData, getUniqueValues, aggregateByAsin, aggregateByMarketplace } from '../utils/dataProcessing';

interface ComparisonViewProps {
  data: OrderData[];
  pbiData: PBIData[];
  filesUploaded: {
    orders: boolean;
    pbi: boolean;
  };
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  data,
  pbiData,
  filesUploaded,
}) => {
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Memoize the comparison calculation to prevent unnecessary recalculations
  const calculateComparison = useCallback(() => {
    if (filesUploaded.orders && filesUploaded.pbi && data.length > 0 && pbiData.length > 0) {
      try {
        return compareData(data, pbiData);
      } catch (error) {
        console.error('Error calculating comparison:', error);
        return [];
      }
    }
    return [];
  }, [filesUploaded.orders, filesUploaded.pbi, data, pbiData]);

  useEffect(() => {
    if (filesUploaded.orders && filesUploaded.pbi) {
      setIsLoading(true);
      
      // Use setTimeout to prevent UI blocking and allow for loading state to render
      const timeoutId = setTimeout(() => {
        try {
          const comparison = calculateComparison();
          setComparisonData(comparison);
        } catch (error) {
          console.error('Error in comparison calculation:', error);
        } finally {
          setIsLoading(false);
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [filesUploaded, calculateComparison]);

  // Memoize filtered data to prevent unnecessary recalculations
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return !selectedStatus || item['order-status'] === selectedStatus;
    });
  }, [data, selectedStatus]);

  // Memoize aggregations to prevent unnecessary recalculations
  const asinTotals = useMemo(() => aggregateByAsin(filteredData), [filteredData]);
  const marketplaceTotals = useMemo(() => aggregateByMarketplace(filteredData), [filteredData]);

  const allFilesUploaded = filesUploaded.orders && filesUploaded.pbi;

  return (
    <>
      {isLoading && <LoadingOverlay />}

      {allFilesUploaded && !isLoading && comparisonData && (
        <>
          <DataSummary comparisonData={comparisonData} />
          
          <DataFilters
            orderStatuses={getUniqueValues(data, 'order-status')}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DataTable
              data={filteredData}
              asinTotals={asinTotals}
              marketplaceTotals={marketplaceTotals}
              comparisonData={comparisonData}
            />
            <DailyChart data={filteredData} />
          </div>
        </>
      )}
    </>
  );
};