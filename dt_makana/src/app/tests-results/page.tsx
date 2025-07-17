import fs from "fs";
import path from "path";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Resultados de prueba",
};

export default async function TestResults() {
  const dir = path.join(process.cwd(), "public", "tests_results");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".xlsx"));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      <div className="absolute top-4 left-4">
        <Button asChild variant="outline">
          <Link href="/">Volver</Link>
        </Button>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Resultados de prueba
        </h1>
        <ul className="space-y-4">
          {files.map((name) => (
            <li key={name}>
              <Button
                asChild
                variant="outline"
                className="w-full justify-between"
              >
                <a href={`/tests_results/${name}`} download>
                  {name}
                </a>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
