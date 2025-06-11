import { NextResponse } from "next/server";
import { TranslationServiceClient } from "@google-cloud/translate";

// Add error handling and validation for credentials
let client: TranslationServiceClient;

try {
  const credentialsString = process.env.GOOGLE_CREDENTIALS_JSON;

  if (!credentialsString) {
    throw new Error("GOOGLE_CREDENTIALS_JSON environment variable is not set");
  }

  // Parse credentials with better error handling
  const credentials = JSON.parse(credentialsString);
  client = new TranslationServiceClient({ credentials });
} catch (error) {
  console.error("Failed to initialize Google Translate client:", error);
  // You might want to handle this differently based on your needs
}

const projectId = process.env.GOOGLE_PROJECT_ID;
const location = "global";

export async function POST(request: Request) {
  try {
    if (!client) {
      return NextResponse.json(
        { error: "Translation service not properly configured" },
        { status: 500 }
      );
    }

    const { text, targetLang } = await request.json();

    const [response] = await client.translateText({
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: "text/plain",
      targetLanguageCode: targetLang,
    });

    // console.log("Received:", { text, targetLang });
    // console.log("Translation response:", response);

    return NextResponse.json({
      translatedText: response.translations?.[0]?.translatedText || "",
    });
  } catch (error) {
    console.error("Translation error", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
