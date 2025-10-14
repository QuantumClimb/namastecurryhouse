import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartStore, CartItem, CartCustomization } from '../types/cart';
import { MenuItem } from '../types/menu';

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (menuItem: MenuItem, quantity = 1, customization?: CartCustomization) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            item => 
              item.menuItem.id === menuItem.id && 
              JSON.stringify(item.customization) === JSON.stringify(customization)
          );

          let newItems: CartItem[];
          
          if (existingItemIndex >= 0) {
            // Update existing item quantity
            newItems = state.items.map((item, index) => 
              index === existingItemIndex 
                ? { 
                    ...item, 
                    quantity: item.quantity + quantity,
                    totalPrice: (item.quantity + quantity) * menuItem.price
                  }
                : item
            );
          } else {
            // Add new item
            const newItem: CartItem = {
              id: `${menuItem.id}-${Date.now()}`,
              menuItem,
              quantity,
              customization,
              totalPrice: quantity * menuItem.price,
            };
            newItems = [...state.items, newItem];
          }

          const newTotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

          return {
            items: newItems,
            total: newTotal,
            itemCount: newItemCount,
          };
        });
      },

      removeItem: (itemId: string) => {
        set((state) => {
          const newItems = state.items.filter(item => item.id !== itemId);
          const newTotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

          return {
            items: newItems,
            total: newTotal,
            itemCount: newItemCount,
          };
        });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            const newItems = state.items.filter(item => item.id !== itemId);
            const newTotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
            const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

            return {
              items: newItems,
              total: newTotal,
              itemCount: newItemCount,
            };
          }

          const newItems = state.items.map(item => 
            item.id === itemId 
              ? { 
                  ...item, 
                  quantity,
                  totalPrice: quantity * item.menuItem.price
                }
              : item
          );

          const newTotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

          return {
            items: newItems,
            total: newTotal,
            itemCount: newItemCount,
          };
        });
      },

      updateCustomization: (itemId: string, customization: CartCustomization) => {
        set((state) => ({
          items: state.items.map(item => 
            item.id === itemId ? { ...item, customization } : item
          ),
        }));
      },

      clearCart: () => {
        set({
          items: [],
          total: 0,
          itemCount: 0,
        });
      },

      getItemById: (itemId: string) => {
        return get().items.find(item => item.id === itemId);
      },
    }),
    {
      name: 'namaste-curry-cart',
      version: 1,
    }
  )
);

export default useCartStore;