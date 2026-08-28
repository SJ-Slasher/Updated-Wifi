import React, { useMemo } from "react";
import { Trophy, Medal, Award } from "lucide-react";
import { getAllNetworksWithLocation } from "@/lib/data";
import { getBadgeForPoints } from "@/lib/utils";
import { BADGES as ALL_BADGES } from "@/constants";

interface LeaderEntry {
  name: string;
  points: number;
  contributions: number;
  badge: ReturnType<typeof getBadgeForPoints>;
}

const DEMO_LEADERS: LeaderEntry[] = [
  { name: "Ramesh Shrestha", points: 680, contributions: 34, badge: getBadgeForPoints(680) },
  { name: "Admin User", points: 1250, contributions: 62, badge: getBadgeForPoints(1250) },
  { name: "Sita Tamang", points: 95, contributions: 5, badge: getBadgeForPoints(95) },
  { name: "Bikash Karki", points: 420, contributions: 21, badge: getBadgeForPoints(420) },
  { name: "Priya Maharjan", points: 310, contributions: 15, badge: getBadgeForPoints(310) },
  { name: "Rajan Thapa", points: 185, contributions: 9, badge: getBadgeForPoints(185) },
  { name: "Anita Gurung", points: 560, contributions: 28, badge: getBadgeForPoints(560) },
  { name: "Suresh Rai", points: 75, contributions: 4, badge: getBadgeForPoints(75) },
].sort((a, b) => b.points - a.points);

export default function LeaderboardPage() {
  const top3 = DEMO_LEADERS.slice(0, 3);
  const rest = DEMO_LEADERS.slice(3);

  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumHeights = ["h-24", "h-32", "h-20"];
  const podiumColors = ["bg-slate-400", "bg-yellow-400", "bg-amber-600"];
  const podiumRanks = [2, 1, 3];

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
          <Trophy size={20} className="text-yellow-400" />
        </div>
        <div>
          <h1 className="font-bold text-xl">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">Top WiFi contributors in Nepal</p>
        </div>
      </div>

      {/* Podium */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-end justify-center gap-4">
          {podiumOrder.map((leader, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="text-2xl">{leader.badge.icon}</div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white">
                {leader.name.charAt(0)}
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold max-w-[80px] truncate">{leader.name.split(" ")[0]}</div>
                <div className="text-xs text-cyan-400">{leader.points} pts</div>
              </div>
              <div className={`w-16 ${podiumHeights[i]} ${podiumColors[i]}/20 border border-current rounded-t-lg flex items-start justify-center pt-2`} style={{ borderColor: `var(--podium-${i})` }}>
                <span className="text-lg font-bold">{podiumRanks[i]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full list */}
      <div className="space-y-2">
        {DEMO_LEADERS.map((leader, idx) => (
          <div key={idx} className="glass-card-hover p-4 flex items-center gap-4">
            <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full font-bold text-sm ${idx === 0 ? "bg-yellow-400 text-navy-900" : idx === 1 ? "bg-slate-300 text-navy-900" : idx === 2 ? "bg-amber-600 text-white" : "bg-white/10 text-muted-foreground"}`}>
              {idx + 1}
            </div>
            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-semibold text-white">
              {leader.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{leader.name}</div>
              <div className="text-xs text-muted-foreground">{leader.badge.icon} {leader.badge.name} · {leader.contributions} networks shared</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-bold text-cyan-400">{leader.points}</div>
              <div className="text-xs text-muted-foreground">points</div>
            </div>
          </div>
        ))}
      </div>

      {/* Badges section */}
      <div className="mt-6">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Award size={16} className="text-cyan-400" /> Badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ALL_BADGES.map((b) => (
            <div key={b.id} className="glass-card p-3 text-center">
              <div className="text-2xl mb-1">{b.icon}</div>
              <div className="text-sm font-semibold">{b.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{b.description}</div>
              <div className="text-xs text-cyan-400 mt-1">{b.threshold}+ pts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
