import { supabase } from "../config/supabase.js";

export function subscribeToGymChanges(gymId, onChange) {
  const channel = supabase
    .channel(`gym-${gymId}-updates`)

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "members",
        filter: `gym_id=eq.${gymId}`
      },
      onChange
    )

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "payments",
        filter: `gym_id=eq.${gymId}`
      },
      onChange
    )

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "attendance",
        filter: `gym_id=eq.${gymId}`
      },
      onChange
    )

    .subscribe((status) => {
      console.log("Realtime status:", status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}