// src/pages/ViewTrainers.tsx (Updated content)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Star, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// Import TrainerResponseDto and the new method
import { trainerService, TrainerResponseDto } from '@/services/trainerService';
import { Mail as MailIcon, Phone as PhoneIcon } from 'lucide-react';
import Cookies from 'js-cookie';
import { CardGridSkeleton } from '@/components/ui/loading';
import { initials, displayName, matches } from '@/lib/text';

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
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState<DisplayTrainer[]>([]); // Use the new interface
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [trainerImages, setTrainerImages] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainerImages = async () => {
      const token = Cookies.get('token'); // or Cookies.get("token")
      if (!token) return;

      const newImages: Record<number, string> = {};
      for (const trainer of trainers) {
        if (trainer.avatarUrl) {
          try {
            const res = await fetch(trainer.avatarUrl, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const blob = await res.blob();
              newImages[trainer.id] = URL.createObjectURL(blob);
            }
          } catch (err) {
            console.error(`Failed to load avatar for trainer ${trainer.name}`, err);
          }
        }
      }
      setTrainerImages(newImages);
    };

    if (trainers.length > 0) {
      fetchTrainerImages();
    }
  }, [trainers]);


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
      } finally {
        setLoading(false);
      }
    };

    fetchTrainersAndRatings();
  }, [toast]); // toast is a dependency for the hook

  const filteredTrainers = trainers.filter((trainer) =>
    matches(trainer.name, searchTerm)
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
        <span className="text-sm text-muted-foreground ml-1">{Number(rating || 0).toFixed(1)}</span>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Our Trainers</h1>
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

      {loading ? <CardGridSkeleton count={4} className="lg:grid-cols-2" /> : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTrainers.map((trainer) => (
          <Card key={trainer.id}>
            <CardHeader>
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div className="flex items-center gap-4 min-w-0">
                  {trainerImages[trainer.id] ? (
                    <img
                      src={trainerImages[trainer.id]}
                      alt={trainer.name}
                      className="w-16 h-16 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                      {initials(trainer.name)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <CardTitle>{displayName(trainer.name, 'Trainer')}</CardTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-muted-foreground mt-1 break-all">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/member/chat?userId=${trainer.id}`)}
                className="w-full sm:w-auto"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat with {trainer.name}
              </Button>
            </CardContent>
          </Card>
        ))}

        {filteredTrainers.length === 0 && (
          <div className="text-center py-8 col-span-full"> {/* col-span-full to center */}
            <span className="text-muted-foreground">No trainers found</span>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
