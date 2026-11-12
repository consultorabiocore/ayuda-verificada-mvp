# Arquitectura

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Supabase (Auth, PostgreSQL, Storage) cuando se configuren credenciales
- Zod + React Hook Form
- Modo demo con localStorage para desarrollo sin backend

## Estructura
Ver `src/`: app (rutas), components (ui/layout), lib (tipos, validaciones, demo-db, supabase, payments).

## Pagos
Un solo modulo centralizado `src/lib/payments.ts` con interfaz `PaymentProvider`. MVP usa `SimulatedPaymentProvider`.

## Seguridad
RLS en Supabase. En modo demo, datos en localStorage (no producción).