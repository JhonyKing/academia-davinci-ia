-- ══════════════════════════════════════════════════════════════════
--  schema.sql — Academia Da Vinci IA
--  Ejecutar completo en: Supabase Dashboard → SQL Editor → New Query
--  Proyecto: https://TU_PROYECTO.supabase.co
-- ══════════════════════════════════════════════════════════════════


-- ── 1. TABLA: profiles ───────────────────────────────────────────────────
--    Extiende auth.users con datos del alumno/instructor.
--    Se crea automáticamente mediante trigger on_auth_user_created.

create table if not exists public.profiles (
  id             uuid        references auth.users on delete cascade primary key,
  nombre         text        not null,
  email          text        not null,
  rol            text        not null default 'alumno'
                             check (rol in ('alumno', 'instructor')),
  fecha_inicio   timestamptz not null default now(),
  ultimo_acceso  timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil extendido de cada usuario — alumnos e instructores de la Academia Da Vinci IA';


-- ── 2. TABLA: progress ───────────────────────────────────────────────────
--    Una fila por (alumno × clase). Registra cuándo completó cada clase.

create table if not exists public.progress (
  id              bigserial   primary key,
  user_id         uuid        not null
                              references public.profiles(id) on delete cascade,
  clase_num       integer     not null
                              -- 1-26 clases | 101-106 checkpoints de mundo (100 + mundo)
                              check ((clase_num between 1 and 26) or (clase_num between 101 and 106)),
  completada      boolean     not null default true,
  tiempo_segundos integer     not null default 0,
  completada_at   timestamptz not null default now(),
  unique (user_id, clase_num)
);

comment on table public.progress is
  'Registro de clases completadas por alumno. Una fila única por (alumno, clase_num).';


-- ── 3. ROW LEVEL SECURITY ────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.progress  enable row level security;


-- ── 3a. Policies: profiles ───────────────────────────────────────────────

-- Alumno: ver su propio perfil
create policy "alumno_ver_propio"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Alumno: actualizar su propio perfil (ej. ultimo_acceso)
create policy "alumno_actualizar_propio"
  on public.profiles
  for update
  using (auth.uid() = id);

-- Instructor: ver todos los perfiles de alumnos
create policy "instructor_ver_perfiles"
  on public.profiles
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol = 'instructor'
    )
  );

-- Instructor: actualizar cualquier perfil (ej. cambiar rol, resetear datos)
create policy "instructor_actualizar_perfiles"
  on public.profiles
  for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol = 'instructor'
    )
  );


-- ── 3b. Policies: progress ───────────────────────────────────────────────

-- Alumno: ver su propio progreso
create policy "alumno_ver_progreso"
  on public.progress
  for select
  using (auth.uid() = user_id);

-- Alumno: insertar su propio progreso
create policy "alumno_insertar_progreso"
  on public.progress
  for insert
  with check (auth.uid() = user_id);

-- Alumno: actualizar su propio progreso (ej. upsert de completada_at)
create policy "alumno_actualizar_progreso"
  on public.progress
  for update
  using (auth.uid() = user_id);

-- Instructor: ver todo el progreso
create policy "instructor_ver_progreso"
  on public.progress
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol = 'instructor'
    )
  );

-- Instructor: borrar progreso (para resetear alumnos)
create policy "instructor_borrar_progreso"
  on public.progress
  for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol = 'instructor'
    )
  );


-- ── 4. FUNCIÓN: handle_new_user ──────────────────────────────────────────
--    Se ejecuta automáticamente al crear un usuario en auth.users.
--    Lee nombre y rol de user_metadata (seteados al crear el usuario).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, email, rol)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'nombre',
      split_part(new.email, '@', 1)   -- fallback: parte antes del @
    ),
    new.email,
    coalesce(
      new.raw_user_meta_data->>'rol',
      'alumno'                         -- default: alumno
    )
  )
  on conflict (id) do nothing;         -- seguro si se llama varias veces
  return new;
end;
$$;

-- Trigger: disparar handle_new_user después de cada INSERT en auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();


-- ── 5. VISTA AUXILIAR: vista_progreso_alumnos ────────────────────────────
--    Facilita la consulta del panel de instructor con un solo JOIN.

create or replace view public.vista_progreso_alumnos as
select
  p.id,
  p.nombre,
  p.email,
  p.fecha_inicio,
  p.ultimo_acceso,
  count(pr.clase_num)                           as clases_completadas,
  round(count(pr.clase_num)::numeric / 26 * 100, 1) as porcentaje,
  max(pr.clase_num)                             as ultima_clase,
  max(pr.completada_at)                         as ultima_actividad
