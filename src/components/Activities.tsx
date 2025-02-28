
import { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const activities = [
  {
    id: "skydiving",
    title: "Sky Diving",
    description: "Free fall from 14,000 feet and experience the ultimate adrenaline rush.",
    image: "https://images.unsplash.com/photo-1521673252667-e05da380b252?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    safety: "All jumps are tandem with certified instructors who have 1000+ jumps. Equipment undergoes rigorous safety checks."
  },
  {
    id: "hanggliding",
    title: "Hang Gliding",
    description: "Soar like a bird and experience the freedom of unpowered flight.",
    image: "https://images.unsplash.com/photo-1601145589699-8da5d2f5c0f4?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    safety: "Tandem flights with experienced pilots. Modern gliders with redundant safety systems and full certification."
  },
  {
    id: "rockclimbing",
    title: "Rock Climbing",
    description: "Scale natural rock formations and push your mental and physical limits.",
    image: "https://images.unsplash.com/photo-1522079803432-e0b7649d04e5?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    safety: "Routes established by certified guides. All equipment meets UIAA safety standards with regular inspections."
  },
  {
    id: "sharkswimming",
    title: "Swimming with Sharks",
    description: "Come face-to-face with these majestic ocean predators in their natural habitat.",
    image: "https://images.unsplash.com/photo-1560275619-4462e8263b6d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    safety: "Protected by professional shark divers. Interactions designed to respect the sharks' space and behavior."
  },
  {
    id: "basejumping",
    title: "Tandem Base Jumping",
    description: "Experience the thrill of jumping from fixed objects with a parachute.",
    image: "https://images.unsplash.com/photo-1531167599833-609a36fb11d7?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    safety: "Tandem jumps with world-class base jumpers having 500+ jumps. Modern equipment with redundant systems."
  },
  {
    id: "kayaking",
    title: "White Water Kayaking",
    description: "Navigate through challenging rapids and feel the power of rushing water.",
    image: "https://images.unsplash.com/photo-1527008029689-c59c8fcefb37?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    safety: "Professional guides with swift water rescue training. Quality equipment and comprehensive safety briefings."
  },
  {
    id: "wingwalking",
    title: "Wing Walking",
    description: "Stand on the wings of a flying biplane for an unforgettable experience.",
    image: "https://images.unsplash.com/photo-1534842396190-abe87456ebde?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    safety: "Secured to the aircraft with professional harness systems. Planes maintained to strict aviation standards."
  },
  {
    id: "bungeejumping",
    title: "Bungee Jumping",
    description: "Take a leap of faith from great heights with nothing but a bungee cord.",
    image: "https://images.unsplash.com/photo-1544049463-3267297c4596?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    safety: "Equipment tested to withstand 10 times your weight. Comprehensive medical checks and professional supervision."
  },
  {
    id: "ziplines",
    title: "Zip Lines",
    description: "Glide through the air on cables stretched between points of different heights.",
    image: "https://images.unsplash.com/photo-1588873281272-14886ba1f737?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    safety: "Lines tested daily. Redundant braking systems and professional guides to ensure safe takeoffs and landings."
  },
  {
    id: "ropeswings",
    title: "Rope Swings",
    description: "Swing from towering heights over canyons, valleys, or waterbodies.",
    image: "https://images.unsplash.com/photo-1627216790179-56c54b5c9b23?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    safety: "Multiple attachment points and redundancy in all systems. Supervised by experienced adventure specialists."
  },
  {
    id: "whaleswimming",
    title: "Swimming with Whales",
    description: "Get close to these gentle giants in their natural oceanic habitat.",
    image: "https://images.unsplash.com/photo-1578159935496-67489539bfb1?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    safety: "Small guided groups with marine biologists. Protocols to minimize impact on whales and ensure participant safety."
  },
  {
    id: "deepdiving",
    title: "Deep Water Diving",
    description: "Explore the mysterious depths of the ocean and encounter fascinating marine life.",
    image: "https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    safety: "PADI certified instructors. Top-quality diving equipment with regular maintenance and safety checks."
  },
];

const Activities = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll(".activity-card");
    cards.forEach((card) => {
      observer.observe(card);
    });

    return () => {
      cards.forEach((card) => {
        observer.unobserve(card);
      });
    };
  }, []);

  return (
    <section id="activities" className="py-20 bg-gradient-to-b from-white to-gray-50" ref={sectionRef}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-courage-100 text-courage-800 mb-4">
            Our Adventures
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Challenge
          </h2>
          <p className="text-lg text-gray-600">
            Every fear conquered is a step toward personal growth. Select an activity 
            that pushes your boundaries and discover the strength that lies beyond comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity) => (
            <Card key={activity.id} className="overflow-hidden border border-gray-200 activity-card opacity-0">
              <div className="aspect-w-16 aspect-h-10 relative">
                <img
                  src={activity.image}
                  alt={activity.title}
                  className="object-cover w-full h-48"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="text-xl font-bold text-white text-shadow">
                    {activity.title}
                  </h3>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-gray-600 mb-4">{activity.description}</p>
                <div className="mb-4">
                  <span className="text-xs font-medium text-courage-800 bg-courage-50 px-2.5 py-0.5 rounded-full">Safety</span>
                  <p className="mt-2 text-sm text-gray-500">{activity.safety}</p>
                </div>
                <Button 
                  className="w-full bg-courage-600 hover:bg-courage-700 text-white flex items-center justify-center gap-2 group"
                >
                  Book Now
                  <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Activities;
