import React, { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { MenuItem } from '../types/menu';
import { CartCustomization } from '../types/cart';
import useCartStore from '../stores/cartStore';

interface AddToCartButtonProps {
  menuItem: MenuItem;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  showCustomization?: boolean;
  className?: string;
  buttonText?: string;
}

const extraOptions = [
  'Extra Rice',
  'Extra Naan',
  'Extra Sauce',
  'No Onions',
  'No Garlic',
  'Vegan Option',
  'Gluten Free'
];

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  menuItem,
  variant = 'default',
  size = 'default',
  showCustomization = true,
  className,
  buttonText = 'Add to Cart'
}) => {
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<CartCustomization>({
    spiceLevel: 'medium',
    specialInstructions: '',
    extras: []
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addItem = useCartStore(state => state.addItem);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleExtraToggle = (extra: string, checked: boolean) => {
    setCustomization(prev => ({
      ...prev,
      extras: checked 
        ? [...(prev.extras || []), extra]
        : (prev.extras || []).filter(e => e !== extra)
    }));
  };

  const handleAddToCart = () => {
    addItem(menuItem, quantity, showCustomization ? customization : undefined);
    setIsDialogOpen(false);
    // Reset form
    setQuantity(1);
    setCustomization({
      spiceLevel: 'medium',
      specialInstructions: '',
      extras: []
    });
  };

  const quickAddToCart = () => {
    addItem(menuItem, 1);
  };

  if (!showCustomization) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={quickAddToCart}
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        {buttonText}
      </Button>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add {menuItem.name} to Cart</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Quantity Selection */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center"
                min="1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Spice Level */}
          <div className="space-y-2">
            <Label htmlFor="spiceLevel">Spice Level</Label>
            <Select
              value={customization.spiceLevel}
              onValueChange={(value: 'mild' | 'medium' | 'hot' | 'extra-hot') =>
                setCustomization(prev => ({ ...prev, spiceLevel: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select spice level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mild">🌶️ Mild</SelectItem>
                <SelectItem value="medium">🌶️🌶️ Medium</SelectItem>
                <SelectItem value="hot">🌶️🌶️🌶️ Hot</SelectItem>
                <SelectItem value="extra-hot">🌶️🌶️🌶️🌶️ Extra Hot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Extras */}
          <div className="space-y-2">
            <Label>Extras</Label>
            <div className="space-y-2">
              {extraOptions.map((extra) => (
                <div key={extra} className="flex items-center space-x-2">
                  <Checkbox
                    id={extra}
                    checked={customization.extras?.includes(extra) || false}
                    onCheckedChange={(checked) => 
                      handleExtraToggle(extra, checked as boolean)
                    }
                  />
                  <Label htmlFor={extra} className="text-sm">
                    {extra}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Special Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Any special requests or dietary requirements..."
              value={customization.specialInstructions}
              onChange={(e) =>
                setCustomization(prev => ({ ...prev, specialInstructions: e.target.value }))
              }
              rows={3}
            />
          </div>

          {/* Price Summary */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-lg">
                €{(menuItem.price * quantity).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button onClick={handleAddToCart} className="w-full" size="lg">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add {quantity} to Cart - €{(menuItem.price * quantity).toFixed(2)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};