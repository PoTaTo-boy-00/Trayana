export const sosAlerts = [
  { id: 1, location_lat: 26.54, location_lng: 88.71 }, // Near Jalpaiguri
  { id: 2, location_lat: 26.58, location_lng: 88.71 }, // Near Jalpaiguri
  { id: 3, location_lat: 27, location_lng: 87 }, // Near Jalpaiguri
];

import { supabase } from "@/lib/supabase";

export interface SOSWithCoords {
  id: string;
  location_lat: number;
  location_lng: number;
}

export const sosReport: SOSWithCoords[] = [];

export const fetchResources = async () => {
  const { data, error } = await supabase
    .from("sosReports")
    .select("*")
    .eq("active", "true");

  if (error) {
    console.error("Error fetching organizations:", error.message);

    return;
  }

  const processed = (data || []).map((res) => ({
    id: res.id,
    location_lat: res.location?.lat,
    location_lng: res.location?.lng,
  }));
  sosReport.splice(0, sosReport.length, ...processed); // Modify array in place
  // console.log("Organizations array populated:", otganization);
  // return otganization;
};
