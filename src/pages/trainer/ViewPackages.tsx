"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, Users, Calendar, DollarSign, Target, Clock } from 'lucide-react';
import { manageUserService } from '@/services/manageUserService';
import { authService } from '@/services/authService';
import { assignedGymPackageService } from '@/services/assignedGymPackageService';
import { Schedule } from '@/context/PackageContext';

interface TrainerPackage {
  id: string;
  name: string;
  duration: string;
  price: number;
  clientsEnrolled: number;
  type: string;
  maxClients: number;
  startDate: string;
  endDate: string;
  description: string;
  schedules: Schedule[];
  status: 'active' | 'completed' | 'upcoming';
}

export default function ViewPackages() {
  const [packages, setPackages] = useState<TrainerPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const trainer = authService.getCurrentUser();
  const trainerId = trainer?.id;

  useEffect(() => {
    const fetchPackages = async () => {
      if (!trainerId) return;
      setLoading(true);
      try {
        const response = await assignedGymPackageService.getAllAssignedPackagesByTrainerId(trainerId, 0, 20);
        const data: TrainerPackage[] = response.data.map((pkg: any) => ({
          ...pkg,
          maxClients: pkg.type.toLowerCase() !== 'personal' ? 10 : 1, // If backend doesn't return maxClients, you can default
          schedules: pkg.schedule || [],
        }));
        setPackages(data);
      } catch (error) {
        console.error('Error fetching assigned packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [trainerId]);

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

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':'); // "08:00:00" -> ["08","00","00"]
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };


  const getEnrollmentPercentage = (enrolled: number, max: number) => {
    return (enrolled / max) * 100;
  };

  if (loading) return <p className="text-muted-foreground">Loading packages...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Training Packages</h1>
        <p className="text-muted-foreground">Manage and view your training packages and enrolled clients</p>
      </div>

      {/* Summary Cards */}
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col justify-between">
            <div className="text-2xl font-bold text-primary">{packages.length}</div>
            <p className="text-xs text-muted-foreground">All packages</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col justify-between">
            <div className="text-2xl font-bold text-primary">
              {packages.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col justify-between">
            <div className="text-2xl font-bold text-primary">
              {packages.reduce((total, pkg) => total + pkg.clientsEnrolled, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Enrolled clients</p>
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

              {/* Inside CardContent for each package */}
              <div className="pt-2 border-t border-border">
                <p className="text-sm font-medium mb-1">Schedules:</p>
                {pkg.schedules.length > 0 ? (
                  <div className="flex flex-col space-y-1 ml-2">
                    {pkg.schedules.map((schedule) => (
                      <div key={schedule.id} className="flex justify-between text-sm text-muted-foreground">
                        <span>{schedule.day}</span>
                        <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground ml-2">No schedules assigned</p>
                )}
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
