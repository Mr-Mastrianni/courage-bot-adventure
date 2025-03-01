import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeSwitcher from "@/components/personalization/ThemeSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

// Import the logo
import logoSvg from '@/assets/images/dare-logo.svg';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully logged out.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.email) return '?';
    
    // If user has metadata with fullName, use that
    if (user.user_metadata?.fullName) {
      const names = user.user_metadata.fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    
    // Otherwise use email
    return user.email.substring(0, 2).toUpperCase();
  };

  // Define styles for navbar based on scroll position
  const navbarClasses = `
    fixed top-0 left-0 right-0 transition-all duration-300 
    ${isScrolled 
      ? 'bg-background/95 backdrop-blur-md shadow-md py-2' 
      : 'bg-background/80 backdrop-blur-sm py-3'
    } 
    z-[100]
  `;

  return (
    <header className={navbarClasses}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
              
              // Add a subtle pulse animation when logo is clicked
              const logo = e.currentTarget.querySelector('img');
              if (logo) {
                logo.classList.add('logo-pulse');
                setTimeout(() => {
                  logo.classList.remove('logo-pulse');
                }, 600);
              }
            }}
            className="flex items-center relative z-10 -ml-3 py-1"
          >
            <img 
              src={logoSvg} 
              alt="DARE: Be Courageous" 
              className="h-auto w-40 md:w-48 transition-all duration-200 hover:scale-105 navbar-logo" 
              title="Home"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isScrolled ? 'text-foreground' : 'text-white'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/activities"
              onClick={(e) => {
                e.preventDefault();
                navigate('/activities');
              }}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isScrolled ? 'text-foreground' : 'text-white'
              }`}
            >
              Activity Explorer
            </Link>
            <Link 
              to="/dashboard"
              onClick={(e) => {
                e.preventDefault();
                navigate('/dashboard');
              }}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isScrolled ? 'text-foreground' : 'text-white'
              }`}
            >
              Dashboard
            </Link>
            {user ? (
              <div className="flex items-center space-x-4 ml-4">
                <Link 
                  to="/profile"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/profile');
                  }}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isScrolled ? 'text-foreground' : 'text-white'
                  }`}
                >
                  Profile
                </Link>
                
                {/* Theme Switcher */}
                <div className="relative z-10">
                  <ThemeSwitcher />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`rounded-full p-0 h-9 w-9 ${
                        isScrolled ? 'border-border' : 'border-white/30 hover:border-white'
                      }`}
                    >
                      <Avatar className="h-9 w-9 border-2">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user.user_metadata?.fullName && (
                          <p className="font-medium">{user.user_metadata.fullName}</p>
                        )}
                        {user.email && (
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <button 
                        className="w-full flex items-center cursor-pointer" 
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/dashboard');
                          setIsMenuOpen(false);
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <button 
                        className="w-full flex items-center cursor-pointer" 
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/profile');
                          setIsMenuOpen(false);
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile Settings
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {/* Only show theme switcher in mobile dropdown */}
                    <div className="p-2 flex items-center justify-between">
                      <span className="text-sm">Theme</span>
                      <ThemeSwitcher />
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <button 
                        className="w-full flex items-center cursor-pointer text-destructive" 
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex space-x-2 ml-4">
                {isScrolled && (
                  <div className="mr-2">
                    <ThemeSwitcher />
                  </div>
                )}
                <Link 
                  to="/login"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isScrolled 
                      ? 'text-muted-foreground hover:text-foreground' 
                      : 'text-white hover:text-white/80'
                  }`}
                >
                  Sign in
                </Link>
                <Link 
                  to="/register"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isScrolled 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                      : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <div className={`${isMenuOpen ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`rounded-full p-0 h-8 w-8 mr-1 ${
                        isScrolled ? 'border-border' : 'border-white/30 hover:border-white'
                      }`}
                    >
                      <Avatar className="h-8 w-8 border-2">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/profile');
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle Menu"
              className={`relative z-20 ${isScrolled ? 'text-foreground' : 'text-white'}`}
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          <div 
            className={`md:hidden transition-all duration-300 overflow-hidden ${
              isMenuOpen 
                ? 'max-h-screen opacity-100 pb-4 bg-background border-b' 
                : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-4 pt-2 pb-3 space-y-1 stagger-children">
              <a 
                href="#about" 
                className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
              <Link 
                to="/activities" 
                className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/activities');
                  setIsMenuOpen(false);
                }}
              >
                Activity Explorer
              </Link>
              
              {user ? (
                <>
                  <Link 
                    to="/dashboard"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/dashboard');
                      setIsMenuOpen(false);
                    }}
                    className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  
                  {user.user_metadata?.fullName && (
                    <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                      Signed in as {user.user_metadata.fullName}
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <Button 
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-center py-2 px-4 rounded-md bg-red-50 hover:bg-red-100 text-red-600 font-medium"
                    >
                      Sign out
                    </Button>
                  </div>
                </>
              ) : (
                <div className="pt-2 space-y-2">
                  <Link 
                    to="/login"
                    className="block w-full text-center py-2 px-4 rounded-md border border-courage-200 text-courage-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link 
                    to="/register"
                    className="block w-full text-center py-2 px-4 rounded-md bg-courage-600 hover:bg-courage-700 text-white font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
