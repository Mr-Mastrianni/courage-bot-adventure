import React from 'react';
import { 
  ArrowUp,
  Waves,
  Ship,
  HeartPulse,
  Gauge,
  Dog,
  Users,
  Box,
  CircleDot
} from 'lucide-react';
import { FearCategory } from '@/models/ActivityTypes';

interface FearCategoryIconProps {
  category: FearCategory;
  className?: string;
}

export const FearCategoryIcon: React.FC<FearCategoryIconProps> = ({ 
  category, 
  className = ""
}) => {
  // Map fear categories to appropriate icons
  switch (category) {
    case 'heights':
      return <ArrowUp className={className} />;
    case 'water':
      return <Waves className={className} />;
    case 'ocean':
      return <Ship className={className} />;
    case 'falling':
      return <HeartPulse className={className} />; // Using HeartPulse instead of PersonFalling
    case 'speed':
      return <Gauge className={className} />;
    case 'animals':
      return <Dog className={className} />;
    case 'social':
      return <Users className={className} />;
    case 'confined':
      return <Box className={className} />;
    case 'risk':
      return <CircleDot className={className} />;
    default:
      return <CircleDot className={className} />;
  }
};
