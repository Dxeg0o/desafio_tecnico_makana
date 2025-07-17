import Image from "next/image";

export const metadata = {
  title: "Informe técnico",
};

export default function InformeTecnico() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Informe técnico
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
