import React from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { Plus, User, LogIn, Menu, Sun, Moon, Search, Wifi } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useApp } from "@/context/AppContext";


export default function Layout() {
  const { user, isAuthenticated, sidebarOpen, setSidebarOpen, darkMode, toggleDarkMode, setMapFilters, mapFilters } = useApp();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar (icon-rail or expanded) */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">

        {/* ── Top bar ── */}
        <header className="flex items-center gap-2 px-3 h-14 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10 flex-shrink-0">
          {/* Hamburger — mobile: opens drawer; desktop: toggles sidebar expand */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-card/90 text-foreground shadow-sm hover:bg-card transition-colors flex-shrink-0"
            aria-label="Toggle navigation"
          >
            <Menu size={20} strokeWidth={2.5} />
          </button>

          {/* Logo — mobile only */}
          <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 bg-cyan-500 rounded-md flex items-center justify-center">
              <Wifi size={13} className="text-navy-900" />
            </div>
            <span className="font-bold text-sm gradient-text">WiFiHub</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-auto relative hidden sm:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search cafés, hotels, locations…"
              value={mapFilters.search}
              onChange={(e) => setMapFilters({ search: e.target.value })}
              className="w-full bg-secondary/60 border border-border rounded-lg pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
            />
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {isAuthenticated && (
              <button
                onClick={() => navigate("/add-wifi")}
                className="hidden sm:flex items-center gap-1.5 btn-primary text-xs py-1.5 px-3"
              >
                <Plus size={13} />
                Add WiFi
              </button>
            )}
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => navigate("/login")}
                className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
              >
                <LogIn size={13} />
                Sign In
              </button>
            )}
            {isAuthenticated && user && (
              <NavLink to="/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
                {user.full_name.charAt(0).toUpperCase()}
              </NavLink>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
