import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { MenuItem } from '../types/menu';
import { CartCustomization } from '../types/cart';
import useCartStore from '../stores/cartStore';
import { SpiceLevelDialog } from './SpiceLevelDialog';
import { RepeatCustomizationDialog } from './RepeatCustomizationDialog';

interface AddToCartButtonProps {
  menuItem: MenuItem;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  buttonText?: string;
  showIcon?: boolean;
}

// Track last selected spice level for each menu item
const lastSpiceLevels = new Map<string, number>();

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  menuItem,
  variant = 'default',
  size = 'default',
  className,
  buttonText = 'Add to Cart',
  showIcon = true
}) => {
  const [isSpiceDialogOpen, setIsSpiceDialogOpen] = useState(false);
  const [isRepeatDialogOpen, setIsRepeatDialogOpen] = useState(false);
  const [pendingSpiceLevel, setPendingSpiceLevel] = useState<number | null>(null);
  
  const { addItem, items } = useCartStore(state => ({
    addItem: state.addItem,
    items: state.items
  }));

  // Check if this item is already in the cart
  const existingCartItem = items.find(item => item.menuItem.id === menuItem.id);
  const hasItemInCart = !!existingCartItem;

  const handleAddToCart = () => {
    // Check if item has spice customization enabled
    if (menuItem.hasSpiceCustomization) {
      // Check if we've added this item before
      const lastSpiceLevel = lastSpiceLevels.get(menuItem.id);
      
      if (hasItemInCart && lastSpiceLevel !== undefined) {
        // Item already in cart and we have a previous spice level - show repeat dialog
        setIsRepeatDialogOpen(true);
      } else {
        // First time adding or no previous spice level - show spice dialog
        setIsSpiceDialogOpen(true);
      }
    } else {
      // No customization needed - add directly
      addItem(menuItem, 1);
    }
  };

  const handleSpiceLevelConfirm = (spiceLevel: number) => {
    // Store the spice level for this menu item
    lastSpiceLevels.set(menuItem.id, spiceLevel);
    
    // Add item to cart with spice level
    const customization: CartCustomization = {
      spiceLevel
    };
    addItem(menuItem, 1, customization);
  };

  const handleRepeatCustomization = () => {
    // Use the same spice level as before
    const lastSpiceLevel = lastSpiceLevels.get(menuItem.id);
    if (lastSpiceLevel !== undefined) {
      const customization: CartCustomization = {
        spiceLevel: lastSpiceLevel
      };
      addItem(menuItem, 1, customization);
    }
  };

  const handleNewCustomization = () => {
    // Open spice dialog for new selection
    setIsSpiceDialogOpen(true);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleAddToCart}
      >
        {showIcon && <ShoppingCart className="w-4 h-4 mr-2" />}
        {buttonText}
      </Button>

      {menuItem.hasSpiceCustomization && (
        <>
          <SpiceLevelDialog
            open={isSpiceDialogOpen}
            onOpenChange={setIsSpiceDialogOpen}
            onConfirm={handleSpiceLevelConfirm}
            itemName={menuItem.name}
          />

          <RepeatCustomizationDialog
            open={isRepeatDialogOpen}
            onOpenChange={setIsRepeatDialogOpen}
            onRepeat={handleRepeatCustomization}
            onCustomize={handleNewCustomization}
            itemName={menuItem.name}
            previousSpiceLevel={lastSpiceLevels.get(menuItem.id) || 0}
          />
        </>
      )}
    </>
  );
};