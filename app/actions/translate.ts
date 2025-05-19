import type { NextApiRequest, NextApiResponse } from "next";
import { TranslationServiceClient } from "@google-cloud/translate";
import { translations } from "@/lib/translation";
import { useState } from "react";

const client = new TranslationServiceClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { text, targetLanguage } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).json({ error: "Missing text or targetLanguage" });
  }

  try {
    const [response] = await client.translateText({
      parent: `projects/YOUR_PROJECT_ID/locations/global`,
      contents: [text],
      mimeType: "text/plain",
      targetLanguageCode: targetLanguage,
    });

    const translatedText = response.translations?.[0].translatedText || "";

    res.status(200).json({ translatedText });
  } catch (error) {
    res.status(500).json({ error: "Translation failed", details: error });
  }
}
const [language, setLanguage] = useState<string>("en");
// Translation function that safely returns string or fallback path
export const t = (path: string): string => {
  const keys = path.split(".");
  let result: any = translations[language] || translations["en"]; // Fallback to English
  for (const key of keys) {
    if (!result) {
      console.warn(
        `Translation missing for path: ${path}, falling back to English`
      );
      return path;
    }
    result = result[key];
  }
  if (typeof result !== "string") {
    console.warn(
      `Translation not string for path: ${path}, falling back to English`
    );
    return path;
  }
  return result;
};
