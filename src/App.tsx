import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { TrainerProvider } from "@/context/TrainerContext";
import { PackageProvider } from "@/context/PackageContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EquipmentProvider } from "@/context/EquipmentContext";
import { authService } from "@/services/authService";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import MemberProfileSetup from "./pages/MemberProfileSetup";
import TrainerProfileSetup from "./pages/TrainerProfileSetup";
import AboutUs from "./pages/AboutUs";
import Services from "./pages/Services";
import ContactUs from "./pages/ContactUs";
import Reviews from "./pages/Reviews";
import Home from "./pages/Index";
import Packages from "./pages/member/BookPackages";

// Dashboard pages
import AdminDashboard from "./pages/admin/Dashboard";
import TrainerDashboard from "./pages/trainer/Dashboard";
import MemberDashboard from "./pages/member/Dashboard";

// Admin pages
import ManageMembers from "./pages/admin/ManageMembers";
import ManageAttendance from "./pages/admin/ManageAttendance";
import ManageTrainers from "./pages/admin/ManageTrainers";
import AdminManageEquipments from "./pages/admin/ManageEquipments";
import ViewNotifications from "./pages/admin/ViewNotifications";
import SendNotifications from "./pages/admin/SendNotifications";
import ManagePackages from "./pages/admin/ManagePackages";
import PaySalary from "./pages/admin/PaySalary";

// Trainer pages
import ViewMembers from "./pages/trainer/ViewMembers";
import ManageSchedule from "./pages/trainer/ManageSchedule";
import TrainerViewEquipments from "./pages/trainer/ViewEquipments";
import ViewPackages from "./pages/trainer/ViewPackages";
import ChatWithMembers from "./pages/trainer/ChatWithMembers";
import TrainerViewAttendance from "./pages/trainer/ViewAttendance";
import TrainerViewNotifications from "./pages/trainer/ViewNotifications";
import TrainerUpdateProfile from "./pages/trainer/UpdateProfile";

// Member pages
import BookPackages from "./pages/member/BookPackages";
import ManageProfile from "./pages/member/ManageProfile";
import MemberViewAttendance from "./pages/member/ViewAttendance";
import MemberViewEquipments from "./pages/member/ViewEquipments";
import ChatWithTrainers from "./pages/member/ChatWithTrainers";
import GiveFeedback from "./pages/member/GiveFeedback";
import ViewTrainers from "./pages/member/ViewTrainers";
import MemberViewNotifications from "./pages/member/ViewNotifications";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// ✅ Protected Route
const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const user = authService.getCurrentUser();

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role))
    return <Navigate to={`/${user.role}/dashboard`} replace />;

  return <DashboardLayout>{children}</DashboardLayout>;
};

// ✅ All App Routes
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <NotificationProvider>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Index />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/setup/member-profile" element={<MemberProfileSetup />} />
        <Route path="/setup/trainer-profile" element={<TrainerProfileSetup />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/Services" element={<Services />} />
        <Route path="/ContactUs" element={<ContactUs />} />
        <Route path="/Reviews" element={<Reviews />} />
        <Route path="/Index" element={<Home />} />
        <Route path="/member/book-packages" element={<Packages />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/members"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/trainers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageTrainers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/equipment"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminManageEquipments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ViewNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/send-notification"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SendNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/packages"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManagePackages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/salary"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PaySalary />
            </ProtectedRoute>
          }
        />

        {/* Trainer Routes */}
        <Route
          path="/trainer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["trainer"]}>
              <TrainerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/update-profile"
          element={
            <ProtectedRoute allowedRoles={["trainer"]}>
              <TrainerUpdateProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/schedule"
          element={
            <ProtectedRoute allowedRoles={["trainer"]}>
              <ManageSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/members"
          element={
            <ProtectedRoute allowedRoles={["trainer"]}>
              <ViewMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/equipment"
          element={
            <ProtectedRoute allowedRoles={["trainer"]}>
              <TrainerViewEquipments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/packages"
          element={
            <ProtectedRoute allowedRoles={["trainer"]}>
              <ViewPackages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/chat"
          element={
            <ProtectedRoute allowedRoles={["trainer"]}>
              <ChatWithMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/attendance"
          element={
            <ProtectedRoute allowedRoles={["trainer"]}>
              <TrainerViewAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/notifications"
          element={
            <ProtectedRoute allowedRoles={["trainer"]}>
              <TrainerViewNotifications />
            </ProtectedRoute>
          }
        />

        {/* Member Routes */}
        <Route
          path="/member/dashboard"
          element={
            <ProtectedRoute allowedRoles={["member"]}>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/packages"
          element={
            <ProtectedRoute allowedRoles={["member"]}>
              <BookPackages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/profile"
          element={
            <ProtectedRoute allowedRoles={["member"]}>
              <ManageProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/attendance"
          element={
            <ProtectedRoute allowedRoles={["member"]}>
              <MemberViewAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/trainers"
          element={
            <ProtectedRoute allowedRoles={["member"]}>
              <ViewTrainers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/equipment"
          element={
            <ProtectedRoute allowedRoles={["member"]}>
              <MemberViewEquipments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/chat"
          element={
            <ProtectedRoute allowedRoles={["member"]}>
              <ChatWithTrainers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/feedback"
          element={
            <ProtectedRoute allowedRoles={["member"]}>
              <GiveFeedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/notifications"
          element={
            <ProtectedRoute allowedRoles={["member"]}>
              <MemberViewNotifications />
            </ProtectedRoute>
          }
        />

        {/* Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </NotificationProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TrainerProvider>
          <PackageProvider>
            <TooltipProvider>
               <EquipmentProvider> {/* EquipmentProvider Here */}
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </EquipmentProvider>{/* EquipmentProvider Here */}
            </TooltipProvider>
          </PackageProvider>
        </TrainerProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
