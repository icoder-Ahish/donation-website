import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Donation, Campaign, paymentSchema, Payment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function PaymentPage() {
  const { donationId } = useParams<{ donationId: string }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'paypal'>('card');

  const { data: donation, isLoading: isDonationLoading } = useQuery<Donation>({
    queryKey: [`/api/donations/${donationId}`],
    // Since we don't have this endpoint, we'll simulate it by showing a loading state
    // In a real implementation, this would fetch the donation details
  });

  // We'd also fetch the campaign details in a real implementation
  const campaignId = 1; // This would come from the donation
  const { data: campaign, isLoading: isCampaignLoading } = useQuery<Campaign>({
    queryKey: [`/api/campaigns/${campaignId}`],
  });

  const form = useForm<Payment>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      donationId: parseInt(donationId),
      cardName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      billingAddress: ""
    }
  });

  const processPayment = useMutation({
    mutationFn: async (data: Payment) => {
      const response = await apiRequest("POST", "/api/payments", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment successful",
        description: "Your donation has been processed successfully.",
      });
      navigate(`/thank-you/${donationId}`);
    },
    onError: (error) => {
      toast({
        title: "Payment failed",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  });

  function onSubmit(data: Payment) {
    processPayment.mutate(data);
  }

  const isLoading = isDonationLoading || isCampaignLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-12 bg-slate-200 rounded mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-12 bg-slate-200 rounded"></div>
                <div className="h-12 bg-slate-200 rounded"></div>
              </div>
              <div className="h-12 bg-slate-200 rounded mb-4"></div>
              <div className="h-32 bg-slate-200 rounded mb-4"></div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-64 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Since we don't have the actual donation data, let's simulate it for the UI
  const simulatedDonation = {
    id: parseInt(donationId),
    campaignId: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    amount: 100,
    coverFees: true,
    isMonthly: false,
    totalAmount: 103
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/">
                <a className="text-sm text-slate-600 hover:text-primary">Home</a>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-slate-400">/</span>
                <Link href="/#campaigns">
                  <a className="text-sm text-slate-600 hover:text-primary">Campaigns</a>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-slate-400">/</span>
                <Link href={`/campaigns/${campaign?.id || 1}`}>
                  <a className="text-sm text-slate-600 hover:text-primary">{campaign?.title || "Campaign"}</a>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-slate-400">/</span>
                <span className="text-sm text-slate-500">Payment</span>
              </div>
            </li>
          </ol>
        </nav>
        
        <h2 className="text-3xl font-bold">Payment Information</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Select Payment Method</h4>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`p-4 border rounded-md text-center cursor-pointer transition-all
                  ${selectedPaymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}
                onClick={() => setSelectedPaymentMethod('card')}
              >
                <i className="bi bi-credit-card text-2xl mb-2 block"></i>
                <p className="font-medium">Credit / Debit Card</p>
              </div>
              <div 
                className={`p-4 border rounded-md text-center cursor-pointer transition-all
                  ${selectedPaymentMethod === 'paypal' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}
                onClick={() => setSelectedPaymentMethod('paypal')}
              >
                <i className="bi bi-paypal text-2xl mb-2 block"></i>
                <p className="font-medium">PayPal</p>
              </div>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="cardName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name on Card</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Input 
                          {...field} 
                          className="rounded-r-none" 
                          placeholder="XXXX XXXX XXXX XXXX"
                        />
                        <div className="inline-flex items-center px-3 bg-slate-50 border border-l-0 border-slate-300 rounded-r-md">
                          <i className="bi bi-credit-card"></i>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="MM/YY" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="XXX" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="billingAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full py-6 mt-4" 
                disabled={processPayment.isPending}
              >
                {processPayment.isPending ? "Processing..." : "Complete Payment"} 
                <i className="bi bi-lock-fill ms-2"></i>
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-slate-500">
                  <i className="bi bi-shield-lock me-1"></i> Your payment is secured with industry-standard encryption
                </p>
              </div>
            </form>
          </Form>
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
                    {simulatedDonation.isMonthly ? "Monthly donation" : "One-time donation"}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-b py-4 mb-4 space-y-2">
                <div className="flex justify-between">
                  <span>Donation amount</span>
                  <span className="font-medium">${simulatedDonation.amount.toFixed(2)}</span>
                </div>
                
                {simulatedDonation.coverFees && (
                  <div className="flex justify-between">
                    <span>Transaction fee</span>
                    <span className="font-medium">$3.00</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between mb-6">
                <span className="font-bold">Total</span>
                <span className="font-bold text-xl">${simulatedDonation.totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center">
                  <Checkbox id="emailReceipt" defaultChecked />
                  <label htmlFor="emailReceipt" className="ml-2 text-sm">
                    Email me a receipt
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="stayAnonymous" />
                  <label htmlFor="stayAnonymous" className="ml-2 text-sm">
                    Keep my donation anonymous
                  </label>
                </div>
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
