import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Campaign, Donation } from "@shared/schema";

export default function ThankYouPage() {
  const { donationId } = useParams<{ donationId: string }>();
  
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

  // We'd also fetch recommended campaigns in a real implementation
  const { data: recommendedCampaigns } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
  });

  const isLoading = isDonationLoading || isCampaignLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 animate-pulse">
        <div className="max-w-3xl mx-auto text-center">
          <div className="h-20 w-20 bg-slate-200 rounded-full mx-auto mb-6"></div>
          <div className="h-10 bg-slate-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-6 bg-slate-200 rounded w-2/3 mx-auto mb-8"></div>
          <div className="h-64 bg-slate-200 rounded mb-8"></div>
        </div>
      </div>
    );
  }

  // Simulate the donation data for the UI
  const simulatedDonation = {
    transactionId: "GH87654321",
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    paymentMethod: "Credit Card (•••• 4242)",
    amount: 100,
    fee: 3,
    totalAmount: 103
  };

  // Get two recommended campaigns, excluding the current one
  const filteredRecommendations = recommendedCampaigns?.filter(c => c.id !== campaignId).slice(0, 2) || [];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <div className="bg-success bg-opacity-10 rounded-full p-4 inline-flex justify-center items-center mb-6">
          <i className="bi bi-check-circle-fill text-success text-4xl"></i>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Thank You for Your Donation!</h1>
        <p className="text-xl mb-8">
          Your contribution of <span className="font-bold">${simulatedDonation.totalAmount.toFixed(2)}</span> to the {campaign?.title} will help {campaign?.description.toLowerCase()}
        </p>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-bold text-xl mb-4">Donation Receipt</h3>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-left">
              <div className="text-slate-500">Transaction ID:</div>
              <div className="text-right font-medium">{simulatedDonation.transactionId}</div>
              
              <div className="text-slate-500">Date:</div>
              <div className="text-right font-medium">{simulatedDonation.date}</div>
              
              <div className="text-slate-500">Payment Method:</div>
              <div className="text-right font-medium">{simulatedDonation.paymentMethod}</div>
              
              <div className="text-slate-500">Donation Amount:</div>
              <div className="text-right font-medium">${simulatedDonation.amount.toFixed(2)}</div>
              
              <div className="text-slate-500">Transaction Fee:</div>
              <div className="text-right font-medium">${simulatedDonation.fee.toFixed(2)}</div>
              
              <div className="text-slate-500 font-bold pt-2 border-t mt-2">Total:</div>
              <div className="text-right font-bold pt-2 border-t mt-2">${simulatedDonation.totalAmount.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
        
        <p className="mb-8">
          We've sent a receipt to your email. You'll receive updates about how your donation is making an impact.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Button size="lg" asChild>
            <Link href="/">
              <a>Return to Home</a>
            </Link>
          </Button>
          <Button variant="outline" size="lg">
            <i className="bi bi-share me-2"></i> Share on Social Media
          </Button>
        </div>
        
        {filteredRecommendations.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-6">Explore More Campaigns</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredRecommendations.map(campaign => (
                <Card key={campaign.id}>
                  <CardContent className="p-4">
                    <h4 className="font-bold mb-2">{campaign.title}</h4>
                    <div className="h-1.5 bg-slate-100 rounded-full mb-2">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ 
                          width: `${Math.min(Math.round((Number(campaign.raisedAmount) / Number(campaign.goalAmount)) * 100), 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        ${Number(campaign.raisedAmount).toLocaleString()} raised
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/campaigns/${campaign.id}`}>
                          <a>View</a>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
