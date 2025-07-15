import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { PersonnelEvent } from "@/types";
import { eventTypeExamples } from "@/utils/eventTypeExamples";
import { typesDefinition } from "@/utils/typesDefinition";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const {
      rows,
      types,
      descriptions,
      mapping,
    }: {
      rows: Record<string, unknown>[];
      types: string[];
      descriptions: Record<string, string>;
      mapping: Record<string, string>;
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

    const classifyPrompt = `You are a data classification assistant.\n\nRules to follow:\n1. Format the output using the TypeScript definitions below.\n${typesDefinition}\n2. Use the column descriptions and event type examples to interpret the data.\nColumn descriptions: ${JSON.stringify(
      descriptions
    )}\nField mapping: ${JSON.stringify(mapping)}\nEvent type examples:\n${exampleLines}\n3. Only allow event types: ${allowed}. Ignore rows that do not clearly match one of these types.\n4. Respond **only** with a JSON array of PersonnelEvent objects without any extra text.\n\nClassify the following rows:\n${JSON.stringify(
      rows
    )}`;

    const classCompletion = await openai.chat.completions.create({
      model: "gpt-4.1",
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

    // Log raw response from OpenAI to aid in debugging
    console.log(
      "OpenAI classify raw response:",
      classCompletion.choices[0].message.content
    );

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

    // Log the parsed and filtered events for visibility
    console.log("Classified events:", JSON.stringify(filtered, null, 2));

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error in classify endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
