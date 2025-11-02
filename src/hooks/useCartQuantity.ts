import { useMemo } from 'react';
import useCartStore from '../stores/cartStore';
import { MenuItem } from '../types/menu';

/**
 * Hook to get the total quantity of a menu item in the cart
 * Takes into account all cart items with the same menu item ID
 * (different customizations are counted together for display purposes)
 */
export const useItemCartQuantity = (menuItem: MenuItem) => {
  const items = useCartStore(state => state.items);

  const quantity = useMemo(() => {
    return items
      .filter(cartItem => cartItem.menuItem.id === menuItem.id)
      .reduce((total, cartItem) => total + cartItem.quantity, 0);
  }, [items, menuItem.id]);

  return quantity;
};

/**
 * Hook to check if a menu item is in the cart
 */
export const useIsItemInCart = (menuItem: MenuItem) => {
  const quantity = useItemCartQuantity(menuItem);
  return quantity > 0;
};
