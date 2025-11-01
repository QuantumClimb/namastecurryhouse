
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const scrollToReservation = () => {
    navigate("/reservation");
  };

  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Traditional Recipes",
      description: "Authentic Indian dishes prepared using time-honored family recipes and techniques"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Fresh Ingredients",
      description: "Premium spices and fresh ingredients sourced to maintain authentic flavors"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "All Day Dining",
      description: "From lunch to dinner, enjoy our full menu of Indian specialties"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Family Friendly",
      description: "Welcoming atmosphere perfect for families and group celebrations"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(139, 69, 19, 0.5), rgba(205, 133, 63, 0.4)), url('/images/new images/36.png')`
        }}
      >
        <div className="text-center z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-white animate-fade-in">
            <span className="text-white">Namaste Curry House</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in">
            Authentic Indian Flavors & Traditional Hospitality
          </p>
          <p className="text-lg mb-10 text-white/80 max-w-2xl mx-auto animate-fade-in">
            Experience the rich traditions of Indian cuisine with authentic spices, traditional recipes, and warm hospitality
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button
              onClick={scrollToReservation}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3 neon-glow"
              size="lg"
            >
              Book a Table
            </Button>
            <Button
              onClick={() => navigate("/menu")}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-3"
              size="lg"
            >
              View Menu
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            The Namaste Experience
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Immerse yourself in authentic Indian flavors, traditional hospitality, and the warmth of our welcoming atmosphere
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
              <CardContent className="p-6 text-center">
                <div className="text-primary mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-foreground/70">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Highlights Section */}
  <section className="py-20 px-4 bg-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
                Tradition Perfected
              </h2>
              <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
                Namaste Curry House isn't just a restaurant – it's a journey through the rich culinary traditions of India. Our master chefs use authentic recipes and traditional cooking methods to bring you the true taste of India.
              </p>
              <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                From aromatic biryanis to flavorful curries, every dish at Namaste Curry House is crafted with love and respect for Indian culinary heritage.
              </p>
              <Button
                onClick={() => navigate("/about")}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-3 neon-glow"
                size="lg"
              >
                Discover Our Story
              </Button>
            </div>
            <div className="relative">
              <img
                src="/images/new images/37.png"
                alt="Namaste Curry House Experience"
                className="rounded-lg shadow-2xl w-full h-96 object-cover neon-glow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
  <section className="py-20 px-4 text-center bg-accent/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Experience Authentic India
          </h2>
          <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
            Join us for an unforgettable dining experience where traditional recipes meet warm hospitality
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={scrollToReservation}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3 neon-glow"
              size="lg"
            >
              Reserve Your Table
            </Button>
            <Button
              onClick={() => navigate("/contact")}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-3"
              size="lg"
            >
              Get in Touch
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
