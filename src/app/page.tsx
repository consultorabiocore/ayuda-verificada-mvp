import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORY_LABELS } from "@/lib/types";
import { formatCLP } from "@/lib/utils";

const categories = Object.entries(CATEGORY_LABELS) as [keyof typeof CATEGORY_LABELS, string][];

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 md:text-4xl">Ayuda real para necesidades verificadas</h1>
            <p className="mt-4 text-lg text-zinc-600">
              Conectamos personas que necesitan ayuda económica con personas, empresas y organizaciones que desean financiar necesidades reales y comprobables.
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
              <Link href="/register">
                <Button size="lg" variant="secondary">
                  Crear cuenta
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-zinc-500">
              Donaciones simuladas en esta versión. No se mueve dinero real.
            </p>
          </div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Cómo funciona</h2>
              <ol className="mt-3 space-y-2 text-sm text-zinc-700">
                <li>1. La persona presenta una necesidad y adjunta documentos.</li>
                <li>2. Un revisor verifica identidad, necesidad y proveedor.</li>
                <li>3. La campaña se publica con monto y progreso.</li>
                <li>4. Los aportes se destinan a la necesidad aprobada.</li>
                <li>5. El pago se realiza al proveedor cuando está habilitado.</li>
              </ol>
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
        <h2 className="text-xl font-semibold">Indicadores de impacto (demo)</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
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
      </section>
    </div>
  );
}