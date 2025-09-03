import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Clock, MapPin, Phone, Mail, Users, Award, Target, Zap, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

// Corrected: Import Navbar using a relative path from src/pages/Index.tsx
// to src/components/layout/Navbar.tsx
import {Navbar} from "../components/layout/Navbar"; // Corrected path

const Index = () => {
  const [newsletter, setNewsletter] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Sets up an interval to update the current time every second.
    // Cleans up the interval when the component unmounts.
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletter) return; // Prevent submission if email is empty
    // Simulate API call delay for newsletter subscription
    await new Promise((r) => setTimeout(r, 1000));
    setSubscribed(true); // Indicate successful subscription
    setNewsletter(""); // Clear the input field
    setTimeout(() => setSubscribed(false), 3000);
  };

  const quickLinks = [
    { name: "Home", href: "/Index" },
    { name: "About Us", href: "/AboutUs" },
    { name: "Services", href: "/Services" },
    { name: 'Packages', href: '/member/book-packages' },
    { name: "Trainers", href: "/trainers" },
    { name: "Contact", href: "/ContactUs" },
    { name: "Reviews", href: "/Reviews" },
  ];

  const services = [
    "Personal Training",
    "Group Classes",
    "Nutrition Counseling",
    "Fitness Assessment",
    "Recovery Programs",
    "Online Training",
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", name: "Facebook" },
    { icon: Twitter, href: "#", name: "Twitter" },
    { icon: Instagram, href: "#", name: "Instagram" },
    { icon: Youtube, href: "#", name: "YouTube" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* The Navbar is now rendered directly inside Index.tsx */}
      <Navbar />

      {/* Add top padding to ensure content starts below the fixed Navbar */}
      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-screen overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('/image/gym1.jpg')` }} // Direct path from public folder
          >
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
          <div className="relative flex items-center min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl text-white">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Train Hard.<br />
                Stay Strong.
              </h1>
              <p className="text-xl text-white/80 mb-8 max-w-2xl">
                Premium equipment, expert trainers, and programs built for real results —
                all under one roof.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="text-lg px-8 py-6 bg-white text-black hover:bg-white/90 rounded-xl shadow-lg transition-all duration-300">
                    Start Your Trial
                  </Button>
                </Link>
                <Link to="/Services">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-black text-black hover:bg-white hover:text-black rounded-xl shadow-lg transition-all duration-300">
                    View Services
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="transform transition-transform duration-300 ease-in-out hover:scale-105 p-4 rounded-lg bg-white shadow-md">
                <div className="text-4xl md:text-6xl font-bold mb-2 text-black">3,200+</div>
                <div className="text-muted-foreground text-lg">Active Members</div>
              </div>
              <div className="transform transition-transform duration-300 ease-in-out hover:scale-105 p-4 rounded-lg bg-white shadow-md">
                <div className="text-4xl md:text-6xl font-bold mb-2 text-black">24+</div>
                <div className="text-muted-foreground text-lg">Certified Trainers</div>
              </div>
              <div className="transform transition-transform duration-300 ease-in-out hover:scale-105 p-4 rounded-lg bg-white shadow-md">
                <div className="text-4xl md:text-6xl font-bold mb-2 text-black">85+</div>
                <div className="text-muted-foreground text-lg">Weekly Classes</div>
              </div>
              <div className="transform transition-transform duration-300 ease-in-out hover:scale-105 p-4 rounded-lg bg-white shadow-md">
                <div className="text-4xl md:text-6xl font-bold mb-2 text-black">1,400+</div>
                <div className="text-muted-foreground text-lg">5 ★ Reviews</div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose FitGym Section */}
        <section className="py-20 bg-white text-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">Why Choose FitGym?</h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  We combine world-class facilities with personalized programs to help you reach
                  your fitness goals faster. Join thousands who trust us for their transformation
                  journey.
                </p>
                <Link to="/AboutUs">
                  <Button size="lg" className="text-lg px-8 py-6 bg-black text-white hover:bg-gray-800 rounded-xl shadow-lg transition-all duration-300">
                    Learn More
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl">
                  <img
                    src="/image/gym1.jpg" // Direct path from public folder
                    alt="Modern gym interior with professional equipment"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Premium Facilities</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Experience fitness like never before with our state-of-the-art equipment and world-class amenities.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center bg-gray-900 p-8 rounded-xl shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                  <Users className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Expert Trainers</h3>
                <p className="text-gray-300">
                  Certified professionals dedicated to helping you achieve your fitness goals.
                </p>
              </div>
              <div className="text-center bg-gray-900 p-8 rounded-xl shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                  <Award className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Premium Equipment</h3>
                <p className="text-gray-300">
                  Latest fitness technology and equipment for optimal workout experience.
                </p>
              </div>
              <div className="text-center bg-gray-900 p-8 rounded-xl shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                  <Target className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Personalized Plans</h3>
                <p className="text-gray-300">
                  Customized workout and nutrition plans tailored to your specific needs.
                </p>
              </div>
              <div className="text-center bg-gray-900 p-8 rounded-xl shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                  <Zap className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold mb-4">24/7 Access</h3>
                <p className="text-gray-300">
                  Train on your schedule with round-the-clock gym access for members.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 bg-white text-black">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Life?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join FitGym today and start your journey towards a healthier, stronger you. Get your first week absolutely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="text-lg px-8 py-6 bg-black text-white hover:bg-gray-800 rounded-xl shadow-lg transition-all duration-300">
                  Start Your  Trial
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-black bg-white text-black hover:bg-black hover:text-white rounded-xl shadow-lg transition-all duration-300">
                Schedule a Tour
              </Button>
            </div>
          </div>
        </section>

        {/* Gym Information Section */}
        <section className="py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Gym Information</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="p-8 text-center bg-white rounded-xl shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105">
                <div className="w-16 h-16 bg-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                  <Clock className="w-8 h-8 text-background" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-black">Opening Hours</h3>
                <div className="text-muted-foreground space-y-2">
                  <div>Mon–Fri: 5:00 AM – 11:00 PM</div>
                  <div>Sat–Sun: 6:00 AM – 10:00 PM</div>
                </div>
              </Card>

              <Card className="p-8 text-center bg-white rounded-xl shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105">
                <div className="w-16 h-16 bg-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                  <MapPin className="w-8 h-8 text-background" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-black">Location</h3>
                <div className="text-muted-foreground space-y-2">
                  <div>123 Fitness Street</div>
                  <div>Downtown City, DC 12345</div>
                </div>
              </Card>

              <Card className="p-8 text-center bg-white rounded-xl shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105">
                <div className="w-16 h-16 bg-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                  <Phone className="w-8 h-8 text-background" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-black">Contact</h3>
                <div className="text-muted-foreground space-y-2">
                  <div>+1 (555) 123-4567</div>
                  <div>Emergency: +1 (555) 987-6543</div>
                </div>
              </Card>

              <Card className="p-8 text-center bg-white rounded-xl shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105">
                <div className="w-16 h-16 bg-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                  <Mail className="w-8 h-8 text-background" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-black">Email</h3>
                <div className="text-muted-foreground space-y-2">
                  <div>info@fitgym.com</div>
                  <div>support@fitgym.com</div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </div> {/* End of pt-16 div */}

      {/* Footer */}
      <footer className="bg-background py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">F</span>
                </div>
                <span className="text-2xl font-bold">FitGym</span>
              </div>
              <p className="text-muted-foreground mb-6">
                Transform your body and life with our premium fitness facilities and expert guidance.
              </p>
              <div className="bg-card p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Current Time</div>
                <div className="text-2xl font-bold">{currentTime.toLocaleTimeString()}</div>
                <div className="text-sm text-muted-foreground">
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3 text-muted-foreground">
                {quickLinks.map((link, i) => (
                  <li key={i}>
                    <Link to={link.href} className="hover:text-foreground transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Our Services */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Our Services</h3>
              <ul className="space-y-3 text-muted-foreground">
                {services.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Contact Info & Newsletter */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Contact Info</h3>
              <div className="space-y-4 text-muted-foreground mb-8">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5" />
                  <div>
                    <div>123 Fitness Street</div>
                    <div>Downtown City, DC 12345</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5" />
                  <div>+1 (555) 123-4567</div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5" />
                  <div>info@fitgym.com</div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <Input
                    type="email"
                    value={newsletter}
                    onChange={(e) => setNewsletter(e.target.value)}
                    placeholder="Your email address"
                    className="bg-muted border-border"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={subscribed}
                    className="w-full"
                  >
                    {subscribed ? "Subscribed!" : "Subscribe"}
                  </Button>
                </form>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FitGym. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="text-muted-foreground hover:text-foreground transform hover:scale-110 transition-transform duration-200"
                  aria-label={s.name}
                >
                  <s.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
