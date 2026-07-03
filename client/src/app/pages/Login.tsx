import { useState } from "react";
import { useNavigate } from "react-router";
import { Zap, Briefcase, Building2, ShieldCheck, ArrowRight, ChevronLeft } from "lucide-react";
import { useApp, Role } from "../context/AppContext";
import { apiClient } from "../utils/apiClient";

const ROLES = [
  {
    id: "trainer" as Role,
    icon: Briefcase,
    label: "Trainer",
    desc: "I'm a specialist trainer seeking projects from universities and institutions.",
    color: "#3b82f6",
    demo: { email: "arjun.mehta@example.com", name: "Arjun Mehta" },
  },
  {
    id: "company" as Role,
    icon: Building2,
    label: "Company / Institution",
    desc: "We post training projects and hire qualified specialist trainers.",
    color: "#10b981",
    demo: { email: "training@lntedutech.com", name: "L&T EduTech" },
  },
  {
    id: "admin" as Role,
    icon: ShieldCheck,
    label: "Admin",
    desc: "Platform oversight, dispute resolution, and verification management.",
    color: "#f59e0b",
    demo: { email: "admin@trainistry.io", name: "Platform Admin" },
  },
];

export function Login() {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [step, setStep] = useState<"role" | "auth" | "register">("role");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { setRole, setAuthenticated, loginSession } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelect = (r: Role) => {
    setSelectedRole(r);
    if (!isRegisterMode) {
      setEmail("");
      setPassword("");
      setStep("auth");
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setStep("register");
    }
    setError("");
  };

  const handleRegister = async () => {
    if (!selectedRole || !email || !password || !name) return;
    setIsSubmitting(true);
    setError("");
    
    try {
      const response = await apiClient('/auth/register', {
        method: 'POST',
        bodyData: { name, email, password, role: selectedRole.toUpperCase() }
      });
      
      if (!response.success) throw new Error(response.error?.message || "Registration failed.");
      
      await loginSession({ email, password });
      
      const routes: Record<NonNullable<Role>, string> = {
        trainer: "/trainer/dashboard",
        company: "/company/dashboard",
        admin: "/admin/dashboard",
      };
      navigate(routes[selectedRole as NonNullable<Role>]);
    } catch (err: any) {
      setError(err.message || "Registration failed.");
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    if (!selectedRole || !email || !password) return;
    setIsSubmitting(true);
    setError("");
    
    try {
      await loginSession({ email, password });
      
      const routes: Record<NonNullable<Role>, string> = {
        trainer: "/trainer/dashboard",
        company: "/company/dashboard",
        admin: "/admin/dashboard",
      };
      navigate(routes[selectedRole as NonNullable<Role>]);
    } catch (err: any) {
      setError(err.message || "Invalid credentials provided.");
      setIsSubmitting(false);
    }
  };

  const demoUser = ROLES.find((r) => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: "var(--primary)" }}>
            <Zap size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-foreground text-lg tracking-tight">Trainistry</span>
        </div>

        <div className="rounded border border-border overflow-hidden" style={{ background: "var(--card)" }}>
          {step === "role" ? (
            <div className="p-6">
              <h2 className="font-semibold text-foreground mb-1">{isRegisterMode ? "Create an account" : "Welcome back"}</h2>
              <p className="text-muted-foreground text-sm mb-6">Select your account type to continue.</p>

              <div className="space-y-3">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleRoleSelect(r.id)}
                    className="w-full flex items-start gap-3 p-4 rounded border border-border hover:border-primary/50 transition-all text-left group"
                    style={{ background: "var(--background)" }}
                  >
                    <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${r.color}18` }}>
                      <r.icon size={15} style={{ color: r.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-sm flex items-center gap-2">
                        {r.label}
                        <ArrowRight size={11} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="text-muted-foreground mt-0.5" style={{ fontSize: 12 }}>{r.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border text-center">
                <span className="text-xs text-muted-foreground">{isRegisterMode ? "Already have an account? " : "New to Trainistry? "}</span>
                <button onClick={() => setIsRegisterMode(!isRegisterMode)} className="text-xs text-primary hover:underline">{isRegisterMode ? "Sign in instead" : "Create an account"}</button>
              </div>
            </div>
          ) : step === "register" ? (
            <div className="p-6">
              <button
                onClick={() => setStep("role")}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs mb-5 transition-colors"
              >
                <ChevronLeft size={12} /> Back
              </button>

              <div className="flex items-center gap-2 mb-5">
                {demoUser && (
                  <div className="w-7 h-7 rounded flex items-center justify-center"
                    style={{ background: `${demoUser.color}18` }}>
                    <demoUser.icon size={13} style={{ color: demoUser.color }} />
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-foreground text-sm">Register as {demoUser?.label}</h2>
                  <p className="text-muted-foreground" style={{ fontSize: 11 }}>Create your digital profile</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Full Name / Company Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 text-xs text-red-500 text-center font-medium">
                  {error}
                </div>
              )}

              <button
                onClick={handleRegister}
                disabled={isSubmitting}
                className={`w-full py-2.5 rounded font-medium text-sm text-white transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
                style={{ background: "var(--primary)" }}
              >
                {isSubmitting ? "Creating account..." : "Register Now"} {!isSubmitting && <ArrowRight size={14} />}
              </button>
            </div>
          ) : (
            <div className="p-6">
              <button
                onClick={() => setStep("role")}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs mb-5 transition-colors"
              >
                <ChevronLeft size={12} /> Back
              </button>

              <div className="flex items-center gap-2 mb-5">
                {demoUser && (
                  <div className="w-7 h-7 rounded flex items-center justify-center"
                    style={{ background: `${demoUser.color}18` }}>
                    <demoUser.icon size={13} style={{ color: demoUser.color }} />
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-foreground text-sm">Sign in as {demoUser?.label}</h2>
                  <p className="text-muted-foreground" style={{ fontSize: 11 }}>Enter your credentials to continue</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 text-xs text-red-500 text-center font-medium">
                  {error}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={isSubmitting}
                className={`w-full py-2.5 rounded font-medium text-sm text-white transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
                style={{ background: "var(--primary)" }}
              >
                {isSubmitting ? "Authenticating..." : "Enter Platform"} {!isSubmitting && <ArrowRight size={14} />}
              </button>


            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Secured by JWT · OTP verification · RBAC
        </p>
      </div>
    </div>
  );
}
