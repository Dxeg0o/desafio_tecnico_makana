import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { typesDefinition } from "@/utils/typesDefinition";
import { eventTypeExamples } from "@/utils/eventTypeExamples";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { headers, descriptions, types } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Falta OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  const mappingPrompt = `You are a data analyst.

Use the TypeScript definitions below to understand the available fields:
${typesDefinition}

Headers: ${headers.join(", ")}
Descriptions: ${JSON.stringify(descriptions)}
Allowed event types: ${types.join(", ")}
Event type examples: ${Object.entries(eventTypeExamples)
    .map(([t, ex]) => `${t}: ${ex.join(", ")}`)
    .join("\\n")}

Provide concise instructions on how to populate each PersonnelEvent field using the dataset columns.
When age or gender are missing, infer them only from clear clues like a birthdate or a distinctly gendered name.
Respond only with a JSON object whose keys are the field names from the TypeScript definitions.`;

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
