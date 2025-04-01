import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback, useRef } from "react";

// Carousel images and content
const carouselData = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
    title: "Make a difference today",
    description: "Your generosity can change lives. Join our mission to help those in need and create lasting impact in communities around the world."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
    title: "Empower communities worldwide",
    description: "Support projects that create sustainable change and help communities thrive through education, healthcare, and essential resources."
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
    title: "Every donation creates impact",
    description: "Whether big or small, your contribution matters. Join thousands of donors who are changing lives around the globe."
  }
];

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
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

  // Auto-advance the carousel
  const advanceCarousel = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveSlide((prev) => (prev + 1) % carouselData.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 700);
      }, 300);
    }
  }, [isTransitioning]);

  useEffect(() => {
    const interval = setInterval(advanceCarousel, 6000);
    return () => clearInterval(interval);
  }, [advanceCarousel]);

  // Manually change slide
  const goToSlide = (index: number) => {
    if (index !== activeSlide && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveSlide(index);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 700);
      }, 300);
    }
  };

  // Initialize button refs
  useEffect(() => {
    buttonRefs.current = buttonRefs.current.slice(0, carouselData.length);
  }, []);

  return (
    <section className="relative py-24 md:py-32 mb-16 bg-gradient-to-r from-slate-900 to-slate-800 text-white overflow-hidden">
      {/* Background overlay with subtle pattern */}
      <div className="absolute inset-0 bg-black/30 z-0"></div>
      
      {/* Carousel background with enhanced overlay */}
      <div className="carousel-container absolute inset-0">
        {carouselData.map((slide, index) => (
          <div 
            key={slide.id}
            className={`carousel-slide absolute inset-0 bg-cover bg-center transition-all duration-1500 ${index === activeSlide ? 'active' : ''}`}
            style={{ 
              backgroundImage: `url('${slide.image}')`,
              opacity: index === activeSlide ? 0.8 : 0,
              transform: `scale(${index === activeSlide ? '1' : '1.1'})`
            }}
          />
        ))}
      </div>
      
      {/* Subtle gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-1"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl ml-0 md:ml-12 lg:ml-24">
          {/* Carousel content with enhanced animations - left aligned */}
          {carouselData.map((slide, index) => (
            <div 
              key={slide.id}
              className={`transition-all duration-1000 ease-in-out ${
                index === activeSlide 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 absolute top-0 left-0 transform -translate-y-4'
              }`}
              style={{ display: index === activeSlide ? 'block' : 'none' }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent animate-fade-in text-left">
                {slide.title}
              </h1>
              <p className="text-xl mb-8 text-slate-200 animate-slide-up animate-delay-200 text-left max-w-xl">
                {slide.description}
              </p>
            </div>
          ))}
          
          <div className="flex flex-wrap gap-4 animate-slide-up animate-delay-300 justify-start">
            <Button 
              size="lg" 
              variant="destructive" 
              asChild
              className="btn-donate relative overflow-hidden py-6 px-8 text-lg font-semibold rounded-lg"
              onClick={(e: any) => createRipple(e)}
            >
              <Link href="#campaigns">Explore Campaigns</Link>
            </Button>
            <Button 
              size="lg" 
              variant="destructive" 
              asChild
              className="btn-donate relative overflow-hidden py-6 px-8 text-lg font-semibold rounded-lg"
              onClick={(e: any) => createRipple(e)}
            >
              <Link href="/campaigns">Donate Now</Link>
            </Button>

            <Button 
              size="lg" 
              variant="outline" 
              className="bg-transparent text-white border-white hover:bg-white hover:text-slate-900 hover:border-white py-6 px-8 text-lg font-semibold rounded-lg relative overflow-hidden transition-all duration-300"
              onClick={(e: any) => createRipple(e)}
              asChild
            >
            </Button>
          </div>
          
          {/* Enhanced carousel dots - left aligned */}
          <div className="flex justify-start mt-12 animate-slide-up animate-delay-400">
            {carouselData.map((_, index) => (
              <button
                key={index}
                ref={el => buttonRefs.current[index] = el}
                onClick={() => goToSlide(index)}
                className={`carousel-dot mx-2 ${index === activeSlide ? 'active' : ''}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Decorative element - animated arrow down */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </div>
    </section>
  );
}
