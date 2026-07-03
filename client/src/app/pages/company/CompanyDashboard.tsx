import { useNavigate } from "react-router";
import { Briefcase, Users, CreditCard, TrendingUp, ArrowRight, Plus, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { apiClient } from "../../utils/apiClient";

export function CompanyDashboard() {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalHired: 0,
    totalSpent: 0,
    rating: 5.0,
    spendChart: [
      { month: "Jan", spend: 0 },
      { month: "Feb", spend: 0 },
      { month: "Mar", spend: 0 },
      { month: "Apr", spend: 0 },
      { month: "May", spend: 0 },
      { month: "Jun", spend: 0 }
    ],
    paymentDueCount: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient('/marketplace/company/stats');
        if (res.success && res.data) {
          setStats(prev => ({
            ...prev,
            ...res.data
          }));
        }
      } catch (e) {
        console.error("Failed to load company stats", e);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-5">
      {/* Payment alert */}
      {stats.paymentDueCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded border"
          style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)" }}>
          <AlertCircle size={14} className="text-destructive flex-shrink-0" />
          <span className="text-sm text-destructive">
            <strong>{stats.paymentDueCount} payment overdue</strong> — Trainer payment window exceeded. Release immediately to avoid platform flag.
          </span>
          <button className="ml-auto flex-shrink-0 px-3 py-1 rounded text-xs font-medium"
            style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
            Release Now
          </button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Projects", value: stats.activeProjects, icon: Briefcase, color: "#3b82f6" },
          { label: "Total Hired", value: stats.totalHired, icon: Users, color: "#10b981" },
          { label: "Total Spent", value: `₹${(stats.totalSpent / 100000).toFixed(1)}L`, icon: CreditCard, color: "#f59e0b" },
          { label: "Avg. Rating Given", value: `${stats.rating}/5`, icon: TrendingUp, color: "#8b5cf6" },
        ].map((kpi) => (
          <div key={kpi.label} className="p-4 rounded border border-border" style={{ background: "var(--card)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: `${kpi.color}18` }}>
                <kpi.icon size={12} style={{ color: kpi.color }} />
              </div>
            </div>
            <div className="text-xl font-bold text-foreground mono">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Spend chart */}
        <div className="lg:col-span-2 p-4 rounded border border-border" style={{ background: "var(--card)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium text-foreground text-sm">Training Spend — 2026</h3>
              <p className="text-xs text-muted-foreground">Direct trainer payments, no agency overhead</p>
            </div>
            <button
              onClick={() => navigate("/company/pipeline")}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Pipeline <ArrowRight size={10} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.spendChart} margin={{ left: -25 }}>
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip
                contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, fontSize: 12 }}
                formatter={(v: number) => [`₹${v.toLocaleString()}`, "Spent"]}
              />
              <Bar dataKey="spend" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/company/pipeline")}
            className="w-full p-4 rounded border border-border hover:border-primary/50 transition-colors text-left"
            style={{ background: "var(--card)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Plus size={13} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Post New Project</span>
            </div>
            <p className="text-xs text-muted-foreground">List a training requirement. AI matches top trainers automatically.</p>
          </button>

          <div className="p-4 rounded border border-border" style={{ background: "var(--card)" }}>
            <h4 className="font-medium text-foreground text-sm mb-3">Pipeline Snapshot</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">Active Tracking Live</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/company/pipeline")}
              className="w-full mt-3 py-1.5 rounded text-xs text-primary border border-primary/30 hover:bg-primary/10 transition-colors"
            >
              Open Full Pipeline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
