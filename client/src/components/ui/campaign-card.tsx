import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Campaign } from "@shared/mongodb-schema";
import { useRef } from "react";

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const percentFunded = Math.min(
    Math.round((Number(campaign.raisedAmount) / Number(campaign.goalAmount)) * 100),
    100
  );

  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Function to create ripple effect on button click
  const createRipple = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const button = event.currentTarget;
    
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - diameter / 2}px`;
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - diameter / 2}px`;
    circle.classList.add("ripple");
    
    const ripple = button.querySelector(".ripple");
    if (ripple) {
      ripple.remove();
    }
    
    button.appendChild(circle);
  };
  
  // Get badge style based on category
  const getBadgeStyle = (category: string) => {
    const styles = {
      Environment: "bg-gradient-to-r from-sky-100 to-blue-100 text-sky-800 border-sky-200 shadow-sm",
      Education: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200 shadow-sm",
      Healthcare: "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 shadow-sm",
      Hunger: "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200 shadow-sm",
      Disaster: "bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 border-rose-200 shadow-sm",
      Water: "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200 shadow-sm",
      Animals: "bg-gradient-to-r from-teal-100 to-green-100 text-teal-800 border-teal-200 shadow-sm",
      default: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200 shadow-sm"
    };

    return styles[category as keyof typeof styles] || styles.default;
  };

  return (
    <Card className="h-full card-hover group relative overflow-hidden bg-white hover:shadow-lg transition-all duration-300">
      <div className="aspect-video w-full overflow-hidden relative">
        <img 
          src={campaign.imageUrl} 
          alt={campaign.title} 
          className="h-full w-full object-cover transform transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-3">
          <Badge 
            variant="outline"
            className={`transition-all duration-300 ${getBadgeStyle(campaign.category)}`}
          >
            {campaign.category}
          </Badge>
          <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors duration-300 flex items-center">
            <i className="bi bi-clock me-1 transition-transform duration-300 group-hover:scale-110"></i>
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">
              {campaign.daysLeft} days left
            </span>
          </span>
        </div>
        
        <h3 className="text-lg font-bold mb-2 transition-colors duration-300 group-hover:text-primary">{campaign.title}</h3>
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{campaign.description}</p>
        
        <div className="mb-3">
          {/* <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-slate-900">
              ₹{Number(campaign.raisedAmount).toLocaleString()}
            </span>
            <span className="text-muted-foreground">
              of ₹{Number(campaign.goalAmount).toLocaleString()}
            </span>
          </div> */}
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
          {/* <div className="text-xs text-right mt-1 text-primary font-medium">
            {percentFunded}% funded
          </div> */}
        </div>
      </CardContent>
      
      <CardFooter className="px-5 pb-5 pt-0 flex justify-between items-center">
        <span className="text-sm text-muted-foreground flex items-center group-hover:text-slate-700 transition-colors duration-300">
          <i className="bi bi-people-fill me-1.5 text-primary/70 transition-transform duration-300 group-hover:scale-110"></i>
          <span>{campaign.donorCount} donors</span>
        </span>
        <Button 
          ref={buttonRef}
          className="donate-btn bg-primary text-white hover:bg-primary/90 relative overflow-hidden transition-all duration-300 transform group-hover:scale-105 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-1 rounded-full px-3 py-1 text-sm font-medium"
          onClick={(e: any) => createRipple(e)}
          asChild
          size="sm"
        >
          <Link href={`/campaigns/${campaign.id}`}>
            <span className="flex items-center">
              Donate Now
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-heart-fill ml-1 group-hover:animate-pulse" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
              </svg>

            </span>
          </Link>
        </Button>
      </CardFooter>
      
      {/* Decorative element */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-primary/10 rounded-full transition-all duration-500 ease-in-out group-hover:scale-150 group-hover:bg-primary/5"></div>
      {campaign.featured && (
        <div className="absolute top-3 right-3 flex items-center bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs py-1 px-2 rounded shadow-md animate-pulse">
          <i className="bi bi-star-fill me-1"></i>
          <span>Featured</span>
        </div>
      )}
      
      {/* Add CSS for ripple effect */}
      <style jsx global>{`
        .ripple {
          position: absolute;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
        }
        
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        .donate-btn {
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        
        .donate-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2));
          z-index: -1;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s ease-in-out;
        }
        
        .donate-btn:hover::before {
          transform: scaleX(1);
          transform-origin: left;
        }
      `}</style>
    </Card>
  );
}
