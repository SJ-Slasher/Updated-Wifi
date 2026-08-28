import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Wifi, Map, Plus, User, Shield, Trophy, LogOut, LogIn, ChevronRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { getBadgeForPoints } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Map, label: "Explore Map", end: true },
  { to: "/add-wifi", icon: Plus, label: "Add WiFi", end: false },
  { to: "/leaderboard", icon: Trophy, label: "Leaderboard", end: false },
];

// ── Desktop sidebar (icon rail that expands on hover/toggle) ─────────────────
export default function Sidebar() {
  const { user, isAuthenticated, logout, sidebarOpen, setSidebarOpen, addToast } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    addToast("info", "Logged out successfully");
    navigate("/login");
  };

  const allNavItems = [
    ...navItems,
    ...(isAuthenticated ? [{ to: "/profile", icon: User, label: "Profile", end: false }] : []),
    ...(user?.role === "admin" ? [{ to: "/admin", icon: Shield, label: "Admin Panel", end: false }] : []),
  ];

  return (
    <>
      {/* ── Mobile overlay backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[39] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Slide-in navigation drawer (hidden by default, opens on menu click) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[39]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-[40] flex w-[82vw] max-w-[320px] flex-col bg-card border-r border-border transition-transform duration-300 shadow-2xl",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border flex-shrink-0">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Wifi size={15} className="text-navy-900" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm gradient-text">WiFiHub</div>
            <div className="text-[10px] text-muted-foreground">Nepal</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-white/10"
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {allNavItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all",
                "text-muted-foreground hover:text-foreground hover:bg-white/10",
                isActive && "bg-cyan-500/15 text-cyan-400"
              )}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3 space-y-1">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-semibold text-white">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{user.full_name}</div>
                  <div className="text-xs text-muted-foreground">{getBadgeForPoints(user.reputation_points).icon} {user.reputation_points} pts</div>
                </div>
              </div>
              <button
                onClick={() => { handleLogout(); setSidebarOpen(false); }}
                className="flex items-center gap-3 w-full rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
            >
              <LogIn size={18} />
              <span>Sign In</span>
            </NavLink>
          )}
        </div>
      </aside>
    </>
  );
}
