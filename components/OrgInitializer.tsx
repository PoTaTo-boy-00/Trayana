"use client";

import { useEffect } from "react";
import { useOrgStore } from "@/store/orgStore";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export function OrgInitializer() {
  const setOrganizationId = useOrgStore((state) => state.setOrganizationId);

  useEffect(() => {
    const fetchOrg = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("organizations") // adjust based on your table
        .select("id")
        .eq("admin_id", user.id)
        .single();

      if (error) {
        console.error("Failed to fetch org ID", error);
        return;
      }

      if (data?.id) {
        setOrganizationId(data.id);
      }
    };

    fetchOrg();
  }, []);

  return null; // just for setup
}
