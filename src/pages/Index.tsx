
import ChatBot from "@/components/ChatBot";
import Hero from "@/components/Hero";
import Activities from "@/components/Activities";
import VideoGallery from "@/components/VideoGallery";
import Donation from "@/components/Donation";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";

const Index = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Activities Section */}
      <Activities />
      
      {/* Video Gallery */}
      <VideoGallery />
      
      {/* Donation Section */}
      <Donation />
      
      {/* Footer */}
      <footer className="bg-courage-900 text-white py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Be Courageous</h3>
          <p className="text-courage-200 mb-6 max-w-2xl mx-auto">
            Empowering individuals to face their fears through guided adventure experiences.
            Discover your inner courage and transform your life.
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-courage-200 hover:text-white transition-colors">
              Instagram
            </a>
            <a href="#" className="text-courage-200 hover:text-white transition-colors">
              Facebook
            </a>
            <a href="#" className="text-courage-200 hover:text-white transition-colors">
              Twitter
            </a>
            <a href="#" className="text-courage-200 hover:text-white transition-colors">
              YouTube
            </a>
          </div>
          <div className="mt-8 text-sm text-courage-300">
            &copy; {new Date().getFullYear()} Be Courageous. All rights reserved.
          </div>
        </div>
      </footer>
      
      {/* Chatbot */}
      <ChatBot />
    </div>
  );
};

export default Index;
