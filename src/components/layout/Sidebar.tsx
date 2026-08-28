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

      {/* ── Desktop sidebar: always-visible icon rail, expands to full on toggle ── */}
      <aside className={cn(
        "hidden lg:flex flex-col h-full border-r border-border bg-card transition-all duration-300 overflow-hidden flex-shrink-0",
        sidebarOpen ? "w-56" : "w-[60px]"
      )}>
        {/* Logo */}
        <div className={cn(
          "flex items-center border-b border-border h-14 flex-shrink-0 px-3",
          sidebarOpen ? "gap-3 justify-between" : "justify-center"
        )}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Wifi size={15} className="text-navy-900" />
            </div>
            {sidebarOpen && (
              <div className="animate-fade-in min-w-0">
                <div className="font-bold text-sm gradient-text">WiFiHub</div>
                <div className="text-[10px] text-muted-foreground leading-none">Nepal</div>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <ChevronRight size={12} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto scrollbar-thin">
          {allNavItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={!sidebarOpen ? label : undefined}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-all relative group",
                "text-muted-foreground hover:text-foreground hover:bg-white/10",
                isActive && "bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/20",
                !sidebarOpen && "justify-center px-0"
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate animate-fade-in">{label}</span>}
              {/* Tooltip when collapsed */}
              {!sidebarOpen && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-border px-2 py-3 space-y-1">
          {isAuthenticated && user ? (
            <>
              {sidebarOpen && (
                <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg animate-fade-in">
                  <div className="w-7 h-7 flex-shrink-0 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-semibold text-white">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate">{user.full_name}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <span>{getBadgeForPoints(user.reputation_points).icon}</span>
                      <span>{user.reputation_points} pts</span>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                title={!sidebarOpen ? "Log Out" : undefined}
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg px-2 py-2.5 text-sm font-medium transition-all group relative",
                  "text-muted-foreground hover:text-red-400 hover:bg-red-500/10",
                  !sidebarOpen && "justify-center px-0"
                )}
              >
                <LogOut size={16} className="flex-shrink-0" />
                {sidebarOpen && <span className="animate-fade-in">Log Out</span>}
                {!sidebarOpen && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                    Log Out
                  </span>
                )}
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              title={!sidebarOpen ? "Sign In" : undefined}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-all relative group",
                "text-muted-foreground hover:text-foreground hover:bg-white/10",
                isActive && "text-cyan-400",
                !sidebarOpen && "justify-center px-0"
              )}
            >
              <LogIn size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="animate-fade-in">Sign In</span>}
              {!sidebarOpen && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                  Sign In
                </span>
              )}
            </NavLink>
          )}
        </div>
      </aside>

      {/* ── Mobile slide-in drawer (only when open) ── */}
      <aside className={cn(
        "lg:hidden fixed top-0 left-0 h-full w-64 z-[40] flex flex-col bg-card border-r border-border transition-transform duration-300 shadow-2xl",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile drawer header */}
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
