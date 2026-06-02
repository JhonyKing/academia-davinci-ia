# Tech Stack — Academia Da Vinci IA

## Arquitectura general
Sitio estático HTML + Supabase como backend serverless. Sin frameworks JS, sin build step para el contenido del curso.

```
Vercel (static hosting)
  └── clases/                  ← outputDirectory
       ├── index.html           ← dashboard del alumno
       ├── login.html           ← autenticación
       ├── admin.html           ← panel del instructor
       ├── clase1_*.html … clase24_*.html
       ├── js/
       │    ├── supabase-client.js   ← cliente Supabase compartido
       │    └── auth.js              ← guard + progreso automático
       ├── robotsin/                 ← imágenes + videos del mascot
       └── diagrams/                 ← diagramas PNG de las lecciones

Supabase (proyecto: joiuvopzkorvmxegnjqg)
  ├── auth.users               ← usuarios (solo instructores crean alumnos)
  ├── public.profiles          ← nombre, email, rol (alumno/instructor)
  └── public.progress          ← clase_num completada por alumno (1-24)
```

## URLs de producción
- **Sitio**: https://academia-davinci-ia.vercel.app
- **Login**: https://academia-davinci-ia.vercel.app/login.html
- **Admin**: https://academia-davinci-ia.vercel.app/admin.html
- **Supabase Dashboard**: https://supabase.com/dashboard/project/joiuvopzkorvmxegnjqg
- **Vercel Dashboard**: https://vercel.com/jhonykings-projects/academia-davinci-ia
- **GitHub**: https://github.com/JhonyKing/academia-davinci-ia

## Supabase — detalles

### Credenciales del cliente (seguras para exponer — anon key + RLS)
```js
SUPABASE_URL     = 'https://joiuvopzkorvmxegnjqg.supabase.co'
SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // ver supabase-client.js
```

### Usuario administrador
- Email: `jhonykingmusic@hotmail.com`
- Rol: `instructor`
- Creado: 2026-06-01

### Schema SQL
Archivo completo: `supabase/schema.sql`
- Tabla `profiles`: extiende auth.users con nombre, rol, fechas
- Tabla `progress`: una fila por (alumno × clase), upsert al 90% scroll
- RLS: alumno ve solo sus datos; instructor ve todo
- Trigger `on_auth_user_created`: crea perfil automático al registrar usuario
- Vista `vista_progreso_alumnos`: JOINea profiles + progress para el panel admin

### Crear un alumno nuevo (flujo manual)
1. Ir a Supabase Dashboard → Authentication → Users → Invite user
2. Ingresar email del alumno
3. User metadata: `{"nombre": "Nombre del alumno", "rol": "alumno"}`
4. El trigger crea el perfil automáticamente

### Crear un alumno desde el panel admin (flujo futuro con Stripe)
- `admin.html` tiene modal de creación con `supabase.auth.admin.inviteUserByEmail()`
- Requiere **service_role key** (no anon key) — implementar como Edge Function cuando se active Stripe

## Auth.js — cómo funciona el progreso automático
```
página carga
  → verifica sesión (_supabase.auth.getSession())
  → si no hay sesión → redirect a login.html
  → si hay sesión → muestra contenido
  → detecta clase N del filename (clase7_mapa... → clase_num = 7)
  → IntersectionObserver en el footer (90% visible)
  → al llegar al 90% → upsert en progress table
  → fallback: si la página es corta → marca completa a los 30s
```

## Deploy — comandos clave
```bash
# Deploy a producción
vercel deploy --prod

# Ver logs en tiempo real
vercel logs academia-davinci-ia.vercel.app

# Pull env vars localmente
vercel env pull
```

## Estructura vercel.json
```json
{
  "outputDirectory": "clases",
  "rewrites": [
    { "source": "/", "destination": "/index.html" }
  ]
}
```

## .vercelignore — qué se excluye
- `public/hooks_videos/` (videos de hook, pesados)
- `*.py`, `*.bat` (scripts operativos de Blotato/Remotion)
- Carpetas de otros proyectos: `AIOS/`, `OUTPUT_HABITOS/`, etc.
- Videos MP4 sueltos en la raíz del repo

## Diagrams — cómo regenerar
Los diagramas PNG se generan con Mermaid CLI:
```bash
mmdc -i diagrams/clase1.mmd -o diagrams/clase1.png --backgroundColor white
# Después de regenerar, copiar a clases/diagrams/
cp diagrams/*.png clases/diagrams/
```

## GitHub Actions (futuro)
Para auto-deploy al hacer push:
1. Vercel detecta el repo `JhonyKing/academia-davinci-ia`
2. Conectar en Vercel Dashboard → Settings → Git → Connect Repository
3. Cada push a `main` → deploy automático
