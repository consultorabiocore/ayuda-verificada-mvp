/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRequests, saveRequests, getDonations, saveDonations, getCurrentUser, pushNotification, logAudit } from "@/lib/demo-db";
import type { HelpRequest, Donation } from "@/lib/types";
import { STATUS_LABELS, CATEGORY_LABELS, URGENCY_LABELS } from "@/lib/types";
import { formatCLP, progressPct, uid } from "@/lib/utils";

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
    const donation: Donation = {
      id: uid("don"),
      donorId: user.id,
      donorDisplayName: anonymous ? "Donante anónimo" : user.displayName,
      requestId: request.id,
      amount: amt,
      anonymousPublic: anonymous,
      status: "committed",
      createdAt: new Date().toISOString(),
      transactionId: uid("txn"),
    };
    const donations = getDonations();
    donations.unshift(donation);
    saveDonations(donations);

    const requests = getRequests();
    const idx = requests.findIndex((r) => r.id === request.id);
    if (idx >= 0) {
      requests[idx].amountCommitted += amt;
      if (requests[idx].amountCommitted >= requests[idx].amountRequested) {
        requests[idx].status = "fully_funded";
      } else {
        requests[idx].status = "partially_funded";
      }
      requests[idx].updatedAt = new Date().toISOString();
      saveRequests(requests);
      setRequest(requests[idx]);
    }

    pushNotification({ userId: request.applicantId, title: "Nuevo aporte comprometido", body: `Se comprometió un aporte de ${formatCLP(amt)} (transferencia directa).` });
    logAudit({ actorId: user.id, actorRole: user.role, action: "donation_committed", entityType: "donation", entityId: donation.id, metadata: { amount: amt, direct_transfer: true } });
    setMessage(`Aporte comprometido: ${formatCLP(amt)}. Realiza la transferencia directa y luego informa el comprobante.`);
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
              <h2 className="font-semibold">Datos de pago (transferencia directa)</h2>
              {request.paymentDetailsAuthorized && request.paymentDetails ? (
                <div className="mt-2 space-y-1 text-sm text-zinc-700">
                  <p>Banco: {request.paymentDetails.bank}</p>
                  <p>Tipo de cuenta: {request.paymentDetails.accountType}</p>
                  <p>Número: {request.paymentDetails.accountNumber}</p>
                  <p>Titular: {request.paymentDetails.holder}</p>
                  <p className="mt-2 text-xs text-zinc-500">Compartido bajo autorización del beneficiario. Realiza la transferencia y luego informa el comprobante.</p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-zinc-600">El beneficiario no ha autorizado compartir datos de pago. Contacta a la plataforma para coordinar el pago al acreedor por canales oficiales.</p>
              )}
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
              <p className="mt-2 text-2xl font-bold text-emerald-700">{formatCLP(request.amountCommitted)}</p>
              <p className="text-xs text-zinc-600">comprometido de {formatCLP(request.amountRequested)}</p>
              <Progress value={progressPct(request.amountCommitted, request.amountRequested)} className="mt-2" />
              <div className="mt-3 space-y-1 text-xs text-zinc-600">
                <p>Comprometido: {formatCLP(request.amountCommitted)}</p>
                <p>Recibido confirmado: {formatCLP(request.amountReceived)}</p>
                <p>Pagado al acreedor: {formatCLP(request.amountPaid)}</p>
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
              <Button className="w-full" onClick={donate}>Comprometer aporte (transferencia directa)</Button>
              {message && <p className="text-sm text-emerald-700">{message}</p>}
              <p className="text-xs text-zinc-500">No se mueve dinero por la plataforma. La transferencia es directa entre donante y beneficiario/acreedor.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
