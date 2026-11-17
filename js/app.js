import { supabase } from "./config/supabase.js";

async function testConnection() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Supabase error:", error.message);
    return;
  }

  console.log("Supabase connected.");
  console.log("Session:", data.session);
}

testConnection();