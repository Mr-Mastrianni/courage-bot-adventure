import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 safari-fix ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md border-b shadow-sm py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a 
            href="#" 
            className="flex items-center space-x-2"
          >
            <span className={`font-bold text-2xl transition-colors ${
              isScrolled ? 'text-courage-800' : 'text-white text-shadow'
            }`}>
              Be Courageous
            </span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <a 
              href="#activities" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isScrolled 
                  ? 'text-gray-700 hover:text-courage-600' 
                  : 'text-white hover:text-white/80'
              }`}
            >
              Activities
            </a>
            <a 
              href="#videos" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isScrolled 
                  ? 'text-gray-700 hover:text-courage-600' 
                  : 'text-white hover:text-white/80'
              }`}
            >
              Videos
            </a>
            <a 
              href="#donate" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isScrolled 
                  ? 'text-gray-700 hover:text-courage-600' 
                  : 'text-white hover:text-white/80'
              }`}
            >
              Donate
            </a>
            <Button 
              size="sm" 
              className={`ml-4 ${
                isScrolled
                  ? 'bg-courage-600 hover:bg-courage-700 text-white'
                  : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20'
              }`}
            >
              Learn About Fears
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`${isScrolled ? 'text-courage-800' : 'text-white'}`}
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen 
            ? 'max-h-screen opacity-100 pb-4 bg-white border-b' 
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-2 pb-3 space-y-1 stagger-children">
          <a 
            href="#activities" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-courage-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Activities
          </a>
          <a 
            href="#videos" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-courage-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Videos
          </a>
          <a 
            href="#donate" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-courage-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Donate
          </a>
          <div className="pt-2">
            <Button 
              className="w-full bg-courage-600 hover:bg-courage-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Learn About Fears
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
