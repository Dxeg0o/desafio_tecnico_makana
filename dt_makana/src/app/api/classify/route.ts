import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { PersonnelEvent } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const typesDefinition = `interface BaseEvent {\n  department: string;\n  event_type: "license" | "accident" | "failure";\n  start_date: string;\n  uniqueness_flag: string;\n  turn_type: string;\n}\ninterface LicenseEvent extends BaseEvent {\n  license_type: string;\n  collaborator_age: number;\n  collaborator_gender: "male" | "female" | "other";\n  collaborator_seniority: string;\n}\ninterface AccidentEvent extends BaseEvent {\n  date: string;\n  hour: string;\n  accident_type: string;\n  activity: string;\n  motive: string;\n  severity: "No aplica" | "Baja" | "Media" | "Alta" | "Fatal";\n  potential: string;\n  collaborator_age: number;\n  collaborator_gender: "male" | "female" | "other";\n  collaborator_seniority: string;\n  description: string;\n}\ninterface FailureEvent extends BaseEvent {\n  date: string;\n  failure_type: string;\n}\ntype PersonnelEvent = LicenseEvent | AccidentEvent | FailureEvent;`;

export async function POST(req: NextRequest) {
  const { rows, types, descriptions }: { rows: Record<string, unknown>[]; types: string[]; descriptions: Record<string, string> } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }


  const allowed = Array.isArray(types) && types.length > 0 ? types.join(", ") : "license, accident, failure";
  const classifyPrompt = `Using the following TypeScript definitions to understand the desired output:\n${typesDefinition}\nColumn descriptions: ${JSON.stringify(descriptions)}\nOnly consider event types: ${allowed}. If a row does not match one of these types, skip it. Classify each of the following rows and return an array of PersonnelEvent objects:\n${JSON.stringify(rows)}.`;

  const classCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a helpful assistant that outputs JSON only." },
      { role: "user", content: classifyPrompt },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const eventsText = classCompletion.choices[0].message.content || "[]";
  let events: PersonnelEvent[] = [];
  try {
    events = JSON.parse(eventsText);
  } catch {
    const match = eventsText.match(/```json([\s\S]*?)```/);
    if (match) {
      try {
        events = JSON.parse(match[1]);
      } catch {}
    }
  }

  const allowedSet = new Set(Array.isArray(types) && types.length > 0 ? types : ["license", "accident", "failure"]);
  const filtered = events.filter((e) => allowedSet.has(e.event_type));
  return NextResponse.json(filtered);
}
