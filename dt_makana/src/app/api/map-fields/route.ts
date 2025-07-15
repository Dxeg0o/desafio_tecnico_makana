import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { typesDefinition } from "@/utils/typesDefinition";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { headers, descriptions, types } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Falta OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  const mappingPrompt = `You are a data analyst.\n\nUse the TypeScript definitions below to understand the available fields:\n${typesDefinition}\n\nHeaders: ${headers.join(
    ", "
  )}\nDescriptions: ${JSON.stringify(
    descriptions
  )}\nAllowed event types: ${types.join(
    ", "
  )}\n\nProvide concise instructions on how to populate each PersonnelEvent field using the dataset columns. Mention when any headers correspond to days of the month. Respond only with a JSON object whose keys are the field names from the TypeScript definitions.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: mappingPrompt },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0].message.content || "{}";
  let mapping: Record<string, string> = {};
  try {
    mapping = JSON.parse(text);
  } catch {
    const match = text.match(/```json([\s\S]*?)```/);
    if (match) {
      try {
        mapping = JSON.parse(match[1]);
      } catch {}
    }
  }

  // Mostrar la respuesta cruda de la API de OpenAI en la consola
  console.log("Respuesta cruda de OpenAI:", text);

  // También mostrar el mapeo parseado
  console.log("Field mapping:", JSON.stringify(mapping, null, 2));

  // Devolver ambos: la respuesta cruda y el mapeo parseado
  return NextResponse.json({
    raw: text,
    mapping,
  });
}
