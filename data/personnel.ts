// data/personnel.ts
import { supabase } from "@/lib/supabase";

export interface PersonnelWithCoords {
  id: string;
  location_lat: number;
  location_lng: number;
  organization_id: string;
}

export const personnel: PersonnelWithCoords[] = [];

export const fetchPersonnelLocation = async (organizationId: string) => {
  if (!organizationId) {
    console.error("No organization ID provided");
    personnel.splice(0, personnel.length); // Clear the array
    return;
  }
  console.log(organizationId);

  const { data, error } = await supabase
    .from("personnel")
    .select("id, location, organization_id")
    .eq("organization_id", organizationId); // Filter by organization ID

  if (error) {
    console.error("Error fetching personnel data:", error.message);
    personnel.splice(0, personnel.length); // Clear the array on error
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
        organization_id: item.organization_id,
      };
    });

  personnel.splice(0, personnel.length, ...processed); // Modify array in place
  console.log(
    `Fetched ${processed.length} personnel for organization ${organizationId}`
  );
};
