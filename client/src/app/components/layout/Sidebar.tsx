import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard, Briefcase, FileText, CreditCard, User,
  Rss, GitBranch, BarChart3, Users, AlertTriangle,
  ShieldCheck, LogOut, ChevronRight, Zap
} from "lucide-react";
import { useApp, Role } from "../../context/AppContext";
import { cn } from "../ui/utils";

const NAV_ITEMS: Record<NonNullable<Role>, { icon: React.ElementType; label: string; path: string }[]> = {
  trainer: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/trainer/dashboard" },
    { icon: Briefcase, label: "Browse Projects", path: "/trainer/projects" },
    { icon: FileText, label: "My Applications", path: "/trainer/applications" },
    { icon: CreditCard, label: "Payments", path: "/trainer/payments" },
    { icon: Rss, label: "Feed", path: "/feed" },
    { icon: User, label: "Profile", path: "/trainer/profile" },
  ],
  company: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/company/dashboard" },
    { icon: GitBranch, label: "Hiring Pipeline", path: "/company/pipeline" },
    { icon: Briefcase, label: "My Projects", path: "/company/projects" },
    { icon: CreditCard, label: "Payments", path: "/company/payments" },
    { icon: Rss, label: "Feed", path: "/feed" },
  ],
  admin: [
    { icon: BarChart3, label: "Analytics", path: "/admin/dashboard" },
    { icon: Users, label: "User Management", path: "/admin/users" },
    { icon: AlertTriangle, label: "Disputes", path: "/admin/disputes" },
    { icon: ShieldCheck, label: "Verifications", path: "/admin/verifications" },
    { icon: Rss, label: "Feed Moderation", path: "/admin/feed" },
  ],
};

const ROLE_LABELS: Record<NonNullable<Role>, string> = {
  trainer: "Trainer",
  company: "Company",
  admin: "Admin",
};

const ROLE_COLORS: Record<NonNullable<Role>, string> = {
  trainer: "#3b82f6",
  company: "#10b981",
  admin: "#f59e0b",
};

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { role, setRole, setAuthenticated } = useApp();
  const navigate = useNavigate();

  if (!role) return null;
  const items = NAV_ITEMS[role];

  const handleLogout = () => {
    setRole(null);
    setAuthenticated(false);
    navigate("/");
    if (onNavigate) onNavigate();
  };

  return (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-sidebar-border flex items-center gap-2.5">
        <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: "var(--primary)" }}>
          <Zap size={14} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-foreground font-semibold tracking-tight text-sm">Trainistry</span>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: ROLE_COLORS[role] }} />
            <span className="text-[10px] mono" style={{ color: ROLE_COLORS[role] }}>{ROLE_LABELS[role]}</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-0.5">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => onNavigate && onNavigate()}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 px-3 py-2 rounded text-[13px] transition-all group",
                isActive
                  ? "text-foreground font-medium"
                  : "text-sidebar-foreground hover:text-foreground"
              )
            }
            style={({ isActive }) =>
              isActive ? { background: "var(--sidebar-accent)" } : {}
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={14} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-primary" : ""} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={10} className="text-muted-foreground" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-4 border-t border-sidebar-border pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded text-[13px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );
}

export function Sidebar() {
  const { role } = useApp();
  if (!role) return null;
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-screen w-56 flex-col border-r border-border z-50"
      style={{ background: "var(--sidebar)" }}>
      <SidebarContent />
    </aside>
  );
}
