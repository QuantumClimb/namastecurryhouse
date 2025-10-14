import React from 'react';
import { Trash2, Plus, Minus, ShoppingBag, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import useCartStore from '../stores/cartStore';
import { CartItem } from '../types/cart';

interface CartDrawerProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CartItemComponent: React.FC<{ item: CartItem }> = ({ item }) => {
  const { updateQuantity, removeItem } = useCartStore();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  const getSpiceLevelDisplay = (level?: string) => {
    switch (level) {
      case 'mild': return '🌶️';
      case 'medium': return '🌶️🌶️';
      case 'hot': return '🌶️🌶️🌶️';
      case 'extra-hot': return '🌶️🌶️🌶️🌶️';
      default: return '';
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 border rounded-lg">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{item.menuItem.name}</h4>
        <p className="text-xs text-muted-foreground mb-2">€{item.menuItem.price.toFixed(2)} each</p>
        
        {/* Customizations */}
        {item.customization && (
          <div className="space-y-1 mb-2">
            {item.customization.spiceLevel && (
              <div className="text-xs text-muted-foreground">
                Spice: {getSpiceLevelDisplay(item.customization.spiceLevel)} {item.customization.spiceLevel}
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
            onClick={() => handleQuantityChange(item.quantity - 1)}
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
            onClick={() => handleQuantityChange(item.quantity + 1)}
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
  open,
  onOpenChange
}) => {
  const { items, total, itemCount, clearCart } = useCartStore();

  const defaultTrigger = (
    <Button variant="outline" size="icon" className="relative">
      <ShoppingBag className="w-4 h-4" />
      {itemCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
                    <CartItemComponent key={item.id} item={item} />
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
                  <Button className="w-full" size="lg">
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
      </SheetContent>
    </Sheet>
  );
};