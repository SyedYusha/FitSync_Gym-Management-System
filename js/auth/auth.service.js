import { supabase } from "../config/supabase.js";

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  window.location.replace("/login.html");
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user; // returns null instead of throwing when logged out
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")   // ← gym_id removed
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}