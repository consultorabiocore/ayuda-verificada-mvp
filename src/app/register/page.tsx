"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getUsers, saveUsers, setCurrentUser } from "@/lib/demo-db";
import { registerSchema } from "@/lib/validation";
import { uid } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"applicant" | "donor" | "company_donor">("applicant");
  const [accept, setAccept] = useState(false);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse({ displayName, email, password, role, acceptTerms: accept });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Datos inválidos");
      return;
    }
    if (getUsers().some((u) => u.email === email)) {
      setError("El correo ya está registrado");
      return;
    }
    const user = { id: uid("u"), email, displayName, role, createdAt: new Date().toISOString() };
    const users = getUsers();
    users.push(user);
    saveUsers(users);
    setCurrentUser(user);
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h1 className="text-xl font-bold">Crear cuenta</h1>
          <form onSubmit={submit} className="space-y-3">
            <div><Label>Nombre</Label><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></div>
            <div><Label>Correo</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></div>
            <div><Label>Contraseña</Label><Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" /></div>
            <div>
              <Label>Tipo de cuenta</Label>
              <Select value={role} onChange={(e) => setRole(e.target.value as "applicant" | "donor" | "company_donor")}>
                <option value="applicant">Solicitante</option>
                <option value="donor">Donante particular</option>
                <option value="company_donor">Empresa / Institución</option>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
              Acepto términos y política de privacidad
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">Registrarse</Button>
          </form>
          <p className="text-sm"><Link href="/login" className="text-emerald-700">Ya tengo cuenta</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}