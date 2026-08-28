import React from "react";
import { useNavigate } from "react-router-dom";
import { Wifi, MapPin, CheckCircle, AlertTriangle, XCircle, Zap, Copy, BookmarkPlus, BookmarkCheck } from "lucide-react";
import type { WifiNetwork } from "@/types";
import { cn, formatDate, maskPassword, copyToClipboard } from "@/lib/utils";
import { SPEED_COLORS, SPEED_LABELS, CATEGORY_ICONS } from "@/constants";
import { useApp } from "@/context/AppContext";
import { updateUserInStorage } from "@/lib/auth";

const STATUS_ICONS = {
  verified: CheckCircle,
  partial: AlertTriangle,
  outdated: XCircle,
};

const STATUS_STYLES = {
  verified: "text-green-400",
  partial: "text-yellow-400",
  outdated: "text-red-400",
};

interface NetworkCardProps {
  network: WifiNetwork;
  compact?: boolean;
}

export default function NetworkCard({ network, compact }: NetworkCardProps) {
  const navigate = useNavigate();
  const { user, addToast, refreshUser } = useApp();
  const StatusIcon = STATUS_ICONS[network.status];
  const isSaved = user?.saved_networks?.includes(network.id);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyToClipboard(network.password);
    addToast("success", `Password copied: ${network.ssid}`);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      addToast("warning", "Please sign in to save networks");
      return;
    }
    const saved = user.saved_networks || [];
    const updated = isSaved ? saved.filter((id) => id !== network.id) : [...saved, network.id];
    updateUserInStorage({ saved_networks: updated });
    refreshUser();
    addToast("success", isSaved ? "Removed from saved" : "Network saved!");
  };

  return (
    <div
      onClick={() => navigate(`/network/${network.id}`)}
      className="glass-card-hover p-4 cursor-pointer group animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 flex-shrink-0 bg-white/5 rounded-lg flex items-center justify-center text-lg">
            {CATEGORY_ICONS[network.location_category || "cafe"]}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{network.location_name}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin size={10} />
              <span className="truncate">{network.location_address}</span>
            </div>
          </div>
        </div>
        <div className={cn("flex items-center gap-1 flex-shrink-0 text-xs", STATUS_STYLES[network.status])}>
          <StatusIcon size={12} />
          <span className="capitalize hidden sm:block">{network.status}</span>
        </div>
      </div>

      {/* SSID */}
      <div className="bg-white/5 rounded-lg px-3 py-2 mb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] text-muted-foreground mb-0.5">SSID</div>
            <div className="text-sm font-mono font-medium text-cyan-400 truncate">{network.ssid}</div>
          </div>
          {!compact && (
            <div className="min-w-0">
              <div className="text-[10px] text-muted-foreground mb-0.5 text-right">Password</div>
              <div className="text-sm font-mono text-muted-foreground">{maskPassword(network.password)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className={cn("flex items-center gap-1", SPEED_COLORS[network.internet_speed])}>
            <Zap size={10} />
            <span>{network.internet_speed.replace("_", " ")}</span>
          </span>
          <span className="flex items-center gap-1 text-green-400">
            <CheckCircle size={10} />
            <span>{network.verified_count}</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleSave}
            className={cn("p-1.5 rounded transition-colors", isSaved ? "text-cyan-400" : "hover:text-cyan-400")}
          >
            {isSaved ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:text-cyan-400 transition-colors"
          >
            <Copy size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
