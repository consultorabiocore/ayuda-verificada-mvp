"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestSchema } from "@/lib/validation";
import { SUBCATEGORIES, REGIONS } from "@/lib/constants";
import { CATEGORY_LABELS } from "@/lib/types";
import type { RequestCategory, Urgency } from "@/lib/types";
import { getRequests, saveRequests, getCurrentUser, pushNotification, logAudit } from "@/lib/demo-db";
import { uid } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type FormData = {
  category: RequestCategory;
  subcategory: string;
  title: string;
  description: string;
  amountRequested: number;
  urgency: Urgency;
  region: string;
  commune?: string;
  providerName?: string;
};

export default function NewRequestPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<string[]>([]);
  const [statusMsg, setStatusMsg] = useState("");

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(requestSchema) as Resolver<FormData>,
    defaultValues: { category: "health", subcategory: "", urgency: "medium", region: "Metropolitana" },
  });

  const category = watch("category");
  const subs = useMemo(() => SUBCATEGORIES[category] || [], [category]);

  useEffect(() => {
    if (subs.length && !subs.includes(watch("subcategory"))) {
      setValue("subcategory", subs[0]);
    }
  }, [subs, setValue, watch]);

  function addDoc() {
    const name = prompt("Nombre del documento (simulado)");
    if (name) setDocs((d) => [...d, name]);
  }

  function saveDraft(data: FormData) {
    persist(data, "draft");
  }

  function submit(data: FormData) {
    persist(data, "submitted");
  }

  function persist(data: FormData, status: "draft" | "submitted") {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const requests = getRequests();
    const r = {
      id: uid("req"),
      applicantId: user.id,
      applicantDisplayName: user.displayName,
      category: data.category,
      subcategory: data.subcategory,
      title: data.title,
      description: data.description,
      amountRequested: Number(data.amountRequested),
      amountCommitted: 0,
      amountReceived: 0,
      amountPaid: 0,
      paymentDetailsAuthorized: false,
      urgency: data.urgency,
      region: data.region,
      commune: data.commune,
      status,
      providerId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: docs,
      milestones: [],
      notes: data.providerName ? `Proveedor sugerido: ${data.providerName}` : undefined,
    };
    requests.unshift(r);
    saveRequests(requests);
    logAudit({ actorId: user.id, actorRole: user.role, action: status === "draft" ? "request_drafted" : "request_submitted", entityType: "request", entityId: r.id });
    pushNotification({ userId: user.id, title: status === "draft" ? "Borrador guardado" : "Solicitud recibida", body: status === "draft" ? "Tu borrador fue guardado." : "Tu solicitud está en revisión." });
    setStatusMsg(status === "draft" ? "Borrador guardado" : "Solicitud enviada para verificación");
    if (status === "submitted") router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Crear solicitud de ayuda</h1>
      <p className="mt-1 text-sm text-zinc-600">Completa solo la información necesaria. Los documentos serán privados.</p>

      <Card className="mt-6">
        <CardContent className="p-6 space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit(submit)}>
            <div>
              <Label>Categoría</Label>
              <Select {...register("category")}>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Subcategoría</Label>
              <Select {...register("subcategory")}>
                {subs.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
              {errors.subcategory && <p className="text-xs text-red-600">{errors.subcategory.message}</p>}
            </div>
            <div>
              <Label>Título</Label>
              <Input {...register("title")} placeholder="Ej: Medicamentos oncológicos mensuales" />
              {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea {...register("description")} rows={5} placeholder="Describe la necesidad, sin datos sensibles innecesarios" />
              {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Monto solicitado (CLP)</Label>
                <Input type="number" {...register("amountRequested")} />
                {errors.amountRequested && <p className="text-xs text-red-600">{errors.amountRequested.message}</p>}
              </div>
              <div>
                <Label>Urgencia</Label>
                <Select {...register("urgency")}>
                  <option value="emergency">Emergencia</option>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="normal">Normal</option>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Región</Label>
                <Select {...register("region")}>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </Select>
              </div>
              <div>
                <Label>Comuna (opcional)</Label>
                <Input {...register("commune")} />
              </div>
            </div>
            <div>
              <Label>Proveedor o institución (opcional)</Label>
              <Input {...register("providerName")} placeholder="Farmacia, clínica, arrendador..." />
            </div>

            <div>
              <Label>Documentos (privados)</Label>
              <div className="mt-1 space-y-2">
                {docs.map((d, i) => (
                  <div key={i} className="rounded-md bg-zinc-100 px-3 py-2 text-sm">{d}</div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addDoc}>Adjuntar documento (simulado)</Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={handleSubmit(saveDraft)}>Guardar borrador</Button>
              <Button type="submit">Enviar para verificación</Button>
            </div>
            {statusMsg && <p className="text-sm text-emerald-700">{statusMsg}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

