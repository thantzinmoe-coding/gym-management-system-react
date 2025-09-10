// src/pages/ViewTrainers.tsx (Updated content)
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Star, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// Import TrainerResponseDto and the new method
import { trainerService, TrainerResponseDto } from '@/services/trainerService';
import { Mail as MailIcon, Phone as PhoneIcon } from 'lucide-react';

// Define an interface for the trainer data we'll display, including rating
// This extends the existing TrainerResponseDto to add rating information
interface DisplayTrainer extends TrainerResponseDto {
  averageRating: number;
  // If you can fetch a rating count, you could add it here too, e.g.:
  // ratingCount: number;
}

// Interface for the average rating response from the backend (as defined in trainerService.ts)
interface AverageRatingResponse {
  averageRating: number;
}


export default function ViewTrainers() {
  const [trainers, setTrainers] = useState<DisplayTrainer[]>([]); // Use the new interface
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrainersAndRatings = async () => {
      try {
        // Fetch all active trainers first
        const trainerData = await trainerService.getAllActiveTrainers();
        if (!trainerData || !trainerData.data) {
          console.error("Unexpected data structure from getAllActiveTrainers:", trainerData);
          toast({
            title: "Error fetching trainers",
            description: "Unexpected data format from the server.",
            variant: "destructive",
          });
          return;
        }

        const activeTrainers: TrainerResponseDto[] = trainerData.data;

        // Fetch average rating for each trainer
        // Promise.all allows fetching ratings concurrently for better performance
        const trainersWithRatings: DisplayTrainer[] = await Promise.all(
          activeTrainers.map(async (trainer) => {
            try {
              // Call the new service method to get the average rating
              const ratingResponse = await trainerService.getTrainerAverageRating(trainer.id);
              // If you had a way to fetch the count of ratings, you'd include it here
              return {
                ...trainer,
                averageRating: ratingResponse.averageRating,
                // ratingCount: ratingResponse.ratingCount || 0 // Placeholder if count is not available
              };
            } catch (ratingError) {
              console.warn(`Could not fetch rating for trainer ${trainer.id}:`, ratingError);
              // Assign a default rating (0.0) if fetching fails or if no ratings exist
              return {
                ...trainer,
                averageRating: 0.0,
                // ratingCount: 0
              };
            }
          })
        );
        setTrainers(trainersWithRatings);

      } catch (error) {
        console.error("Failed to fetch trainers:", error);
        toast({
          title: "Error fetching trainers",
          description: "Failed to connect to the server.",
          variant: "destructive",
        });
      }
    };

    fetchTrainersAndRatings();
  }, [toast]); // toast is a dependency for the hook

  const filteredTrainers = trainers.filter((trainer) =>
    trainer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            Available
          </Badge>
        );
      case 'busy':
        return (
          <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">
            Busy
          </Badge>
        );
      case 'unavailable':
        return <Badge variant="destructive">Unavailable</Badge>;
      default:
        return <Badge variant="outline">{availability}</Badge>;
    }
  };

  // Modified renderStars to accept the fetched rating and display it.
  // The 'count' parameter can be used if you have that data.
  // For now, we'll display the average rating value itself if no count.
  const renderStars = (rating: number, count?: number) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
        />
      ))}
      {/* Display count if available and greater than 0 */}
      {count !== undefined && count > 0 && (
        <span className="text-sm text-muted-foreground ml-1">({count})</span>
      )}
      {/* If count is 0, undefined, or not relevant, show the average rating value */}
      {(count === undefined || count === 0) && (
        <span className="text-sm text-muted-foreground ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Our Trainers</h1>
        <p className="text-muted-foreground">
          Meet our certified fitness professionals
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search trainers by name or specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTrainers.map((trainer) => (
          <Card key={trainer.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                    {trainer.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <CardTitle>{trainer.name}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center">
                        <MailIcon className="h-3 w-3 mr-1" />
                        {trainer.email}
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="h-3 w-3 mr-1" />
                        {trainer.phone}
                      </div>
                    </div>
                    {/* Render stars using the fetched averageRating */}
                    {/* If you can fetch a rating count, pass it as the second argument */}
                    {renderStars(trainer.averageRating /*, trainer.ratingCount */)}
                  </div>
                </div>
                {getAvailabilityBadge(trainer.status)} {/* Assuming status maps to availability */}
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    disabled={false} // Adjust based on trainer availability or other logic
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Session
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book Session with {trainer.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      This feature is coming soon!
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}

        {filteredTrainers.length === 0 && (
          <div className="text-center py-8 col-span-full"> {/* col-span-full to center */}
            <span className="text-muted-foreground">No trainers found</span>
          </div>
        )}
      </div>
    </div>
  );
}

