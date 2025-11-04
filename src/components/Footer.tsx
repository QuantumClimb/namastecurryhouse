
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/images/new images/35.png" 
                alt="Namaste Curry House Logo" 
                className="h-12 w-12 rounded-full object-cover"
              />
              <span className="text-3xl font-bold text-foreground">Namaste Curry House</span>
            </div>
            <p className="text-foreground/70 mb-6 max-w-md">
              Experience authentic Indian flavors and traditional hospitality. 
              Savor our carefully crafted curries, aromatic biryanis, and warm service in a welcoming atmosphere.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=61569936611862" target="_blank" rel="noopener noreferrer" 
                 className="text-foreground/70 hover:text-primary transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="https://www.instagram.com/namastecurryhouse/" target="_blank" rel="noopener noreferrer"
                 className="text-foreground/70 hover:text-primary transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Legal & Support Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Legal & Support</h3>
            <ul className="space-y-2">
              <li><Link to="/customer-support" className="text-foreground/70 hover:text-primary transition-colors">Customer Support</Link></li>
              <li><Link to="/terms-and-conditions" className="text-foreground/70 hover:text-primary transition-colors">Terms and Conditions</Link></li>
              <li><Link to="/privacy-policy" className="text-foreground/70 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cancellation-refund" className="text-foreground/70 hover:text-primary transition-colors">Cancellation & Refund</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <p className="text-foreground/70">R. Agostinho Lourenço 339, 1000-011 Lisboa, Portugal</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <p className="text-foreground/70">+351 920 617 185</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <p className="text-foreground/70">info@namastecurryhouse.com</p>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-foreground/70">
                  <p>Mon-Sun: 11AM - 10PM</p>
                  <p>Delivery: 11AM - 9:30PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2024 Namaste Curry House. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
