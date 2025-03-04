import React from 'react';

interface DataFiltersProps {
  orderStatuses?: string[];
  brands?: string[];
  categories?: string[];
  clients?: string[];
  subcategories?: string[];
  productTypes?: string[];
  selectedStatus?: string;
  selectedBrand?: string;
  selectedCategory?: string;
  selectedClient?: string;
  selectedSubcategory?: string;
  selectedProductType?: string;
  onStatusChange?: (value: string) => void;
  onBrandChange?: (value: string) => void;
  onCategoryChange?: (value: string) => void;
  onClientChange?: (value: string) => void;
  onSubcategoryChange?: (value: string) => void;
  onProductTypeChange?: (value: string) => void;
}

export const DataFilters: React.FC<DataFiltersProps> = ({
  orderStatuses = [],
  brands = [],
  categories = [],
  clients = [],
  subcategories = [],
  productTypes = [],
  selectedStatus = '',
  selectedBrand = '',
  selectedCategory = '',
  selectedClient = '',
  selectedSubcategory = '',
  selectedProductType = '',
  onStatusChange = () => {},
  onBrandChange = () => {},
  onCategoryChange = () => {},
  onClientChange = () => {},
  onSubcategoryChange = () => {},
  onProductTypeChange = () => {},
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {orderStatuses.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#64D7BE] focus:ring-[#64D7BE]"
          >
            <option value="">All</option>
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      )}

      {clients.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client
          </label>
          <select
            value={selectedClient}
            onChange={(e) => onClientChange(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#64D7BE] focus:ring-[#64D7BE]"
          >
            <option value="">All</option>
            {clients.map((client) => (
              <option key={client} value={client}>
                {client}
              </option>
            ))}
          </select>
        </div>
      )}

      {brands.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand
          </label>
          <select
            value={selectedBrand}
            onChange={(e) => onBrandChange(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#64D7BE] focus:ring-[#64D7BE]"
          >
            <option value="">All</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
      )}

      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#64D7BE] focus:ring-[#64D7BE]"
          >
            <option value="">All</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      {subcategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subcategory
          </label>
          <select
            value={selectedSubcategory}
            onChange={(e) => onSubcategoryChange(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#64D7BE] focus:ring-[#64D7BE]"
          >
            <option value="">All</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>
        </div>
      )}

      {productTypes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Type
          </label>
          <select
            value={selectedProductType}
            onChange={(e) => onProductTypeChange(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#64D7BE] focus:ring-[#64D7BE]"
          >
            <option value="">All</option>
            {productTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};