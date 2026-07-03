import { Outlet, useLocation } from "react-router";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useApp } from "../../context/AppContext";

const PAGE_META: Record<string, { title: string; subtitle?: string | ((user: any) => string) }> = {
  "/trainer/dashboard": { title: "Dashboard", subtitle: (user) => `Welcome back, ${user?.email?.split('@')[0] || "Trainer"}` },
  "/trainer/projects": { title: "Browse Projects", subtitle: "Find your next training engagement" },
  "/trainer/applications": { title: "My Applications", subtitle: "Track all your submitted proposals" },
  "/trainer/payments": { title: "Payment Tracker", subtitle: "Milestone payments & pending releases" },
  "/trainer/profile": { title: "Profile & Portfolio", subtitle: "Your professional presence on Trainistry" },
  "/company/dashboard": { title: "Dashboard", subtitle: (user) => `${user?.email?.split('@')[0] || "Company"} hiring overview` },
  "/company/pipeline": { title: "Hiring Pipeline", subtitle: "Track trainers from application to payment" },
  "/company/projects": { title: "My Projects", subtitle: "Manage all posted training requirements" },
  "/company/payments": { title: "Payment Management", subtitle: "Trainer payments & milestone releases" },
  "/admin/dashboard": { title: "Platform Analytics", subtitle: "Trainistry ecosystem health" },
  "/admin/users": { title: "User Management", subtitle: "Trainers, companies, and verification" },
  "/admin/disputes": { title: "Dispute Resolution", subtitle: "Active cases requiring admin action" },
  "/admin/verifications": { title: "Verifications Queue", subtitle: "Pending badge approvals" },
  "/admin/feed": { title: "Feed Moderation", subtitle: "Review warning posts & community content" },
  "/feed": { title: "Professional Feed", subtitle: "Achievements, milestones & platform alerts" },
};

export function AppLayout() {
  const location = useLocation();
  const { user } = useApp();
  
  const metaObj = PAGE_META[location.pathname] ?? { title: "Trainistry" };
  const subtitle = typeof metaObj.subtitle === 'function' ? metaObj.subtitle(user) : metaObj.subtitle;
  const meta = { title: metaObj.title, subtitle };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 md:ml-56 flex flex-col min-w-0">
        <Header title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
