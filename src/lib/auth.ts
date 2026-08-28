import { supabase } from "@/lib/supabase";
import type { User } from "@/types";

export const DARK_MODE_KEY = "wifihub_dark";

// Map Supabase auth user → app User (sync, no DB query)
export function mapSupabaseUser(sbUser: any): User {
  const meta = sbUser.user_metadata || {};
  return {
    id: sbUser.id,
    full_name: meta.full_name || meta.username || sbUser.email?.split("@")[0] || "User",
    email: sbUser.email!,
    avatar: meta.avatar_url,
    role: meta.role || "user",
    reputation_points: meta.reputation_points || 10,
    created_at: sbUser.created_at,
    saved_networks: meta.saved_networks || [],
  };
}

// ── OTP ───────────────────────────────────────────────────────────────────────

export async function sendOtp(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}

export async function verifyOtpAndSetPassword(
  email: string,
  token: string,
  password: string,
  full_name: string
): Promise<User> {
  const { error: otpErr } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (otpErr) throw otpErr;

  const { data: updateData, error: updateErr } = await supabase.auth.updateUser({
    password,
    data: { full_name, username: full_name, role: "user", reputation_points: 10, saved_networks: [] },
  });
  if (updateErr) throw updateErr;
  return mapSupabaseUser(updateData.user);
}

// ── Password sign-in ──────────────────────────────────────────────────────────

export async function signInWithPassword(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return mapSupabaseUser(data.user);
}

// ── Sign out ──────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// ── Update user metadata ──────────────────────────────────────────────────────

export async function updateUserInStorage(updates: Partial<User>): Promise<void> {
  await supabase.auth.updateUser({ data: updates });
}
