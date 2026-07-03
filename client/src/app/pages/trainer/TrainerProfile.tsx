import { ShieldCheck, MapPin, Star, Edit3, Plus, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "../../utils/apiClient";
import { useApp } from "../../context/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../components/ui/dialog";

export function TrainerProfile() {
  const { user } = useApp();
  const fallbackName = user?.email?.split('@')[0] || "Trainer";
  const avatar = user ? user.email.substring(0, 2).toUpperCase() : "TR";

  const [profile, setProfile] = useState<any>({ 
    name: fallbackName, 
    avatar,
    verified: false, 
    location: "Not set", 
    title: "Freelance Trainer", 
    rating: 0, 
    totalProjects: 0, 
    totalEarned: 0, 
    skills: [], 
    availability: "Flexible",
    portfolio: [],
    certifications: []
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient('/profiles/trainer/me');
        if (res.success && res.data) {
          const pd = res.data;
          setProfile((prev: any) => ({
            ...prev,
            title: pd.title || prev.title,
            location: pd.location ? `${pd.location.city || ''}, ${pd.location.country || ''}`.replace(/^, | ,$|(^, $)/g, '') || prev.location : prev.location,
            skills: pd.skills || prev.skills,
            availability: pd.availabilityStatus || prev.availability,
            verified: pd.identityVerified || prev.verified,
            rating: pd.averageRating || 0,
            totalProjects: pd.projectCount || 0,
            portfolio: pd.portfolio || [],
            certifications: pd.certifications || []
          }));
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    };
    fetchProfile();
  }, []);

  const [editForm, setEditForm] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [portfolioForm, setPortfolioForm] = useState<any>({ title: '', students: '', duration: '', rating: '', year: '' });
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);

  const [certForm, setCertForm] = useState<any>({ name: '', issuer: '', year: '' });
  const [isCertOpen, setIsCertOpen] = useState(false);

  const handleEditOpen = () => {
    setEditForm({
      title: profile.title,
      location: profile.location,
      availability: profile.availability,
      skills: profile.skills.join(", ")
    });
    setIsDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    setIsSubmitting(true);
    try {
      const locParts = (editForm.location || "").split(",");
      const payload = {
        title: editForm.title,
        location: {
          city: locParts[0]?.trim() || "Remote",
          country: locParts[1]?.trim() || "India"
        },
        availabilityStatus: editForm.availability,
        skills: editForm.skills.split(",").map((s: string) => s.trim()).filter((s: string) => s)
      };
      const res = await apiClient('/profiles/trainer', {
        method: 'PUT',
        bodyData: payload
      });
      if (res.success && res.data) {
        setProfile((prev: any) => ({
          ...prev,
          title: res.data.title || prev.title,
          location: res.data.location ? `${res.data.location.city || ''}, ${res.data.location.country || ''}`.replace(/^, | ,$|(^, $)/g, '') || prev.location : prev.location,
          skills: res.data.skills || prev.skills,
          availability: res.data.availabilityStatus || prev.availability,
        }));
        setIsDialogOpen(false);
      }
    } catch (e) {
      console.error("Failed to update profile", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePortfolio = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: portfolioForm.title,
        students: parseInt(portfolioForm.students) || 0,
        duration: portfolioForm.duration,
        rating: parseFloat(portfolioForm.rating) || 5.0,
        year: parseInt(portfolioForm.year) || new Date().getFullYear()
      };
      const res = await apiClient('/profiles/trainer/portfolio', { method: 'POST', bodyData: payload });
      if (res.success && res.data) {
        setProfile((prev: any) => ({ ...prev, portfolio: [res.data, ...prev.portfolio] }));
        setIsPortfolioOpen(false);
        setPortfolioForm({ title: '', students: '', duration: '', rating: '', year: '' });
      }
    } catch (e) {
      console.error("Failed to add portfolio", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCert = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: certForm.name,
        issuer: certForm.issuer,
        year: parseInt(certForm.year) || new Date().getFullYear()
      };
      const res = await apiClient('/profiles/trainer/certifications', { method: 'POST', bodyData: payload });
      if (res.success && res.data) {
        setProfile((prev: any) => ({ ...prev, certifications: [res.data, ...prev.certifications] }));
        setIsCertOpen(false);
        setCertForm({ name: '', issuer: '', year: '' });
      }
    } catch (e) {
      console.error("Failed to add certification", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const t = profile;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Profile header */}
      <div className="p-5 rounded border border-border" style={{ background: "var(--card)" }}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
            style={{ background: "var(--primary)" }}>
            {t.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-semibold text-foreground">{t.name}</h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6" }}>
                <ShieldCheck size={10} /> Verified Trainer
              </span>
            </div>
            <div className="text-sm text-muted-foreground mb-2">{t.title}</div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin size={10} /> {t.location}</span>
              <span className="flex items-center gap-1"><Star size={10} style={{ color: "#f59e0b" }} /> {t.rating}/5 · {t.totalProjects} projects</span>
              <span className="px-1.5 py-0.5 rounded border border-border mono">{t.availability}</span>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button onClick={handleEditOpen} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border border-border text-muted-foreground hover:text-foreground transition-colors">
                <Edit3 size={11} /> Edit Profile
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Public Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Professional Title</label>
                  <input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Senior PLC/SCADA Trainer" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Location</label>
                    <input type="text" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Remote, India" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Availability</label>
                    <select value={editForm.availability} onChange={(e) => setEditForm({...editForm, availability: e.target.value})} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="Flexible">Flexible</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Skills (comma separated)</label>
                  <input type="text" value={editForm.skills} onChange={(e) => setEditForm({...editForm, skills: e.target.value})} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. PLC, SCADA, IoT" />
                </div>
              </div>
              <DialogFooter>
                <button onClick={() => setIsDialogOpen(false)} className="px-4 py-2 rounded text-xs font-medium border border-border text-muted-foreground hover:text-foreground">Cancel</button>
                <button onClick={handleSaveProfile} disabled={isSubmitting} className="px-4 py-2 rounded text-xs font-medium text-white transition-opacity" style={{ background: "var(--primary)", opacity: isSubmitting ? 0.5 : 1 }}>{isSubmitting ? "Saving..." : "Save Changes"}</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {t.skills.map((s) => (
            <span key={s} className="px-2 py-1 rounded text-xs mono border border-border text-muted-foreground">
              {s}
            </span>
          ))}
          <button className="px-2 py-1 rounded text-xs mono border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            <Plus size={10} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Lifetime Earnings", value: `₹${(t.totalEarned / 100000).toFixed(1)}L`, sub: "100% to trainer" },
          { label: "Completed Projects", value: t.totalProjects, sub: "Verified completions" },
          { label: "Avg. Rating", value: `${t.rating}/5`, sub: "Across all projects" },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded border border-border text-center" style={{ background: "var(--card)" }}>
            <div className="mono font-bold text-foreground">{s.value}</div>
            <div className="text-xs font-medium text-foreground mt-0.5">{s.label}</div>
            <div className="text-[11px] text-muted-foreground">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Portfolio */}
      <div className="rounded border border-border overflow-hidden" style={{ background: "var(--card)" }}>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-medium text-foreground text-sm">Training Portfolio</h3>
          <Dialog open={isPortfolioOpen} onOpenChange={setIsPortfolioOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus size={10} /> Add entry
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Portfolio Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Course / Project Title</label>
                  <input type="text" value={portfolioForm.title} onChange={(e) => setPortfolioForm({...portfolioForm, title: e.target.value})} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. PLC & SCADA — VJTI Mumbai" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Students Trained</label>
                    <input type="number" value={portfolioForm.students} onChange={(e) => setPortfolioForm({...portfolioForm, students: e.target.value})} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="38" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Duration</label>
                    <input type="text" value={portfolioForm.duration} onChange={(e) => setPortfolioForm({...portfolioForm, duration: e.target.value})} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="6 weeks" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Average Rating</label>
                    <input type="number" step="0.1" value={portfolioForm.rating} onChange={(e) => setPortfolioForm({...portfolioForm, rating: e.target.value})} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="4.9" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Year</label>
                    <input type="number" value={portfolioForm.year} onChange={(e) => setPortfolioForm({...portfolioForm, year: e.target.value})} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="2025" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <button onClick={() => setIsPortfolioOpen(false)} className="px-4 py-2 rounded text-xs font-medium border border-border text-muted-foreground hover:text-foreground">Cancel</button>
                <button onClick={handleSavePortfolio} disabled={isSubmitting} className="px-4 py-2 rounded text-xs font-medium text-white transition-opacity" style={{ background: "var(--primary)", opacity: isSubmitting ? 0.5 : 1 }}>{isSubmitting ? "Saving..." : "Save Entry"}</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="divide-y divide-border">
          {t.portfolio.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No portfolio items added yet.</div>
          ) : t.portfolio.map((p: any) => (
            <div key={p._id} className="px-4 py-3 flex items-center justify-between hover:bg-secondary/20 transition-colors">
              <div>
                <div className="font-medium text-foreground text-sm">{p.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {p.students} students · {p.duration} · {p.year}
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <div className="flex items-center gap-1 text-xs">
                  <Star size={11} style={{ color: "#f59e0b" }} />
                  <span className="mono font-medium text-foreground">{p.rating}</span>
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="rounded border border-border overflow-hidden" style={{ background: "var(--card)" }}>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-medium text-foreground text-sm">Certifications & Credentials</h3>
          <Dialog open={isCertOpen} onOpenChange={setIsCertOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus size={10} /> Add entry
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Certification</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Certification Name</label>
                  <input type="text" value={certForm.name} onChange={(e) => setCertForm({...certForm, name: e.target.value})} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Siemens SITRAIN" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Issuing Organization</label>
                  <input type="text" value={certForm.issuer} onChange={(e) => setCertForm({...certForm, issuer: e.target.value})} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Siemens AG" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Year Obtained</label>
                  <input type="number" value={certForm.year} onChange={(e) => setCertForm({...certForm, year: e.target.value})} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="2022" />
                </div>
              </div>
              <DialogFooter>
                <button onClick={() => setIsCertOpen(false)} className="px-4 py-2 rounded text-xs font-medium border border-border text-muted-foreground hover:text-foreground">Cancel</button>
                <button onClick={handleSaveCert} disabled={isSubmitting} className="px-4 py-2 rounded text-xs font-medium text-white transition-opacity" style={{ background: "var(--primary)", opacity: isSubmitting ? 0.5 : 1 }}>{isSubmitting ? "Saving..." : "Save Entry"}</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="divide-y divide-border">
          {t.certifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No certifications added yet.</div>
          ) : t.certifications.map((c: any) => (
            <div key={c._id || c.name} className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground text-sm">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.issuer} · {c.year}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] mono"
                style={{ background: c.verified ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)", color: c.verified ? "#10b981" : "#f59e0b" }}>
                {c.verified ? "Verified" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
