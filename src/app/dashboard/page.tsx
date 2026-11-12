/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser, getRequests, getDonations } from "@/lib/demo-db";
import { STATUS_LABELS, CATEGORY_LABELS } from "@/lib/types";
import { formatCLP } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [requests, setRequests] = useState<ReturnType<typeof getRequests>>([]);
  const [donations, setDonations] = useState<ReturnType<typeof getDonations>>([]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setUser(getCurrentUser());
    setRequests(getRequests());
    setDonations(getDonations());
  }, []);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p>Debes iniciar sesión.</p>
        <Link href="/login"><Button>Iniciar sesión</Button></Link>
      </div>
    );
  }

  const myRequests = requests.filter((r) => r.applicantId === user.id);
  const myDonations = donations.filter((d) => d.donorId === user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Mi actividad</h1>
      <p className="text-sm text-zinc-600">Usuario: {user.displayName} ({user.role})</p>

      {(user.role === "applicant") && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Mis solicitudes</h2>
          <div className="mt-3 space-y-3">
            {myRequests.length === 0 && <p className="text-sm text-zinc-500">No tienes solicitudes.</p>}
            {myRequests.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">{CATEGORY_LABELS[r.category]}</p>
                      <p className="font-medium">{r.title}</p>
                    </div>
                    <Badge className="bg-zinc-100 text-zinc-800">{STATUS_LABELS[r.status]}</Badge>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-zinc-600">
                    <span>Solicitado {formatCLP(r.amountRequested)}</span>
                    <span>Recibido {formatCLP(r.amountReceived)}</span>
                    <span>Pagado {formatCLP(r.amountPaid)}</span>
                  </div>
                  <div className="mt-2">
                    <Link href={`/requests/${r.id}`}><Button size="sm" variant="outline">Ver</Button></Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {(user.role === "donor" || user.role === "company_donor") && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Mis aportes</h2>
          <div className="mt-3 space-y-3">
            {myDonations.length === 0 && <p className="text-sm text-zinc-500">No has realizado aportes.</p>}
            {myDonations.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{formatCLP(d.amount)}</p>
                    <Badge className="bg-emerald-100 text-emerald-800">{d.status}</Badge>
                  </div>
                  <p className="text-xs text-zinc-600">Campaña: {d.requestId} · {new Date(d.createdAt).toLocaleDateString("es-CL")}</p>
                  <p className="text-xs text-zinc-500">Transacción simulada: {d.transactionId}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Notificaciones</h2>
        <Notifications userId={user.id} />
      </section>
    </div>
  );
}

import { getNotifications } from "@/lib/demo-db";
function Notifications({ userId }: { userId: string }) {
  const [items, setItems] = useState<ReturnType<typeof getNotifications>>([]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setItems(getNotifications(userId)), [userId]);
  if (items.length === 0) return <p className="text-sm text-zinc-500">Sin notificaciones.</p>;
  return (
    <ul className="mt-2 space-y-2">
      {items.map((n) => (
        <li key={n.id} className="rounded-md border border-zinc-200 bg-white p-3 text-sm">
          <p className="font-medium">{n.title}</p>
          <p className="text-zinc-600">{n.body}</p>
        </li>
      ))}
    </ul>
  );
}
