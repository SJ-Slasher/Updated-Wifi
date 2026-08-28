import { supabase } from "@/lib/supabase";
import type { Location, WifiNetwork, Review, Report } from "@/types";

// ─── Type helpers ──────────────────────────────────────────────────────────────

function rowToLocation(row: any): Location {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    category: row.category,
    created_by: row.created_by,
    created_at: row.created_at,
    wifi_networks: row.wifi_networks ? row.wifi_networks.map(rowToNetwork) : undefined,
    avg_rating: row.avg_rating,
    review_count: row.review_count,
  };
}

function rowToNetwork(row: any): WifiNetwork {
  return {
    id: row.id,
    location_id: row.location_id,
    location_name: row.locations?.name ?? row.location_name,
    location_address: row.locations?.address ?? row.location_address,
    location_category: row.locations?.category ?? row.location_category,
    latitude: row.locations?.latitude ?? row.latitude,
    longitude: row.locations?.longitude ?? row.longitude,
    ssid: row.ssid,
    password: row.password,
    internet_speed: row.internet_speed,
    verified_count: row.verified_count,
    reported_count: row.reported_count,
    status: row.status,
    uploaded_by: row.uploaded_by,
    updated_at: row.updated_at,
    speed_score: row.speed_score,
    stability_score: row.stability_score,
    reliability_score: row.reliability_score,
    work_friendly_score: row.work_friendly_score,
  };
}

// ─── Locations ────────────────────────────────────────────────────────────────

export async function getAllLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from("locations")
    .select("*, wifi_networks(*)")
    .order("created_at", { ascending: false });
  if (error) { console.error("getAllLocations:", error); return []; }
  return (data || []).map(rowToLocation);
}

export async function getLocationById(id: string): Promise<Location | undefined> {
  const { data, error } = await supabase
    .from("locations")
    .select("*, wifi_networks(*)")
    .eq("id", id)
    .single();
  if (error || !data) return undefined;
  return rowToLocation(data);
}

export async function addLocation(loc: Omit<Location, "id" | "created_at">): Promise<Location> {
  const { data, error } = await supabase
    .from("locations")
    .insert(loc)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToLocation(data);
}

export async function deleteLocation(locationId: string): Promise<void> {
  await supabase.from("locations").delete().eq("id", locationId);
}

// ─── WiFi Networks ────────────────────────────────────────────────────────────

export async function getAllNetworksWithLocation(): Promise<WifiNetwork[]> {
  const { data, error } = await supabase
    .from("wifi_networks")
    .select("*, locations(name, address, category, latitude, longitude)")
    .order("updated_at", { ascending: false });
  if (error) { console.error("getAllNetworks:", error); return []; }
  return (data || []).map(rowToNetwork);
}

export async function getNetworkById(id: string): Promise<WifiNetwork | undefined> {
  const { data, error } = await supabase
    .from("wifi_networks")
    .select("*, locations(name, address, category, latitude, longitude)")
    .eq("id", id)
    .single();
  if (error || !data) return undefined;
  return rowToNetwork(data);
}

export async function addNetwork(
  net: Omit<WifiNetwork, "id" | "updated_at" | "verified_count" | "reported_count" | "status" | "location_name" | "location_address" | "location_category" | "latitude" | "longitude" | "uploader_name">
): Promise<WifiNetwork> {
  const payload: any = {
    location_id: net.location_id,
    ssid: net.ssid,
    password: net.password,
    internet_speed: net.internet_speed,
    uploaded_by: net.uploaded_by,
    speed_score: net.speed_score ?? 50,
    stability_score: net.stability_score ?? 50,
    reliability_score: net.reliability_score ?? 50,
    work_friendly_score: net.work_friendly_score ?? 50,
  };

  const { data, error } = await supabase
    .from("wifi_networks")
    .insert(payload)
    .select("*, locations(name, address, category, latitude, longitude)")
    .single();

  if (error) throw new Error(error.message);
  return rowToNetwork(data);
}

export async function updateNetwork(id: string, updates: Partial<WifiNetwork>): Promise<WifiNetwork | null> {
  const { data, error } = await supabase
    .from("wifi_networks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, locations(name, address, category, latitude, longitude)")
    .single();
  if (error) return null;
  return rowToNetwork(data);
}

export async function verifyNetwork(networkId: string, userId: string): Promise<WifiNetwork | null> {
  const { data: net, error: fetchErr } = await supabase
    .from("wifi_networks")
    .select("verified_count")
    .eq("id", networkId)
    .single();
  if (fetchErr || !net) return null;

  const newCount = net.verified_count + 1;
  const newStatus = newCount >= 10 ? "verified" : "partial";

  const { data, error } = await supabase
    .from("wifi_networks")
    .update({ verified_count: newCount, status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", networkId)
    .select("*, locations(name, address, category, latitude, longitude)")
    .single();
  if (error) return null;

  await supabase.from("verification_logs").insert({ wifi_id: networkId, user_id: userId, status: "verified" });
  return rowToNetwork(data);
}

export async function reportNetwork(networkId: string, userId: string, reason: string): Promise<Report> {
  const { data: net } = await supabase.from("wifi_networks").select("reported_count").eq("id", networkId).single();
  if (net) {
    const newCount = net.reported_count + 1;
    await supabase.from("wifi_networks").update({
      reported_count: newCount,
      ...(newCount >= 5 ? { status: "outdated" } : {}),
      updated_at: new Date().toISOString(),
    }).eq("id", networkId);
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({ wifi_id: networkId, reported_by: userId, reason, status: "pending" })
    .select()
    .single();
  if (error) throw error;
  return data as Report;
}

export async function deleteNetwork(networkId: string): Promise<void> {
  await supabase.from("wifi_networks").delete().eq("id", networkId);
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function addReview(rev: Omit<Review, "id" | "created_at">): Promise<Review> {
  const { data, error } = await supabase.from("reviews").insert({ ...rev }).select().single();
  if (error) throw error;
  return data as Review;
}

export async function getReviewsForLocation(locationId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("location_id", locationId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data || []) as Review[];
}

// ─── Reports (admin) ──────────────────────────────────────────────────────────

export async function getReportsForAdmin(): Promise<Report[]> {
  const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return (data || []) as Report[];
}

export async function resolveReport(reportId: string, status: "resolved" | "dismissed"): Promise<void> {
  await supabase.from("reports").update({ status }).eq("id", reportId);
}

// ─── No-op legacy ─────────────────────────────────────────────────────────────
export function seedDataIfNeeded(): void {}
