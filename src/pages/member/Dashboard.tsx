import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, Dumbbell } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";
import { useTrainers } from "@/context/TrainerContext";
import { authService } from "@/services/authService";
import { bookPackageService } from "@/services/bookPackageService";
import { Badge } from "@/components/ui/badge";

interface BookPackageDetailResponseDto {
  bookPackageId: number;
  bookingDate: string;
  memberStatus: "PENDING" | "ACTIVE" | "CANCELLED" | "COMPLETED";
  gymPackageName: string;
  price: number;
  startDate: string;
  endDate: string;
  duration: string;
  startTime: string;
  endTime: string;
  day: string;
  trainerId?: number; // make sure backend sends this
  trainerName?: string;
}

export default function MemberDashboard() {
  const navigate = useNavigate();
  const { trainers, getAllTrainers } = useTrainers();
  const user = authService.getCurrentUser();

  // Booking state
  const [currentBooking, setCurrentBooking] = useState<BookPackageDetailResponseDto | null>(null);

  // BMI state
  const [bmiEntries, setBmiEntries] = useState<{ date: string; bmi: number }[]>([]);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmiValue, setBmiValue] = useState<number | null>(null);

  // Fetch booking + trainers
  useEffect(() => {
    const fetchData = async () => {
      await getAllTrainers();

      if (user?.id) {
        try {
          const response = await bookPackageService.getBookingsByMember(user.id);
          const bookings: BookPackageDetailResponseDto[] = response.data || [];
          const activeBooking = bookings.find(
            (b) => b.memberStatus === "PENDING" || b.memberStatus === "ACTIVE"
          );
          setCurrentBooking(activeBooking || null);
        } catch (err) {
          console.error("Failed to fetch booking:", err);
        }
      }
    };
    fetchData();
  }, [user?.id]);

  // Load BMI data
  useEffect(() => {
    const storedBmi = localStorage.getItem("member_bmi_entries");
    if (storedBmi) setBmiEntries(JSON.parse(storedBmi));
  }, []);

  // Save BMI data
  useEffect(() => {
    localStorage.setItem("member_bmi_entries", JSON.stringify(bmiEntries));
  }, [bmiEntries]);

  // Handle BMI submission
  const addBmiEntry = () => {
    if (!weight || !height) {
      alert("Please enter both weight (kg) and height (cm)");
      return;
    }
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    const bmi = parseFloat((w / (h * h)).toFixed(1));
    setBmiValue(bmi);

    const today = new Date().toISOString().split("T")[0];
    const updatedEntries = [...bmiEntries, { date: today, bmi }];
    setBmiEntries(updatedEntries);

    setWeight("");
    setHeight("");
  };

  // Dynamic stats
  const stats = [
    {
      title: "Membership Status",
      value: currentBooking ? currentBooking.memberStatus : "No Booking",
      icon: Package,
      color: "text-green-400",
    },
    {
      title: "Assigned Trainer",
      value: currentBooking?.trainerName || "Not Assigned",
      icon: Users,
      color: "text-purple-400",
    },
    {
      title: "Current Package",
      value: currentBooking ? currentBooking.gymPackageName : "None",
      icon: Dumbbell,
      color: "text-orange-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Member Dashboard</h1>
        <p className="text-muted-foreground">Track your BMI and membership progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* BMI Tracker */}
      {/* ... keep your BMI tracker code the same */}
      {/* BMI Tracker */}
      <Card className="bg-blue-900 text-white">
        <CardHeader>
          <CardTitle>BMI Tracker</CardTitle>
          <CardDescription>Track your Body Mass Index daily or monthly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="number"
              placeholder="Weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="p-2 rounded-md border border-white/50 text-black md:w-40"
            />
            <input
              type="number"
              placeholder="Height (cm)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="p-2 rounded-md border border-white/50 text-black md:w-40"
            />
            <button
              onClick={addBmiEntry}
              className="p-2 bg-white text-blue-900 font-semibold rounded-md hover:bg-white/90 transition-colors md:w-40"
            >
              Calculate BMI
            </button>
          </div>

          {bmiValue && (
            <div className="text-center text-lg font-bold">
              Your BMI: <span className="text-yellow-400">{bmiValue}</span>
            </div>
          )}

          {bmiEntries.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={bmiEntries} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip contentStyle={{ backgroundColor: "#1e3a8a", border: "none", color: "white" }} />
                <Line type="monotone" dataKey="bmi" stroke="#FFD700" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-white/70 text-sm text-center">No BMI data yet. Add your first entry above.</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions - ONLY 3 */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Navigate to common tasks quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/member/packages")}
              className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <Package className="h-6 w-6 mb-2 text-primary" />
              <p className="text-sm font-medium">Book Packages</p>
            </button>

            <button
              onClick={() => navigate("/member/trainers")}
              className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <Users className="h-6 w-6 mb-2 text-primary" />
              <p className="text-sm font-medium">View Trainers</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
