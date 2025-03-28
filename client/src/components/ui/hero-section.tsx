import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative py-20 mb-16 bg-gradient-to-r from-slate-900 to-slate-800 text-white overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-20" 
           style={{ 
             backgroundImage: "url('https://images.unsplash.com/photo-1469571486292-b53601010b89?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')", 
             backgroundColor: 'rgba(38, 50, 56, 0.7)' 
           }}>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Make a difference today</h1>
          <p className="text-xl mb-8 text-slate-200">Your generosity can change lives. Join our mission to help those in need and create lasting impact in communities around the world.</p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" variant="destructive" asChild>
              <Link href="#campaigns">
                <a>Explore Campaigns</a>
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-slate-900">
              <Link href="#how-it-works">
                <a>Learn More</a>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
