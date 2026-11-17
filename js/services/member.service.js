import { supabase } from "../config/supabase.js";

export async function getMembers() {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function createMember(member) {
  const { data, error } = await supabase
    .from("members")
    .insert({
      gym_id: member.gym_id,
      full_name: member.full_name,
      email: member.email,
      phone: member.phone
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateMember(id, updates) {
  const { data, error } = await supabase
    .from("members")
    .update({
      full_name: updates.full_name,
      phone: updates.phone,
      status: updates.status
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}