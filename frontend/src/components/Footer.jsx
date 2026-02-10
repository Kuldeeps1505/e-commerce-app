import { Link } from 'react-router-dom'
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">About TradeHub</h3>
            <p className="text-sm mb-4 text-slate-400 leading-relaxed">
              Leading B2B marketplace connecting importers and exporters worldwide.
              Trusted by thousands of businesses.
            </p>
            <div className="flex gap-4">
              <Facebook size={20} className="cursor-pointer hover:text-primary-400 transition-colors" />
              <Twitter size={20} className="cursor-pointer hover:text-primary-400 transition-colors" />
              <Linkedin size={20} className="cursor-pointer hover:text-primary-400 transition-colors" />
              <Instagram size={20} className="cursor-pointer hover:text-primary-400 transition-colors" />
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
              <li><Link to="/categories" className="hover:text-primary-400 transition-colors">All Categories</Link></li>
              <li><Link to="/suppliers" className="hover:text-primary-400 transition-colors">Find Suppliers</Link></li>
              <li><Link to="/become-supplier" className="hover:text-secondary-400 transition-colors">Become a Supplier</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/help" className="hover:text-primary-400 transition-colors">Help Center</Link></li>
              <li><Link to="/terms" className="hover:text-primary-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin size={18} className="mt-0.5 flex-shrink-0 text-primary-400" />
                <span>123 Business Street, Trade City, TC 12345</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={18} className="flex-shrink-0 text-primary-400" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={18} className="flex-shrink-0 text-primary-400" />
                <span>info@tradehub.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-500">
          <p>&copy; 2025 TradeHub B2B Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
