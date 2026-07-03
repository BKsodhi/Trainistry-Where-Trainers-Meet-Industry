import { useState, useEffect } from "react";
import { AlertTriangle, MessageSquare, Search, Filter, ShieldAlert, CheckCircle2 } from "lucide-react";
import { apiClient } from "../../utils/apiClient";

const STATUS_CONFIG = {
  open: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "Open" },
  reviewing: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Under Review" },
  escalated: { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", label: "Escalated" },
  resolved: { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Resolved" },
};

export function Disputes() {
  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [disputes, setDisputes] = useState<any[]>([]);

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const res = await apiClient("/admin/disputes");
        if (res.success && res.data) {
          setDisputes(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch disputes", err);
      }
    };
    fetchDisputes();
  }, []);

  const selectedDispute = disputes.find(d => d.id === selected);

  const handleAction = async (id: string, actionType: 'reopen' | 'release') => {
    try {
      await apiClient(`/admin/disputes/${id}/${actionType}`, { method: "POST" });
      setDisputes(prev => prev.filter(d => d.id !== id));
      setSelected(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-5">
      {/* List */}
      <div className="lg:col-span-3 space-y-3">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Open", value: disputes.length, color: "#ef4444" },
            { label: "Reviewing", value: 0, color: "#f59e0b" },
            { label: "Escalated", value: 0, color: "#8b5cf6" },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded border border-border text-center" style={{ background: "var(--card)" }}>
              <div className="text-lg font-bold mono" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {disputes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm border rounded border-border" style={{ background: "var(--card)" }}>
            No disputes found.
          </div>
        ) : (
          <div className="space-y-2">
            {disputes.map(d => {
              const sc = STATUS_CONFIG[d.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.open;
              return (
                <div key={d.id} onClick={() => setSelected(d.id)} 
                  className={`p-4 rounded border transition-colors cursor-pointer ${selected === d.id ? 'border-primary' : 'border-border hover:border-muted-foreground'}`}
                  style={{ background: "var(--card)" }}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-sm">{d.company} <span className="text-muted-foreground font-normal">vs</span> {d.trainer}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] mono uppercase" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{d.issue}</span>
                    <span className="mono">₹{d.amount.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail pane */}
      <div className="lg:col-span-2">
        {selectedDispute ? (
          <div className="p-5 rounded border border-border space-y-5" style={{ background: "var(--card)" }}>
            <div>
              <h3 className="font-medium text-lg mb-1">Dispute Oversight</h3>
              <p className="text-xs text-muted-foreground">ID: {selectedDispute.id}</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Escrow Amount</span>
                <span className="mono font-medium">₹{selectedDispute.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time Elapsed</span>
                <span className="mono text-destructive">{selectedDispute.days} Days</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground mb-3">God Mode Override Levers</h4>
              
              <button onClick={() => handleAction(selectedDispute.id, 'reopen')}
                className="w-full py-2.5 rounded text-sm font-medium transition-opacity hover:opacity-90"
                style={{ background: "var(--primary)", color: "#fff" }}>
                [Lever A] Re-open Project (ACTIVE)
              </button>
              
              <button onClick={() => handleAction(selectedDispute.id, 'release')}
                className="w-full py-2.5 rounded text-sm font-medium border border-destructive text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground">
                [Lever B] Force Release Funds (COMPLETED)
              </button>
            </div>
          </div>
        ) : (
          <div className="h-48 rounded border border-dashed border-border flex items-center justify-center"
            style={{ background: "var(--card)" }}>
            <div className="text-center">
              <MessageSquare size={20} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Select a dispute to review</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
