import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { PersonnelEvent } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const typesDefinition = `interface BaseEvent {\n  department: string;\n  event_type: "license" | "accident" | "failure";\n  start_date: string;\n  uniqueness_flag: string;\n  turn_type: string;\n}\ninterface LicenseEvent extends BaseEvent {\n  license_type: string;\n  collaborator_age: number;\n  collaborator_gender: "male" | "female" | "other";\n  collaborator_seniority: string;\n}\ninterface AccidentEvent extends BaseEvent {\n  date: string;\n  hour: string;\n  accident_type: string;\n  activity: string;\n  motive: string;\n  severity: "No aplica" | "Baja" | "Media" | "Alta" | "Fatal";\n  potential: string;\n  collaborator_age: number;\n  collaborator_gender: "male" | "female" | "other";\n  collaborator_seniority: string;\n  description: string;\n}\ninterface FailureEvent extends BaseEvent {\n  date: string;\n  failure_type: string;\n}\ntype PersonnelEvent = LicenseEvent | AccidentEvent | FailureEvent;`;

export async function POST(req: NextRequest) {
  const { headers, sampleRows, rows } = await req.json();

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

  const classifyPrompt = `Using the following TypeScript definitions to understand the desired output:\n${typesDefinition}\nColumn descriptions: ${JSON.stringify(descriptions)}\nClassify each of the following rows and return an array of PersonnelEvent objects in JSON:\n${JSON.stringify(rows)}.`;

  const classCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a helpful assistant that outputs JSON only." },
      { role: "user", content: classifyPrompt },
    ],
    temperature: 0.2,
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

  return NextResponse.json(events);
}
