
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuCategory, MenuItem } from "../types/menu";
import { getMenuData } from "../services/menuService";
import { AddToCartButton } from "../components/AddToCartButton";

const MenuSection = ({ items, title }: { items: MenuItem[], title: string }) => {
  const placeholderImg = "/images/placeholder-food.svg";
  
  return (
    <div className="space-y-6">
      <h3 className="text-3xl font-bold gradient-text mb-8">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <Card key={item.id || index} className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow overflow-hidden group">
            {/* Food Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={item.imageUrl || placeholderImg}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = placeholderImg;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-xl font-bold text-foreground">{item.name}</h4>
                <span className="text-lg font-bold text-accent">€{item.price.toFixed(2)}</span>
              </div>
              <p className="text-foreground/70 mb-4 leading-relaxed">{item.description}</p>
              {item.dietary && item.dietary.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.dietary.map((diet: string, idx: number) => (
                    <Badge key={idx} className="bg-primary/20 text-primary border-primary/30">
                      {diet}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {item.spiceLevel && (
                    <Badge variant="outline" className="text-xs">
                      {'🌶️'.repeat(item.spiceLevel)}
                    </Badge>
                  )}
                  {item.namePt && (
                    <span className="text-sm text-muted-foreground italic">{item.namePt}</span>
                  )}
                </div>
                <AddToCartButton menuItem={item} size="sm" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const Menu = () => {
  const [menuData, setMenuData] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getMenuData()
      .then((data) => {
        setMenuData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Tabs: use categories from menuData
  const tabKeys = menuData.map((cat) => cat.name);
  const defaultTab = tabKeys[0] || "menu";

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section
        className="relative h-96 flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/images/new images/35.png')`
        }}
      >
        <div className="text-center z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white animate-fade-in">
            Our Menu
          </h1>
          <p className="text-xl text-white/90 animate-fade-in">
            Culinary artistry meets innovative mixology
          </p>
        </div>
      </section>

      {/* Menu Content */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20 text-xl">Loading menu...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : (
          <Tabs defaultValue={defaultTab} className="space-y-8">
            <TabsList className={`grid w-full grid-cols-${tabKeys.length} bg-card/50 backdrop-blur-sm border-primary/20`}>
              {tabKeys.map((key) => (
                <TabsTrigger key={key} value={key} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {key}
                </TabsTrigger>
              ))}
            </TabsList>
            {menuData.map((cat) => (
              <TabsContent key={cat.name} value={cat.name} className="space-y-8">
                <MenuSection items={cat.items} title={cat.name} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </section>

      {/* Wine & Spirits Section */}
  <section className="py-20 px-4 bg-primary/5">
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
