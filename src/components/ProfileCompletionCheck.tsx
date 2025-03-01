import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface ProfileCompletionCheckProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Component that checks if a user's profile is complete
 * If not, it redirects them to the onboarding flow
 */
const ProfileCompletionCheck: React.FC<ProfileCompletionCheckProps> = ({ 
  children, 
  redirectTo = '/onboarding' 
}) => {
  const { user, getUserProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user) return;

      try {
        console.log('Checking profile completion for user:', user.id);
        const { data, error } = await getUserProfile();
        
        if (error) {
          console.error('Error checking profile completion:', error);
          // If there's an error, we assume profile is incomplete
          setProfileComplete(false);
          setLoading(false);
          return;
        }
        
        console.log('Profile data:', data);
        
        // If profile has all required fields and database flag is marked as complete, we're done
        if (data?.profile_completed === true) {
          console.log('PROFILE CHECK: Profile is marked as completed in database');
          setProfileComplete(true);
          setLoading(false);
          return;
        }
        
        // Check required fields
        const requiredFields = ['full_name', 'key_fears', 'experience_level'];
        const hasRequiredFields = requiredFields.every(field => {
          const value = data?.[field as keyof typeof data];
          const isValid = value !== null && value !== undefined && 
                (typeof value !== 'string' || value.trim() !== '') &&
                (!Array.isArray(value) || value.length > 0);
          
          console.log(`Field ${field} is ${isValid ? 'valid' : 'invalid'}:`, value);
          return isValid;
        });
        
        console.log('Has all required fields:', hasRequiredFields);
        
        if (hasRequiredFields && !data?.profile_completed) {
          // If the profile has all required fields but isn't marked as complete,
          // let's update it to be marked as complete
          console.log('Marking profile as complete in database...');
          try {
            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({ profile_completed: true })
              .eq('user_id', user.id);
              
            if (updateError) {
              console.error('Error updating profile completion status:', updateError);
            } else {
              console.log('Successfully marked profile as complete in database');
              // Update the local state as well to prevent redirect
              setProfileComplete(true);
            }
          } catch (updateError) {
            console.error('Error marking profile as complete:', updateError);
          }
        }
        
        setProfileComplete(hasRequiredFields);
      } catch (error) {
        console.error('Error during profile completion check:', error);
        setProfileComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkProfileCompletion();
  }, [user, getUserProfile]);

  useEffect(() => {
    // Only trigger a redirect if the profile check has finished loading
    // and the profile is definitely not complete, and we have a user
    if (!loading && !profileComplete && user) {
      // Check if we're already on the onboarding page to prevent redirect loops
      const currentPath = window.location.pathname;
      
      // Don't redirect if we're already at the destination
      if (currentPath !== redirectTo) {
        console.log('Profile not complete, current path:', currentPath);
        console.log('Redirecting to:', redirectTo);
        navigate(redirectTo);
      } else {
        console.log('Already at', redirectTo, '- not redirecting to prevent loop');
      }
    }
  }, [loading, profileComplete, navigate, redirectTo, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Only render children if profile is complete
  return profileComplete ? <>{children}</> : null;
};

export default ProfileCompletionCheck;
