import { useState, useEffect } from 'react';
import { usePackages, Package } from '@/context/PackageContext';
import { useTrainers, Trainer } from '@/context/TrainerContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Clock, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';

interface MemberProfile {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  weight: string;
  height: string;
  fitnessGoals: string;
}

export default function BookPackages() {
  const { packages, setPackages } = usePackages(); 
  const { trainers } = useTrainers();
  const { user } = useAuth(); // Assuming AuthContext has member profile
  const { toast } = useToast();
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);

  useEffect(() => {
    if (user && user.role === 'member') {
      setMemberProfile({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address,
        weight: user.weight,
        height: user.height,
        fitnessGoals: user.fitnessGoals,
      });
    }
  }, [user]);

  const handleBookPackage = (packageId: number) => {
    if (!memberProfile) {
      toast({
        title: "Profile Required",
        description: "Please complete your member profile before booking a package.",
        variant: "destructive",
      });
      return;
    }

    setPackages(
      packages.map(pkg =>
        pkg.id === packageId ? { ...pkg, isBooked: true } : pkg
      )
    );

    setSelectedPackageId(packageId.toString());

    const pkg = packages.find(p => p.id === packageId);
    const memberApplications = JSON.parse(localStorage.getItem('memberApplications') || '[]');
    const newApplication = {
      id: Date.now().toString(),
      ...memberProfile,
      packageId: pkg?.id,
      packageName: pkg?.name,
      appliedAt: new Date().toISOString(),
      status: 'pending'
    };
    memberApplications.push(newApplication);
    localStorage.setItem('memberApplications', JSON.stringify(memberApplications));

    toast({
      title: "Package Booked",
      description: `You have successfully booked the ${pkg?.name} package.`,
    });
  };

  const handleCancelPackage = (packageId: number) => {
    setPackages(
      packages.map(pkg =>
        pkg.id === packageId ? { ...pkg, isBooked: false } : pkg
      )
    );

    setSelectedPackageId(null);

    const memberApplications = JSON.parse(localStorage.getItem('memberApplications') || '[]');
    const updatedApplications = memberApplications.filter(app => app.packageId !== packageId || app.email !== memberProfile?.email);
    localStorage.setItem('memberApplications', JSON.stringify(updatedApplications));

    const pkg = packages.find(p => p.id === packageId);
    toast({
      title: "Package Cancelled",
      description: `You have cancelled the ${pkg?.name} package.`,
      variant: "destructive",
    });
  };

  const personalPackages = packages.filter(p => p.type === 'personal');
  const groupPackages = packages.filter(p => p.type === 'group');

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Book Packages</h1>
        <p className="text-muted-foreground">Choose the perfect fitness package for your goals</p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">Personal Training</TabsTrigger>
          <TabsTrigger value="group">Group Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {personalPackages.map(pkg => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                trainers={trainers}
                onBook={handleBookPackage}
                onCancel={handleCancelPackage}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="group">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupPackages.map(pkg => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                trainers={trainers}
                onBook={handleBookPackage}
                onCancel={handleCancelPackage}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PackageCard({
  pkg,
  trainers,
  onBook,
  onCancel
}: {
  pkg: Package;
  trainers: Trainer[];
  onBook: (id: number) => void;
  onCancel: (id: number) => void;
}) {
  const trainer = trainers.find(t => t.id === pkg.trainerId);

  return (
    <Card className={`relative ${pkg.isPopular ? 'border-primary' : ''}`}>
      {pkg.isPopular && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground flex items-center">
            <Star className="h-3 w-3 mr-1" /> Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">{pkg.name}</CardTitle>
        {trainer && (
          <p className="text-sm mt-1">
            Trainer: <span className="font-bold text-black">{trainer.name}</span>
          </p>
        )}
        <CardDescription className="mt-2">{pkg.description}</CardDescription>
        <div className="text-3xl font-bold text-primary mt-2">
          ${pkg.price}
          <span className="text-sm font-normal text-muted-foreground">/{pkg.duration}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Display Start & End Dates */}
        {pkg.startDate && pkg.endDate && (
          <p className="text-xs text-muted-foreground">
            <Clock className="inline h-4 w-4 mr-1 text-primary" />
            {pkg.startDate} → {pkg.endDate}
          </p>
        )}

        {/* Display Schedule */}
        <div className="space-y-2">
          {pkg.schedule?.map((s, idx) => (
            <p key={idx} className="text-xs text-muted-foreground">
              <Calendar className="inline h-4 w-4 mr-1 text-primary" />
              {s.day}: {s.startTime} - {s.endTime}
            </p>
          ))}
        </div>

        <div className="pt-4">
          {pkg.isBooked ? (
            <div className="space-y-2">
              <Button variant="outline" className="w-full" disabled>
                <Check className="h-4 w-4 mr-2" /> Currently Booked
              </Button>
              <Button variant="destructive" size="sm" className="w-full" onClick={() => onCancel(pkg.id)}>
                Cancel Package
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={() => onBook(pkg.id)} variant={pkg.isPopular ? "default" : "outline"}>
              Book Package
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
