import { Link } from "wouter";
import { Card } from "@/components/ui/card";
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

  return (
    <div className="causes-item d-flex flex-column bg-white border-top border-5 border-primary rounded-top overflow-hidden h-100 wow fadeInUp" data-wow-delay="0.1s">
      <div className="text-center p-4 pt-0">
        <div className="d-inline-block bg-orange-500 text-white rounded-bottom fs-5 pb-1 px-3 mb-4">
          <small>{campaign.category}</small>
        </div>
        
        <h5 className="mb-3">{campaign.title}</h5>
        <p className="line-clamp-2">{campaign.description}</p>
        
        <div className="causes-progress bg-light p-3 pt-2">
          <div className="d-flex justify-content-between">
            <p className="text-dark">
              ₹{Number(campaign.goalAmount).toLocaleString()} <small className="text-body">Goal</small>
            </p>
            <p className="text-dark">
              ₹{Number(campaign.raisedAmount).toLocaleString()} <small className="text-body">Raised</small>
            </p>
          </div>
          
          <div className="progress">
            <div 
              className="progress-bar bg-orange-500" 
              role="progressbar" 
              style={{ width: `${percentFunded}%` }}
              aria-valuenow={percentFunded} 
              aria-valuemin={0} 
              aria-valuemax={100}
            >
              <span>{percentFunded}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="position-relative mt-auto">
        <img className="img-fluid" src={campaign.imageUrl} alt={campaign.title} />
        <div className="causes-overlay">
          <Link href={`/campaigns/${campaign.id}`} className="btn btn-outline-primary">
            Read More
            <div className="d-inline-flex btn-sm-square bg-orange-500 text-white rounded-circle ms-2">
              <i className="bi bi-arrow-right"></i>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Add CSS for styling */}
      <style jsx="true" global="true">{`
        .causes-item {
          display: flex;
          flex-direction: column;
          background-color: white;
          border-top: 5px solid #f97316; /* orange-500 */
          border-radius: 0.375rem 0.375rem 0 0;
          overflow: hidden;
          height: 100%;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .causes-item:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .d-inline-block {
          display: inline-block;
        }
        
        .bg-orange-500 {
          background-color: #f97316;
        }
        
        .text-white {
          color: white;
        }
        
        .rounded-bottom {
          border-radius: 0 0 0.25rem 0.25rem;
        }
        
        .fs-5 {
          font-size: 1.25rem;
        }
        
        .pb-1 {
          padding-bottom: 0.25rem;
        }
        
        .px-3 {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        
        .mb-4 {
          margin-bottom: 1.5rem;
        }
        
        .mb-3 {
          margin-bottom: 1rem;
        }
        
        .text-dark {
          color: #212529;
        }
        
        .text-body {
          color: #6c757d;
        }
        
        .bg-light {
          background-color: #f8f9fa;
        }
        
        .p-3 {
          padding: 1rem;
        }
        
        .pt-2 {
          padding-top: 0.5rem;
        }
        
        .d-flex {
          display: flex;
        }
        
        .justify-content-between {
          justify-content: space-between;
        }
        
        .progress {
          height: 1rem;
          overflow: hidden;
          background-color: #e9ecef;
          border-radius: 0.25rem;
          margin-top: 0.5rem;
        }
        
        .progress-bar {
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
          color: #fff;
          text-align: center;
          white-space: nowrap;
          transition: width 0.6s ease;
        }
        
        .position-relative {
          position: relative;
        }
        
        .mt-auto {
          margin-top: auto;
        }
        
        .img-fluid {
          max-width: 100%;
          height: auto;
        }
        
        .causes-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.7);
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .causes-item:hover .causes-overlay {
          opacity: 1;
        }
        
        .btn {
          display: inline-block;
          font-weight: 400;
          line-height: 1.5;
          color: #212529;
          text-align: center;
          text-decoration: none;
          vertical-align: middle;
          cursor: pointer;
          user-select: none;
          background-color: transparent;
          border: 1px solid transparent;
          padding: 0.375rem 0.75rem;
          font-size: 1rem;
          border-radius: 0.25rem;
          transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        
        .btn-outline-primary {
          color: white;
          border-color: white;
          border-width: 2px;
          display: flex;
          align-items: center;
        }
        
        .btn-outline-primary:hover {
          color: #f97316;
          background-color: white;
        }
        
        .btn-sm-square {
          width: 24px;
          height: 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .rounded-circle {
          border-radius: 50%;
        }
        
        .ms-2 {
          margin-left: 0.5rem;
        }
        
        /* Animation for fadeInUp */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 30px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        .wow.fadeInUp {
          animation: fadeInUp 1s;
        }
        
        /* Line clamp for description */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
