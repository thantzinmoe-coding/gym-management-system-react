import {
  Users,
  Dumbbell,
  BarChart3,
  Package,
  MessageCircle,
  UserCheck,
  Bell,
  LogOut,
  User,
  Home // ✅ Added Home icon for dashboard
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
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
const trainerMenuItems = [
  { title: "Dashboard", url: "/trainer/dashboard", icon: Home },
  { title: "Update Profile", url: "/trainer/update-profile", icon: User },
  { title: "View Attendance", url: "/trainer/attendance", icon: UserCheck },
  { title: "View Members", url: "/trainer/members", icon: Users },
  { title: "View Equipment", url: "/trainer/equipment", icon: Dumbbell },
  { title: "View Packages", url: "/trainer/packages", icon: Package },
  { title: "Message", url: "/trainer/chat", icon: MessageCircle },
  { title: "View Notifications", url: "/trainer/notifications", icon: Bell },
];

export function TrainerSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent";

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/'; // Redirect to login page and force reset state
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <div className="p-4 border-b border-border">
        {!collapsed && (
          <h2 className="text-lg font-bold text-white">Trainer Dashboard</h2>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Training</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {trainerMenuItems.map((item) => (
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
