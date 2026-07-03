import { useState, useEffect } from "react";
import { Search, ShieldCheck, ShieldOff, AlertTriangle, Filter } from "lucide-react";
import { apiClient } from "../../utils/apiClient";

export function UserManagement() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient("/admin/users");
        if (res.success && res.data) {
          setUsers(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  const handleVerify = async (userId: string) => {
    // Optimistic UI
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: true } : u));
    try {
      await apiClient(`/admin/users/${userId}/verify`, { method: "POST" });
    } catch (e) {
      console.error(e);
      // Revert would go here
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    // Optimistic UI
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus.toLowerCase() } : u));
    try {
      await apiClient(`/admin/users/${userId}/status`, { method: "POST", bodyData: { status: newStatus } });
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || u.type === typeFilter;
    return matchSearch && matchType;
  });

  const statusConfig = {
    active: { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Active" },
    flagged: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Flagged" },
    suspended: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "Suspended" },
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center flex-1 max-w-xs">
          <Search size={12} className="absolute left-2.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full bg-card border border-border rounded pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          {["all", "trainer", "company"].map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className="px-3 py-1.5 rounded text-xs border capitalize"
              style={typeFilter === t
                ? { background: "var(--primary)", borderColor: "var(--primary)", color: "#fff" }
                : { background: "var(--card)", borderColor: "var(--border)", color: "var(--muted-foreground)" }
              }>
              {t}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} users</span>
      </div>

      {/* Table */}
      <div className="rounded border border-border overflow-hidden" style={{ background: "var(--card)" }}>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border" style={{ background: "var(--secondary)" }}>
              {["User", "Type", "Status", "Rating", "Projects", "Joined", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-muted-foreground font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((u) => {
              const sc = statusConfig[u.status as keyof typeof statusConfig];
              return (
                <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ background: u.type === "trainer" ? "#3b82f6" : "#10b981" }}>
                        {u.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1 font-medium text-foreground">
                          {u.name}
                          {u.verified && <ShieldCheck size={9} className="text-primary" />}
                        </div>
                        <div className="text-muted-foreground" style={{ fontSize: 10 }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{u.type}</td>
                  <td className="px-4 py-3">
                    <span className="px-1.5 py-0.5 rounded mono" style={{ background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 mono text-foreground">{u.rating}/5</td>
                  <td className="px-4 py-3 mono text-foreground">{u.projects}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.joined}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {!u.verified && (
                        <button onClick={() => handleVerify(u.id)} className="px-2 py-1 rounded text-[10px] transition-opacity hover:opacity-80"
                          style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                          Verify
                        </button>
                      )}
                      {u.status !== "suspended" ? (
                        <button onClick={() => handleStatusChange(u.id, "SUSPENDED")} className="px-2 py-1 rounded text-[10px] border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors">
                          Suspend
                        </button>
                      ) : (
                        <button onClick={() => handleStatusChange(u.id, "ACTIVE")} className="px-2 py-1 rounded text-[10px] transition-opacity hover:opacity-80"
                          style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6" }}>
                          Reinstate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
