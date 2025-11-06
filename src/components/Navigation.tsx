
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "./CartDrawer";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Our Story", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Gallery", href: "/gallery" },
    { name: "Reservation", href: "/reservation" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border" style={{ backgroundColor: '#000000' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3" aria-label="Namaste Curry House Home">
              <img
                src="/logo.png"
                alt="Namaste Curry House Logo"
                className="h-14 w-14 md:h-12 md:w-12 object-contain drop-shadow-md"
                loading="eager"
              />
              <span className="text-2xl font-bold hidden md:inline" style={{ color: '#D4AF37', fontFamily: 'Forum, serif' }}>Namaste Curry House</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <div className="flex items-baseline space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                      isActive(item.href)
                        ? "text-white neon-glow"
                        : "hover:bg-transparent"
                    }`}
                    style={isActive(item.href) 
                      ? { backgroundColor: '#D4AF37', color: 'white' }
                      : { color: '#D4AF37' }
                    }
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <CartDrawer />
            </div>
          </div>
          
          <div className="md:hidden flex items-center space-x-2">
            <CartDrawer />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-transparent"
              style={{ color: '#D4AF37' }}
            >
              {isOpen ? <X size={40} /> : <Menu size={40} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 backdrop-blur-md" style={{ backgroundColor: '#000000' }}>
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? "text-primary bg-primary/10"
                    : "text-foreground/80 hover:text-primary hover:bg-primary/5"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
