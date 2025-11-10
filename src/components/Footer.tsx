
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border" style={{ backgroundColor: '#000000' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Brand */}
          <div className="col-span-1 md:col-span-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
              <img 
                src="/logo.png" 
                alt="Namaste Curry House Logo" 
                className="h-12 w-12 object-contain"
              />
              <span className="text-3xl font-bold" style={{ color: '#D4AF37', fontFamily: 'Forum, serif' }}>Namaste Curry House</span>
            </div>
            <p className="mb-6 max-w-md mx-auto md:mx-0 text-white">
              Experience authentic Indian flavors and traditional hospitality. 
              Savor our carefully crafted curries, aromatic biryanis, and warm service in a welcoming atmosphere.
            </p>
            <div className="flex space-x-6 justify-center md:justify-start">
              <a href="https://www.facebook.com/profile.php?id=61562044322831" target="_blank" rel="noopener noreferrer" 
                 className="transition-colors hover:opacity-80 p-2" style={{ color: '#D4AF37' }}>
                <Facebook className="w-10 h-10" />
              </a>
              <a href="https://www.instagram.com/namastecurry.lisbon/" target="_blank" rel="noopener noreferrer"
                 className="transition-colors hover:opacity-80 p-2" style={{ color: '#D4AF37' }}>
                <Instagram className="w-10 h-10" />
              </a>
            </div>
          </div>

          {/* Legal & Support Links */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#D4AF37' }}>Legal & Support</h3>
            <ul className="space-y-2">
              <li><Link to="/customer-support" className="text-white transition-colors hover:opacity-80">Customer Support</Link></li>
              <li><Link to="/terms-and-conditions" className="text-white transition-colors hover:opacity-80">Terms and Conditions</Link></li>
              <li><Link to="/privacy-policy" className="text-white transition-colors hover:opacity-80">Privacy Policy</Link></li>
              <li><Link to="/cancellation-refund" className="text-white transition-colors hover:opacity-80">Cancellation & Refund</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#D4AF37' }}>Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 justify-center md:justify-start">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#D4AF37' }} />
                <p className="text-white">R. Agostinho Lourenço 339, 1000-011 Lisboa, Portugal</p>
              </div>
              <div className="flex items-center space-x-3 justify-center md:justify-start">
                <Phone className="w-5 h-5 flex-shrink-0" style={{ color: '#D4AF37' }} />
                <p className="text-white">+351 920 617 185</p>
              </div>
              <div className="flex items-center space-x-3 justify-center md:justify-start">
                <Mail className="w-5 h-5 flex-shrink-0" style={{ color: '#D4AF37' }} />
                <p className="text-white">info@namastecurryhouse.com</p>
              </div>
              <div className="flex items-start space-x-3 justify-center md:justify-start">
                <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#D4AF37' }} />
                <div className="text-white">
                  <p>Mon-Sun: 11AM - 10PM</p>
                  <p>Delivery: 11AM - 9:30PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center" style={{ borderColor: '#D4AF37' }}>
          <p className="text-white">
            © 2024 Namaste Curry House. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
