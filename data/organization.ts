// hooks/useOrganizations.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Organization } from "@/app/types";

export interface OrganizationWithCoords {
  id: string;
  location_lat: number;
  location_lng: number;
}

export const organization: OrganizationWithCoords[] = [];

export const fetchOrganizations = async () => {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("status", "active");

  if (error) {
    console.error("Error fetching organizations:", error.message);

    return;
  }

  const processed = (data || []).map((org) => ({
    id: org.id,
    location_lat: org.coverage.center.lat,
    location_lng: org.coverage.center.lng,
  }));
  organization.splice(0, organization.length, ...processed); // Modify array in place
  // console.log("Organizations array populated:", otganization);
  // return otganization;
};
