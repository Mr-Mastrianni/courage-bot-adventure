import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'default';

export interface ThemePreferences {
  mode: ThemeMode;
  colorScheme: ColorScheme;
}

interface ThemeContextType {
  theme: ThemePreferences;
  currentMode: 'light' | 'dark'; // Actual active mode
  colorScheme: ColorScheme;
  setTheme: (preferences: Partial<ThemePreferences>) => Promise<void>;
}

const defaultTheme: ThemePreferences = {
  mode: 'system',
  colorScheme: 'default',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<ThemePreferences>(defaultTheme);
  const [currentMode, setCurrentMode] = useState<'light' | 'dark'>('light');

  // Load theme preferences from database
  useEffect(() => {
    const loadThemePreferences = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('theme_preferences')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading theme preferences:', error);
          return;
        }

        if (data && data.theme_preferences) {
          setThemeState(data.theme_preferences as ThemePreferences);
        }
      } catch (error) {
        console.error('Error loading theme preferences:', error);
      }
    };

    loadThemePreferences();
  }, [user]);

  // Calculate actual mode based on system preference and user preference
  useEffect(() => {
    const determineMode = () => {
      if (theme.mode === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setCurrentMode(systemPrefersDark ? 'dark' : 'light');
      } else {
        setCurrentMode(theme.mode);
      }
    };

    determineMode();

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => determineMode();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme.mode]);

  // Apply theme to document
  useEffect(() => {
    // Apply dark/light mode
    if (currentMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply color scheme
    document.documentElement.setAttribute('data-color-scheme', theme.colorScheme);
  }, [currentMode, theme.colorScheme]);

  // Save theme to database
  const setTheme = async (preferences: Partial<ThemePreferences>) => {
    if (!user) return;

    const newTheme = { ...theme, ...preferences };
    setThemeState(newTheme);

    try {
      await supabase
        .from('user_profiles')
        .update({ theme_preferences: newTheme })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, currentMode, colorScheme: theme.colorScheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
