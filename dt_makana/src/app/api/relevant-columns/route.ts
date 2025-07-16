import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { headers, descriptions, mapping } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  const relevancePrompt = `You are a data analyst assisting a data cleaning task.\n\nHeaders: ${headers.join(
    ", "
  )}\nDescriptions: ${JSON.stringify(
    descriptions
  )}\nField mapping instructions: ${JSON.stringify(
    mapping
  )}\n\nBased on the descriptions and mapping, identify which headers are relevant for classifying personnel events and which are redundant or irrelevant. Respond only with a JSON object having two arrays: {\"relevant\": string[], \"irrelevant\": string[]}.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: relevancePrompt },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0].message.content || "{}";
  let relevance: { relevant: string[]; irrelevant: string[] } = {
    relevant: [],
    irrelevant: [],
  };
  try {
    relevance = JSON.parse(text);
  } catch {
    const match = text.match(/```json([\s\S]*?)```/);
    if (match) {
      try {
        relevance = JSON.parse(match[1]);
      } catch {}
    }
  }

  console.log("Column relevance response:", text);
  console.log("Parsed relevance:", JSON.stringify(relevance, null, 2));

  return NextResponse.json(relevance);
}
