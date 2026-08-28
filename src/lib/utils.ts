import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BADGES } from "@/constants";
import type { Badge, WifiNetwork } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function generateWifiQR(ssid: string, password: string): string {
  return `WIFI:T:WPA;S:${ssid};P:${password};;`;
}

export function getBadgeForPoints(points: number): Badge {
  const sorted = [...BADGES].sort((a, b) => b.threshold - a.threshold);
  const badge = sorted.find((b) => points >= b.threshold);
  return badge || BADGES[0];
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function maskPassword(password: string): string {
  if (password.length <= 4) return "••••";
  return password.slice(0, 2) + "•".repeat(password.length - 4) + password.slice(-2);
}

export function getSpeedMbps(speed: WifiNetwork["internet_speed"]): number {
  switch (speed) {
    case "slow": return 3;
    case "medium": return 15;
    case "fast": return 60;
    case "very_fast": return 150;
    default: return 0;
  }
}

export function scoreToLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) return navigator.clipboard.writeText(text);
  const el = document.createElement("textarea");
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  return Promise.resolve();
}
