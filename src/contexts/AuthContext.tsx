import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

// Define the profile data interface
interface ProfileData {
  full_name: string;
  avatar_url?: string | null;
  age_range?: string | null;
  key_fears?: string[] | null;
  experience_level?: string | null;
  challenge_intensity?: string | null;
  notification_preferences?: Record<string, any> | null;
  learning_style?: string | null;
  bio?: string | null;
  location?: string | null;
  profile_completed?: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  signUp: (email: string, password: string, userData: Partial<ProfileData>) => Promise<{
    success: boolean;
    error?: string;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  updatePassword: (newPassword: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  updateProfile: (userData: ProfileData, profileCompleted?: boolean) => Promise<{
    success: boolean;
    error?: string;
  }>;
  getUserProfile: () => Promise<{
    data: ProfileData | null;
    error?: string;
  }>;
  deleteAccount: () => Promise<{
    success: boolean;
    error?: string;
    warning?: string;
  }>;
  profileCompletionPercentage: number;
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
        const { data } = await supabase.auth.getSession();

        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
        toast({
          title: 'Authentication error',
          description: 'There was a problem retrieving your session.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        if (event === 'PASSWORD_RECOVERY') {
          navigate('/reset-password');
        } else if (event === 'SIGNED_IN') {
          // Check if this is a new user that needs to be redirected to onboarding
          const userData = session?.user?.user_metadata;
          if (userData && userData.is_new_user === true) {
            // Clear the flag so they're not redirected again
            await supabase.auth.updateUser({
              data: { is_new_user: false }
            });
            
            // Redirect to onboarding
            navigate('/onboarding');
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
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
  const signUp = async (email: string, password: string, userData: Partial<ProfileData>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            fullName: userData.fullName,
            avatar_url: userData.avatar_url || null,
            is_new_user: true, // Add a flag to identify new users
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error.message);
        return { success: false, error: error.message };
      }

      if (data?.user) {
        // Try to create user profile in the database if the table exists
        try {
          // Check if the table exists first
          const { error: tableCheckError } = await supabase
            .from('user_profiles')
            .select('id')
            .limit(1);
            
          // Only try to insert if table exists (no error from select query)
          if (!tableCheckError) {
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert([
                {
                  user_id: data.user.id,
                  full_name: userData.fullName,
                  email: email,
                  created_at: new Date().toISOString(),
                },
              ]);

            if (profileError) {
              console.error('Error creating user profile:', profileError.message);
              // Continue anyway - the auth user is created
            }
          } else {
            console.log('user_profiles table does not exist yet, skipping profile creation');
          }
        } catch (profileErr) {
          console.error('Exception creating user profile:', profileErr);
          // Continue anyway - the auth user is created
        }

        return { success: true };
      } else {
        return { success: false, error: 'An unexpected error occurred' };
      }
    } catch (error: any) {
      console.error('Sign up exception:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear any local storage or state
      localStorage.removeItem('supabase.auth.token');
      
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
  const updateProfile = async (userData: ProfileData, profileCompleted = true) => {
    try {
      if (!user) {
        console.error('updateProfile: No user found');
        return { success: false, error: 'User not authenticated' };
      }

      console.log('Updating auth metadata...');
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          fullName: userData.full_name,
          avatar_url: userData.avatar_url,
        },
      });

      if (authUpdateError) {
        console.error('Update user metadata error:', authUpdateError.message);
        return { success: false, error: authUpdateError.message };
      }
      console.log('Auth metadata updated successfully');

      // Update profile in the database
      console.log('Updating profile in database...');
      console.log('Current user ID:', user.id);
      
      const profileData = {
        user_id: user.id,
        full_name: userData.full_name,
        avatar_url: userData.avatar_url,
        age_range: userData.age_range,
        key_fears: userData.key_fears,
        experience_level: userData.experience_level,
        challenge_intensity: userData.challenge_intensity,
        notification_preferences: userData.notification_preferences,
        learning_style: userData.learning_style,
        bio: userData.bio,
        location: userData.location,
        profile_completed: profileCompleted,
        updated_at: new Date().toISOString(),
      };
      
      console.log('Profile data to save:', JSON.stringify(profileData, null, 2));
      console.log('Profile completion flag set to:', profileCompleted);
      
      const { error: profileUpdateError } = await supabase
        .from('user_profiles')
        .upsert(
          profileData,
          { onConflict: 'user_id' }
        );

      if (profileUpdateError) {
        console.error('Update profile error:', profileUpdateError.message);
        console.error('Full error object:', JSON.stringify(profileUpdateError, null, 2));
        return { success: false, error: profileUpdateError.message };
      }
      console.log('Profile updated successfully in database');

      // Refresh the session to get the updated user data
      console.log('Refreshing session...');
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.warn('Failed to refresh session:', refreshError.message);
      } else {
        console.log('Session refreshed successfully');
      }

      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Update profile exception:', errorMessage);
      if (error instanceof Error && error.stack) {
        console.error('Error stack:', error.stack);
      }
      return { success: false, error: errorMessage };
    }
  };

  // Get user profile data
  const getUserProfile = async () => {
    if (!user) return { data: null, error: new Error('No user logged in') };
    console.log('Getting user profile for user ID:', user.id);
    
    try {
      // Check if profile exists
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No profile found, creating a new one...');
          // Profile doesn't exist, create a new one
          return createProfileForUser();
        }
        throw error;
      }
      
      console.log('Profile found in database:', data);
      console.log('Profile completion status:', data.profile_completed);
      return { data, error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Get profile exception:', errorMessage);
      if (error instanceof Error && error.stack) {
        console.error('Error stack:', error.stack);
      }
      return { data: null, error: errorMessage };
    }
  };

  // Create a new profile for the user if one doesn't exist
  const createProfileForUser = async () => {
    if (!user) return { data: null, error: new Error('No user logged in') };
    
    console.log('Creating new profile for user:', user.id);
    try {
      const defaultProfile = {
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
        profile_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      console.log('Default profile data:', defaultProfile);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([defaultProfile])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating default profile:', error);
        return { data: null, error: 'Failed to create user profile' };
      }
      
      console.log('Profile created successfully:', data);
      return { data, error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Create profile exception:', errorMessage);
      return { data: null, error: errorMessage };
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
          if (data.age_range) completedFields++;
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
    deleteAccount,
    profileCompletionPercentage,
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
