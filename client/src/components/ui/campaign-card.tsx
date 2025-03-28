import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Campaign } from "@shared/schema";

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const percentFunded = Math.min(
    Math.round((Number(campaign.raisedAmount) / Number(campaign.goalAmount)) * 100),
    100
  );
  
  return (
    <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="aspect-video w-full overflow-hidden">
        <img 
          src={campaign.imageUrl} 
          alt={campaign.title} 
          className="h-full w-full object-cover"
        />
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <Badge variant={
            campaign.category === "Environment" ? "info" : 
            campaign.category === "Education" ? "warning" : 
            campaign.category === "Healthcare" ? "success" : "default"
          }
          className={
            campaign.category === "Environment" ? "bg-sky-100 text-sky-800" : 
            campaign.category === "Education" ? "bg-amber-100 text-amber-800" : 
            campaign.category === "Healthcare" ? "bg-emerald-100 text-emerald-800" : ""
          }>
            {campaign.category}
          </Badge>
          <span className="text-sm text-muted-foreground">
            <i className="bi bi-clock me-1"></i>{campaign.daysLeft} days left
          </span>
        </div>
        
        <h3 className="text-lg font-bold mb-2">{campaign.title}</h3>
        <p className="text-sm text-slate-600 mb-4">{campaign.description}</p>
        
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold">${Number(campaign.raisedAmount).toLocaleString()}</span>
            <span className="text-muted-foreground">of ${Number(campaign.goalAmount).toLocaleString()}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded overflow-hidden">
            <div 
              className="h-full bg-primary rounded" 
              style={{ width: `${percentFunded}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          <i className="bi bi-people-fill me-1"></i>{campaign.donorCount} donors
        </span>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/campaigns/${campaign.id}`}>
            <a>Donate Now</a>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
