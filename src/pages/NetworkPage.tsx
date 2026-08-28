import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, CheckCircle, XCircle, QrCode, MapPin, Clock, Zap, BookmarkPlus, BookmarkCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { getNetworkById, verifyNetwork, reportNetwork } from "@/lib/data";
import { useApp } from "@/context/AppContext";
import { copyToClipboard, formatDate, cn } from "@/lib/utils";
import { SPEED_COLORS, CATEGORY_ICONS } from "@/constants";
import QRModal from "@/components/features/QRModal";
import { updateUserInStorage } from "@/lib/auth";
import type { WifiNetwork } from "@/types";

export default function NetworkPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, addToast, refreshUser } = useApp();
  const [network, setNetwork] = useState<WifiNetwork | undefined>(undefined);
  const [loadingNet, setLoadingNet] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoadingNet(true);
    getNetworkById(id).then((net) => {
      setNetwork(net);
      setLoadingNet(false);
    });
  }, [id]);

  if (loadingNet) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!network) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">Network not found</p>
          <button onClick={() => navigate("/")} className="btn-primary mt-4">Go Back</button>
        </div>
      </div>
    );
  }

  const isSaved = user?.saved_networks?.includes(network.id);

  const handleCopy = async () => {
    await copyToClipboard(network.password);
    addToast("success", "Password copied to clipboard!");
  };

  const handleVerify = async () => {
    if (!user) { addToast("warning", "Please sign in to verify"); return; }
    setVerifying(true);
    const updated = await verifyNetwork(network.id, user.id);
    if (updated) {
      setNetwork(updated);
      addToast("success", "Thanks for verifying! +5 reputation points");
    }
    setVerifying(false);
  };

  const handleReport = async () => {
    if (!user) { addToast("warning", "Please sign in to report"); return; }
    if (!reportReason.trim()) { addToast("error", "Please enter a reason"); return; }
    setReporting(true);
    await reportNetwork(network.id, user.id, reportReason);
    setShowReportForm(false);
    setReportReason("");
    addToast("info", "Report submitted. Thank you!");
    const refreshed = await getNetworkById(network.id);
    if (refreshed) setNetwork(refreshed);
    setReporting(false);
  };

  const handleSave = () => {
    if (!user) { addToast("warning", "Please sign in to save"); return; }
    const saved = user.saved_networks || [];
    const updated = isSaved ? saved.filter((sid) => sid !== network.id) : [...saved, network.id];
    updateUserInStorage({ saved_networks: updated });
    refreshUser();
    addToast("success", isSaved ? "Removed from saved" : "Network saved!");
  };

  const statusStyle = {
    verified: "text-green-400 bg-green-500/10 border-green-500/20",
    partial: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    outdated: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-4 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Header Card */}
      <div className="glass-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 flex-shrink-0 bg-white/5 rounded-xl flex items-center justify-center text-2xl">
              {CATEGORY_ICONS[network.location_category || "cafe"]}
            </div>
            <div>
              <h1 className="font-bold text-xl">{network.location_name}</h1>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <MapPin size={12} />
                <span>{network.location_address}</span>
              </div>
              <div className="mt-2">
                <button onClick={() => navigate(`/location/${network.location_id}`)} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  View all networks at this location →
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className={cn("p-2 rounded-lg transition-colors", isSaved ? "text-cyan-400 bg-cyan-500/10" : "text-muted-foreground hover:text-foreground hover:bg-white/10")}>
              {isSaved ? <BookmarkCheck size={18} /> : <BookmarkPlus size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* WiFi Details */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">WiFi Details</h2>
          <span className={cn("text-xs px-2.5 py-1 rounded-full border capitalize", statusStyle[network.status])}>
            {network.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Network Name (SSID)</p>
            <p className="font-mono font-medium text-cyan-400 text-sm break-all">{network.ssid}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Password</p>
              <button onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>
            <p className="font-mono font-medium text-sm break-all">
              {showPassword ? network.password : "•".repeat(Math.min(network.password.length, 10))}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="bg-white/5 rounded-lg p-2.5 text-center">
            <div className={cn("font-semibold text-sm mb-0.5", SPEED_COLORS[network.internet_speed])}>
              <Zap size={12} className="inline mr-1" />
              {network.internet_speed.replace("_", " ")}
            </div>
            <div>Speed</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5 text-center">
            <div className="font-semibold text-sm text-green-400 mb-0.5">
              <CheckCircle size={12} className="inline mr-1" />
              {network.verified_count}
            </div>
            <div>Verified</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5 text-center">
            <div className="font-semibold text-sm mb-0.5">
              <Clock size={12} className="inline mr-1" />
              {formatDate(network.updated_at)}
            </div>
            <div>Updated</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleCopy} className="flex items-center justify-center gap-2 btn-primary py-2.5">
            <Copy size={15} />
            Copy Password
          </button>
          <button onClick={() => setShowQR(true)} className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-foreground font-semibold px-4 py-2.5 rounded-lg transition-all">
            <QrCode size={15} />
            Scan QR Code
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 font-medium px-4 py-2 rounded-lg transition-all text-sm disabled:opacity-60"
          >
            {verifying ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Still Works ✓
          </button>
          <button
            onClick={() => setShowReportForm(!showReportForm)}
            className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-medium px-4 py-2 rounded-lg transition-all text-sm"
          >
            <XCircle size={14} />
            Report Issue
          </button>
        </div>

        {showReportForm && (
          <div className="border border-red-500/20 rounded-lg p-3 space-y-2 animate-fade-in">
            <p className="text-sm font-medium text-red-400">Report this network</p>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50"
            >
              <option value="">Select reason…</option>
              <option value="wrong_password">Wrong password</option>
              <option value="network_gone">Network no longer exists</option>
              <option value="slow_speed">Very slow / unusable speed</option>
              <option value="fake_entry">Fake / spam entry</option>
            </select>
            <button
              onClick={handleReport}
              disabled={reporting}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-medium py-2 rounded-lg transition-all text-sm disabled:opacity-60"
            >
              {reporting ? "Submitting…" : "Submit Report"}
            </button>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {showQR && (
        <QRModal
          ssid={network.ssid}
          password={network.password}
          locationName={network.location_name || ""}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
