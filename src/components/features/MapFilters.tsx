import React from "react";
import { Filter, Zap, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/constants";
import { cn } from "@/lib/utils";
import type { FilterCategory } from "@/types";

const CATEGORIES: FilterCategory[] = ["all", "cafe", "restaurant", "hotel", "coworking", "library", "public"];

export default function MapFilters() {
  const { mapFilters, setMapFilters } = useApp();

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
      {/* Category filters */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setMapFilters({ category: cat })}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 whitespace-nowrap flex-shrink-0",
              mapFilters.category === cat
                ? "bg-cyan-500 text-navy-900"
                : "glass-card hover:bg-white/10 text-muted-foreground hover:text-foreground"
            )}
          >
            <span>{CATEGORY_ICONS[cat]}</span>
            <span>{CATEGORY_LABELS[cat]}</span>
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-border flex-shrink-0" />

      {/* Status filters */}
      <button
        onClick={() => setMapFilters({ status: mapFilters.status === "verified" ? "all" : "verified" })}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0",
          mapFilters.status === "verified"
            ? "bg-green-500/20 text-green-400 border border-green-500/30"
            : "glass-card text-muted-foreground hover:text-foreground"
        )}
      >
        <CheckCircle size={12} />
        <span>Verified Only</span>
      </button>

      {/* Speed filter */}
      <button
        onClick={() => setMapFilters({ speed: mapFilters.speed === "all" ? "fast" : "all" })}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0",
          mapFilters.speed !== "all"
            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
            : "glass-card text-muted-foreground hover:text-foreground"
        )}
      >
        <Zap size={12} />
        <span>Fast Internet</span>
      </button>
    </div>
  );
}
