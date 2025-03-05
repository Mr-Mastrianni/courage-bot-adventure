import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Activity } from '@/models/ActivityTypes';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeartHandshake, Clock, CheckCircle, Circle, RotateCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface UserJourneyProps {
  className?: string;
}

const UserJourney: React.FC<UserJourneyProps> = ({ className = '' }) => {
  const { getUserActivities, user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await getUserActivities();
        if (error) {
          console.error('Error fetching user activities:', error);
        } else {
          setActivities(data || []);
        }
      } catch (error) {
        console.error('Exception fetching user activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user, getUserActivities]);

  // Filter activities based on active tab
  const filteredActivities = React.useMemo(() => {
    if (activeTab === 'all') return activities;
    return activities.filter(activity => activity.status === activeTab);
  }, [activities, activeTab]);

  // Get counts for each status
  const counts = React.useMemo(() => {
    return {
      all: activities.length,
      planned: activities.filter(a => a.status === 'planned').length,
      in_progress: activities.filter(a => a.status === 'in_progress').length,
      completed: activities.filter(a => a.status === 'completed').length,
    };
  }, [activities]);

  // Render loading state
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HeartHandshake className="mr-2 h-5 w-5" />
            My Journey
          </CardTitle>
          <CardDescription>Activities you've added to your courage journey</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render empty state
  if (activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HeartHandshake className="mr-2 h-5 w-5" />
            My Journey
          </CardTitle>
          <CardDescription>Activities you've added to your courage journey</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <HeartHandshake className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No activities yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start adding activities to your journey from the Activity Explorer.
          </p>
          <Button variant="default" asChild>
            <a href="/activities">Explore Activities</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <HeartHandshake className="mr-2 h-5 w-5" />
          My Journey
        </CardTitle>
        <CardDescription>Activities you've added to your courage journey</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              All <Badge variant="secondary" className="ml-2">{counts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="planned">
              Planned <Badge variant="secondary" className="ml-2">{counts.planned}</Badge>
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress <Badge variant="secondary" className="ml-2">{counts.in_progress}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed <Badge variant="secondary" className="ml-2">{counts.completed}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No activities in this category</p>
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div 
                    className="w-16 h-16 rounded-md bg-cover bg-center shrink-0" 
                    style={{ backgroundImage: `url(${activity.imageUrl})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{activity.title}</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {activity.fearCategories?.map(fear => (
                        <Badge key={fear} variant="outline">{fear}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Clock size={12} className="mr-1" />
                      Added {new Date(activity.added_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {activity.status === 'planned' && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Circle size={12} />
                        Planned
                      </Badge>
                    )}
                    {activity.status === 'in_progress' && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <RotateCcw size={12} />
                        In Progress
                      </Badge>
                    )}
                    {activity.status === 'completed' && (
                      <Badge variant="success" className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle size={12} />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <a href="/activities">Find More Activities</a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserJourney;
