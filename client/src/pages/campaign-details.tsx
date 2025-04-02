import { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Campaign, donationFormSchema, DonationForm } from "../../../shared/mongodb-schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { load } from '@cashfreepayments/cashfree-js';
import { Play, Pause, Volume2, VolumeX } from "lucide-react";


export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const campaignId = id;
  const [amountType, setAmountType] = useState<'preset' | 'custom'>('preset');
  const [presetAmount, setPresetAmount] = useState<number>(50);
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);
  const [cashfreeError, setCashfreeError] = useState(false);
  const [showStickyDonate, setShowStickyDonate] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [cashfree, setCashfree] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
   // Video player states
   const videoRef = useRef<HTMLVideoElement>(null);
   const [isPlaying, setIsPlaying] = useState(true);
   const [isMuted, setIsMuted] = useState(true);

  // Load Cashfree SDK
  useEffect(() => {
    const initializeCashfree = async () => {
      try {
        const cashfreeInstance = await load({
          mode: "sandbox", // Change to "production" for production environment
        });
        setCashfree(cashfreeInstance);
        setCashfreeLoaded(true);
        console.log("Cashfree SDK loaded successfully");
      } catch (error) {
        console.error("Failed to load Cashfree SDK:", error);
        setCashfreeError(true);
        toast({
          title: "Payment gateway error",
          description: "Failed to initialize payment gateway. Please try again later.",
          variant: "destructive",
        });
      }
    };

    initializeCashfree();
    
    // Cleanup function
    return () => {
      // No specific cleanup needed for Cashfree SDK
    };
  }, [toast]);
  
  // Handle sticky donate button behavior
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 1024) { // Only show on mobile and tablet
        setShowStickyDonate(window.scrollY > 300);
      } else {
        setShowStickyDonate(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    // Run once on mount to set initial state
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const { data: campaign, isLoading, error } = useQuery<Campaign>({
    queryKey: [`/api/campaigns/${campaignId}`],
  });

  const form = useForm<DonationForm>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      amount: 50,
      coverFees: false,
      isMonthly: false,
      campaignId: campaignId || ""
    }
  });