from public.profiles p
left join public.progress pr
  on pr.user_id = p.id and pr.completada = true
where p.rol = 'alumno'
group by p.id, p.nombre, p.email, p.fecha_inicio, p.ultimo_acceso;

comment on view public.vista_progreso_alumnos is
  'Vista de instructor: progreso consolidado por alumno';


-- ── 6. ÍNDICES ────────────────────────────────────────────────────────────

create index if not exists idx_progress_user_id
  on public.progress(user_id);

create index if not exists idx_progress_clase_num
  on public.progress(clase_num);

create index if not exists idx_profiles_rol
  on public.profiles(rol);


-- ══════════════════════════════════════════════════════════════════
--  INSTRUCCIONES POST-EJECUCIÓN
-- ══════════════════════════════════════════════════════════════════
--
--  1. CREAR INSTRUCTOR MANUALMENTE:
--     En Auth → Users → "Invite user", luego en SQL Editor:
--
--       update public.profiles
--       set rol = 'instructor', nombre = 'Tu Nombre'
--       where email = 'instructor@tudominio.com';
--
--  2. CREAR ALUMNO DESDE EL PANEL ADMIN:
--     El panel admin.html usa sb.auth.admin.inviteUserByEmail().
--     Para que funcione desde el cliente (anon key), activa en
--     Supabase → Auth → Settings:
--       • "Enable email confirmations" = ON
--       • Redirect URLs: añadir http://localhost:... y tu dominio
--
--     Alternativa segura: crear alumnos desde el Dashboard de Supabase
--     Authentication → Users → "Invite user" y pasar el metadata:
--       { "nombre": "Ana García", "rol": "alumno" }
--
--  3. VERIFICAR QUE EL TRIGGER FUNCIONA:
--     Después de crear un usuario en Auth, ejecuta:
--       select * from public.profiles order by fecha_inicio desc limit 5;
--
--  4. CREDENCIALES PARA supabase-client.js:
--     Supabase Dashboard → Settings → API
--       • Project URL  → SUPABASE_URL
--       • anon public  → SUPABASE_ANON_KEY
-- ══════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════
--  MIGRACIÓN 2026-06-11: relajar entregas_tipo_check
--  El check original solo permitía una lista fija de tipos
--  (texto, imagen, video_url, imagen_multiple, eleccion, tarjeta)
--  y bloqueaba los tipos de clases nuevas (dibujo, guion, dialogo,
--  animacion, episodio, universo_*, mapa_mundo...).
--  Ahora acepta cualquier slug en minúsculas (ya aplicada en prod):
-- ══════════════════════════════════════════════════════════════════
-- alter table public.entregas drop constraint entregas_tipo_check;
-- alter table public.entregas add constraint entregas_tipo_check
--   check (tipo ~ '^[a-z][a-z0-9_]{1,39}$');

-- ══════════════════════════════════════════════════════════════════
--  MIGRACIÓN 2026-06-11 (2): unicidad de entregas por tipo
--  El unique original (user_id, clase_num) solo permitía UNA entrega
--  por clase — la clase 6 necesita 3 (universo_principal/version_b/zona).
--  Ahora la unicidad es por tipo dentro de cada clase (ya aplicada en prod):
-- ══════════════════════════════════════════════════════════════════
-- alter table public.entregas drop constraint entregas_user_id_clase_num_key;
-- alter table public.entregas add constraint entregas_user_id_clase_num_tipo_key
--   unique (user_id, clase_num, tipo);

-- ══════════════════════════════════════════════════════════════════
--  MIGRACIÓN 2026-06-11 (3): arquetipos mentor y comico
--  La clase 7 enseña 4 arquetipos; el check solo permitía aliado/villano
--  (+neutral/neutro/protagonista_anterior). Ya aplicada en prod:
-- ══════════════════════════════════════════════════════════════════
-- alter table public.personajes_secundarios drop constraint personajes_secundarios_tipo_check;
-- alter table public.personajes_secundarios add constraint personajes_secundarios_tipo_check
--   check (tipo = any (array['aliado','mentor','villano','comico','neutral','neutro','protagonista_anterior']));

-- ══════════════════════════════════════════════════════════════════
--  MIGRACIÓN 2026-06-13: instructor puede ver entregas y secundarios
--  (panel admin.html — columna "Material"). Aplicar en SQL Editor:
-- ══════════════════════════════════════════════════════════════════
-- create policy "instructor_ver_entregas" on public.entregas for select
--   using (exists (select 1 from public.profiles where id = auth.uid() and rol = 'instructor'));
-- create policy "instructor_ver_secundarios" on public.personajes_secundarios for select
--   using (exists (select 1 from public.profiles where id = auth.uid() and rol = 'instructor'));
