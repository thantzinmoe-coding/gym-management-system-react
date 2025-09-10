// ViewNotifications.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, Eye, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTrainers } from '@/context/TrainerContext';
import { trainerService } from '@/services/trainerService';
import { superAdminService } from '@/services/adminService';

export default function ViewNotifications() {
  const [trainerApplications, setTrainerApplications] = useState([]);
  const [memberApplications, setMemberApplications] = useState([]);
  const [selectedTrainerApp, setSelectedTrainerApp] = useState(null);
  const [selectedMemberApp, setSelectedMemberApp] = useState(null);

  const { toast } = useToast();
  const { addTrainer } = useTrainers();

  const fetchTrainerApplications = async () => {
    try {
      const res = await trainerService.getTrainerApplications();
      console.log("Trainer Applications API:", res);

      // handle both formats: {data: []} or []
      if (Array.isArray(res)) {
        setTrainerApplications(res);
      } else if (res && Array.isArray(res.data)) {
        setTrainerApplications(res.data);
      } else {
        console.error("Unexpected trainer applications format:", res);
        setTrainerApplications([]);
      }
    } catch (error) {
      console.error("Failed to fetch trainer applications:", error);
      toast({
        title: "Error fetching trainer applications",
        description: "Failed to load trainer applications.",
        variant: "destructive"
      });
    }
  };
  // Load applications

  const fetchMemberApplications = async () => {
    try {
      const res = await superAdminService.getAllBookings({});
      console.log("Member Applications API:", res);

      if (res && Array.isArray(res.data)) {
        const mapped = res.data.map((app) => ({
          id: app.bookingId,
          fullName: app.memberName,
          email: app.memberEmail || "",   // backend doesn’t send yet
          phone: app.memberPhone || "",   // backend doesn’t send yet
          bookingId: app.bookingId || 0,
          packageName: app.gymPackageName,
          status: app.memberStatus.toLowerCase(), // ACTIVE, PENDING
          Phone: app.phone || "",
          nrc: app.nrc || "",
          dob: app.dob || "",
          gender: app.gender || "",
          weight: app.weight || "",
          height: app.height || "",
          address: app.address || "",
          goal: app.goal || "",   // changed from fitnessGoals to goal
        }));
        setMemberApplications(mapped);
      } else {
        setMemberApplications([]);
      }
    } catch (error) {
      console.error("Failed to fetch member applications:", error);
      toast({
        title: "Error fetching member applications",
        description: "Failed to load member booking requests.",
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
    fetchTrainerApplications();
    fetchMemberApplications();
  }, []);

  // Status badge
  const getStatusBadge = (status) => {
    const colors = { pending: 'bg-yellow-500', INACTIVE: 'bg-yellow-400', ACTIVE: 'bg-green-400', approved: 'bg-green-500', rejected: 'bg-red-500' };
    return <Badge className={colors[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };


  const acceptTrainerApplication = async (trainerId) => {
    try {
      await trainerService.acceptTrainerApplication(trainerId);
      toast({ title: "Trainer Accepted", description: "Trainer application accepted." });
      fetchTrainerApplications();
    } catch (error) {
      console.error("Error accepting trainer application:", error);
      throw error;
    }
  };

  const handleApproveTrainer = (app) => {
    addTrainer({
      name: app.name,
      email: app.email,
      phone: app.phone,
      specialization: [app.specialization || 'General'],
      experience: app.experience || 2,
      rating: 0,
      totalClients: 0,
      packages: [],
      status: 'Active',
    });

    acceptTrainerApplication(app.id);

  };

  const rejectTrainer = async (trainerId) => {
    try {
      await superAdminService.rejectTrainer(trainerId);
      toast({ title: "Trainer Rejected", description: "Trainer application rejected." });
      fetchTrainerApplications();
    } catch (error) {
      console.error("Error rejecting trainer application:", error);
      throw error;
    }
  };

  const approveMember = async (id) => {
    try {
      const res = await superAdminService.approveMemberBooking(id);
      console.log("Approve Member Response:", res);
      toast({ title: "Booking Approved", description: `${res?.data?.AcceptedBookingResponse?.memberId} booking approved.` });
      fetchMemberApplications();
    } catch (error) {
      console.error("Error approving member booking:", error);
      throw error;
    }
  };

  const rejectMember = async (id, email, packageName, name) => {
    try {
      const res = await superAdminService.rejectMemberBooking(id, email, packageName, name);
      console.log("Reject Member Response:", res);
      toast({ title: "Booking Rejected", description: "Member booking rejected." });
      fetchMemberApplications();
    } catch (error) {
      console.error("Error rejecting member booking:", error);
      throw error;
    }
  };

  const handleApproveMember = (app) => {
    approveMember(app.bookingId);
  };

  const handleRejectMember = (app) => {
    rejectMember(app.bookingId, app.email, app.packageName, app.fullName);
  };

  const handleRejectTrainer = (app) => {
    rejectTrainer(app.id);
  };

  // --- Render Details ---
  const renderTrainerDetails = (app) => (
    <div className="space-y-2">
      <p><strong>Full Name:</strong> {app.name || "N/A"}</p>
      <p><strong>Email:</strong> {app.email || "N/A"}</p>
      <p><strong>NRC:</strong> {app.nrc || "N/A"}</p>
      <p><strong>Phone:</strong> {app.phone || "N/A"}</p>
      <p><strong>Date of Birth:</strong> {app.dob || "N/A"}</p>
      <p><strong>Gender:</strong> {app.gender || "N/A"}</p>
      <p><strong>Specialization:</strong> {app.specialization || "N/A"}</p>
      <p><strong>Experience (years):</strong> {app.experience || "N/A"}</p>
    </div>
  );

  const renderMemberDetails = (app) => (
    <div className="space-y-2">
      <p><strong>Full Name:</strong> {app.fullName}</p>
      <p><strong>Email:</strong> {app.email}</p>
      <p><strong>NRC:</strong> {app.nrc}</p>
      <p><strong>Phone:</strong> {app.Phone}</p>
      <p><strong>Date of Birth:</strong> {app.dob}</p>
      <p><strong>Gender:</strong> {app.gender}</p>
      <p><strong>Weight (kg):</strong> {app.weight}</p>
      <p><strong>Height (cm):</strong> {app.height}</p>
      <p><strong>Address:</strong> {app.address}</p>
      <p><strong>Fitness Goals:</strong> {app.goal}</p>
      <p><strong>Package:</strong> {app.packageName}</p>
    </div>
  );

  // --- Render ---
  return (
    <div className="space-y-6 p-6">

      {/* Trainer Applications */}
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Trainer Applications</h1>
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>Review trainer applications</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainerApplications.map(app => (
                  <TableRow key={app.id}>
                    <TableCell>{app.name}</TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell>{app.phone}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Dialog
                        open={selectedTrainerApp?.id === app.id}
                        onOpenChange={(open) => !open && setSelectedTrainerApp(null)}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedTrainerApp(app)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Trainer Application Details</DialogTitle>
                          </DialogHeader>
                          {selectedTrainerApp && renderTrainerDetails(selectedTrainerApp)}
                        </DialogContent>
                      </Dialog>
                      {app.status.toLowerCase() === 'pending' && (
                        <>
                          <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveTrainer(app)}>
                            <Check className="h-4 w-4" />
                          </Button>

                          <Button size="sm" variant="destructive" onClick={() => handleRejectTrainer(app)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {trainerApplications.length === 0 && <p className="text-center py-4 text-muted-foreground">No trainer applications found.</p>}
          </CardContent>
        </Card>
      </div>
      {/* Member Applications */}
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Member Applications</h1>
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>Review member booking requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberApplications.map(app => (
                  <TableRow key={app.id}>
                    <TableCell>{app.email}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Dialog
                        open={selectedMemberApp?.id === app.id}
                        onOpenChange={(open) => !open && setSelectedMemberApp(null)}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedMemberApp(app)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Member Application Details</DialogTitle>
                          </DialogHeader>
                          {selectedMemberApp && renderMemberDetails(selectedMemberApp)}
                        </DialogContent>
                      </Dialog>
                      {app.status === 'pending' && (
                        <>
                          <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveMember(app)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRejectMember(app)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {memberApplications.length === 0 && <p className="text-center py-4 text-muted-foreground">No member applications found.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
