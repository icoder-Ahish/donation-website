import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Function to check if a link is active
  const isActive = (path: string) => {
    // For homepage, only match exact '/'
    if (path === '/' && location === '/') return true;
    
    // For other pages, match the beginning of the path
    if (path !== '/' && location.startsWith(path)) return true;
    
    return false;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white bg-opacity-90 backdrop-blur-md shadow-sm py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary flex items-center">
            <i className="bi bi-heart-fill me-2 text-primary"></i>
            CareNest
          </Link>
          
          <button 
            className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            type="button"
            onClick={toggleMenu}
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16m-7 6h7" 
                />
              )}
            </svg>
          </button>
          
          <div className={`md:flex md:items-center ${isMenuOpen ? 'block absolute top-full left-0 right-0 bg-white shadow-md mt-1 py-4 px-4 md:relative md:shadow-none md:mt-0 md:py-0 md:bg-transparent' : 'hidden'}`}>
            <ul className="md:flex md:items-center space-y-4 md:space-y-0">
              <li className="md:mx-3">
                <Link href="/" 
                  className={`block px-2 py-1 hover:text-primary transition-colors ${isActive('/') ? 'text-primary font-medium' : 'text-gray-600'}`}
                  onClick={closeMenu}
                >
                  Home
                </Link>
              </li>
              <li className="md:mx-3">
                <Link href="/campaigns"
                  className={`block px-2 py-1 hover:text-primary transition-colors ${isActive('/campaigns') ? 'text-primary font-medium' : 'text-gray-600'}`}
                  onClick={closeMenu}
                >
                  Campaigns
                </Link>
              </li>
              <li className="md:mx-3">
                <Link href="/blog"
                  className={`block px-2 py-1 hover:text-primary transition-colors ${isActive('/blog') ? 'text-primary font-medium' : 'text-gray-600'}`}
                  onClick={closeMenu}
                >
                  Blog
                </Link>
              </li>
              <li className="md:mx-3">
                <Link href="/terms"
                  className={`block px-2 py-1 hover:text-primary transition-colors ${isActive('/terms') ? 'text-primary font-medium' : 'text-gray-600'}`}
                  onClick={closeMenu}
                >
                  Terms
                </Link>
              </li>
              <li className="md:mx-3">
                <Link href="/privacy"
                  className={`block px-2 py-1 hover:text-primary transition-colors ${isActive('/privacy') ? 'text-primary font-medium' : 'text-gray-600'}`}
                  onClick={closeMenu}
                >
                  Privacy
                </Link>

              </li>
              <li className="md:mx-3">
                <Link href="/refund"
                  className={`block px-2 py-1 hover:text-primary transition-colors ${isActive('/privacy') ? 'text-primary font-medium' : 'text-gray-600'}`}
                  onClick={closeMenu}
                >
                  Refund & Cancellation
                </Link>
                
              </li>
              <li className="md:ml-4">
                <Button 
                  variant="default" 
                  asChild 
                  className="donate-nav-btn w-full md:w-auto relative overflow-hidden transition-all duration-300 bg-primary text-white hover:bg-primary/90 hover:text-white hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 group"
                >
                  <Link href="/campaigns" onClick={closeMenu}>
                    <span className="flex items-center">
                      Donate Now
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="ml-1.5 transition-transform duration-300 group-hover:translate-x-0.5"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Add CSS for button animations */}
      <style jsx global>{`
        .donate-nav-btn {
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        
        .donate-nav-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.2), rgba(255,255,255,0));
          transition: left 0.7s ease;
          z-index: -1;
        }
        
        .donate-nav-btn:hover::before {
          left: 100%;
        }
        
        .donate-nav-btn::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: rgba(255,255,255,0.5);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.4s ease;
        }
        
        .donate-nav-btn:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }
        
        @keyframes pulse-subtle {
          0% {
            box-shadow: 0 0 0 0 rgba(var(--primary), 0.4);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(var(--primary), 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(var(--primary), 0);
          }
        }
        
        .donate-nav-btn:hover {
          animation: pulse-subtle 2s infinite;
        }
      `}</style>
    </nav>
  );
}
