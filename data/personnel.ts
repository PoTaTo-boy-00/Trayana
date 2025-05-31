// data/personnel.ts
import { supabase } from "@/lib/supabase";

export interface PersonnelWithCoords {
  id: string;
  location_lat: number;
  location_lng: number;
}

export const personnel: PersonnelWithCoords[] = [];

export const fetchPersonnelLocation = async () => {
  const { data, error } = await supabase
    .from("personnel")
    .select("id, location");

  if (error) {
    console.error("Error fetching personnel data:", error.message);
    return;
  }

  const processed = (data || [])
    .filter((item) => item.location && item.location.includes(","))
    .map((item) => {
      const [lat, lng] = item.location.split(",").map(Number);
      return {
        id: item.id,
        location_lat: lat,
        location_lng: lng,
      };
    });

  personnel.splice(0, personnel.length, ...processed); // Modify array in place
  console.log("Personnel array populated:", personnel);
};
