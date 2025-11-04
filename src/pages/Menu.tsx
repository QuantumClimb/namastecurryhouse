
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart } from "lucide-react";
import { MenuCategory, MenuItem } from "../types/menu";
import { getMenuData } from "../services/menuService";
import { AddToCartButton } from "../components/AddToCartButton";
import { QuantityStepper } from "../components/QuantityStepper";
import { useItemCartQuantity } from "../hooks/useCartQuantity";
import useCartStore from "../stores/cartStore";
import { API_BASE_URL } from "../lib/apiConfig";

const MenuSection = ({ items, title }: { items: MenuItem[], title: string }) => {
  const placeholderImg = "/images/placeholder-food.svg";
  
  return (
    <div className="space-y-6">
      <h3 className="text-3xl font-bold gradient-text mb-8">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <MenuItemCard key={item.id || index} item={item} placeholderImg={placeholderImg} />
        ))}
      </div>
    </div>
  );
};

const MenuItemCard = ({ item, placeholderImg }: { item: MenuItem, placeholderImg: string }) => {
  const addItem = useCartStore(state => state.addItem);
  const items = useCartStore(state => state.items);
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  
  const cartQuantity = useItemCartQuantity(item);
  const isInCart = cartQuantity > 0;

  // Get the first cart item ID for this menu item (for updateQuantity/removeItem)
  const cartItemId = items.find(cartItem => cartItem.menuItem.id === item.id)?.id;

  const handleAddToCart = () => {
    // Add item with quantity 1, no customization for quick add
    addItem(item, 1);
  };

  const handleIncrement = () => {
    if (cartItemId) {
      // Get current cart item to update its quantity
      const currentCartItem = items.find(ci => ci.id === cartItemId);
      if (currentCartItem) {
        updateQuantity(cartItemId, currentCartItem.quantity + 1);
      }
    }
  };

  const handleDecrement = () => {
    if (cartItemId) {
      const currentCartItem = items.find(ci => ci.id === cartItemId);
      if (currentCartItem) {
        if (currentCartItem.quantity > 1) {
          updateQuantity(cartItemId, currentCartItem.quantity - 1);
        } else {
          // Remove item when quantity reaches 0
          removeItem(cartItemId);
        }
      }
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow overflow-hidden group">
      {/* Food Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={(() => {
            // Priority 1: Check if image is in database (no placeholder imageUrl, or has placeholder)
            // If imageUrl is null/empty OR is a placeholder, try database first
            if (!item.imageUrl || item.imageUrl.includes('placeholder')) {
              if (item.id) {
                const baseUrl = import.meta.env.DEV 
                  ? 'https://namastecurryhouse.vercel.app/api' 
                  : '/api';
                return `${baseUrl}/images/${item.id}`;
              }
            }
            // Priority 2: Use imageUrl if it exists and is not a placeholder
            if (item.imageUrl && !item.imageUrl.includes('placeholder')) {
              return item.imageUrl;
            }
            // Priority 3: Fallback to placeholder
            return placeholderImg;
          })()}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = placeholderImg;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-xl font-bold text-foreground">{item.name}</h4>
          <span className="text-lg font-bold text-accent">€{item.price.toFixed(2)}</span>
        </div>
        <p className="text-foreground/70 mb-4 leading-relaxed">{item.description}</p>
        {item.dietary && item.dietary.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {item.dietary.map((diet: string, idx: number) => (
              <Badge key={idx} className="bg-primary/20 text-primary border-primary/30">
                {diet}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {item.spiceLevel && (
              <Badge variant="outline" className="text-xs">
                {'🌶️'.repeat(item.spiceLevel)}
              </Badge>
            )}
            {item.namePt && (
              <span className="text-sm text-muted-foreground italic truncate">{item.namePt}</span>
            )}
          </div>
          
          {/* Conditional rendering: Stepper if in cart, Add button otherwise */}
          <div className="flex-shrink-0">
            {isInCart ? (
              <QuantityStepper
                quantity={cartQuantity}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                size="sm"
              />
            ) : (
              <Button 
                onClick={handleAddToCart}
                size="sm"
                className="gap-1"
              >
                <ShoppingCart className="w-4 h-4" />
                Add
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Menu = () => {
  const [menuData, setMenuData] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getMenuData()
      .then((data) => {
        setMenuData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Tabs: use categories from menuData
  const tabKeys = menuData.map((cat) => cat.name);
  const defaultTab = tabKeys[0] || "menu";

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section
        className="relative h-96 flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(139, 69, 19, 0.5), rgba(205, 133, 63, 0.4)), url('/images/new images/35.png')`
        }}
      >
        <div className="text-center z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white animate-fade-in">
            Our Menu
          </h1>
          <p className="text-xl text-white/90 animate-fade-in">
            Authentic Indian cuisine crafted with love and tradition
          </p>
        </div>
      </section>

      {/* Menu Content */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20 text-xl">Loading menu...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : (
          <Tabs defaultValue={defaultTab} className="space-y-8">
            <TabsList className="inline-flex w-full justify-start overflow-x-auto bg-card/50 backdrop-blur-sm border-primary/20 flex-wrap gap-2">
              {tabKeys.map((key) => (
                <TabsTrigger key={key} value={key} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
                  {key}
                </TabsTrigger>
              ))}
            </TabsList>
            {menuData.map((cat) => (
              <TabsContent key={cat.name} value={cat.name} className="space-y-8">
                <MenuSection items={cat.items} title={cat.name} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </section>
    </div>
  );
};

export default Menu;
