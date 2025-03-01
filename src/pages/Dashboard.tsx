import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import ProgressChart from '@/components/dashboard/ProgressChart';
import FearStatusCard from '@/components/dashboard/FearStatusCard';
import ActivityList from '@/components/dashboard/ActivityList';
import JournalEntries from '@/components/dashboard/JournalEntries';
import RecommendedActivities from '@/components/dashboard/RecommendedActivities';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import ProfileCompletionCheck from '@/components/ProfileCompletionCheck';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState<any>(null);
  const [fearAssessments, setFearAssessments] = useState<any[]>([]);
  const [completedActivities, setCompletedActivities] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, getUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        console.log('Loading dashboard data for user:', user.id);
        
        // Get user profile data
        const { data: profileData, error: profileError } = await getUserProfile();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Failed to load profile data');
          setLoading(false);
          return;
        }
        
        console.log('Fetched profile data:', profileData);
        
        // Set up user data with real profile data
        const dashboardData = {
          ...profileData,
          name: profileData?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email,
          memberSince: new Date(user.created_at).toISOString().split('T')[0],
        };
        
        setUserData(dashboardData);
        
        // Fetch fear assessments (in a real app, this would come from your database)
        // For now, we'll just use an empty array
        setFearAssessments([]);
        
        // Fetch completed activities
        // For now, we'll just use an empty array
        setCompletedActivities([]);
        
        // Fetch recommendations
        // For now, we'll just use an empty array
        setRecommendations([]);
        
        // Fetch journal entries
        // For now, we'll just use an empty array
        setJournalEntries([]);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, getUserProfile]);

  const handleCreateJournal = () => {
    toast({
      title: "Coming Soon",
      description: "Journal creation will be available in a future update.",
    });
  };

  const handleLogout = async () => {
    try {
      // Call the signOut function from the AuthContext
      await supabase.auth.signOut();
      
      toast({
        title: "Logged out successfully",
        description: "Redirecting to home page...",
      });
      
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <div className="grid gap-4">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-72 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileCompletionCheck redirectTo="/create-profile">
        <></>
      </ProfileCompletionCheck>
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {userData?.name || 'User'}</h1>
            <p className="text-gray-500">Member since {userData?.memberSince || 'today'}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 md:grid-cols-3 h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="journal">Journal</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Progress Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                  <CardDescription>
                    Track your courage journey over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {fearAssessments.length > 0 ? (
                    <ProgressChart data={fearAssessments} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                      <p className="text-gray-500 mb-4">No fear assessments yet</p>
                      <Button variant="outline" onClick={() => navigate('/assessment')}>
                        Take your first assessment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fears Status Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Fears Status</CardTitle>
                  <CardDescription>
                    Current status of fears you're working on
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {fearAssessments.length > 0 && fearAssessments[0].results ? (
                    <div className="space-y-4">
                      {fearAssessments[0].results.map((fear: any, index: number) => (
                        <FearStatusCard 
                          key={index}
                          fearType={fear.fear}
                          score={fear.score}
                          label={fear.label}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                      <p className="text-gray-500">No fear data available</p>
                      <Button variant="outline" className="mt-4" onClick={() => navigate('/assessment')}>
                        Take an assessment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities & Recommendations Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recently Completed Activities</CardTitle>
                  <CardDescription>
                    Activities you've finished
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {completedActivities.length > 0 ? (
                    <ActivityList activities={completedActivities.slice(0, 3)} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                      <p className="text-gray-500">No completed activities yet</p>
                      <Button variant="outline" className="mt-4" onClick={() => navigate('/activities')}>
                        Explore activities
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full" onClick={() => setActiveTab('activities')}>
                    View All Activities
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommended For You</CardTitle>
                  <CardDescription>
                    Suggested experiences to try next
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recommendations.length > 0 ? (
                    <RecommendedActivities recommendations={recommendations.slice(0, 3)} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                      <p className="text-gray-500">No recommendations available yet</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Complete your profile to get personalized recommendations
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="journal" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Your Journal</CardTitle>
                    <CardDescription>
                      Reflect on your courage journey
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={handleCreateJournal}>
                    New Entry
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {journalEntries.length > 0 ? (
                  <JournalEntries entries={journalEntries} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <h3 className="text-lg font-medium mb-2">No journal entries yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md">
                      Your journal is a place to reflect on your experiences and track your emotional journey.
                    </p>
                    <Button onClick={handleCreateJournal}>
                      Create Your First Entry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activities" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Your Activity History</CardTitle>
                  <CardDescription>
                    All the courage activities you've completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {completedActivities.length > 0 ? (
                    <ActivityList activities={completedActivities} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <h3 className="text-lg font-medium mb-2">No activities completed yet</h3>
                      <p className="text-gray-500 mb-6 max-w-md">
                        Activities help you gradually face your fears in a structured way.
                      </p>
                      <Button onClick={() => navigate('/activities')}>
                        Explore Activities
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Recommended Activities</CardTitle>
                  <CardDescription>
                    Personalized suggestions based on your profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recommendations.length > 0 ? (
                    <RecommendedActivities recommendations={recommendations} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <h3 className="text-lg font-medium mb-2">No recommendations available</h3>
                      <p className="text-gray-500 mb-6 max-w-md">
                        Complete your profile and assessments to receive personalized recommendations.
                      </p>
                      <Button onClick={() => navigate('/profile')}>
                        Update Your Profile
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
