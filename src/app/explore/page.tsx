/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getRequests } from "@/lib/demo-db";
import type { HelpRequest } from "@/lib/types";
import { CATEGORY_LABELS, URGENCY_LABELS } from "@/lib/types";
import { formatCLP, progressPct } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-8">Cargando...</div>}>
      <ExploreInner />
    </Suspense>
  );
}

function ExploreInner() {
  const params = useSearchParams();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setRequests(getRequests().filter((r) => r.status === "published" || r.status === "partially_funded" || r.status === "fully_funded"));
  }, []);
  const [category, setCategory] = useState<string>(params.get("category") || "");
  const [urgency, setUrgency] = useState<string>("");

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (category && r.category !== category) return false;
      if (urgency && r.urgency !== urgency) return false;
      return true;
    });
  }, [requests, category, urgency]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Explorar necesidades</h1>
      <p className="mt-1 text-sm text-zinc-600">Solo se muestran campañas verificadas y publicadas. No se exponen datos privados.</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <select className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Todas las categorías</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
          <option value="">Toda urgencia</option>
          {Object.entries(URGENCY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {filtered.length === 0 && <p className="text-sm text-zinc-500">No hay campañas disponibles.</p>}
        {filtered.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-zinc-500">{CATEGORY_LABELS[r.category]}</p>
                  <h3 className="font-semibold">{r.title}</h3>
                </div>
                <Badge className={r.urgency === "emergency" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}>{URGENCY_LABELS[r.urgency]}</Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{r.description}</p>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>{formatCLP(r.amountReceived)} recaudado</span>
                  <span>Meta {formatCLP(r.amountRequested)}</span>
                </div>
                <Progress value={progressPct(r.amountReceived, r.amountRequested)} className="mt-1" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-zinc-500">Verificado ✓</span>
                <Link href={`/requests/${r.id}`}>
                  <Button size="sm">Ver detalle</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
