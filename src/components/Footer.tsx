
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-midnight border-t border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/images/97a3f1c0-4793-4b37-9b8b-ca88ea090ffe.png" 
                alt="Namaste Curry House Logo" 
                className="h-12 w-12 rounded-full"
              />
              <span className="text-3xl font-bold gradient-text">Namaste Curry House</span>
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

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-foreground/70 hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-foreground/70 hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/menu" className="text-foreground/70 hover:text-primary transition-colors">Menu</Link></li>
              <li><Link to="/gallery" className="text-foreground/70 hover:text-primary transition-colors">Gallery</Link></li>
              <li><Link to="/reservation" className="text-foreground/70 hover:text-primary transition-colors">Reservation</Link></li>
              <li><Link to="/contact" className="text-foreground/70 hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <p className="text-foreground/70">Your Location, City, Country</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <p className="text-foreground/70">+60 12-345-6789</p>
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

        <div className="border-t border-primary/20 mt-8 pt-8 text-center">
          <p className="text-foreground/60">
            © 2024 Namaste Curry House. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
