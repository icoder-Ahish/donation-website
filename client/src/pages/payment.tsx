import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Campaign, type Donation } from "../../../shared/mongodb-schema";
import { load } from "@cashfreepayments/cashfree-js";

// Define response type for createOrder API
interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  paymentSessionId: string;
}

export default function PaymentPage() {
  const { donationId } = useParams<{ donationId: string }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);
  const [cashfreeError, setCashfreeError] = useState(false);
  const [donationAmount, setDonationAmount] = useState(100); // Default amount 100 INR
  const [isProcessing, setIsProcessing] = useState(false);

  // Remove simulated donation since we now fetch from API
  const cashfreeAppId = "";

  // Fetch the donation data
  const { data: donation, isLoading: isDonationLoading, isError: isDonationError } = useQuery<Donation>({
    queryKey: [`/api/donations/${donationId}`],
    enabled: !!donationId,
  });

  // When donation data is loaded, update the donation amount
  useEffect(() => {
    if (donation && donation.amount) {
      setDonationAmount(parseFloat(String(donation.amount)));
    }
  }, [donation]);

  // Initialize Cashfree SDK
  useEffect(() => {
    const initializeCashfreeSDK = async () => {
      try {
        // Using @cashfreepayments/cashfree-js library
        const cashfree = await load({
          mode: "sandbox", // use "production" for live environment
        });
        
        // Set the cashfree loaded state to true
        setCashfreeLoaded(true);
        setCashfreeError(false);
      } catch (error) {
        console.error("Error initializing Cashfree SDK:", error);
        setCashfreeError(true);
        toast({
          title: "Payment error",
          description: "Failed to initialize payment gateway. Please try again later.",
          variant: "destructive",
        });
      }
    };

    initializeCashfreeSDK();
  }, [toast]);

  const { data: campaign, isLoading: isCampaignLoading } = useQuery<Campaign>({
    queryKey: ['/api/campaigns', donation?.campaignId],
    enabled: !!donation?.campaignId,
  });

  // Create Cashfree payment order and initiate checkout
  const createPaymentOrder = useMutation<CreateOrderResponse>({
    mutationFn: async () => {
      setIsProcessing(true);
      const response = await apiRequest<CreateOrderResponse>("POST", "/api/cashfree/create-order", {
        donationId: donationId,
      });
      return response;
    },
    onSuccess: (data) => {
      if (!data.success || !data.paymentSessionId) {
        setIsProcessing(false);
        toast({
          title: "Payment initialization failed",
          description: "Could not create payment session. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Initialize the Cashfree checkout using the new library
      if (cashfreeLoaded) {
        try {
          // Store order ID for verification
          const orderId = data.orderId;
          
          // Using the new Cashfree library
          const checkoutOptions = {
            paymentSessionId: data.paymentSessionId,
            redirectTarget: "_self", // Use _self to redirect in same tab
          };
          
          // Load the Cashfree SDK
          load({ mode: "sandbox" }).then((cashfree) => {
            // Start the checkout process
            cashfree.checkout(checkoutOptions).then(function() {
              console.log("Payment initialized");
              
              // Verify payment after initialization
              verifyPayment(orderId);
            }).catch(function(error) {
              setIsProcessing(false);
              console.error("Checkout error:", error);
              toast({
                title: "Payment error",
                description: "Failed to process payment. Please try again.",
                variant: "destructive",
              });
            });
          }).catch((error) => {
            setIsProcessing(false);
            console.error("Load error:", error);
            toast({
              title: "Payment error",
              description: "Failed to load payment gateway. Please try again.",
              variant: "destructive",
            });
          });
        } catch (error) {
          setIsProcessing(false);
          console.error("Payment initialization error:", error);
          toast({
            title: "Payment error",
            description: "Failed to initialize payment. Please try again later.",
            variant: "destructive",
          });
        }
      } else {
        setIsProcessing(false);
        toast({
          title: "Payment error",
          description: "Payment gateway is not ready. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      setIsProcessing(false);
      toast({
        title: "Payment initialization failed",
        description: error.message || "Failed to setup payment. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Verify payment status
  const verifyPayment = async (orderId: string) => {
    try {
      const response = await apiRequest("POST", "/api/payment/verify", {
        orderId: orderId
      });
      
      if (response && response.success) {
        toast({
          title: "Payment verified",
          description: "Your donation has been processed successfully!",
        });
        navigate(`/thank-you?donation_id=${donationId}&order_id=${orderId}`);
      } else {
        setIsProcessing(false);
        toast({
          title: "Payment verification failed",
          description: "Please contact customer support for assistance.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsProcessing(false);
      console.error("Payment verification error:", error);
      toast({
        title: "Payment verification failed",
        description: "We couldn't verify your payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDonateClick = () => {
    if (cashfreeError) {
      toast({
        title: "Payment error",
        description: "Payment gateway is not available. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    createPaymentOrder.mutate();
  };

  if (isDonationLoading || isCampaignLoading) {
    return <LoadingSkeleton />;
  }

  if (isDonationError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Donation Not Found</h2>
        <p className="mb-6">We couldn't find the donation you're looking for. Please try again.</p>
        <Button onClick={() => navigate("/")}>Return to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-sm text-slate-600 hover:text-primary">Home</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-slate-400">/</span>
                <Link href="/#campaigns" className="text-sm text-slate-600 hover:text-primary">Campaigns</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-slate-400">/</span>
                <span className="text-sm text-slate-500">Donate</span>
              </div>
            </li>
          </ol>
        </nav>

        <h2 className="text-3xl font-bold">Make a Donation</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Donation Amount</h3>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[100, 200, 500, 1000, 2000, 'Other'].map((amount) => (
                  <Button
                    key={amount.toString()}
                    variant={donationAmount === amount ? 'default' : 'outline'}
                    onClick={() => typeof amount === 'number' && setDonationAmount(amount)}
                    className="py-4"
                  >
                    {amount === 'Other' ? 'Other' : `₹${amount}`}
                  </Button>
                ))}
              </div>

              <div className="mb-6">
                <div id="cashfree-payment-form"></div>
              </div>

              <Button 
                onClick={handleDonateClick}
                className="w-full py-6"
                disabled={createPaymentOrder.isPending || isProcessing}
                size="lg"
              >
                {createPaymentOrder.isPending || isProcessing ? "Processing..." : `Donate ₹${donationAmount}`}
              </Button>

              <div className="text-center mt-4">
                <p className="text-xs text-slate-500">
                  <i className="bi bi-shield-lock me-1"></i> Your payment is secured with industry-standard encryption
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <h4 className="text-xl font-bold mb-6">Donation Summary</h4>

              <div className="flex items-center mb-6">
                <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden">
                  <img 
                    src={campaign?.imageUrl || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80"} 
                    alt={campaign?.title || "Campaign"} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-4">
                  <h5 className="font-bold mb-1">{campaign?.title || "Campaign Title"}</h5>
                  <p className="text-slate-500 text-sm">
                    {donation?.isMonthly ? "Monthly donation" : "One-time donation"}
                  </p>
                </div>
              </div>

              <div className="border-t border-b py-4 mb-4">
                <div className="flex justify-between">
                  <span>Donation amount</span>
                  <span className="font-medium">₹{donationAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-bold">Total</span>
                <span className="font-bold text-xl">₹{donationAmount.toFixed(2)}</span>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-md p-3 flex">
                <i className="bi bi-info-circle-fill text-blue-500 mr-2 mt-0.5"></i>
                <div className="text-sm text-blue-700">
                  Your donation may be tax deductible. You'll receive a receipt via email.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
          <div className="lg:col-span-1">
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}