import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Wifi, Signal } from "lucide-react";
import MapView from "@/components/features/MapView";
import MapFilters from "@/components/features/MapFilters";
import NetworkCard from "@/components/features/NetworkCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { useNetworks } from "@/hooks/useNetworks";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import type { WifiNetwork } from "@/types";

export default function MapPage() {
  const { mapFilters } = useApp();
  const navigate = useNavigate();
  const { networks: allNetworks, loading } = useNetworks();

  // Desktop side-panel
  const [listOpen, setListOpen] = useState(true);

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
    </div>
  );
}
