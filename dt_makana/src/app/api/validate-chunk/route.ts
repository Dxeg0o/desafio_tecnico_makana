import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { rows } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  const validationPrompt = `You are a data quality assistant. Determine if the provided rows contain enough information to continue processing. A chunk should be considered invalid if it dont exist at least one row wiht data in at least two columns. Respond only with a JSON object like {\"valid\": true} or {\"valid\": false}.\n\nRows:\n${JSON.stringify(
    rows
  )}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that outputs JSON only.",
      },
      { role: "user", content: validationPrompt },
    ],
    temperature: 0,
    response_format: { type: "json_object" },
  });

  let valid = true;
  try {
    const parsed = JSON.parse(completion.choices[0].message.content || "{}");
    if (typeof parsed.valid === "boolean") {
      valid = parsed.valid;
    }
  } catch {}

  return NextResponse.json({ valid });
}
