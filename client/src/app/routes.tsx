import { createBrowserRouter, Navigate } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { TrainerDashboard } from "./pages/trainer/TrainerDashboard";
import { ProjectBrowser } from "./pages/trainer/ProjectBrowser";
import { Applications } from "./pages/trainer/Applications";
import { PaymentTracker } from "./pages/trainer/PaymentTracker";
import { TrainerProfile } from "./pages/trainer/TrainerProfile";
import { CompanyDashboard } from "./pages/company/CompanyDashboard";
import { HiringPipeline } from "./pages/company/HiringPipeline";
import { CompanyPayments } from "./pages/company/CompanyPayments";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { UserManagement } from "./pages/admin/UserManagement";
import { Disputes } from "./pages/admin/Disputes";
import { Feed } from "./pages/Feed";
import CompanyProjects from "./pages/company/CompanyProjects";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="text-4xl font-bold text-muted-foreground mono mb-2">404</div>
      <p className="text-muted-foreground text-sm">Page not found</p>
    </div>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      // Trainer routes
      { path: "trainer/dashboard", element: <TrainerDashboard /> },
      { path: "trainer/projects", element: <ProjectBrowser /> },
      { path: "trainer/applications", element: <Applications /> },
      { path: "trainer/payments", element: <PaymentTracker /> },
      { path: "trainer/profile", element: <TrainerProfile /> },
      // Company routes
      { path: "company/dashboard", element: <CompanyDashboard /> },
      { path: "company/pipeline", element: <HiringPipeline /> },
      { path: "company/projects", element: <CompanyProjects /> },
      { path: "company/payments", element: <CompanyPayments /> },
      // Admin routes
      { path: "admin/dashboard", element: <AdminDashboard /> },
      { path: "admin/users", element: <UserManagement /> },
      { path: "admin/disputes", element: <Disputes /> },
      { path: "admin/verifications", element: <Navigate to="/admin/dashboard" replace /> },
      { path: "admin/feed", element: <Feed /> },
      // Shared
      { path: "feed", element: <Feed /> },
      // 404
      { path: "*", element: <NotFound /> },
    ],
  },
]);
