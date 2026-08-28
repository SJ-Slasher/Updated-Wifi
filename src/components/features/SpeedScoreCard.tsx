import React from "react";
import { Zap, Activity, Shield, Laptop } from "lucide-react";
import { scoreToLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ScoreBarProps {
  label: string;
  score: number;
  icon: React.ElementType;
  color: string;
}

function ScoreBar({ label, score, icon: Icon, color }: ScoreBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Icon size={12} />
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("font-medium", color)}>{scoreToLabel(score)}</span>
          <span className="text-muted-foreground">{score}/100</span>
        </div>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color.includes("green") ? "bg-green-500" : color.includes("cyan") ? "bg-cyan-500" : color.includes("yellow") ? "bg-yellow-500" : "bg-blue-500")}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

interface SpeedScoreCardProps {
  speed_score?: number;
  stability_score?: number;
  reliability_score?: number;
  work_friendly_score?: number;
}

export default function SpeedScoreCard({ speed_score = 0, stability_score = 0, reliability_score = 0, work_friendly_score = 0 }: SpeedScoreCardProps) {
  const overall = Math.round((speed_score + stability_score + reliability_score + work_friendly_score) / 4);

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Internet Quality</h4>
        <div className="flex items-center gap-2">
          <div className={cn("text-2xl font-bold", overall >= 80 ? "text-cyan-400" : overall >= 60 ? "text-green-400" : overall >= 40 ? "text-yellow-400" : "text-red-400")}>
            {overall}
          </div>
          <div className="text-xs text-muted-foreground">/100</div>
        </div>
      </div>
      <div className="space-y-3">
        <ScoreBar label="Speed" score={speed_score} icon={Zap} color={speed_score >= 70 ? "text-cyan-400" : speed_score >= 50 ? "text-yellow-400" : "text-red-400"} />
        <ScoreBar label="Stability" score={stability_score} icon={Activity} color={stability_score >= 70 ? "text-green-400" : stability_score >= 50 ? "text-yellow-400" : "text-red-400"} />
        <ScoreBar label="Reliability" score={reliability_score} icon={Shield} color={reliability_score >= 70 ? "text-blue-400" : reliability_score >= 50 ? "text-yellow-400" : "text-red-400"} />
        <ScoreBar label="Work-Friendly" score={work_friendly_score} icon={Laptop} color={work_friendly_score >= 70 ? "text-purple-400" : work_friendly_score >= 50 ? "text-yellow-400" : "text-red-400"} />
      </div>
    </div>
  );
}
