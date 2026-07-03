import { useState, useEffect } from "react";
import { Calendar, FileText, Mail, XCircle, CheckCircle2, Clock, Eye } from "lucide-react";
import { apiClient } from "../../utils/apiClient";

const STATUS_CONFIG = {
  APPLIED: { label: "Under Review", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: Clock },
  SHORTLISTED: { label: "Shortlisted", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: Calendar },
  INTERVIEWING: { label: "Interview Scheduled", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: Calendar },
  OFFERED: { label: "Offered", color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: CheckCircle2 },
  ACCEPTED: { label: "Selected ✓", color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: XCircle },
};

export function Applications() {
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await apiClient('/workflow/applications');
        if (res.success && res.data) {
          setApplications(res.data);
        }
      } catch (e) {
        console.error("Failed to load applications", e);
      }
    };
    fetchApplications();
  }, []);

  const totalApplied = applications.length;
  const underReview = applications.filter(a => a.status === 'APPLIED').length;
  const interviews = applications.filter(a => a.status === 'INTERVIEWING').length;
  const selected = applications.filter(a => a.status === 'ACCEPTED').length;

  return (
    <div className="space-y-5">
      {/* Summary row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Applied", value: totalApplied, color: "#9ca3af" },
          { label: "Under Review", value: underReview, color: "#3b82f6" },
          { label: "Interviews", value: interviews, color: "#f59e0b" },
          { label: "Selected", value: selected, color: "#10b981" },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded border border-border text-center" style={{ background: "var(--card)" }}>
            <div className="text-xl font-bold mono" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Applications list */}
      <div className="rounded border border-border overflow-hidden" style={{ background: "var(--card)" }}>
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-medium text-foreground text-sm">All Applications</h3>
        </div>
        
        {applications.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground text-sm">
            No applications found.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {applications.map(app => {
              const statusKey = app.status as keyof typeof STATUS_CONFIG;
              const sc = STATUS_CONFIG[statusKey] || STATUS_CONFIG.APPLIED;
              const Icon = sc.icon;
              
              return (
                <div key={app._id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                  <div>
                    <div className="font-medium text-foreground">{app.requirementId?.title || 'Unknown Project'}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span>{app.requirementId?.companyId?.email?.split('@')[0] || 'Unknown Company'}</span>
                      <span>•</span>
                      <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium mono">₹{(app.bidAmount / 1000).toFixed(0)}K</div>
                      <div className="text-[10px] text-muted-foreground">Proposed</div>
                    </div>
                    <span className="px-2.5 py-1 rounded text-xs font-medium mono flex items-center gap-1.5 min-w-[120px] justify-center"
                      style={{ background: sc.bg, color: sc.color }}>
                      <Icon size={12} /> {sc.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
