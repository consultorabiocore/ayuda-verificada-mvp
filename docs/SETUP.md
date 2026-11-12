# Configuración

1. Instalar dependencias: `bun install`
2. Copiar `.env.example` a `.env.local` y completar Supabase si existe.
3. Ejecutar: `bun run dev`
4. Abrir http://localhost:3000
5. Modo demo: usar usuarios demo en /login.

Para Supabase:
- Crear proyecto independiente.
- Ejecutar migraciones en supabase/migrations.
- Crear buckets privados: identity-documents, health-documents, housing-documents, education-documents, business-documents, payment-evidence.