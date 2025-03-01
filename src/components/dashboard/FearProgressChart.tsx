import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface FearAssessment {
  date: string;
  socialAnxiety?: number;
  publicSpeaking?: number;
  heights?: number;
  rejection?: number;
  [key: string]: any;
}

interface FearProgressChartProps {
  data: FearAssessment[];
}

const FearProgressChart: React.FC<FearProgressChartProps> = ({ data }) => {
  // Transform the data for the chart if needed
  const chartData = data.map(assessment => {
    const entry: any = {
      date: new Date(assessment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    
    // Add all fear scores to the entry
    Object.keys(assessment).forEach(key => {
      if (key !== 'date') {
        entry[key] = assessment[key];
      }
    });
    
    return entry;
  });

  // Get unique fear types
  const fearTypes = Object.keys(data[0] || {}).filter(key => key !== 'date');

  // Colors for different fear types
  const colorMap: { [key: string]: string } = {
    socialAnxiety: '#6366f1',
    publicSpeaking: '#f97316',
    heights: '#e11d48',
    rejection: '#8b5cf6',
    water: '#0ea5e9',
    confined: '#10b981',
    risk: '#eab308',
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis 
          dataKey="date" 
          stroke="currentColor"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="currentColor"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          domain={[0, 10]}
          ticks={[0, 2, 4, 6, 8, 10]}
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '8px',
            backgroundColor: 'var(--tooltip-bg, white)',
            color: 'var(--tooltip-color, black)',
            border: '1px solid var(--border-color, lightgray)'
          }} 
        />
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
        {fearTypes.map((fear) => (
          <Line
            key={fear}
            type="monotone"
            dataKey={fear}
            stroke={colorMap[fear] || '#888888'}
            activeDot={{ r: 8 }}
            name={fear.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default FearProgressChart;
