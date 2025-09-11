import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { trainerService } from '@/services/trainerService';
import Cookies from 'js-cookie';
import { manageUserService } from '@/services/manageUserService';

interface TrainerResponseDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string; // Changed to string
  specialization: string[];
  experience: number;
  avatarUrl?: string;
}

export default function ManageTrainers() {
  const [trainers, setTrainers] = useState<TrainerResponseDto[]>([]);
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<TrainerResponseDto | null>(null);

  const fetchTrainers = async () => {
    try {
      const data = await trainerService.getAllTrainers();
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
  useEffect(() => {
    fetchTrainers();
  }, [toast]);

  useEffect(() => {
    const fetchTrainerAvatars = async () => {
      const token = Cookies.get('token');
      if (!token || trainers.length === 0) return;

      const newAvatars: Record<number, string> = {};

      await Promise.all(
        trainers.map(async (trainer) => {
          // Only fetch if avatarUrl exists and is not already a blob URL
          if (trainer.avatarUrl && !trainer.avatarUrl.startsWith('blob:')) {
            try {
              const response = await fetch(trainer.avatarUrl, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              if (response.ok) {
                const blob = await response.blob();
                newAvatars[trainer.id] = URL.createObjectURL(blob);
              } else {
                console.error(`Failed to fetch avatar for trainer ${trainer.id}: ${response.statusText}`);
              }
            } catch (err) {
              console.error(`Error fetching avatar for trainer ${trainer.id}:`, err);
            }
          }
        })
      );

      setTrainers((prev) =>
        prev.map((trainer) => ({
          ...trainer,
          avatarUrl: newAvatars[trainer.id] || trainer.avatarUrl,
        }))
      );
    };

    fetchTrainerAvatars();
  }, [trainers.length]); // ← depend on length instead of full array



  // Open edit dialog for a trainer
  const handleEditTrainer = (trainer: TrainerResponseDto) => {
    setEditingTrainer(trainer);
    setIsEditDialogOpen(true);
  };

  // Update trainer status
  const handleUpdateTrainer = async () => {
    if (editingTrainer) {
      try {
        // Ensure status is a string
        await trainerService.updateTrainerStatus(editingTrainer.id, editingTrainer.status);

        // Update local state
        setTrainers((prevTrainers) =>
          prevTrainers.map((trainer) =>
            trainer.id === editingTrainer.id ? { ...trainer, status: editingTrainer.status } : trainer
          )
        );

        toast({
          title: "Trainer Updated",
          description: "Trainer status updated successfully.",
        });
        setIsEditDialogOpen(false);
        setEditingTrainer(null);
      } catch (error) {
        console.error("Error updating trainer status:", error);
        toast({
          title: "Error updating trainer",
          description: "Failed to update trainer status.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteTrainer = async (userId: number, userName: string) => {
    try {
      await manageUserService.deleteUser(userId);
      toast({
        title: "Trainer Deleted",
        description: "Trainer has been deleted successfully.",
      });
      // Reload data after deletion to reflect changes
      fetchTrainers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete trainer',
      });
    }
  };

  // Status badge component
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      EXPIRED: 'bg-red-100 text-red-800'
    };
    return <Badge className={`px-2 py-1 rounded ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Trainers</h1>
        <p className="text-gray-600">Edit trainer status and view profile details</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-white shadow rounded-lg text-black">
          <CardHeader>
            <CardTitle>Total Trainers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-black">{trainers.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow rounded-lg text-black">
          <CardHeader>
            <CardTitle>Active Trainers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-black">{trainers.filter(t => t.status === 'ACTIVE').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Trainers List */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Trainers List</CardTitle>
            <CardDescription>Manage your gym trainers</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trainers.map(trainer => (
              <div key={trainer.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                {/* Trainer Info */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={trainer.avatarUrl || "/placeholder-avatar.jpg"} />
                    <AvatarFallback className="text-lg">{trainer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{trainer.name}</p>
                    <div className="flex space-x-4 text-sm text-gray-500 mt-1">
                      <p>Email: {trainer.email}</p>
                      <p>Phone: {trainer.phone}</p>
                    </div>
                    <Badge variant="outline">{trainer.experience} experience</Badge>
                    <div className="flex space-x-2 mt-1">
                      {trainer.specialization?.map((spec: string, i: number) => (
                        <Badge key={i} variant="outline">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {getStatusBadge(trainer.status)}
                  <Button variant="outline" size="sm" onClick={() => handleEditTrainer(trainer)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTrainer(trainer.id)}
                  >
                    🗑️
                  </Button>
                </div>

              </div>
            ))}
            {trainers.length === 0 && <p className="text-center text-gray-500 py-4">No trainers found.</p>}
          </div>
        </CardContent >
      </Card >

      {/* Edit Trainer Status Dialog */}
      < Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} >
        <DialogContent className="sm:max-w-lg sm:p-6 bg-white rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle>Edit Trainer Status</DialogTitle>
          </DialogHeader>
          {editingTrainer && (
            <div className="space-y-4 mt-2">
              <div>
                <Label>Status</Label>
                <Select value={editingTrainer.status} onValueChange={value => setEditingTrainer({ ...editingTrainer, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleUpdateTrainer}>Update Status</Button>
            </div>
          )}
        </DialogContent>
      </Dialog >
    </div >
  );
}