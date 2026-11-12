"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h1 className="text-xl font-bold">Recuperar contraseña</h1>
          {!sent ? (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-3">
              <div><Label>Correo</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></div>
              <Button type="submit" className="w-full">Enviar enlace (simulado)</Button>
            </form>
          ) : (
            <p className="text-sm text-emerald-700">Si el correo existe, se enviará un enlace (simulado). En producción se requiere proveedor de correo.</p>
          )}
          <Link href="/login" className="text-sm text-emerald-700">Volver</Link>
        </CardContent>
      </Card>
    </div>
  );
}