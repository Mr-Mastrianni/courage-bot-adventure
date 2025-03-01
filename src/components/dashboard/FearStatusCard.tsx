import React from 'react';

interface FearStatusCardProps {
  fearType: string;
  score: number;
  label: string;
}

const FearStatusCard: React.FC<FearStatusCardProps> = ({ fearType, score, label }) => {
  // Get the color based on the score
  const getColor = () => {
    if (score <= 1.5) return 'bg-green-100 text-green-800';
    if (score <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const color = getColor();
  
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div>
        <h3 className="font-medium capitalize">{fearType}</h3>
        <p className="text-sm text-gray-500">Current level: {label}</p>
      </div>
      <div className={`px-3 py-1 rounded-full ${color}`}>
        {score.toFixed(1)}
      </div>
    </div>
  );
};

export default FearStatusCard;
