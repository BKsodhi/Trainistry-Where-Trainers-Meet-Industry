import { useState, useEffect } from "react";
import { Download, AlertCircle, FileText, CheckCircle2, DollarSign } from "lucide-react";
import { apiClient } from "../../utils/apiClient";

export function PaymentTracker() {
  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await apiClient('/billing/contracts');
        if (res.success && res.data) {
          setContracts(res.data);
        }
      } catch (e) {
        console.error("Failed to load contracts", e);
      }
    };
    fetchContracts();
  }, []);

  let totalReceived = 0;
  let pendingRelease = 0;
  let upcomingMilestones = 0;

  const flattenedMilestones: any[] = [];

  contracts.forEach(contract => {
    const projectName = contract.requirementId?.title || "Unknown Project";
    const companyName = contract.companyId?.email?.split('@')[0] || "Unknown Company";
    
    contract.milestones.forEach((m: any) => {
      if (m.status === 'RELEASED') {
        totalReceived += m.amount;
      } else if (m.status === 'FUNDED' || m.status === 'IN_REVIEW') {
        pendingRelease += m.amount;
      } else {
        upcomingMilestones += m.amount;
      }
      
      flattenedMilestones.push({
        id: m._id,
        project: projectName,
        company: companyName,
        title: m.title,
        amount: m.amount,
        status: m.status,
        dueDate: m.dueDate ? new Date(m.dueDate).toLocaleDateString() : 'N/A',
        invoiceUrl: m.invoiceUrl
      });
    });
  });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Received", value: `₹${(totalReceived / 1000).toFixed(0)}K`, color: "#10b981" },
          { label: "Pending Release", value: `₹${(pendingRelease / 1000).toFixed(0)}K`, color: "#f59e0b" },
          { label: "Upcoming Milestones", value: `₹${(upcomingMilestones / 1000).toFixed(0)}K`, color: "#9ca3af" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded border border-border" style={{ background: "var(--card)" }}>
            <div className="text-sm text-muted-foreground mb-1">{s.label}</div>
            <div className="text-2xl font-bold mono" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded border border-border overflow-hidden" style={{ background: "var(--card)" }}>
        <div className="border-b border-border p-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Payment Milestones</h3>
        </div>
        
        {flattenedMilestones.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No contracts found. Apply to projects to begin earning.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {flattenedMilestones.map((m, idx) => (
              <div key={m.id || idx} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-secondary/30 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground text-sm">{m.project}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-foreground">{m.company}</span> • {m.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Due: {m.dueDate}</div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-foreground mono">₹{m.amount.toLocaleString()}</div>
                  </div>
                  
                  <div className="w-[100px] text-right flex-shrink-0">
                    {m.status === 'RELEASED' && (
                      <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-[10px] font-medium" 
                        style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                        <CheckCircle2 size={10} /> Released
                      </span>
                    )}
                    {(m.status === 'FUNDED' || m.status === 'IN_REVIEW') && (
                      <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-[10px] font-medium" 
                        style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                        <AlertCircle size={10} /> Pending
                      </span>
                    )}
                    {m.status === 'PENDING' && (
                      <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-[10px] font-medium border border-border text-muted-foreground">
                        Upcoming
                      </span>
                    )}
                  </div>
                  
                  {m.invoiceUrl && (
                    <button className="flex-shrink-0 w-8 h-8 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors hover:border-primary/50" title="Download Invoice">
                      <Download size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
