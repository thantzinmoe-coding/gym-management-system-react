import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ManageTrainerProfile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: 'Alex Smith',
    email: 'alex.smith@gym.com',
    phone: '+9876543210',
    dateOfBirth: '1985-08-10',
    gender: 'Male',
    address: '456 Fitness Ave, City, State 67890',
    specialization: 'Strength Training, Weight Loss, Nutrition',
    experience: '10 years',
    profilePhoto: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoUrl = e.target?.result as string;
        setProfile(prev => ({ ...prev, profilePhoto: photoUrl }));
        toast({
          title: "Photo Updated",
          description: "Your profile photo has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // Save changes
      toast({
        title: "Profile Updated",
        description: "Your trainer profile has been updated successfully.",
      });
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Trainer Profile</h1>
          <p className="text-muted-foreground">Update your professional and personal details</p>
        </div>
        {/* Toggle button */}
        <Button onClick={handleToggleEdit}>
          {isEditing ? 'Update Profile' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" /> Personal Information
            </CardTitle>
            <CardDescription>Your professional profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.profilePhoto || "/placeholder-avatar.jpg"} />
                <AvatarFallback className="text-lg">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
                  <Button variant="outline" onClick={() => document.getElementById('photo-upload')?.click()}>
                    Change Photo
                  </Button>
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                className="text-blue-600"
                value={profile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="text-blue-600"
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            {/* Phone + DOB */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  className="text-blue-600"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  className="text-blue-600"
                  value={profile.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Input
                id="gender"
                className="text-blue-600"
                value={profile.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                className="text-blue-600"
                value={profile.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            {/* Specialization */}
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Textarea
                id="specialization"
                className="text-blue-600"
                value={profile.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            {/* Experience */}
            <div>
              <Label htmlFor="experience">Experience (Years)</Label>
              <Input
                id="experience"
                type="text"
                className="text-blue-600"
                value={profile.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
