import { useState, useEffect } from 'react';
import { usePackages, Package } from '@/context/PackageContext';
import { useTrainers, Trainer } from '@/context/TrainerContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Clock, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { authService } from '@/services/authService';
import { bookPackageService } from "@/services/bookPackageService";

// Define the type for the booking details based on your backend DTO
interface BookPackageDetailResponseDto {
  bookPackageId: number;
  bookingDate: string;
  memberStatus: 'PENDING' | 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  gymPackageName: string;
  gymPackageDescription: string;
  price: number;
  startDate: string;
  endDate: string;
  duration: string;
  startTime: string;
  endTime: string;
  day: string;
}

export default function BookPackages() {
  const { packages, setPackages, getAllGymPackages } = usePackages();
  const { trainers, getAllTrainers } = useTrainers();
  const user = authService.getCurrentUser();
  const { toast } = useToast();

  // State to hold the user's current active or pending booking
  const [currentBooking, setCurrentBooking] = useState<BookPackageDetailResponseDto | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch all available packages and trainers
      await getAllGymPackages();
      await getAllTrainers();

      if (user?.id) {
        try {
          // 2. Fetch the current user's bookings
          const userBookingsResponse = await bookPackageService.getBookingsByMember(user.id);
          const userBookings: BookPackageDetailResponseDto[] = userBookingsResponse.data || [];

          // 3. Find the first active or pending booking
          const activeBooking = userBookings.find(
            b => b.memberStatus === 'PENDING' || b.memberStatus === 'ACTIVE'
          );

          setCurrentBooking(activeBooking || null);

          // 4. If an active booking exists, sync the UI state for the packages list
          if (activeBooking) {
            setPackages(prevPackages =>
              prevPackages.map(pkg =>
                // Match the package from the main list with the user's active booking
                pkg.name === activeBooking.gymPackageName
                  ? { ...pkg, isBooked: true, bookingId: activeBooking.bookPackageId }
                  // Ensure other packages are not marked as booked, and disable them
                  : { ...pkg, isBooked: false, isDisabled: true }
              )
            );
          }
        } catch (error) {
          console.error("Failed to fetch user bookings:", error);
          toast({
            title: "Error",
            description: "Could not fetch your booking status. Please refresh the page.",
            variant: "destructive",
          });
        }
      }
    };

    fetchData();
  }, [user?.id]); // Rerun effect if the user ID changes

  const handleBookPackage = async (packageId: number) => {
    if (!user?.id) return;
    try {
      const response = await bookPackageService.bookGymPackage({
        memberID: user.id,
        gymPackageID: packageId,
      });

      // Assuming the successful response contains the new booking details
      const newBooking = response.data?.BookPackage;

      if (newBooking) {
        // Update the UI immediately
        setPackages(
          packages.map(pkg =>
            pkg.id === packageId
              ? { ...pkg, isBooked: true, bookingId: newBooking.bookingPackageID }
              : { ...pkg, isBooked: false, isDisabled: true } // Disable other packages
          )
        );

        // Also update the status banner
        setCurrentBooking({
          bookPackageId: newBooking.bookingPackageID,
          gymPackageName: newBooking.gymPackageName,
          memberStatus: 'PENDING',
          // ... fill other properties as available from `newBooking`
        } as BookPackageDetailResponseDto);
      }

      toast({
        title: "Package Booked",
        description: `You have successfully booked the ${newBooking?.gymPackageName || "selected"} package.`,
      });
    } catch (err: any) {
      toast({
        title: "Booking Failed",
        description: err.message || "Unable to book package. You may already have an active booking.",
        variant: "destructive",
      });
    }
  };

  const handleCancelPackage = async (bookingId: number, packageId: number) => {
    try {
      await bookPackageService.cancelGymPackage(bookingId);

      // Reset the UI state to allow booking again
      setPackages(
        packages.map(pkg => ({ ...pkg, isBooked: false, bookingId: undefined, isDisabled: false }))
      );
      setCurrentBooking(null);

      toast({
        title: "Package Cancelled",
        description: "You have successfully cancelled your package.",
      });
    } catch (err: any) {
      toast({
        title: "Cancellation Failed",
        description: err.message || "Unable to cancel package. Please try again.",
        variant: "destructive",
      });
    }
  };

  const personalPackages = packages.filter(p => p.gymPackageType === 'PERSONAL');
  const groupPackages = packages.filter(p => p.gymPackageType === 'GROUP');

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Book Packages</h1>
        <p className="text-muted-foreground">Choose the perfect fitness package for your goals</p>
      </div>

      {/* Active Booking Status Banner */}
      {currentBooking && (
        <Card className="bg-secondary border-primary">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Check className="h-5 w-5 mr-2 text-primary" />
              You Have a Booking!
            </CardTitle>
            <CardDescription>
              You have a <Badge variant="outline">{currentBooking.memberStatus}</Badge> booking for the <strong>{currentBooking.gymPackageName}</strong> package.
              {/* ✨ MODIFICATION: Conditional text */}
              {currentBooking.memberStatus === 'ACTIVE'
                ? ' This package cannot be cancelled while it is active.'
                : ' You can cancel it below if you wish to choose another.'
              }
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">Personal Training</TabsTrigger>
          <TabsTrigger value="group">Group Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalPackages.map(pkg => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                trainers={trainers}
                onBook={handleBookPackage}
                onCancel={handleCancelPackage}
                // ✨ MODIFICATION: Pass the status down as a prop
                memberStatus={currentBooking?.memberStatus}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="group">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupPackages.map(pkg => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                trainers={trainers}
                onBook={handleBookPackage}
                onCancel={handleCancelPackage}
                // ✨ MODIFICATION: Pass the status down as a prop
                memberStatus={currentBooking?.memberStatus}
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
  onCancel,
  // ✨ MODIFICATION: Add memberStatus to the props
  memberStatus
}: {
  pkg: Package & { bookingId?: number; isDisabled?: boolean };
  trainers: Trainer[];
  onBook: (id: number) => void;
  onCancel: (bookingId: number, packageId: number) => void;
  // ✨ MODIFICATION: Define the type for the new prop
  memberStatus?: 'PENDING' | 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
}) {
  const trainer = trainers.find(t => t.id === pkg.trainerId);

  return (
    <Card className={`relative transition-all ${pkg.isPopular ? 'border-primary' : ''} ${pkg.isDisabled && !pkg.isBooked ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
            Trainer: <span className="font-semibold text-foreground">{trainer.name}</span>
          </p>
        )}
        <CardDescription className="mt-2 min-h-[40px]">{pkg.description}</CardDescription>
        <div className="text-3xl font-bold text-primary mt-2">
          ${pkg.price}
          <span className="text-sm font-normal text-muted-foreground">/{pkg.duration}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {pkg.startDate && pkg.endDate && (
          <p className="text-xs text-muted-foreground flex items-center justify-center">
            <Clock className="inline h-4 w-4 mr-1 text-primary" />
            {pkg.startDate} → {pkg.endDate}
          </p>
        )}
        <div className="space-y-2">
          {pkg.schedules?.map((s, idx) => (
            <p key={idx} className="text-xs text-muted-foreground flex items-center justify-center">
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
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => pkg.bookingId && onCancel(pkg.bookingId, pkg.id)}
                // ✨ MODIFICATION: Disable button if status is ACTIVE
                disabled={memberStatus === 'ACTIVE'}
              >
                Cancel Package
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={() => onBook(pkg.id)}
              variant={pkg.isPopular ? "default" : "outline"}
              disabled={pkg.isDisabled}
            >
              Book Package
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}