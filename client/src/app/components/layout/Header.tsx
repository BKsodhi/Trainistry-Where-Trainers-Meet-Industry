import { Bell, Search, ShieldCheck, Check, Menu, Sun, Moon } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useState, useEffect, useRef } from "react";
import { apiClient } from "../../utils/apiClient";
import { useNavigate } from "react-router";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "../ui/sheet";
import { SidebarContent } from "./Sidebar";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useApp();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [isLightMode]);

  const toggleTheme = () => {
    const nextTheme = !isLightMode;
    setIsLightMode(nextTheme);
    localStorage.setItem('theme', nextTheme ? 'light' : 'dark');
  };

  const fallbackName = user?.email?.split('@')[0] || "User";
  const avatar = user ? user.email.substring(0, 2).toUpperCase() : "U";

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await apiClient('/workflow/notifications');
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Auto refresh every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, actionLink: string | null) => {
    try {
      await apiClient(`/workflow/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setShowDropdown(false);
      if (actionLink) {
        navigate(actionLink);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6"
      style={{ background: "var(--background)" }}>
      <div className="flex items-center gap-3">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden w-8 h-8 flex items-center justify-center rounded hover:bg-secondary transition-colors">
              <Menu size={16} className="text-foreground" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64" style={{ background: "var(--sidebar)" }}>
            <div className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>Main navigation for the application</SheetDescription>
            </div>
            <div className="h-full flex flex-col">
              <SidebarContent onNavigate={() => setIsMobileMenuOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <div>
          <h1 className="text-foreground font-semibold tracking-tight leading-none truncate max-w-[150px] sm:max-w-xs">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-0.5 leading-none truncate max-w-[150px] sm:max-w-xs" style={{ fontSize: 12 }}>{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:flex items-center">
          <Search size={13} className="absolute left-2.5 text-muted-foreground" />
          <input
            placeholder="Search…"
            className="bg-secondary text-foreground border border-border rounded pl-8 pr-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-44"
          />
        </div>

        <button 
          onClick={toggleTheme}
          className="w-7 h-7 flex items-center justify-center rounded bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
          title="Toggle Theme"
        >
          {isLightMode ? <Moon size={13} /> : <Sun size={13} />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative w-8 h-8 flex items-center justify-center rounded hover:bg-secondary transition-colors"
          >
            <Bell size={15} className="text-muted-foreground" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-destructive" />}
          </button>

          {showDropdown && (
            <div className="absolute top-10 right-0 w-80 rounded-md border border-border shadow-lg overflow-hidden z-50" style={{ background: "var(--card)" }}>
              <div className="px-4 py-2 border-b border-border flex justify-between items-center bg-secondary/20">
                <span className="text-xs font-semibold text-foreground">Notifications</span>
                {unreadCount > 0 && <span className="text-[10px] text-muted-foreground">{unreadCount} unread</span>}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n._id} 
                      onClick={() => handleMarkAsRead(n._id, n.actionLink)}
                      className={`p-3 text-left hover:bg-secondary/40 transition-colors cursor-pointer flex gap-3 ${!n.read ? 'bg-secondary/10' : ''}`}
                    >
                      <div className="mt-0.5">
                        <div className={`w-2 h-2 rounded-full ${!n.read ? 'bg-primary' : 'bg-transparent'}`} />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-foreground mb-1">{n.title}</div>
                        <div className="text-[11px] text-muted-foreground leading-snug mb-1">{n.message}</div>
                        <div className="text-[10px] text-muted-foreground/70">{new Date(n.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-semibold text-white"
            style={{ background: "var(--primary)" }}>
            {avatar}
          </div>
          <div className="hidden md:flex items-center gap-1">
            <span className="text-foreground text-xs font-medium capitalize">{fallbackName}</span>
            <ShieldCheck size={11} className="text-primary" />
          </div>
        </div>
      </div>
    </header>
  );
}
