import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    if (req.method === "GET") {
      // Fetch all zones
      const { data, error } = await supabase.from("resource_zones").select("*");

      if (error) throw error;

      res.status(200).json(data || []);
    } else if (req.method === "POST") {
      // Save zones (replace all existing ones)
      const zones = req.body;

      // First delete all existing zones
      const { error: deleteError } = await supabase
        .from("resource_zones")
        .delete()
        .neq("id", 0); // Delete all records

      if (deleteError) throw deleteError;

      // Then insert the new ones if there are any
      if (zones.length > 0) {
        const { error: insertError } = await supabase
          .from("resource_zones")
          .insert(zones);

        if (insertError) throw insertError;
      }

      res.status(200).json({ success: true });
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Zones API error:", error);
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message: string }).message
        : String(error);
    res.status(500).json({ error: errorMessage });
  }
}
