import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext,
  CarouselIndicators 
} from "@/components/ui/carousel";

// Carousel images and content
const carouselData = [
  {
    id: 1,
    image: "img/slide-1.jpg",
    title: "Let's Change The World With Humanity",
    description: "Your generosity can change lives. Join our mission to help those in need and create lasting impact in communities around the world."
  },
  {
    id: 2,
    image: "img/slide-2.jpg",
    title: "Let's Save More Lives With Our Helping Hand",
    description: "Support projects that create sustainable change and help communities thrive through education, healthcare, and essential resources."
  },
  {
    id: 3,
    image: "img/slide-3.jpg",
    title: "Every donation creates impact",
    description: "Whether big or small, your contribution matters. Join thousands of donors who are changing lives around the globe."
  }
];

export default function HeroSection() {
  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);

  // Update current slide when API changes slides
  useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    
    // Start autoplay
    const autoplay = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => {
      api.off("select", onSelect);
      clearInterval(autoplay);
    };
  }, [api]);

  return (
    <div className="relative w-full mb-20 overflow-hidden">
      <Carousel 
        setApi={setApi}
        className="w-full"
        opts={{
          loop: true,
          align: "start",
        }}
      >
        <CarouselContent>
          {carouselData.map((slide, index) => (
            <CarouselItem key={slide.id} className="relative h-[600px]">
              <img 
                className="w-full h-full object-cover" 
                src={slide.image} 
                alt={`Carousel Image ${index + 1}`} 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://placehold.co/1200x600/333/white?text=Image+Not+Found";
                }}
              />
              
              {/* Orange gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-900/70 to-orange-500/50"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-3xl mx-auto text-center">
                    <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white ${
                      index === current ? 'animate-slideInDown' : ''
                    }`}>
                      {slide.title}
                    </h1>
                    <p className={`text-lg md:text-xl text-gray-200 mb-8 ${
                      index === current ? 'animate-slideInDown animation-delay-300' : ''
                    }`}>
                      {slide.description}
                    </p>
                    <Link href="/campaigns">
                      <Button 
                        className={`py-3 px-6 text-white bg-orange-500 hover:bg-orange-600 transition-all duration-300 border-2 border-white shadow-lg ${
                          index === current ? 'animate-slideInDown animation-delay-600' : ''
                        }`}
                      >
                        <span className="flex items-center">
                          Donate Now
                          <div className="inline-flex items-center justify-center ml-2 bg-white text-orange-500 rounded-full w-6 h-6">
                            <i className="bi bi-arrow-right"></i>
                          </div>
                        </span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="left-4 bg-orange-500 text-white hover:bg-orange-600 hover:text-white border-none" />
        <CarouselNext className="right-4 bg-orange-500 text-white hover:bg-orange-600 hover:text-white border-none" />
        
        <CarouselIndicators 
          count={carouselData.length} 
          className="absolute bottom-4 left-0 right-0"
        />
      </Carousel>
      
      {/* Add CSS for animations */}
      <style jsx global>{`
        @keyframes slideInDown {
          from {
            transform: translate3d(0, -50px, 0);
            opacity: 0;
            visibility: visible;
          }
          
          to {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
        }
        
        .animate-slideInDown {
          animation: slideInDown 1s both;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
}
