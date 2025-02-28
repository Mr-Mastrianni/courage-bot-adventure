
import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "lucide-react";

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
    image: "https://images.pexels.com/photos/9532461/pexels-photo-9532461.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Tandem flights with experienced pilots. Modern gliders with redundant safety systems and full certification."
  },
  {
    id: "rockclimbing",
    title: "Rock Climbing",
    description: "Scale natural rock formations and push your mental and physical limits.",
    image: "https://images.pexels.com/photos/303040/pexels-photo-303040.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Routes established by certified guides. All equipment meets UIAA safety standards with regular inspections."
  },
  {
    id: "sharkswimming",
    title: "Swimming with Sharks",
    description: "Come face-to-face with these majestic ocean predators in their natural habitat.",
    image: "https://images.pexels.com/photos/10498904/pexels-photo-10498904.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Protected by professional shark divers. Interactions designed to respect the sharks' space and behavior."
  },
  {
    id: "basejumping",
    title: "Tandem Base Jumping",
    description: "Experience the thrill of jumping from fixed objects with a parachute.",
    image: "https://images.pexels.com/photos/11049262/pexels-photo-11049262.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Tandem jumps with world-class base jumpers having 500+ jumps. Modern equipment with redundant systems."
  },
  {
    id: "kayaking",
    title: "White Water Kayaking",
    description: "Navigate through challenging rapids and feel the power of rushing water.",
    image: "https://images.pexels.com/photos/2348108/pexels-photo-2348108.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Professional guides with swift water rescue training. Quality equipment and comprehensive safety briefings."
  },
  {
    id: "wingwalking",
    title: "Wing Walking",
    description: "Stand on the wings of a flying biplane for an unforgettable experience.",
    image: "https://images.pexels.com/photos/30871452/pexels-photo-30871452/free-photo-of-airplane-wing-view-at-sunset.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Secured to the aircraft with professional harness systems. Planes maintained to strict aviation standards."
  },
  {
    id: "bungeejumping",
    title: "Bungee Jumping",
    description: "Take a leap of faith from great heights with nothing but a bungee cord.",
    image: "https://images.pexels.com/photos/26811613/pexels-photo-26811613/free-photo-of-man-jumping-bungee.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Equipment tested to withstand 10 times your weight. Comprehensive medical checks and professional supervision."
  },
  {
    id: "ziplines",
    title: "Zip Lines",
    description: "Glide through the air on cables stretched between points of different heights.",
    image: "https://images.pexels.com/photos/6422046/pexels-photo-6422046.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Lines tested daily. Redundant braking systems and professional guides to ensure safe takeoffs and landings."
  },
  {
    id: "ropeswings",
    title: "Rope Swings",
    description: "Swing from towering heights over canyons, valleys, or waterbodies.",
    image: "https://images.pexels.com/photos/10889628/pexels-photo-10889628.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Multiple attachment points and redundancy in all systems. Supervised by experienced adventure specialists."
  },
  {
    id: "whaleswimming",
    title: "Swimming with Whales",
    description: "Get close to these gentle giants in their natural oceanic habitat.",
    image: "https://images.pexels.com/photos/27026630/pexels-photo-27026630/free-photo-of-close-encounter-diving-with-a-whale-shark-in-the-deep-blue.jpeg?auto=compress&cs=tinysrgb&w=800",
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
    <section id="activities" className="py-20 bg-gradient-to-b from-white to-gray-50" ref={sectionRef}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-courage-100 text-courage-800 mb-4">
            Our Educational Focus
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Understand Your Fears
          </h2>
          <p className="text-lg text-gray-600">
            We don't offer these activities directly, but we educate and empower you to understand 
            and overcome your fears. Learn about these challenging activities and how confronting 
            them can transform your life.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity) => (
            <Card 
              key={activity.id} 
              className="overflow-hidden border border-gray-200 activity-card transform transition-all duration-500 opacity-0 translate-y-8"
            >
              <div className="aspect-w-16 aspect-h-10 relative">
                <img
                  src={activity.image}
                  alt={activity.title}
                  className="object-cover w-full h-48"
                  loading="lazy"
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
                  <InfoIcon size={16} />
                  Learn More
                </Button>
              </CardContent>
            </Card>
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
