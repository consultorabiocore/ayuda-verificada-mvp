/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRequests, saveRequests, getDonations, saveDonations, getCurrentUser, pushNotification, logAudit } from "@/lib/demo-db";
import type { HelpRequest, Donation } from "@/lib/types";
import { STATUS_LABELS, CATEGORY_LABELS, URGENCY_LABELS } from "@/lib/types";
import { formatCLP, progressPct, uid } from "@/lib/utils";
import { paymentProvider } from "@/lib/payments";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

export default function RequestDetailPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-8">Cargando...</div>}>
      <RequestDetailInner />
    </Suspense>
  );
}

function RequestDetailInner() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [request, setRequest] = useState<HelpRequest | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setRequest(getRequests().find((x) => x.id === id) || null);
  }, [id]);
  const [amount, setAmount] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");

  async function donate() {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const amt = Number(amount);
    if (!amt || amt < 1000) {
      setMessage("Monto inválido");
      return;
    }
    if (!request) return;
    const remaining = request.amountRequested - request.amountReceived;
    if (amt > remaining) {
      setMessage("El monto supera lo pendiente");
      return;
    }
    const tx = await paymentProvider.createDonationIntent({ requestId: request.id, amount: amt, donorId: user.id });
    const donation: Donation = {
      id: uid("don"),
      donorId: user.id,
      donorDisplayName: anonymous ? "Donante anónimo" : user.displayName,
      requestId: request.id,
      amount: amt,
      anonymousPublic: anonymous,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      transactionId: tx.transactionId,
    };
    const donations = getDonations();
    donations.unshift(donation);
    saveDonations(donations);

    const requests = getRequests();
    const idx = requests.findIndex((r) => r.id === request.id);
    if (idx >= 0) {
      requests[idx].amountReceived += amt;
      requests[idx].amountConfirmed += amt;
      if (requests[idx].amountReceived >= requests[idx].amountRequested) {
        requests[idx].status = "fully_funded";
      } else {
        requests[idx].status = "partially_funded";
      }
      requests[idx].updatedAt = new Date().toISOString();
      saveRequests(requests);
      setRequest(requests[idx]);
    }

    pushNotification({ userId: request.applicantId, title: "Nuevo aporte recibido", body: `Se registró un aporte de ${formatCLP(amt)} (simulado).` });
    logAudit({ actorId: user.id, actorRole: user.role, action: "donation_created", entityType: "donation", entityId: donation.id, metadata: { amount: amt, simulated: true } });
    setMessage(`Aporte simulado registrado: ${formatCLP(amt)}`);
    setAmount("");
  }

  if (!request) return <div className="mx-auto max-w-6xl px-4 py-8">Cargando...</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-xs text-zinc-500">{CATEGORY_LABELS[request.category]} · {request.subcategory}</p>
              <h1 className="mt-1 text-2xl font-bold">{request.title}</h1>
              <div className="mt-2 flex gap-2">
                <Badge className="bg-emerald-100 text-emerald-800">{STATUS_LABELS[request.status]}</Badge>
                <Badge className="bg-amber-100 text-amber-800">{URGENCY_LABELS[request.urgency]}</Badge>
              </div>
              <p className="mt-4 text-zinc-700">{request.description}</p>
              <div className="mt-4 text-sm text-zinc-600">
                <p>Región: {request.region}</p>
                <p>Verificación: identidad, necesidad y destino verificados (revisión humana).</p>
                <p>Destino del aporte: pago directo al proveedor cuando esté habilitado (simulado).</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold">Historial público de avances</h2>
              <ul className="mt-2 space-y-1 text-sm text-zinc-600">
                <li>Solicitud recibida y verificada.</li>
                <li>Campaña publicada.</li>
                <li>{request.amountPaid > 0 ? `Pago ejecutado: ${formatCLP(request.amountPaid)}` : "Pago pendiente de habilitación."}</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold">Progreso</h2>
              <p className="mt-2 text-2xl font-bold text-emerald-700">{formatCLP(request.amountReceived)}</p>
              <p className="text-xs text-zinc-600">de {formatCLP(request.amountRequested)}</p>
              <Progress value={progressPct(request.amountReceived, request.amountRequested)} className="mt-2" />
              <div className="mt-3 space-y-1 text-xs text-zinc-600">
                <p>Prometido: {formatCLP(request.amountReceived)}</p>
                <p>Recibido: {formatCLP(request.amountConfirmed)}</p>
                <p>Pagado: {formatCLP(request.amountPaid)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="font-semibold">Aportar (simulado)</h2>
              <Input type="number" placeholder="Monto en CLP" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
                Aportar de forma anónima públicamente
              </label>
              <Button className="w-full" onClick={donate}>Donar (simulado)</Button>
              {message && <p className="text-sm text-emerald-700">{message}</p>}
              <p className="text-xs text-zinc-500">Operación simulada. No se mueve dinero real.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
