"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Dumbbell, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Import services
import { manageUserService } from "@/services/manageUserService";
import { trainerService } from "@/services/trainerService";
import { equipmentService } from "@/services/equipmentService";
import { gymPackageService } from "@/services/gymPackageService";
// import { gymPackageService } from "@/services/gymPackageService"; // if you want real count

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    members: 0,
    trainers: 0,
    equipment: 0,
    packages: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Members
        const usersResponse = await manageUserService.getAllUsers(0, 10, undefined, "MEMBER", "active");
        const membersCount = usersResponse.meta?.totalElements || usersResponse.meta?.totalItems || 0;

        // Trainers
        const trainersResponse = await trainerService.getAllActiveTrainers(0, 1);
        const trainersCount = trainersResponse.meta?.totalItems || trainersResponse.data?.length || 0;

        // Equipment
        const equipmentCount = await equipmentService.getEquipmentCount();

        const totalPackagesResponse = await gymPackageService.getAllGymPackages(0, 1);
        const packagesCount = totalPackagesResponse.meta?.totalItems || totalPackagesResponse.data?.length || 0;

        // Packages (replace with serv

        setStats({
          members: membersCount,
          trainers: trainersCount,
          equipment: equipmentCount,
          packages: packagesCount,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Members", value: stats.members, icon: Users, color: "text-blue-600" },
    { title: "Active Trainers", value: stats.trainers, icon: UserCheck, color: "text-green-600" },
    { title: "Equipment Items", value: stats.equipment, icon: Dumbbell, color: "text-purple-600" },
    { title: "Package Plans", value: stats.packages, icon: Package, color: "text-orange-600" },
  ];

  const chartData = [
    {
      name: "Gym Stats",
      Members: stats.members,
      Trainers: stats.trainers,
      Equipment: stats.equipment,
      Packages: stats.packages,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ✅ Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your gym operations from here</p>
      </div>

      {/* ✅ Stats Cards (4 aligned cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ Chart aligned below stats */}
      <Card>
        <CardHeader>
          <CardTitle>Gym Overview</CardTitle>
          <CardDescription>Members, Trainers, Equipment, and Packages</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Members" fill="#3b82f6" />
              <Bar dataKey="Trainers" fill="#22c55e" />
              <Bar dataKey="Equipment" fill="#a855f7" />
              <Bar dataKey="Packages" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
