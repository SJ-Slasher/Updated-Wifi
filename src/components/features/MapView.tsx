import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { KATHMANDU_CENTER, KATHMANDU_ZOOM, STATUS_COLORS, CATEGORY_ICONS } from "@/constants";
import { useApp } from "@/context/AppContext";
import type { WifiNetwork } from "@/types";

interface MapViewProps {
  networks: WifiNetwork[];
  onMarkerClick: (network: WifiNetwork) => void;
}

// Google Maps–style teardrop pin with inner icon
function createMarkerIcon(color: string, emoji: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:42px;height:52px;display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35));">
        <!-- Outer glow ring -->
        <div style="
          position:absolute;top:0;left:50%;
          width:50px;height:50px;
          background:${color}22;
          border-radius:50%;
          transform:translateX(-50%);
          pointer-events:none;
        "></div>
        <!-- Pin teardrop -->
        <div style="
          position:relative;z-index:2;
          width:42px;height:42px;
          background:${color};
          border:3px solid rgba(255,255,255,0.9);
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 10px ${color}80;
          cursor:pointer;
          transition:transform 0.15s;
        ">
          <span style="
            transform:rotate(45deg);
            font-size:17px;
            line-height:1;
            display:flex;align-items:center;justify-content:center;
            width:100%;height:100%;
          ">${emoji}</span>
        </div>
        <!-- Pin tip shadow -->
        <div style="
          width:12px;height:6px;
          background:rgba(0,0,0,0.25);
          border-radius:50%;
          filter:blur(2px);
          margin-top:-2px;
          position:relative;z-index:1;
        "></div>
      </div>`,
    iconSize: [42, 52],
    iconAnchor: [21, 50],
    popupAnchor: [0, -52],
  });
}

// Compact info popup matching Google Maps style
function buildPopup(network: WifiNetwork, color: string, emoji: string): string {
  const statusLabel = network.status.charAt(0).toUpperCase() + network.status.slice(1);
  const speedEmoji = { slow: "🐢", medium: "🚶", fast: "⚡", very_fast: "🚀" }[network.internet_speed] || "📶";
  return `
    <div style="font-family:Inter,sans-serif;width:230px;">
      <!-- Header -->
      <div style="display:flex;align-items:flex-start;gap:10px;padding:12px 14px 8px;">
        <div style="
          width:36px;height:36px;flex-shrink:0;
          background:${color}22;border:1.5px solid ${color}44;
          border-radius:10px;display:flex;align-items:center;justify-content:center;
          font-size:18px;line-height:1;
        ">${emoji}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:13.5px;line-height:1.3;color:inherit;">${network.location_name || "Unknown"}</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${network.location_address || ""}</div>
        </div>
      </div>
      <!-- Divider -->
      <div style="height:1px;background:rgba(255,255,255,0.07);margin:0 14px;"></div>
      <!-- WiFi Row -->
      <div style="padding:8px 14px;display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:11px;color:#64748b;width:36px;flex-shrink:0;">SSID</span>
          <span style="font-size:12px;font-weight:600;color:#22d3ee;font-family:'JetBrains Mono',monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${network.ssid}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:5px;">
            <span style="width:7px;height:7px;border-radius:50%;background:${color};flex-shrink:0;display:inline-block;box-shadow:0 0 4px ${color};"></span>
            <span style="font-size:11px;color:#94a3b8;">${statusLabel}</span>
          </div>
          <div style="font-size:11px;color:#94a3b8;">${speedEmoji} ${network.internet_speed.replace("_", " ")}</div>
          <div style="font-size:11px;color:#22c55e;">✓ ${network.verified_count}</div>
        </div>
      </div>
      <!-- CTA -->
      <div style="padding:0 14px 12px;">
        <div
          data-network-id="${network.id}"
          style="
            background:${color}18;border:1px solid ${color}33;
            border-radius:8px;padding:7px;
            text-align:center;font-size:11.5px;font-weight:600;
            color:${color};cursor:pointer;letter-spacing:0.02em;
            user-select:none;
          "
        >View Password &amp; QR Code →</div>
      </div>
    </div>`;
}

export default function MapView({ networks, onMarkerClick }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { darkMode } = useApp();

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // API-key-free OpenStreetMap basemap.
    // No CARTO/Mapbox/Google API key is required for the map itself.
    const tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    const map = L.map(containerRef.current, {
      center: [KATHMANDU_CENTER[1], KATHMANDU_CENTER[0]],
      zoom: 14,
      zoomControl: false,
      preferCanvas: false,
    });

    L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;

    // ── Event delegation: handle popup CTA button clicks ──
    containerRef.current.addEventListener("click", (e: Event) => {
      const target = e.target as HTMLElement;
      const btn = target.closest<HTMLElement>("[data-network-id]");
      if (btn) {
        const networkId = btn.getAttribute("data-network-id");
        if (networkId) {
          // We fire a custom event with the id so the parent can navigate
          containerRef.current?.dispatchEvent(
            new CustomEvent("wifihub:navigate", { detail: { networkId }, bubbles: true })
          );
        }
      }
    });

    // ── Geolocation: find user, drop a "You are here" pin, fly to them ──
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const m = mapRef.current;
          if (!m) return;

          // Pulsing blue dot icon (Google Maps style)
          const userIcon = L.divIcon({
            className: "",
            html: `
              <div style="position:relative;width:28px;height:28px;">
                <div style="
                  position:absolute;inset:0;
                  background:rgba(59,130,246,0.18);
                  border-radius:50%;
                  animation:user-pulse 2s ease-in-out infinite;
                "></div>
                <div style="
                  position:absolute;inset:6px;
                  background:#3b82f6;
                  border:3px solid #fff;
                  border-radius:50%;
                  box-shadow:0 2px 8px rgba(59,130,246,0.7);
                "></div>
              </div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -16],
          });

          // Accuracy circle
          L.circle([latitude, longitude], {
            radius: accuracy,
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.06,
            weight: 1,
            dashArray: "4 4",
          }).addTo(m);

          L.marker([latitude, longitude], { icon: userIcon, zIndexOffset: 2000 })
            .bindPopup(
              `<div style="font-family:Inter,sans-serif;padding:8px 12px;text-align:center;">
                <div style="font-weight:700;font-size:13px;color:#3b82f6;">📍 You are here</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:4px;">Accuracy ±${Math.round(accuracy)}m</div>
              </div>`,
              { className: "wifihub-popup", closeButton: false }
            )
            .addTo(m)
            .openPopup();

          // Fly to user location at street zoom
          m.flyTo([latitude, longitude], 16, { duration: 1.6 });

          // Inject pulse keyframe once
          if (!document.getElementById("user-loc-styles")) {
            const style = document.createElement("style");
            style.id = "user-loc-styles";
            style.textContent = `
              @keyframes user-pulse {
                0%,100% { transform:scale(1); opacity:0.5; }
                50% { transform:scale(2.2); opacity:0; }
              }`;
            document.head.appendChild(style);
          }
        },
        () => { /* permission denied or unavailable — silently ignore */ },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // The API-key-free OSM basemap stays the same when the UI theme changes.
  // This avoids recreating/removing the tile layer and avoids any CARTO dependency.

  // Wire up navigation from popup CTA
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = (e: Event) => {
      const customEvt = e as CustomEvent<{ networkId: string }>;
      const net = networks.find((n) => n.id === customEvt.detail.networkId);
      if (net) onMarkerClick(net);
    };
    container.addEventListener("wifihub:navigate", handler);
    return () => container.removeEventListener("wifihub:navigate", handler);
  }, [networks, onMarkerClick]);

  // Render markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    networks.forEach((network) => {
      if (!network.latitude || !network.longitude) return;

      const color = STATUS_COLORS[network.status] || "#22c55e";
      const emoji = CATEGORY_ICONS[network.location_category || "cafe"];
      const icon = createMarkerIcon(color, emoji);

      const marker = L.marker([network.latitude, network.longitude], { icon })
        .bindPopup(buildPopup(network, color, emoji), {
          maxWidth: 248,
          className: "wifihub-popup",
          closeButton: true,
          autoPanPadding: [40, 40],
        })
        .addTo(map);

      // Open popup on hover, navigate on click
      marker.on("mouseover", () => marker.openPopup());
      marker.on("click", () => onMarkerClick(network));

      // Hover scale effect via DOM
      marker.on("mouseover", () => {
        const el = marker.getElement();
        if (el) el.style.zIndex = "1000";
      });
      marker.on("mouseout", () => {
        const el = marker.getElement();
        if (el) el.style.zIndex = "";
      });

      markersRef.current.push(marker);
    });
  }, [networks, darkMode, onMarkerClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-20 left-4 z-[500] glass-card px-3 py-2.5 text-xs space-y-1.5 pointer-events-none shadow-xl">
        <p className="text-muted-foreground font-semibold text-[11px] uppercase tracking-wide mb-1.5">WiFi Status</p>
        {[
          { color: "#22c55e", label: "Verified" },
          { color: "#eab308", label: "Partial" },
          { color: "#ef4444", label: "Outdated" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm" style={{ background: color, boxShadow: `0 0 5px ${color}80` }} />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
