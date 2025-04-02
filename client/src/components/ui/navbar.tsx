import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
// Update the getLinkClassName function in navbar.tsx
const getLinkClassName = (path: string) => {
  if (isActive(path)) {
    // Active link styling - add border, white background, black text, and blue shadow
    return 'text-black font-medium bg-white border border-black shadow-[0_0_10px_rgba(0,0,255,0.3)] rounded-md';
  }
  
  // On mobile when menu is open
  if (isMenuOpen && typeof window !== 'undefined' && !window.matchMedia('(min-width: 1024px)').matches) {
    return 'text-primary-foreground';
  }
  
  // Default state
  return 'text-white';
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
    <>
      {/* Top Bar - Only visible on large screens */}
      <div className="hidden lg:block bg-[#0F172A] text-white py-2 px-5 wow fadeIn" data-wow-delay="0.1s">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <small className="flex items-center mr-4">
                <i className="bi bi-geo-alt-fill mr-2"></i>
                City Satna, Madhya Pradesh,India
              </small>
              <small className="flex items-center">
                <i className="bi bi-envelope-fill mr-2"></i>
                carenestfoundation@gmail.com
              </small>
            </div>
            <div className="flex items-center">
              <small className="mr-3">Follow us:</small>
              <a href="#" className="text-white hover:text-gray-200 mx-2">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-white hover:text-gray-200 mx-2">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="text-white hover:text-gray-200 mx-2">
                <i className="bi bi-linkedin"></i>
              </a>
              <a href="#" className="text-white hover:text-gray-200 mx-2">
                <i className="bi bi-instagram"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0F172A] text-white py-3 wow fadeIn" data-wow-delay="0.1s">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold flex items-center">
              <h1 className="font-bold m-0">
                <span className="text-white">Care</span>
                <span className="text-secondary">Nest</span>
              </h1>
            </Link>

            <button
              className="lg:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
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

            <div className={`lg:flex lg:items-center ${isMenuOpen ? 'block absolute top-full left-0 right-0 bg-primary shadow-md mt-1 py-4 px-4 lg:relative lg:shadow-none lg:mt-0 lg:py-0 lg:bg-transparent' : 'hidden'}`}>
              <ul className="lg:flex lg:items-center space-y-4 lg:space-y-0 lg:mr-4">
                <li className="lg:mx-3">
                  <Link href="/"
className={`block px-2 py-1 hover:text-secondary transition-colors ${getLinkClassName('/')}`}                    onClick={closeMenu}
                  >
                    Home
                  </Link>
                </li>
                <li className="lg:mx-3">
                  <Link href="/campaigns"
className={`block px-2 py-1 hover:text-secondary transition-colors ${getLinkClassName('/campaigns')}`}                    onClick={closeMenu}
                  >
                    Campaigns
                  </Link>
                </li>
                <li className="lg:mx-3">
                  <Link href="/blog"
className={`block px-2 py-1 hover:text-secondary transition-colors ${getLinkClassName('/blog')}`}                   onClick={closeMenu}
                  >
                    Blog
                  </Link>
                </li>
                <li className="lg:mx-3">
                <Link href="/terms"
  className={`block px-2 py-1 hover:text-secondary transition-colors ${getLinkClassName('/terms')}`}
  onClick={closeMenu}
>
  Terms
</Link>
                </li>
                <li className="lg:mx-3">
                <Link href="/privacy"
  className={`block px-2 py-1 hover:text-secondary transition-colors ${getLinkClassName('/privacy')}`}
  onClick={closeMenu}
>
  Privacy
</Link>
                </li>
                <li className="lg:mx-3">
                <Link href="/refund"
  className={`block px-2 py-1 hover:text-secondary transition-colors ${getLinkClassName('/refund')}`}
  onClick={closeMenu}
>
  Refund & Cancellation
</Link>
                </li>
              </ul>

              <div className="hidden lg:block">
                <Button
                  variant="outline"
                  asChild
                  className="donate-nav-btn border-2 border-orange-500 text-black hover:bg-orange-500 hover:text-white transition-all duration-300"
                >
                  <Link href="/campaigns" onClick={closeMenu}>
                    <span className="flex items-center">
                      Donate Now
                      <span className="inline-flex items-center justify-center ml-2 bg-orange-500 text-white rounded-full w-5 h-5">
                        <i className="bi bi-arrow-right text-xs"></i>
                      </span>
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Add CSS for styling */}
      <style jsx="true" global="true">{`
      .donate-nav-btn {
        position: relative;
        overflow: hidden;
        z-index: 1;
      }
      .donate-nav-btn:hover {
          box-shadow: 0 0 15px rgba(249, 115, 22, 0.5);
          border: 1px solid white /* Orange shadow on hover */
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
        
        /* Add animation for the wow effect */
        .wow {
          visibility: visible !important;
        }
        
        .fadeIn {
          animation: fadeIn 1s ease-in-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
