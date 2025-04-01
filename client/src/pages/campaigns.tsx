import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Campaign } from "@shared/mongodb-schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CampaignsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  
  const { data: campaigns = [], isLoading, error } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
    throwOnError: false
  });

  // Filter campaigns based on active category
  useEffect(() => {
    if (campaigns.length === 0) return;
    
    if (activeCategory === "All") {
      setFilteredCampaigns(campaigns);
    } else {
      setFilteredCampaigns(campaigns.filter((campaign) => campaign.category === activeCategory));
    }
  }, [campaigns, activeCategory]);

  // Get unique categories from campaigns
  const uniqueCategories = campaigns.length > 0 
    ? Array.from(new Set(campaigns.map((campaign) => campaign.category)))
    : [];
  const categories = ["All", ...uniqueCategories];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">All Campaigns</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Browse our active campaigns and find a cause you'd like to support. Your contribution can make a meaningful difference.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((category) => (
          <Button 
            key={category}
            variant={activeCategory === category ? "default" : "outline"} 
            className="rounded-full"
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-600">Loading campaigns...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-10">
          <p className="text-red-500">Error loading campaigns. Please try again later.</p>
        </div>
      )}

      {!isLoading && !error && filteredCampaigns && filteredCampaigns.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-600">No campaigns found in this category.</p>
        </div>
      )}

      {/* Campaigns grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCampaigns && filteredCampaigns.map((campaign: Campaign) => (
          <Card key={campaign.id} className="overflow-hidden flex flex-col h-full">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={campaign.imageUrl} 
                alt={campaign.title} 
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
              />
              <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 m-2 rounded">
                {campaign.category}
              </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-xl font-semibold mb-3">{campaign.title}</h3>
              <p className="text-gray-600 mb-4 flex-grow">{campaign.description}</p>
              
              {/* Progress bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (Number(campaign.raisedAmount) / Number(campaign.goalAmount)) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="font-medium">₹{Number(campaign.raisedAmount).toLocaleString()}</span>
                  <span className="text-gray-500">Goal: ₹{Number(campaign.goalAmount).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>{campaign.donorCount} Donors</span>
                <span>{campaign.daysLeft} Days Left</span>
              </div>
              
              <Button asChild className="w-full">
                <Link href={`/campaigns/${campaign.id}`}>
                  <a>Donate Now</a>
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}