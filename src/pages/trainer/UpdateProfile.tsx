import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import Cookies from 'js-cookie';

export default function ManageTrainerProfile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const user = authService.getCurrentUser();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    nrc: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    specialization: '',
    experience: '',
    profilePhoto: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfile = await userService.getUserProfile(user.id);
        if (userProfile) {
          setProfile(prev => ({
            ...prev,
            name: userProfile.name || '',
            email: user.email || '',
            phone: userProfile.phone || '',
            nrc: userProfile.nrc || '',
            dateOfBirth: userProfile.dob || '',
            gender: userProfile.gender || '',
            address: userProfile.address || '',
            profilePhoto: userProfile.profilePic || ''
          }));

          if (userProfile.profilePic) {
            const token = Cookies.get('token'); // make sure you have this
            const response = await fetch(`${userProfile.profilePic}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (response.ok) {
              const blob = await response.blob();
              setProfilePhotoUrl(URL.createObjectURL(blob));
            }
          }
        }

        const userDetails = await userService.getUserDetails(user.id);
        if (userDetails) {
          setProfile(prev => ({
            ...prev,
            experience: userDetails.experience || '',
            specialization: userDetails.specialization || ''
          }));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    console.log('Fetching profile picture:', profile.profilePhoto);

    fetchProfile();
  }, [user.id]);

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Upload file to backend
      const result = await userService.uploadProfilePicture(user.id, file);

      // The backend returns the URL of the uploaded image
      if (result.url) {
        setProfile(prev => ({ ...prev, profilePhoto: result.url }));
        setProfilePhotoUrl(result.url); // directly set preview to server-hosted image
      }

      toast({
        title: "Photo Updated",
        description: "Your profile photo has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Upload Failed",
        description: "Could not upload profile photo. Please try again.",
        variant: "destructive",
      });
    }
  };


  // ✅ Save Profile
  const handleSaveProfile = async () => {
    try {
      const response = await userService.updateProfile(profile, user.id);

      await userService.updateUserDetails(user.id, {
        experience: profile.experience,
        specialization: profile.specialization,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      handleSaveProfile();
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
                <AvatarImage src={profilePhotoUrl || "/placeholder-avatar.jpg"} />
                <AvatarFallback className="text-lg">{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <div>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
                  <Button variant="outline" onClick={() => document.getElementById('photo-upload')?.click()}>Change Photo</Button>
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={profile.name} onChange={(e) => handleInputChange('name', e.target.value)} disabled={!isEditing} />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profile.email} onChange={(e) => handleInputChange('email', e.target.value)} disabled={!isEditing} />
            </div>

            <div>
              <Label htmlFor="nrc">NRC</Label>
              <Input id="nrc" value={profile.nrc} onChange={(e) => handleInputChange('nrc', e.target.value)} disabled={!isEditing} />
            </div>

            {/* Phone + DOB */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={profile.phone} onChange={(e) => handleInputChange('phone', e.target.value)} disabled={!isEditing} />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" value={profile.dateOfBirth} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} disabled={!isEditing} />
              </div>
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Input value={profile.gender} onChange={(e) => handleInputChange('gender', e.target.value)} disabled={!isEditing} />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea value={profile.address} onChange={(e) => handleInputChange('address', e.target.value)} disabled={!isEditing} />
            </div>

            {/* Specialization */}
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Textarea id="specialization" value={profile.specialization} onChange={(e) => handleInputChange('specialization', e.target.value)} disabled={!isEditing} />
            </div>

            {/* Experience */}
            <div>
              <Label htmlFor="experience">Experience (Years)</Label>
              <Input id="experience" type="text" value={profile.experience} onChange={(e) => handleInputChange('experience', e.target.value)} disabled={!isEditing} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
