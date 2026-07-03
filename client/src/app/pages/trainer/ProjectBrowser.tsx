import { useState, useEffect } from "react";
import { MapPin, Clock, Users, AlertCircle, CheckCircle2, Send, Filter } from "lucide-react";
import { apiClient } from "../../utils/apiClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../components/ui/dialog";

const URGENCY_CONFIG = {
  high: { label: "Urgent", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  medium: { label: "Standard", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  low: { label: "Flexible", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
};

export function ProjectBrowser() {
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [projects, setProjects] = useState<any[]>([]);
  const [aiMatch, setAiMatch] = useState<{ count: number; skills: string[]; location: string } | null>(null);

  useEffect(() => {
    const fetchProjectsAndApps = async () => {
      try {
        const [projRes, appsRes, profileRes] = await Promise.all([
          apiClient('/marketplace/search'),
          apiClient('/workflow/applications'),
          apiClient('/profiles/trainer/me')
        ]);
        
        if (projRes.success && projRes.data && projRes.data.results) {
          const liveProjects = projRes.data.results.map((p: any) => ({
            id: p._id,
            title: p.title,
            company: p.companyName || "Verified Company", // Populated by backend aggregation later
            companyLogo: p.companyName ? p.companyName.substring(0, 2).toUpperCase() : "VC",
            budget: { min: p.budgetMin || 0, max: p.budgetMax || 0, type: "fixed" },
            duration: p.durationInDays ? `${Math.round(p.durationInDays / 7)} weeks` : "Flexible",
            location: p.location || p.mode || "Remote",
            skills: p.requiredSkills || [],
            applicants: p.applicantsCount || 0,
            posted: new Date(p.createdAt || Date.now()).toLocaleDateString(),
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            status: p.status || 'OPEN',
            urgency: "medium",
            description: p.description
          }));
          setProjects(liveProjects);
        }

        if (appsRes.success && appsRes.data) {
          const appSet = new Set<string>();
          appsRes.data.forEach((app: any) => {
            if (app.requirementId && app.requirementId._id) {
               appSet.add(app.requirementId._id);
            } else if (typeof app.requirementId === 'string') {
               appSet.add(app.requirementId);
            }
          });
          setApplied(appSet);
        }

        if (profileRes.success && profileRes.data && projRes.success && projRes.data.results) {
          const profile = profileRes.data;
          const userSkills = profile.skills || [];
          const userLocation = profile.location ? `${profile.location.city || ''}, ${profile.location.country || ''}`.replace(/^, | ,$|(^, $)/g, '') : "";
          
          if (userSkills.length > 0 || userLocation) {
             const matchedSkills = new Set<string>();
             const matchCount = projRes.data.results.filter((p: any) => {
                const projectLocation = p.location || p.mode || "";
                const projectSkills = p.requiredSkills || [];
                const locationMatch = userLocation && projectLocation.toLowerCase().includes(userLocation.split(',')[0].toLowerCase());
                
                let hasSkillMatch = false;
                userSkills.forEach((s: string) => {
                  if (projectSkills.some((ps: string) => ps.toLowerCase().includes(s.toLowerCase()))) {
                    matchedSkills.add(s);
                    hasSkillMatch = true;
                  }
                });

                return locationMatch || hasSkillMatch;
             }).length;
             setAiMatch({ count: matchCount, skills: Array.from(matchedSkills).slice(0, 3), location: userLocation.split(',')[0] });
          }
        }
      } catch (e) {
        console.error("Failed to fetch projects and apps", e);
      }
    };
    fetchProjectsAndApps();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [appForm, setAppForm] = useState({
    bidAmount: "",
    proposedTimeline: "",
    coverLetter: "",
    resumeUrl: ""
  });

  const openApplyModal = (projectId: string) => {
    setActiveProjectId(projectId);
    setAppForm({ bidAmount: "", proposedTimeline: "", coverLetter: "", resumeUrl: "" });
    setIsModalOpen(true);
  };

  const handleApply = async () => {
    if (!activeProjectId) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient('/workflow/apply', {
        method: "POST",
        bodyData: {
          requirementId: activeProjectId,
          bidAmount: parseInt(appForm.bidAmount) || 0,
          proposedTimeline: appForm.proposedTimeline,
          coverLetter: appForm.coverLetter,
          resumeUrl: appForm.resumeUrl
        }
      });
      if (res.success) {
        setApplied((prev) => { const next = new Set(prev); next.add(activeProjectId); return next; });
        setIsModalOpen(false);
      }
    } catch (e) {
      console.error("Failed to apply", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* AI Match banner */}
      {aiMatch && aiMatch.count > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded border"
          style={{ background: "rgba(59,130,246,0.08)", borderColor: "rgba(59,130,246,0.2)" }}>
          <CheckCircle2 size={13} style={{ color: "var(--primary)" }} />
          <span className="text-xs text-foreground">
            <strong className="text-primary">AI Match active</strong> — {aiMatch.count} project{aiMatch.count !== 1 ? 's' : ''} match your stack ({aiMatch.skills.join(', ')}) {aiMatch.location && `and ${aiMatch.location} location.`} Highlighted below.
          </span>
        </div>
      )}

      {/* Project list */}
      <div className="space-y-3">
        {projects.map((p) => {
          const urg = URGENCY_CONFIG[p.urgency as keyof typeof URGENCY_CONFIG];
          const isApplied = applied.has(p.id);
          return (
            <div key={p.id} className="rounded border border-border overflow-hidden hover:border-primary/40 transition-colors"
              style={{ background: "var(--card)" }}>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{p.title}</h3>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium mono flex-shrink-0"
                        style={{ background: urg.bg, color: urg.color }}>
                        {urg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold"
                        style={{ background: "var(--secondary)", color: "var(--primary)" }}>
                        {p.companyLogo}
                      </div>
                      {p.company}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{p.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {p.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded text-[10px] mono border border-border text-muted-foreground">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <div className="mono font-semibold text-foreground text-sm">
                      ₹{(p.budget.min / 1000).toFixed(0)}K–₹{(p.budget.max / 1000).toFixed(0)}K
                    </div>
                    <div className="text-xs text-muted-foreground">Fixed price</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {p.location}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {p.duration}</span>
                    <span className="flex items-center gap-1"><Users size={10} /> {p.applicants} applied</span>
                    <span className="flex items-center gap-1"><AlertCircle size={10} /> Deadline {p.deadline}</span>
                  </div>
                  <button
                    onClick={() => openApplyModal(p.id)}
                    disabled={isApplied}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all"
                    style={
                      isApplied
                        ? { background: "rgba(16,185,129,0.12)", color: "#10b981" }
                        : { background: "var(--primary)", color: "#fff" }
                    }
                  >
                    {isApplied ? <><CheckCircle2 size={11} /> Applied</> : <><Send size={11} /> Apply Now</>}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Engagement Proposal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Proposed Bid (₹)</label>
                <input type="number" value={appForm.bidAmount} onChange={(e) => setAppForm({...appForm, bidAmount: e.target.value})} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. 45000" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Delivery Timeline</label>
                <input type="text" value={appForm.proposedTimeline} onChange={(e) => setAppForm({...appForm, proposedTimeline: e.target.value})} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. 3 weeks" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Cover Letter / Execution Strategy</label>
              <textarea value={appForm.coverLetter} onChange={(e) => setAppForm({...appForm, coverLetter: e.target.value})} rows={4} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Detail your training delivery mechanics..." />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Resume / Professional Portfolio Link</label>
              <input type="url" value={appForm.resumeUrl} onChange={(e) => setAppForm({...appForm, resumeUrl: e.target.value})} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="https://drive.google.com/file/d/..." />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded text-xs font-medium border border-border text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={handleApply} disabled={isSubmitting || !appForm.bidAmount || !appForm.proposedTimeline || !appForm.coverLetter || !appForm.resumeUrl} className="px-4 py-2 rounded text-xs font-medium text-white transition-opacity" style={{ background: "var(--primary)", opacity: (isSubmitting || !appForm.bidAmount || !appForm.proposedTimeline || !appForm.coverLetter || !appForm.resumeUrl) ? 0.5 : 1 }}>
              {isSubmitting ? "Transmitting..." : "Confirm & Apply"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
