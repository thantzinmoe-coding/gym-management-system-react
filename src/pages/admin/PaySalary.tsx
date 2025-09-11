import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DollarSign,
  Calendar,
  Check,
  Clock,
  Search,
  History, // NEW: Using History icon for the button
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTrainers } from "@/context/TrainerContext";
import { salaryService } from "@/services/salaryService";
import Cookies from "js-cookie";

export default function PaySalary() {
  const { toast } = useToast();
  const { trainers, getAllTrainers } = useTrainers();
  const [searchTerm, setSearchTerm] = useState("");
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false); // NEW state for history dialog
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [totalHours, setTotalHours] = useState<Record<string, number>>({});
  // NEW: Store all salary records from the API in a single array
  const [allSalaries, setAllSalaries] = useState<any[]>([]);
  // NEW: State to hold the history for the selected trainer
  const [trainerPaymentHistory, setTrainerPaymentHistory] = useState<any[]>([]);

  const [avatarUrls, setAvatarUrls] = useState<Record<number, string>>({});

  const hourlyRates: Record<string, number> = {
    Trainer: 20,
    Administrator: 30,
    Receptionist: 15,
  };

  useEffect(() => {
    const fetchSalaryAvatars = async () => {
      const token = Cookies.get('token');
      if (!token || allSalaries.length === 0) return;

      const newAvatars: Record<number, string> = {};

      await Promise.all(
        allSalaries.map(async (salary) => {
          if (salary.trainerAvatarUrl && !avatarUrls[salary.trainerId]) {
            try {
              const response = await fetch(salary.trainerAvatarUrl, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              if (response.ok) {
                const blob = await response.blob();
                newAvatars[salary.trainerId] = URL.createObjectURL(blob);
              } else {
                console.error(
                  `Failed to fetch avatar for trainer ${salary.trainerId}: ${response.statusText}`
                );
              }
            } catch (err) {
              console.error(`Error fetching avatar for trainer ${salary.trainerId}:`, err);
            }
          }
        })
      );

      setAvatarUrls((prev) => ({ ...prev, ...newAvatars }));
    };

    fetchSalaryAvatars();
  }, [allSalaries]);

  // Fetch trainers (no change)
  useEffect(() => {
    getAllTrainers();
  }, []);

  // MODIFIED: Fetch all salary records (paid and pending) and store them.
  useEffect(() => {
    const fetchAllSalaries = async () => {
      try {
        const res = await salaryService.getAllSalaries();
        setAllSalaries(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Error fetching salaries:", err);
        toast({ title: "Error", description: "Failed to fetch salary data.", variant: "destructive" });
      }
    };
    fetchAllSalaries();
  }, [toast]); // We can add a dependency later to refetch if needed

  // Fetch trainers' work hours (no change)
  useEffect(() => {
    trainers.forEach(async (trainer) => {
      try {
        const res = await salaryService.getTotalHoursWorkedByTrainer(Number(trainer.id));
        setTotalHours((prev) => ({ ...prev, [trainer.id]: res.data.totalHoursWorked || 0 }));
      } catch (err) {
        console.error(`Error fetching hours for trainer ${trainer.id}:`, err);
        setTotalHours((prev) => ({ ...prev, [trainer.id]: 0 }));
      }
    });
  }, [trainers]);

  const calculateSalary = (trainer: any) => {
    const hoursWorked = totalHours[trainer.id] || 0;
    const rate = hourlyRates[trainer.role] || hourlyRates["Trainer"];
    return hoursWorked * rate;
  };

  // MODIFIED: Handle payment by UPDATING the existing pending record
  const handlePaySalary = async () => {
    if (!selectedTrainer) return;

    // Find the current month's PENDING salary record for this trainer
    const currentSalaryRecord = allSalaries.find(s =>
      s.trainerId.toString() === selectedTrainer.id.toString() &&
      s.status === "PENDING"
      // Note: For robustness, you could also match by month/year if the backend guarantees one record per month
    );

    if (!currentSalaryRecord) {
      toast({ title: "Error", description: "No pending salary record found for this trainer.", variant: "destructive" });
      return;
    }

    const hoursWorked = totalHours[selectedTrainer.id] || 0;
    const rate = hourlyRates[selectedTrainer.role] || hourlyRates["Trainer"];
    const calculatedSalary = hoursWorked * rate;

    try {
      // Use updateSalary with the ID of the pending record
      const response = await salaryService.updateSalary(currentSalaryRecord.id, {
        amount: calculatedSalary,
        notes: `Paid on ${new Date().toLocaleDateString()} (${hoursWorked} hrs @ $${rate}/hr)`,
        trainerId: Number(selectedTrainer.id),
      });

      // Update the local state to reflect the change immediately
      setAllSalaries(prev => prev.map(s => s.id === response.id ? response : s));

      toast({
        title: "Salary Paid",
        description: `Salary of $${calculatedSalary.toLocaleString()} paid to ${selectedTrainer.name}`,
      });

      setIsPayDialogOpen(false);
      setSelectedTrainer(null);
    } catch (err: any) {
      console.error(`Error paying salary for ${selectedTrainer.name}:`, err);
      toast({ title: "Error", description: err.message || "Failed to pay salary", variant: "destructive" });
    }
  };

  // NEW HELPER: Get salary details for a specific trainer for display
  const getTrainerSalaryInfo = (trainerId: string) => {
    const now = new Date(); // Current date is September 10, 2025
    const currentMonth = now.getMonth() + 1; // 9 for September
    const currentYear = now.getFullYear(); // 2025

    console.log("All Salaries:", allSalaries);
    console.log("Looking for Trainer ID:", trainerId, "for Month:", currentMonth, "Year:", currentYear);

    // Find the salary record for the current month and year
    const currentRecord = allSalaries.find(s =>
      s.trainerId === trainerId &&
      s.salaryMonth === currentMonth &&
      s.salaryYear === currentYear
    );

    console.log("Current Record for Trainer ID", trainerId, ":", currentRecord);

    // Find the most recent PAID salary record to determine the "Last Paid" date
    const paidSalaries = allSalaries
      .filter(s => s.trainerId === trainerId && s.status === "PAID")
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    console.log("Paid Salaries for Trainer ID", trainerId, ":", paidSalaries);

    return {
      status: currentRecord?.status || "PENDING", // Default to PENDING if no record is found for this month yet
      lastPaid: paidSalaries.length > 0 ? paidSalaries[0].paymentDate : "N/A",
    };
  };

  // NEW HELPER: Open the history dialog for a trainer
  const openHistoryDialog = (trainer: any) => {
    const history = allSalaries
      .filter(s => s.trainerId.toString() === trainer.id.toString() && s.status === "PAID")
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    setTrainerPaymentHistory(history);
    setSelectedTrainer(trainer);
    setIsHistoryDialogOpen(true);
  };

  const filteredTrainers = trainers.filter(trainer =>
    trainer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ... (Header and Summary Cards sections remain the same) ... */}

      {/* Trainer Salary List */}
      <Card>
        <CardHeader>
          <CardTitle>Trainer Salary Management</CardTitle>
          <CardDescription>
            Process salary payments for the current month: September 2025
          </CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trainers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTrainers.map((trainer) => {
              const hoursWorked = totalHours[trainer.id] || 0;
              const calculatedSalary = calculateSalary(trainer);
              const salaryInfo = getTrainerSalaryInfo(trainer.id);

              const trainerSalaryData = allSalaries.find(
                (s) => s.trainerId.toString() === trainer.id.toString()
              );
              return (
                <div key={trainer.id} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                  {/* Trainer Info */}
                  <div className="flex items-center space-x-4">
                    {avatarUrls[trainer.id] ? (
                      <img
                        src={avatarUrls[trainer.id]}
                        alt={trainer.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-medium">
                        {trainer.name.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{trainer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {trainerSalaryData?.trainerEmail || "No email"}
                      </p>
                    </div>
                  </div>

                  {/* Salary Details */}
                  <div className="flex items-center gap-6 text-sm text-right">
                    <div>
                      <p className="text-muted-foreground">Hours Worked</p>
                      <p className="font-medium">{hoursWorked} hrs</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Net Salary</p>
                      <p className="font-bold text-lg text-primary">${calculatedSalary.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center space-x-2">
                    <Badge variant={salaryInfo.status === "PAID" ? "default" : "destructive"}>
                      {salaryInfo.status}
                    </Badge>

                    <Button variant="outline" size="sm" onClick={() => openHistoryDialog(trainer)}>
                      <History className="h-4 w-4 mr-2" />
                      History
                    </Button>

                    {salaryInfo.status === "PENDING" && (
                      <Dialog open={isPayDialogOpen && selectedTrainer?.id === trainer.id} onOpenChange={setIsPayDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => setSelectedTrainer(trainer)}>
                            Pay Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Salary Payment</DialogTitle>
                          </DialogHeader>
                          {selectedTrainer && (
                            <div className="space-y-4">
                              <p>You are about to pay <strong>${calculateSalary(selectedTrainer).toLocaleString()}</strong> to <strong>{selectedTrainer.name}</strong>.</p>
                              <Button onClick={handlePaySalary} className="w-full">
                                Confirm Payment
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* NEW: Salary History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salary History for {selectedTrainer?.name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
            {trainerPaymentHistory.length > 0 ? (
              trainerPaymentHistory.map(record => (
                <div key={record.id} className="p-3 bg-muted rounded-md text-sm">
                  <div className="flex justify-between font-medium">
                    <span>${record.amount.toLocaleString()}</span>
                    <span>{record.paymentDate}</span>
                  </div>
                  <p className="text-muted-foreground text-xs">{record.notes}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No payment history found.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}