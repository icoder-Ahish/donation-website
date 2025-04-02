import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";

// Carousel images and content - using placeholder images that we know work
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
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
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

  const goToPrevSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveSlide((prev) => (prev === 0 ? carouselData.length - 1 : prev - 1));
        setTimeout(() => {
          setIsTransitioning(false);
        }, 700);
      }, 300);
    }
  };

  const goToNextSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveSlide((prev) => (prev + 1) % carouselData.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 700);
      }, 300);
    }
  };

  return (
    <div className="container-fluid p-0 mb-5">
      <div id="header-carousel" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-inner relative w-full h-[600px]">
          {carouselData.map((slide, index) => (
            <div 
              key={slide.id}
              className={`carousel-item ${index === activeSlide ? 'active' : ''} relative w-full h-full`}
              style={{ 
                display: index === activeSlide ? 'block' : 'none',
                height: '600px'
              }}
            >
              <img 
                className="w-100 h-full object-cover" 
                src={slide.image} 
                alt={`Image ${index + 1}`}
              />
              
              {/* Orange gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-900/70 to-orange-500/50"></div>
              
              <div className="carousel-caption absolute inset-0 flex items-center justify-center">
                <div className="container mx-auto">
                  <div className="row justify-content-center">
                    <div className="col-lg-7 pt-5 text-center">
                      <h1 className="display-4 text-white mb-3 animated slideInDown text-4xl md:text-5xl font-bold">
                        {slide.title}
                      </h1>
                      <p className="fs-5 text-white-50 mb-5 animated slideInDown text-lg">
                        {slide.description}
                      </p>
                      <Link href="/campaigns">
                        <Button 
                          className="btn py-2 px-5 animated slideInDown bg-orange-500 text-white hover:bg-orange-600 transition-all duration-300 border-2 border-white shadow-lg"
                        >
                          Donate Now
                          <div className="d-inline-flex btn-sm-square bg-white text-orange-500 rounded-full ms-2 w-6 h-6 flex items-center justify-center ml-2">
                            <i className="bi bi-arrow-right"></i>
                          </div>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className="carousel-control-prev absolute top-1/2 left-4 transform -translate-y-1/2 z-10"
          type="button"
          onClick={goToPrevSlide}
        >
          <span className="carousel-control-prev-icon bg-orange-500 p-3 rounded-circle" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        
        <button 
          className="carousel-control-next absolute top-1/2 right-4 transform -translate-y-1/2 z-10"
          type="button"
          onClick={goToNextSlide}
        >
          <span className="carousel-control-next-icon bg-orange-500 p-3 rounded-circle" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
        

      {/* Carousel indicators with orange theme */}
      <div className="carousel-indicators absolute bottom-4 left-0 right-0 flex justify-center items-center z-10 space-x-2">
        {carouselData.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${index === activeSlide ? 'bg-orange-500 active' : 'bg-white bg-opacity-50'}`}
            onClick={() => goToSlide(index)}
            aria-label={`Slide ${index + 1}`}
          ></button>
        ))}
      </div>
      </div>
      
      {/* Add CSS for animations and orange theme */}
      <style jsx="true" global="true">{`
        .animated {
          animation-duration: 1s;
          animation-fill-mode: both;
        }
        
        .slideInDown {
          animation-name: slideInDown;
        }
        
        .carousel-indicators {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .carousel-indicators button {
          margin: 0 4px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        
        .carousel-indicators button:hover {
          background-color: #f97316 !important;
        }

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
        
        .carousel-item {
          position: relative;
        }
        
        .carousel-item.active {
          display: block;
        }
        
        .carousel-caption {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .carousel-control-prev-icon,
        .carousel-control-next-icon {
          display: inline-block;
          width: 2rem;
          height: 2rem;
          background-repeat: no-repeat;
          background-position: center;
          background-size: 50%;
          transition: all 0.3s ease;
        }
        
        .carousel-control-prev-icon:hover,
        .carousel-control-next-icon:hover {
          background-color: #ea580c !important;
          transform: scale(1.1);
        }
        
        .carousel-control-prev-icon {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'/%3e%3c/svg%3e");
        }
        
        .carousel-control-next-icon {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
        }
        
        /* Orange glow effect for buttons */
        .btn:hover {
          box-shadow: 0 0 15px rgba(249, 115, 22, 0.7);
        }
      `}</style>
    </div>
  );
}
