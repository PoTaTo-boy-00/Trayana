import { NextResponse } from "next/server";
import { TranslationServiceClient } from "@google-cloud/translate";

const client = new TranslationServiceClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
// console.log(process.env.GOOGLE_PROJECT_ID);

const projectId = process.env.GOOGLE_PROJECT_ID;
const location = "global";

export async function POST(request: Request) {
  try {
    const { text, targetLang } = await request.json();

    const [response] = await client.translateText({
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: "text/plain",
      targetLanguageCode: targetLang,
    });

    return NextResponse.json({
      translatedText: response.translations?.[0]?.translatedText || "",
    });
  } catch (error) {
    console.error("Translation error", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
