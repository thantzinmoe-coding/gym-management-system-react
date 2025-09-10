import { 
  Package, 
  User, 
  UserCheck, 
  Users, 
  Dumbbell, 
  MessageCircle,
  Star,
  Bell,
  LogOut,
  Home
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

// Added dashboard as the first menu item
const memberMenuItems = [
  { title: "Dashboard", url: "/member/dashboard", icon: Home },
  { title: "Book/Cancel Packages", url: "/member/packages", icon: Package },
  { title: "Manage Profile", url: "/member/profile", icon: User },
  { title: "View Trainers", url: "/member/trainers", icon: Users },
  { title: "View Equipment", url: "/member/equipment", icon: Dumbbell },
  { title: "Chat with Trainers", url: "/member/chat", icon: MessageCircle },
  { title: "Give Feedback", url: "/member/feedback", icon: Star },
  { title: "View Notifications", url: "/member/notifications", icon: Bell },
];

export function MemberSidebar() {
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
          <h2 className="text-lg font-bold  text-white">Member Portal</h2>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Services</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {memberMenuItems.map((item) => (
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
