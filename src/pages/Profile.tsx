import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, ThemePreferences } from '../contexts/ThemeContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import Avatar from '../components/Avatar';
import ProfileCompletionIndicator from '../components/ProfileCompletionIndicator';
import FearTagSelector from '../components/FearTagSelector';
import ThemeSwitcher from '../components/personalization/ThemeSwitcher';
import { ChevronRight, ChevronDown, Palette, Layout, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';

const experienceLevels = [
  { value: 'beginner', label: 'Beginner - I\'m just starting my courage journey' },
  { value: 'intermediate', label: 'Intermediate - I\'ve faced some fears before' },
  { value: 'advanced', label: 'Advanced - I regularly push my comfort zone' },
  { value: 'expert', label: 'Expert - I help others overcome their fears' },
];

const challengeIntensities = [
  { value: 'gentle', label: 'Gentle - Small, manageable steps' },
  { value: 'moderate', label: 'Moderate - Balanced challenges' },
  { value: 'intense', label: 'Intense - Push me out of my comfort zone' },
  { value: 'extreme', label: 'Extreme - Test my limits' },
];

const learningStyles = [
  { value: 'visual', label: 'Visual - I learn best by seeing' },
  { value: 'auditory', label: 'Auditory - I learn best by hearing' },
  { value: 'reading', label: 'Reading - I learn best by reading' },
  { value: 'kinesthetic', label: 'Kinesthetic - I learn best by doing' },
];

const ageRanges = [
  { value: 'under18', label: 'Under 18' },
  { value: '18-24', label: '18-24' },
  { value: '25-34', label: '25-34' },
  { value: '35-44', label: '35-44' },
  { value: '45-54', label: '45-54' },
  { value: '55-64', label: '55-64' },
  { value: '65+', label: '65+' },
];

const Profile: React.FC = () => {
  const { user, updateProfile, getUserProfile, deleteAccount, signOut } = useAuth();
  const { theme, colorScheme } = useTheme();
  const { dashboardLayout, updateDashboardLayout } = useUserPreferences();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [keyFears, setKeyFears] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
  const [challengeIntensity, setChallengeIntensity] = useState<string | null>(null);
  const [learningStyle, setLearningStyle] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [expandedSection, setExpandedSection] = useState<string | null>('basic');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    async function getProfile() {
      try {
        setLoading(true);
        
        // Set email from auth user
        setEmail(user.email || '');
        
        // Try to get full name from user metadata first
        if (user.user_metadata?.fullName) {
          setFullName(user.user_metadata.fullName);
        }
        
        if (user.user_metadata?.avatar_url) {
          setAvatarUrl(user.user_metadata.avatar_url);
        }
        
        // Get profile data from user_profiles table using the new method
        const { data, error } = await getUserProfile();
          
        if (error) {
          console.error('Error fetching profile', error);
          throw new Error(error);
        }
        
        if (data) {
          setFullName(data.full_name || '');
          setAvatarUrl(data.avatar_url || null);
          setAgeRange(data.age_range || null);
          setKeyFears(data.key_fears || []);
          setExperienceLevel(data.experience_level || null);
          setChallengeIntensity(data.challenge_intensity || null);
          setLearningStyle(data.learning_style || null);
          setBio(data.bio || '');
          setLocation(data.location || '');
        }
      } catch (error) {
        console.error('Error loading user data!', error);
        setMessage({ 
          text: 'Failed to load profile data. Please try again later.', 
          type: 'error' 
        });
      } finally {
        setLoading(false);
      }
    }
    
    getProfile();
  }, [user, navigate, getUserProfile]);
  
  async function handleUpdateProfile() {
    try {
      setLoading(true);
      setMessage({ text: '', type: '' });
      
      if (!user) {
        navigate('/login');
        return;
      }
      
      if (!fullName.trim()) {
        setMessage({ text: 'Full name is required', type: 'error' });
        setLoading(false);
        return;
      }
      
      const { success, error } = await updateProfile({
        full_name: fullName.trim(),
        avatar_url: avatarUrl,
        age_range: ageRange,
        key_fears: keyFears.length > 0 ? keyFears : null,
        experience_level: experienceLevel,
        challenge_intensity: challengeIntensity,
        learning_style: learningStyle,
        bio: bio.trim() || null,
        location: location.trim() || null,
      });
      
      if (!success) {
        throw new Error(error || 'Failed to update profile');
      }
      
      setMessage({ 
        text: 'Profile updated successfully!', 
        type: 'success' 
      });
    } catch (error: unknown) {
      console.error('Error updating profile!', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error updating profile. Please try again.';
      
      setMessage({ 
        text: errorMessage, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }
  
  // Handle account deletion
  async function handleDeleteAccount() {
    try {
      setLoading(true);
      setMessage({ text: '', type: '' });
      
      if (!user) {
        navigate('/login');
        return;
      }
      
      if (deleteConfirmText !== 'DELETE') {
        setMessage({ 
          text: 'Please type DELETE to confirm account deletion', 
          type: 'error' 
        });
        setLoading(false);
        return;
      }
      
      const { success, error, warning } = await deleteAccount();
      
      if (!success) {
        throw new Error(error || 'Failed to delete account');
      }
      
      if (warning) {
        // Show warning if only profile data was deleted
        toast({
          title: 'Account partially deleted',
          description: 'Your profile data has been deleted, but full account deletion requires administrator action. Please contact support.',
          variant: 'destructive'
        });
      } else {
        // Show success message for full account deletion
        toast({
          title: 'Account deleted',
          description: 'Your account has been successfully deleted.',
        });
      }
      
      // Explicitly perform a full sign out process
      try {
        // Clear any local storage
        localStorage.removeItem('supabase.auth.token');
        
        // Sign out from Supabase
        await signOut();
        
        // Force navigation to home page
        window.location.href = '/';
      } catch (signOutError) {
        console.error('Error during sign-out after account deletion:', signOutError);
        // Force navigation to home page even if sign-out fails
        window.location.href = '/';
      }
    } catch (error: unknown) {
      console.error('Error deleting account!', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error deleting account. Please try again.';
      
      setMessage({ 
        text: errorMessage, 
        type: 'error' 
      });
      setLoading(false);
    }
  }
  
  // Prepare profile data for the completion indicator
  const profileData = {
    full_name: fullName,
    avatar_url: avatarUrl,
    age_range: ageRange,
    key_fears: keyFears,
    experience_level: experienceLevel,
    challenge_intensity: challengeIntensity,
    learning_style: learningStyle,
    bio,
    location,
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 bg-background rounded-lg shadow-md my-8">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Your Profile</h1>
        
        {/* Profile Completion Indicator */}
        <ProfileCompletionIndicator profile={profileData} />
        
        {/* Message display */}
        {message.text && (
          <div className={`p-3 mb-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}
        
        {/* Basic Information Section */}
        <div className="mb-4 border border-border rounded-lg overflow-hidden">
          <div 
            className="flex justify-between items-center p-4 bg-muted cursor-pointer"
            onClick={() => toggleSection('basic')}
          >
            <h2 className="text-lg font-medium text-foreground">Basic Information</h2>
            {expandedSection === 'basic' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
          
          {expandedSection === 'basic' && (
            <div className="p-4 space-y-4">
              <div className="mb-6 flex justify-center">
                <Avatar 
                  url={avatarUrl} 
                  size={150} 
                  onUpload={(url) => {
                    setAvatarUrl(url);
                    setMessage({ text: 'Avatar uploaded! Click Update Profile to save changes.', type: 'success' });
                  }} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={fullName || ''}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={email || ''}
                  disabled
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-500"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Email cannot be changed. This is your login email.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Age Range</label>
                <select
                  id="ageRange"
                  name="ageRange"
                  value={ageRange || ''}
                  onChange={(e) => setAgeRange(e.target.value || null)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Select an age range</option>
                  {ageRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={location || ''}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="City, Country"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Courage Profile Section */}
        <div className="mb-4 border border-border rounded-lg overflow-hidden">
          <div 
            className="flex justify-between items-center p-4 bg-muted cursor-pointer"
            onClick={() => toggleSection('courage')}
          >
            <h2 className="text-lg font-medium text-foreground">Courage Profile</h2>
            {expandedSection === 'courage' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
          
          {expandedSection === 'courage' && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Key Fears</label>
                <FearTagSelector
                  selectedFears={keyFears}
                  onChange={setKeyFears}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Select or enter fears you want to overcome
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Experience Level</label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={experienceLevel || ''}
                  onChange={(e) => setExperienceLevel(e.target.value || null)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Select your experience level</option>
                  {experienceLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Challenge Intensity Preference</label>
                <select
                  id="challengeIntensity"
                  name="challengeIntensity"
                  value={challengeIntensity || ''}
                  onChange={(e) => setChallengeIntensity(e.target.value || null)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Select challenge intensity</option>
                  {challengeIntensities.map((intensity) => (
                    <option key={intensity.value} value={intensity.value}>
                      {intensity.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Learning Style</label>
                <select
                  id="learningStyle"
                  name="learningStyle"
                  value={learningStyle || ''}
                  onChange={(e) => setLearningStyle(e.target.value || null)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Select your learning style</option>
                  {learningStyles.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* UI Personalization Section */}
        <div className="mb-4 border border-border rounded-lg overflow-hidden">
          <div 
            className="flex justify-between items-center p-4 bg-muted cursor-pointer"
            onClick={() => toggleSection('personalization')}
          >
            <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Palette size={18} />
              UI Personalization
            </h2>
            {expandedSection === 'personalization' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
          
          {expandedSection === 'personalization' && (
            <div className="p-4 space-y-6">
              {/* Theme Settings */}
              <div>
                <h3 className="text-md font-medium text-foreground mb-2">Theme Settings</h3>
                <div className="p-4 bg-muted/50 rounded-md">
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">App Theme</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Current theme: <span className="font-medium capitalize">{theme}</span></span>
                        <ThemeSwitcher />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Choose between light, dark, or system theme
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Color Scheme</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Current scheme: <span className="font-medium capitalize">{colorScheme}</span></span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Change color scheme in the theme switcher
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Dashboard Layout */}
              <div>
                <h3 className="text-md font-medium text-foreground mb-2 flex items-center gap-2">
                  <Layout size={16} /> 
                  Dashboard Layout
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Customize your dashboard view and widget preferences.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Dashboard View
                    </label>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => updateDashboardLayout({...dashboardLayout, viewMode: 'grid'})}
                        className={`px-3 py-2 border rounded-md text-sm ${dashboardLayout.viewMode === 'grid' 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-background text-muted-foreground border-border hover:bg-muted'}`}
                      >
                        Grid View
                      </button>
                      <button 
                        onClick={() => updateDashboardLayout({...dashboardLayout, viewMode: 'list'})}
                        className={`px-3 py-2 border rounded-md text-sm ${dashboardLayout.viewMode === 'list' 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-background text-muted-foreground border-border hover:bg-muted'}`}
                      >
                        List View
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Widget Visibility
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="showActivity"
                          name="showActivity"
                          checked={dashboardLayout.widgets.activity.visible}
                          onChange={() => updateDashboardLayout({
                            ...dashboardLayout,
                            widgets: {
                              ...dashboardLayout.widgets,
                              activity: {
                                ...dashboardLayout.widgets.activity,
                                visible: !dashboardLayout.widgets.activity.visible
                              }
                            }
                          })}
                          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <label htmlFor="showActivity" className="ml-2 block text-sm text-foreground">
                          Show Activity Tracker
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="showProgress"
                          name="showProgress"
                          checked={dashboardLayout.widgets.progress.visible}
                          onChange={() => updateDashboardLayout({
                            ...dashboardLayout,
                            widgets: {
                              ...dashboardLayout.widgets,
                              progress: {
                                ...dashboardLayout.widgets.progress,
                                visible: !dashboardLayout.widgets.progress.visible
                              }
                            }
                          })}
                          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <label htmlFor="showProgress" className="ml-2 block text-sm text-foreground">
                          Show Progress Charts
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="showRecommended"
                          name="showRecommended"
                          checked={dashboardLayout.widgets.recommended.visible}
                          onChange={() => updateDashboardLayout({
                            ...dashboardLayout,
                            widgets: {
                              ...dashboardLayout.widgets,
                              recommended: {
                                ...dashboardLayout.widgets.recommended,
                                visible: !dashboardLayout.widgets.recommended.visible
                              }
                            }
                          })}
                          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <label htmlFor="showRecommended" className="ml-2 block text-sm text-foreground">
                          Show Recommended Activities
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* About Me Section */}
        <div className="mb-4 border border-border rounded-lg overflow-hidden">
          <div 
            className="flex justify-between items-center p-4 bg-muted cursor-pointer"
            onClick={() => toggleSection('about')}
          >
            <h2 className="text-lg font-medium text-foreground">About Me</h2>
            {expandedSection === 'about' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
          
          {expandedSection === 'about' && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={bio || ''}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Tell us a bit about yourself"
                  rows={4}
                ></textarea>
              </div>
            </div>
          )}
        </div>
        
        {/* Account Management Section */}
        <div className="mb-4 border border-border rounded-lg overflow-hidden">
          <div 
            className="flex justify-between items-center p-4 bg-muted cursor-pointer"
            onClick={() => toggleSection('account')}
          >
            <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              Account Management
            </h2>
            {expandedSection === 'account' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
          
          {expandedSection === 'account' && (
            <div className="p-4 space-y-4">
              <div className="bg-red-50 p-4 rounded-md border border-red-200">
                <h3 className="text-lg font-semibold text-red-700 mb-2">Delete Account</h3>
                <p className="text-sm text-red-600 mb-4">
                  Warning: This action cannot be undone. Deleting your account will permanently remove all your data, including profile information, fear assessments, progress data, and journal entries.
                </p>
                
                {import.meta.env.DEV && (
                  <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 mb-4">
                    <p className="text-sm text-yellow-800 font-medium">
                      Development Mode Notice:
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      You are running in development mode. Full account deletion requires a deployed Supabase Edge Function.
                      In development mode, only your profile data will be deleted, but your authentication record will remain.
                      Please deploy the Edge Function in <code className="bg-yellow-100 px-1 rounded">supabase/functions/delete-account</code> for complete account deletion.
                    </p>
                  </div>
                )}
                
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Delete My Account
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-red-700">
                      To confirm deletion, please type DELETE in the field below:
                    </p>
                    <input
                      type="text"
                      id="deleteConfirmText"
                      name="deleteConfirmText"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="w-full p-2 border border-red-300 rounded focus:ring-red-500 focus:border-red-500"
                      placeholder="Type DELETE to confirm"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={loading || deleteConfirmText !== 'DELETE'}
                        className={`px-4 py-2 bg-red-500 text-white rounded transition-colors ${
                          deleteConfirmText !== 'DELETE' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
                        }`}
                      >
                        {loading ? 'Deleting...' : 'Confirm Deletion'}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={handleUpdateProfile}
          disabled={loading}
          className="w-full p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 text-lg font-medium"
        >
          {loading ? 'Saving...' : 'Update Profile'}
        </button>
      </div>
    </div>
  );
};

export default Profile;
