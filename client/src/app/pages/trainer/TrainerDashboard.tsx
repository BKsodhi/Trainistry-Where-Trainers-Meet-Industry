import { useNavigate } from "react-router";
import { TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, MapPin, Calendar } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { apiClient } from "../../utils/apiClient";
import { useApp } from "../../context/AppContext";

const STATUS_CONFIG = {
  under_review: { label: "Under Review", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  interview_scheduled: { label: "Interview Scheduled", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  selected: { label: "Selected", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  rejected: { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

export function TrainerDashboard() {
  const navigate = useNavigate();
  const { user } = useApp();

  const [stats, setStats] = useState({
    name: user?.email?.split('@')[0] || "Trainer",
    title: "Trainer",
    location: "Remote",
    verified: false,
    activeProjects: 0,
    totalProjects: 0,
    totalEarned: 0,
    rating: 5.0,
    pendingPayments: 0,
    earningChart: [
      { month: "Jan", earnings: 0 },
      { month: "Feb", earnings: 0 },
      { month: "Mar", earnings: 0 },
      { month: "Apr", earnings: 0 },
      { month: "May", earnings: 0 },
      { month: "Jun", earnings: 0 },
      { month: "Jul", earnings: 0 },
      { month: "Aug", earnings: 0 },
      { month: "Sep", earnings: 0 },
      { month: "Oct", earnings: 0 },
      { month: "Nov", earnings: 0 },
      { month: "Dec", earnings: 0 }
    ]
  });

  const [myApplications, setMyApplications] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes, appsRes] = await Promise.all([
          apiClient('/profiles/trainer/me'),
          apiClient('/billing/trainer/stats'),
          apiClient('/workflow/applications')
        ]);

        let newStats = { ...stats };
        if (profileRes.success && profileRes.data) {
          newStats.title = profileRes.data.title || newStats.title;
          newStats.location = profileRes.data.location ? `${profileRes.data.location.city || ''}, ${profileRes.data.location.country || ''}`.replace(/^, | ,$|(^, $)/g, '') || newStats.location : newStats.location;
          newStats.verified = profileRes.data.identityVerified || newStats.verified;
          newStats.rating = profileRes.data.averageRating || newStats.rating;
        }

        if (statsRes.success && statsRes.data) {
          newStats.totalEarned = statsRes.data.totalEarned || 0;
          newStats.pendingPayments = statsRes.data.pendingPayments || 0;
          newStats.activeProjects = statsRes.data.activeProjects || 0;
          newStats.totalProjects = statsRes.data.totalProjects || 0;
          if (statsRes.data.earningChart) newStats.earningChart = statsRes.data.earningChart;
        }
        
        setStats(newStats);

        if (appsRes.success && appsRes.data) {
          setMyApplications(appsRes.data);
        }
      } catch (e) {
        console.error("Failed to load trainer dashboard", e);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 px-4 py-3 rounded border"
        style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.3)" }}>
        <AlertCircle size={14} style={{ color: "var(--accent)" }} className="flex-shrink-0" />
        <span className="text-sm" style={{ color: "var(--accent)" }}>
          <strong>Payment reminder:</strong> Check your pending invoices regularly.
        </span>
      </div>

      <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Projects", value: stats.activeProjects, trend: "+1 this month" },
          { label: "Total Earned", value: `₹${(stats.totalEarned / 1000).toFixed(0)}K`, trend: "+15% YoY" },
          { label: "Pending Payments", value: `₹${(stats.pendingPayments / 1000).toFixed(0)}K`, trend: "2 invoices due" },
          { label: "Profile Views", value: "0", trend: "0 this week" },
        ].map((kpi) => (
          <div key={kpi.label} className="p-4 rounded border border-border" style={{ background: "var(--card)" }}>
            <div className="text-xs text-muted-foreground">{kpi.label}</div>
            <div className="text-xl font-bold text-foreground mt-1">{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{kpi.trend}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 p-4 rounded border border-border" style={{ background: "var(--card)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium text-foreground text-sm">Monthly Earnings</h3>
              <p className="text-xs text-muted-foreground">2026 — Direct to trainer, zero deductions</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.earningChart} margin={{ left: -20, right: 10 }}>
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip
                contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, fontSize: 12 }}
                labelStyle={{ color: "#9ca3af" }}
                formatter={(v: number) => [`₹${v.toLocaleString()}`, "Earned"]}
              />
              <Area type="monotone" dataKey="earnings" stroke="#3b82f6" fill="url(#earnGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded border border-border overflow-hidden" style={{ background: "var(--card)" }}>
          <div className="p-4 border-b border-border text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-3"
              style={{ background: "var(--primary)" }}>
              {stats.name[0]}
            </div>
            <div className="flex items-center justify-center gap-1">
              <h2 className="text-foreground font-semibold text-lg capitalize">{stats.name}</h2>
              {stats.verified && <ShieldCheck size={14} className="text-primary" />}
            </div>
            <p className="text-muted-foreground text-sm">{stats.title}</p>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-2">
              <MapPin size={12} /> {stats.location}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px bg-border">
            <div className="bg-[var(--card)] p-4 text-center">
              <div className="text-xl font-bold text-foreground mono mb-1">{stats.totalProjects}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Projects</div>
            </div>
            <div className="bg-[var(--card)] p-4 text-center">
              <div className="text-xl font-bold text-foreground mono mb-1">{stats.rating}/5</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg Rating</div>
            </div>
          </div>
          <button
            onClick={() => navigate("/trainer/profile")}
            className="w-full py-3 text-xs text-primary font-medium hover:bg-secondary transition-colors"
          >
            Edit Public Profile
          </button>
        </div>
      </div>

      <div className="rounded border border-border overflow-hidden" style={{ background: "var(--card)" }}>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-medium text-foreground text-sm">Recent Applications</h3>
          <button onClick={() => navigate("/trainer/applications")}
            className="text-xs text-primary flex items-center gap-1 hover:underline">
            View all <ArrowRight size={10} />
          </button>
        </div>
        <div className="divide-y divide-border">
          {myApplications.slice(0, 3).map((app) => {
            const sc = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.under_review;
            return (
              <div key={app._id || app.id || Math.random().toString()} className="px-4 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                <div className="min-w-0">
                  <div className="font-medium text-foreground text-sm truncate">{app.requirementId?.title || 'Unknown Project'}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{app.requirementId?.companyId?.email?.split('@')[0] || 'Unknown Company'}</div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium mono"
                    style={{ background: sc.bg, color: sc.color }}>
                    {sc.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
