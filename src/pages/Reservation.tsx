
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock, Users, AlertCircle, Bell, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const Reservation = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [guests, setGuests] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const timeSlots = [
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
    "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
    "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM"
  ];

  const unavailableSlots: string[] = []; // All time slots available

  const handleTimeSelect = (time: string) => {
    if (!unavailableSlots.includes(time)) {
      setSelectedTime(time);
    }
  };

  const handleWhatsAppBooking = () => {
    const message = encodeURIComponent(
      `Hi Namaste Curry House! I'd like to make a reservation for ${guests} ${guests === "1" ? "person" : "people"} on ${format(date, "MMMM d, yyyy")} at ${selectedTime}. Please confirm availability.`
    );
    window.open(`https://wa.me/351920617185?text=${message}`, "_blank");
  };

  const handleWaitlist = () => {
    const message = encodeURIComponent(
      `Hi Namaste Curry House! I'd like to join the waitlist for ${guests} ${guests === "1" ? "person" : "people"} on ${format(date, "MMMM d, yyyy")} at ${selectedTime}. Please notify me if a table becomes available.`
    );
    window.open(`https://wa.me/351920617185?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Reservation Form */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
            Reservations
          </h1>
          <p className="text-xl text-foreground/80 mb-8">
            Secure your spot for an authentic Indian dining experience at Namaste Curry House
          </p>
        </div>
        
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
          <CardHeader>
            <CardTitle className="text-3xl font-bold gradient-text text-center">
              Book Your Table
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Guest Count */}
            <div className="space-y-3">
              <label className="text-lg font-medium text-foreground">Number of Guests</label>
              <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger className="w-full bg-background/50 border-primary/30 neon-glow">
                  <SelectValue placeholder="Select number of guests" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 13 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Picker */}
            <div className="space-y-3">
              <label className="text-lg font-medium text-foreground">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background/50 border-primary/30 neon-glow",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background border-primary/20" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Slots */}
            <div className="space-y-3">
              <label className="text-lg font-medium text-foreground">Select Time</label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {timeSlots.map((time) => {
                  const isUnavailable = unavailableSlots.includes(time);
                  const isSelected = selectedTime === time;
                  return (
                    <Button
                      key={time}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => handleTimeSelect(time)}
                      disabled={isUnavailable}
                      className={cn(
                        "h-12 transition-all duration-300",
                        isSelected && "bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/50",
                        !isSelected && !isUnavailable && "border-primary/30 hover:bg-primary/10 neon-glow",
                        isUnavailable && "opacity-50 cursor-not-allowed"
                      )}
                      style={isSelected ? { boxShadow: "0 0 15px hsl(var(--accent))" } : {}}
                    >
                      {time}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                onClick={handleWhatsAppBooking}
                disabled={!guests || !selectedTime || unavailableSlots.includes(selectedTime)}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg neon-glow"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Book via WhatsApp
              </Button>
              
              {selectedTime && unavailableSlots.includes(selectedTime) && (
                <Button
                  onClick={handleWaitlist}
                  variant="outline"
                  className="flex-1 border-accent text-accent hover:bg-accent/10 h-12 text-lg"
                >
                  <Bell className="w-5 h-5 mr-2" />
                  Join Waitlist
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Booking Rules */}
      <section className="py-12 px-4 max-w-4xl mx-auto">
        <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-6 gradient-text">Booking Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Dress Code</h4>
                    <p className="text-foreground/70 text-sm">Casual and comfortable. We welcome all guests in a relaxed, family-friendly atmosphere.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Dining Duration</h4>
                    <p className="text-foreground/70 text-sm">Tables are reserved for 2.5 hours to ensure all guests can enjoy their experience.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Hold Policy</h4>
                    <p className="text-foreground/70 text-sm">Tables are held for 15 minutes past reservation time before being released.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MessageCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Large Groups</h4>
                    <p className="text-foreground/70 text-sm">For parties of 8 or more, please contact us directly via WhatsApp for special arrangements.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Large Bookings CTA */}
      <section className="py-12 px-4 max-w-4xl mx-auto">
  <Card className="bg-secondary/10 border-secondary/20 neon-glow">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4 gradient-text">Planning a Special Celebration?</h3>
            <p className="text-foreground/80 mb-6 max-w-2xl mx-auto">
              Whether it's a family gathering, birthday celebration, or corporate event, we'll help you create memorable moments with authentic Indian cuisine.
            </p>
            <Button
              onClick={() => {
                const message = encodeURIComponent(
                  "Hi Namaste Curry House! I'm interested in booking for a large group or special event. Could you please provide more information about your event packages and availability?"
                );
                window.open(`https://wa.me/351920617185?text=${message}`, "_blank");
              }}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-3 text-lg neon-glow"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Contact for Large Bookings
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Reservation;
