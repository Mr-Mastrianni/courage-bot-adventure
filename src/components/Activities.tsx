import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InfoIcon, Mountain, Waves, Cloud, Wind, Map, Compass } from "lucide-react";
import '../styles/micro-interactions.css';
import { ActivityIcon, FearIcon, ExploreIcon } from './CustomIcons';

// Define fear categories
type FearCategory = 'heights' | 'water' | 'ocean' | 'falling' | 'speed' | 'animals';

const getCategoryIcon = (category: FearCategory) => {
  switch (category) {
    case 'heights':
      return (
        <div className="flex items-center justify-center w-4 h-4 bg-growth-800 rounded-full">
          <Mountain size={12} className="text-growth-300" />
        </div>
      );
    case 'water':
      return (
        <div className="flex items-center justify-center w-4 h-4 bg-blue-900 rounded-full">
          <Waves size={12} className="text-blue-300" />
        </div>
      );
    case 'ocean':
      return (
        <div className="flex items-center justify-center w-4 h-4 bg-cyan-900 rounded-full">
          <Waves size={12} className="text-cyan-300" />
        </div>
      );
    case 'falling':
      return (
        <div className="flex items-center justify-center w-4 h-4 bg-slate-800 rounded-full">
          <Cloud size={12} className="text-slate-300" />
        </div>
      );
    case 'speed':
      return (
        <div className="flex items-center justify-center w-4 h-4 bg-amber-900 rounded-full">
          <Wind size={12} className="text-amber-300" />
        </div>
      );
    case 'animals':
      return (
        <div className="flex items-center justify-center w-4 h-4 bg-emerald-900 rounded-full">
          <Compass size={12} className="text-emerald-300" />
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center w-4 h-4 bg-growth-800 rounded-full">
          <Map size={12} className="text-growth-300" />
        </div>
      );
  }
};

const getCategoryColor = (category: FearCategory) => {
  switch (category) {
    case 'heights':
      return 'from-growth-800 to-growth-950';
    case 'water':
      return 'from-blue-800 to-blue-950';
    case 'ocean':
      return 'from-cyan-800 to-cyan-950';
    case 'falling':
      return 'from-indigo-800 to-indigo-950';
    case 'speed':
      return 'from-amber-800 to-amber-950';
    case 'animals':
      return 'from-emerald-800 to-emerald-950';
    default:
      return 'from-growth-800 to-growth-950';
  }
};

const activities = [
  {
    id: "skydiving",
    title: "Sky Diving",
    description: "Free fall from 14,000 feet and experience the ultimate adrenaline rush.",
    image: "https://images.unsplash.com/photo-1521673252667-e05da380b252?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    safety: "All jumps are tandem with certified instructors who have 1000+ jumps. Equipment undergoes rigorous safety checks.",
    category: 'heights'
  },
  {
    id: "hanggliding",
    title: "Hang Gliding",
    description: "Soar like a bird and experience the freedom of unpowered flight.",
    image: "https://images.pexels.com/photos/9532461/pexels-photo-9532461.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Tandem flights with experienced pilots. Modern gliders with redundant safety systems and full certification.",
    category: 'heights'
  },
  {
    id: "rockclimbing",
    title: "Rock Climbing",
    description: "Scale natural rock formations and push your mental and physical limits.",
    image: "https://images.pexels.com/photos/303040/pexels-photo-303040.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Routes established by certified guides. All equipment meets UIAA safety standards with regular inspections.",
    category: 'heights'
  },
  {
    id: "sharkswimming",
    title: "Swimming with Sharks",
    description: "Come face-to-face with these majestic ocean predators in their natural habitat.",
    image: "https://images.pexels.com/photos/10498904/pexels-photo-10498904.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Protected by professional shark divers. Interactions designed to respect the sharks' space and behavior.",
    category: 'ocean'
  },
  {
    id: "basejumping",
    title: "Tandem Base Jumping",
    description: "Experience the thrill of jumping from fixed objects with a parachute.",
    image: "https://images.pexels.com/photos/11049262/pexels-photo-11049262.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Tandem jumps with world-class base jumpers having 500+ jumps. Modern equipment with redundant systems.",
    category: 'heights'
  },
  {
    id: "kayaking",
    title: "White Water Kayaking",
    description: "Navigate through challenging rapids and feel the power of rushing water.",
    image: "https://images.pexels.com/photos/2348108/pexels-photo-2348108.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Professional guides with swift water rescue training. Quality equipment and comprehensive safety briefings.",
    category: 'water'
  },
  {
    id: "wingwalking",
    title: "Wing Walking",
    description: "Stand on the wings of a flying biplane for an unforgettable experience.",
    image: "https://images.pexels.com/photos/30871452/pexels-photo-30871452/free-photo-of-airplane-wing-view-at-sunset.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Secured to the aircraft with professional harness systems. Planes maintained to strict aviation standards.",
    category: 'speed'
  },
  {
    id: "bungeejumping",
    title: "Bungee Jumping",
    description: "Take a leap of faith from great heights with nothing but a bungee cord.",
    image: "https://images.pexels.com/photos/26811613/pexels-photo-26811613/free-photo-of-man-jumping-bungee.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Equipment tested to withstand 10 times your weight. Comprehensive medical checks and professional supervision.",
    category: 'heights'
  },
  {
    id: "ziplines",
    title: "Zip Lines",
    description: "Glide through the air on cables stretched between points of different heights.",
    image: "https://images.pexels.com/photos/6422046/pexels-photo-6422046.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Lines tested daily. Redundant braking systems and professional guides to ensure safe takeoffs and landings.",
    category: 'heights'
  },
  {
    id: "ropeswings",
    title: "Rope Swings",
    description: "Swing from towering heights over canyons, valleys, or waterbodies.",
    image: "https://images.pexels.com/photos/10889628/pexels-photo-10889628.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Multiple attachment points and redundancy in all systems. Supervised by experienced adventure specialists.",
    category: 'heights'
  },
  {
    id: "whaleswimming",
    title: "Swimming with Whales",
    description: "Get close to these gentle giants in their natural oceanic habitat.",
    image: "https://images.pexels.com/photos/27026630/pexels-photo-27026630/free-photo-of-close-encounter-diving-with-a-whale-shark-in-the-deep-blue.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Small guided groups with marine biologists. Protocols to minimize impact on whales and ensure participant safety.",
    category: 'ocean'
  },
  {
    id: "deepdiving",
    title: "Deep Water Diving",
    description: "Explore the mysterious depths of the ocean and encounter fascinating marine life.",
    image: "https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    safety: "PADI certified instructors. Top-quality diving equipment with regular maintenance and safety checks.",
    category: 'water'
  },
];

