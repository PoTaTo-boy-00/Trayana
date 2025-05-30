import { NextResponse } from "next/server";

// You'll need to set GOOGLE_API_KEY in your .env file
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function POST(request: Request) {
  const { text, target } = await request.json();

  // Call Google Translate API
  const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      target,
      format: "text",
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }

  const data = await res.json();

  const translatedText = data.data.translations[0].translatedText;

  return NextResponse.json({ translatedText });
}
