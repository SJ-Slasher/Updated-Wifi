import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Wifi, MapPin, Lock, Zap, QrCode, Building, Map } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { addLocation, addNetwork, getLocationById } from "@/lib/data";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/constants";
import type { LocationCategory, Location } from "@/types";
import MapPicker from "@/components/features/MapPicker";

const CATEGORIES: LocationCategory[] = ["cafe", "restaurant", "hotel", "coworking", "library", "public"];
const SPEEDS = ["slow", "medium", "fast", "very_fast"] as const;

export default function AddWifiPage() {
  const { user, isAuthenticated, addToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const existingLocationId = searchParams.get("location");

  const [step, setStep] = useState<"location" | "wifi">(existingLocationId ? "wifi" : "location");
  const [locationId, setLocationId] = useState(existingLocationId || "");
  const [submitting, setSubmitting] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [existingLocation, setExistingLocation] = useState<Location | undefined>(undefined);

  useEffect(() => {
    if (existingLocationId) {
      getLocationById(existingLocationId).then(setExistingLocation);
    }
  }, [existingLocationId]);

  const [locForm, setLocForm] = useState({
    name: "",
    address: "",
    latitude: "27.7172",
    longitude: "85.3240",
    category: "cafe" as LocationCategory,
  });
  const [pinSet, setPinSet] = useState(false);

  const [wifiForm, setWifiForm] = useState({
    ssid: "",
    password: "",
    internet_speed: "medium" as (typeof SPEEDS)[number],
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center animate-fade-in">
        <Wifi size={40} className="text-cyan-400 mx-auto mb-4" />
        <h2 className="font-bold text-xl mb-2">Sign in to contribute</h2>
        <p className="text-muted-foreground mb-4">You need to be logged in to add WiFi networks.</p>
        <button onClick={() => navigate("/login")} className="btn-primary">Sign In</button>
      </div>
    );
  }

  const handleMapPickerConfirm = (lat: number, lng: number, address?: string) => {
    setLocForm((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
      address: address && !prev.address ? address : prev.address,
    }));
    setPinSet(true);
    setShowMapPicker(false);
    addToast("success", "Location pinned on map!");
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locForm.name.trim() || (!locForm.address.trim() && !pinSet)) {
      addToast("error", "Please provide a name and either an address or pin the location on the map");
      return;
    }
    addToast("info", "Submitting location...");
    setSubmitting(true);
    try {
      const loc = await addLocation({
        name: locForm.name,
        address: locForm.address,
        latitude: parseFloat(locForm.latitude),
        longitude: parseFloat(locForm.longitude),
        category: locForm.category,
        created_by: user!.id,
      });
      setLocationId(loc.id);
      setStep("wifi");
      addToast("success", "Location added!");
    } catch (err: any) {
      console.error("addLocation failed:", err);
      addToast("error", err?.message || "Failed to add location");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWifiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wifiForm.ssid.trim() || !wifiForm.password.trim()) {
      addToast("error", "SSID and password are required");
      return;
    }
    setSubmitting(true);
    addToast("info", "Sharing WiFi network...");
    try {
      await addNetwork({
        location_id: locationId,
        ssid: wifiForm.ssid,
        password: wifiForm.password,
        internet_speed: wifiForm.internet_speed,
        uploaded_by: user!.id,
        speed_score: 50,
        stability_score: 50,
        reliability_score: 50,
        work_friendly_score: 50,
      });
      addToast("success", "WiFi network added! +20 reputation points 🎉");
      navigate("/");
    } catch (err: any) {
      console.error("addNetwork failed:", err);
      addToast("error", err?.message || "Failed to add WiFi network");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Full-screen map picker */}
      {showMapPicker && (
        <MapPicker
          onConfirm={handleMapPickerConfirm}
          onClose={() => setShowMapPicker(false)}
          initialLat={parseFloat(locForm.latitude)}
          initialLng={parseFloat(locForm.longitude)}
        />
      )}

      <div className="max-w-lg mx-auto p-4 lg:p-6 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-4"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="mb-6">
          <h1 className="font-bold text-2xl gradient-text">Share WiFi</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Help the community by sharing a verified WiFi network
          </p>
        </div>

        {/* Step indicator */}
        {!existingLocationId && (
          <div className="flex items-center gap-3 mb-6">
            {["location", "wifi"].map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className={`flex items-center gap-2 text-sm font-medium ${
                    step === s
                      ? "text-cyan-400"
                      : i < ["location", "wifi"].indexOf(step)
                      ? "text-green-400"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      step === s
                        ? "bg-cyan-500 text-navy-900"
                        : i < ["location", "wifi"].indexOf(step)
                        ? "bg-green-500 text-white"
                        : "bg-white/10"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="capitalize">{s}</span>
                </div>
                {i === 0 && <div className="flex-1 h-px bg-border" />}
              </React.Fragment>
            ))}
          </div>
        )}

        {step === "location" && !existingLocationId ? (
          <form onSubmit={handleLocationSubmit} className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Building size={16} className="text-cyan-400" />
              <h2 className="font-semibold">Location Details</h2>
            </div>

            {/* Map Pin Button — primary CTA */}
            <button
              type="button"
              onClick={() => setShowMapPicker(true)}
              className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border-2 transition-all font-semibold text-sm ${
                pinSet
                  ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/15"
                  : "bg-cyan-500 border-cyan-500 text-navy-900 hover:bg-cyan-400 active:scale-[0.98]"
              }`}
            >
              {pinSet ? (
                <>
                  <MapPin size={16} className="text-cyan-400" />
                  Pin Set ({parseFloat(locForm.latitude).toFixed(4)}, {parseFloat(locForm.longitude).toFixed(4)}) — Edit
                </>
              ) : (
                <>
                  <Map size={16} />
                  📍 Pick Location on Map
                </>
              )}
            </button>

            {pinSet && (
              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-cyan-400 flex items-center gap-2 animate-fade-in">
                <MapPin size={12} />
                <span>
                  Coordinates: {parseFloat(locForm.latitude).toFixed(6)},{" "}
                  {parseFloat(locForm.longitude).toFixed(6)}
                </span>
              </div>
            )}

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Place Name *</label>
              <input
                type="text"
                placeholder="e.g. Himalayan Java Coffee"
                value={locForm.name}
                onChange={(e) => setLocForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Address *</label>
              <input
                type="text"
                placeholder="e.g. Thamel, Kathmandu"
                value={locForm.address}
                onChange={(e) => setLocForm((p) => ({ ...p, address: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                required={!pinSet}
              />
              {!pinSet && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  💡 Use "Pick Location on Map" to auto-fill address and get exact coordinates
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setLocForm((p) => ({ ...p, category: cat }))}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                      locForm.category === cat
                        ? "bg-cyan-500 text-navy-900"
                        : "bg-secondary hover:bg-white/10 text-muted-foreground"
                    }`}
                  >
                    <span>{CATEGORY_ICONS[cat]}</span>
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual coordinate fields (collapsed by default if pin is set) */}
            {!pinSet && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={locForm.latitude}
                    onChange={(e) => setLocForm((p) => ({ ...p, latitude: e.target.value }))}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={locForm.longitude}
                    onChange={(e) => setLocForm((p) => ({ ...p, longitude: e.target.value }))}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              </div>
            )}

            <button type="submit" className="w-full btn-primary py-2.5">
              Continue to WiFi Details →
            </button>
          </form>
        ) : (
          <form onSubmit={handleWifiSubmit} className="space-y-4">
            {(existingLocation || locationId) && (
              <div className="glass-card p-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                  <MapPin size={16} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">{existingLocation?.name || "New Location"}</p>
                  <p className="text-xs text-muted-foreground">{existingLocation?.address}</p>
                </div>
              </div>
            )}

            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Wifi size={16} className="text-cyan-400" />
                <h2 className="font-semibold">WiFi Details</h2>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">
                  Network Name (SSID) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. CafeGuest_2.4G"
                  value={wifiForm.ssid}
                  onChange={(e) => setWifiForm((p) => ({ ...p, ssid: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Password *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="WiFi password"
                    value={wifiForm.password}
                    onChange={(e) => setWifiForm((p) => ({ ...p, password: e.target.value }))}
                    className="w-full bg-secondary border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">
                  Internet Speed
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SPEEDS.map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => setWifiForm((p) => ({ ...p, internet_speed: speed }))}
                      className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                        wifiForm.internet_speed === speed
                          ? "bg-cyan-500 text-navy-900"
                          : "bg-secondary hover:bg-white/10 text-muted-foreground"
                      }`}
                    >
                      {speed === "very_fast"
                        ? "🚀 Very Fast (100+)"
                        : speed === "fast"
                        ? "⚡ Fast (25–100)"
                        : speed === "medium"
                        ? "🚶 Medium (5–25)"
                        : "🐢 Slow (<5 Mbps)"}
                    </button>
                  ))}
                </div>
              </div>

              {wifiForm.ssid && wifiForm.password && (
                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1">
                    <QrCode size={12} />
                    QR Preview
                  </div>
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    WIFI:T:WPA;S:{wifiForm.ssid};P:{wifiForm.password};;
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Sharing…" : "Share WiFi Network 🎉"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
