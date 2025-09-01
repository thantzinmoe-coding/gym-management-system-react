import { useEffect, useState } from 'react';
import {Navbar} from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  experience: string;
  specialization: string;
}

const AboutUs = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    // Simulating API call
    const fetchTeamData = async () => {
      // Mock API data
      const mockTeamData: TeamMember[] = [
        {
          id: 1,
          name: "Sarah Johnson",
          role: "Head Trainer",
          experience: "8 years",
          specialization: "Strength Training & Nutrition"
        },
        {
          id: 2,
          name: "Mike Chen",
          role: "Fitness Specialist",
          experience: "6 years", 
          specialization: "CrossFit & HIIT"
        },
        {
          id: 3,
          name: "Lisa Rodriguez",
          role: "Yoga Instructor",
          experience: "10 years",
          specialization: "Yoga & Meditation"
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTeamMembers(mockTeamData);
    };

    fetchTeamData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About FitGym</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We are dedicated to helping you achieve your fitness goals through expert guidance, 
            state-of-the-art equipment, and a supportive community that motivates you every step of the way.
          </p>
        </div>

        {/* Our Story */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                Founded in 2015, FitGym started with a simple mission: to create a welcoming space 
                where people of all fitness levels could work towards their health and wellness goals.
              </p>
              <p className="text-muted-foreground mb-4">
                What began as a small neighborhood gym has grown into a comprehensive fitness center 
                that serves hundreds of members daily. We pride ourselves on our personalized approach 
                and commitment to helping each member succeed.
              </p>
              <p className="text-muted-foreground">
                Today, we continue to evolve and expand our services while maintaining the core values 
                that make FitGym a special place for fitness enthusiasts and beginners alike.
              </p>
            </div>

            <div className="bg-muted rounded-lg h-full flex items-center justify-center overflow-hidden">
                <img src="/image/gym2.jpg" alt="Gym Interior Photo" className="text-muted-foreground" />
             </div>
           
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-4">Excellence</h3>
              <p className="text-muted-foreground">
                We strive for excellence in everything we do, from our equipment maintenance 
                to our customer service and training programs.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-4">Community</h3>
              <p className="text-muted-foreground">
                We believe fitness is better when shared. Our community-focused approach 
                creates lasting friendships and accountability partnerships.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-4">Innovation</h3>
              <p className="text-muted-foreground">
                We continuously update our equipment and programs to incorporate the latest 
                fitness trends and scientific research.
              </p>
            </Card>
          </div>
        </section>

        {/* Team Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          {teamMembers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading team information...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <Card key={member.id} className="p-6 text-center">
                  <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold">{member.name.charAt(0)}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-primary font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground mb-1">Experience: {member.experience}</p>
                  <p className="text-sm text-muted-foreground">{member.specialization}</p>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AboutUs;