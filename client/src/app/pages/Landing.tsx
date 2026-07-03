import { useNavigate } from "react-router";
import { Zap, ArrowRight, ShieldCheck, TrendingUp, GitBranch, CreditCard, Users, Star } from "lucide-react";

const STATS = [
  { label: "Verified Trainers", value: "1,847" },
  { label: "Partner Institutions", value: "342" },
  { label: "Fee to Trainer", value: "100%" },
  { label: "Avg. Project Value", value: "₹68K" },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verified Ecosystem",
    desc: "Two-factor identity verification for all trainers and institutions. Verified badges, audit logs, and dispute resolution built in.",
  },
  {
    icon: GitBranch,
    title: "End-to-End Pipeline",
    desc: "From project posting to contract generation — AI shortlisting, interview scheduling, and offer letters are fully automated.",
  },
  {
    icon: CreditCard,
    title: "Transparent Payments",
    desc: "Milestone-based escrow. 100% of the training fee reaches the trainer. Automated reminders at T-3 days and T-0.",
  },
  {
    icon: TrendingUp,
    title: "Smart Matching",
    desc: "AI matching on tech stack, location, budget, and availability. Less noise, more relevant opportunities.",
  },
  {
    icon: Users,
    title: "Professional Network",
    desc: "Post achievements, share milestones, follow specialists. Admin-moderated warning posts protect the community.",
  },
  {
    icon: Star,
    title: "Two-Way Ratings",
    desc: "Trainers rate institutions; institutions rate trainers. Full accountability with a 15-day post-completion payment window.",
  },
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-50"
        style={{ background: "rgba(7, 9, 15, 0.92)", backdropFilter: "blur(8px)" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: "var(--primary)" }}>
            <Zap size={14} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-foreground tracking-tight">Trainistry</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-1.5 text-sm rounded font-medium text-white transition-all hover:opacity-90"
            style={{ background: "var(--primary)" }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-24 pb-20 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border mb-8"
          style={{ background: "var(--secondary)" }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--success)" }} />
          <span className="text-xs text-muted-foreground mono">Platform-Led Model · Zero Middlemen</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-6">
          Industrial Training,<br />
          <span style={{ color: "var(--primary)" }}>Without the Agency Tax</span>
        </h1>

        <p className="text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Trainistry connects specialist trainers directly with universities and institutions.
          100% of the training fee goes to the trainer. Full hiring pipeline, milestone payments,
          and verified ecosystem — no L&T in the middle.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded font-medium text-white transition-all hover:opacity-90"
            style={{ background: "var(--primary)" }}
          >
            Join as Trainer <ArrowRight size={15} />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded font-medium transition-all border border-border text-foreground hover:bg-secondary"
          >
            Post a Project
          </button>
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px border border-border rounded overflow-hidden"
          style={{ background: "var(--border)" }}>
          {STATS.map((s) => (
            <div key={s.label} className="px-6 py-5 text-center" style={{ background: "var(--card)" }}>
              <div className="text-2xl font-bold text-foreground mono">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 border-t border-border" style={{ background: "var(--card)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-semibold text-foreground mb-2">The Trainistry Difference</h2>
            <p className="text-muted-foreground text-sm">Old model vs. platform model — the numbers speak.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded border border-border" style={{ background: "var(--background)" }}>
              <div className="text-xs font-medium text-muted-foreground mb-4 mono uppercase tracking-wider">Agency-Led Model (Before)</div>
              <div className="space-y-3">
                {[
                  ["Institution pays", "₹1,00,000"],
                  ["Agency commission", "−₹30,000 (30%)"],
                  ["Trainer receives", "₹70,000"],
                  ["Payment timeline", "45–90 days"],
                  ["Dispute resolution", "None"],
                ].map(([k, v], i) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-border pb-2">
                    <span className="text-muted-foreground">{k}</span>
                    <span className={`mono font-medium ${i === 2 ? "text-destructive" : "text-foreground"}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded border" style={{ background: "var(--background)", borderColor: "var(--primary)" }}>
              <div className="text-xs font-medium mb-4 mono uppercase tracking-wider" style={{ color: "var(--primary)" }}>Trainistry Platform Model (Now)</div>
              <div className="space-y-3">
                {[
                  ["Institution pays", "₹1,00,000"],
                  ["Platform fee", "₹0 (Zero middleman)"],
                  ["Trainer receives", "₹1,00,000"],
                  ["Payment timeline", "15 days (enforced)"],
                  ["Dispute resolution", "Admin portal + escrow"],
                ].map(([k, v], i) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-border pb-2">
                    <span className="text-muted-foreground">{k}</span>
                    <span className={`mono font-medium ${i === 2 ? "text-[var(--success)]" : "text-foreground"}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-semibold text-foreground mb-2">Everything the Ecosystem Needs</h2>
          <p className="text-muted-foreground text-sm">Built for trainers, institutions, and platform integrity.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-5 rounded border border-border hover:border-primary/50 transition-colors group"
              style={{ background: "var(--card)" }}>
              <div className="w-8 h-8 rounded flex items-center justify-center mb-3"
                style={{ background: "rgba(59, 130, 246, 0.12)" }}>
                <f.icon size={15} style={{ color: "var(--primary)" }} />
              </div>
              <div className="font-medium text-foreground text-sm mb-1">{f.title}</div>
              <div className="text-muted-foreground leading-relaxed" style={{ fontSize: 12 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-16 px-6 text-center">
        <h2 className="font-semibold text-foreground mb-3">Ready to Cut Out the Middleman?</h2>
        <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
          Join 1,847 verified trainers already earning 100% of their project value on Trainistry.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-8 py-3 rounded font-medium text-white transition-all hover:opacity-90 inline-flex items-center gap-2"
          style={{ background: "var(--primary)" }}
        >
          Get Started Free <ArrowRight size={15} />
        </button>
      </section>

      <footer className="border-t border-border px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={12} style={{ color: "var(--primary)" }} />
          <span className="text-xs text-muted-foreground">© 2026 Trainistry. All rights reserved.</span>
        </div>
        <span className="text-xs text-muted-foreground mono">Platform-Led · Transparent · Autonomous</span>
      </footer>
    </div>
  );
}
