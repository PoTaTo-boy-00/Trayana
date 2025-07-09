import { jitter } from "@/lib/jitter";
import { supabase } from "@/lib/supabase";

export interface SOSWithCoords {
  id: string;
  location_lat: number;
  location_lng: number;
}

// Shared in-memory array to hold fetched SOS data
export const sosReport: SOSWithCoords[] = [];

export const fetchSOS = async () => {
  const { data, error } = await supabase
    .from("sosReport")
    .select("id, latitude,longitude, status")
    .eq("status", "pending");

  if (error) {
    console.error("Error fetching SOS reports:", error.message);
    return;
  }

  const processed: SOSWithCoords[] = (data || [])
    .filter((res) => res?.latitude && res?.longitude)
    .map((res) => ({
      id: res.id,
      location_lat: res.latitude + jitter(),
      location_lng: res.longitude + jitter(),
    }));

  // In-place mutation of sosReport array
  sosReport.splice(0, sosReport.length, ...processed);
};
