import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, AlertTriangle, Wifi, MapPin, Trash2, CheckCircle, XCircle, BarChart3, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getReportsForAdmin, resolveReport, deleteNetwork, deleteLocation, getAllLocations, getAllNetworksWithLocation } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import type { Location, WifiNetwork, Report } from "@/types";

export default function AdminPage() {
  const { user, addToast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "reports" | "locations" | "networks">("overview");
  const [reports, setReports] = useState<Report[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [reps, locs, nets] = await Promise.all([
      getReportsForAdmin(),
      getAllLocations(),
      getAllNetworksWithLocation(),
    ]);
    setReports(reps);
    setLocations(locs);
    setNetworks(nets);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Shield size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold">Access Denied</p>
          <p className="text-muted-foreground text-sm mt-1">Admin access required</p>
          <button onClick={() => navigate("/")} className="btn-primary mt-4">Go Home</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  const pendingReports = reports.filter((r) => r.status === "pending");
  const verifiedNetworks = networks.filter((n) => n.status === "verified");
  const outdatedNetworks = networks.filter((n) => n.status === "outdated");

  const handleResolveReport = async (id: string, status: "resolved" | "dismissed") => {
    await resolveReport(id, status);
    await loadData();
    addToast("success", status === "resolved" ? "Report resolved" : "Report dismissed");
  };

  const handleDeleteNetwork = async (id: string) => {
    if (!confirm("Delete this network?")) return;
    await deleteNetwork(id);
    await loadData();
    addToast("success", "Network deleted");
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm("Delete this location and all its networks?")) return;
    await deleteLocation(id);
    await loadData();
    addToast("success", "Location deleted");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="font-bold text-xl">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage WiFiHub Nepal</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Locations", value: locations.length, icon: MapPin, color: "text-blue-400" },
          { label: "WiFi Networks", value: networks.length, icon: Wifi, color: "text-cyan-400" },
          { label: "Pending Reports", value: pendingReports.length, icon: AlertTriangle, color: "text-yellow-400" },
          { label: "Outdated Networks", value: outdatedNetworks.length, icon: XCircle, color: "text-red-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4">
            <Icon size={18} className={`${color} mb-2`} />
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-4">
        {[
          { id: "overview", label: "Overview" },
          { id: "reports", label: `Reports (${pendingReports.length})` },
          { id: "locations", label: "Locations" },
          { id: "networks", label: "Networks" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === id ? "border-cyan-500 text-cyan-400" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><BarChart3 size={14} className="text-cyan-400" /> Network Health</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Verified</span>
                <span className="text-green-400 font-medium">{verifiedNetworks.length}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: networks.length ? `${(verifiedNetworks.length / networks.length) * 100}%` : "0%" }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Outdated</span>
                <span className="text-red-400 font-medium">{outdatedNetworks.length}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: networks.length ? `${(outdatedNetworks.length / networks.length) * 100}%` : "0%" }} />
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={() => setActiveTab("reports")} className="w-full text-left text-sm p-2.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors">
                ⚠️ Review {pendingReports.length} pending reports
              </button>
              <button onClick={() => setActiveTab("networks")} className="w-full text-left text-sm p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                🗑️ Clean up {outdatedNetworks.length} outdated networks
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="space-y-2">
          {pendingReports.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <CheckCircle size={28} className="text-green-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No pending reports</p>
            </div>
          ) : pendingReports.map((r) => (
            <div key={r.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">Report</span>
                    <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.reason.replace("_", " ")}</p>
                  <p className="text-xs text-muted-foreground mt-1">Network ID: {r.wifi_id}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleResolveReport(r.id, "resolved")} className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors" title="Resolve">
                    <CheckCircle size={16} />
                  </button>
                  <button onClick={() => handleResolveReport(r.id, "dismissed")} className="p-1.5 text-muted-foreground hover:bg-white/10 rounded-lg transition-colors" title="Dismiss">
                    <XCircle size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "locations" && (
        <div className="space-y-2">
          {locations.map((loc) => (
            <div key={loc.id} className="glass-card p-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{loc.name}</div>
                <div className="text-xs text-muted-foreground">{loc.address} · {loc.category} · {loc.wifi_networks?.length || 0} networks</div>
              </div>
              <button onClick={() => handleDeleteLocation(loc.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "networks" && (
        <div className="space-y-2">
          {networks.map((net) => (
            <div key={net.id} className="glass-card p-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-cyan-400">{net.ssid}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${net.status === "verified" ? "bg-green-500/10 text-green-400" : net.status === "outdated" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                    {net.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">{net.location_name} · {net.verified_count} verified · {net.reported_count} reported</div>
              </div>
              <button onClick={() => handleDeleteNetwork(net.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
