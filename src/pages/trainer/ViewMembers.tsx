"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, User, Activity, Star, CreditCard, Phone, Calendar, Users } from "lucide-react";
import { manageUserService, BackendUser } from "@/services/manageUserService";

interface MemberHealth {
  id: number;
  name: string;
  email: string;
  profilePic?: string;
  nrc?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  healthInfo?: {
    weight?: number;
    height?: number;
  };
  goals?: string[];
  lastVisit?: string;
}

const calculateBMI = (weight: number = 0, height: number = 0) => {
  if (!weight || !height) return 0;
  const heightInMeters = height / 100;
  return +(weight / (heightInMeters * heightInMeters)).toFixed(1);
};

const getBMIStatus = (bmi: number) => {
  if (bmi < 18.5) return { label: "Underweight", variant: "secondary" as const };
  if (bmi < 25) return { label: "Normal", variant: "default" as const };
  if (bmi < 30) return { label: "Overweight", variant: "destructive" as const };
  return { label: "Obese", variant: "destructive" as const };
};

export default function ViewMembers() {
  const [members, setMembers] = useState<MemberHealth[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Fetch active members only
        const response = await manageUserService.getAllUsers(0, 50, undefined, "MEMBER", "ACTIVE");
        const data: BackendUser[] = response.data;

        // Map backend data to MemberHealth type
        const mappedMembers: MemberHealth[] = data.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          profilePic: user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`,
          nrc: user.nrc || "",
          phone: user.phone || "",
          dob: user.dob || "",
          gender: user.gender || "",
          healthInfo: {
            weight: 0,
            height: 0,
          },
          goals: [],
          lastVisit: "",
        }));

        setMembers(mappedMembers);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Members</h1>
        <p className="text-muted-foreground">View health information of your assigned members</p>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Members List */}
      {loading ? (
        <p className="text-muted-foreground">Loading members...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMembers.map((member) => {
            const bmi = calculateBMI(member.healthInfo?.weight, member.healthInfo?.height);
            const bmiStatus = getBMIStatus(bmi);

            return (
              <Card key={member.id}>
                <CardHeader>
                  <div className="flex justify-between items-start space-x-4">
                    <img
                      src={member.profilePic}
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <CardTitle>{member.name}</CardTitle>
                      <CardDescription>{member.email}</CardDescription>
                    </div>
                    <Badge variant={bmiStatus.variant}>
                      BMI: {bmi} ({bmiStatus.label})
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    {/* NRC */}
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-purple-500" />
                      <p className="text-sm font-medium">NRC: {member.nrc}</p>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <p className="text-sm font-medium">Phone: {member.phone}</p>
                    </div>

                    {/* Date of Birth */}
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <p className="text-sm font-medium">Date of Birth: {member.dob}</p>
                    </div>

                    {/* Gender */}
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-red-500" />
                      <p className="text-sm font-medium">Gender: {member.gender}</p>
                    </div>

                    {/* Height */}
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-green-500" />
                      <p className="text-sm font-medium">
                        Height: {member.healthInfo?.height || 0} cm
                      </p>
                    </div>

                    {/* Weight */}
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <p className="text-sm font-medium">
                        Weight: {member.healthInfo?.weight || 0} kg
                      </p>
                    </div>

                    {/* Fitness Goals */}
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-red-500" />
                      <p className="text-sm font-medium mb-1">Fitness Goals:</p>
                    </div>
                    <div className="flex flex-wrap gap-1 ml-6">
                      {member.goals?.map((goal, index) => (
                        <Badge key={index} variant="outline">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Last visit */}
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Last visit: {member.lastVisit || "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
