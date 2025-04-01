import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <h5 className="font-bold mb-4">
              <Link href="/" className="text-white hover:text-primary flex items-center no-underline">
                <i className="bi bi-heart-fill mr-2 text-primary"></i>
                CareNest
              </Link>
            </h5>
            <p className="mb-4 text-slate-300">Making the world a better place through the power of collective generosity.</p>
            <div className="flex gap-4">
              <a href="#" className="text-white hover:text-primary transition-colors">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <h6 className="font-bold mb-4">Main Pages</h6>
            <ul className="space-y-2">
              <li><Link href="/" className="text-slate-300 hover:text-white no-underline">Home</Link></li>
              <li><Link href="/campaigns" className="text-slate-300 hover:text-white no-underline">All Campaigns</Link></li>
              <li><Link href="/blog" className="text-slate-300 hover:text-white no-underline">Blog</Link></li>
              <li><Link href="/terms" className="text-slate-300 hover:text-white no-underline">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="text-slate-300 hover:text-white no-underline">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div className="lg:col-span-1">
            <h6 className="font-bold mb-4">Featured Campaigns</h6>
            <ul className="space-y-2">
              <li><Link href="/campaigns/1" className="text-slate-300 hover:text-white no-underline">Clean Water Initiative</Link></li>
              <li><Link href="/campaigns/2" className="text-slate-300 hover:text-white no-underline">Education for All</Link></li>
              <li><Link href="/campaigns/3" className="text-slate-300 hover:text-white no-underline">Hunger Relief Program</Link></li>
              <li><Link href="/campaigns/4" className="text-slate-300 hover:text-white no-underline">Medical Supplies Drive</Link></li>
            </ul>
          </div>
          
          <div className="lg:col-span-1">
            <h6 className="font-bold mb-4">Contact Us</h6>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start">
                <i className="bi bi-geo-alt mr-2 mt-1"></i>
                <span>Word No. 37 Satna City, Madhya Pradesh, India</span>
              </li>
              <li className="flex items-start">
                <i className="bi bi-envelope mr-2 mt-1"></i>
                <span>carenestfoundation@gmail.com</span>
              </li>
              <li className="flex items-start">
                <i className="bi bi-telephone mr-2 mt-1"></i>
                <span>+91 7489589096</span>
              </li>
              <li className="flex items-start">
                <i className="bi bi-clock mr-2 mt-1"></i>
                <span>Mon-Fri: 9AM - 5PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400">© {new Date().getFullYear()} CareNest. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <select className="bg-slate-800 text-white border border-slate-700 rounded-md px-2 py-1 text-sm">
              <option value="en-US">English (US)</option>
            </select>
            <div className="flex gap-2">
              <Link href="/terms" className="text-sm text-slate-400 hover:text-white no-underline">Terms</Link>
              <span className="text-slate-600">|</span>
              <Link href="/privacy" className="text-sm text-slate-400 hover:text-white no-underline">Privacy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}