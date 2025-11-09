import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import useCartStore from '../stores/cartStore';
import { CartItem, CartCustomization } from '../types/cart';
import { SpiceLevelDialog } from './SpiceLevelDialog';
import { RepeatCustomizationDialog } from './RepeatCustomizationDialog';
import { MenuItemImage } from './MenuItemImage';

interface CartDrawerProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CartItemComponentProps {
  item: CartItem;
  onShowSpiceDialog: (itemId: string) => void;
  onShowRepeatDialog: (itemId: string) => void;
}

const CartItemComponent: React.FC<CartItemComponentProps> = ({ 
  item, 
  onShowSpiceDialog, 
  onShowRepeatDialog 
}) => {
  const { updateQuantity, removeItem } = useCartStore();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleIncrement = () => {
    // If item has spice customization, show dialogs instead of directly incrementing
    if (item.menuItem.hasSpiceCustomization === true) {
      // Check if this specific cart item already has a spice level
      const currentSpiceLevel = item.customization?.spiceLevel;
      if (currentSpiceLevel !== undefined) {
        // This cart item already has a spice level - show repeat dialog
        onShowRepeatDialog(item.id);
      } else {
        // This cart item doesn't have a spice level yet - show spice dialog
        onShowSpiceDialog(item.id);
      }
    } else {
      // No customization - directly increment
      handleQuantityChange(item.quantity + 1);
    }
  };

  const handleDecrement = () => {
    handleQuantityChange(item.quantity - 1);
  };

  const getSpiceLevelDisplay = (level?: number) => {
    if (level === undefined) return '';
    if (level === 0) return '🔵 No Spice';
    if (level === 25) return '🌶️ Mild';
    if (level === 50) return '🌶️🌶️ Medium';
    if (level === 75) return '🌶️🌶️🌶️ Hot';
    if (level === 100) return '🌶️🌶️🌶️🌶️ Extra Hot';
    return `🌶️ ${level}% Spicy`;
  };

  return (
    <div className="flex items-start space-x-3 p-3 border rounded-lg">
      {/* Menu Item Image */}
      <MenuItemImage 
        menuItem={item.menuItem}
        size="small"
        className="rounded-md"
      />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{item.menuItem.name}</h4>
        <p className="text-xs text-muted-foreground mb-2">€{item.menuItem.price.toFixed(2)} each</p>
        
        {/* Customizations */}
        {item.customization && (
          <div className="space-y-1 mb-2">
            {item.customization.spiceLevel !== undefined && (
              <div className="text-xs text-muted-foreground">
                {getSpiceLevelDisplay(item.customization.spiceLevel)}
              </div>
            )}
            {item.customization.extras && item.customization.extras.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.customization.extras.map((extra, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {extra}
                  </Badge>
                ))}
              </div>
            )}
            {item.customization.specialInstructions && (
              <p className="text-xs text-muted-foreground italic">
                "{item.customization.specialInstructions}"
              </p>
            )}
          </div>
        )}

        {/* Quantity Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={handleDecrement}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            className="h-6 w-12 text-center text-xs p-1"
            min="1"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={handleIncrement}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="text-right">
        <p className="font-medium text-sm">€{item.totalPrice.toFixed(2)}</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 mt-1 text-destructive hover:text-destructive"
          onClick={() => removeItem(item.id)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export const CartDrawer: React.FC<CartDrawerProps> = ({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}) => {
  const [open, setOpen] = useState(controlledOpen ?? false);
  const { items, total, itemCount, clearCart, addItem } = useCartStore();
  const navigate = useNavigate();
  
  const [isSpiceDialogOpen, setIsSpiceDialogOpen] = useState(false);
  const [isRepeatDialogOpen, setIsRepeatDialogOpen] = useState(false);
  const [currentItemForCustomization, setCurrentItemForCustomization] = useState<string | null>(null);

  // Sync controlled open state
  useEffect(() => {
    if (typeof controlledOpen === 'boolean') setOpen(controlledOpen);
  }, [controlledOpen]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    controlledOnOpenChange?.(nextOpen);
  };

  const handleShowSpiceDialog = (cartItemId: string) => {
    setCurrentItemForCustomization(cartItemId);
    setIsSpiceDialogOpen(true);
  };

  const handleShowRepeatDialog = (cartItemId: string) => {
    setCurrentItemForCustomization(cartItemId);
    setIsRepeatDialogOpen(true);
  };

  const handleSpiceLevelConfirm = (spiceLevel: number) => {
    if (currentItemForCustomization) {
      const cartItem = items.find(ci => ci.id === currentItemForCustomization);
      if (cartItem) {
        // Add item to cart with spice level
        const customization: CartCustomization = {
          spiceLevel
        };
        addItem(cartItem.menuItem, 1, customization);
      }
    }
    setCurrentItemForCustomization(null);
  };

  const handleRepeatCustomization = () => {
    if (currentItemForCustomization) {
      const cartItem = items.find(ci => ci.id === currentItemForCustomization);
      if (cartItem) {
        // Use THIS cart item's existing spice level
        const existingSpiceLevel = cartItem.customization?.spiceLevel;
        if (existingSpiceLevel !== undefined) {
          const customization: CartCustomization = {
            spiceLevel: existingSpiceLevel
          };
          addItem(cartItem.menuItem, 1, customization);
        }
      }
    }
    setIsRepeatDialogOpen(false);
    setCurrentItemForCustomization(null);
  };

  const handleNewCustomization = () => {
    // Close repeat dialog and open spice dialog for new selection
    setIsRepeatDialogOpen(false);
    setIsSpiceDialogOpen(true);
  };

  const defaultTrigger = (
    <Button variant="ghost" size="icon" className="relative w-auto h-auto p-2 hover:bg-transparent" style={{ color: '#D4AF37' }}>
      <ShoppingBag className="w-10 h-10 md:w-6 md:h-6" />
      {itemCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
    </Button>
  );

  return (
  <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Shopping Cart ({itemCount} items)</span>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add some delicious items from our menu!
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-3 py-4">
                  {items.map((item) => (
                    <CartItemComponent 
                      key={item.id} 
                      item={item}
                      onShowSpiceDialog={handleShowSpiceDialog}
                      onShowRepeatDialog={handleShowRepeatDialog}
                    />
                  ))}
                </div>
              </ScrollArea>

              {/* Cart Summary */}
              <div className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Delivery Fee</span>
                    <span>€2.50</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>€{(total + 2.50).toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Buttons */}
                <div className="space-y-2">
                    <Button className="w-full" size="lg" onClick={() => {
                      setOpen(false);
                      navigate('/checkout');
                    }}>
                      Proceed to Checkout
                    </Button>
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Spice Customization Dialogs */}
        {currentItemForCustomization && isSpiceDialogOpen && (() => {
          const cartItem = items.find(ci => ci.id === currentItemForCustomization);
          return (
            <SpiceLevelDialog
              open={isSpiceDialogOpen}
              onOpenChange={setIsSpiceDialogOpen}
              onConfirm={handleSpiceLevelConfirm}
              itemName={cartItem?.menuItem.name || ''}
            />
          );
        })()}
        
        {currentItemForCustomization && isRepeatDialogOpen && (() => {
          const cartItem = items.find(ci => ci.id === currentItemForCustomization);
          const existingSpiceLevel = cartItem?.customization?.spiceLevel;
          return (
            <RepeatCustomizationDialog
              open={isRepeatDialogOpen}
              onOpenChange={setIsRepeatDialogOpen}
              onRepeat={handleRepeatCustomization}
              onCustomize={handleNewCustomization}
              itemName={cartItem?.menuItem.name || ''}
              previousSpiceLevel={existingSpiceLevel || 0}
            />
          );
        })()}
      </SheetContent>
    </Sheet>
  );
};