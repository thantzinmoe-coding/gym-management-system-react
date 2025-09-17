import { useNotifications } from '@/context/NotificationContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { TrainerSidebar } from './TrainerSidebar';
import { MemberSidebar } from './MemberSidebar';
import { Bell } from 'lucide-react';
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Function to get admin notification count
function getAdminNotificationCount(notifications: any[]) {
  return 0;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = authService.getCurrentUser();
  const { notifications } = useNotifications();
  const navigate = useNavigate();

  // Unread notifications for the current user's role
  let notificationCount = 0;

  if (user?.role === 'admin') {
    notificationCount = getAdminNotificationCount(notifications);
  } else {
    const unreadNotifications = notifications.filter(
      n => !n.isRead
    );
    notificationCount = unreadNotifications.length;
  }

  const getSidebar = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminSidebar />;
      case 'trainer':
        return <TrainerSidebar />;
      case 'member':
        return <MemberSidebar />;
      default:
        return null;
    }
  };

  const handleNotificationClick = () => {
    if (!user) return;
    if (user.role === 'admin') navigate('/admin/notifications');
    if (user.role === 'trainer') navigate('/trainer/notifications');
    if (user.role === 'member') navigate('/member/notifications');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {getSidebar()}

        <main className="flex-1">
          <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
            <SidebarTrigger />

            <div className="flex items-center space-x-4">
              {(user?.role === 'trainer' || user?.role === 'member') && (
                <div className="relative">
                  <Bell
                    className="h-6 w-6 text-gray-700 cursor-pointer"
                    onClick={handleNotificationClick}
                  />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {notificationCount}
                    </span>
                  )}
                </div>
              )}

              <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
