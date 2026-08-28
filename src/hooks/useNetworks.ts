import { useState, useEffect, useMemo, useCallback } from "react";
import { getAllNetworksWithLocation, getAllLocations } from "@/lib/data";
import type { WifiNetwork, Location, MapFilters } from "@/types";

export function useNetworks(filters?: Partial<MapFilters>) {
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [nets, locs] = await Promise.all([
      getAllNetworksWithLocation(),
      getAllLocations(),
    ]);
    setNetworks(nets);
    setLocations(locs);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredNetworks = useMemo(() => {
    if (!filters) return networks;
    return networks.filter((n) => {
      if (filters.category && filters.category !== "all" && n.location_category !== filters.category) return false;
      if (filters.status && filters.status !== "all" && n.status !== filters.status) return false;
      if (filters.speed && filters.speed !== "all" && n.internet_speed !== "fast" && n.internet_speed !== "very_fast") return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!n.location_name?.toLowerCase().includes(q) && !n.ssid.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [networks, filters]);

  return { networks: filteredNetworks, allNetworks: networks, locations, loading, refresh: load };
}
