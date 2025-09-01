import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User, Target } from 'lucide-react';
import { userService } from '@/services/userService';

export default function MemberProfileSetup() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { userId, email, role } = location.state || {};

  // Redirect to login if userId or email is missing
  useEffect(() => {
    if (!userId || !email) {
      toast({
        title: 'Error',
        description: 'Invalid access. Please register or verify your email first.',
        variant: 'destructive',
      });
      navigate('/login', { replace: true });
    }
  }, [userId, email, toast, navigate]);

  const [profile, setProfile] = useState({
    userId,
    name: '',
    email,
    phone: '',
    nrc: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    weight: '',
    height: '',
    fitnessGoals: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1️⃣ Build the profile JSON
      const profileRequest = {
        name: profile.name,
        phone: profile.phone,
        nrc: profile.nrc,
        dob: profile.dateOfBirth,
        gender: profile.gender,
        address: profile.address,
      };

      // 4️⃣ Prepare additional user details (weight, height, goals)
      const userDetailForm = {
        weight: profile.weight,
        height: profile.height,
        goal: profile.fitnessGoals,
        entityId: profile.userId
      };

      // 5️⃣ Send request to backend
      const id = Number(profile.userId);
      const response = await userService.createProfile(id, profileRequest);

      // Optional: send user details separately
      const success = await userService.createUserDetail(userDetailForm);

      // 6️⃣ Save profile locally
      localStorage.setItem("memberProfile", JSON.stringify(profile));

      // 7️⃣ Navigate and show toast
      if (success != null && response != null) {
        toast({
          title: "Profile Created Successfully!",
          description: "Welcome to our gym! Your member profile has been set up.",
        });
        navigate(`/${role.toLowerCase()}/dashboard`);
      } else {
        toast({
          title: "Error",
          description: "Failed to create profile. Please try again.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error("Create profile error:", error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Complete Your Member Profile</CardTitle>
          <CardDescription>
            Tell us about yourself to personalize your fitness journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled
                />
              </div>
            </div>

            {/* NRC & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nrc">NRC *</Label>
                <Input
                  id="nrc"
                  value={profile.nrc}
                  onChange={(e) => handleInputChange('nrc', e.target.value)}
                  placeholder="e.g., 12/LaKaNa(N)123456"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            {/* Date of Birth & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={profile.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Weight & Height */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  value={profile.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="Enter your weight"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  value={profile.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder="Enter your height"
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={profile.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your complete address"
                required
                rows={3}
              />
            </div>

            {/* Fitness Goals */}
            <div className="space-y-2">
              <Label htmlFor="fitnessGoals" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Fitness Goals *
              </Label>
              <Textarea
                id="fitnessGoals"
                value={profile.fitnessGoals}
                onChange={(e) => handleInputChange('fitnessGoals', e.target.value)}
                placeholder="Tell us about your fitness goals (e.g., weight loss, muscle gain, endurance, etc.)"
                required
                rows={4}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? "Creating Profile..." : "Complete Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
