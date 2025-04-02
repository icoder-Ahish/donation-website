import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/ui/hero-section";
import CampaignCard from "@/components/ui/campaign-card";
import StatsSection from "@/components/ui/stats-section";
import HowItWorks from "@/components/ui/how-it-works";
import TeamSection from "@/components/ui/team-section";
import DonnerSection from "@/components/ui/testimonial-section";
import RecentSection from "@/components/ui/recent-donations";
import { Campaign } from "@shared/mongodb-schema";

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
          <Link href="/campaigns" className="text-primary hover:underline flex items-center">
            View all <i className="bi bi-arrow-right ms-1"></i>
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
      {/* Add the Team Section component here */}
      <TeamSection />

      <DonnerSection />

      <RecentSection />
      <HowItWorks />

      <section className="py-12 bg-orange-600 text-white mb-16 rounded-lg shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-3">Ready to make a difference?</h2>
              <p className="text-lg opacity-90">Join thousands of donors who are creating positive change around the world.</p>
            </div>
            <Button
              size="lg"
              variant="secondary"
              className="mt-6 md:mt-0 bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-all duration-300 shadow-md hover:shadow-lg border-2 border-white"
              asChild
            >
              <Link href="/campaigns">
                <span className="flex items-center">
                  Donate Today
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-heart-fill ml-2" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
                  </svg>
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </>
  );
}
