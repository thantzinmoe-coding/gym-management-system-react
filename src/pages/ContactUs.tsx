import { useState, useEffect } from 'react';
import {Navbar} from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  hours: {
    weekdays: string;
    weekend: string;
  };
}

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Simulating API call to fetch contact information
    const fetchContactInfo = async () => {
      const mockContactInfo: ContactInfo = {
        phone: "(555) 123-4567",
        email: "info@fitgym.com",
        address: "123 Fitness Street, Health City, HC 12345",
        hours: {
          weekdays: "Monday - Friday: 5:00 AM - 11:00 PM",
          weekend: "Saturday - Sunday: 6:00 AM - 10:00 PM"
        }
      };

      await new Promise(resolve => setTimeout(resolve, 800));
      setContactInfo(mockContactInfo);
    };

    fetchContactInfo();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful submission
      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 24 hours.",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions about our services or want to schedule a tour? 
            We're here to help you start your fitness journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject *
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  placeholder="Tell us how we can help you..."
                  rows={5}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              {contactInfo ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Phone</h3>
                    <p className="text-muted-foreground">{contactInfo.phone}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Email</h3>
                    <p className="text-muted-foreground">{contactInfo.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Address</h3>
                    <p className="text-muted-foreground">{contactInfo.address}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Hours</h3>
                    <p className="text-muted-foreground text-sm">{contactInfo.hours.weekdays}</p>
                    <p className="text-muted-foreground text-sm">{contactInfo.hours.weekend}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Loading contact information...</p>
              )}
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Visit Our Gym</h2>
              <div className="bg-muted rounded-lg h-48 flex items-center justify-center mb-4">
                <span className="text-muted-foreground">Interactive Map</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Stop by anytime during our operating hours for a tour of our facilities. 
                No appointment necessary!
              </p>
              <Button variant="outline" className="w-full">
                Get Directions
              </Button>
            </Card>

            
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactUs;