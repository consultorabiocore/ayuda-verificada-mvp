"use client";

import type {
  PlatformUser,
  HelpRequest,
  Donation,
  StoredDocument,
  AuditLog,
  Notification,
} from "./types";
import { uid } from "./utils";

const KEYS = {
  users: "ae_users",
  current: "ae_current_user",
  requests: "ae_requests",
  donations: "ae_donations",
  documents: "ae_documents",
  audit: "ae_audit",
  notifications: "ae_notifications",
  seeded: "ae_seeded",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function seed() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(KEYS.seeded)) return;

  const users: PlatformUser[] = [
    { id: "u_admin", email: "admin@demo.cl", displayName: "Administradora Demo", role: "admin", createdAt: new Date().toISOString() },
    { id: "u_reviewer", email: "revisor@demo.cl", displayName: "Revisor Demo", role: "reviewer", createdAt: new Date().toISOString() },
    { id: "u_applicant", email: "solicitante@demo.cl", displayName: "María Pérez", role: "applicant", createdAt: new Date().toISOString() },
    { id: "u_donor", email: "donante@demo.cl", displayName: "Juan Donante", role: "donor", createdAt: new Date().toISOString() },
    { id: "u_company", email: "empresa@demo.cl", displayName: "Empresa Solidaria SpA", role: "company_donor", createdAt: new Date().toISOString() },
  ];
  write(KEYS.users, users);

  const now = new Date().toISOString();
  const requests: HelpRequest[] = [
    {
      id: "r_1",
      applicantId: "u_applicant",
      applicantDisplayName: "María Pérez",
      category: "health",
      subcategory: "Medicamentos de alto costo",
      title: "Tratamiento oncológico - medicamentos mensuales",
      description: "Necesito financiamiento para medicamentos oncológicos mensuales no cubiertos por mi seguro.",
      amountRequested: 450000,
      amountCommitted: 120000,
      amountReceived: 120000,
      amountPaid: 0,
      paymentDetailsAuthorized: true,
      paymentDetails: { bank: "Banco Estado", accountType: "Cuenta RUT", accountNumber: "12.345.678-9", holder: "María Pérez" },
      urgency: "high",
      region: "Metropolitana",
      status: "published",
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
      documents: [],
      milestones: [],
    },
    {
      id: "r_2",
      applicantId: "u_applicant",
      applicantDisplayName: "María Pérez",
      category: "education",
      subcategory: "Matrículas",
      title: "Matrícula universitaria - primer año",
      description: "Apoyo para matrícula y arancel del primer semestre.",
      amountRequested: 320000,
      amountCommitted: 320000,
      amountReceived: 320000,
      amountPaid: 320000,
      paymentDetailsAuthorized: true,
      paymentDetails: { bank: "Banco de Chile", accountType: "Cuenta corriente", accountNumber: "98.765.432-1", holder: "María Pérez" },
      urgency: "medium",
      region: "Valparaíso",
      status: "paid",
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
      documents: [],
      milestones: [],
    },
    {
      id: "r_3",
      applicantId: "u_applicant",
      applicantDisplayName: "María Pérez",
      category: "housing",
      subcategory: "Arriendos atrasados",
      title: "Evitar desalojo - 2 meses de arriendo",
      description: "Riesgo de desalojo por atraso de arriendo. Se pagará directamente al arrendador.",
      amountRequested: 600000,
      amountCommitted: 0,
      amountReceived: 0,
      amountPaid: 0,
      paymentDetailsAuthorized: false,
      urgency: "emergency",
      region: "Biobío",
      status: "submitted",
      createdAt: now,
      updatedAt: now,
      documents: [],
      milestones: [],
    },
  ];
  write(KEYS.requests, requests);

  write(KEYS.donations, []);
  write(KEYS.documents, []);
  write(KEYS.audit, []);
  write(KEYS.notifications, []);
  localStorage.setItem(KEYS.seeded, "1");
}

export function initDemo() {
  seed();
}

export function getUsers(): PlatformUser[] {
  seed();
  return read<PlatformUser[]>(KEYS.users, []);
}
export function saveUsers(v: PlatformUser[]) {
  write(KEYS.users, v);
}

export function getCurrentUser(): PlatformUser | null {
  seed();
  return read<PlatformUser | null>(KEYS.current, null);
}
export function setCurrentUser(u: PlatformUser | null) {
  write(KEYS.current, u);
}

export function getRequests(): HelpRequest[] {
  seed();
  return read<HelpRequest[]>(KEYS.requests, []);
}
export function saveRequests(v: HelpRequest[]) {
  write(KEYS.requests, v);
}

export function getDonations(): Donation[] {
  seed();
  return read<Donation[]>(KEYS.donations, []);
}
export function saveDonations(v: Donation[]) {
  write(KEYS.donations, v);
}

export function getDocuments(): StoredDocument[] {
  seed();
  return read<StoredDocument[]>(KEYS.documents, []);
}
export function saveDocuments(v: StoredDocument[]) {
  write(KEYS.documents, v);
}

export function getAudit(): AuditLog[] {
  seed();
  return read<AuditLog[]>(KEYS.audit, []);
}
export function saveAudit(v: AuditLog[]) {
  write(KEYS.audit, v);
}

export function getNotifications(userId?: string): Notification[] {
  seed();
  const all = read<Notification[]>(KEYS.notifications, []);
  return userId ? all.filter((n) => n.userId === userId) : all;
}
export function saveNotifications(v: Notification[]) {
  write(KEYS.notifications, v);
}

export function pushNotification(n: Omit<Notification, "id" | "createdAt" | "read">) {
  const all = read<Notification[]>(KEYS.notifications, []);
  all.unshift({ ...n, id: uid("notif"), createdAt: new Date().toISOString(), read: false });
  write(KEYS.notifications, all);
}

export function logAudit(entry: Omit<AuditLog, "id" | "createdAt">) {
  const all = read<AuditLog[]>(KEYS.audit, []);
  all.unshift({ ...entry, id: uid("audit"), createdAt: new Date().toISOString() });
  write(KEYS.audit, all);
}

export type { PlatformUser } from "./types";

export function resetDemo() {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}