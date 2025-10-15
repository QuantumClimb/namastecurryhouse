import { MenuItem, MenuCategory, MenuData } from '../types/menu';

// Determine API base URL
// In development, always use the same-origin /api to leverage Vite's proxy
// In production, prefer VITE_API_URL if provided, else same-origin /api
const API_BASE_URL = (() => {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL as string;
  return typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:3001/api';
})();

// Fetch all menu categories and items from the API
export async function getMenuData(): Promise<MenuData> {
  try {
    const response = await fetch(`${API_BASE_URL}/menu`);
    if (!response.ok) {
      throw new Error(`Failed to fetch menu: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching menu data:', error);
    // Fallback to static JSON in public folder
    try {
      const fallback = await fetch('/menuData.json');
      if (fallback.ok) {
        const data = await fallback.json();
        return data as MenuData;
      }
    } catch (e) {
      console.error('Fallback menu load failed:', e);
    }
    throw error;
  }
}

// Search menu items
export async function searchMenuItems(query: string): Promise<MenuItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/menu/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Failed to search menu: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching menu:', error);
    throw error;
  }
}

// Get items by category
export async function getMenuByCategory(categoryName: string): Promise<MenuCategory> {
  try {
    const response = await fetch(`${API_BASE_URL}/menu/category/${encodeURIComponent(categoryName)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch category: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      name: data.category,
      items: data.items
    };
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
}
