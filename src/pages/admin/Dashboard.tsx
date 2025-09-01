"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Dumbbell, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function AdminDashboard() {
  // ✅ Dynamic state
  const [stats, setStats] = useState({
    members: 0,
    trainers: 0,
    equipment: 0,
    packages: 0,
  });

  // ✅ Simulated fetch (replace with your API later)
  useEffect(() => {
    const fetchStats = async () => {
      // Example: fetch from backend
      // const res = await fetch("/api/admin/stats");
      // const data = await res.json();
      const data = {
        members: 245,
        trainers: 12,
        equipment: 68,
        packages: 8,
      };
      setStats(data);
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Members", value: stats.members, icon: Users, color: "text-blue-600" },
    { title: "Active Trainers", value: stats.trainers, icon: UserCheck, color: "text-green-600" },
    { title: "Equipment Items", value: stats.equipment, icon: Dumbbell, color: "text-purple-600" },
    { title: "Package Plans", value: stats.packages, icon: Package, color: "text-orange-600" },
  ];

  // ✅ Bar chart data
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

      {/* ✅ Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ Chart + Quick Actions Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Gym Overview</CardTitle>
            <CardDescription>Members, Trainers, Equipment, and Packages</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                <Users className="h-6 w-6 mb-2 text-primary" />
                <p className="text-sm font-medium">Add Member</p>
              </button>
              <button className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                <UserCheck className="h-6 w-6 mb-2 text-primary" />
                <p className="text-sm font-medium">Add Trainer</p>
              </button>
              <button className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                <Dumbbell className="h-6 w-6 mb-2 text-primary" />
                <p className="text-sm font-medium">Add Equipment</p>
              </button>
              <button className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                <Package className="h-6 w-6 mb-2 text-primary" />
                <p className="text-sm font-medium">Create Package</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
