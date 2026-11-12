import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const registerSchema = z.object({
  displayName: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  role: z.enum(["applicant", "donor", "company_donor"]),
  acceptTerms: z.boolean().refine((v) => v === true, { message: "Debes aceptar los términos" }),
});

export const requestSchema = z.object({
  category: z.enum(["health", "education", "business", "utilities", "housing"]),
  subcategory: z.string().min(1, "Subcategoría requerida"),
  title: z.string().min(5, "Título muy corto").max(120),
  description: z.string().min(20, "Descripción muy corta").max(2000),
  amountRequested: z.coerce.number().min(1000, "Monto mínimo 1.000 CLP").max(50000000, "Monto excesivo"),
  urgency: z.enum(["emergency", "high", "medium", "normal"]),
  region: z.string().min(1, "Región requerida"),
  commune: z.string().optional(),
  providerName: z.string().optional(),
});

export const donationSchema = z.object({
  amount: z.coerce.number().min(1000, "Monto mínimo 1.000 CLP"),
  anonymousPublic: z.boolean().default(false),
});