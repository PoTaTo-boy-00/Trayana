// hooks/useOrganizations.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Organization } from "@/app/types";

export interface ResourceWithCoords {
  id: string;
  location_lat: number;
  location_lng: number;
}

export const resource: ResourceWithCoords[] = [];

export const fetchResources = async () => {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("status", "available");

  if (error) {
    console.error("Error fetching organizations:", error.message);

    return;
  }

  const processed = (data || []).map((res) => ({
    id: res.id,
    location_lat: res.location?.lat,
    location_lng: res.location?.lng,
  }));
  resource.splice(0, resource.length, ...processed); // Modify array in place
  // console.log("Organizations array populated:", otganization);
  // return otganization;
};
