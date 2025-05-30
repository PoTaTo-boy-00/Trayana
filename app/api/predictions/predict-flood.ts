import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleAuth } from "google-auth-library";
import axios from "axios";

const PROJECT_ID = "your-project-id";
const LOCATION = "your-region";
const ENDPOINT_ID = "your-endpoint-id";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end("Only POST allowed");

  const { rainfall, riverLevel, soilSaturation } = req.body;

  try {
    const auth = new GoogleAuth({
      scopes: "https://www.googleapis.com/auth/cloud-platform",
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const vertexRes = await axios.post(
      `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}:predict`,
      {
        instances: [
          {
            rainfall_mm: rainfall,
            river_level_m: riverLevel,
            soil_saturation: soilSaturation,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${token.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const prediction = vertexRes.data.predictions?.[0] ?? "Unknown";

    res.status(200).json({ prediction });
  } catch (err) {
    console.error("Flood prediction error:", err);
    res.status(500).json({ error: "Vertex AI request failed" });
  }
}
