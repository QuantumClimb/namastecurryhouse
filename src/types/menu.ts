export interface MenuItem {
  id: string;
  name: string;
  namePt: string;
  category: string;
  price: number;
  description?: string;
  dietary?: string[];
  spiceLevel?: number;
  imageUrl?: string;    // New field for image URL
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export type MenuData = MenuCategory[];
