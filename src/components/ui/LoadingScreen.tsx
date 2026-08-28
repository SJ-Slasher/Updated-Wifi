import React from "react";
import { Wifi } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center animate-pulse">
          <Wifi size={32} className="text-cyan-400" />
        </div>
        <div className="text-lg font-semibold gradient-text">WiFiHub Nepal</div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
