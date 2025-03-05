import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { Activity } from '@/models/ActivityTypes';

// Define the profile data interface
export interface ProfileData {
  full_name: string;
  avatar_url?: string | null;
  date_of_birth?: string | null;
  key_fears?: string[] | null;
  experience_level?: string | null;
  challenge_intensity?: string | null;
  notification_preferences?: Record<string, any> | null;
  learning_style?: string | null;
  bio?: string | null;
  location?: string | null;
  profile_completed?: boolean;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  signIn: (email: string, password: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  updatePassword: (password: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  updateProfile: (userData: Partial<ProfileData>) => Promise<{
    success: boolean;
    error?: string;
  }>;
  getUserProfile: () => Promise<{
    data: ProfileData | null;
    error: string | null;
  }>;
  createProfileForUser: () => Promise<{
    data: ProfileData | null;
    error: string | null;
  }>;
  deleteAccount: () => Promise<{
    success: boolean;
    error?: string;
    warning?: string;
  }>;
  profileCompletionPercentage: number;
  addActivityToJourney: (activity: Activity) => Promise<{
    success: boolean;
    error?: string;
  }>;
  getUserActivities: () => Promise<{
    data: Activity[];
    error?: string;
  }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        
        // Add timeout for initial session fetch
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session fetch timed out')), 8000); // Increased timeout
        });
        
        // Race the promises
        const result = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as { data: { session: Session | null } };
        
        setSession(result.data.session);
        setUser(result.data.session?.user ?? null);
        
        // If we have a session, ensure we have a profile
        if (result.data.session?.user) {
          try {
            // Check if profile exists
            const { data: profileData, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', result.data.session.user.id)
              .single();
              
            if (profileError && profileError.code === 'PGRST116') {
              // No profile found, create one
              await createProfileForUser();
            }
          } catch (profileCheckError) {
            console.error('Error checking for profile during initial session:', profileCheckError);
            // Don't fail the auth process for profile errors
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        toast({
          title: 'Authentication error',
          description: 'There was a problem retrieving your session. Please refresh the page.',
          variant: 'destructive',
        });
        // Ensure we set user and session to null on error
        setSession(null);
        setUser(null);
      } finally {
        // Always set loading to false to prevent getting stuck
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        // Update session and user state immediately to prevent UI flicker
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'PASSWORD_RECOVERY') {
          setIsLoading(false);
          navigate('/reset-password');
          return;
        }
        
        // When a user signs in, ensure their profile is properly set up
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          setIsLoading(true);
          console.log('User signed in or token refreshed, checking profile...');
          
          // Check if this is a new user that needs to be redirected to onboarding
          const userData = session.user.user_metadata;
          if (userData && userData.is_new_user === true) {
            // Clear the flag so they're not redirected again
            try {
              await supabase.auth.updateUser({
                data: { is_new_user: false }
              });
              
              // Redirect to onboarding
              setIsLoading(false);
              navigate('/onboarding');
              return;
            } catch (error) {
              console.error('Error updating new user flag:', error);
              // Continue with profile check even if this fails
            }
          }
          
          try {
            // Set a timeout for profile check - reduced to 5 seconds for faster loading
            const profileCheckPromise = new Promise<void>(async (resolve) => {
              try {
                // Get the user profile with a single attempt for faster loading
                const { data, error } = await supabase
                  .from('user_profiles')
                  .select('*')
                  .eq('user_id', session.user.id)
                  .single();
                
                // If error and not "no rows returned" error, log it
                if (error && error.code !== 'PGRST116') {
                  console.error('Error checking user profile:', error);
                }
                
                // If no profile exists, create one
                if (!data || error?.code === 'PGRST116') {
                  console.log('No profile found for user, creating one...');
                  try {
                    await createProfileForUser();
                  } catch (createError) {
                    console.error('Error creating profile:', createError);
                    // Don't throw, just log the error
                  }
                } 
                // If profile exists but avatar_url is missing, sync it from user metadata
                else if (session.user.user_metadata?.avatar_url && !data.avatar_url) {
                  console.log('Syncing avatar_url from user metadata to profile...');
                  try {
                    await supabase
                      .from('user_profiles')
                      .update({ avatar_url: session.user.user_metadata.avatar_url })
                      .eq('user_id', session.user.id);
                  } catch (updateError) {
                    console.error('Error syncing avatar to profile:', updateError);
                    // Don't throw, just log the error
                  }
                }
                // If avatar_url exists in profile but not in user metadata, sync it to user metadata
                else if (data.avatar_url && !session.user.user_metadata?.avatar_url) {
                  console.log('Syncing avatar_url from profile to user metadata...');
                  try {
                    await supabase.auth.updateUser({
                      data: { avatar_url: data.avatar_url }
                    });
                  } catch (updateError) {
                    console.error('Error syncing avatar to user metadata:', updateError);
                    // Don't throw, just log the error
                  }
                }
                resolve();
              } catch (error) {
                console.error('Error in profile check:', error);
                resolve(); // Resolve anyway to prevent hanging
              }
            });
            
            const timeoutPromise = new Promise<void>((_, reject) => {
              setTimeout(() => reject(new Error('Profile check timed out')), 5000); // Reduced timeout to 5 seconds
            });
            
            // Race the promises
            await Promise.race([profileCheckPromise, timeoutPromise]).catch(error => {
              console.error('Profile check error:', error);
              // Don't throw, just log the error
            });
          } catch (error) {
            console.error('Error handling user profile on sign in:', error);
            // Don't show toast for profile errors to prevent confusion
          } finally {
            // Always set loading to false to prevent getting stuck
            setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          // For sign out, ensure we clear the state
          setSession(null);
          setUser(null);
          setIsLoading(false);
        } else {
          // For other events, ensure loading is set to false
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error.message);
        return { success: false, error: error.message };
      }

      if (data?.user) {
        return { success: true };
      } else {
        return { success: false, error: 'An unexpected error occurred' };
      }
    } catch (error: any) {
      console.error('Sign in exception:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      // Create the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            is_new_user: true, // Flag to identify new users for onboarding
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error.message);
        return { success: false, error: error.message };
      }

