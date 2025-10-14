export interface MenuItem {
  id: string;
  name: string;
  namePt: string;
  category: string;
  price: number;
  description?: string;
  dietary?: string[];
  spiceLevel?: number;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export type MenuData = MenuCategory[];
