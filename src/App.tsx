import { lazy, Suspense } from "react";
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
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
import Login from "./pages/Login";
const Register = lazy(() => import("./pages/Register"));
const VerifyOTP = lazy(() => import("./pages/VerifyOTP"));
const MemberProfileSetup = lazy(() => import("./pages/MemberProfileSetup"));
const TrainerProfileSetup = lazy(() => import("./pages/TrainerProfileSetup"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Services = lazy(() => import("./pages/Services"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Home = lazy(() => import("./pages/Index"));
const Packages = lazy(() => import("./pages/member/BookPackages"));

// Dashboard pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const TrainerDashboard = lazy(() => import("./pages/trainer/Dashboard"));
const MemberDashboard = lazy(() => import("./pages/member/Dashboard"));

// Admin pages
const ManageMembers = lazy(() => import("./pages/admin/ManageMembers"));
const ManageAttendance = lazy(() => import("./pages/admin/ManageAttendance"));
const ManageTrainers = lazy(() => import("./pages/admin/ManageTrainers"));
const AdminManageEquipments = lazy(() => import("./pages/admin/ManageEquipments"));
const ViewNotifications = lazy(() => import("./pages/admin/ViewNotifications"));
const SendNotifications = lazy(() => import("./pages/admin/SendNotifications"));
const ManagePackages = lazy(() => import("./pages/admin/ManagePackages"));
const PaySalary = lazy(() => import("./pages/admin/PaySalary"));
const ChurnRisk = lazy(() => import("./pages/admin/ChurnRisk"));

// Trainer pages
const ViewMembers = lazy(() => import("./pages/trainer/ViewMembers"));
const MembersAtRisk = lazy(() => import("./pages/trainer/MembersAtRisk"));
const ManageSchedule = lazy(() => import("./pages/trainer/ManageSchedule"));
const TrainerViewEquipments = lazy(() => import("./pages/trainer/ViewEquipments"));
const ViewPackages = lazy(() => import("./pages/trainer/ViewPackages"));
const ChatWithMembers = lazy(() => import("./pages/trainer/ChatWithMembers"));
const TrainerViewAttendance = lazy(() => import("./pages/trainer/ViewAttendance"));
const TrainerViewNotifications = lazy(() => import("./pages/trainer/ViewNotifications"));
const TrainerUpdateProfile = lazy(() => import("./pages/trainer/UpdateProfile"));

// Member pages
const BookPackages = lazy(() => import("./pages/member/BookPackages"));
const ManageProfile = lazy(() => import("./pages/member/ManageProfile"));
const MemberViewAttendance = lazy(() => import("./pages/member/ViewAttendance"));
const MemberViewEquipments = lazy(() => import("./pages/member/ViewEquipments"));
const ChatWithTrainers = lazy(() => import("./pages/member/ChatWithTrainers"));
const GiveFeedback = lazy(() => import("./pages/member/GiveFeedback"));
const ViewTrainers = lazy(() => import("./pages/member/ViewTrainers"));
const MemberViewNotifications = lazy(() => import("./pages/member/ViewNotifications"));

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
    // Pages are split into separate chunks and loaded on first visit.
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>}>
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Index />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
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
      <Route
        path="/admin/churn-risk"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ChurnRisk />
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
        path="/trainer/members-at-risk"
        element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <MembersAtRisk />
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
    </Suspense>
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
