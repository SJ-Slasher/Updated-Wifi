export const NEPAL_CENTER: [number, number] = [84.124, 28.3949];
export const NEPAL_ZOOM = 6.5;
export const KATHMANDU_CENTER: [number, number] = [85.324, 27.7172];
export const KATHMANDU_ZOOM = 12;

export const CATEGORY_LABELS: Record<string, string> = {
  cafe: "Café",
  restaurant: "Restaurant",
  hotel: "Hotel",
  coworking: "Coworking",
  library: "Library",
  public: "Public Space",
  all: "All Places",
};

export const CATEGORY_ICONS: Record<string, string> = {
  cafe: "☕",
  restaurant: "🍽️",
  hotel: "🏨",
  coworking: "💻",
  library: "📚",
  public: "🌐",
  all: "📍",
};

export const SPEED_LABELS: Record<string, string> = {
  slow: "Slow (<5 Mbps)",
  medium: "Medium (5–25 Mbps)",
  fast: "Fast (25–100 Mbps)",
  very_fast: "Very Fast (>100 Mbps)",
};

export const SPEED_COLORS: Record<string, string> = {
  slow: "text-red-400",
  medium: "text-yellow-400",
  fast: "text-green-400",
  very_fast: "text-cyan-400",
};

export const STATUS_COLORS: Record<string, string> = {
  verified: "#22c55e",
  partial: "#eab308",
  outdated: "#ef4444",
};

export const BADGES = [
  { id: "newcomer", name: "Newcomer", description: "Welcome to WiFiHub!", icon: "🌟", threshold: 0 },
  { id: "contributor", name: "Contributor", description: "Added 5+ WiFi spots", icon: "📡", threshold: 50 },
  { id: "helper", name: "Helper", description: "Verified 20+ networks", icon: "✅", threshold: 150 },
  { id: "expert", name: "WiFi Expert", description: "Earned 500 reputation points", icon: "🏆", threshold: 500 },
  { id: "legend", name: "Legend", description: "Top contributor in Nepal", icon: "⚡", threshold: 1000 },
];

export const JWT_KEY = "wifihub_token";
export const USER_KEY = "wifihub_user";
export const DARK_MODE_KEY = "wifihub_dark";
export const SAVED_NETWORKS_KEY = "wifihub_saved";
