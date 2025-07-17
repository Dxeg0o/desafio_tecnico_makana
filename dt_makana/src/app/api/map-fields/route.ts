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

/*
IMPORTANT INSTRUCTIONS FOR FIELD MAPPING:

If there are columns (headers) that represent dates, and these columns indicate the type of event (such as LICENSE, FAILURE, etc.), you must consider every single day represented in these columns when determining whether a valid event object should be created. 

For each date-type column that signals an event type, you must:
- Evaluate every day individually to decide if a PersonnelEvent object should be created for that day.
- If a person has valid event entries on non-consecutive days (for example: day 1: 'lm', day 2: 'lm', day 3: 'worked', day 4: 'lm'), you must create separate PersonnelEvent objects for each group of consecutive valid event days. In the example, this would result in two objects: one for days 1-2 and another for day 4.
- Do not merge non-consecutive valid event days into a single object; each group of consecutive days with valid events must be treated as a separate PersonnelEvent.

When age or gender are missing, infer them only from clear clues like a birthdate or a distinctly gendered name.

Whenever a column may contain data in different formats, clearly specify the
expected format to use. All dates must be formatted as MM/DD/AA. The
collaborator_seniority field should always be expressed as "XX years, XX months".

Respond only with a JSON object whose keys are the field names from the TypeScript definitions, and whose values are concise instructions for how to map the dataset columns to each field, following the above rules.
*/

`;

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
