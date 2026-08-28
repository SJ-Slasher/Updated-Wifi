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
  const [mobileListOpen, setMobileListOpen] = useState(false);

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

        <button
          onClick={() => setMobileListOpen((prev) => !prev)}
          className="lg:hidden absolute left-4 top-3 z-[1000] flex items-center gap-2 rounded-xl border border-cyan-400/60 bg-slate-950/95 px-3.5 py-2.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/20 backdrop-blur-md"
        >
          <Wifi size={15} className="text-cyan-400" />
          <span>Nearby WiFi</span>
          <span className="rounded-full bg-cyan-500/15 px-1.5 py-0.5 text-[10px] text-cyan-300">
            {filteredNetworks.length}
          </span>
        </button>

        {mobileListOpen && (
          <div className="lg:hidden fixed inset-y-0 left-0 z-[500] w-[82vw] max-w-[330px] bg-card/95 border-r border-border shadow-2xl backdrop-blur-md transition-transform duration-300">
            <div className="flex items-center justify-between border-b border-border px-3 py-3">
              <div className="flex items-center gap-2">
                <Wifi size={15} className="text-cyan-400" />
                <div>
                  <div className="text-sm font-semibold">Nearby WiFi</div>
                  <div className="text-[10px] text-muted-foreground">{filteredNetworks.length} locations found</div>
                </div>
              </div>
              <button
                onClick={() => setMobileListOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 text-muted-foreground"
                aria-label="Close nearby WiFi"
              >
                ×
              </button>
            </div>

            <div className="border-b border-border px-3 py-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Networks</span>
                <span className="flex items-center gap-1 text-green-400">
                  <Signal size={11} />
                  {filteredNetworks.filter((n) => n.status === "verified").length} verified
                </span>
              </div>
              <div className="mt-2">
                <MapFilters />
              </div>
            </div>

            <div className="h-[calc(100%-120px)] overflow-hidden">{NetworkList}</div>
          </div>
        )}

        {mobileListOpen && (
          <button
            aria-label="Close nearby wifi list"
            onClick={() => setMobileListOpen(false)}
            className="lg:hidden fixed inset-0 z-[450] bg-black/30"
          />
        )}
      </div>
    </div>
  );
}
