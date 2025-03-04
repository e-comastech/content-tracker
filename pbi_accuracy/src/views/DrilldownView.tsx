import React, { useState, useMemo } from 'react';
import { DataFilters } from '../components/DataFilters';
import { PBIDataTable } from '../components/PBIDataTable';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { AsinMetadata, PBIData } from '../types/data';
import { getUniqueValues } from '../utils/dataProcessing';

interface DrilldownViewProps {
  metadata: AsinMetadata[];
  pbiData: PBIData[];
  filesUploaded: {
    metadata: boolean;
    pbi: boolean;
  };
}

export const DrilldownView: React.FC<DrilldownViewProps> = ({
  metadata,
  pbiData,
  filesUploaded,
}) => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedProductType, setSelectedProductType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const allFilesUploaded = filesUploaded.metadata && filesUploaded.pbi;

  // Memoize filter options to prevent unnecessary recalculations
  const brands = useMemo(() => getUniqueValues(metadata, 'brand'), [metadata]);
  const categories = useMemo(() => getUniqueValues(metadata, 'category'), [metadata]);
  const clients = useMemo(() => getUniqueValues(metadata, 'client'), [metadata]);
  const subcategories = useMemo(() => getUniqueValues(metadata, 'subcategory'), [metadata]);
  const productTypes = useMemo(() => getUniqueValues(metadata, 'product-type'), [metadata]);

  // Memoize filtered data to prevent unnecessary recalculations
  const filteredData = useMemo(() => {
    return pbiData.filter((item) => {
      const metadataItem = metadata.find(m => m.asin === item.ASIN);
      if (!metadataItem) return false;

      return (
        (!selectedBrand || metadataItem.brand === selectedBrand) &&
        (!selectedCategory || metadataItem.category === selectedCategory) &&
        (!selectedClient || metadataItem.client === selectedClient) &&
        (!selectedSubcategory || metadataItem.subcategory === selectedSubcategory) &&
        (!selectedProductType || metadataItem['product-type'] === selectedProductType)
      );
    });
  }, [
    pbiData, 
    metadata, 
    selectedBrand, 
    selectedCategory, 
    selectedClient, 
    selectedSubcategory, 
    selectedProductType
  ]);

  return (
    <>
      {isLoading && <LoadingOverlay />}

      {allFilesUploaded && !isLoading && (
        <>
          <DataFilters
            brands={brands}
            categories={categories}
            clients={clients}
            subcategories={subcategories}
            productTypes={productTypes}
            selectedBrand={selectedBrand}
            selectedCategory={selectedCategory}
            selectedClient={selectedClient}
            selectedSubcategory={selectedSubcategory}
            selectedProductType={selectedProductType}
            onBrandChange={setSelectedBrand}
            onCategoryChange={setSelectedCategory}
            onClientChange={setSelectedClient}
            onSubcategoryChange={setSelectedSubcategory}
            onProductTypeChange={setSelectedProductType}
          />

          <PBIDataTable
            data={filteredData}
            metadata={metadata}
          />
        </>
      )}
    </>
  );
};