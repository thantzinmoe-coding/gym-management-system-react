import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Service {
  id: number;
  name: string;
  description: string;
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
          name: "Weight Loss",
          description: "Structured programs designed to help you burn fat and achieve a healthy body weight.",
          features: [
            "Fat-burning workouts",
            "Nutritional meal guidance",
            "Calorie control support",
            "Progress monitoring"
          ]
        },
        {
          id: 2,
          name: "Muscle Building",
          description: "Programs focused on strength training and lean muscle growth.",
          features: [
            "Weightlifting routines",
            "Strength progression tracking",
            "Protein-rich diet guidance",
            "1-on-1 trainer support"
          ]
        },
        {
          id: 3,
          name: "Cardio & Fitness",
          description: "Workouts designed to improve endurance, stamina, and overall fitness.",
          features: [
            "High-intensity interval training (HIIT)",
            "Aerobic and circuit sessions",
            "Endurance challenges",
            "Energy-boosting routines"
          ]
        },
        {
          id: 4,
          name: "Yoga & Flexibility",
          description: "Sessions to increase flexibility, balance, and inner peace through yoga practice.",
          features: [
            "Guided yoga poses",
            "Breathing techniques",
            "Stretching routines",
            "Mind-body relaxation"
          ]
        },
        {
          id: 5,
          name: "Personal Training",
          description: "One-on-one sessions tailored to your individual goals and fitness needs.",
          features: [
            "Custom workout plans",
            "Personal trainer guidance",
            "Form correction and safety",
            "Goal-focused training"
          ]
        },
        {
          id: 6,
          name: "Group Training",
          description: "Fun and energetic group workouts to keep you motivated and engaged.",
          features: [
            "Team-based exercises",
            "Supportive group environment",
            "Motivational coaching",
            "Variety of class styles"
          ]
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));
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
            From burning fat to building strength, improving endurance, finding flexibility, 
            or training with experts — explore our services designed just for you.
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

                  <Link to="/register">
                    <Button className="w-full">Learn More</Button>
                  </Link>
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
            Our trainers are ready to guide you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Schedule Tour</Button>
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
