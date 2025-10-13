
import { Card, CardContent } from "@/components/ui/card";
import { Music, ChefHat, GlassWater, Users } from "lucide-react";

const AboutUs = () => {
  const values = [
    {
      icon: <Music className="w-12 h-12" />,
      title: "Traditional Heritage",
      description: "Authentic recipes passed down through generations, bringing the true flavors of India to your table"
    },
    {
      icon: <ChefHat className="w-12 h-12" />,
      title: "Culinary Excellence",
      description: "Our master chefs use traditional cooking techniques and authentic spices to create unforgettable Indian dining experiences"
    },
    {
      icon: <GlassWater className="w-12 h-12" />,
      title: "Fresh Ingredients",
      description: "Premium quality spices, fresh vegetables, and authentic ingredients sourced to maintain traditional flavors"
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Warm Hospitality",
      description: "A welcoming space where families and friends gather to enjoy authentic Indian cuisine and traditional hospitality"
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('/images/aboutus.png')`
        }}
      >
        <div className="text-center z-10 max-w-5xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-glow gradient-text animate-fade-in">
            Our Story
          </h1>
          <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed animate-fade-in">
            Bringing authentic Indian flavors and traditional hospitality to create memorable dining experiences
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 gradient-text">
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
              src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              alt="Namaste Curry House Interior"
              className="rounded-lg shadow-2xl w-full h-96 object-cover neon-glow"
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
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

      {/* Vision Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 gradient-text">
            Our Vision
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-foreground/80 leading-relaxed mb-8">
              To be more than just a restaurant – to be a bridge between cultures through authentic Indian cuisine. We're not just serving food; we're sharing traditions, stories, and the warmth of Indian hospitality with every meal.
            </p>
            <blockquote className="text-2xl font-medium text-primary/80 italic border-l-4 border-primary pl-6 my-8">
              "Every meal at Namaste Curry House is a celebration of authentic flavors, traditional recipes, and the joy of sharing good food with loved ones."
            </blockquote>
            <p className="text-lg text-foreground/70">
              Join us as we continue to bring the authentic taste of India to your table, one dish at a time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
