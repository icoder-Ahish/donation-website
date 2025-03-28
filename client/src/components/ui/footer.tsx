import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <h5 className="font-bold mb-4">
              <i className="bi bi-heart-fill me-2 text-secondary"></i>
              GiveHope
            </h5>
            <p className="mb-4 text-slate-300">Making the world a better place through the power of collective generosity.</p>
            <div className="flex gap-4">
              <a href="#" className="text-white hover:text-secondary transition-colors">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-white hover:text-secondary transition-colors">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="text-white hover:text-secondary transition-colors">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="text-white hover:text-secondary transition-colors">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <h6 className="font-bold mb-4">About</h6>
            <ul className="space-y-2">
              <li><Link href="/about"><a className="text-slate-300 hover:text-white no-underline">Our Story</a></Link></li>
              <li><Link href="/team"><a className="text-slate-300 hover:text-white no-underline">Team</a></Link></li>
              <li><Link href="/press"><a className="text-slate-300 hover:text-white no-underline">Press</a></Link></li>
            </ul>
          </div>
          
          <div className="lg:col-span-1">
            <h6 className="font-bold mb-4">Resources</h6>
            <ul className="space-y-2">
              <li><Link href="/blog"><a className="text-slate-300 hover:text-white no-underline">Blog</a></Link></li>
              <li><Link href="/guides"><a className="text-slate-300 hover:text-white no-underline">Guides</a></Link></li>
              <li><Link href="/faq"><a className="text-slate-300 hover:text-white no-underline">FAQ</a></Link></li>
              <li><Link href="/help"><a className="text-slate-300 hover:text-white no-underline">Help Center</a></Link></li>
            </ul>
          </div>
          
          <div className="lg:col-span-1">
            <h6 className="font-bold mb-4">Legal</h6>
            <ul className="space-y-2">
              <li><Link href="/terms"><a className="text-slate-300 hover:text-white no-underline">Terms</a></Link></li>
              <li><Link href="/privacy"><a className="text-slate-300 hover:text-white no-underline">Privacy</a></Link></li>
            </ul>
          </div>
          
          <div className="lg:col-span-1">
            <h6 className="font-bold mb-4">Contact</h6>
            <ul className="space-y-2">
              <li><Link href="/support"><a className="text-slate-300 hover:text-white no-underline">Support</a></Link></li>
              <li><Link href="/partnerships"><a className="text-slate-300 hover:text-white no-underline">Partnerships</a></Link></li>
              {/* <li><Link href="/sponsorships"><a className="text-slate-300 hover:text-white no-underline">Sponsorships</a></Link></li> */}
              <li><Link href="/contact"><a className="text-slate-300 hover:text-white no-underline">Contact Us</a></Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400">© {new Date().getFullYear()} GiveHope. All rights reserved.</p>
          {/* <div className="mt-4 md:mt-0">
            <select className="form-select form-select-sm bg-slate-800 text-white border-slate-700">
              <option selected>English (US)</option>
              <option>Español</option>
              <option>Français</option>
              <option>Deutsch</option>
            </select>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
