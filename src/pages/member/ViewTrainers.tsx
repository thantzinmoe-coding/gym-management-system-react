import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Star, Calendar, Users, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTrainers, Trainer } from '@/context/TrainerContext';

export default function ViewTrainers() {
  const { trainers } = useTrainers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const { toast } = useToast();

  const filteredTrainers = trainers.filter(trainer =>
    trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Available</Badge>;
      case 'busy':
        return <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">Busy</Badge>;
      case 'unavailable':
        return <Badge variant="destructive">Unavailable</Badge>;
      default:
        return <Badge variant="outline">{availability}</Badge>;
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      ))}
      <span className="text-sm text-muted-foreground ml-1">({rating})</span>
    </div>
  );

  const handleBookPackage = (packageId: string, packageName: string) => {
    toast({
      title: "Package booked successfully!",
      description: `You have successfully booked ${packageName} with ${selectedTrainer?.name}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Our Trainers</h1>
        <p className="text-muted-foreground">Meet our certified fitness professionals</p>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search trainers by name or specialization..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTrainers.map(trainer => (
          <Card key={trainer.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                    {trainer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <CardTitle>{trainer.name}</CardTitle>
                    <CardDescription>{trainer.experience} experience</CardDescription>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center"><Mail className="h-3 w-3 mr-1" />{trainer.email}</div>
                      <div className="flex items-center"><Phone className="h-3 w-3 mr-1" />{trainer.phone}</div>
                    </div>
                    {renderStars(trainer.rating)}
                  </div>
                </div>
                {getAvailabilityBadge(trainer.availability)}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>{trainer.bio}</div>
              <div>
                <span className="font-medium">Specializations:</span>
                {trainer.specialization.map((spec, i) => (
                  <div key={i}>- {spec}</div>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{trainer.totalClients} clients</span>
              </div>
            </CardContent>
            <CardContent className="pt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={trainer.availability === 'unavailable'} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white" onClick={() => setSelectedTrainer(trainer)}>
                    <Calendar className="h-4 w-4 mr-2" />Book Session
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book Session with {trainer.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">This trainer has no packages to display.</p>
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
