/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, getRequests, saveRequests, getAudit, logAudit } from "@/lib/demo-db";
import { STATUS_LABELS, CATEGORY_LABELS } from "@/lib/types";
import type { HelpRequest } from "@/lib/types";
import { formatCLP } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPage() {
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setUser(getCurrentUser());
    setRequests(getRequests());
  }, []);
  const [selected, setSelected] = useState<HelpRequest | null>(null);
  const [obs, setObs] = useState("");
  const [newStatus, setNewStatus] = useState("");

  if (!user || (user.role !== "admin" && user.role !== "superadmin" && user.role !== "reviewer")) {
    return <div className="mx-auto max-w-3xl px-4 py-8">Acceso restringido.</div>;
  }

  function refresh() {
    setRequests(getRequests());
  }

  function applyStatus() {
    if (!selected || !newStatus) return;
    const all = getRequests();
    const idx = all.findIndex((r) => r.id === selected.id);
    if (idx < 0) return;
    all[idx].status = newStatus as HelpRequest["status"];
    all[idx].updatedAt = new Date().toISOString();
    if (newStatus === "published") all[idx].publishedAt = new Date().toISOString();
    saveRequests(all);
    logAudit({ actorId: user!.id, actorRole: user!.role, action: `status_changed_to_${newStatus}`, entityType: "request", entityId: selected.id, metadata: { obs } });
    setSelected(all[idx]);
    refresh();
  }

  const stats = {
    total: requests.length,
    published: requests.filter((r) => r.status === "published" || r.status === "partially_funded" || r.status === "fully_funded").length,
    totalRequested: requests.reduce((a, r) => a + r.amountRequested, 0),
    totalReceived: requests.reduce((a, r) => a + r.amountReceived, 0),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Panel administrativo</h1>
      <p className="text-sm text-zinc-600">Usuario: {user.displayName} ({user.role})</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs">Solicitudes</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{stats.published}</p><p className="text-xs">Publicadas</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{formatCLP(stats.totalRequested)}</p><p className="text-xs">Total solicitado</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{formatCLP(stats.totalReceived)}</p><p className="text-xs">Total recaudado</p></CardContent></Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Solicitudes</h2>
          <div className="mt-3 space-y-2">
            {requests.map((r) => (
              <Card key={r.id} className={selected?.id === r.id ? "ring-2 ring-emerald-500" : ""}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">{CATEGORY_LABELS[r.category]}</p>
                      <p className="font-medium text-sm">{r.title}</p>
                    </div>
                    <Badge className="bg-zinc-100 text-zinc-800 text-xs">{STATUS_LABELS[r.status]}</Badge>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setSelected(r); setNewStatus(r.status); }}>Revisar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          {selected ? (
            <Card>
              <CardContent className="p-4 space-y-3">
                <h2 className="font-semibold">{selected.title}</h2>
                <p className="text-sm text-zinc-600">{selected.description}</p>
                <p className="text-xs text-zinc-500">Solicitante: {selected.applicantDisplayName} · Región: {selected.region}</p>
                <p className="text-xs text-zinc-500">Monto: {formatCLP(selected.amountRequested)} · Recibido: {formatCLP(selected.amountReceived)}</p>

                <div>
                  <label className="text-sm font-medium">Nuevo estado</label>
                  <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Observaciones</label>
                  <Textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={3} />
                </div>
                <Button onClick={applyStatus}>Aplicar estado</Button>

                <div className="pt-3 border-t border-zinc-100">
                  <h3 className="text-sm font-semibold">Auditoría reciente</h3>
                  <AuditList />
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="text-sm text-zinc-500">Selecciona una solicitud.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AuditList() {
  const [logs] = useState(getAudit().slice(0, 8));
  if (logs.length === 0) return <p className="text-xs text-zinc-500">Sin registros.</p>;
  return (
    <ul className="mt-2 space-y-1 text-xs text-zinc-600">
      {logs.map((l) => (
        <li key={l.id}>{new Date(l.createdAt).toLocaleString("es-CL")} — {l.action} ({l.entityType})</li>
      ))}
    </ul>
  );
}
