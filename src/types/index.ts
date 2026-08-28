export type UserRole = "admin" | "user" | "verified_contributor";

export interface User {
  id: string;
  full_name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  reputation_points: number;
  created_at: string;
  saved_networks?: string[];
}

export type LocationCategory =
  | "cafe"
  | "restaurant"
  | "hotel"
  | "coworking"
  | "library"
  | "public";

export type WifiStatus = "verified" | "partial" | "outdated";

export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: LocationCategory;
  created_by: string;
  created_at: string;
  wifi_networks?: WifiNetwork[];
  avg_rating?: number;
  review_count?: number;
}

export interface WifiNetwork {
  id: string;
  location_id: string;
  location_name?: string;
  location_address?: string;
  location_category?: LocationCategory;
  latitude?: number;
  longitude?: number;
  ssid: string;
  password: string;
  qr_code?: string;
  internet_speed: "slow" | "medium" | "fast" | "very_fast";
  verified_count: number;
  reported_count: number;
  status: WifiStatus;
  uploaded_by: string;
  uploader_name?: string;
  updated_at: string;
  speed_score?: number;
  stability_score?: number;
  reliability_score?: number;
  work_friendly_score?: number;
}

export interface VerificationLog {
  id: string;
  wifi_id: string;
  user_id: string;
  status: "verified" | "reported";
  created_at: string;
}

export interface Report {
  id: string;
  wifi_id: string;
  reported_by: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
}

export interface Review {
  id: string;
  location_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  threshold: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  avatar?: string;
  reputation_points: number;
  contributions: number;
  badge?: Badge;
}

export type FilterCategory = "all" | LocationCategory;

export interface MapFilters {
  category: FilterCategory;
  status: "all" | WifiStatus;
  speed: "all" | "fast" | "very_fast";
  openNow: boolean;
  search: string;
}
