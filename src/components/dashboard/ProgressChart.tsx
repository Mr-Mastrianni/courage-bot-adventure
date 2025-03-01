import React from 'react';

interface ProgressChartProps {
  data: any[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  // Simple placeholder component for now
  return (
    <div className="h-40 flex items-center justify-center">
      <p className="text-gray-500">Progress chart visualization will be implemented soon</p>
    </div>
  );
};

export default ProgressChart;
