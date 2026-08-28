import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, MapPin, Check, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { KATHMANDU_CENTER, KATHMANDU_ZOOM } from "@/constants";

interface MapPickerProps {
  onConfirm: (lat: number, lng: number, address?: string) => void;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
}

// Animated pulsing pin for the picker
function createPickerPin(dark: boolean) {
  const bg = dark ? "#0f172a" : "#ffffff";
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:48px;height:56px;display:flex;flex-direction:column;align-items:center;">
        <!-- Pulse ring -->
        <div style="
          position:absolute;top:50%;left:50%;
          width:60px;height:60px;
          border-radius:50%;
          background:rgba(6,182,212,0.15);
          border:2px solid rgba(6,182,212,0.4);
          transform:translate(-50%,-60%);
          animation:picker-pulse 1.5s ease-in-out infinite;
        "></div>
        <!-- Pin body -->
        <div style="
          position:relative;z-index:2;
          width:44px;height:44px;
          background:#06b6d4;
          border:3px solid #fff;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 6px 20px rgba(6,182,212,0.6),0 2px 8px rgba(0,0,0,0.3);
          cursor:crosshair;
        ">
          <svg style="transform:rotate(45deg)" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <!-- Stem shadow -->
        <div style="
          position:relative;z-index:1;margin-top:-10px;
          width:14px;height:8px;
          background:rgba(0,0,0,0.2);
          border-radius:50%;
          filter:blur(3px);
        "></div>
      </div>`,
    iconSize: [48, 56],
    iconAnchor: [24, 52],
    popupAnchor: [0, -54],
  });
}

export default function MapPicker({ onConfirm, onClose, initialLat, initialLng }: MapPickerProps) {
  const { darkMode } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [pickedLat, setPickedLat] = useState<number | null>(initialLat || null);
  const [pickedLng, setPickedLng] = useState<number | null>(initialLng || null);
  const [address, setAddress] = useState<string>("");
  const [geocoding, setGeocoding] = useState(false);
  const [hint, setHint] = useState(true);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initLat = initialLat || KATHMANDU_CENTER[1];
    const initLng = initialLng || KATHMANDU_CENTER[0];

    // API-key-free OpenStreetMap basemap.
    const map = L.map(containerRef.current, {
      center: [initLat, initLng],
      zoom: 16,
      zoomControl: false,
      cursor: "crosshair" as any,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // If there's an initial position, place a marker
    if (initialLat && initialLng) {
      const marker = L.marker([initialLat, initialLng], { icon: createPickerPin(darkMode), draggable: true }).addTo(map);
      markerRef.current = marker;
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        setPickedLat(pos.lat);
        setPickedLng(pos.lng);
        reverseGeocode(pos.lat, pos.lng);
      });
    }

    // Click on map to place pin
    map.on("click", (e: L.LeafletMouseEvent) => {
      setHint(false);
      const { lat, lng } = e.latlng;
      setPickedLat(lat);
      setPickedLng(lng);

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], { icon: createPickerPin(darkMode), draggable: true }).addTo(map);
        markerRef.current = marker;
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          setPickedLat(pos.lat);
          setPickedLng(pos.lng);
          reverseGeocode(pos.lat, pos.lng);
        });
      }

      reverseGeocode(lat, lng);
    });

    mapRef.current = map;

    // Inject picker animation keyframes
    const style = document.createElement("style");
    style.id = "picker-styles";
    style.textContent = `
      @keyframes picker-pulse {
        0%, 100% { transform: translate(-50%, -60%) scale(1); opacity: 0.6; }
        50% { transform: translate(-50%, -60%) scale(1.4); opacity: 0; }
      }
      .leaflet-container { cursor: crosshair !important; }
    `;
    document.head.appendChild(style);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      document.getElementById("picker-styles")?.remove();
    };
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
        { headers: { "User-Agent": "WiFiHub-Nepal/1.0" } }
      );
      const data = await res.json();
      if (data?.display_name) {
        // Simplify the address
        const parts = data.display_name.split(", ");
        const simplified = parts.slice(0, 4).join(", ");
        setAddress(simplified);
      }
    } catch {
      setAddress("");
    } finally {
      setGeocoding(false);
    }
  };

  const handleConfirm = () => {
    if (pickedLat !== null && pickedLng !== null) {
      onConfirm(pickedLat, pickedLng, address);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-background animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
          <div>
            <h2 className="font-semibold text-sm">Pin Location on Map</h2>
            <p className="text-xs text-muted-foreground">Click on a building to place your WiFi pin</p>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={pickedLat === null}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-navy-900 font-semibold px-4 py-2 rounded-lg text-sm transition-all active:scale-95"
        >
          <Check size={15} />
          Confirm Pin
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={containerRef} className="w-full h-full" />

        {/* Hint overlay */}
        {hint && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[500]">
            <div className="glass-card px-5 py-3 text-center animate-bounce">
              <MapPin size={20} className="text-cyan-400 mx-auto mb-1" />
              <p className="text-sm font-medium">Click anywhere on the map</p>
              <p className="text-xs text-muted-foreground">to place a WiFi pin</p>
            </div>
          </div>
        )}

        {/* Picked coordinates panel */}
        {pickedLat !== null && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] glass-card px-4 py-3 min-w-[280px] max-w-[360px] shadow-2xl border border-cyan-500/30 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                <MapPin size={14} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                {geocoding ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={12} className="animate-spin" />
                    Getting address…
                  </div>
                ) : address ? (
                  <p className="text-xs text-foreground leading-snug">{address}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Address not available</p>
                )}
                <p className="text-[11px] font-mono text-cyan-400 mt-1">
                  {pickedLat.toFixed(6)}, {pickedLng.toFixed(6)}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">Drag the pin to adjust position</p>
          </div>
        )}
      </div>
    </div>
  );
}
