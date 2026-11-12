import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCLP(amount: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

export function progressPct(received: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((received / target) * 100));
}