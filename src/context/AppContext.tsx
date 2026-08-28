import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User, Toast, MapFilters } from "@/types";
import { supabase } from "@/lib/supabase";
import { mapSupabaseUser, signOut, updateUserInStorage, DARK_MODE_KEY } from "@/lib/auth";
import { generateId } from "@/lib/utils";

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  darkMode: boolean;
  toasts: Toast[];
  mapFilters: MapFilters;
  sidebarOpen: boolean;
  selectedNetworkId: string | null;
  authLoading: boolean;
  logout: () => Promise<void>;
  toggleDarkMode: () => void;
  addToast: (type: Toast["type"], message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  setMapFilters: (filters: Partial<MapFilters>) => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedNetworkId: (id: string | null) => void;
  refreshUser: () => void;
  setUser: (user: User | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(null);
  const [mapFilters, setMapFiltersState] = useState<MapFilters>({
    category: "all",
    status: "all",
    speed: "all",
    openNow: false,
    search: "",
  });

  // Dark mode init
  useEffect(() => {
    const savedDark = localStorage.getItem(DARK_MODE_KEY);
    const isDark = savedDark === null ? true : savedDark === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
  }, []);

  // Supabase auth state
  useEffect(() => {
    let mounted = true;

    // Safety #1: existing session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session?.user) setUser(mapSupabaseUser(session.user));
      if (mounted) setAuthLoading(false);
    });

    // Safety #2: listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_IN" && session?.user) {
        setUser(mapSupabaseUser(session.user));
        setAuthLoading(false);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setAuthLoading(false);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(mapSupabaseUser(session.user));
      } else if (event === "USER_UPDATED" && session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem(DARK_MODE_KEY, String(next));
      if (next) {
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.add("light");
      }
      return next;
    });
  }, []);

  const addToast = useCallback((type: Toast["type"], message: string, duration = 4000) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setMapFilters = useCallback((filters: Partial<MapFilters>) => {
    setMapFiltersState((prev) => ({ ...prev, ...filters }));
  }, []);

  const refreshUser = useCallback(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(mapSupabaseUser(data.user));
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        authLoading,
        darkMode,
        toasts,
        mapFilters,
        sidebarOpen,
        selectedNetworkId,
        logout: handleLogout,
        toggleDarkMode,
        addToast,
        removeToast,
        setMapFilters,
        setSidebarOpen,
        setSelectedNetworkId,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
