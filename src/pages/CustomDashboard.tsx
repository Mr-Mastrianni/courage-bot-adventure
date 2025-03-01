import React, { useState, useEffect, Fragment } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useTheme } from '@/contexts/ThemeContext';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast'; // Fix toast import
import ThemeSwitcher from '@/components/personalization/ThemeSwitcher';
import DashboardPreferences from '@/components/personalization/DashboardPreferences';
import ExperienceSettings from '@/components/personalization/ExperienceSettings';
import PersonalizedRecommendations from '@/components/personalization/PersonalizedRecommendations';
import ProfileCompletionCheck from '@/components/ProfileCompletionCheck';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button'; // Import Button component
import { User } from 'lucide-react'; // Import User icon from lucide-react
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import { Settings } from 'lucide-react'; // Import Settings icon from lucide-react
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Import Popover component

// Import existing dashboard components
import FearProgressChart from '@/components/dashboard/FearProgressChart';
import ActivityLog from '@/components/dashboard/ActivityLog';
import JournalEntries from '@/components/dashboard/JournalEntries';
import RecommendedActivities from '@/components/dashboard/RecommendedActivities';

// Mock data
import { mockUserData } from '@/data/mockData';

const defaultDashboardLayout = {
  viewMode: 'grid' as 'grid' | 'list',
  widgets: {
    progress: { visible: true, position: 1, size: 'large' as 'small' | 'medium' | 'large' },
    activity: { visible: true, position: 2, size: 'medium' as 'small' | 'medium' | 'large' },
    journal: { visible: true, position: 3, size: 'medium' as 'small' | 'medium' | 'large' },
    recommended: { visible: true, position: 4, size: 'medium' as 'small' | 'medium' | 'large' },
    personalized: { visible: true, position: 5, size: 'large' as 'small' | 'medium' | 'large' },
  },
};

const CustomDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(mockUserData);
  const { user } = useAuth();
  const { preferences, dashboardLayout, setUserPreferences, updateDashboardLayout } = useUserPreferences();
  const { theme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Dashboard mounted with:", { 
      user,
      dashboardLayout: dashboardLayout || 'undefined',
      preferences: preferences || 'undefined'
    });
    
    // If we have a user but no preferences, create default ones
    if (user && (!preferences || !dashboardLayout)) {
      console.log("No preferences found for user, initializing defaults");
      setUserPreferences({
        theme: 'light',
        dashboardLayout: defaultDashboardLayout,
        experiencePreferences: {
          difficulty: 'beginner',
          focus: ['general'],
          pacing: 'moderate',
          guidance: 'balanced',
        },
        notificationPreferences: {
          email: true,
          push: true,
          frequency: 'weekly',
        }
      });
    }
  }, [user, preferences, dashboardLayout, setUserPreferences]);

  // Load user data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log("Loading dashboard data...");
        
        // Here we would fetch real user data in a production app
        // For now, we'll just use the mock data with a timeout to simulate loading
        setTimeout(() => {
          setIsLoading(false);
          console.log("Dashboard data loaded");
        }, 800);

        // Apply personalization to the mock data based on user preferences
        if (preferences?.experiencePreferences?.focus?.length > 0) {
          console.log("Applying preference filters to recommendations with focus:", preferences.experiencePreferences.focus);
          
          // Normalize fear types for comparison
          const normalizedFocus = preferences.experiencePreferences.focus.map(focus => focus.toLowerCase().replace(/-/g, ''));
          console.log("Normalized focus:", normalizedFocus);
          
          // Filter recommendations to focus on user's focus areas
          const focusedRecommendations = mockUserData.recommendations.filter(rec => {
            // Normalize the recommendation fear type
            const normalizedFearType = rec.fearType.toLowerCase().replace(/-/g, '');
            console.log(`Checking recommendation with fear type: ${rec.fearType} (normalized: ${normalizedFearType})`);
            
            // Check if the fear type is included in the user's focus
            return normalizedFocus.includes(normalizedFearType) || normalizedFocus.includes('general');
          });
          
          console.log("Filtered recommendations:", focusedRecommendations);
          
          // Sort recommendations by difficulty based on user's preference
          const sortedRecommendations = [...focusedRecommendations].sort((a, b) => {
            const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
            const userPref = preferences.experiencePreferences.difficulty;
            
            // If user prefers beginner, prioritize beginner activities
            if (userPref === 'beginner') {
              return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
            }
            // If user prefers advanced, prioritize more advanced activities
            else if (userPref === 'advanced' || userPref === 'expert') {
              return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
            }
            // For intermediate, keep a mix but slightly favor intermediate
            return 0;
          });

          setUserData({
            ...mockUserData,
            recommendations: sortedRecommendations,
          });
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast({
          title: "Error loading dashboard",
          description: "There was a problem loading your data. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    loadDashboardData();
  }, [toast, preferences?.experiencePreferences]);

  // Fallback if profile data or preferences haven't loaded yet
  useEffect(() => {
    if (!isLoading && (!preferences || !preferences.experiencePreferences)) {
      console.log("Dashboard loaded but preferences not found, initializing defaults");
      
      // Create default preferences if they don't exist
      setUserPreferences({
        theme: 'light',
        dashboardLayout: defaultDashboardLayout,
        experiencePreferences: {
          focus: [],
          difficulty: 'Beginner',
          pacing: 'Steady'
        },
        notificationPreferences: {
          email: true,
          push: true
        }
      });
      
      toast({
        title: "Using default settings",
        description: "We've set up some default preferences for you. You can customize them in your profile.",
      });
    }
  }, [isLoading, preferences, setUserPreferences, toast]);

  // Render a widget based on its ID and size
  const renderWidget = (widgetKey: string, size: 'small' | 'medium' | 'large') => {
    try {
      const sizeClasses = {
        small: 'col-span-1',
        medium: 'col-span-1 md:col-span-1',
        large: 'col-span-1 md:col-span-2',
      };

      let height = 'min-h-[300px]';
      if (size === 'small') height = 'min-h-[200px]';
      if (size === 'large') height = 'min-h-[400px]';

      switch (widgetKey) {
        case 'progress':
          return (
            <Card className={`${sizeClasses[size]} ${height}`}>
              <CardHeader>
                <CardTitle>Your Fear Progress</CardTitle>
                <CardDescription>Track your progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <FearProgressChart data={userData.fearAssessments} />
                )}
              </CardContent>
            </Card>
          );
        case 'activity':
          return (
            <Card className={`${sizeClasses[size]} ${height}`}>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Your recent courage-building activities</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <ActivityLog activities={userData.completedActivities} />
                )}
              </CardContent>
            </Card>
          );
        case 'journal':
          return (
            <Card className={`${sizeClasses[size]} ${height}`}>
              <CardHeader>
                <CardTitle>Journal Entries</CardTitle>
                <CardDescription>Your reflections on your courage journey</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <JournalEntries entries={userData.journalEntries} />
                )}
              </CardContent>
            </Card>
          );
        case 'recommended':
          return (
            <Card className={`${sizeClasses[size]} ${height}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Recommended For You</CardTitle>
                  <CardDescription>Activities based on your profile</CardDescription>
                </div>
                {!isLoading && preferences?.experiencePreferences?.focus?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {preferences.experiencePreferences.focus.map(focus => (
                      <Badge 
                        key={focus} 
                        variant="outline" 
                        className="capitalize text-xs"
                      >
                        {focus}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : (
                  <RecommendedActivities 
                    recommendations={userData.recommendations} 
                    difficultyPreference={preferences?.experiencePreferences?.difficulty}
                  />
                )}
              </CardContent>
            </Card>
          );
        case 'personalized':
          return (
            <div className={`${sizeClasses[size]} ${height}`}>
              <PersonalizedRecommendations />
            </div>
          );
        default:
          return null;
      }
    } catch (error) {
      console.error("Error rendering widget:", error);
      return (
        <Card className={`col-span-1 ${height}`}>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to render widget</CardDescription>
          </CardHeader>
          <CardContent>
            <p>There was an error rendering this widget. Please try again later.</p>
          </CardContent>
        </Card>
      );
    }
  };

  // Get visible widgets with fallback
  const getVisibleWidgets = () => {
    try {
      // If we don't have a dashboardLayout yet, use the default
      if (!dashboardLayout || !dashboardLayout.widgets) {
        console.log('Using default dashboard layout for widgets');
        return Object.entries(defaultDashboardLayout.widgets)
          .filter(([_, widget]) => widget.visible)
          .sort(([_, a], [__, b]) => a.position - b.position)
          .map(([key, widget]) => ({ key, ...widget }));
      }
      
      // Use the user's dashboard layout
      console.log('Using user dashboard layout for widgets');
      return Object.entries(dashboardLayout.widgets)
        .filter(([_, widget]) => widget && widget.visible)
        .sort(([_, a], [__, b]) => {
          // Ensure positions are numbers and provide fallbacks
          const posA = typeof a.position === 'number' ? a.position : 0;
          const posB = typeof b.position === 'number' ? b.position : 0;
          return posA - posB;
        })
        .map(([key, widget]) => ({ key, ...widget }));
    } catch (error) {
      // Log the error and fall back to default layout
      console.error('Error in getVisibleWidgets:', error);
      console.log('Falling back to default dashboard layout due to error');
      
      try {
        return Object.entries(defaultDashboardLayout.widgets)
          .filter(([_, widget]) => widget.visible)
          .sort(([_, a], [__, b]) => a.position - b.position)
          .map(([key, widget]) => ({ key, ...widget }));
      } catch (fallbackError) {
        console.error('Critical error in widget rendering fallback:', fallbackError);
        // Last resort - return empty array to prevent UI crash
        return [];
      }
    }
  };
  
  // Get widgets when needed (not on every render)
  const visibleWidgets = getVisibleWidgets();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ProfileCompletionCheck>
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.user_metadata?.fullName || 'Courageous Explorer'}!
              </p>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1 relative hover:bg-accent hover:text-accent-foreground">
                  <Settings className="h-4 w-4" />
                  <span>Dashboard Controls</span>
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary -mt-1 -mr-1"></span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 z-[90] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95" align="end" sideOffset={8}>
                <div className="bg-card rounded-lg shadow-md overflow-hidden">
                  <h3 className="text-sm font-medium p-4 border-b bg-muted/50">Dashboard Controls</h3>
                  <div className="p-2">
                    <ExperienceSettings />
                    <DashboardPreferences />
                    <Separator className="my-2" />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start gap-2 px-2 py-2 rounded-md hover:bg-accent"
                      onClick={() => navigate('/profile', { replace: true })}
                    >
                      <User className="h-[1.2rem] w-[1.2rem]" />
                      <span className="flex-1 text-left">Profile Settings</span>
                    </Button>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between px-2 py-2">
                      <span className="text-sm text-muted-foreground">Theme</span>
                      <ThemeSwitcher />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <div className="border-b">
              <TabsList className="bg-transparent w-full justify-start -mb-px">
                <TabsTrigger value="dashboard" className="rounded-none rounded-t-lg data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-4">
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="progress" className="rounded-none rounded-t-lg data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-4">
                  Progress
                </TabsTrigger>
                <TabsTrigger value="activities" className="rounded-none rounded-t-lg data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-4">
                  Activities
                </TabsTrigger>
                <TabsTrigger value="personalized" className="rounded-none rounded-t-lg data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-4">
                  Personalized
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="dashboard" className="space-y-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-[300px] w-full" />
                  <Skeleton className="h-[300px] w-full" />
                  <Skeleton className="h-[300px] w-full" />
                  <Skeleton className="h-[300px] w-full" />
                </div>
              ) : (
                <div className={`grid ${(dashboardLayout?.viewMode || 'grid') === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                  {visibleWidgets.length > 0 ? (
                    visibleWidgets.map(widget => (
                      <React.Fragment key={widget.key}>
                        {renderWidget(widget.key, widget.size)}
                      </React.Fragment>
                    ))
                  ) : (
                    <div className="col-span-full text-center p-8">
                      <p className="text-muted-foreground mb-4">No widgets are currently visible.</p>
                      <Button variant="outline" onClick={() => {
                        // Reset to default layout
                        updateDashboardLayout(defaultDashboardLayout);
                      }}>
                        Reset to Default Layout
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {renderWidget('progress', 'large')}
                <Separator />
                <div className="prose max-w-none dark:prose-invert">
                  <h3>Your Courage Journey</h3>
                  <p>This page will show more detailed progress tracking in the future update.</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="activities" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderWidget('activity', 'medium')}
                {renderWidget('recommended', 'medium')}
              </div>
            </TabsContent>
            
            <TabsContent value="personalized" className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {renderWidget('personalized', 'large')}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </ProfileCompletionCheck>
    </div>
  );
};

export default CustomDashboard;
