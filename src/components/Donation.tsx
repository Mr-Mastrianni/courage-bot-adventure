
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { processDonation } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Check, CreditCard, Heart } from 'lucide-react';

const DonationAmounts = [10, 25, 50, 100, 250];

const Donation = () => {
  const { toast } = useToast();
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setCustomAmount(value);
      if (value !== "") {
        setAmount(parseFloat(value));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name || !email || !amount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the API function (in a real app, paymentToken would come from a payment processor)
      const response = await processDonation(
        amount,
        name,
        email,
        paymentMethod,
        "mock_payment_token" // This would be a real token in production
      );

      if (response.success) {
        setIsSuccess(true);
        toast({
          title: "Donation successful",
          description: response.message,
        });
        
        // Reset form after success
        setTimeout(() => {
          setAmount(25);
          setCustomAmount("");
          setName("");
          setEmail("");
          setPaymentMethod("creditCard");
          setIsSuccess(false);
        }, 3000);
      } else {
        toast({
          title: "Donation failed",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error processing donation",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="donate" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-courage-100 text-courage-800 mb-4">
            Support Our Mission
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Help Others Find Their Courage
          </h2>
          <p className="text-lg text-gray-600">
            Your donations enable us to provide life-changing experiences for those who couldn't otherwise afford them. 
            Every contribution helps someone face their fears and discover their strength.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <Card className="border border-gray-200 overflow-hidden">
            <CardContent className="p-0">
              {isSuccess ? (
                <div className="p-8 text-center space-y-4">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Thank You!</h3>
                  <p className="text-gray-600">
                    Your donation of ${amount.toFixed(2)} has been processed successfully. 
                    We've sent a receipt to your email address.
                  </p>
                  <Button 
                    className="bg-courage-600 hover:bg-courage-700"
                    onClick={() => setIsSuccess(false)}
                  >
                    Make Another Donation
                  </Button>
                </div>
              ) : (
                <Tabs defaultValue="oneTime">
                  <div className="px-6 pt-6">
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="oneTime">One-time</TabsTrigger>
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="oneTime" className="p-6 space-y-6">
                    <form onSubmit={handleSubmit}>
                      {/* Donation Amounts */}
                      <div className="space-y-2 mb-6">
                        <Label>Select Donation Amount</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {DonationAmounts.map((value) => (
                            <Button
                              key={value}
                              type="button"
                              variant={amount === value && !customAmount ? "default" : "outline"}
                              className={`${
                                amount === value && !customAmount
                                  ? "bg-courage-600 hover:bg-courage-700 text-white border-courage-600"
                                  : "border-gray-300 text-gray-700"
                              }`}
                              onClick={() => handleAmountSelect(value)}
                            >
                              ${value}
                            </Button>
                          ))}
                        </div>
                        
                        <div className="mt-4">
                          <Label htmlFor="customAmount">Custom Amount</Label>
                          <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500">$</span>
                            </div>
                            <Input
                              id="customAmount"
                              placeholder="Enter amount"
                              className="pl-8"
                              value={customAmount}
                              onChange={handleCustomAmountChange}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Personal Information */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john.doe@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="mt-6">
                        <Label>Payment Method</Label>
                        <RadioGroup
                          value={paymentMethod}
                          onValueChange={setPaymentMethod}
                          className="mt-2 space-y-2"
                        >
                          <div className="flex items-center space-x-3 border rounded-md p-3">
                            <RadioGroupItem value="creditCard" id="creditCard" />
                            <Label htmlFor="creditCard" className="flex items-center gap-2">
                              <CreditCard size={20} className="text-gray-500" />
                              Credit Card
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 border rounded-md p-3">
                            <RadioGroupItem value="paypal" id="paypal" />
                            <Label htmlFor="paypal">PayPal</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="w-full mt-6 bg-courage-600 hover:bg-courage-700 flex items-center justify-center gap-2"
                        disabled={isSubmitting}
                      >
                        <Heart size={18} />
                        {isSubmitting ? "Processing..." : `Donate $${amount ? amount.toFixed(2) : "0.00"}`}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="monthly" className="p-6 space-y-6">
                    <form onSubmit={handleSubmit}>
                      {/* Same form as one-time but with monthly messaging */}
                      <div className="bg-courage-50 border border-courage-100 rounded-md p-3 mb-6">
                        <p className="text-sm text-courage-800">
                          Your donation will be processed monthly until canceled. You can cancel anytime from your account.
                        </p>
                      </div>
                      
                      {/* Donation Amounts */}
                      <div className="space-y-2 mb-6">
                        <Label>Select Monthly Donation Amount</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {DonationAmounts.map((value) => (
                            <Button
                              key={value}
                              type="button"
                              variant={amount === value && !customAmount ? "default" : "outline"}
                              className={`${
                                amount === value && !customAmount
                                  ? "bg-courage-600 hover:bg-courage-700 text-white border-courage-600"
                                  : "border-gray-300 text-gray-700"
                              }`}
                              onClick={() => handleAmountSelect(value)}
                            >
                              ${value}
                            </Button>
                          ))}
                        </div>
                        
                        <div className="mt-4">
                          <Label htmlFor="customMonthlyAmount">Custom Monthly Amount</Label>
                          <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500">$</span>
                            </div>
                            <Input
                              id="customMonthlyAmount"
                              placeholder="Enter amount"
                              className="pl-8"
                              value={customAmount}
                              onChange={handleCustomAmountChange}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Personal Information */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="nameMonthly">Full Name</Label>
                          <Input
                            id="nameMonthly"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="emailMonthly">Email Address</Label>
                          <Input
                            id="emailMonthly"
                            type="email"
                            placeholder="john.doe@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="mt-6">
                        <Label>Payment Method</Label>
                        <RadioGroup
                          value={paymentMethod}
                          onValueChange={setPaymentMethod}
                          className="mt-2 space-y-2"
                        >
                          <div className="flex items-center space-x-3 border rounded-md p-3">
                            <RadioGroupItem value="creditCard" id="creditCardMonthly" />
                            <Label htmlFor="creditCardMonthly" className="flex items-center gap-2">
                              <CreditCard size={20} className="text-gray-500" />
                              Credit Card
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 border rounded-md p-3">
                            <RadioGroupItem value="paypal" id="paypalMonthly" />
                            <Label htmlFor="paypalMonthly">PayPal</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="w-full mt-6 bg-courage-600 hover:bg-courage-700 flex items-center justify-center gap-2"
                        disabled={isSubmitting}
                      >
                        <Heart size={18} />
                        {isSubmitting ? "Processing..." : `Donate $${amount ? amount.toFixed(2) : "0.00"} Monthly`}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Donation;
