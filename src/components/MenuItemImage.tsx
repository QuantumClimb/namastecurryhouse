import React, { useState } from 'react';
import { MenuItem } from '@/types/menu';

interface MenuItemImageProps {
  menuItem: Partial<MenuItem> & { id: string; name: string };
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const sizeMap = {
  small: 'w-16 h-16',    // 64px - Cart drawer
  medium: 'w-20 h-20',   // 80px - Checkout
  large: 'w-28 h-28',    // 112px - Order confirmation
};

export const MenuItemImage: React.FC<MenuItemImageProps> = ({ 
  menuItem, 
  size = 'medium',
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = sizeMap[size];
  const placeholderUrl = '/images/placeholder-food.svg';

  // Determine image source with priority
  const getImageSrc = () => {
    if (imageError) {
      return placeholderUrl;
    }

    // Priority 1: Database images via API endpoint
    if (menuItem.id && menuItem.imageUrl && menuItem.imageUrl !== placeholderUrl) {
      // Check if it's already a full URL
      if (menuItem.imageUrl.startsWith('http') || menuItem.imageUrl.startsWith('/api/')) {
        return menuItem.imageUrl;
      }
      // Otherwise use API endpoint
      return `/api/images/${menuItem.id}`;
    }

    // Priority 2: Direct image URL (external or placeholder)
    if (menuItem.imageUrl) {
      return menuItem.imageUrl;
    }

    // Priority 3: Fallback to placeholder
    return placeholderUrl;
  };

  const imageSrc = getImageSrc();
  const isPlaceholder = imageSrc === placeholderUrl;

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    console.warn(`Failed to load image for ${menuItem.name}, using placeholder`);
    setImageError(true);
    setIsLoading(false);
  };

  return (
    <div className={`relative ${sizeClasses} ${className} overflow-hidden bg-gray-100 flex-shrink-0`}>
      {/* Loading skeleton */}
      {isLoading && !isPlaceholder && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Image */}
      <img
        src={imageSrc}
        alt={`${menuItem.name} - Indian dish`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />

      {/* Placeholder icon overlay for SVG placeholder */}
      {isPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
          <svg
            className="w-8 h-8 text-amber-600 opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
