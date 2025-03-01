import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface Activity {
  id: string;
  name: string;
  date: string;
  category?: string;
  notes: string;
  difficulty?: string;
  fearType?: string;
  difficultyLevel?: string;
}

interface ActivityLogProps {
  activities: Activity[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ activities }) => {
  // Sort activities by date (newest first)
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string, difficultyLevel: string) => {
    if (!difficulty && !difficultyLevel) {
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }

    if (difficultyLevel) {
      switch (difficultyLevel.toLowerCase()) {
        case 'beginner':
          return 'bg-green-100 text-green-800 hover:bg-green-200';
        case 'intermediate':
          return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
        case 'advanced':
          return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
        default:
          return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      }
    }

    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'advanced':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // Get category badge color
  const getCategoryColor = (category: string, fearType: string) => {
    if (!category) {
      category = fearType;
    }
    
    switch (category.toLowerCase()) {
      case 'heights':
      case 'height':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'social':
      case 'social-anxiety':
        return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
      case 'water':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'confined':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'risk':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'public-speaking':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'rejection':
        return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedActivities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                No activities recorded yet. Start your courage journey!
              </TableCell>
            </TableRow>
          ) : (
            sortedActivities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">
                  {new Date(activity.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </TableCell>
                <TableCell>{activity.name}</TableCell>
                <TableCell>
                  <Badge className={getCategoryColor(activity.category, activity.fearType)}>
                    {activity.category || activity.fearType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getDifficultyColor(activity.difficulty, activity.difficultyLevel)}>
                    {activity.difficulty || activity.difficultyLevel}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate text-sm text-gray-500">
                          {activity.notes}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-md">
                        <p>{activity.notes}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ActivityLog;
