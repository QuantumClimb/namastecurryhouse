import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MessageCircle, Clock } from "lucide-react";

const CustomerSupport = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section
        className="relative h-64 flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/new images/35.png')`
        }}
      >
        <div className="text-center z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white animate-fade-in">
            Customer Support
          </h1>
          <p className="text-xl text-white/90 animate-fade-in">
            We're here to help you
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="space-y-8">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-primary" />
                How Can We Help You?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/80 leading-relaxed">
                At Namaste Curry House, we're committed to providing excellent customer service. 
                Whether you have questions about our menu, need help with an order, or want to share feedback, 
                our team is here to assist you.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Call Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary mb-2">+351 920 617 185</p>
                <p className="text-foreground/70">
                  Available during business hours for immediate assistance with orders, reservations, or inquiries.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Email Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-primary mb-2">info@namastecurryhouse.com</p>
                <p className="text-foreground/70">
                  Send us an email anytime. We typically respond within 24 hours on business days.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Support Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Phone Support:</span>
                <span className="text-foreground/70">Monday - Sunday: 11:00 AM - 10:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Email Support:</span>
                <span className="text-foreground/70">24/7 (Response within 24 hours)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">How do I place an order?</h3>
                <p className="text-foreground/70">
                  You can place an order directly through our website by browsing the menu, adding items to your cart, 
                  and proceeding to checkout. You can also call us at +351 920 617 185 for phone orders.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">What are your delivery areas?</h3>
                <p className="text-foreground/70">
                  We deliver within Lisboa and surrounding areas. Delivery availability and fees may vary based on location.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Do you accommodate dietary restrictions?</h3>
                <p className="text-foreground/70">
                  Yes! We offer vegetarian, vegan, and gluten-free options. Please inform us of any allergies or dietary 
                  requirements when placing your order, and we'll do our best to accommodate you.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Can I modify my order after placing it?</h3>
                <p className="text-foreground/70">
                  Please contact us immediately at +351 920 617 185 if you need to modify your order. 
                  We'll do our best to accommodate changes if the order hasn't been prepared yet.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
                <p className="text-foreground/70">
                  We accept all major credit and debit cards through our secure online payment system, as well as cash on delivery.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default CustomerSupport;
