
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Contact Content */}
      <section className="py-8 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-foreground">
                Send us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Name
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-background/50 border-primary/30 focus:border-primary neon-glow"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-background/50 border-primary/30 focus:border-primary neon-glow"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="bg-background/50 border-primary/30 focus:border-primary neon-glow resize-none"
                    placeholder="Tell us about your inquiry, event, or reservation needs..."
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg neon-glow"
                >
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-foreground">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Address</h4>
                      <p className="text-foreground/70">
                        R. Agostinho Lourenço 339,<br />
                        1000-011 Lisboa<br />
                        Portugal
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Phone</h4>
                      <p className="text-foreground/70">+351 920 617 185</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Email</h4>
                      <p className="text-foreground/70">info@namastecurryhouse.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Clock className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Hours</h4>
                      <div className="text-foreground/70">
                        <p>Monday - Sunday: 11:00 AM - 10:00 PM</p>
                        <p>Kitchen closes at 9:30 PM</p>
                        <p>Delivery: 11:00 AM - 9:30 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp Card */}
            <Card className="bg-secondary/10 border-secondary/20 neon-glow">
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-secondary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4 text-foreground">Quick Contact</h3>
                <p className="text-foreground/80 mb-6">
                  Have a question? Contact us directly via WhatsApp for the fastest response about reservations, menu items, or catering.
                </p>
                <Button
                  onClick={() => {
                    const message = encodeURIComponent(
                      "Hi Namaste Curry House! I have a question about your Indian restaurant. Could you please assist me?"
                    );
                    window.open(`https://wa.me/351920617185?text=${message}`, "_blank");
                  }}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-3 text-lg neon-glow"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp Us
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Map Section */}
  <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Find Us</h2>
            <p className="text-xl text-foreground/80">
              Visit us in Lisboa for an authentic Indian dining experience
            </p>
          </div>
          
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow overflow-hidden">
            <CardContent className="p-0">
              <div className="w-full h-96">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3112.8789123456789!2d-9.1456789!3d38.7222222!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd19347a0c3f6e97%3A0x1234567890abcdef!2sR.%20Agostinho%20Louren%C3%A7o%20339%2C%201000-011%20Lisboa%2C%20Portugal!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Namaste Curry House Location"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Contact;
