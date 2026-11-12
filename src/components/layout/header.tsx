"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, getUsers, setCurrentUser, type PlatformUser } from "@/lib/demo-db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const publicNav = [
  { href: "/", label: "Inicio" },
  { href: "/explore", label: "Explorar necesidades" },
  { href: "/requests/new", label: "Solicitar ayuda" },
  { href: "/dashboard", label: "Mi actividad" },
];

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setUsers(getUsers());
  }, []);

  function switchUser(id: string) {
    const u = users.find((x) => x.id === id) || null;
    setCurrentUser(u);
    setUser(u);
    window.location.reload();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-emerald-700">
          <span className="rounded-lg bg-emerald-600 px-2 py-1 text-sm text-white">AV</span>
          <span className="hidden text-base sm:inline">AyudaVerificada</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {publicNav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-md px-3 py-2 text-sm whitespace-nowrap ${pathname === n.href ? "bg-emerald-50 text-emerald-700" : "text-zinc-700 hover:bg-zinc-100"}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Badge className="hidden bg-emerald-100 text-emerald-800 sm:inline-flex">{user.role}</Badge>
              <select
                className="max-w-[160px] rounded-md border border-zinc-300 px-2 py-1 text-xs"
                value={user.id}
                onChange={(e) => switchUser(e.target.value)}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName} ({u.role})
                  </option>
                ))}
              </select>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="hidden sm:block">
                <Button size="sm" variant="outline">Iniciar sesión</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Crear cuenta</Button>
              </Link>
            </div>
          )}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 text-zinc-700 md:hidden"
            aria-label="Abrir menú"
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-zinc-100 px-4 py-2 md:hidden">
          <div className="flex flex-col gap-1">
            {publicNav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2 text-sm ${pathname === n.href ? "bg-emerald-50 text-emerald-700" : "text-zinc-700 hover:bg-zinc-100"}`}
              >
                {n.label}
              </Link>
            ))}
            {!user && (
              <Link href="/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100">
                Iniciar sesión
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}