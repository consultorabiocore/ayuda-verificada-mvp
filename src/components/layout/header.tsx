/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, getUsers, setCurrentUser, type PlatformUser } from "@/lib/demo-db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const nav = [
  { href: "/", label: "Inicio" },
  { href: "/explore", label: "Explorar necesidades" },
  { href: "/requests/new", label: "Solicitar ayuda" },
  { href: "/dashboard", label: "Mi actividad" },
  { href: "/admin", label: "Administración" },
];

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-emerald-700">
          <span className="rounded-lg bg-emerald-600 px-2 py-1 text-white">AV</span>
          <span className="hidden sm:inline">AyudaVerificada</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-md px-3 py-2 text-sm ${pathname === n.href ? "bg-emerald-50 text-emerald-700" : "text-zinc-700 hover:bg-zinc-100"}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Badge className="bg-emerald-100 text-emerald-800">{user.role}</Badge>
              <select
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs"
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
            <Link href="/login">
              <Button size="sm">Iniciar sesión</Button>
            </Link>
          )}
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-zinc-100 px-4 py-2 md:hidden">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100">
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
