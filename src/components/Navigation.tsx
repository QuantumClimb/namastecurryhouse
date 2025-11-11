
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "./CartDrawer";
import { useLanguage } from "@/contexts/LanguageContext";

// Store status type
interface StoreStatus {
  id: number;
  isOpen: boolean;
  closedMessage: string | null;
  reopenTime: string | null;
}

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();
  
  // Store status state
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);
  const [loadingStoreStatus, setLoadingStoreStatus] = useState(true);

  // Fetch store status
  useEffect(() => {
    const fetchStoreStatus = async () => {
      try {
        const response = await fetch('/api/store-status');
        if (response.ok) {
          const data = await response.json();
          setStoreStatus(data);
        }
      } catch (err) {
        console.error('Failed to fetch store status:', err);
      } finally {
        setLoadingStoreStatus(false);
      }
    };
    
    fetchStoreStatus();
  }, []);

  const isStoreClosed = storeStatus?.isOpen === false;

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
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="px-3 py-2 text-sm font-medium hover:bg-transparent transition-all duration-300 flex items-center gap-2"
                style={{ color: '#D4AF37' }}
                title={language === 'en' ? 'Switch to Portuguese' : 'Mudar para Inglês'}
              >
                <Languages size={18} />
                <span className="font-bold">{language === 'en' ? 'PT' : 'EN'}</span>
              </Button>
              {!isStoreClosed && <CartDrawer />}
            </div>
          </div>
          
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="p-2 hover:bg-transparent transition-all duration-300"
              style={{ color: '#D4AF37' }}
              title={language === 'en' ? 'Switch to Portuguese' : 'Mudar para Inglês'}
            >
              <span className="text-sm font-bold">{language === 'en' ? 'PT' : 'EN'}</span>
            </Button>
            {!isStoreClosed && <CartDrawer />}
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
                    ? "text-white"
                    : "hover:bg-transparent"
                }`}
                style={isActive(item.href) 
                  ? { backgroundColor: '#D4AF37', color: 'white' }
                  : { color: '#D4AF37' }
                }
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
