import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Diagrama de flujo",
};

export default function DiagramaFlujo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      <div className="absolute top-4 left-4">
        <Button asChild variant="outline">
          <Link href="/">Volver</Link>
        </Button>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Diagrama de flujo
        </h1>
        <Image
          src="/diagramaflujo.png"
          alt="Diagrama de flujo del proceso"
          width={779}
          height={2773}
          sizes="100vw"
          className="w-full h-auto"
          priority
        />
      </div>
    </div>
  );
}
