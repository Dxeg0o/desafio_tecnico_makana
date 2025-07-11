import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { headers, sampleRows } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  const descriptionPrompt = `We have a spreadsheet with the following column headers:\n${headers.join(", ")}\nSample rows:\n${sampleRows.map((r: string[]) => r.join(" | ")).join("\n")}\nDescribe briefly the probable meaning of each column in JSON format mapping header to description.`;

  const descCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: descriptionPrompt },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

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

  return NextResponse.json(descriptions);
}
