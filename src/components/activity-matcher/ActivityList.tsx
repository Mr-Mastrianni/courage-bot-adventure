import React from 'react';
import { useActivityMatcher } from '@/contexts/ActivityMatcherContext';
import { Activity } from '@/models/ActivityTypes';
import ActivityCard from './ActivityCard';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowDownCircle, HeartHandshake, MapPin, Clock, DollarSign } from 'lucide-react';
import { difficultyColors, difficultyLabels, costLabels, timeCommitmentLabels } from '@/data/activities';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ActivityListProps {
  className?: string;
  viewMode?: 'grid' | 'list';
}

const ActivityList: React.FC<ActivityListProps> = ({ 
  className = '',
  viewMode = 'grid' 
}) => {
  const { filteredActivities, activeFilters } = useActivityMatcher();
  const [selectedActivity, setSelectedActivity] = React.useState<Activity | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  // Function to handle viewing activity details
  const handleViewDetails = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsDialogOpen(true);
  };
  
  // Function to close activity details dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  
  // Helper function to format location display for the details view
  const formatLocationDisplay = (activity: Activity): string => {
    if (activity.locations.length === 0) return 'Online';
    
    return activity.locations.map(loc => {
      let display = loc.name;
      if (loc.country !== 'USA') {
        display += `, ${loc.country}`;
      } else if (loc.state) {
        display += `, ${loc.state}`;
      }
      return display;
    }).join(' • ');
  };
  
  // Helper to get location display names
  const getLocationDisplay = (activity: Activity): string => {
    if (activity.locations.length === 0) return 'Online';
    if (activity.locations.length === 1) return activity.locations[0].name;
    
    return `${activity.locations[0].name} +${activity.locations.length - 1} more`;
  };
  
  // Render empty state if no activities are found
  if (filteredActivities.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
        <AlertCircle size={48} className="text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No activities found</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {activeFilters.fearCategories.length > 0 || Object.values(activeFilters).some(v => v !== null && v !== undefined)
            ? "Try adjusting your filters to see more activities."
            : "Try selecting different fear categories or preferences to find matching activities."}
        </p>
        <Button variant="default" onClick={() => {}}>
          <HeartHandshake size={16} className="mr-2" />
          Get Personalized Recommendations
        </Button>
      </div>
    );
  }
  
  return (
    <div className={className}>
      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredActivities.map((activity) => (
            <ActivityCard 
              key={activity.id}
              activity={activity}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
      
      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <div 
              key={activity.id}
              className="flex flex-col sm:flex-row border rounded-lg overflow-hidden hover:border-primary/20 transition-colors"
            >
              {/* Image (show only on desktop) */}
              <div className="sm:w-48 sm:h-auto h-40 relative">
                <img 
                  src={activity.image} 
                  alt={activity.title} 
                  className="w-full h-full object-cover"
                />
                
                {/* Difficulty badge */}
                <div className="absolute top-2 right-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColors[activity.difficulty]}`}>
                    {difficultyLabels[activity.difficulty]}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 p-4 flex flex-col">
                <div className="mb-2">
                  <h3 className="font-bold">{activity.title}</h3>
                  
                  {/* Fear categories */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activity.fearCategories.map((fear) => (
                      <span 
                        key={fear}
                        className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-foreground dark:bg-primary/20"
                      >
                        {fear}
                      </span>
                    ))}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow mb-3 line-clamp-2">
                  {activity.description}
                </p>
                
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {/* Location */}
                  <div className="flex items-center">
                    <MapPin size={14} className="mr-1" />
                    {getLocationDisplay(activity)}
                  </div>
                  
                  {/* Time commitment */}
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    {timeCommitmentLabels[activity.timeCommitment]}
                  </div>
                  
                  {/* Cost */}
                  <div className="flex items-center">
                    <DollarSign size={14} className="mr-1" />
                    {costLabels[activity.cost]}
                  </div>
                </div>
                
                <Button 
                  size="sm"
                  className="self-start"
                  onClick={() => handleViewDetails(activity)}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Activity Details Dialog */}
      {selectedActivity && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedActivity.title}</DialogTitle>
              <DialogDescription>
                {selectedActivity.fearCategories.join(', ')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="relative h-[200px] -mx-6 mt-2">
              <img 
                src={selectedActivity.image} 
                alt={selectedActivity.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-4 my-4">
              {/* Description */}
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm">{selectedActivity.description}</p>
              </div>
              
              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Difficulty</h4>
                  <p className="text-sm">{selectedActivity.difficulty}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Cost</h4>
                  <p className="text-sm">{selectedActivity.cost}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Time Commitment</h4>
                  <p className="text-sm">{selectedActivity.timeCommitment.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Environment</h4>
                  <p className="text-sm">{selectedActivity.indoor ? 'Indoor' : 'Outdoor'}</p>
                </div>
              </div>
              
              {/* Location */}
              <div>
                <h4 className="text-sm font-medium mb-1">Location</h4>
                <p className="text-sm">{formatLocationDisplay(selectedActivity)}</p>
              </div>
              
              {/* Benefits */}
              <div>
                <h4 className="text-sm font-medium mb-1">Benefits</h4>
                <p className="text-sm">{selectedActivity.benefits}</p>
              </div>
              
              {/* Safety information */}
              <div className="bg-muted p-3 rounded-md">
                <h4 className="text-sm font-medium mb-1 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  Safety Information
                </h4>
                <p className="text-sm">{selectedActivity.safety}</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Close
              </Button>
              <Button>
                <HeartHandshake size={16} className="mr-2" />
                Add to My Journey
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ActivityList;
