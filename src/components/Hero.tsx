
import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

const Hero = () => {
  const heroTextRef = useRef<HTMLHeadingElement>(null);
  
  useEffect(() => {
    if (!heroTextRef.current) return;
    
    const text = heroTextRef.current.innerText;
    heroTextRef.current.innerHTML = '';
    
    // Wrap each letter in a span for animation
    [...text].forEach((char, index) => {
      const span = document.createElement('span');
      span.innerText = char;
      span.style.animationDelay = `${0.05 * index}s`;
      heroTextRef.current?.appendChild(span);
    });
  }, []);

  const scrollToActivities = () => {
    const activitiesSection = document.getElementById('activities');
    if (activitiesSection) {
      activitiesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-courage-950/70 via-courage-900/50 to-courage-800/30"></div>
      </div>
      
      {/* Animated floating shapes (subtle) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-64 h-64 rounded-full bg-courage-200/10 blur-3xl animate-float" style={{ animationDelay: "0s" }}></div>
        <div className="absolute top-[40%] right-[15%] w-96 h-96 rounded-full bg-courage-300/10 blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        <div className="absolute bottom-[20%] left-[25%] w-80 h-80 rounded-full bg-courage-100/10 blur-3xl animate-float" style={{ animationDelay: "4s" }}></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs sm:text-sm font-medium rounded-full bg-white/10 backdrop-blur-sm text-white animate-fade-in">
            Face your fears. Find your strength.
          </span>
          
          <h1 
            ref={heroTextRef}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white text-shadow mb-6 hero-text"
          >
            Courage is one adventure away.
          </h1>
          
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.5s" }}>
            Push your boundaries and discover the incredible strength that lives within you. Our guided adventure experiences are designed to help you face your fears and emerge transformed.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.7s" }}>
            <Button 
              size="lg" 
              className="bg-courage-600 hover:bg-courage-700 text-white flex items-center gap-2 px-6"
            >
              Book an Adventure
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-white border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center gap-2"
              onClick={scrollToActivities}
            >
              Explore Activities
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white rounded-full h-12 w-12 flex items-center justify-center border border-white/20 bg-white/10 hover:bg-white/20"
          onClick={scrollToActivities}
        >
          <ArrowDown size={20} />
        </Button>
      </div>
    </div>
  );
};

export default Hero;
