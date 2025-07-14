import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { headers, sampleRows } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  const descriptionPrompt = `You are a data analyst.\n\nHeaders: ${headers.join(
    ", "
  )}\nSample rows:\n${sampleRows
    .map((r: string[]) => r.join(" | "))
    .join(
      "\n"
    )}\nInfer the meaning of each column and respond only with a JSON object mapping each header to a short description.`;

  const descCompletion = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: descriptionPrompt },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  // Log raw response from OpenAI for debugging purposes
  console.log(
    "OpenAI describe raw response:",
    descCompletion.choices[0].message.content
  );

  const descText = descCompletion.choices[0].message.content || "{}";
  let descriptions: Record<string, string> = {};
  try {
    descriptions = JSON.parse(descText);
  } catch {
    const match = descText.match(/```json([\s\S]*?)```/);
    if (match) {
      try {
        descriptions = JSON.parse(match[1]);
      } catch {}
    }
  }

  // Log the parsed descriptions for visibility
  console.log("Column descriptions:", JSON.stringify(descriptions, null, 2));

  return NextResponse.json(descriptions);
}
