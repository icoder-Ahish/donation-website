import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white bg-opacity-90 backdrop-blur-md shadow-sm py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <a className="text-xl font-bold text-primary flex items-center">
              <i className="bi bi-heart-fill me-2 text-secondary"></i>
              GiveHope
            </a>
          </Link>
          
          <button 
            className="navbar-toggler md:hidden"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto flex md:flex-row items-center">
              <li className="nav-item mx-3">
                <Link href="/">
                  <a className="nav-link">Home</a>
                </Link>
              </li>
              <li className="nav-item mx-3">
                <Link href="/campaigns">
                  <a className="nav-link">Campaigns</a>
                </Link>
              </li>
              <li className="nav-item mx-3">
                <Link href="/blog">
                  <a className="nav-link">Blog</a>
                </Link>
              </li>
              <li className="nav-item mx-3">
                <Link href="/about">
                  <a className="nav-link">About Us</a>
                </Link>
              </li>
              <li className="nav-item ms-3">
                <Button variant="default" asChild>
                  <Link href="/#campaigns">
                    <a>Donate Now</a>
                  </Link>
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
