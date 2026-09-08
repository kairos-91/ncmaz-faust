-- Antes la foto subida en /admin/account (para cuentas sin Google) se
-- guardaba en user_metadata.avatar_url vía supabase.auth.updateUser().
-- Eso se rompe para cuentas con Google vinculado además de correo/
-- contraseña (providers: ["email", "google"]): cada vez que el usuario
-- inicia sesión con Google, Supabase re-sincroniza user_metadata con el
-- perfil de Google — avatar_url y picture incluidos — pisando la foto
-- subida a mano sin avisar. El usuario "pierde" su foto sin haber tocado
-- nada, con solo cerrar sesión y volver a entrar con Google.
--
-- Guardarla acá, en una tabla propia y ajena a auth.users, la deja
-- inmune a esa sincronización.
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at
  before update on public.user_profiles
  for each row execute function public.set_updated_at();

alter table public.user_profiles enable row level security;

drop policy if exists "users can read their own profile" on public.user_profiles;
create policy "users can read their own profile"
  on public.user_profiles for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can insert their own profile" on public.user_profiles;
create policy "users can insert their own profile"
  on public.user_profiles for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can update their own profile" on public.user_profiles;
create policy "users can update their own profile"
  on public.user_profiles for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
