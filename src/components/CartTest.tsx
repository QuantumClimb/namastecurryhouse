import React, { useEffect } from 'react';
import useCartStore from '../stores/cartStore';
import { MenuItem } from '../types/menu';

// Test component to verify cart functionality
export const CartTest: React.FC = () => {
  const { items, total, itemCount, addItem, removeItem, updateQuantity, clearCart } = useCartStore();

  // Sample menu item for testing
  const testItem: MenuItem = {
    id: 'test-1',
    name: 'Test Curry',
    namePt: 'Caril de Teste',
    category: 'Main Course',
    price: 12.50,
    description: 'A delicious test curry for testing cart functionality',
    dietary: ['vegetarian'],
    spiceLevel: 2
  };

  const handleTestAddItem = () => {
    addItem(testItem, 1, {
      spiceLevel: 'medium',
      specialInstructions: 'Test instructions',
      extras: ['Extra Rice']
    });
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 max-w-md">
      <h3 className="text-lg font-semibold mb-4">Cart Test Panel</h3>
      
      <div className="mb-4">
        <p><strong>Items in cart:</strong> {itemCount}</p>
        <p><strong>Total:</strong> €{total.toFixed(2)}</p>
      </div>

      <div className="space-y-2 mb-4">
        <button
          onClick={handleTestAddItem}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Test Item
        </button>
        <button
          onClick={clearCart}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
        >
          Clear Cart
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="p-2 border rounded">
            <p className="font-medium">{item.menuItem.name}</p>
            <p className="text-sm">Qty: {item.quantity} - €{item.totalPrice.toFixed(2)}</p>
            {item.customization?.spiceLevel && (
              <p className="text-xs">Spice: {item.customization.spiceLevel}</p>
            )}
            <button
              onClick={() => removeItem(item.id)}
              className="text-red-500 text-xs mt-1"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};