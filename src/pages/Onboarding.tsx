import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/Avatar';
import FearTagSelector from '../components/FearTagSelector';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast'; // Direct import

// Step data from the profile.tsx constants
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

const Onboarding: React.FC = () => {
  const { user, updateProfile, getUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Profile state
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [keyFears, setKeyFears] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
  const [challengeIntensity, setChallengeIntensity] = useState<string | null>(null);
  const [learningStyle, setLearningStyle] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  
  useEffect(() => {
    // Check if we already have user data
    const checkUserProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        console.log('Fetching user profile on onboarding page load...');
        const { data, error } = await getUserProfile();
        
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        console.log('Profile data loaded:', data);
        
        // Pre-populate fields from existing profile data
        if (data) {
          if (data.full_name) setFullName(data.full_name);
          if (data.avatar_url) setAvatarUrl(data.avatar_url);
          if (data.age_range) setAgeRange(data.age_range);
          if (data.key_fears && Array.isArray(data.key_fears)) setKeyFears(data.key_fears);
          if (data.experience_level) setExperienceLevel(data.experience_level);
          if (data.challenge_intensity) setChallengeIntensity(data.challenge_intensity);
          if (data.learning_style) setLearningStyle(data.learning_style);
          if (data.bio) setBio(data.bio);
          if (data.location) setLocation(data.location);
          
          // If profile is already marked as complete, redirect to dashboard
          if (data.profile_completed) {
            console.log('Profile already completed, redirecting to dashboard...');
            toast({
              title: "Profile already set up",
              description: "You're all set! Redirecting to your dashboard."
            });
            navigate('/dashboard');
          }
        }
      } catch (err) {
        console.error('Error in profile check:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserProfile();
  }, [user, getUserProfile, navigate, toast]);
  
  const steps = [
    {
      title: "Welcome to Be Courageous",
      description: "Let's set up your profile to personalize your courage journey",
      component: (
        <div className="space-y-6 text-center">
          <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold">Welcome to Be Courageous!</h2>
          <p className="text-gray-600">
            We're excited to help you face your fears and grow your courage.
            Let's set up your profile in a few easy steps.
          </p>
        </div>
      ),
      isValid: () => true, // Always valid to proceed
    },
    {
      title: "Basic Information",
      description: "Tell us who you are",
      component: (
        <div className="space-y-6">
          <div className="flex justify-center mb-6">
            <Avatar 
              url={avatarUrl} 
              size={100} 
              onUpload={(url) => setAvatarUrl(url)} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="City, Country"
            />
          </div>
        </div>
      ),
      isValid: () => !!fullName.trim(), // Must have at least a name
    },
    {
      title: "Your Courage Profile",
      description: "Tell us about your fears and preferences",
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Fears *</label>
            <FearTagSelector
              selectedFears={keyFears}
              onChange={setKeyFears}
            />
            <p className="mt-1 text-xs text-gray-500">
              Select or enter fears you want to overcome
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Challenge Intensity Preference</label>
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
        </div>
      ),
      isValid: () => keyFears.length > 0 && !!experienceLevel, // Must select fears and experience level
    },
    {
      title: "Learning & Final Details",
      description: "Almost done! Tell us how you learn best",
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Learning Style</label>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Tell us a bit about yourself and why you want to build courage"
              rows={4}
            ></textarea>
          </div>
        </div>
      ),
      isValid: () => true, // These fields are optional
    },
    {
      title: "Ready to Start Your Journey",
      description: "You're all set to begin your courage journey!",
      component: (
        <div className="space-y-6 text-center">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold">Profile Completed!</h2>
          <p className="text-gray-600">
            Thanks for completing your profile. You're now ready to start your journey to becoming more courageous.
          </p>
          <p className="text-gray-600 mt-4">
            Click "Finish" to go to your personalized dashboard.
          </p>
        </div>
      ),
      isValid: () => true, // Always valid
    },
  ];
  
  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      handleFinish();
    } else if (steps[currentStep].isValid()) {
      setCurrentStep(currentStep + 1);
    } else {
      setError('Please complete all required fields before proceeding.');
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };
  
  const handleFinish = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting profile save...');
      console.log('Profile data to save:', {
        full_name: fullName.trim(),
        avatar_url: avatarUrl,
        age_range: ageRange,
        key_fears: keyFears,
        experience_level: experienceLevel,
        challenge_intensity: challengeIntensity,
        learning_style: learningStyle,
        bio: bio.trim() || null,
        location: location.trim() || null,
      });
      
      // Make sure we have a valid name
      if (!fullName.trim()) {
        setError('Full name is required');
        setLoading(false);
        return;
      }
      
      const profileData = {
        full_name: fullName.trim(),
        avatar_url: avatarUrl,
        age_range: ageRange,
        key_fears: keyFears,
        experience_level: experienceLevel,
        challenge_intensity: challengeIntensity,
        learning_style: learningStyle,
        bio: bio.trim() || null,
        location: location.trim() || null,
      };
      
      console.log('Calling updateProfile...');
      console.log('Setting profile_completed = true');
      // Explicitly set profile as completed during the onboarding process
      const { success, error } = await updateProfile(profileData, true);
      
      console.log('updateProfile result:', { success, error });
      
      if (success) {
        console.log('Profile updated successfully!');
        console.log('Profile should now be marked as completed');
        
        // Force a small delay to ensure database consistency before redirect
        setTimeout(() => {
          toast({
            title: "Onboarding completed!",
            description: "Your profile has been set up successfully.",
          });
          
          // Redirect to dashboard
          console.log('Redirecting to dashboard...');
          navigate('/dashboard');
        }, 1000);
      } else {
        throw new Error(error);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const currentStepData = steps[currentStep];
  const progress = ((currentStep) / (steps.length - 1)) * 100;
  
  if (loading && currentStep === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6 my-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Progress bar */}
        <div className="w-full bg-gray-200 h-2">
          <div 
            className="bg-blue-600 h-2 transition-all duration-300 ease-in-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="p-6">
          {/* Step header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-800">{currentStepData.title}</h1>
            <p className="text-gray-600 mt-1">{currentStepData.description}</p>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="p-3 mb-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {/* Step content */}
          <div className="my-6">
            {currentStepData.component}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center px-4 py-2 rounded ${
                currentStep === 0 
                  ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-500' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </button>
            
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                  Processing...
                </span>
              ) : (
                <>
                  {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                  {currentStep !== steps.length - 1 && <ArrowRight size={16} className="ml-2" />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
