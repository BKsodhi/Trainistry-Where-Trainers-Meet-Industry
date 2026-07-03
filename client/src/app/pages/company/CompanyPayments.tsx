import { AlertCircle, CheckCircle2, Clock, Download, Send, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "../../utils/apiClient";

const STATUS_CONFIG = {
  overdue: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "Overdue", icon: AlertCircle },
  upcoming: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Upcoming", icon: Clock },
  released: { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Released", icon: CheckCircle2 },
};

export function CompanyPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await apiClient("/billing/contracts");
        if (res.success && res.data) {
          const formatted = res.data.flatMap((contract: any) => 
            contract.milestones.map((m: any) => {
              // Map PENDING to upcoming, RELEASED to released, etc.
              const statusMap: Record<string, string> = {
                'PENDING': 'upcoming',
                'FUNDED': 'upcoming',
                'RELEASED': 'released'
              };

              return {
                id: m._id,
                trainer: contract.trainerId?.email?.split('@')[0] || "Unknown Trainer",
                project: contract.requirementId?.title || "Unknown Project",
                milestone: m.title || "Milestone Payment",
                amount: m.amount,
                dueDate: new Date(contract.createdAt).toLocaleDateString(), // Mocking due date based on creation for now
                status: statusMap[m.status] || 'upcoming',
                daysOverdue: 0,
                releasedDate: m.status === 'RELEASED' ? new Date(m.updatedAt || m.createdAt).toLocaleDateString() : null
              };
            })
          );
          setPayments(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch payments:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayments();
  }, []);

  const overdue = payments.filter(p => p.status === "overdue");
  const upcoming = payments.filter(p => p.status === "upcoming");
  const released = payments.filter(p => p.status === "released");

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground text-sm">Loading payment ledgers...</div>;
  }

  if (payments.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center bg-[var(--card)] mt-5 max-w-5xl mx-auto">
        <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold tracking-tight text-foreground">No financial ledgers found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Once you hire a trainer and establish a smart contract, your milestone payment schedule will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div className="p-4 rounded border" style={{ background: "rgba(239,68,68,0.07)", borderColor: "rgba(239,68,68,0.25)" }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={13} className="text-destructive" />
            <span className="font-medium text-destructive text-sm">{overdue.length} overdue payment{overdue.length > 1 ? "s" : ""}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Payments past the 15-day window are flagged by the platform. Continued delay may result in account suspension and a warning post.
          </p>
          <div className="space-y-2">
            {overdue.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-foreground font-medium">{p.trainer}</span>
                  <span className="text-muted-foreground text-xs"> — {p.milestone} · {p.daysOverdue}d overdue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="mono font-semibold text-foreground">₹{p.amount.toLocaleString()}</span>
                  <button className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium text-white"
                    style={{ background: "#ef4444" }}>
                    <Send size={10} /> Release Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Overdue", value: `₹${overdue.reduce((a, p) => a + p.amount, 0).toLocaleString()}`, color: "#ef4444" },
          { label: "Due This Month", value: `₹${upcoming.reduce((a, p) => a + p.amount, 0).toLocaleString()}`, color: "#f59e0b" },
          { label: "Released (Total)", value: `₹${released.reduce((a, p) => a + p.amount, 0).toLocaleString()}`, color: "#10b981" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded border border-border" style={{ background: "var(--card)" }}>
            <div className="mono font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* All payments */}
      <div className="rounded border border-border overflow-hidden" style={{ background: "var(--card)" }}>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-medium text-foreground text-sm">Payment Schedule</h3>
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Download size={11} /> Export
          </button>
        </div>
        <div className="divide-y divide-border">
          {payments.map((p) => {
            const sc = STATUS_CONFIG[p.status as keyof typeof STATUS_CONFIG];
            return (
              <div key={p.id} className="px-4 py-3 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-foreground text-sm">{p.trainer}</span>
                    <span className="text-muted-foreground text-xs">—</span>
                    <span className="text-foreground text-sm">{p.milestone}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {p.project} · Due {p.dueDate}
                    {p.status === "overdue" && <span className="text-destructive"> · {(p as any).daysOverdue}d overdue</span>}
                    {p.status === "released" && <span style={{ color: "#10b981" }}> · Released {(p as any).releasedDate}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  <span className="mono font-semibold text-foreground">₹{p.amount.toLocaleString()}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] mono flex items-center gap-1"
                    style={{ background: sc.bg, color: sc.color }}>
                    <sc.icon size={9} /> {sc.label}
                  </span>
                  {p.status === "upcoming" && (
                    <button className="px-2 py-1 rounded text-xs border border-border text-muted-foreground hover:text-foreground transition-colors">
                      Schedule
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
