import React from 'react';

interface ScenarioSelectorProps {
  scenario: 'comparison' | 'drilldown';
  onScenarioChange: (scenario: 'comparison' | 'drilldown') => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenario,
  onScenarioChange,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Select Analysis Mode</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onScenarioChange('comparison')}
            className={`p-4 rounded-lg border-2 transition-all ${
              scenario === 'comparison'
                ? 'border-[#64D7BE] bg-[#64D7BE]/10'
                : 'border-gray-200 hover:border-[#64D7BE]/50'
            }`}
          >
            <h3 className="font-medium mb-2">Compare Amazon vs PBI</h3>
            <p className="text-sm text-gray-600">
              Compare sales data between Amazon and PowerBI reports.
              Required files: Orders (.txt) and PBI data (.csv)
            </p>
          </button>
          <button
            onClick={() => onScenarioChange('drilldown')}
            className={`p-4 rounded-lg border-2 transition-all ${
              scenario === 'drilldown'
                ? 'border-[#64D7BE] bg-[#64D7BE]/10'
                : 'border-gray-200 hover:border-[#64D7BE]/50'
            }`}
          >
            <h3 className="font-medium mb-2">PBI Data Analysis</h3>
            <p className="text-sm text-gray-600">
              Analyze PowerBI data with metadata filters.
              Required files: Metadata (.csv) and PBI data (.csv)
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};