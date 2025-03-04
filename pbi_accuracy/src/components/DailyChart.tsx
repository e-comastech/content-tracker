import React, { useRef, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import { OrderData } from '../types/data';
import { formatNumber } from '../utils/formatters';
import { aggregateByDate } from '../utils/dataProcessing';

interface DailyChartProps {
  data: OrderData[];
}

export const DailyChart: React.FC<DailyChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [showUnits, setShowUnits] = useState(true);

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => aggregateByDate(data), [data]);

  const handleExportChart = async () => {
    if (chartRef.current) {
      try {
        const dataUrl = await toPng(chartRef.current);
        const link = document.createElement('a');
        link.download = 'daily-sales-chart.png';
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Error exporting chart:', error);
      }
    }
  };

  const formatTooltip = (value: number, name: string) => {
    if (name === 'total') {
      return `€${formatNumber(value)}`;
    }
    return formatNumber(value);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Daily Sales</h3>
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={showUnits}
                onChange={(e) => setShowUnits(e.target.checked)}
                className="form-checkbox h-4 w-4 text-[#64D7BE]"
              />
              <span className="ml-2 text-sm text-gray-600">Show Units</span>
            </label>
          </div>
        </div>
        <button
          onClick={handleExportChart}
          className="flex items-center px-3 py-1 text-sm text-[#64D7BE] hover:text-[#50c5ac]"
        >
          <Download className="w-4 h-4 mr-1" />
          Export PNG
        </button>
      </div>
      <div ref={chartRef} className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" tickFormatter={(value) => `€${formatNumber(value)}`} />
            {showUnits && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={formatNumber}
              />
            )}
            <Tooltip formatter={formatTooltip} />
            <Legend />
            <Bar
              dataKey="total"
              name="Sales (EUR)"
              fill="#64D7BE"
              yAxisId="left"
            />
            {showUnits && (
              <Bar
                dataKey="units"
                name="Units"
                fill="#94A3B8"
                yAxisId="right"
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};