      console.log('User signed up successfully:', data);
      
      // The profile will be created when the user signs in
      // via the auth state change listener
      
      return { success: true };
    } catch (error) {
      console.error('Unexpected error in signUp:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear session and user states
      setSession(null);
      setUser(null);
      
      navigate('/');
    } catch (error: any) {
      console.error('Sign out error:', error.message);
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Reset password (send reset email)
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Reset password error:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Reset password exception:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Update password
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Update password error:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Update password exception:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Update user profile
  const updateProfile = async (profileData: Partial<ProfileData>) => {
    try {
      if (!user) {
        console.error('Cannot update profile: No user is logged in');
        return { success: false, error: 'No user is logged in' };
      }

      console.log('Updating profile for user:', user.id);
      console.log('Profile data to update:', profileData);
      
      // Add updated_at timestamp
      const dataToUpdate = {
        ...profileData,
        updated_at: new Date().toISOString(),
      };
      
      // Update the profile in the database
      const { error } = await supabase
        .from('user_profiles')
        .update(dataToUpdate)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Profile updated successfully');
      
      // If avatar_url is being updated, also update user metadata
      if (profileData.avatar_url) {
        console.log('Updating user metadata with new avatar URL:', profileData.avatar_url);
        
        const { error: updateError } = await supabase.auth.updateUser({
          data: { avatar_url: profileData.avatar_url }
        });
        
        if (updateError) {
          console.error('Error updating user metadata with avatar URL:', updateError);
          // Don't return error here, as the profile update was successful
        } else {
          console.log('User metadata updated with new avatar URL');
        }
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error in updateProfile:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Get user profile data
  const getUserProfile = async () => {
    try {
      if (!user) {
        console.error('Cannot get user profile: No user is logged in');
        return { data: null, error: 'No user is logged in' };
      }

      console.log('Getting user profile for user:', user.id);
      
      // Set a timeout to prevent getting stuck indefinitely - reduced to 5 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timed out')), 5000);
      });
      
      // Create the actual fetch promise with simplified logic
      const fetchPromise = new Promise(async (resolve) => {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (error) {
            console.error('Error getting user profile:', error);
            
            // If profile doesn't exist, create one
            if (error.code === 'PGRST116') {
              console.log('No profile found, creating one...');
              const result = await createProfileForUser();
              resolve(result);
              return;
            }
            
            resolve({ data: null, error: error.message });
            return;
          }

          console.log('Retrieved user profile:', data);
          
          // If no data was returned but also no error, create a profile
          if (!data) {
            console.log('No profile data returned, creating one...');
            const result = await createProfileForUser();
            resolve(result);
            return;
          }
          
          // Simple avatar synchronization - only if really needed
          if (user.user_metadata?.avatar_url && !data.avatar_url) {
            console.log('Syncing avatar_url from user metadata to profile');
            // Just update the returned data without waiting for DB update
            data.avatar_url = user.user_metadata.avatar_url;
            
            // Fire and forget update
            supabase
              .from('user_profiles')
              .update({ avatar_url: user.user_metadata.avatar_url })
              .eq('user_id', user.id)
              .then(result => {
                if (result.error) {
                  console.error('Error updating profile with avatar:', result.error);
                }
              });
          }

          resolve({ data, error: null });
        } catch (error) {
          console.error('Unexpected error in getUserProfile fetch:', error);
          resolve({ data: null, error: 'An unexpected error occurred' });
        }
      });
      
      // Race the fetch against the timeout
      try {
        return await Promise.race([fetchPromise, timeoutPromise]) as {
          data: ProfileData | null;
          error: string | null;
        };
      } catch (raceError) {
        console.error('Profile fetch race error:', raceError);
        // If timeout wins the race, return a friendly error
        return { 
          data: null, 
          error: raceError instanceof Error ? raceError.message : 'Profile fetch timed out' 
        };
      }
    } catch (error) {
      console.error('Unexpected error in getUserProfile:', error);
      return { data: null, error: 'An unexpected error occurred' };
    }
  };

  // Create a new profile for the user if one doesn't exist
  const createProfileForUser = async () => {
    try {
      if (!user) {
        console.error('Cannot create profile: No user is logged in');
        return { data: null, error: 'No user is logged in' };
      }

      console.log('Creating new profile for user:', user.id);
      
      // Set a timeout to prevent getting stuck indefinitely - reduced for better performance
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile creation timed out')), 4000); // Reduced timeout
      });
      
      // Create the actual creation promise with simplified logic
      const createPromise = new Promise(async (resolve) => {
        try {
          // Get user metadata for profile initialization
          const metadata = user.user_metadata || {};
          
          // Prepare profile data with minimal required fields
          const profileData = {
            user_id: user.id,
            full_name: metadata.full_name || '',
            avatar_url: metadata.avatar_url || null,
            profile_completed: false,
            created_at: new Date().toISOString(),
          };
          
          console.log('Creating profile with data:', profileData);
          
          // Insert the new profile
          const { data, error } = await supabase
            .from('user_profiles')
            .insert(profileData)
            .select('*')
            .single();
          
          if (error) {
            console.error('Error creating user profile:', error);
            resolve({ data: null, error: error.message });
            return;
          }
          
          console.log('Profile created successfully:', data);
          resolve({ data, error: null });
        } catch (error) {
          console.error('Unexpected error in createProfileForUser execution:', error);
          resolve({ data: null, error: 'An unexpected error occurred' });
        }
      });
      
      // Race the creation against the timeout
      try {
        return await Promise.race([createPromise, timeoutPromise]) as {
          data: ProfileData | null;
          error: string | null;
        };
      } catch (raceError) {
        console.error('Profile creation race error:', raceError);
        // If timeout wins the race, return a friendly error
        return { 
          data: null, 
          error: raceError instanceof Error ? raceError.message : 'Profile creation timed out' 
        };
      }
    } catch (error) {
      console.error('Unexpected error in createProfileForUser:', error);
      return { data: null, error: 'An unexpected error occurred' };
    }
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      if (!user) {
        console.error('deleteAccount: No user found');
        return { success: false, error: 'User not authenticated' };
      }

      // Get current auth session for JWT token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) {
        console.error('deleteAccount: No access token found');
        return { success: false, error: 'Authentication token not found' };
      }

      // Call the Edge Function to delete the account
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionData.session.access_token}`
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Edge function error:', errorData);
          return { success: false, error: errorData.error || 'Failed to delete account' };
        }

        return { success: true };
      } catch (fetchError) {
        console.error('Error calling delete-account function:', fetchError);
        
        // Fallback to client-side deletion of profile data if edge function fails
        console.log('Falling back to client-side profile deletion only');
        
        // Delete user profile in the database
        console.log('Deleting profile in database...');
        
        const { error: profileDeleteError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('user_id', user.id);

        if (profileDeleteError) {
          console.error('Delete profile error:', profileDeleteError.message);
          return { success: false, error: 'Failed to delete profile: ' + profileDeleteError.message };
        }
        
        console.log('Profile deleted successfully in database');
        console.warn('NOTE: The actual auth account was not deleted due to Edge Function failure');
        
        return { 
          success: true, 
          warning: 'Only profile data was deleted. The auth account remains but is inaccessible.' 
        };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Delete account exception:', errorMessage);
      if (error instanceof Error && error.stack) {
        console.error('Error stack:', error.stack);
      }
      return { success: false, error: errorMessage };
    }
  };

  // Add activity to user's journey
  const addActivityToJourney = async (activity: Activity) => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if the user_activities table exists
      const { error: tableCheckError } = await supabase
        .from('user_activities')
        .select('id')
        .limit(1);

      // If table doesn't exist, create it
      if (tableCheckError && tableCheckError.message.includes('does not exist')) {
        console.log('Creating user_activities table...');
        // We'll use progress_tracking JSONB field in user_profiles instead
        // since we can't create tables from the client
      }

      // Get the current user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('progress_tracking')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return { success: false, error: 'Failed to fetch user profile' };
      }

      // Initialize or update progress_tracking
      let progressTracking = profileData.progress_tracking || {};
      let activities = progressTracking.activities || [];

      // Check if activity already exists
      const activityExists = activities.some((a: any) => a.id === activity.id);
      
      if (activityExists) {
        return { success: false, error: 'Activity already added to your journey' };
      }

      // Add the new activity with added date
      activities.push({
        id: activity.id,
        title: activity.title,
        imageUrl: activity.imageUrl || activity.image,
        fearCategories: activity.fearCategories,
        difficultyLevel: activity.difficultyLevel || activity.difficulty,
        added_at: new Date().toISOString(),
        status: 'planned', // planned, in_progress, completed
      });

      // Update the progress_tracking field
      progressTracking.activities = activities;

      // Update the user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ progress_tracking: progressTracking })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating progress tracking:', updateError);
        return { success: false, error: 'Failed to add activity to journey' };
      }

      toast({
        title: 'Activity Added',
        description: `${activity.title} has been added to your journey`,
        duration: 3000,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Add activity exception:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Get user activities
  const getUserActivities = async () => {
    try {
      if (!user) {
        return { data: [], error: 'User not authenticated' };
      }

      // Get the current user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('progress_tracking')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return { data: [], error: 'Failed to fetch user profile' };
      }

      // Get activities from progress_tracking
      const progressTracking = profileData.progress_tracking || {};
      const activities = progressTracking.activities || [];

      return { data: activities, error: undefined };
    } catch (error: any) {
      console.error('Get user activities exception:', error.message);
      return { data: [], error: error.message };
    }
  };

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (user) {
        const { data } = await getUserProfile();
        if (data) {
          const totalFields = 9; // total number of profile fields we're tracking
          let completedFields = 0;
          
          // Count completed fields
          if (data.full_name) completedFields++;
          if (data.avatar_url) completedFields++;
          if (data.date_of_birth) completedFields++;
          if (data.key_fears && data.key_fears.length > 0) completedFields++;
          if (data.experience_level) completedFields++;
          if (data.challenge_intensity) completedFields++;
          if (data.learning_style) completedFields++;
          if (data.bio) completedFields++;
          if (data.location) completedFields++;
          
          setProfileCompletionPercentage(Math.round((completedFields / totalFields) * 100));
        }
      }
    };
    
    checkProfileCompletion();
  }, [user]);

  const value = {
    session,
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    getUserProfile,
    createProfileForUser,
    deleteAccount,
    profileCompletionPercentage,
    addActivityToJourney,
    getUserActivities,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