const Activities = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create an intersection observer to animate cards as they enter the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When a card is visible
          if (entry.isIntersecting) {
            // Add the animation class
            entry.target.classList.add("opacity-100");
            entry.target.classList.remove("opacity-0", "translate-y-8");
            // Stop observing once the animation is triggered
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px" // Start animation a bit before the card enters viewport
      }
    );

    // Observe all activity cards
    const cards = document.querySelectorAll(".activity-card");
    cards.forEach((card) => {
      observer.observe(card);
    });

    // Cleanup observer on component unmount
    return () => {
      cards.forEach((card) => {
        observer.unobserve(card);
      });
    };
  }, []);

  return (
    <section id="activities" className="py-24 bg-gradient-to-b from-gray-950 via-black to-gray-950 relative" ref={sectionRef}>
      {/* Background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5 z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div 
          className="text-center mb-12 scroll-fade-in"
          ref={headingRef}
        >
          <div className="inline-block mb-2">
            <span className="bg-gradient-to-r from-growth-600 to-growth-800 h-1 w-20 block mx-auto"></span>
            <span className="text-sm font-medium text-growth-400 uppercase tracking-wider">Confronting Fear</span>
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-growth-400 via-growth-500 to-growth-700 text-transparent bg-clip-text">
            <FearIcon size={28} className="inline-block mr-2 mb-1" />
            Popular Courage Activities
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover activities designed to help you confront your fears and build courage through gradual exposure and guided experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 staggered-animation">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className={`shadow-xl rounded-lg overflow-hidden transition-all duration-500 group bg-gray-900 hover:bg-gray-800/80 activity-card transform opacity-0 translate-y-8 hover:-translate-y-2 border border-gray-800 hover:border-growth-800 relative card-glow-effect`}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={activity.image} 
                  alt={activity.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 filter brightness-90 contrast-125 saturate-75 group-hover:brightness-100 group-hover:saturate-100"
                />
                {/* Category overlay gradient based on category */}
                <div className={`absolute inset-0 opacity-20 bg-gradient-to-t ${getCategoryColor(activity.category)}`}></div>
                
                {/* Category badge */}
                <div className="absolute top-2 right-2 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-gray-900/90 backdrop-blur-sm text-growth-300 border border-growth-800/40 shadow-lg`}>
                    {getCategoryIcon(activity.category)}
                    <span className="capitalize">{activity.category}</span>
                  </span>
                </div>
                
                {/* Title overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4 transition-all duration-300 group-hover:from-black/90">
                  <h3 className="text-white text-xl font-bold text-shadow-lg transform transition-all duration-300 group-hover:translate-y-[-5px]">{activity.title}</h3>
                </div>
              </div>
              <CardContent className="p-5 relative overflow-hidden z-10">
                {/* Subtle background pattern for card content */}
                <div className="absolute inset-0 opacity-5 z-0 pointer-events-none">
                  <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                    <pattern id={`${activity.id}-pattern`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                      <circle cx="10" cy="10" r="1" fill="currentColor" className="text-growth-300" />
                    </pattern>
                    <rect x="0" y="0" width="100%" height="100%" fill={`url(#${activity.id}-pattern)`} />
                  </svg>
                </div>
                
                {/* Description with hover effect */}
                <p className="text-sm text-gray-300 mb-5 relative z-10 transform transition-all duration-300 group-hover:text-white">
                  {activity.description}
                </p>
                
                {/* Safety info with enhanced styling */}
                <div className="mb-5 p-3 bg-black/20 rounded-md border-l-2 border-growth-700 relative overflow-hidden">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-growth-300 bg-growth-900/70 px-2.5 py-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Safety
                  </span>
                  <p className="mt-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{activity.safety}</p>
                </div>
                
                {/* Button with enhanced hover effect */}
                <Button 
                  variant="growth"
                  className="w-full flex items-center justify-center gap-2 py-5 relative overflow-hidden group-hover:bg-growth-600 transition-all duration-500 shadow-md group-hover:shadow-growth-700/30 btn-micro-interaction"
                >
                  <ExploreIcon size={16} className="transition-transform duration-500 group-hover:rotate-12" />
                  <span className="relative z-10">Learn More</span>
                </Button>
              </CardContent>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our mission is to help you understand your fears, not to book adventures.
            We provide education, support, and empowerment to help you face your fears on your own terms.
          </p>
          <Button 
            className="bg-courage-600 hover:bg-courage-700 text-white px-6 py-3"
          >
            Talk With Our Fear Specialists
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Activities;
