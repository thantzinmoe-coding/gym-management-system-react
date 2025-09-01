import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, Users, Calendar, DollarSign, Target, Clock } from 'lucide-react';

interface TrainerPackage {
  id: string;
  name: string;
  duration: string;
  price: number;
  clientsEnrolled: number;
  maxClients: number;
  startDate: string;
  endDate: string;
  description: string;
  status: 'active' | 'completed' | 'upcoming';
}

const mockPackages: TrainerPackage[] = [
  {
    id: '1',
    name: 'Weight Loss Bootcamp',
    duration: '12 weeks',
    price: 299,
    clientsEnrolled: 8,
    maxClients: 10,
    startDate: '2024-01-01',
    endDate: '2024-03-25',
    description: 'Intensive weight loss program with cardio and strength training',
    status: 'active'
  },
  {
    id: '2',
    name: 'Strength Training Advanced',
    duration: '8 weeks',
    price: 399,
    clientsEnrolled: 6,
    maxClients: 8,
    startDate: '2024-02-01',
    endDate: '2024-03-28',
    description: 'Advanced strength training for experienced athletes',
    status: 'active'
  },
  {
    id: '3',
    name: 'Beginner Fitness',
    duration: '6 weeks',
    price: 199,
    clientsEnrolled: 12,
    maxClients: 12,
    startDate: '2023-12-01',
    endDate: '2024-01-15',
    description: 'Introduction to fitness for beginners',
    status: 'completed'
  },
  {
    id: '4',
    name: 'Summer Body Prep',
    duration: '10 weeks',
    price: 349,
    clientsEnrolled: 0,
    maxClients: 15,
    startDate: '2024-03-01',
    endDate: '2024-05-10',
    description: 'Get ready for summer with this comprehensive fitness program',
    status: 'upcoming'
  }
];

export default function ViewPackages() {
  const [packages] = useState<TrainerPackage[]>(mockPackages);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEnrollmentPercentage = (enrolled: number, max: number) => {
    return (enrolled / max) * 100;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Training Packages</h1>
        <p className="text-muted-foreground">Manage and view your training packages and enrolled clients</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{packages.length}</div>
            <p className="text-xs text-muted-foreground">All packages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {packages.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {packages.reduce((total, pkg) => total + pkg.clientsEnrolled, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Enrolled clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${packages.reduce((total, pkg) => total + (pkg.price * pkg.clientsEnrolled), 0)}
            </div>
            <p className="text-xs text-muted-foreground">From all packages</p>
          </CardContent>
        </Card>
      </div>

      {/* Packages List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </div>
                {getStatusBadge(pkg.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{pkg.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>${pkg.price}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{pkg.startDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{pkg.endDate}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Client Enrollment</span>
                  <span>{pkg.clientsEnrolled}/{pkg.maxClients}</span>
                </div>
                <Progress 
                  value={getEnrollmentPercentage(pkg.clientsEnrolled, pkg.maxClients)} 
                  className="h-2" 
                />
              </div>

              <div className="pt-2 border-t border-border">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Revenue Generated:</span>
                  <span className="font-semibold text-primary">
                    ${pkg.price * pkg.clientsEnrolled}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