// Function to initialize Cashfree payment
const initializePayment = (sessionId: string, donationId: string) => {
  if (!cashfreeLoaded || !cashfree) {
    toast({
      title: "Payment gateway not ready",
      description: "Please try again in a moment.",
      variant: "destructive",
    });
    setIsProcessingPayment(false);
    return;
  }
  
  try {
    console.log("Initializing payment with session ID:", sessionId);
    
    // Define the return URL for redirect after payment
    const returnUrl = `${window.location.origin}/thank-you?donation_id=${donationId}&order_id=${orderId}`;
    console.log("Return URL:", returnUrl);
    
    const checkoutOptions = {
      paymentSessionId: sessionId,
      redirectTarget: "_self", // Changed from "_modal" to "_self" for better redirect handling
      onSuccess: (data: any) => {
        console.log("Payment successful:", data);
        // This may not be called if redirectTarget is "_self"
        navigate(`/thank-you?donation_id=${donationId}&order_id=${orderId}`);
      },
      onFailure: (data: any) => {
        console.error("Payment failed:", data);
        setIsProcessingPayment(false);
        toast({
          title: "Payment failed",
          description: data.error?.message || "Failed to process payment. Please try again.",
          variant: "destructive",
        });
      },
      components: ["order-details", "card", "upi", "netbanking", "app", "wallet"],
      style: {
        backgroundColor: "#ffffff",
        color: "#11111",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        errorColor: "#ff0000",
        theme: "light"
      }
    };
    
    // Initialize Cashfree checkout
    cashfree.checkout(checkoutOptions).then(() => {
      console.log("Payment initialized successfully");
    }).catch((error: any) => {
      console.error("Error initializing payment:", error);
      setIsProcessingPayment(false);
      toast({
        title: "Payment error",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    });
  } catch (error: any) {
    console.error("Error initializing payment:", error);
    setIsProcessingPayment(false);
    toast({
      title: "Payment error",
      description: error.message || "Failed to initialize payment. Please try again.",
      variant: "destructive",
    });
  }
};
  // Function to handle payment verification
  const verifyPayment = async (donationId: string) => {
    try {
      if (!orderId) {
        console.error("Order ID is missing");
        return;
      }
      
      setIsProcessingPayment(true);
      const verificationResponse = await apiRequest("POST", "/api/payment/verify", {
        orderId: orderId
      });
      
      if (verificationResponse.success && 
          (verificationResponse.paymentStatus === "SUCCESS" || 
           verificationResponse.paymentStatus === "PAID")) {
        toast({
          title: "Payment successful",
          description: "Thank you for your donation!",
        });
        navigate(`/thank-you?donation_id=${donationId}&order_id=${orderId}`);
      } else {
        toast({
          title: "Payment verification",
          description: `Payment status: ${verificationResponse.paymentStatus || "Unknown"}`,
          variant: verificationResponse.paymentStatus === "SUCCESS" || verificationResponse.paymentStatus === "PAID" 
            ? "default" 
            : "destructive",
        });
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      toast({
        title: "Verification error",
        description: error.message || "Failed to verify payment status.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

// Function to handle form submission
async function onSubmit(data: DonationForm) {
  // Check if Cashfree is loaded
  if (cashfreeError) {
    toast({
      title: "Payment gateway error",
      description: "Payment service is currently unavailable. Please try again later.",
      variant: "destructive",
    });
    return;
  }
  
  if (!cashfreeLoaded || !cashfree) {
    toast({
      title: "Payment gateway loading",
      description: "Payment service is initializing. Please try again in a moment.",
    });
    return;
  }
  
  // Set the final amount based on the selection type
  const finalData = {
    ...data,
    amount: amountType === 'preset' ? presetAmount : data.amount
  };
  
  // Add mobile field if it's not provided
  if (!finalData.mobile) {
    finalData.mobile = '';
  }
  
  try {
    setIsProcessingPayment(true);
    
    // First create the donation record
    const donation = await apiRequest("POST", "/api/donations", finalData);
    console.log("Donation created:", donation);
    
    // Then create the payment using our payments endpoint
    const paymentResponse = await apiRequest("POST", "/api/payments", {
      donationId: donation.id
    });
    console.log("Payment response:", paymentResponse);
    
    if (!paymentResponse.success) {
      toast({
        title: "Payment initialization failed",
        description: "Could not create payment order. Please try again.",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
      return;
    }
    
    // Store the order ID for verification later
    setOrderId(paymentResponse.orderId);
    
    // Initialize payment with the session ID
    if (paymentResponse.paymentSessionId) {
      initializePayment(paymentResponse.paymentSessionId, donation.id);
    } else {
      console.error("Missing payment session ID in response:", paymentResponse);
      toast({
        title: "Payment initialization failed",
        description: "Could not create payment session. Please try again.",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    }
  } catch (error: any) {
    console.error("Error processing donation:", error);
    setIsProcessingPayment(false);
    toast({
      title: "Error",
      description: error.message || "Failed to process donation. Please try again.",
      variant: "destructive",
    });
  }
}

  const handlePresetAmountClick = (amount: number) => {
    setAmountType('preset');
    setPresetAmount(amount);
    form.setValue('amount', amount);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountType('custom');
    form.setValue('amount', Number(e.target.value));
  };

   // Video player functions
   const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-slate-200 rounded mb-6"></div>
          <div className="h-8 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 bg-slate-200 rounded mb-6 w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Campaign Not Found</h2>
        <p className="mb-6">The campaign you're looking for doesn't exist or may have been removed.</p>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  const percentFunded = Math.min(
    Math.round((Number(campaign.raisedAmount) / Number(campaign.goalAmount)) * 100),
    100
  );

  return (
    <div className="container mx-auto px-4 py-8 page-with-sticky-button">
      <div className="mb-6">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-sm text-slate-600 hover:text-orange-500">Home</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-slate-400">/</span>
                <Link href="/#campaigns" className="text-sm text-slate-600 hover:text-orange-500">Campaigns</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-slate-400">/</span>
                <span className="text-sm text-slate-500">{campaign.title}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           {/* Campaign video player */}
          <div className="video-container relative mb-6 rounded-lg overflow-hidden shadow-lg">
          <video 
  ref={videoRef}
  className="video-player w-full h-auto"
  poster={campaign.imageUrl}
  onEnded={() => setIsPlaying(false)}
  onLoadedData={() => {
    if (videoRef.current) {
      videoRef.current.play()
        .catch(e => console.log("Autoplay prevented:", e));
    }
  }}
  autoPlay
  muted
>
  <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>
            <div className="video-overlay absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-100 hover:opacity-100 transition-opacity duration-300">
              <div className="video-controls flex space-x-4">
                <button 
                                    className="video-btn bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-110" 
                                    onClick={togglePlay} 
                                    aria-label={isPlaying ? "Pause" : "Play"}
                                  >
                                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                                  </button>
                                  <button 
                                    className="video-btn bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-110" 
                                    onClick={toggleMute} 
                                    aria-label={isMuted ? "Unmute" : "Mute"}
                                  >
                                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                                  </button>
                                </div>
                              </div>
                            </div>
                  
                            <div className="mb-6">
                              <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200 shadow-sm">
                                  {campaign.category}
                                </span>
                                <span className="text-slate-500 text-sm flex items-center">
                                  <i className="bi bi-clock me-1"></i>{campaign.daysLeft} days left
                                </span>
                              </div>
                              
                              <h1 className="text-3xl font-bold mb-3 text-slate-800">{campaign.title}</h1>
                              <p className="text-lg text-slate-600">{campaign.description}</p>
                            </div>
                            
                            <div className="mb-6 bg-slate-50 p-4 rounded-lg shadow-sm">
                              <div className="flex justify-between mb-2">
                                <div className="text-2xl font-bold text-slate-800">₹{Number(campaign.raisedAmount).toLocaleString()}</div>
                                <div className="text-slate-500">of ₹{Number(campaign.goalAmount).toLocaleString()} goal</div>
                              </div>
                              <div className="h-2.5 bg-slate-200 rounded-full mb-2">
                                <div 
                                  className="h-full bg-orange-500 rounded-full" 
                                  style={{ width: `${percentFunded}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600 flex items-center">
                                  <i className="bi bi-people-fill me-1"></i>{campaign.donorCount} donors
                                </span>
                                <span className="text-orange-600 font-medium">{percentFunded}% funded</span>
                              </div>
                            </div>
                            
                            <Tabs defaultValue="story" className="mb-8">
                              <TabsList className="mb-2 bg-slate-100 p-1 rounded-lg">
                                <TabsTrigger value="story" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Story</TabsTrigger>
                                <TabsTrigger value="updates" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Updates</TabsTrigger>
                                <TabsTrigger value="comments" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Comments</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="story" className="p-4 bg-white rounded-md shadow-sm">
                                <div dangerouslySetInnerHTML={{ __html: campaign.fullDescription }}></div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                  <img 
                                    src="https://images.unsplash.com/photo-1635236066069-cd6e699a8a2a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80" 
                                    alt="Project impact" 
                                    className="rounded-md shadow-sm hover:shadow-md transition-shadow duration-300"
                                  />
                                  <img 
                                    src="https://images.unsplash.com/photo-1616628188859-7a11abb6fcc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80" 
                                    alt="Project impact" 
                                    className="rounded-md shadow-sm hover:shadow-md transition-shadow duration-300"
                                  />
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="updates" className="p-4 bg-white rounded-md shadow-sm">
                                <div className="border-b pb-4 mb-4">
                                  <div className="flex mb-4">
                                    <div className="flex-shrink-0 mr-3">
                                      <div className="w-12 h-12 rounded-full bg-slate-300 overflow-hidden">
                                        <img 
                                          src="https://i.pravatar.cc/48?img=1"
                                          alt="Project Coordinator"
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-bold mb-1">First village system installed!</h4>
                                      <p className="text-sm text-slate-500 mb-3">Posted by Sarah Johnson, Project Coordinator • 3 days ago</p>
                                      <p>We're thrilled to announce that we've successfully installed the first water purification system in Nyarugusu village! The system is already providing clean water to over 500 residents.</p>
                                    </div>
                                  </div>
                                </div>
                  
                                <div>
                                  <div className="flex">
                                    <div className="flex-shrink-0 mr-3">
                                      <div className="w-12 h-12 rounded-full bg-slate-300 overflow-hidden">
                                        <img 
                                          src="https://i.pravatar.cc/48?img=2"
                                          alt="Project Director"
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-bold mb-1">Halfway to our goal!</h4>
                                      <p className="text-sm text-slate-500 mb-3">Posted by Michael Chang, Project Director • 2 weeks ago</p>
                                      <p>Thanks to your generous donations, we've reached 50% of our fundraising goal! This means we can begin ordering equipment for the next phase of installations.</p>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="comments" className="p-4 bg-white rounded-md shadow-sm">
                                <div className="mb-6">
                                  <div className="border-b pb-3 mb-3">
                                    <div className="flex">
                                      <div className="flex-shrink-0 mr-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden">
                                          <img 
                                            src="https://i.pravatar.cc/40?img=3"
                                            alt="Commenter"
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <h5 className="font-bold text-sm mb-1">James Wilson</h5>
                                        <p className="text-xs text-slate-500 mb-2">2 days ago</p>
                                        <p className="text-sm">So happy to support this important cause. Clean water is a basic human right!</p>
                                      </div>
                                    </div>
                                  </div>
                  
                                  <div className="border-b pb-3 mb-3">
                                    <div className="flex">
                                      <div className="flex-shrink-0 mr-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden">
                                          <img 
                                            src="https://i.pravatar.cc/40?img=4"
                                            alt="Commenter"
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <h5 className="font-bold text-sm mb-1">Elena Rodriguez</h5>
                                        <p className="text-xs text-slate-500 mb-2">5 days ago</p>
                                        <p className="text-sm">I visited this region last year and saw the need firsthand. This initiative will make such a difference!</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                  
                                <div>
                                  <h4 className="font-bold mb-3">Leave a Comment</h4>
                                  <textarea 
                                    className="w-full p-3 border border-slate-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    rows={3}
                                    placeholder="Add your comment..."
                                  ></textarea>
                                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">Post Comment</Button>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </div>
                          
                          <div className="lg:col-span-1">
                            <Card className="sticky top-24 border-0 shadow-md">
                              <CardContent className="p-6">
                                <h3 className="text-xl font-bold mb-6 text-center">Support This Campaign</h3>
                                
                                <Form {...form}>
                                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                      control={form.control}
                                      name="firstName"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>First Name</FormLabel>
                                          <FormControl>
                                            <Input {...field} className="focus:ring-orange-500 focus:border-orange-500" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={form.control}
                                      name="lastName"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Last Name</FormLabel>
                                          <FormControl>
                                            <Input {...field} className="focus:ring-orange-500 focus:border-orange-500" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={form.control}
                                      name="email"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Email</FormLabel>
                                          <FormControl>
                                            <Input {...field} type="email" className="focus:ring-orange-500 focus:border-orange-500" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="mobile"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Mobile Number</FormLabel>
                                          <FormControl>
                                            <Input 
                                              {...field} 
                                              type="tel" 
                                              placeholder="+91 (XXX) XXX-XXXX"
                                              className="focus:ring-orange-500 focus:border-orange-500"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <div>
                                      <FormLabel>Donation Amount</FormLabel>
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                                        {[25, 50, 100, 250].map((amount) => (
                                          <div 
                                            key={amount}
                                            onClick={() => handlePresetAmountClick(amount)}
                                            className={`cursor-pointer px-4 py-2 border rounded-md text-center 
                                              ${amountType === 'preset' && presetAmount === amount
                                                ? 'border-orange-500 bg-orange-50 text-orange-600'
                                                : 'border-slate-200 hover:border-orange-500 hover:bg-orange-50'
                                              }`
                                            }
                                          >
                                            ₹{amount}
                                          </div>
                                        ))}
                                      </div>
                                      
                                      <div className="flex">
                                        <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-300 rounded-l-md">
                                          ₹
                                        </span>
                                        <input
                                          type="number"
                                          className={`flex-1 p-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                                            ${amountType === 'custom' ? 'border-orange-500' : 'border-slate-300'}`
                                          }
                                          placeholder="Other amount"
                                          min="1"
                                          onChange={handleCustomAmountChange}
                                        />
                                      </div>
                                      {form.formState.errors.amount && (
                                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.amount.message}</p>
                                      )}
                                    </div>
                                    
                                    <Button 
                                      type="submit" 
                                      className="w-full py-6 text-lg bg-orange-500 hover:bg-orange-600 text-white transition-all duration-300 hover:shadow-lg hover:shadow-orange-200" 
                                      disabled={isProcessingPayment}
                                    >
                                      {isProcessingPayment ? "Processing..." : "Donate Now"} 
                                      <i className="bi bi-arrow-right ms-2"></i>
                                    </Button>
                                    
                                    <div className="text-center mt-3">
                                      <p className="text-xs text-slate-500">
                                        <i className="bi bi-shield-lock me-1"></i> Your payment information is secure
                                      </p>
                                    </div>
                                  </form>
                                </Form>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                        
                        {/* Sticky donate button for mobile */}
                        {showStickyDonate && (
                          <div className="sticky-donate-btn fixed bottom-0 left-0 right-0 bg-white shadow-lg p-3 z-50 lg:hidden">
                            <Button 
                              className="w-full py-4 text-lg bg-orange-500 hover:bg-orange-600 text-white transition-all duration-300" 
                              onClick={() => {
                                // Scroll to the donation form section
                                const donationForm = document.querySelector('.lg\\:col-span-1');
                                if (donationForm) {
                                  donationForm.scrollIntoView({ behavior: 'smooth' });
                                }
                              }}
                            >
                              Donate Now <i className="bi bi-arrow-right ms-2"></i>
                            </Button>
                          </div>
                        )}
                  
                        {/* Add CSS for styling */}
                        <style jsx="true" global="true">{`
                          .video-container {
                            position: relative;
                            width: 100%;
                            height: 0;
                            padding-bottom: 56.25%; /* 16:9 aspect ratio */
                            background-color: #000;
                          }
                          
                          .video-player {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                          }
                          
                          .video-overlay {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: rgba(0, 0, 0, 0.3);
                            opacity: 0;
                            transition: opacity 0.3s ease;
                          }
                          
                          .video-container:hover .video-overlay {
                            opacity: 1;
                          }
                          
                          .video-btn {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            border: none;
                            outline: none;
                          }
                          
                          .sticky-donate-btn {
                            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
                            animation: slideUp 0.3s ease-out;
                          }
                          
                          @keyframes slideUp {
                            from {
                              transform: translateY(100%);
                            }
                            to {
                              transform: translateY(0);
                            }
                          }
                          
                          /* Responsive adjustments */
                          @media (max-width: 768px) {
                            .container {
                              padding-bottom: 70px; /* Make room for sticky button */
                            }
                            
                            .video-container {
                              padding-bottom: 75%; /* Taller aspect ratio on mobile */
                            }
                          }
                          
                          /* Orange theme styles */
                          .bg-orange-50 {
                            background-color: #fff7ed;
                          }
                          
                          .bg-orange-100 {
                            background-color: #ffedd5;
                          }
                          
                          .bg-orange-500 {
                            background-color: #f97316;
                          }
                          
                          .bg-orange-600 {
                            background-color: #ea580c;
                          }
                          
                          .text-orange-500 {
                            color: #f97316;
                          }
                          
                          .text-orange-600 {
                            color: #ea580c;
                          }
                          
                          .text-orange-800 {
                            color: #9a3412;
                          }
                          
                          .border-orange-200 {
                            border-color: #fed7aa;
                          }
                          
                          .border-orange-500 {
                            border-color: #f97316;
                          }
                          
                          .hover\:bg-orange-50:hover {
                            background-color: #fff7ed;
                          }
                          
                          .hover\:bg-orange-600:hover {
                            background-color: #ea580c;
                          }
                          
                          .hover\:border-orange-500:hover {
                            border-color: #f97316;
                          }
                          
                          .hover\:text-orange-500:hover {
                            color: #f97316;
                          }
                          
                          .focus\:ring-orange-500:focus {
                            --tw-ring-color: #f97316;
                          }
                          
                          .focus\:border-orange-500:focus {
                            border-color: #f97316;
                          }
                          
                          .shadow-orange-200 {
                            --tw-shadow-color: #fed7aa;
                          }
                        `}</style>
                      </div>
                    );
                  }
                  
                  
