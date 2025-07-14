import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { PersonnelEvent } from "@/types";
import { eventTypeExamples } from "@/utils/eventTypeExamples";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const typesDefinition = `interface BaseEvent {\n  department: string;\n  event_type: "license" | "accident" | "failure";\n  start_date: string;\n  uniqueness_flag: string;\n  turn_type: string;\n}\ninterface LicenseEvent extends BaseEvent {\n  license_type: string;\n  collaborator_age: number;\n  collaborator_gender: "male" | "female" | "other";\n  collaborator_seniority: string;\n}\ninterface AccidentEvent extends BaseEvent {\n  date: string;\n  hour: string;\n  accident_type: string;\n  activity: string;\n  motive: string;\n  severity: "No aplica" | "Baja" | "Media" | "Alta" | "Fatal";\n  potential: string;\n  collaborator_age: number;\n  collaborator_gender: "male" | "female" | "other";\n  collaborator_seniority: string;\n  description: string;\n}\ninterface FailureEvent extends BaseEvent {\n  date: string;\n  failure_type: string;\n}\ntype PersonnelEvent = LicenseEvent | AccidentEvent | FailureEvent;`;

export async function POST(req: NextRequest) {
  try {
    const {
      rows,
      types,
      descriptions,
    }: {
      rows: Record<string, unknown>[];
      types: string[];
      descriptions: Record<string, string>;
    } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const allowed =
      Array.isArray(types) && types.length > 0
        ? types.join(", ")
        : "license, accident, failure";

    const exampleLines = Object.entries(eventTypeExamples)
      .map(([t, ex]) => `${t}: ${ex.join(", ")}`)
      .join("\\n");

    const classifyPrompt = `Using the following TypeScript definitions to understand the desired output:\n${typesDefinition}\nColumn descriptions: ${JSON.stringify(
      descriptions
    )}\nExamples of event type values:\n${exampleLines}\nOnly consider event types: ${allowed}. If a row does not match one of these types, skip it. Classify each of the following rows and return an array of PersonnelEvent objects:\n${JSON.stringify(
      rows
    )}.`;

    const classCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that outputs JSON only.",
        },
        { role: "user", content: classifyPrompt },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const eventsText = classCompletion.choices[0].message.content || "[]";
    let events: PersonnelEvent[] = [];

    try {
      const parsed = JSON.parse(eventsText);
      // Verificar si la respuesta es un array o si tiene una propiedad que contiene el array
      if (Array.isArray(parsed)) {
        events = parsed;
      } else if (parsed && typeof parsed === "object") {
        // Buscar una propiedad que contenga el array de eventos
        const possibleArrayProps = ["events", "data", "result", "items"];
        for (const prop of possibleArrayProps) {
          if (Array.isArray(parsed[prop])) {
            events = parsed[prop];
            break;
          }
        }
        // Si no encontramos un array en propiedades específicas, verificar si el objeto completo es válido
        if (events.length === 0 && parsed.event_type) {
          events = [parsed];
        }
      }
    } catch {
      // Intentar extraer JSON de markdown si el parsing directo falla
      const match = eventsText.match(/```json([\s\S]*?)```/);
      if (match) {
        try {
          const parsed = JSON.parse(match[1]);
          if (Array.isArray(parsed)) {
            events = parsed;
          } else if (
            parsed &&
            typeof parsed === "object" &&
            parsed.event_type
          ) {
            events = [parsed];
          }
        } catch (markdownParseError) {
          console.error(
            "Error parsing JSON from markdown:",
            markdownParseError
          );
        }
      }
    }

    // Validar que events sea un array y que cada elemento tenga event_type
    if (!Array.isArray(events)) {
      console.error("Events is not an array:", events);
      events = [];
    } else {
      // Filtrar elementos que no tengan event_type válido
      events = events.filter(
        (event) =>
          event &&
          typeof event === "object" &&
          "event_type" in event &&
          typeof event.event_type === "string"
      );
    }

    const allowedSet = new Set(
      Array.isArray(types) && types.length > 0
        ? types
        : ["license", "accident", "failure"]
    );
    const filtered = events.filter((e) => allowedSet.has(e.event_type));

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error in classify endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
