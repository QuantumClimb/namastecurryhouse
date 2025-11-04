import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ChefHat, Leaf, Users, Calendar, MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OurStory = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: "Traditional Heritage",
      description: "Authentic recipes passed down through generations, bringing the true flavors of India to your table"
    },
    {
      icon: <ChefHat className="w-12 h-12" />,
      title: "Culinary Excellence",
      description: "Our master chefs use traditional cooking techniques and authentic spices to create unforgettable Indian dining experiences"
    },
    {
      icon: <Leaf className="w-12 h-12" />,
      title: "Fresh Ingredients",
      description: "Premium quality spices, fresh vegetables, and authentic ingredients sourced to maintain traditional flavors"
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Warm Hospitality",
      description: "A welcoming space where families and friends gather to enjoy authentic Indian cuisine and traditional hospitality"
    }
  ];

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
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section
        className="relative h-96 flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/banners/OurStoryBanner.png')`
        }}
      >
      </section>

      {/* Welcome Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Welcome to Namaste Curry House
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
            Experience the rich traditions of Indian cuisine with authentic spices, traditional recipes, and warm hospitality
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto bg-primary/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-foreground">
              Where It All Began
            </h2>
            <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
              <p>
                Namaste Curry House was born from a simple vision: to create a space where authentic Indian flavors and traditional hospitality come together to create memorable dining experiences. We've become a beloved destination for those seeking genuine Indian cuisine.
              </p>
              <p>
                Our name, Namaste Curry House, represents the essence of welcome and respect – a philosophy that permeates every aspect of our establishment. From the moment you step through our doors, you're transported into a world where every dish tells a story of India's rich culinary heritage.
              </p>
              <p>
                We believe that great food isn't just about taste – it's about bringing people together, sharing traditions, and creating connections through the universal language of authentic Indian cuisine.
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src="/images/banners/OurStory1.png"
              alt="Namaste Curry House Interior"
              className="rounded-lg shadow-2xl w-full h-96 object-cover neon-glow"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
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

      {/* Values Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              What Drives Us
            </h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
              Four pillars that define the Namaste Curry House experience and our commitment to authentic Indian cuisine
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
                <CardContent className="p-8">
                  <div className="text-primary mb-6">
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-foreground/70 leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tradition Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img
              src="/images/banners/OurStory2.png"
              alt="Namaste Curry House Experience"
              className="rounded-lg shadow-2xl w-full h-96 object-cover neon-glow"
            />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Tradition Perfected
            </h2>
            <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
              Namaste Curry House isn't just a restaurant – it's a journey through the rich culinary traditions of India. Our master chefs use authentic recipes and traditional cooking methods to bring you the true taste of India.
            </p>
            <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
              From aromatic biryanis to flavorful curries, every dish at Namaste Curry House is crafted with love and respect for Indian culinary heritage.
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto bg-accent/10">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-foreground">
            Our Vision
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-foreground/80 leading-relaxed mb-8">
              To be more than just a restaurant – to be a bridge between cultures through authentic Indian cuisine. We're not just serving food; we're sharing traditions, stories, and the warmth of Indian hospitality with every meal.
            </p>
            <blockquote className="text-2xl font-medium text-primary/80 italic border-l-4 border-primary pl-6 my-8">
              "Every meal at Namaste Curry House is a celebration of authentic flavors, traditional recipes, and the joy of sharing good food with loved ones."
            </blockquote>
            <p className="text-lg text-foreground/70 mb-8">
              Join us as we continue to bring the authentic taste of India to your table, one dish at a time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Experience Authentic India
          </h2>
          <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
            Join us for an unforgettable dining experience where traditional recipes meet warm hospitality
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/reservation")}
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
    </div>
  );
};

export default OurStory;
