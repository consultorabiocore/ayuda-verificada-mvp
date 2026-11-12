import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORY_LABELS } from "@/lib/types";
import { formatCLP } from "@/lib/utils";

const categories = Object.entries(CATEGORY_LABELS) as [keyof typeof CATEGORY_LABELS, string][];

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-zinc-900 md:text-4xl">
              Ayuda real para necesidades verificadas
            </h1>
            <p className="mt-4 text-lg text-zinc-600">
              Conectamos personas que necesitan ayuda económica con personas, empresas y organizaciones que desean financiar necesidades reales y comprobables.
            </p>
            <p className="mt-3 text-sm text-zinc-500">
              Los aportes se transfieren directamente a la persona o acreedor. La plataforma no recibe ni custodia dinero.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/requests/new">
                <Button size="lg">Solicitar ayuda</Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline">
                  Quiero ayudar
                </Button>
              </Link>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Cómo funciona</h2>
              <ol className="mt-3 space-y-2 text-sm text-zinc-700">
                <li>1. La persona presenta una necesidad y adjunta documentos.</li>
                <li>2. Un revisor verifica identidad, necesidad y proveedor.</li>
                <li>3. La campaña se publica con monto y progreso.</li>
                <li>4. Los aportes se realizan directamente al beneficiario o al acreedor correspondiente.</li>
                <li>5. Se registra la confirmación de los aportes y del destino de la ayuda.</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-xl font-semibold">¿Cómo verificamos las necesidades?</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <ol className="space-y-2 text-sm text-zinc-700">
                <li>1. Revisamos la identidad y los antecedentes de la solicitud.</li>
                <li>2. Comprobamos la necesidad y su documentación.</li>
                <li>3. Verificamos el monto solicitado y el destino de los aportes.</li>
                <li>4. Una persona revisora evalúa el caso.</li>
                <li>5. Si se aprueba, se publica con información clara sobre su avance.</li>
                <li>6. Se registra la confirmación de los aportes y del destino de la ayuda.</li>
              </ol>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-zinc-700">
                La verificación busca comprobar que la necesidad y su destino sean reales. No significa que la plataforma garantice la situación económica futura de una persona ni que pueda eliminar todos los riesgos de fraude.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-xl font-semibold">Categorías</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-5">
          {categories.map(([key, label]) => (
            <Link key={key} href={`/explore?category=${key}`}>
              <Card className="transition hover:shadow-md">
                <CardContent className="p-4 text-center">
                  <p className="font-medium">{label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Indicadores (datos de demostración)</h2>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            Datos de demostración
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {[
            { label: "Solicitudes verificadas", value: "3" },
            { label: "Campañas publicadas", value: "2" },
            { label: "Monto comprometido", value: formatCLP(440000) },
            { label: "Necesidades pagadas", value: "1" },
          ].map((k) => (
            <Card key={k.label}>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-emerald-700">{k.value}</p>
                <p className="text-xs text-zinc-600">{k.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Estos indicadores corresponden a datos de demostración. Al iniciar la operación pública, se alimentarán exclusivamente de datos reales y verificables.
        </p>
      </section>
    </div>
  );
}