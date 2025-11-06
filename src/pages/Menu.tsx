
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart } from "lucide-react";
import { MenuCategory, MenuItem } from "../types/menu";
import { getMenuData } from "../services/menuService";
import { QuantityStepper } from "../components/QuantityStepper";
import { useItemCartQuantity } from "../hooks/useCartQuantity";
import useCartStore from "../stores/cartStore";
import { API_BASE_URL } from "../lib/apiConfig";
import { SpiceLevelDialog } from "../components/SpiceLevelDialog";
import { RepeatCustomizationDialog } from "../components/RepeatCustomizationDialog";
import { CartCustomization } from "../types/cart";

// Track last selected spice level for each menu item (outside component for persistence)
const lastSpiceLevels = new Map<string, number>();

const MenuSection = ({ items, title }: { items: MenuItem[], title: string }) => {
  const placeholderImg = "/images/placeholder-food.svg";
  
  return (
    <div className="space-y-6">
      <h3 className="text-3xl font-bold text-foreground mb-8">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <MenuItemCard key={item.id || index} item={item} placeholderImg={placeholderImg} />
        ))}
      </div>
    </div>
  );
};

const MenuItemCard = ({ item, placeholderImg }: { item: MenuItem, placeholderImg: string }) => {
  console.log('MenuItemCard rendering:', { 
    itemId: item.id, 
    itemName: item.name, 
    hasSpiceCustomization: item.hasSpiceCustomization,
    hasSpiceCustomizationType: typeof item.hasSpiceCustomization
  });
  
  const [isSpiceDialogOpen, setIsSpiceDialogOpen] = useState(false);
  const [isRepeatDialogOpen, setIsRepeatDialogOpen] = useState(false);
  
  const { items, removeItem, updateQuantity, addItem } = useCartStore(state => ({
    items: state.items,
    removeItem: state.removeItem,
    updateQuantity: state.updateQuantity,
    addItem: state.addItem
  }));
  
  const cartQuantity = useItemCartQuantity(item);
  const isInCart = cartQuantity > 0;

  // Get the first cart item ID for this menu item (for updateQuantity/removeItem)
  const cartItemId = items.find(cartItem => cartItem.menuItem.id === item.id)?.id;

  const handleAddToCart = () => {
    console.log('handleAddToCart called for:', item.name, { hasSpiceCustomization: item.hasSpiceCustomization });
    
    // Check if item has spice customization enabled
    if (item.hasSpiceCustomization === true) {
      console.log('Item has spice customization, checking cart status...');
      // Check if we've added this item before
      const lastSpiceLevel = lastSpiceLevels.get(item.id);
      
      if (isInCart && lastSpiceLevel !== undefined) {
        console.log('Opening repeat dialog, last spice level:', lastSpiceLevel);
        // Item already in cart and we have a previous spice level - show repeat dialog
        setIsRepeatDialogOpen(true);
      } else {
        console.log('Opening spice level dialog for first time');
        // First time adding or no previous spice level - show spice dialog
        setIsSpiceDialogOpen(true);
      }
    } else {
      console.log('No customization, adding directly to cart');
      // No customization needed - add directly
      addItem(item, 1);
    }
  };

  const handleSpiceLevelConfirm = (spiceLevel: number) => {
    console.log('Spice level confirmed:', spiceLevel, 'for item:', item.name);
    // Store the spice level for this menu item
    lastSpiceLevels.set(item.id, spiceLevel);
    
    // Add item to cart with spice level
    const customization: CartCustomization = {
      spiceLevel
    };
    addItem(item, 1, customization);
  };

  const handleRepeatCustomization = () => {
    console.log('Repeating previous customization for:', item.name);
    // Use the same spice level as before
    const lastSpiceLevel = lastSpiceLevels.get(item.id);
    if (lastSpiceLevel !== undefined) {
      const customization: CartCustomization = {
        spiceLevel: lastSpiceLevel
      };
      addItem(item, 1, customization);
    }
    setIsRepeatDialogOpen(false);
  };

  const handleNewCustomization = () => {
    console.log('Requesting new customization for:', item.name);
    // Close repeat dialog and open spice dialog for new selection
    setIsRepeatDialogOpen(false);
    setIsSpiceDialogOpen(true);
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

  const imageUrl = (() => {
    try {
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
    } catch (error) {
      console.error('Error generating imageUrl for item:', item.name, error);
      return placeholderImg;
    }
  })();

  console.log('Rendering card for:', item.name, { imageUrl, isInCart, cartQuantity });

  return (
    <>
      {/* Mobile Layout - Horizontal Card */}
      <Card className="md:hidden bg-card/50 backdrop-blur-sm border-primary/20 neon-glow overflow-hidden group flex flex-row items-center p-3 relative menu-item-card">
        {/* Dietary Indicator - Top Right */}
        {item.dietary && item.dietary.length > 0 && (
          <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-md" title={item.dietary.join(', ')} />
        )}
        
        {/* Left: Food Image */}
        <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = placeholderImg;
            }}
          />
        </div>

        {/* Center: Content */}
        <div className="flex-1 px-3 py-1 min-w-0 text-left">
          <h4 className="text-base font-bold text-foreground truncate mb-1">{item.name}</h4>
          <p className="text-xs text-foreground/60 line-clamp-1 mb-2">{item.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-accent">€{item.price.toFixed(2)}</span>
            {item.hasSpiceCustomization === true && (
              <span className="text-xs">🌶️</span>
            )}
          </div>
        </div>

        {/* Right: Add Button */}
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
              className="rounded-full px-6"
            >
              Add
            </Button>
          )}
        </div>
      </Card>

      {/* Desktop Layout - Vertical Card */}
      <Card className="hidden md:block bg-card/50 backdrop-blur-sm border-primary/20 neon-glow overflow-hidden group menu-item-card">
        {/* Food Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
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
              {item.hasSpiceCustomization === true && (
                <Badge variant="outline" className="text-xs">
                  🌶️ Customizable
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

      {/* Spice Customization Dialogs */}
      {item.hasSpiceCustomization === true && (
        <>
          <SpiceLevelDialog
            open={isSpiceDialogOpen}
            onOpenChange={setIsSpiceDialogOpen}
            onConfirm={handleSpiceLevelConfirm}
            itemName={item.name}
          />

          <RepeatCustomizationDialog
            open={isRepeatDialogOpen}
            onOpenChange={setIsRepeatDialogOpen}
            onRepeat={handleRepeatCustomization}
            onCustomize={handleNewCustomization}
            itemName={item.name}
            previousSpiceLevel={lastSpiceLevels.get(item.id) || 0}
          />
        </>
      )}
    </>
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
      {/* Menu Content */}
      <section className="py-8 px-4 max-w-7xl mx-auto menu-page-section">
        {loading ? (
          <div className="text-center py-20 text-xl">Loading menu...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : (
          <Tabs defaultValue={defaultTab} className="space-y-8">
            <TabsList className="inline-flex w-full justify-start overflow-x-auto bg-card/50 backdrop-blur-sm border-primary/20 md:flex-wrap gap-2 scrollbar-hide">
              {tabKeys.map((key) => (
                <TabsTrigger key={key} value={key} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap flex-shrink-0">
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
