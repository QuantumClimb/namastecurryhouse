import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Menu = () => {
  const starters = [
    {
      name: "Truffle Arancini",
      description: "Crispy risotto balls with black truffle, parmesan, and aioli",
      price: "RM 32",
      image: "/images/6e68544b-c4c7-4680-90c6-8aada141f912.png",
      dietary: ["Vegetarian"]
    },
    {
      name: "Wagyu Beef Sliders",
      description: "Mini wagyu patties with caramelized onions and house sauce",
      price: "RM 45",
      image: "/images/1f161bac-f2ae-42db-97c1-8eb00f72a4ed.png",
      dietary: ["Signature"]
    },
    {
      name: "Tuna Tartare",
      description: "Fresh yellowfin tuna with avocado, citrus, and sesame",
      price: "RM 38",
      image: "/images/b9d15489-5c40-4fe6-84f6-70d52012646b.png",
      dietary: ["Gluten Free"]
    }
  ];

  const mains = [
    {
      name: "Dry-Aged Ribeye",
      description: "28-day aged ribeye with roasted vegetables and red wine jus",
      price: "RM 125",
      image: "/images/e26eb677-f6aa-4657-9b00-629d43b7290f.png",
      dietary: ["Signature"]
    },
    {
      name: "Lobster Thermidor",
      description: "Whole lobster with brandy cream sauce and gruyere cheese",
      price: "RM 95",
      image: "/images/8385f424-9cd6-4b59-a1bc-6b6e4ab35924.png",
      dietary: ["Signature"]
    },
    {
      name: "Duck Confit",
      description: "Slow-cooked duck leg with cherry gastrique and seasonal vegetables",
      price: "RM 68",
      image: "/images/8074fb11-df2a-4fcd-86fb-9c3a2024a294.png",
      dietary: []
    }
  ];

  const cocktails = [
    {
      name: "Namaste Special",
      description: "Gin, elderflower, cucumber, lime, and a hint of magic",
      price: "RM 28",
      image: "/images/3f403e4e-3e7d-4d84-91df-1d87668967b9.png",
      dietary: ["Signature"]
    },
    {
      name: "Neon Nights",
      description: "Vodka, blue curaçao, lime, and edible glitter",
      price: "RM 32",
      image: "/images/4a99af30-79dc-47d1-8ebf-308119edc093.png",
      dietary: ["Signature"]
    },
    {
      name: "Smoky Old Fashioned",
      description: "Bourbon, maple syrup, bitters, and applewood smoke",
      price: "RM 35",
      image: "/images/0aee548a-1169-4ccc-b544-6fb545c23348.png",
      dietary: []
    }
  ];

  const MenuSection = ({ items, title }: { items: any[], title: string }) => (
    <div className="space-y-6">
      <h3 className="text-3xl font-bold gradient-text mb-8">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <Card key={index} className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow overflow-hidden group">
            <div className="relative overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-xl font-bold text-foreground">{item.name}</h4>
                <span className="text-lg font-bold text-accent">{item.price}</span>
              </div>
              <p className="text-foreground/70 mb-4 leading-relaxed">{item.description}</p>
              {item.dietary.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.dietary.map((diet: string, idx: number) => (
                    <Badge key={idx} className="bg-primary/20 text-primary border-primary/30">
                      {diet}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section
        className="relative h-96 flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/images/2113dcf7-786b-4266-9a9e-473606e05161.png')`
        }}
      >
        <div className="text-center z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-glow gradient-text animate-fade-in">
            Our Menu
          </h1>
          <p className="text-xl text-foreground/90 animate-fade-in">
            Culinary artistry meets innovative mixology
          </p>
        </div>
      </section>

      {/* Menu Content */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <Tabs defaultValue="starters" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border-primary/20">
            <TabsTrigger value="starters" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Starters
            </TabsTrigger>
            <TabsTrigger value="mains" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Mains
            </TabsTrigger>
            <TabsTrigger value="cocktails" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Cocktails
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="starters" className="space-y-8">
            <MenuSection items={starters} title="Starters & Appetizers" />
          </TabsContent>
          
          <TabsContent value="mains" className="space-y-8">
            <MenuSection items={mains} title="Main Courses" />
          </TabsContent>
          
          <TabsContent value="cocktails" className="space-y-8">
            <MenuSection items={cocktails} title="Signature Cocktails" />
          </TabsContent>
        </Tabs>
      </section>

      {/* Wine & Spirits Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 gradient-text">
            Premium Spirits & Wines
          </h2>
          <p className="text-xl text-foreground/80 mb-12 max-w-3xl mx-auto">
            Discover our curated selection of premium spirits, fine wines, and rare bottles from around the world
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4 text-primary">Whiskey Collection</h3>
                <p className="text-foreground/70">
                  From Scottish single malts to Japanese whisky, explore our extensive collection
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4 text-secondary">Wine Cellar</h3>
                <p className="text-foreground/70">
                  Carefully selected wines from renowned vineyards across the globe
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4 text-accent">Premium Spirits</h3>
                <p className="text-foreground/70">
                  Top-shelf vodka, gin, rum, and tequila for the discerning palate
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Menu;
