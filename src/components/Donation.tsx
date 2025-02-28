import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Heart, Check } from 'lucide-react';

// Replace this with your actual Zeffy donation form URL
const ZEFFY_DONATION_URL = "https://www.zeffy.com/en-US/donation-form/your-organization-id";

const Donation = () => {
  // Function to handle the donate button click
  const handleDonateClick = () => {
    // Open Zeffy donation form in a new tab
    window.open(ZEFFY_DONATION_URL, '_blank');
  };

  return (
    <section id="donate" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-courage-100 text-courage-800 mb-4">
            Support Our Mission
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Help Others Find Their Courage
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Your contribution helps us continue our work of educating people about facing their fears.
            Every donation empowers someone to understand and overcome their fears.
          </p>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gray-50 p-10 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-center mb-8">
              <div className="h-16 w-16 bg-courage-100 rounded-full flex items-center justify-center">
                <Heart className="h-8 w-8 text-courage-600" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Make a Difference Today
            </h3>
            
            <p className="text-gray-600 mb-8">
              We've partnered with Zeffy to ensure that 100% of your donation goes directly to supporting 
              our educational mission. Zeffy is a free fundraising platform that doesn't charge any 
              platform fees, so your entire donation supports our cause.
            </p>
            
            <Button 
              onClick={handleDonateClick}
              size="lg"
              className="bg-courage-600 hover:bg-courage-700 text-white px-8 py-6 h-auto text-lg flex items-center gap-2"
            >
              Donate Now <ExternalLink size={18} />
            </Button>
            
            <p className="text-sm text-gray-500 mt-4">
              You'll be redirected to our secure donation page powered by Zeffy
            </p>
          </div>
          
          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 text-gray-600">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>100% of donations go to our cause</span>
            </div>
            
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Secure & tax-deductible</span>
            </div>
            
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>One-time or monthly options</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Donation;
