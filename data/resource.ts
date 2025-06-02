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
export const reqResource: ResourceWithCoords[] = [];

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

export const fetchReqResources = async () => {
  const { data, error } = await supabase
    .from("requestresources")
    .select("*")
    .eq("status", "requested");

  if (error) {
    console.error("Error fetching requested resources:", error.message);
    return;
  }
  const processed = (data || []).map((req) => {
    return {
      id: req.id,
      location_lat: req.location?.lat,
      location_lng: req.location?.lng,
    };
  });
  reqResource.splice(0, reqResource.length, ...processed);
};
