import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserCheck, Package } from "lucide-react";

export default function TrainerDashboard() {
  const navigate = useNavigate();

  // Stats for trainer
  const stats = [
    { title: "Total Members", value: "120", icon: Users, color: "bg-green-500" },
    { title: "Attendance Today", value: "35", icon: UserCheck, color: "bg-blue-500" },
    { title: "Assigned Packages", value: "15", icon: Package, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Trainer Dashboard</h1>
        <p className="text-gray-300">Track your members and packages efficiently</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className={`hover:shadow-xl transition-shadow bg-blue-900 text-white`}>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`h-6 w-6 rounded-full ${stat.color} flex items-center justify-center`}>
                <stat.icon className="text-white h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Navigate to common tasks quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/trainer/members")}
              className="p-4 border border-border rounded-lg hover:bg-accent transition-colors flex flex-col items-center"
            >
              <Users className="h-6 w-6 mb-2 text-primary" />
              <p className="text-sm font-medium">View Members</p>
            </button>
            <button
              onClick={() => navigate("/trainer/attendance")}
              className="p-4 border border-border rounded-lg hover:bg-accent transition-colors flex flex-col items-center"
            >
              <UserCheck className="h-6 w-6 mb-2 text-primary" />
              <p className="text-sm font-medium">View Attendance</p>
            </button>
            <button
              onClick={() => navigate("/trainer/packages")}
              className="p-4 border border-border rounded-lg hover:bg-accent transition-colors flex flex-col items-center"
            >
              <Package className="h-6 w-6 mb-2 text-primary" />
              <p className="text-sm font-medium">View Packages</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
