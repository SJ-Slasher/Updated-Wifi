import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wifi, Award, Bookmark, Edit2, Save, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { updateUserInStorage } from "@/lib/auth";
import { getAllNetworksWithLocation } from "@/lib/data";
import { getBadgeForPoints } from "@/lib/utils";
import { BADGES } from "@/constants";
import NetworkCard from "@/components/features/NetworkCard";
import type { WifiNetwork } from "@/types";

export default function ProfilePage() {
  const { user, isAuthenticated, addToast, refreshUser } = useApp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.full_name || "");
  const [activeTab, setActiveTab] = useState<"networks" | "saved" | "badges">("networks");
  const [allNetworks, setAllNetworks] = useState<WifiNetwork[]>([]);
  const [loadingNets, setLoadingNets] = useState(true);

  useEffect(() => {
    getAllNetworksWithLocation().then((nets) => {
      setAllNetworks(nets);
      setLoadingNets(false);
    });
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view your profile</p>
          <button onClick={() => navigate("/login")} className="btn-primary">Sign In</button>
        </div>
      </div>
    );
  }

  const badge = getBadgeForPoints(user.reputation_points);
  const nextBadge = BADGES.find((b) => b.threshold > user.reputation_points);
  const myNetworks = allNetworks.filter((n) => n.uploaded_by === user.id);
  const savedNetworks = allNetworks.filter((n) => user.saved_networks?.includes(n.id));

  const handleSave = async () => {
    if (!editName.trim()) { addToast("error", "Name cannot be empty"); return; }
    await updateUserInStorage({ full_name: editName });
    refreshUser();
    setEditing(false);
    addToast("success", "Profile updated!");
  };

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-4 animate-fade-in">
      {/* Profile Card */}
      <div className="glass-card p-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 flex-shrink-0 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 flex-1 min-w-0"
                />
                <button onClick={handleSave} className="p-1.5 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors">
                  <Save size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-xl truncate">{user.full_name}</h1>
                <button onClick={() => setEditing(true)} className="p-1 text-muted-foreground hover:text-foreground flex-shrink-0">
                  <Edit2 size={14} />
                </button>
              </div>
            )}
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            <div className="flex items-center flex-wrap gap-2 mt-2">
              <span className="text-sm flex items-center gap-1">
                <span>{badge.icon}</span>
                <span className="text-cyan-400 font-medium">{badge.name}</span>
              </span>
              <span className="text-xs text-muted-foreground capitalize bg-white/5 px-2 py-0.5 rounded-full">
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-xl font-bold text-cyan-400">{user.reputation_points}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Reputation</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{loadingNets ? "…" : myNetworks.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Shared</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{loadingNets ? "…" : savedNetworks.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Saved</div>
          </div>
        </div>

        {/* Progress to next badge */}
        {nextBadge && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Next: {nextBadge.icon} {nextBadge.name}</span>
              <span>{user.reputation_points}/{nextBadge.threshold} pts</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min((user.reputation_points / nextBadge.threshold) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto scrollbar-thin">
        {[
          { id: "networks", label: "My Networks", icon: Wifi },
          { id: "saved", label: "Saved", icon: Bookmark },
          { id: "badges", label: "Badges", icon: Award },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex-shrink-0 ${
              activeTab === id ? "border-cyan-500 text-cyan-400" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {loadingNets ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-cyan-400" />
        </div>
      ) : (
        <>
          {activeTab === "networks" && (
            <div className="space-y-2">
              {myNetworks.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Wifi size={28} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No networks shared yet</p>
                  <button onClick={() => navigate("/add-wifi")} className="btn-primary mt-3 text-sm">
                    Share Your First WiFi
                  </button>
                </div>
              ) : myNetworks.map((n) => <NetworkCard key={n.id} network={n} />)}
            </div>
          )}

          {activeTab === "saved" && (
            <div className="space-y-2">
              {savedNetworks.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Bookmark size={28} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No saved networks yet</p>
                </div>
              ) : savedNetworks.map((n) => <NetworkCard key={n.id} network={n} />)}
            </div>
          )}

          {activeTab === "badges" && (
            <div className="grid grid-cols-2 gap-3">
              {BADGES.map((b) => {
                const unlocked = user.reputation_points >= b.threshold;
                return (
                  <div key={b.id} className={`glass-card p-4 ${!unlocked ? "opacity-40" : ""}`}>
                    <div className="text-3xl mb-2">{b.icon}</div>
                    <div className="font-semibold text-sm">{b.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{b.description}</div>
                    <div className="text-xs mt-2">
                      {unlocked ? (
                        <span className="text-green-400">✓ Unlocked</span>
                      ) : (
                        <span className="text-muted-foreground">{b.threshold} pts required</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
