import React from 'react';
import { Moon, Sun, Monitor, CheckCircle } from 'lucide-react';
import { useTheme, ThemeMode, ColorScheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const handleModeChange = (mode: ThemeMode) => {
    setTheme({ mode: mode as ThemeMode });
  };

  const handleColorSchemeChange = (colorScheme: ColorScheme) => {
    setTheme({ colorScheme: colorScheme as ColorScheme });
  };

  const colorSchemes: { value: ColorScheme; label: string; color: string }[] = [
    { value: 'default', label: 'Default', color: 'bg-blue-500' },
    { value: 'blue', label: 'Ocean Blue', color: 'bg-blue-600' },
    { value: 'green', label: 'Forest Green', color: 'bg-green-600' },
    { value: 'purple', label: 'Lavender', color: 'bg-purple-600' },
    { value: 'orange', label: 'Sunset Orange', color: 'bg-orange-500' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 relative z-10 hover:bg-accent"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuRadioGroup value={theme.mode} onValueChange={handleModeChange}>
          <DropdownMenuRadioItem value="light" className="cursor-pointer">
            <Sun className="mr-2 h-4 w-4" />
            <span>Light</span>
            {theme.mode === 'light' && <CheckCircle className="ml-auto h-4 w-4" />}
          </DropdownMenuRadioItem>
          
          <DropdownMenuRadioItem value="dark" className="cursor-pointer">
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
            {theme.mode === 'dark' && <CheckCircle className="ml-auto h-4 w-4" />}
          </DropdownMenuRadioItem>
          
          <DropdownMenuRadioItem value="system" className="cursor-pointer">
            <Monitor className="mr-2 h-4 w-4" />
            <span>System</span>
            {theme.mode === 'system' && <CheckCircle className="ml-auto h-4 w-4" />}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Color Scheme</DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <div className="flex flex-wrap gap-1">
            {colorSchemes.map((scheme) => (
              <button
                key={scheme.value}
                onClick={() => handleColorSchemeChange(scheme.value)}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all 
                  ${scheme.color} hover:scale-110 
                  ${theme.colorScheme === scheme.value ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black ring-black dark:ring-white' : ''}`}
                title={scheme.label}
              >
                {theme.colorScheme === scheme.value && (
                  <CheckCircle className="h-3 w-3 text-white" />
                )}
              </button>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
