import { AlertTriangle, TrendingUp, CheckCircle2, ShieldAlert, Users, Briefcase, ShieldCheck, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useState, useEffect } from "react";
import { apiClient } from "../../utils/apiClient";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTrainers: 0,
    totalCompanies: 0,
    activeProjects: 0,
    totalTransactions: 0,
    disputesOpen: 0,
    pendingVerifications: 0,
    platformVolume: [],
    categoryBreakdown: [],
    recentDisputes: [],
    pendingVerifs: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient("/admin/stats");
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      }
    };
    fetchStats();
  }, []);

  const handleVerify = async (userId: string) => {
    setStats(prev => ({
      ...prev,
      pendingVerifs: prev.pendingVerifs.filter((v: any) => v.id !== userId),
      pendingVerifications: prev.pendingVerifications - 1
    }));
    try {
      await apiClient(`/admin/users/${userId}/verify`, { method: "POST" });
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (userId: string) => {
    setStats(prev => ({
      ...prev,
      pendingVerifs: prev.pendingVerifs.filter((v: any) => v.id !== userId),
      pendingVerifications: prev.pendingVerifications - 1
    }));
    try {
      await apiClient(`/admin/users/${userId}/status`, { method: "POST", bodyData: { status: "SUSPENDED" } });
    } catch (e) {
      console.error(e);
    }
  };

  const s = stats;

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: "Trainers", value: s.totalTrainers.toLocaleString(), icon: Users, color: "#3b82f6" },
          { label: "Institutions", value: s.totalCompanies, icon: Briefcase, color: "#10b981" },
          { label: "Active Projects", value: s.activeProjects, icon: Activity, color: "#8b5cf6" },
          { label: "Platform Volume", value: `₹${(s.totalTransactions / 10000000).toFixed(1)}Cr`, icon: TrendingUp, color: "#f59e0b" },
          { label: "Open Disputes", value: s.disputesOpen, icon: AlertTriangle, color: "#ef4444" },
          { label: "Pending Verifs", value: s.pendingVerifications, icon: ShieldCheck, color: "#f59e0b" },
        ].map((kpi) => (
          <div key={kpi.label} className="p-3 rounded border border-border" style={{ background: "var(--card)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground">{kpi.label}</span>
              <kpi.icon size={11} style={{ color: kpi.color }} />
            </div>
            <div className="text-lg font-bold mono" style={{ color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Volume chart */}
        <div className="lg:col-span-2 p-4 rounded border border-border" style={{ background: "var(--card)" }}>
          <div className="mb-4">
            <h3 className="font-medium text-foreground text-sm">Platform Volume — 2026</h3>
            <p className="text-xs text-muted-foreground">Total training fees transacted monthly</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={s.platformVolume} margin={{ left: -20 }}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `₹${v / 100000}L`} />
              <Tooltip
                contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, fontSize: 12 }}
                formatter={(v: number) => [`₹${v.toLocaleString()}`, "Volume"]}
              />
              <Area type="monotone" dataKey="volume" stroke="#3b82f6" fill="url(#volGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="p-4 rounded border border-border" style={{ background: "var(--card)" }}>
          <h3 className="font-medium text-foreground text-sm mb-4">Project Categories</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={s.categoryBreakdown} dataKey="value" cx="50%" cy="50%" outerRadius={55} stroke="none">
                {s.categoryBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, fontSize: 11 }}
                formatter={(v) => [`${v}%`]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {s.categoryBreakdown.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-muted-foreground">{c.name}</span>
                </div>
                <span className="mono text-foreground">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Open disputes */}
      <div className="rounded border border-border overflow-hidden" style={{ background: "var(--card)" }}>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-medium text-foreground text-sm flex items-center gap-2">
            <AlertTriangle size={13} className="text-destructive" /> Open Disputes
          </h3>
          <span className="text-xs mono px-2 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
            {s.disputesOpen} active
          </span>
        </div>
        <div className="divide-y divide-border">
          {s.recentDisputes.map((d) => {
            const statusColors = {
              open: { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
              reviewing: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
              escalated: { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
            };
            const sc = statusColors[d.status as keyof typeof statusColors];
            return (
              <div key={d.id} className="px-4 py-3 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-foreground text-sm">{d.trainer}</span>
                    <span className="text-muted-foreground text-xs">vs.</span>
                    <span className="text-foreground text-sm">{d.company}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{d.issue} · {d.days} days open</div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="mono font-medium text-foreground text-sm">₹{d.amount.toLocaleString()}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] mono capitalize"
                    style={{ background: sc.bg, color: sc.color }}>
                    {d.status}
                  </span>
                  <button className="px-2 py-1 rounded text-xs border border-border text-muted-foreground hover:text-foreground transition-colors">
                    Resolve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending verifications */}
      <div className="rounded border border-border overflow-hidden" style={{ background: "var(--card)" }}>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-medium text-foreground text-sm flex items-center gap-2">
            <ShieldCheck size={13} className="text-primary" /> Verification Queue
          </h3>
          <span className="text-xs mono px-2 py-0.5 rounded" style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6" }}>
            {s.pendingVerifications} pending
          </span>
        </div>
        <div className="divide-y divide-border">
          {s.pendingVerifs.map((v) => (
            <div key={v.id} className="px-4 py-3 flex items-center justify-between hover:bg-secondary/20 transition-colors">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-foreground text-sm">{v.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] mono capitalize border border-border text-muted-foreground">
                    {v.type}
                  </span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {v.docs.map((d) => (
                    <span key={d} className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 mono">{d}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => handleVerify(v.id)} className="px-3 py-1 rounded text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                  Approve
                </button>
                <button onClick={() => handleReject(v.id)} className="px-3 py-1 rounded text-xs border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
