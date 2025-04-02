import { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


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
  const receiptRef = useRef<HTMLDivElement>(null);
  // Reciept download function
  const downloadReceipt = () => {
    if (!paymentDetails) return;
    
    try {
      const doc = new jsPDF();
      
      // Add logo or header
      doc.setFontSize(22);
      doc.setTextColor(242, 88, 34); // Orange color
      doc.text("CareNest", 105, 20, { align: "center" });
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Donation Receipt", 105, 30, { align: "center" });
      
      // Add horizontal line
      doc.setDrawColor(242, 88, 34);
      doc.line(20, 35, 190, 35);
      
      // Add receipt details
      doc.setFontSize(12);
      doc.text("Order ID:", 20, 50);
      doc.text(paymentDetails.order_id || "N/A", 80, 50);
      
      doc.text("Amount:", 20, 60);
      doc.text(`${paymentDetails.order_amount || "N/A"}`, 80, 60);
      
      doc.text("Date:", 20, 70);
      const date = paymentDetails.created_at 
        ? new Date(paymentDetails.created_at).toLocaleDateString() 
        : new Date().toLocaleDateString();
      doc.text(date, 80, 70);
      
      doc.text("Payment Method:", 20, 80);
      doc.text(paymentDetails.payment_method?.type || "Online", 80, 80);
      
      doc.text("Status:", 20, 90);
      doc.setTextColor(0, 128, 0); // Green color for "Paid"
      doc.text("Paid", 80, 90);
      
      // Add footer
      doc.setDrawColor(242, 88, 34);
      doc.line(20, 100, 190, 100);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text("This receipt is proof of your donation to CareNest Foundation.", 105, 110, { align: "center" });
      doc.text("For any queries, please contact us at carenestfoundation@gmail.com", 105, 120, { align: "center" });
      
      doc.setFontSize(12);
      doc.setTextColor(242, 88, 34);
      doc.text("CareNest Foundation", 105, 140, { align: "center" });
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text("Making a difference together", 105, 147, { align: "center" });
      doc.text(`© ${new Date().getFullYear()} CareNest Foundation`, 105, 154, { align: "center" });
      
      doc.save(`CareNest_Receipt_${paymentDetails.order_id || 'donation'}.pdf`);
      
      toast({
        title: "Receipt Downloaded",
        description: "Your donation receipt has been downloaded successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "There was an error generating your receipt. Please try again.",
        variant: "destructive"
      });
    }
  };
  

  const isSuccess = paymentStatus === "SUCCESS" || paymentStatus === "PAID";

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {isVerifying ? (
          <div className="flex flex-col items-center justify-center p-10 text-center">
            <div className="w-20 h-20 mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
              <div className="absolute inset-3 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Verifying Your Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your donation...</p>
            <div className="mt-6 flex space-x-2">
              <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                <span className="mr-1">🔄</span> Processing
              </Badge>
              <Badge className="bg-orange-100 text-orange-800 px-3 py-1">
                <span className="mr-1">⏱️</span> Just a moment
              </Badge>
            </div>
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-red-600">Payment Verification Failed</h2>
            <p className="mb-6 text-gray-600">{error}</p>
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              <Badge className="bg-red-100 text-red-800 px-3 py-1">
                <span className="mr-1">❌</span> Error Detected
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1">
                <span className="mr-1">⚠️</span> Action Required
              </Badge>
            </div>
            <div className="mt-6">
              <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
                <Link href="/">Return to Home</Link>
              </Button>
              <Button variant="outline" className="ml-3 border-orange-300 text-orange-600 hover:bg-orange-50">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        ) : isSuccess ? (
          <div className="p-10 text-center">
            <div className="relative">
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-orange-100 rounded-full opacity-50"></div>
              <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-orange-100 rounded-full opacity-50"></div>
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center text-green-500 animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold mb-4 text-gray-800">Thank You for Your Donation!</h2>
                <div className="w-16 h-1 bg-orange-500 mx-auto mb-6"></div>
                <p className="text-xl mb-6 text-gray-600">Your payment was successful and your donation has been received.</p>
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  <Badge className="bg-green-100 text-green-800 px-3 py-1">
                    <span className="mr-1">✅</span> Payment Successful
                  </Badge>
                  <Badge className="bg-orange-100 text-orange-800 px-3 py-1">
                    <span className="mr-1">💖</span> Thank You
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
                    <span className="mr-1">🌟</span> Making a Difference
                  </Badge>
                </div>
                <div className="bg-orange-50 rounded-lg p-6 mb-8 max-w-md mx-auto">
                  <h3 className="font-semibold text-gray-800 mb-2">Your contribution makes a real difference</h3>
                  <p className="text-gray-600">
                    We'll send you an email with the receipt and details of your donation.
                  </p>
                  <Button 
                    onClick={downloadReceipt}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download" viewBox="0 0 16 16">
                      <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                      <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                    </svg>
                    Download Receipt
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Link href="/">Return to Home</Link>
                  </Button>
                  <Button variant="outline" asChild className="border-orange-300 text-orange-600 hover:bg-orange-50">
                    <Link href="/#campaigns">Explore More Campaigns</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Payment Status: <span className="text-orange-500">{paymentStatus}</span>
            </h2>
            <div className="w-16 h-1 bg-orange-500 mx-auto mb-6"></div>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {paymentStatus === "FAILED" ? (
                <Badge className="bg-red-100 text-red-800 px-3 py-1">
                  <span className="mr-1">❌</span> Payment Failed
                </Badge>
              ) : paymentStatus === "CANCELLED" ? (
                <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1">
                  <span className="mr-1">🛑</span> Payment Cancelled
                </Badge>
              ) : (
                <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                  <span className="mr-1">⏳</span> Payment Processing
                </Badge>
              )}
              <Badge className="bg-orange-100 text-orange-800 px-3 py-1">
                <span className="mr-1">📋</span> Status: {paymentStatus}
              </Badge>
            </div>
            <p className="text-xl mb-6 text-gray-600">
              {paymentStatus === "FAILED" ?
                "Your payment was not successful. Please try again or use a different payment method." :
                paymentStatus === "CANCELLED" ?
                  "Your payment was cancelled. You can try again whenever you're ready." :
                  "Your payment is being processed. Please check your email for confirmation."}
            </p>
            <div className="bg-orange-50 rounded-lg p-6 mb-8 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-800 mb-2">Need assistance?</h3>
              <p className="text-gray-600">
                If you have any questions or concerns, please contact our support team.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
                <Link href="/">Return to Home</Link>
              </Button>
              {paymentStatus === "FAILED" || paymentStatus === "CANCELLED" ? (
                <Button variant="outline" asChild className="border-orange-300 text-orange-600 hover:bg-orange-50">
                  <Link href={`/campaigns/${paymentDetails?.order_meta?.campaign_id || ""}`}>Try Again</Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                  onClick={() => {
                    toast({
                      title: "Contact Support",
                      description: "Please email us at carenestfoundation@gmail.com",
                      variant: "default"
                    });
                  }}
                >
                  Contact Support
                </Button>

              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
