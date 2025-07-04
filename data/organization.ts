// hooks/useOrganizations.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Organization } from "@/app/types";

export interface OrganizationWithCoords {
  id: string;
  location_lat: number;
  location_lng: number;
  name?: string;
  org_type?: string;
  contact?: string;
  address?: string;
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
    type: "organization",
    location_lat: org.coverage.center.lat,
    location_lng: org.coverage.center.lng,
    name: org.name,
    org_type: org.type,
    contact: org.contact.phone || org.contact.email,
    address: org.address,
  }));
  organization.splice(0, organization.length, ...processed); // Modify array in place
  // console.log("Organizations array populated:", otganization);
  // return otganization;
};
