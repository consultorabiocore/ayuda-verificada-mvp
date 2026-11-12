"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getUsers, setCurrentUser } from "@/lib/demo-db";
import { loginSchema } from "@/lib/validation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Datos inválidos");
      return;
    }
    const user = getUsers().find((u) => u.email === email);
    if (!user) {
      setError("Usuario no encontrado (demo). Prueba admin@demo.cl, solicitante@demo.cl, donante@demo.cl, revisor@demo.cl");
      return;
    }
    setCurrentUser(user);
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h1 className="text-xl font-bold">Iniciar sesión</h1>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label>Correo</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>
            <div>
              <Label>Contraseña</Label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">Entrar</Button>
          </form>
          <p className="text-xs text-zinc-500">Demo: usa cualquier contraseña. Usuarios: admin@demo.cl, revisor@demo.cl, solicitante@demo.cl, donante@demo.cl, empresa@demo.cl</p>
          <div className="text-sm">
            <Link href="/register" className="text-emerald-700">Crear cuenta</Link>
            {" · "}
            <Link href="/forgot-password" className="text-emerald-700">Recuperar contraseña</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}