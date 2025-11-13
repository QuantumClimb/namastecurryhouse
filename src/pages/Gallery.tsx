
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSEO } from "../hooks/useSEO";

const Gallery = () => {
  useSEO({
    title: 'Gallery | Namaste Curry House - Authentic Indian Dishes',
    description: 'Explore our gallery of authentic Indian dishes including tandoori specialties, aromatic curries, freshly baked naan, and traditional desserts.',
    keywords: 'Indian food photos, tandoori images, curry pictures, Indian restaurant gallery, authentic Indian cuisine photos',
    canonicalUrl: 'https://www.namastecurry.house/gallery'
  });
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // List of actual images that exist in the folder
  // Update this array when you add or remove images
  const imageNumbers = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  
  const images = imageNumbers.map(num => {
    const paddedIndex = String(num).padStart(3, '0');
    return {
      src: `/images/new images/Namaste_${paddedIndex}.jpeg`,
      alt: `Namaste Curry House Gallery`,
    };
  });

  const openLightbox = (imageSrc: string) => {
    const index = images.findIndex(img => img.src === imageSrc);
    setCurrentIndex(index);
    setSelectedImage(imageSrc);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + images.length) % images.length
      : (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex].src);
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Photo Gallery */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group cursor-pointer neon-glow"
              onClick={() => openLightbox(image.src)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-64 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none">
          <div className="relative">
            <img
              src={selectedImage || ""}
              alt="Gallery Image"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateImage('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateImage('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
