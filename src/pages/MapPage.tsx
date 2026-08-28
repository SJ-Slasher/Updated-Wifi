import React, { useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Wifi, Signal } from "lucide-react";
import MapView from "@/components/features/MapView";
import MapFilters from "@/components/features/MapFilters";
import NetworkCard from "@/components/features/NetworkCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { useNetworks } from "@/hooks/useNetworks";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import type { WifiNetwork } from "@/types";

// Bottom sheet heights (mobile)
const PEEK_H = 72;   // collapsed: just the handle bar
const HALF_H = 340;  // half-open: filters + a few cards

export default function MapPage() {
  const { mapFilters } = useApp();
  const navigate = useNavigate();
  const { networks: allNetworks, loading } = useNetworks();

  // Desktop side-panel
  const [listOpen, setListOpen] = useState(true);
  // Mobile bottom-sheet: "peek" | "half" | "full"
  const [sheetState, setSheetState] = useState<"peek" | "half" | "full">("peek");
  const startY = useRef<number | null>(null);

  const filteredNetworks = useMemo(() => {
    return allNetworks.filter((n) => {
      if (mapFilters.category !== "all" && n.location_category !== mapFilters.category) return false;
      if (mapFilters.status !== "all" && n.status !== mapFilters.status) return false;
      if (mapFilters.speed !== "all" && n.internet_speed !== "fast" && n.internet_speed !== "very_fast") return false;
      if (mapFilters.search) {
        const q = mapFilters.search.toLowerCase();
        if (!n.location_name?.toLowerCase().includes(q) && !n.ssid.toLowerCase().includes(q) && !n.location_address?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allNetworks, mapFilters]);

  const handleMarkerClick = useCallback((network: WifiNetwork) => {
    navigate(`/network/${network.id}`);
  }, [navigate]);

  // Swipe-to-expand helpers
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    const dy = startY.current - e.changedTouches[0].clientY; // positive = swipe up
    if (dy > 40) {
      setSheetState((s) => s === "peek" ? "half" : "full");
    } else if (dy < -40) {
      setSheetState((s) => s === "full" ? "half" : "peek");
    }
    startY.current = null;
  };

  const sheetH = sheetState === "peek" ? PEEK_H : sheetState === "half" ? HALF_H : "85dvh";

  const NetworkList = (
    <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
      {loading
        ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        : filteredNetworks.length === 0
        ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Wifi size={28} className="text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No networks found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
          </div>
        )
        : filteredNetworks.map((network) => (
          <NetworkCard key={network.id} network={network} compact />
        ))
      }
    </div>
  );

  return (
    <div className="flex h-full relative">

      {/* ── DESKTOP side panel ──────────────────────────── */}
      <div className={cn(
        "hidden lg:flex flex-shrink-0 border-r border-border bg-card/50 flex-col transition-all duration-300 overflow-hidden",
        listOpen ? "w-80" : "w-0"
      )}>
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-semibold text-sm">Nearby WiFi</h2>
              <p className="text-xs text-muted-foreground">{filteredNetworks.length} locations found</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-400">
              <Signal size={12} />
              <span>{filteredNetworks.filter(n => n.status === "verified").length} verified</span>
            </div>
          </div>
          <MapFilters />
        </div>
        {NetworkList}
      </div>

      {/* Desktop toggle tab */}
      <button
        onClick={() => setListOpen(!listOpen)}
        className="hidden lg:flex absolute top-1/2 z-10 -translate-y-1/2 w-5 h-12 bg-card border border-border rounded-r-lg items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        style={{ left: listOpen ? "320px" : "0px", transition: "left 0.3s" }}
      >
        {listOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* ── MAP (always full area on mobile, partial on desktop) ── */}
      <div className="flex-1 relative">
        <MapView networks={filteredNetworks} onMarkerClick={handleMarkerClick} />
      </div>

      {/* ── MOBILE bottom sheet ─────────────────────────── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[600] flex flex-col bg-card border-t border-border rounded-t-2xl shadow-2xl"
        style={{
          height: typeof sheetH === "number" ? `${sheetH}px` : sheetH,
          transition: "height 0.32s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Drag handle + header */}
        <div
          className="flex-shrink-0 cursor-grab active:cursor-grabbing select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => setSheetState((s) => s === "peek" ? "half" : s === "half" ? "full" : "peek")}
        >
          {/* Pill */}
          <div className="flex justify-center pt-2.5 pb-1">
            <div className="w-9 h-1 bg-border rounded-full" />
          </div>

          {/* Summary row — always visible */}
          <div className="flex items-center justify-between px-4 pb-3 pt-1">
            <div className="flex items-center gap-2">
              <Wifi size={15} className="text-cyan-400" />
              <span className="font-semibold text-sm">Nearby WiFi</span>
              <span className="text-xs text-muted-foreground bg-white/10 px-1.5 py-0.5 rounded-full">
                {filteredNetworks.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-green-400">
                <Signal size={11} />
                <span>{filteredNetworks.filter(n => n.status === "verified").length} verified</span>
              </div>
              {sheetState === "peek"
                ? <ChevronUp size={16} className="text-muted-foreground" />
                : <ChevronDown size={16} className="text-muted-foreground" />}
            </div>
          </div>
        </div>

        {/* Filters + list — only when not peeking */}
        {sheetState !== "peek" && (
          <div className="flex flex-col flex-1 overflow-hidden animate-fade-in">
            <div className="px-3 pb-2 border-b border-border">
              <MapFilters />
            </div>
            {NetworkList}
          </div>
        )}
      </div>
    </div>
  );
}
