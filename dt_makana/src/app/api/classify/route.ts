import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { PersonnelEvent } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const typesDefinition = `interface BaseEvent {\n  department: string;\n  event_type: "license" | "accident" | "failure";\n  start_date: string;\n  uniqueness_flag: string;\n  turn_type: string;\n}\ninterface LicenseEvent extends BaseEvent {\n  license_type: string;\n  collaborator_age: number;\n  collaborator_gender: "male" | "female" | "other";\n  collaborator_seniority: string;\n}\ninterface AccidentEvent extends BaseEvent {\n  date: string;\n  hour: string;\n  accident_type: string;\n  activity: string;\n  motive: string;\n  severity: "No aplica" | "Baja" | "Media" | "Alta" | "Fatal";\n  potential: string;\n  collaborator_age: number;\n  collaborator_gender: "male" | "female" | "other";\n  collaborator_seniority: string;\n  description: string;\n}\ninterface FailureEvent extends BaseEvent {\n  date: string;\n  failure_type: string;\n}\ntype PersonnelEvent = LicenseEvent | AccidentEvent | FailureEvent;`;

export async function POST(req: NextRequest) {
  const { headers, sampleRows, rows, types } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  const descriptionPrompt = `We have a spreadsheet with the following column headers:\n${headers.join(", ")}\nSample rows:\n${sampleRows
    .map((r: string[]) => r.join(" | "))
    .join("\n")}\nDescribe briefly the probable meaning of each column in JSON format mapping header to description.`;

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
    descriptions = {};
  }

  const allowed = Array.isArray(types) && types.length > 0 ? types : [
    "license",
    "accident",
    "failure",
  ];

  const classifyPrompt = `Using the following TypeScript definitions to understand the desired output:\n${typesDefinition}\nColumn descriptions: ${JSON.stringify(
    descriptions,
  )}\nOnly classify rows that correspond to the following event types: ${allowed.join(", ")}. If a row does not match any of these types, omit it. Return a JSON array of PersonnelEvent objects:\n${JSON.stringify(
    rows,
  )}`;

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
    events = [];
  }

  events = events.filter((e) => allowed.includes(e.event_type as string));

  return NextResponse.json(events);
}
