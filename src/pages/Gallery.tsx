
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Play, Upload } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Replaced images using sequential assets from /images/new images/
  // Mapping keeps prior categories but uses numbered filenames.
  const images = Array.from({ length: 30 }, (_, i) => {
    const index = i + 1; // 1..30 for main gallery
    // Rough category cycling: Food, Atmosphere, Events, Drinks, Interior
    const categoriesCycle = ["Food", "Atmosphere", "Events", "Drinks", "Interior"];
    const category = categoriesCycle[i % categoriesCycle.length];
    return {
      src: `/images/new images/${index}.png`,
      alt: `Gallery Image ${index}`,
      category
    };
  });

  const videos = [
    {
      title: "Traditional Indian Cooking",
      thumbnail: "/images/new images/31.png",
      embedId: "dQw4w9WgXcQ" // Replace with actual video ID
    },
    {
      title: "Behind the Scenes at Namaste",
      thumbnail: "/images/new images/32.png",
      embedId: "dQw4w9WgXcQ" // Replace with actual video ID
    }
  ];

  const categories = ["All", "Atmosphere", "Events", "Food", "Drinks", "Interior"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredImages = selectedCategory === "All" 
    ? images 
    : images.filter(img => img.category === selectedCategory);

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
      {/* Hero Section */}
      <section
        className="relative h-96 flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(139, 69, 19, 0.5), rgba(205, 133, 63, 0.4)), url('/images/new images/33.png')`
        }}
      >
        <div className="text-center z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white animate-fade-in">
            Gallery
          </h1>
          <p className="text-xl text-white/90 animate-fade-in">
            Capturing the flavors, colors, and joy of Indian cuisine
          </p>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className="py-8 px-4 max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`neon-glow ${
                selectedCategory === category 
                  ? "bg-primary hover:bg-primary/90" 
                  : "border-primary/30 hover:bg-primary/10"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image, index) => (
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end">
                <div className="p-4">
                  <p className="text-white font-medium">{image.alt}</p>
                  <p className="text-white/70 text-sm">{image.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Video Section */}
  <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Video Gallery
            </h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
              Experience the energy and atmosphere of MAUJ through our exclusive video content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {videos.map((video, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow overflow-hidden">
                <div className="relative group cursor-pointer">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Play className="w-16 h-16 text-white" />
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">{video.title}</h3>
                  <p className="text-foreground/70">Click to watch this exclusive content</p>
                </CardContent>
              </Card>
            ))}
          </div>
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
