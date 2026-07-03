import { useState, useEffect } from "react";
import { Plus, Calendar, TrendingUp, AlertCircle, Clock, CheckCircle2, DollarSign, User, FileText } from "lucide-react";
import { apiClient } from "../../utils/apiClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

interface Card {
  id: string;
  title: string;
  trainer?: string;
  applicants?: number;
  budget: string;
  posted?: string;
  shortlistedDate?: string;
  interviewDate?: string;
  startDate?: string;
  progress?: number;
  completedDate?: string;
  daysOverdue?: number;
  rawApp?: any;
  rawContract?: any;
  rawMilestone?: any;
}

function PipelineCard({ card, colId, onClick, onPrimaryAction }: { card: Card; colId: string; onClick?: () => void, onPrimaryAction?: (e: React.MouseEvent) => void }) {
  const isOverdue = colId === "payment" && card.daysOverdue;

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded border transition-all ${onClick ? 'cursor-pointer hover:border-primary/40' : 'cursor-grab active:cursor-grabbing'}`}
      style={{
        background: "var(--card)",
        borderColor: isOverdue ? "rgba(239,68,68,0.4)" : "var(--border)",
      }}
    >
      <div className="font-medium text-foreground text-xs leading-snug mb-2">{card.title}</div>

      {card.trainer && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
            style={{ background: "var(--primary)" }}>
            {card.trainer.split(" ").map(w => w[0]).join("").slice(0, 2)}
          </div>
          <span className="text-xs text-muted-foreground">{card.trainer}</span>
        </div>
      )}

      {card.applicants !== undefined && (
        <div className="text-[11px] text-muted-foreground mb-1">{card.applicants} applicants · Posted {card.posted}</div>
      )}

      {card.interviewDate && (
        <div className="flex items-center gap-1 text-[11px] mb-1" style={{ color: "#f59e0b" }}>
          <Calendar size={9} /> {card.interviewDate}
        </div>
      )}

      {card.startDate && (
        <div className="flex items-center gap-1 text-[11px] mb-1" style={{ color: "#10b981" }}>
          <CheckCircle2 size={9} /> Starts {card.startDate}
        </div>
      )}

      {card.progress !== undefined && (
        <div className="mt-2">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Progress</span><span>{card.progress}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
            <div className="h-full rounded-full" style={{ width: `${card.progress}%`, background: "var(--primary)" }} />
          </div>
        </div>
      )}

      {isOverdue && (
        <div className="flex items-center gap-1 text-[11px] mt-2" style={{ color: "#ef4444" }}>
          <AlertCircle size={9} /> {card.daysOverdue}d overdue — Completed {card.completedDate}
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
        <span className="mono text-[11px] text-foreground font-medium">{card.budget}</span>
        {colId === "payment" && (
          <button 
            onClick={(e) => { e.stopPropagation(); onPrimaryAction && onPrimaryAction(e); }}
            className="text-[10px] px-2 py-0.5 rounded transition-colors hover:bg-opacity-80" 
            style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
            Release
          </button>
        )}
        {colId === "selected" && (
          <button 
            onClick={(e) => { e.stopPropagation(); onPrimaryAction && onPrimaryAction(e); }}
            className="text-[10px] px-2 py-0.5 rounded transition-colors hover:bg-opacity-80" 
            style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
            Send Contract
          </button>
        )}
      </div>
    </div>
  );
}

export function HiringPipeline() {
  const [showPost, setShowPost] = useState(false);
  const [title, setTitle] = useState('');
  const [budgetString, setBudgetString] = useState('');
  const [durationString, setDurationString] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pipelineData, setPipelineData] = useState({
    columns: [
      { id: "posted", label: "Project Posted", color: "#3b82f6", count: 0, cards: [] },
      { id: "applied", label: "Under Review", color: "#3b82f6", count: 0, cards: [] },
      { id: "shortlisted", label: "Resume Shortlisted", color: "#8b5cf6", count: 0, cards: [] },
      { id: "interview", label: "Interview Scheduled", color: "#f59e0b", count: 0, cards: [] },
      { id: "selected", label: "Trainer Selected", color: "#10b981", count: 0, cards: [] },
      { id: "active", label: "Training Active", color: "#3b82f6", count: 0, cards: [] },
      { id: "payment", label: "Payment Due", color: "#ef4444", count: 0, cards: [] }
    ]
  });

  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchMyProjects = async () => {
    try {
      const [projRes, appsRes, contractsRes] = await Promise.all([
        apiClient('/marketplace/search?mine=true'),
        apiClient('/workflow/applications'),
        apiClient('/billing/contracts')
      ]);
      
      if (projRes.success && projRes.data && projRes.data.results) {
        const liveProjects = projRes.data.results.map((proj: any) => {
           const datePosted = new Date(proj.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
           return {
             id: proj._id,
             title: proj.title,
             applicants: 0,
             budget: `₹${(proj.budgetMin/1000).toFixed(0)}K–₹${(proj.budgetMax/1000).toFixed(0)}K`,
             posted: datePosted
           };
        });
        
        let allApps = [];
        if (appsRes.success && appsRes.data) {
           allApps = appsRes.data;
           liveProjects.forEach((p: any) => {
              p.applicants = allApps.filter((a: any) => a.requirementId === p.id || a.requirementId?._id === p.id).length;
           });
        }

        let allContracts = [];
        if (contractsRes && contractsRes.success && contractsRes.data) {
           allContracts = contractsRes.data;
        }

        setPipelineData(prev => ({
          columns: prev.columns.map(col => {
            if (col.id === 'posted') {
              return { ...col, count: liveProjects.length, cards: liveProjects };
            }
            if (col.id === 'applied') {
              const applied = allApps.filter((a: any) => a.status === 'APPLIED');
              return { ...col, count: applied.length, cards: applied.map((a: any) => ({
                id: a._id,
                title: a.projectTitle || 'Application',
                trainer: a.trainerName || "Trainer Applicant",
                budget: `₹${(a.bidAmount/1000).toFixed(0)}K`,
                posted: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                rawApp: a
              })) };
            }
            if (col.id === 'shortlisted') {
              const shortlisted = allApps.filter((a: any) => a.status === 'SHORTLISTED');
              return { ...col, count: shortlisted.length, cards: shortlisted.map((a: any) => ({
                id: a._id,
                title: a.projectTitle || 'Application',
                trainer: a.trainerName || "Trainer Applicant",
                budget: `₹${(a.bidAmount/1000).toFixed(0)}K`,
                posted: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                rawApp: a
              })) };
            }
            if (col.id === 'interview') {
              const interview = allApps.filter((a: any) => a.status === 'INTERVIEWING');
              return { ...col, count: interview.length, cards: interview.map((a: any) => ({
                id: a._id,
                title: a.projectTitle || 'Application',
                trainer: a.trainerName || "Trainer Applicant",
                budget: `₹${(a.bidAmount/1000).toFixed(0)}K`,
                posted: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                rawApp: a
              })) };
            }
            if (col.id === 'selected') {
              const selected = allApps.filter((a: any) => a.status === 'OFFERED');
              return { ...col, count: selected.length, cards: selected.map((a: any) => ({
                id: a._id,
                title: a.projectTitle || 'Application',
                trainer: a.trainerName || "Trainer Applicant",
                budget: `₹${(a.bidAmount/1000).toFixed(0)}K`,
                posted: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                rawApp: a
              })) };
            }
            if (col.id === 'active') {
              const active = allApps.filter((a: any) => a.status === 'ACCEPTED');
              return { ...col, count: active.length, cards: active.map((a: any) => ({
                id: a._id,
                title: a.projectTitle || 'Application',
                trainer: a.trainerName || "Trainer Applicant",
                budget: `₹${(a.bidAmount/1000).toFixed(0)}K`,
                progress: 10,
                startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                rawApp: a
              })) };
            }
            if (col.id === 'payment') {
              const paymentCards: Card[] = [];
              allContracts.forEach((contract: any) => {
                contract.milestones.forEach((m: any) => {
                  if (m.status === 'PENDING' || m.status === 'FUNDED' || m.status === 'IN_REVIEW') {
                    paymentCards.push({
                      id: m._id,
                      title: contract.requirementId?.title || 'Contract Payment',
                      trainer: contract.trainerId?.email?.split('@')[0] || 'Trainer',
                      budget: `₹${(m.amount/1000).toFixed(0)}K`,
                      daysOverdue: 0,
                      rawContract: contract,
                      rawMilestone: m
                    });
                  }
                });
              });
              return { ...col, count: paymentCards.length, cards: paymentCards };
            }
            return col;
          })
        }));
      }
    } catch (e) {
       console.error("Failed to load live pipeline data", e);
    }
  };

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const handleStatusTransition = async (targetStatus: string) => {
    if (!selectedApp) return;
    setUpdating(true);

    try {
      const response = await apiClient(`/workflow/applications/${selectedApp._id}/status`, {
        method: 'PATCH',
        bodyData: { status: targetStatus }
      });

      if (response.success) {
        setIsModalOpen(false);
        setSelectedApp(null);
        await fetchMyProjects();
      }
    } catch (err) {
      console.error('Failed to shift application pipeline status state:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSendContract = async (card: Card) => {
    if (!card.rawApp) return;
    setUpdating(true);
    try {
      const payload = {
        applicationId: card.rawApp._id,
        milestones: [
          {
            title: "Full Course Delivery",
            description: "Complete execution of the requested training program and final assessment.",
            amount: card.rawApp.bidAmount,
            dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString()
          }
        ]
      };
      const res = await apiClient('/billing/contracts', {
        method: 'POST',
        bodyData: payload
      });
      if (res.success) {
        await fetchMyProjects();
      }
    } catch (e) {
      console.error('Failed to send contract', e);
    } finally {
      setUpdating(false);
    }
  };

  const handleReleasePayment = async (card: Card) => {
    if (!card.rawContract || !card.rawMilestone) return;
    setUpdating(true);
    try {
      const res = await apiClient(`/billing/contracts/${card.rawContract._id}/milestones/${card.rawMilestone._id}/status`, {
        method: 'PATCH',
        bodyData: { status: 'RELEASED' }
      });
      if (res.success) {
        await fetchMyProjects();
      }
    } catch (e) {
      console.error('Failed to release payment', e);
    } finally {
      setUpdating(false);
    }
  };

  const handleCardClick = (card: Card) => {
    if (card.rawApp) {
      setSelectedApp(card.rawApp);
      setIsModalOpen(true);
    }
  };

  const handlePostRequirement = async () => {
    if (!title || !description) return;
    setIsSubmitting(true);

    const requiredSkills = skillsInput.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    
    const durationMatch = durationString.match(/\d+/);
    const durationInDays = durationMatch ? parseInt(durationMatch[0], 10) * 7 : 42; 
    
    let budgetMin = 0;
    let budgetMax = 0;
    const budgetMatch = budgetString.match(/(\d+)\s*[-to]+\s*(\d+)/i) || budgetString.match(/(\d+)/g);
    
    if (budgetMatch && budgetMatch.length >= 2) {
       if (budgetString.includes('-') || budgetString.includes('–')) {
         budgetMin = parseInt(budgetMatch[1], 10) || 0;
         budgetMax = parseInt(budgetMatch[2], 10) || 0;
       } else {
         budgetMin = parseInt(budgetMatch[0], 10) || 0;
         budgetMax = parseInt(budgetMatch[1], 10) || 0;
       }
    } else if (budgetMatch && budgetMatch.length === 1) {
       budgetMin = parseInt(budgetMatch[0], 10) || 0;
       budgetMax = budgetMin;
    }

    try {
      const response = await apiClient('/marketplace/projects', {
        method: 'POST',
        bodyData: {
          title,
          description,
          requiredSkills,
          durationInDays,
          mode: 'REMOTE',
          location: 'Remote',
          experienceLevelRequired: 'MID',
          budgetMin,
          budgetMax
        }
      });

      if (response.success) {
        setTitle('');
        setBudgetString('');
        setDurationString('');
        setSkillsInput('');
        setDescription('');
        setShowPost(false);
        fetchMyProjects();
      }
    } catch (error: any) {
      console.error('Failed to publish requirement:', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Clock size={11} /> 15-day payment window enforced</span>
          <span className="flex items-center gap-1.5"><TrendingUp size={11} /> AI shortlisting active</span>
        </div>
        <button
          onClick={() => setShowPost(!showPost)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white transition-all hover:opacity-90"
          style={{ background: "var(--primary)" }}
        >
          <Plus size={12} /> Post Project
        </button>
      </div>

      {/* New project form */}
      {showPost && (
        <div className="p-4 rounded border border-primary/40 space-y-3" style={{ background: "var(--card)" }}>
          <h3 className="font-medium text-foreground text-sm">New Training Project</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Project Title</label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-input border border-border rounded px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. PLC Training for B.Tech EE" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Budget Range (₹)</label>
              <input 
                value={budgetString}
                onChange={(e) => setBudgetString(e.target.value)}
                className="w-full bg-input border border-border rounded px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. 50000 – 70000" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Duration</label>
              <input 
                value={durationString}
                onChange={(e) => setDurationString(e.target.value)}
                className="w-full bg-input border border-border rounded px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. 6 weeks" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Required Skills</label>
              <input 
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="w-full bg-input border border-border rounded px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. PLC, SCADA, Siemens" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2} 
              className="w-full bg-input border border-border rounded px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              placeholder="Describe the training requirement, student batch size, hardware available..." />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePostRequirement}
              disabled={isSubmitting}
              className={`px-4 py-1.5 rounded text-xs font-medium text-white transition-opacity ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`} 
              style={{ background: "var(--primary)" }}>
              {isSubmitting ? 'Posting...' : 'Post & Activate AI Matching'}
            </button>
            <button onClick={() => setShowPost(false)} className="px-4 py-1.5 rounded text-xs border border-border text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {pipelineData.columns.map((col) => (
          <div key={col.id} className="w-72 shrink-0 snap-start flex flex-col h-[calc(100vh-140px)]">
            {/* Column header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="text-xs font-medium text-foreground">{col.label}</span>
              </div>
              <span className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center mono"
                style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
                {col.count}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2 p-2 rounded min-h-32" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.05)" }}>
              {col.cards.map((card) => (
                <PipelineCard 
                  key={card.id} 
                  card={card as Card} 
                  colId={col.id} 
                  onClick={() => handleCardClick(card as Card)}
                  onPrimaryAction={() => {
                    if (col.id === 'selected') handleSendContract(card as Card);
                    if (col.id === 'payment') handleReleasePayment(card as Card);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Review & Transition Action Overlay Sheet */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[520px] bg-[var(--card)] border border-border text-foreground">
          {selectedApp && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs uppercase font-semibold">
                    {selectedApp.status}
                  </Badge>
                </div>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {selectedApp.projectTitle}
                </DialogTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground/70" />
                  Applicant: <span className="font-semibold text-foreground">{selectedApp.trainerName}</span>
                </p>
              </DialogHeader>

              <div className="space-y-4 my-2 text-sm">
                <div className="grid grid-cols-2 gap-3 bg-secondary/30 p-3 rounded-md border border-border/40">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Proposed Bid</div>
                      <div className="font-semibold text-foreground">₹{selectedApp.bidAmount.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Timeline</div>
                      <div className="font-semibold text-foreground">{selectedApp.proposedTimeline}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Execution Strategy</span>
                  <div className="p-3 rounded-md bg-secondary/20 border border-border/30 max-h-40 overflow-y-auto text-muted-foreground leading-relaxed text-xs">
                    {selectedApp.coverLetter}
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-md border border-border bg-background">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Trainer Profile & Resume</span>
                  </div>
                  {selectedApp.resumeUrl && (
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs font-bold" onClick={() => window.open(selectedApp.resumeUrl, '_blank')}>
                      Open Credential Link
                    </Button>
                  )}
                </div>
              </div>

              <DialogFooter className="flex sm:justify-between items-center w-full pt-2 border-t border-border/40 gap-2">
                <div>
                  {selectedApp.status !== 'OFFERED' && (
                    <Button variant="destructive" size="sm" className="text-xs font-semibold" disabled={updating} onClick={() => handleStatusTransition('REJECTED')}>
                      Reject
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-xs font-semibold" onClick={() => setIsModalOpen(false)}>
                    Close
                  </Button>

                  {selectedApp.status === 'APPLIED' && (
                    <Button size="sm" className="text-xs font-semibold" disabled={updating} onClick={() => handleStatusTransition('SHORTLISTED')}>
                      Shortlist Candidate
                    </Button>
                  )}
                  {selectedApp.status === 'SHORTLISTED' && (
                    <Button size="sm" className="text-xs font-semibold" disabled={updating} onClick={() => handleStatusTransition('INTERVIEWING')}>
                      Schedule Interview
                    </Button>
                  )}
                  {selectedApp.status === 'INTERVIEWING' && (
                    <Button size="sm" className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white" disabled={updating} onClick={() => handleStatusTransition('OFFERED')}>
                      Initiate SOW Offer
                    </Button>
                  )}
                  {selectedApp.status === 'OFFERED' && (
                    <Button size="sm" className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white" disabled={updating} onClick={() => handleStatusTransition('ACCEPTED')}>
                      Confirm Hired (Move to Active)
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
