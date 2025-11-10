
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, MessageCircle, Facebook, Instagram } from "lucide-react";
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
          {/* QR Code for Reviews */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-foreground text-center">
                Scan for Reviews
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <img 
                src="/images/QR.jpg" 
                alt="Scan QR Code for Reviews" 
                className="w-full mx-auto rounded-lg"
              />
            </CardContent>
          </Card>

          {/* WhatsApp Card */}
          <div className="space-y-8">
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

            {/* Social Media Card */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-6 text-foreground">Follow Us</h3>
                <div className="flex space-x-8 justify-center">
                  <a href="https://www.facebook.com/profile.php?id=61562044322831" target="_blank" rel="noopener noreferrer" 
                     className="transition-all hover:opacity-80 hover:scale-110 p-3" style={{ color: '#D4AF37' }}>
                    <Facebook className="w-12 h-12" />
                  </a>
                  <a href="https://www.instagram.com/namastecurry.lisbon/" target="_blank" rel="noopener noreferrer"
                     className="transition-all hover:opacity-80 hover:scale-110 p-3" style={{ color: '#D4AF37' }}>
                    <Instagram className="w-12 h-12" />
                  </a>
                </div>
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
              <div className="w-full h-96 relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m12!1m8!1m3!1d49788.93729862002!2d-9.1323749!3d38.7451546!3m2!1i1024!2i768!4f13.1!2m1!1sNamaste%20curry%20House%20lisboa!5e0!3m2!1sen!2sin!4v1762746728998!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Namaste Curry House Location"
                  className="w-full h-full"
                ></iframe>
                <div className="absolute bottom-4 right-4">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=R.+Agostinho+Lourenço+339,+1000-011+Lisboa,+Portugal"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                      <MapPin className="w-4 h-4 mr-2" />
                      Open in Maps
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Contact;
