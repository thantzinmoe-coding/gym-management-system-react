import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, Award, Briefcase } from 'lucide-react';
import { userService } from '@/services/userService';

export default function TrainerProfileSetup() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { userId, email, role } = location.state || {};

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
    fullName: '',
    email,
    nrc: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    specialization: '',
    experience: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const profileRequest = {
        name: profile.fullName,
        phone: profile.phone,
        nrc: profile.nrc,
        dob: profile.dateOfBirth,
        gender: profile.gender,
        address: profile.address,
      };

      // 4️⃣ Prepare additional user details (weight, height, goals)
      const userDetailForm = {
        experience: profile.experience,
        specialization: profile.specialization,
        entityId: profile.userId
      };

      const id = Number(profile.userId);
      const response = await userService.createProfile(id, profileRequest);

      // Optional: send user details separately
      const success = await userService.createUserDetail(userDetailForm);

      if (success != null && response != null) {
        toast({
          title: "Application Submitted!",
          description: "Your trainer application has been submitted for admin approval.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create profile. Please try again.",
          variant: "destructive",
        });
      }

      navigate('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
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
            <UserCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Complete Your Trainer Profile</CardTitle>
          <CardDescription>
            Share your expertise and experience to help our members achieve their goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
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

            {/* Full Name & NRC side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={profile.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
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
            </div>

            {/* Phone & Date of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone"
                  required
                />
              </div>
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
            </div>

            {/* Gender & Specialization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={profile.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
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
              <div className="space-y-2">
                <Label htmlFor="specialization" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Specialization *
                </Label>
                <Select value={profile.specialization} onValueChange={(value) => handleInputChange('specialization', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight-loss">Weight Loss</SelectItem>
                    <SelectItem value="muscle-building">Muscle Building</SelectItem>
                    <SelectItem value="cardio-fitness">Cardio & Fitness</SelectItem>
                    <SelectItem value="yoga">Yoga & Flexibility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <Label htmlFor="experience" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Experience *
              </Label>
              <Select value={profile.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="less-1-year">Less than 1 year</SelectItem>
                  <SelectItem value="1-3-years">1 - 3 years</SelectItem>
                  <SelectItem value="3-5-years">3 - 5 years</SelectItem>
                  <SelectItem value="5-plus-years">5+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
