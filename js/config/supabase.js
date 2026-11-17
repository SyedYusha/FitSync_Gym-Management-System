import { createClient } from
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://qefywsdvnvwyuijomwey.supabase.co/rest/v1/";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_D2IV9xd-oA2fAzHyTUZvlA_wZxzVXKL";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
