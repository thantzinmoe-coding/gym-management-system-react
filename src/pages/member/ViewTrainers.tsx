import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Star, Calendar, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { trainerService } from '@/services/trainerService'; // Ensure correct path
import { Mail as MailIcon, Phone as PhoneIcon } from 'lucide-react';

interface TrainerResponseDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
}

export default function ViewTrainers() {
  const [trainers, setTrainers] = useState<TrainerResponseDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerResponseDto | null>(null); // Keep the state
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const data = await trainerService.getAllActiveTrainers();
        if (data && data.data) {
          setTrainers(data.data);
        } else {
          console.error("Unexpected data structure:", data);
          toast({
            title: "Error fetching trainers",
            description: "Unexpected data format from the server.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to fetch trainers:", error);
        toast({
          title: "Error fetching trainers",
          description: "Failed to connect to the server.",
          variant: "destructive",
        });
      }
    };

    fetchTrainers();
  }, [toast]);

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

  const renderStars = (rating: number) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
        />
      ))}
      <span className="text-sm text-muted-foreground ml-1">({rating})</span>
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
                    {renderStars(5)}
                  </div>
                </div>
                {getAvailabilityBadge('available')}
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    disabled={false}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white"
                  // onClick={() => setSelectedTrainer(trainer)}  //Removed the book package
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
          <div className="text-center py-8">
            <span className="text-muted-foreground">No trainers found</span>
          </div>
        )}
      </div>
    </div>
  );
}