import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, User, Activity, Star, CreditCard, Phone, Calendar, Users } from 'lucide-react';

interface MemberHealth {
  id: string;
  name: string;
  email: string;
  profilePic: string;
  nrc: string;
  phone: string;
  dob: string;
  gender: string;
  healthInfo: {
    weight: number;
    height: number;
  };
  goals: string[];
  lastVisit: string;
}

const mockMembers: MemberHealth[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    profilePic: 'https://randomuser.me/api/portraits/women/68.jpg',
    nrc: '12/ABC(N)123456',
    phone: '+959123456789',
    dob: '1990-05-10',
    gender: 'Female',
    healthInfo: {
      weight: 65,
      height: 170
    },
    goals: ['Weight Loss', 'Muscle Building', 'Improved Cardio'],
    lastVisit: '2024-01-15'
  },
  {
    id: '2',
    name: 'Mike Wilson',
    email: 'mike@example.com',
    profilePic: 'https://randomuser.me/api/portraits/men/45.jpg',
    nrc: '7/MNO(N)987654',
    phone: '+959987654321',
    dob: '1988-11-22',
    gender: 'Male',
    healthInfo: {
      weight: 85,
      height: 180
    },
    goals: ['Strength Training', 'Weight Loss'],
    lastVisit: '2024-01-14'
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma@example.com',
    profilePic: 'https://randomuser.me/api/portraits/women/65.jpg',
    nrc: '9/XYZ(N)112233',
    phone: '+959112233445',
    dob: '1995-02-18',
    gender: 'Female',
    healthInfo: {
      weight: 158,
      height: 165
    },
    goals: ['Flexibility', 'Muscle Toning', 'Overall Fitness'],
    lastVisit: '2024-01-16'
  }
];

// Calculate BMI dynamically
const calculateBMI = (weight: number, height: number) => {
  const heightInMeters = height / 100;
  return +(weight / (heightInMeters * heightInMeters)).toFixed(1);
};

// Determine BMI status
const getBMIStatus = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Underweight', variant: 'secondary' as const };
  if (bmi < 25) return { label: 'Normal', variant: 'default' as const };
  if (bmi < 30) return { label: 'Overweight', variant: 'destructive' as const };
  return { label: 'Obese', variant: 'destructive' as const };
};

export default function ViewMembers() {
  const [members] = useState<MemberHealth[]>(mockMembers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Members</h1>
        <p className="text-muted-foreground">View health information of your assigned members</p>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Members List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMembers.map(member => {
          const bmi = calculateBMI(member.healthInfo.weight, member.healthInfo.height);
          const bmiStatus = getBMIStatus(bmi);

          return (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex justify-between items-start space-x-4">
                  <img
                    src={member.profilePic}
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.email}</CardDescription>
                  </div>
                  <Badge variant={bmiStatus.variant}>
                    BMI: {bmi} ({bmiStatus.label})
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2">
                  {/* NRC */}
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-purple-500" />
                    <p className="text-sm font-medium">NRC: {member.nrc}</p>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-medium">Phone: {member.phone}</p>
                  </div>

                  {/* Date of Birth */}
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-medium">Date of Birth: {member.dob}</p>
                  </div>

                  {/* Gender */}
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-red-500" />
                    <p className="text-sm font-medium">Gender: {member.gender}</p>
                  </div>

                  {/* Height */}
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-medium">Height: {member.healthInfo.height} cm</p>
                  </div>

                  {/* Weight */}
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-medium">Weight: {member.healthInfo.weight} kg</p>
                  </div>

                  {/* Fitness Goals */}
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-red-500" />
                    <p className="text-sm font-medium mb-1">Fitness Goals:</p>
                  </div>
                  <div className="flex flex-wrap gap-1 ml-6">
                    {member.goals.map((goal, index) => (
                      <Badge key={index} variant="outline">{goal}</Badge>
                    ))}
                  </div>
                </div>

                {/* Last visit */}
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">Last visit: {member.lastVisit}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
