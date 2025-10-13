
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Play, Upload } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Real MAUJ images
  const images = [
    {
      src: "/images/1cf9179c-6705-4640-b9b8-fac00c54127c.png",
      alt: "MAUJ Dining Experience - Customer enjoying pasta and cocktail",
      category: "Food"
    },
    {
      src: "/images/fec6a3c9-6c35-4847-862a-9f1c2b754cca.png",
      alt: "MAUJ Night Out - Friends enjoying the atmosphere",
      category: "Atmosphere"
    },
    {
      src: "/images/d4f3c81a-38ad-41b3-b972-735ae9aa96df.png",
      alt: "MAUJ Social Dining - Friends sharing drinks",
      category: "Atmosphere"
    },
    {
      src: "/images/fbb684c2-b917-475d-ad52-61c6a7749ce4.png",
      alt: "MAUJ Tea Service - Traditional tea ceremony experience",
      category: "Events"
    },
    {
      src: "/images/9b01b889-0ffb-468f-a8b8-eac971522006.png",
      alt: "MAUJ Group Celebration - Friends celebrating together",
      category: "Atmosphere"
    },
    {
      src: "/images/bbf2a0c0-5ab4-4ebb-b8d7-96b944fdb6af.png",
      alt: "MAUJ Bar Scene - Couple enjoying cocktails",
      category: "Drinks"
    },
    {
      src: "/images/2777b9fc-43e5-468a-b996-30567c7577a4.png",
      alt: "MAUJ Private Dining - Intimate dining experience",
      category: "Interior"
    },
    {
      src: "/images/28117363-f0b1-42a5-a5e5-12d9b1cc6b21.png",
      alt: "MAUJ Outdoor Dining - Evening cocktails on the terrace",
      category: "Atmosphere"
    },
    {
      src: "/images/2850dedc-0ada-4a62-ba80-625bafd5ce0c.png",
      alt: "MAUJ Happy Moments - Staff and customers celebrating",
      category: "Events"
    },
    {
      src: "/images/2a6f48a5-5656-4a20-a17d-d386e20c1cdf.png",
      alt: "MAUJ Wine Experience - Customer enjoying wine",
      category: "Drinks"
    },
    // New food images
    {
      src: "/images/6e68544b-c4c7-4680-90c6-8aada141f912.png",
      alt: "MAUJ 3 Course Lunch Set - Gourmet shrimp and noodle dish",
      category: "Food"
    },
    {
      src: "/images/1f161bac-f2ae-42db-97c1-8eb00f72a4ed.png",
      alt: "MAUJ Aromatic Indulgence - Signature biryani dish",
      category: "Food"
    },
    {
      src: "/images/b9d15489-5c40-4fe6-84f6-70d52012646b.png",
      alt: "MAUJ Appetizer - Grilled prawns with mint chutney",
      category: "Food"
    },
    {
      src: "/images/e26eb677-f6aa-4657-9b00-629d43b7290f.png",
      alt: "MAUJ Signature Dish - Rich meatballs in savory sauce",
      category: "Food"
    },
    {
      src: "/images/8385f424-9cd6-4b59-a1bc-6b6e4ab35924.png",
      alt: "MAUJ Pasta Special - Spicy tomato pasta with herbs",
      category: "Food"
    },
    {
      src: "/images/8074fb11-df2a-4fcd-86fb-9c3a2024a294.png",
      alt: "MAUJ Breakfast Platter - Eggs and traditional sides",
      category: "Food"
    },
    {
      src: "/images/2113dcf7-786b-4266-9a9e-473606e05161.png",
      alt: "MAUJ Curry Selection - Rich tomato-based curry",
      category: "Food"
    },
    {
      src: "/images/197bc384-656d-4894-8a60-9846ca7af986.png",
      alt: "MAUJ Family Feast - Assorted traditional dishes",
      category: "Food"
    },
    {
      src: "/images/e90c077c-ce5b-4e6e-a368-0bbca863b055.png",
      alt: "MAUJ Dining Experience - Multiple course meal spread",
      category: "Food"
    },
    {
      src: "/images/f0aa01a4-8911-4992-941f-63ec5a3ccf5c.png",
      alt: "MAUJ Comfort Food - Traditional soup with bread",
      category: "Food"
    },
    // New drink images
    {
      src: "/images/3f403e4e-3e7d-4d84-91df-1d87668967b9.png",
      alt: "MAUJ Cocktail Night - Signature martini with elegant presentation",
      category: "Drinks"
    },
    {
      src: "/images/143afebf-8293-4ab2-88ab-2b375d0f8326.png",
      alt: "MAUJ Happy Hour - Special deals on cocktails and wine",
      category: "Events"
    },
    {
      src: "/images/4a99af30-79dc-47d1-8ebf-308119edc093.png",
      alt: "MAUJ Mixology - Professional cocktail preparation",
      category: "Drinks"
    },
    {
      src: "/images/0aee548a-1169-4ccc-b544-6fb545c23348.png",
      alt: "MAUJ Premium Spirits - Monkey Shoulder whisky selection",
      category: "Drinks"
    },
    {
      src: "/images/545c2758-8833-4327-a82a-de357d17cbcd.png",
      alt: "MAUJ Father's Day Special - Free beer promotion",
      category: "Events"
    },
    {
      src: "/images/5b6092e6-faee-40e1-98dc-538cc103835b.png",
      alt: "MAUJ April Specials - Pour-fect deals all month",
      category: "Events"
    },
    {
      src: "/images/9e0460ad-065e-4680-9f5d-6fa7ea61b326.png",
      alt: "MAUJ All May Deal - Comprehensive food and drink offers",
      category: "Events"
    },
    {
      src: "/images/480dd221-896b-4bc1-b682-b0cfa7694d56.png",
      alt: "MAUJ Pouring Deals - Weekend beer and spirit specials",
      category: "Drinks"
    },
    {
      src: "/images/57650b82-f039-4aa9-828f-e6d208e0c18e.png",
      alt: "MAUJ St. Patrick's Day - Exclusive green beer promotion",
      category: "Events"
    },
    {
      src: "/images/68a6e030-38b8-4516-8fde-b6f83efaf2e5.png",
      alt: "MAUJ Wednesday DJ Night - Featuring DJ Reyna",
      category: "Events"
    }
  ];

  const videos = [
    {
      title: "MAUJ Night Experience",
      thumbnail: "/images/bbf2a0c0-5ab4-4ebb-b8d7-96b944fdb6af.png",
      embedId: "dQw4w9WgXcQ" // Replace with actual video ID
    },
    {
      title: "MAUJ Cocktail Preparation",
      thumbnail: "/images/4a99af30-79dc-47d1-8ebf-308119edc093.png",
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
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/images/bbf2a0c0-5ab4-4ebb-b8d7-96b944fdb6af.png')`
        }}
      >
        <div className="text-center z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-glow gradient-text animate-fade-in">
            Gallery
          </h1>
          <p className="text-xl text-foreground/90 animate-fade-in">
            Capturing the essence of MAUJ's unforgettable moments
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
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-secondary/5">
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
