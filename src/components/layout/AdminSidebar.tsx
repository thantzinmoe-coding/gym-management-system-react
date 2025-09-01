import { useState } from "react";
import { 
  Users, 
  UserCheck, 
  Dumbbell, 
  Bell, 
  Package, 
  DollarSign,
  LogOut,
  Home // ✅ Added for dashboard
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

// ✅ Added "Dashboard" at the top
const adminMenuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: Home },
  { title: "Manage Attendance", url: "/admin/attendance", icon: UserCheck },
  { title: "Manage Trainers", url: "/admin/trainers", icon: Users },
  { title: "Manage Members", url: "/admin/members", icon: Users },
  { title: "Manage Packages", url: "/admin/packages", icon: Package },
  { title: "Manage Equipment", url: "/admin/equipment", icon: Dumbbell },
  { title: "View Notifications", url: "/admin/notifications", icon: Bell },
  { title: "Send Notifications", url: "/admin/send-notification", icon: Bell },
  { title: "Pay Salary", url: "/admin/salary", icon: DollarSign },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent";

  const handleLogout = () => {
    authService.logout();
    navigate('/'); // Redirect to login page after logout
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <div className="p-4 border-b border-border">
        {!collapsed && (
          <h2 className="text-lg font-bold text-white ">Admin Panel</h2>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                  {!collapsed && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
