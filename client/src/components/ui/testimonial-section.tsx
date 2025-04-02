import { useState, useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Testimonial data
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    profession: "Teacher",
    image: "/img/testimonial-1.jpg",
    text: "I've been donating through CareNest for over a year now, and I'm impressed by the transparency and impact. It's wonderful to see exactly how my contributions are making a difference in people's lives."
  },
  {
    id: 2,
    name: "Michael Chen",
    profession: "Software Engineer",
    image: "/img/testimonial-2.jpg",
    text: "What I appreciate most about CareNest is how easy they make it to support causes I care about. The platform is intuitive, and I can set up recurring donations in just a few clicks."
  },
  {
    id: 3,
    name: "Priya Sharma",
    profession: "Healthcare Worker",
    image: "/img/testimonial-3.jpg",
    text: "As someone who works in healthcare, I've seen firsthand the impact that donations can have. CareNest connects donors with meaningful projects that truly change lives for the better."
  },
  {
    id: 4,
    name: "Michael Chen",
    profession: "Software Engineer",
    image: "/img/testimonial-2.jpg",
    text: "What I appreciate most about CareNest is how easy they make it to support causes I care about. The platform is intuitive, and I can set up recurring donations in just a few clicks."
  },
  {
    id: 5,
    name: "Priya Sharma",
    profession: "Healthcare Worker",
    image: "/img/testimonial-3.jpg",
    text: "As someone who works in healthcare, I've seen firsthand the impact that donations can have. CareNest connects donors with meaningful projects that truly change lives for the better."
  }
];

export default function TestimonialSection() {
  const [isVisible, setIsVisible] = useState(false);

  // Simple animation on component mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="container mx-auto py-16 mb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section heading with animation */}
        <div 
          className={`text-center mx-auto mb-12 transition-all duration-1000 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ maxWidth: "500px" }}
        >
          <div className="inline-block rounded-full bg-orange-100 text-orange-600 py-1 px-3 mb-3">
            Testimonial
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-5">Trusted By Thousands Of People And Nonprofits</h1>
        </div>

        {/* Testimonial carousel with animation */}
        <div 
          className={`transition-all duration-1000 delay-300 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="testimonial-item text-center px-4 py-2">
                    {/* Profile image */}
                    <img 
                      className="w-24 h-24 bg-orange-50 rounded-full p-2 mx-auto mb-4 object-cover border border-orange-100 shadow-md"
                      src={testimonial.image}
                      alt={testimonial.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/200x200/orange/white?text=Person";
                      }}
                    />
                    
                    {/* Testimonial text */}
                    <div className="testimonial-text rounded-lg bg-orange-50 text-center p-4 shadow-md relative">
                      <p className="text-slate-600 mb-4">{testimonial.text}</p>
                      <h5 className="text-lg font-semibold mb-1">{testimonial.name}</h5>
                      <span className="italic text-orange-500">{testimonial.profession}</span>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Carousel navigation */}
            <div className="flex justify-center mt-8 gap-2">
              <CarouselPrevious className="relative inset-0 translate-y-0 bg-orange-500 text-white hover:bg-orange-600 hover:text-white" />
              <CarouselNext className="relative inset-0 translate-y-0 bg-orange-500 text-white hover:bg-orange-600 hover:text-white" />
            </div>
          </Carousel>
        </div>
      </div>
      
      {/* Add CSS for testimonial styling */}
      <style jsx>{`
        .testimonial-text {
          position: relative;
        }
        
        .testimonial-text::after {
          content: '';
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 10px;
          border-style: solid;
          border-color: transparent transparent #fff8f0 transparent;
        }
      `}</style>
    </div>
  );
}
