import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

export default function ThankYou() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Parse query parameters
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get('order_id');
        const donationId = params.get('donation_id');
        
        if (!orderId || !donationId) {
          setError("Missing payment information. Please try again.");
          setIsVerifying(false);
          return;
        }
        
        console.log("Verifying payment for order:", orderId, "donation:", donationId);
        
        try {
          // Verify the payment status
          const verificationResponse = await apiRequest("POST", "/api/payment/verify", {
            orderId: orderId
          });
          
          console.log("Payment verification response:", verificationResponse);
          
          if (verificationResponse.success) {
            setPaymentStatus(verificationResponse.paymentStatus);
            setPaymentDetails(verificationResponse.paymentDetails);
            
            if (verificationResponse.paymentStatus === "SUCCESS" || 
                verificationResponse.paymentStatus === "PAID") {
              toast({
                title: "Payment successful",
                description: "Thank you for your donation!",
              });
            } else {
              // Handle failed or canceled payments
              toast({
                title: "Payment not completed",
                description: `Payment status: ${verificationResponse.paymentStatus || "Unknown"}`,
                variant: "destructive",
              });
            }
          } else {
            setError(verificationResponse.message || "Failed to verify payment status.");
            toast({
              title: "Verification error",
              description: verificationResponse.message || "Failed to verify payment status.",
              variant: "destructive",
            });
          }
        } catch (apiError: any) {
          console.error("API error during payment verification:", apiError);
          setError("Failed to verify payment status. Please contact support.");
          toast({
            title: "Verification error",
            description: "We couldn't verify your payment status. Please contact support for assistance.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Payment verification error:", error);
        setError(error.message || "Failed to verify payment status.");
        toast({
          title: "Verification error",
          description: error.message || "Failed to verify payment status.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyPayment();
  }, [toast]);
  
  const isSuccess = paymentStatus === "SUCCESS" || paymentStatus === "PAID";
  
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      {isVerifying ? (
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
          <p className="text-slate-600">Please wait while we verify your payment...</p>
        </div>
      ) : error ? (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-red-600">Payment Verification Failed</h2>
          <p className="mb-6 text-slate-600">{error}</p>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      ) : isSuccess ? (
        <div>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Thank You for Your Donation!</h2>
          <p className="text-xl mb-8 text-slate-600">Your payment was successful and your donation has been received.</p>
          <p className="mb-8 text-slate-600">
            Your contribution makes a real difference. We'll send you an email with the receipt and details of your donation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/#campaigns">Explore More Campaigns</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Payment Status: {paymentStatus}</h2>
          <p className="text-xl mb-8 text-slate-600">
            {paymentStatus === "FAILED" ? 
              "Your payment was not successful. Please try again or use a different payment method." :
              paymentStatus === "CANCELLED" ?
              "Your payment was cancelled. You can try again whenever you're ready." :
              "Your payment is being processed. Please check your email for confirmation."}
          </p>
          <p className="mb-8 text-slate-600">
            If you have any questions or concerns, please contact our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
            {paymentStatus === "FAILED" || paymentStatus === "CANCELLED" ? (
              <Button variant="outline" asChild>
                <Link href={`/campaigns/${paymentDetails?.order_meta?.campaign_id || ""}`}>Try Again</Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
