import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/ui/hero-section";
import CampaignCard from "@/components/ui/campaign-card";
import StatsSection from "@/components/ui/stats-section";
import HowItWorks from "@/components/ui/how-it-works";
import { Campaign } from "@shared/schema";

export default function HomePage() {
  const { data: campaigns, isLoading, error } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
  });

  return (
    <>
      <HeroSection />
      
      <section className="container mx-auto px-4 mb-16" id="campaigns">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Campaigns</h2>
          <Link href="/campaigns">
            <a className="text-primary hover:underline flex items-center">
              View all <i className="bi bi-arrow-right ms-1"></i>
            </a>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="rounded-lg border p-4 h-96 animate-pulse bg-slate-100"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-danger mb-4">Failed to load campaigns</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns?.map(campaign => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </section>
      
      <StatsSection />
      
      <HowItWorks />
      
      <section className="py-12 bg-primary text-white mb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-3">Ready to make a difference?</h2>
              <p className="text-lg opacity-90">Join thousands of donors who are creating positive change around the world.</p>
            </div>
            <Button size="lg" variant="secondary" className="mt-6 md:mt-0 bg-white text-primary hover:bg-slate-100 hover:text-primary" asChild>
              <Link href="#campaigns">
                <a>Donate Today</a>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
