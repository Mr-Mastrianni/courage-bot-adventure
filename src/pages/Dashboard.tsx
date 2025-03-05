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
        setError(null);
        console.log('Loading dashboard data for user:', user.id);
        
        // Set a timeout to prevent getting stuck indefinitely
        const timeoutId = setTimeout(() => {
          console.error('Dashboard data loading timed out');
          setError('Loading timed out. Please refresh the page.');
          setLoading(false);
        }, 10000);
        
        // Get user profile data
        const { data: profileData, error: profileError } = await getUserProfile();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError(`Failed to load profile data: ${profileError}`);
          setLoading(false);
          clearTimeout(timeoutId);
          return;
        }
        
        if (!profileData) {
          console.error('No profile data returned');
          setError('No profile data found. Please try again.');
          setLoading(false);
          clearTimeout(timeoutId);
          return;
        }
        
        console.log('Profile data loaded:', profileData);
        setUserData(profileData);
        
        // Clear the timeout since we've successfully loaded the data
        clearTimeout(timeoutId);
        
        // Load other dashboard data here...
        // For now, we'll just use placeholder data
        
        setFearAssessments([
          { id: 1, name: 'Public Speaking', level: 7, progress: 30 },
          { id: 2, name: 'Heights', level: 8, progress: 15 },
          { id: 3, name: 'Social Situations', level: 6, progress: 45 },
        ]);
        
        setCompletedActivities([
          { id: 1, name: 'Spoke to a small group', date: '2023-05-15', type: 'challenge' },
          { id: 2, name: 'Took elevator to 20th floor', date: '2023-05-10', type: 'challenge' },
          { id: 3, name: 'Attended networking event', date: '2023-05-05', type: 'challenge' },
        ]);
        
        setRecommendations([
          { id: 1, name: 'Join a Toastmasters meeting', difficulty: 'medium', category: 'Public Speaking' },
          { id: 2, name: 'Visit an observation deck', difficulty: 'hard', category: 'Heights' },
          { id: 3, name: 'Strike up conversation with a stranger', difficulty: 'medium', category: 'Social Situations' },
        ]);
        
        setJournalEntries([
          { id: 1, title: 'My first public speech', date: '2023-05-15', content: 'Today I gave my first speech...' },
          { id: 2, title: 'Conquering the elevator', date: '2023-05-10', content: 'I finally made it to the 20th floor...' },
          { id: 3, title: 'Networking success', date: '2023-05-05', content: 'The event was actually fun...' },
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('An unexpected error occurred. Please try again.');
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Error</h1>
            <p className="text-lg text-gray-500">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
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
