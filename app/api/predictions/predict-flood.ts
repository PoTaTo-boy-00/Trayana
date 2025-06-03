// pages/api/predictFloodIndia.ts
import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { location, rainfall, riverLevel, soilMoisture } = req.body;

  // Compose India-specific prompt
  const prompt = `
    Flood risk assessment for Indian location: ${location}.
    Recent rainfall: ${rainfall} mm,
    River level: ${riverLevel} meters,
    Soil moisture: ${soilMoisture}%.
    Consider typical Indian monsoon patterns, urban drainage capacity in ${location},
    and historical flood data for the region.
    Provide flood risk prediction for the next week in this Indian location.
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: prompt,
    });
    const prediction = response.text ? response.text.trim() : "";
    res.status(200).json({ prediction });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error: "Prediction failed" });
  }
}
