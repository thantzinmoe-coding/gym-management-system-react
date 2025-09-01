import { useEffect, useState } from 'react';
import {Navbar} from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Service {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: string;
  features: string[];
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    // Simulating API call
    const fetchServicesData = async () => {
      const mockServicesData: Service[] = [
        {
          id: 1,
          name: "Personal Training",
          description: "One-on-one training sessions with certified personal trainers",
          duration: "60 minutes",
          price: "$75/session",
          features: [
            "Customized workout plan",
            "Nutritional guidance", 
            "Progress tracking",
            "Flexible scheduling"
          ]
        },
        {
          id: 2,
          name: "Group Fitness Classes",
          description: "High-energy group workouts led by experienced instructors",
          duration: "45-60 minutes",
          price: "$25/class",
          features: [
            "Variety of class types",
            "All fitness levels welcome",
            "Motivating group environment",
            "Professional instruction"
          ]
        },
        {
          id: 3,
          name: "Gym Membership",
          description: "Full access to all gym equipment and basic facilities",
          duration: "Monthly",
          price: "$49/month", 
          features: [
            "24/7 gym access",
            "State-of-the-art equipment",
            "Locker rooms & showers",
            "Free Wi-Fi"
          ]
        },
        {
          id: 4,
          name: "Nutrition Coaching",
          description: "Personalized meal planning and dietary guidance",
          duration: "30 minutes",
          price: "$60/session",
          features: [
            "Custom meal plans",
            "Supplement recommendations",
            "Progress monitoring",
            "Educational resources"
          ]
        },
        {
          id: 5,
          name: "Yoga & Meditation",
          description: "Mind-body wellness classes for flexibility and mental clarity",
          duration: "60 minutes", 
          price: "$30/class",
          features: [
            "Multiple yoga styles",
            "Beginner to advanced levels",
            "Meditation sessions",
            "Stress relief focus"
          ]
        },
        {
          id: 6,
          name: "Corporate Wellness",
          description: "Fitness programs designed for workplace health initiatives",
          duration: "Customizable",
          price: "Contact for pricing",
          features: [
            "On-site programs available",
            "Group discounts",
            "Health assessments",
            "Team building activities"
          ]
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 1200));
      setServices(mockServicesData);
    };

    fetchServicesData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover our comprehensive range of fitness services designed to help you achieve 
            your health and wellness goals, no matter your current fitness level.
          </p>
        </div>

        {/* Services Grid */}
        <section>
          {services.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">Loading our services...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <Card key={service.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold mb-2">{service.name}</h3>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Duration:</span>
                      <span className="text-sm text-muted-foreground">{service.duration}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Price:</span>
                      <span className="text-lg font-bold text-primary">{service.price}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">What's Included:</h4>
                    <ul className="space-y-1">
                      {service.features.map((feature, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start">
                          <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full">
                    Learn More
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center bg-muted rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Contact us today to learn more about our services or schedule a tour of our facilities. 
            Our team is here to help you find the perfect fitness solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              Schedule Tour
            </Button>
            <Button variant="outline" size="lg">
               <Link to="/ContactUs">Contact Us</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Services;